---
title: Protocols in Akka Typed
published: true
description: |
    With Typed Actors we need to make sure
    that only the right messages are both
    sent and received. How can we model
    actor's interactions to ensure this?
category: Scala
ctime: 2020-01-13
---

# Protocols in Akka Typed

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Typing Akka Actors

Our main goal is to restrict `ActorRef` to sending the right message. Therefore, the tell `!` operator needs to be restrict to accept only the correct message types.

* The first consequence is that we need to add a type parameter to `ActorRef`: `ActorRef[T]`
* Then we use this type `T` with the `!` operator to restrict the arguments.
* The recipient needs to declare which kind of message it understands: we need to add those understood messages to Actor `trait`.
* Also, we need to add the type of understood messages to the actor context: `ActorContext[T]`.
* Moreover, there is one method in the `context` that can no longer be supported: remove `context.sender`. This is because we cannot know the type of an arbitrary Actor in the system sending a message.

Note how all of these changes become incompatible with existing source code. Thus, let's change a few more things!

* Turn the stateful Actor `trait` into pure `Behavior[T]`, which describes the reaction of an Actor to an incoming message.

In essence, this `Behavior` is a function from incoming message to the next behavior of the actor.

* The second cleanup consists in removing `systen.actorOf`. In Akka typed you can specify the Guardian's behavior. Each actor should be responsible of creating its own children.
* The last change is a logical consequence for having a Guardian Actor. This means that we need to communicate with it via messages. Therefore, `ActorSystem[T]` is an `ActorRef[T]` for the Guardian.

Since the Guardian Actor is responsible for the actor of the whole system, it makes sense that the `ActorSystem` has also a type paramter `T` that matches an actor.

## Akka Types: Hello World!

Let's start with a minimal protocol: accept one message and stop.

In Akka typed we do not create actors. Instead, we create behaviors, and there are different Behavior factories that we can use. We will start by using the `receiveMessage` one. It receives to paramters, one type `T` designating the allowed type for the actor and the second is a function that computes the next behavior upon reception of such a message.

In this case the message must be a `String`, and the next behavior adopted will be to stop the actor. The `ActorSystem` will then stop the actor and release its resources.

```scala
val greeter: Behavior[String] = 
    Behaviors.receiveMessage[String] { whom =>
        println(s"Hello $whom!")
        Behaviors.stopped
    }
```

In order to execute this behavior, we need to place it inside an `ActorSystem`:

```scala
object Hello extends App {
    val greeter = ...

    // start a system with this primitive guardian
    val system: ActorSystem[String] = ActorSystem(greeter, "helloworld")
    // send a msg to the guardian
    system ! "world"

    // system stops when guardian stops
}
```

## Proper Channels with Algebraic Data Types

Now that we know which schema to follow, let's prepare some code that makes the actors respond to multiple messages. For this, we will use Algebraic Data Types (ADT):

```scala
sealed trait Greeter
final case class Greet(whom: String) extends Greeter
final case object Stop extends Greeter

val greeter: Behavior[Greeter] = 
    Behaviors.receiveMessage[Greeter] {
        case Greet(whom) =>
            println(s"Hello $whom!")
            // Behavior should not change
            Behaviors.same
        case Stop =>
            println("Shutting down...")
            Behaviors.stopped
    }
```

## Tangent: Running Actor Programs

The best way is to start an `ActorSystem` and place the initialization code in the guardian's behavior:

```scala
ActorSystem[Nothing](Behaviors.setup[Nothing] { ctx => 
    val greeterRef = ctx.spawn(greeter, "greeter")
    ctx.watch(greeterRef) // sign death pact

    greeterRef ! Greet("world")
    greeterRef ! Stop

    Behaviors.empty
}, "helloWorld")
```

What we are doing is creating an Actor that does not except any incoming message (therefore the type parameter is `Nothing` and we leave an empty `Behavior`). Instead, it spawns the actor that will perform the job. This is called the Guardian Pattern

## Handling Typed Responses

A response of type `T` must be sent via an `ActorRef[T]`:

```scala
sealed trait Guardian
case class NewGreeter(replyTo: ActorRef[ActorRef[Greeter]]) extends Guardian
case object Shutdown extends Guardian

val guardian = Behaviors.receive[Guardian] {
    case (ctx, NewGreeter(replyTo)) =>
        val ref: ActorRef[Greeter] = ctx.spawnAnonymous(greeter)
        replyTo ! ref
        Behavior.same
    case (_, Shutdown) =>
        Behavior.stopped
}
```

Since the `context.sender` was removed, in order to send a response of type `T`, we need to have an appropriate `ActorRef[T]`. As our type parameter is, in this case, `ActorRef[T]`, the resulting type ends up being `ActorRef[ActorRef[T]]`.

Here we've also seen the `receiver` constructor for `Behaviors`, where the messages received are a pair of the actor context and the message and we need here this context to spawn the anonymous actor.

## Modeling Protocols with ADTs

Let's create an example with the following protocol:

1. A Buyers requests the price of an book
2. The Seller responds
3. The Buyer decides if to buy or quit
4. If Buy, the Seller ships
5. If Quit, then stop.

```scala
case class RequestQuote(title: String, buyer: ActorRef[Quote])

case class Quote(price: BigDecimal, seller: ActorRef[BuyOrQuit])

sealed trait BuyOrQuit
case class Buy(address: Address, buyer: ActorRef[Shipping]) extends BuyOrQuit
case object Quit extends BuyOrQuit

case class Shipping(date: Date)
```

Note how in each case, we specify the type parameter of the `ActorRef[T]` as the message that is expected to receive next following the protocol. In the first example of the `RequestQuote`, we not only send the book title, but also the `ActorRef` that the seller must respond with the quote to.

## Summary

We have seen:

* The philosophy behind how types were added to Akka actors
* The usage of typed communication channels with ADTs
* How to convey responses
* How references between message types can be used to model progress in a protocol.
