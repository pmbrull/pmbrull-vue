---
title: Testing Actor Systems
published: true
description: |
    Testing is the backbone of great software.
    While testing functions might be easy, how
    we can apply the same techniques into these
    special entities that actors represent?
category: Scala
ctime: 2019-12-27
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Testing Actors

First of all, it is important to recall that actors only interact using message passing. We cannot check their current behavior directly accessing into them, as they only communicate through messaging. Therefore tests can only verify *externally observable effects*, as the only thing you'll get back is another message.

## Akka's TestKit

A `TestProbe` is like an actor you can control. Its purpose is to buffer incoming messages into a queue so that they can be tested by the system. If we want to test an actor behavior we can use the following example:

```scala
implicit val system = ActorSystem("TestSys")
val myActor = system.actorOf(Props[myProp])
val p = TestProbe()
p.send(myActor, "Message")
p.expectMsg("Answer")
p.send(myActor, "Bad message")
p.expectNoMsg(1.second)
system.shutdown()
```

Note that we can test both good and bad messages - messages not preparing for the actor to have a response - , and all of them are sent ordered.

> OBS: we discussed that only actors can create other actors, thus to create new actor we used the `context.actorOf`. However, we now are using the `system` instead of `context`. This is because under the scenes the `system` has a guardian actor, which is the one instantiating the new actors we call.

With the code above we are using the `TestProbe` controlled from the outside, we can do the same from inside:

```scala
new TestKit(ActorSystem("TestSys")) with ImplicitSender {
    val myActor = system.actorOf(Pros[myProp])
    myActor ! "Message" // sent from testActor
    expectMsg("Answer")
    myActor ! "Bad message"
    expectNoMsg(1.second)
    system.shutdown()
}
```

The `TestKit` has built in a system with a small implicit actor called `testActor`, which is picked up automatically when sending messages. Also, we do not need to use the `TestProbe` for the testing methods, as they are available in the `TestKit`.

## Testing Actor with Dependencies

When using environments with DBs or Web Services, you don't want to use the real production environments for testing. The usual approach in these cases is using dependency injection to use different databases during tests. Now, though, we will use a simpler solution: add overridable factory methods. For example:

```scala
class Receptionist extends Actor {
    def controllerProps: Props = Props[Controller]
    ...
    def receive = {
        ...
        val controller = context.actorOf(controllerProps, "controller")
        ...
    }
}
```

When using the `Receptionist` to spawn `controller`s, if we directly used the properties we could not change those. However, if we prepare a method to pass those, we can override them during the test phase. Same thing happens when declaring dbs or web clients.

## Testing Actor Hierarchies

To test hierarchies it is useful to start from the leaves and test the way up.
