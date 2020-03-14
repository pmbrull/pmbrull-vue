---
title: Failure Handling with Actors
published: true
description: |
    The failure model in Actor Systems has been borrowed from
     the one in Erlang and it is based on supervision. 
     When an error occurs, it is deletaged to a supervisor, 
     which is the one in charge of actually handling it.
category: Scala
ctime: 2019-12-30
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Failure Handling in Asynchronous Systems

We need to recall that the communication among actors only happens through messages. So, when we have a failure, to which address should we send the error message? We cannot send it to the actor who sent the process that failed, as we are in an asynchronous environment, so that first actor will be occupied with another task already. Again, the Actor Model has been designed after how humans interact with each other, so the exception will be handled by a third actor.

Actually, this will follow the usual hierarchical work distribution, where actors are divided into systems - we can think of them as teams - and if there is an error it will be sent to the leader of the system. If the leader cannot handle it, the issue will be escalated to the upper level, and so on.

## Supervision

**Resilience** means recovering from a deformation, so in the case of actors, the failure must be contained and delegated.

We say that a failure is contained if it cannot spread to further elements. The Actor Model itself takes care of this, as actors are fully encapsulated objects by themselves. With delegation we need to make sure that the failure cannot be handled by the failed component as it can be compromised.

* A failed actor is restarted or terminated
* Decisions must be taken by another actor
* Supervisied actors form a tree structure - hierarchical
* The supervisor needs to create a subordinate.

Following this structure, this means that if one actor is the Supervisor of different actors A, B and C, it should be able to kill them if needed and re-create them to get the job done. In practice, this means that the Supervisor is also the **parent** of its delegated actors. Supervision and creation hierarchies are the same, and this is called *Mandatory Parental Supervision*.

## Supervisor Strategy

This is an example of how the parent - and supervisor - could declare its supervised children:

```scala
class Manager extends Actor {
    override val supervisorStrategy = OneForOneStrategy() {
        case _: DBException => Restart // Reconnect to DB
        case _: ActorKilledException => Stop
        case _: ServiceDownException => Escalate
    }
    ...
    context.actorOf(Props[DBActor], "db")
    context.actorOf(Props[ImportantServiceActor], "service")
    ...
}
```

> The default behavior would just restart the children when they fail.

Note how we declared that failure messages are just sent as usual messages. This means that while we are handling a failure, no further messages can be processed. In the example we just used the `OneForOneStrategy`, which deals with each child in isolation. If the given strategy shall be applied to all children, then we should declare it as `AllForOneStrategy`. With the latter, the group of actors should live and die together. It is also important to:

* Only allow for a finite number of restarts (if needed, in a given time window), and
* if a restriction is violated, then `Stop` instead of `Restart`.

This safe approach can be followed just by applying some parameters already present in the strategy API, e.g.,

```scala
override val supervisorStrategy = OneForOneStrategy(maxNrOfRestarts = 10, withinTimeRange = 1.minute) {...}
```

## Actor Identity

An actor is restarted to recover from failure. In Akka, the `ActorRef` is maintained throughout restarts so that we always have the same valid address.

When we are talking about Restart we refer to:

* Explicitely handling expected error conditions, where the sender will get an error message as a response.
* We are more concerned with the unexpected errors. This means that the actor gets to an invalid state.
* This means that the only safe approach that the supervisor can follow is to install the initial behavior back to the actor that unexpectedly failed.

## Actor Lifecycle

> When handling the Actor Lifecycle, the message that caused the failure will not be processed again, as it is could possibly triggered the error in the first place.

During the lifecycle, the actor starts, then maybe restarts multiple times and finally it stops. There are different Hooks that we can call that will occur throughout the whole actor lifecycle:

```scala
trait Actor {
    def preStart(): Unit = {}
    def preRestart(reason: Throwable, message: Option[Any]): Unit = {
        context.children.foreach (context.stop(_))
        postStop()
    }
    def postRestart(reason: Throwable): Unit = {
        preStart()
    }
    def postStop(): Unit = {}
}
```

Note how in the `preRestart` we stop all children, as they are considered part of the actor state. If we do not do this manually and keep the function empty, the `context` will resursively restart the child actors that were not stopped. 

A use case of these hooks could be closing all database connections like `db.close()` in the `postStop` phase.
