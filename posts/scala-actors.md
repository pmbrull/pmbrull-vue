---
title: Actors
published: true
description: |
    Actor systems are an elegant way to handle
    multi-threaded programs. Ho we can mimic a
    human organization and benefit of its
    way of interacting with the different
    parts of the system?
category: Scala
ctime: 2019-12-24
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Synchronization

One of the issues that may appear when working with multi-threading is related to task synchronization. What happens when thwo simultaneous threads performs actions on top of the same object? If we do not apply any kind of protection, one thread may overwrite the results of the other.

To overcome this there are **synchronization** tools that can be used so that if one thread is working with any resource, this is blocked to other threads. This means that we want to achieve atomic actions that start, transform and write results without any other parts of the program interfering.

In Scala this can be done via `obj.synchronized {...}`:

```scala
class myObj {
    private var n = 0

    def increase(amount: Int): Unit = this.synchronized {
        n = n + amount
    }
}
```

With this, the `increase` method will become an atomic unit. All accesses to the shared resource `n` must be synchronized. However, we need to consider the possibility of **dead-locks**, where two threads lock resources needed by both and nobody can start. However, blocking synchronization not only introduces dead-locks, but is also bad for CPU utilization and synchronous communication couples a sender and a receiver.

## The Actor Model

Thus, what we want are non-blocking objects, and this is what Actors are. The Actor Model represents objects and their interactions, following how humans are organized and how they share messages and receive information.

**Definition**: An Actor
* is an object with identity
* has a behavior
* only interacts using *asynchronous* message passing.

Thanks to messaging being asynchronous, Actors can just send a message and continue with what they were doing without waiting for the receiver to get the message. Moreover, Actors can send messages to addresses (`ActorRef`) they know.

In Scala, this behavior is described as follows:

```scala
type Receive = PartialFunction[Any, Unit]

trait Actor {
    def receive: Receive
    ...
}

// Then implement an actor
class Counter extends Actor {
    var count = 0
    def receive = {
        case "incr" => count += 1
        case ("get", customer: ActorRef) => customer ! count
    }
}
```

> OBS: note how a partial function is only defined in a subset of the input.

The symbol `!` is defined as the `tell` operator and sends a message to the `customer`. Note that each Actor implicitly knows it `ActorRef`. In the `ActorRef` the `tell` function is defined. Then, the "get" method can be defined with some sugar:

```scala
case "get" => sender ! count
```

Moreover, Actors can also change their behavior with the `ActorContext` and create other Actors. We can change an Actor's behavior with the `become` method in their `context`. Let's modify the previous `Counter` implementation to one not using any `var`:

```scala
class Counter extends Actor {
    def counter(n: Int): Receive = {
        case "incr" => context.become(counter(n + 1))
        case "get" => sender ! n
    }
    def receive = counter(0)
}
```

In this case the state is explicitly changed and scoped to the current behavior. Expanding this expressions we obtain something similar to a tail-recursion.

> OBS: Actors are always created by actors, and this creates a hierarchy.

With these definitions, we can create a program that creates this actors and sends some messages:

```scala
class CounterMain extends Actor {

    val counter = context.actorOf(Props[Counter], "counter")

    counter ! "incr"
    counter ! "get"

    def receive {
        case count: Int => 
            println(s"count was $count")
            context.stop(self)
    }

}
```

To run this program, we need to change the run configuration in our IDE to run with the `akka.Main` class and the full `CouterMain` class as an argument.
