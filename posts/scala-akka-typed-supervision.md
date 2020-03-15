---
title: Akka Typed Supervision
published: true
description: |
    Supervision can be seen as a design pattern
    where we rely operations that are more
    likely to fail to child actors. This child actors
    need to be managed (supervised) by an entity that
    knows how to act in each circumstance.
category: Scala
ctime: 2020-01-17
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Supervision is the backbone of actor systems:

* Each actor may fail, in which case its supervisor will step in
* The supervisor can react to failure, e.g. by restarting the actor

There are some issues with Akka untyped supervision:

* The failed actor is paused until the supervisor reacts. The actor can still receive messages that will not be processed and instead, they are accumulated in the mailbox.
* The failure may need to travel across the network. This increases the reaction time, making the message queue grow.
* The failure notice contains too much information by default. The supervisor does not need to know the internal state of the actor.

For these reasons, supervision in Akka Typed is simplified:

* The decision on whether to restart the failed actor is taken within the actor, withim the child actor's context: There is no need to send any messages to the supervisor.
* The precise exception that caused the failure is not available for the decision process.
* Any unhandled failures will lead to the immediate termination of the failed actor, triggering DeathWatch and informing the parent of this actor's termination.

The supervisor decorates the child's behavior with a selective restart strategy. As the behaviors are just functions, we can compose those with another function that handles the exceptions and returns another behavior. In a restart, this would be the initial behavior.

## Starting a supervised actor

The supervisor may add supervision to any behavior:

```scala
ctx.spawnAnonymous(
    Behaviors.supervise(actor)
        .onFailure[ArithmeticException](SupervisorStrategy.restart)
)
```

The `supervise` factory takes in an actor behavior and puts it into a supervision decorator. As this decorator will be called by the parent actor, this is the one choosing the supervisor strategy to apply in each case.

Moreover, this scheme also allows for the child actor to add its own supervision as desired.

## Information flow from actor to supervisor

Akka Typed shields the supervisor from the failed actor's state:

* An exception may reference any object for transporting information
* The failure may well be instrinsic to the request
* Keeping the exception confined to its origin prevents mistakes

In case assistance is needed, regular messaging is the best choice.

## Supervision Implementation

The most interesting aspect of this supervision approach is that the decorator does not use any internal akka specific functions.

## Executing Another Behavior

This all steps need to be followed when one decorator wants to evaluate another behavior

```scala
def receive(ctx: ActorContext[T], msg: T): Behavior[T] = {
    import akka.actor.typed.Behavior.{ start, canonicalize, 
                                      validateAsinitial, InterpretMessage }

    try {
        // make sure that started is a valid initial state
        val started = validateAsInitial(start(behavior, ctx))
        // since there are no methods on the class, we need to
        // use an interpreter to get the message together with
        // the context into the start of the behavior and obtain
        // the next behavior
        val next = interpretMessage(started, ctx, msg)
        // as the next behavior could also be unhandled, we need to
        // canonicalize that and convert it into a useful next behavior
        new Restarter(initial, canonicalize(next, started, ctx))
    } catch {
        case _: ArithmeticException =>
            new Restarter(initial, validateAsInitial(start(initial, ctx)))
    }
}
```
