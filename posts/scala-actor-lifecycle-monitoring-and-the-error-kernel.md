---
title: Actor Lifecycle Monitoring and the Error Kernel
published: true
description: |
    What a way to end the year! Actors are used
    in a way that we expect them to fail... So we need
    to architect our code around that idea.
category: Scala
ctime: 2019-12-31
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Lifecycle Monitoring

The only observable transition occurs when stopping an actor:

* Having an `ActorRef` implies liveness (at some earlier point)
* Restart is not externally visible, as message will just go into the queue and will be processed later, but
* After a stop there will be no more responses from the given address.

This means that the only actor that knows when another one gets alive is the parent at the moment of creation. Different actors just know that an actor with a given address has been alive at a given point in time, but in order to know more, they need to exchange messages. But having no response back not only means that the actor in the other end is dead. It could also mean that our channel of communication is broken.

To remove the ambiguity between death and error, Akka supports Lifecycle Monitoring or **DeathWatch**:

* An actor registers its interest using `context.watch(target)`
* It will receive a `Terminated(target)` message when the target stops and
* It will not receive any direct messages from `target` afterwards.

## DeathWatch API

It consist of two methods present in the `ActorContext`:

```scala
trait ActorContext {
    def watch(target: ActorRef): ActorRef
    def unwatch(target: ActorRef): ActorRef
    ...
}

case class Terminated private[akka] (actor: ActorRef)
  (val existenceConfirmed: Boolean, val addressTerminated: Boolean)
  extends AutoReceiveMessage with PossiblyHarmful
```

> If you call `unwatch` the terminated message of that `target` will no be delivered. This holds true even in the case when the `unwatch` method is called during the time that the `target` is being terminated.

Note how the `Terminated` message is declared as `private`. This means that you cannot create it yourself. Moreover, if you `watch` an actor which was recently stopped but where the `ActorRef` is still present, then this would be an example of a call where you'd just get back a `Terminated` message with the `existenceConfirmed` as `false`.

Moreover, having the `Terminated` case class extending `AutoReceiveMessage` means that those message will will handled by the `ActorContext` especially. Therefore, the `Terminated` message cannot be delivered after the `unwatch` method has been called and they cannot be forwarded.

## The Children List

As a small side note, it is important to know the methods that allow for a given actor to get all of its children:

```scala
trait ActorContext {
    def children: Iterable[ActorRef]
    def child(name: String): Option[ActorRef]
    ...
}
```

Each actor maintains a list of the actors it created:

* The child has been entered when `context.actorOf` returns,
* The child has been removed when `Terminated` is received,
* And an actor name is available IFF there is no such child.


## The Error Kernel

> Keep important data near the root, delegate risk to the leaves.

* Restarts are recursive, as supervised actors are part of the state. During a restart, children are recreated or restarted.
* Restarts are more frequent near the leaves (given a uniform distribution of restarts throughout the actors forming a supervision tree).
* Avoid restarting Actors with important state.

Following this logic, the most important actors - those which hold the state most needed in the system - should be kept as high in the hierarchy as possible. Moreover, if we move risky tasks to the bottom, we can restart those actors - positioned as leaves - without further overhead and with a localized effect. This is called the **Error Kernel Pattern**. In Akka this approach goes one step further, forcing the user to create this supervision hierarchies.

We can apply the supervisor model in a fashion that makes the upper levels more resilient. For example, with a stopping strategy that stops the children if they have any failure:

```scala
override def supervisorStrategy = SupervisorStrategy.stoppingStrategy
```

## The Event Stream

Actors can only direct messages to known addresses. By using the `EventStream`, actors can publish messages to an unknown audience. Moreover, every actor can subscribe to (parts of) the `EventStream`.

```scala
trait EventStream {
  def subscribe(subscriber: ActorRef, topic: Class[_]): Boolean
  def unsubscribe(subscriber: ActorRef, topic: Class[_]): Boolean
  def unsubscribe(subscriber: ActorRef): Unit
  def publish(event: AnyRef): Unit
}
```

Note how `publish` works the same way as `tell`. Once you publish an event, anyone subscribed will get it. Also, the `Class[_]` is from Java, and they are given y what the JVM supports, so types there are less powerful than Scalas, but it is still very useful. For example:

`Debug` is a subclass from `LogEvent`, so we could subscribe to a topic of type `classOf[Debug]` to get all debug messages. If on the other hand we subscribe to the `LogEvent` class, we'll get all of its subclasses messages.

In code, this would look like the following:

```scala
class Listener extends Actor {
  context.system.eventStream.subscribe(self, classOf[LogEvent])
  def receive = {
    case e: Logevent => ...
  }
  override def postStop(): Unit = {
    context.system.eventStream.unsubscribe(self)
  }
}
```

## Unhandled Messages

`Actor.Receive` is a partial function, the behavior may not apply to any given input. Unhandled messages are passed into the `unhandled` method:

```scala
trait Actor {
  ...
  def unhandled(message: Any): Unit = message match {
    case Terminated(target) => throw new DeathPactException(target)
    case msg => 
      context.system.eventStream.publish(UnhandledMessage(msg, sender, self))
  }
}
```

The default Supervisor will respond to the `DeathPactException` with a `stop` command. This means that if I am subscribed to another Actor that dies and I do not especially handle its `Terminate` message, then I want to terminate together with it.
