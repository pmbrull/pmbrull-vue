---
title: Persistent Actor State
published: true
description: |
    The Error Kernel Pattern helps us 
    keeping important actors safe, but there
     are cases where we do not want to lose s
     tate at all: we need to persist it.
category: Scala
ctime: 2020-01-01
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Introduction

Actors represent a stateful resource:

* They shall not lose important state due to (system) failure,
* They must persist state as needed, and
* They must recover state at (re)start.

There are two main ways in which state can be persisted:

* Let the actor mirror a persistent storage location and do in-place updates of both. This means that when the actor state changes, the persistent storage does too. It could be stored in a File System or a RDBS.
* On the other hand, we can persist changes in an append fashion, keeping a history of all state changes. The current state can be recovered be applying all changes from the beginning.

## Changes vs. Current State

There are great benefits to persisting the current state:

* The actors can recover the latest state in constant time, and
* Data volumes depends on the number of records, not their change rate.

But there are also benefits to persisting changes:

* History can be replayed, audited or restored at a given point in time
* Some processing errors can be corrected retroactively
* You can gain additional insights on business processes
* Writing an append-only stream optimizes IO bandwidth
* Changes are immutable and can be freely replicated.

As both strategies bring benefits, the best approach depends on the business case and usually comes from an hybrid: For example, you could stream the changes to an event log. Since this log is immutable, you could have another processing getting this data and feeding it into a db offline, from which the actor can retrieve the latest persisted state in constant time.

Another strategy could be again, writing to an event log, but then persisting just some snapshots, which will be used to recover the initial actor. As snapshots are immutable, they can be written in an append-only fashion and can be freely shared.

## How Actors Persist Changes

* **Command-Sourcing**: Persist the command before processing it, persist acknowledgement when processed. We make sure that the actor does not lose any commands, since we persist them before they arrive: `command -> log -> Actor`. The actor can then reply normally. Therefore, recovery will take place by sending again all messages that have been logged to the Actor, which will recover the same state it had before the crash. However, an actor not only changes its behavior, it also sends messages to other actors. Those will of course be sent again and thus state change will be propagated. The point here would be that the receivers of those messages would need to know if they had already processed those requests or not! To accomplish this, the recovery Actor will not send the messages directly to the targets, but to a persistent **Channel**, and in there they will be checked (by using for example a serial number + the sender) if they have already been delivered or not. By using the channel, we make sure that all effects stay local.

* **Event-Sourcing**: Generate change requests ("events") instead of modifying local state; persist and apply them. Instead of persisting the commands that triggered the state change, we persist events that describe the state changes which are supposed to happen: `command -> Actor -> Event -> Log`. The actor will always first log the event and then apply it to change its state. When recovering the state, the Actor does not need to see the commands again, but just receive the events and replay them. The events will be applied to the current state, thus the recover strategy and the usual strategy are, in fact, the same. To correctly respond to the messages sent, considering that we need time to log the result and not keep the actor in stale state but with a correct behavior (not responding a message with an older state in mind), the safest approach is to buffer the messages and not respond them until the event is sent back from the log. This trades performance for consistency.

## Event Example

Given an actor that processes blog posts:

```scala
sealed trait Event
case class PostCreated(text: String) extends Event
case object QuotaReached extends Event

case class State(posts: Vector[String], disabled: Boolean) {
    def update(e: Event): State = e match {
        case PostCreated(text) => copy(posts = posts :+ text)
        case QuotaReached => copy(disabled = true)
    }
}
```

## The Stash Trait

To ensure the correct message buffer behavior while the events are being logged, Akka has a `Stash` trait. Following with the blog post example:

```scala
class UserProcessor extends Actor with Stash {
    var state: State = ...
    def receive = {
        case NewPost(text) if !state.disabled =>
          emit(PostCreated(text), QuotaReached) // custom method to log the events and check quota
          context.become(waiting(2), discardOld = false) // wait for the 2 emit events
    }
    def waiting(n: Int): Receive = {
        case e: Event =>
          state = state.updated(e)
          if (n == 1) { context.unbecome(); unstashAll() } // last wait event
          else context.become(waitin(n-1))
        case _ => stash() // buffer all other messages
    }
}
```

## External Effects

If we leave the actor world and we need to use an external service to, for instance, charging a credit card, the persistance of state becomes a bit more complicated, as we need to make sure that we do not charge the credit card multiple times.

Performing the effect and persisting that it was done cannot be atomic.

* Perform it before persisting for at-least-once semantics.
* Perform it after persisting for at-most-once semantics.

This choice needs to be made based on the underlying business model.
