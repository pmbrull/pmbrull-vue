---
title: Testing Akka Typed Behaviors
published: true
description: |
    Totday we will be using Akka's BehaviorTestKit
    to apply testing techniques to a typed
    Akka System.
category: Scala
ctime: 2020-01-14
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Testing actors is hard:
* All messaging is asynchronous, preventing the use of normal synchronous testing tools
* Asynchronous expectations introduce the concept of a timeout
* Test procedures become non deterministic.

The issue here is as we do not wait forever for tests to finish, we need to set a timeout while waiting for a response. However, this timeout needs to be decided arbitrarily, as it is not related to the actor nor the functionality that we want to test.

If instead of testing actors we just tested the behavior, that should be easy because:
* Behaviors are just functions from input message to next behavior
* Any effects are preformed during computation of the function
* Full arsenal of testing for functions is already available.

## Akka Typed BehaviorTestKit

Recall how together with the incoming message, there is another input to the receive function, which is the actor context that the behavior can use, for example, to create child actors.

In a test we need an instance of this actor context, and this is provided by the `BehaviorTestKit`:

```scala
val guardianKit = BehaviorTestKit(guardian)
```

This test kit is constructed from the initial behavior of the actor under test. In this case, the `guardian`.

Injecting a message into the actor is done as usual using the `ActorRef`:

```scala
guardianKit.ref ! <some message>
// The msg is enqueued until the runOne is called
guardianKit.runOne()
```

## Effect Tracking

`BehaviorTestKit` tracks the following internal effects:

* Child actor creation and forced termination
* DeathWatch: watching and unwatching
* Setting receive timeout
* Scheduling a message

Other effects like IO or sending a message to another actor are not mediatec by the actor context and can therefore not be tracked.

There are several methods on the test kit for inspecting effects:

```scala
guardianKit.isAlive must be(true)
guardianKit.retrieveAllEffects() must be(Seq(Stopped("Bob")))
```

`retrieveAllEffects` retrieves from the internal effects queue all effects that are performed by the behavior or enqueued as objects within the test kit in a `Seq`.

However! Keep in mind that how actors perform its functions should be private to that actor and that the standard approach is to observe only messages.

## Akka Typed TestInbox

Create a receptacle for messages from the behavior under test:

```scala
val sessionInbox = TestInbox[ActorRef[Command]]()
```

Using this we can exchange messages between the test procedures and the behavior under test.

```scala
guardianKit.ref ! NewGreeter(sessionInbox.ref)
guardianKit.runOne()
val greeterRef = sessionInbox.receiveMessage()
sessionInbox.hasMessages must be (false)
```

## Testing Child Actor Behaviors

Going along with these examples, we also would want to test the children created by the behavior:

```scala
// retrieve child actor's behavior testKit
val greeterKit = guardianKit.childTestKit(greeterRef)
```

Now we can test the child as we did with its parent, as the difficult task of retrieving a proper test kit has already been handled:

```scala
val doneInbox = TestInbox[Done]()
greeterRef ! Greet("World", doneInbox.ref)
greeterKit.runOne()
doneInbox.receiveAll() must be(Seq(Done))

// test shutting down the greeter
greeterRef ! Stop
greeterKit.runOne()
greeterKit.isAlive must be(false)
```
