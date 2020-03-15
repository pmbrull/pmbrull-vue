---
title: Akka Typed Facilities
published: true
description: |
    We are going to explore an example implementation
    on how to design different behaviors that
    describe a usual protocol.
category: Scala
ctime: 2020-01-15
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Speaking Multiple Protocols

When designing an actor system, a common scenario is that we'll need an actor to offer multiple protocols: it needs to speak to multiple other parties.

As an example, we have one person that needs to acquire a book, but has no time for it. So there is a third party - a secretary - that will be in charge of getting the message that it needs to get the book and then act as the buyer. This new actor needs to follow two protocols:

* Get the order from the first actor and
* Become the buyer and get the book.

Recall the ADTs describing the buy protocol:

```scala
case class RequestQuote(title: String, buyer: ActorRef[Quote])

case class Quote(price: BigDecimal, seller: ActorRef[BuyOrQuit])

sealed trait BuyOrQuit
case class Buy(address: Address, buyer: ActorRef[Shipping]) extends BuyOrQuit
case object Quit extends BuyOrQuit

case class Shipping(date: Date)
```

Now we will model the secretary job:

```scala
sealed trait Secretary
case class BuyBook(
    title: String, 
    maxPrice: BigDecimal, 
    seller: ActorRef[RequestQuote]
    ) extends Secretary

def secretary(address: Address): Behavior[Secretary] = 
    Behaviors.receiveMessage {
        case BuyBook(title, maxPrice, seller) =>
            seller ! RequestQuote(title, ???)
            ...
    }
```

Here the issue is that in the `RequestQuote` message told by the `secretary` we need to set where the quote must be send: the buyer `ActorRef`. However, the `Quote` message is not part of the `secretary` vocabulary.

To help with this, Akka Typed offers a **Message Adapter**: the solution is to wrap foreign protocols to process them. This makes the `Secretary` ADT look like this:

```scala
sealed trait Secretary
case class BuyBook(
    title: String, 
    maxPrice: BigDecimal, 
    seller: ActorRef[RequestQuote]
    ) extends Secretary
case class QuoteWrapper(msg: Quote) extends Secretary
case class ShippingWrapper(msg: Shipping) extends Secretary
```

Now, implementing the secretary's behavior in response of the `BuyBook` command looks as follows:

```scala
def secretary(address: Address): Behavior[Secretary] = 
    Behaviors.receivePartial {
        case (ctx, BuyBook(title, maxPrice, seller)) =>
            // get the ActorRef where the quote shall be sent
            // with the messageAdapter
            val quote: ActorRef[Quote] = ctx.messageAdaptar(QuoteWrapper)
            seller ! RequestQuote(title, quote)
            // After this, the secretary gets into the buyBook behavior
            // with the maxPrice and the address where the book
            // must be sent to
            buyBook(maxPrice, address)
    }
```

Let's examine the `buyBook` behavior:

```scala
def buyBook(maxPrice: BigDecimal, address: Address): Behavior[Secretary] = 
    Behaviors.receivePartial {
        case (ctx, QuoteWrapper(Quote(price, seller))) =>
            if (price > maxPrice) {
                seller ! Quit // too expensive
                Behaviors.stopped
            } else {
                val shipping = ctx.messageAdapter(ShippingWrapper)
                seller ! Buy(address, shipping)
                Behaviors.same
            }
        case (ctx, ShippingWrapper(Shipping(date))) =>
            Behaviors.stopped // the book has been bought
    }
```

Note that the order of the messages is described by the type of the `ActorRef`s. The second case cannot happen before the first, as the `shipping` ref would have not been defined.

## Alternative: Declare Messages for Protocol Participants

The protocol definition can also attach roles to messages:

* `RequestQuote` and `BuyOrQuit` extend `BuyerToSeller`
* `Quote` and `Shipping` extend `SellerToBuyer`

This allows more concise message wrappers, e.g.

```scala
case class WrapFromSeller(msg: SellerToBuyer) extends Secretary
```

## Child Actors for Protocol Sessions

In the previous example we've seen how adapter can be used to handle multiple different protocols within the same actor. An alternative, supported by the fact that actors come in systems, is to use a child actor for handling different protocols.

In this second approach, the `secretary` instead of handling itself the buy process, will instantiate another actor to follow the buyer protocol.

Translating this into code:

```scala
case class BuyBook(title: String, maxPrice: BigDecimal,
                   seller: ActorRef[RequestQuote]) extends Secretary
case class Bought(shippingDate: date) extends Secretary
case class NotBought extends Secretary

def secretary(address: Address): Behavior[Secretary] = 
    Behaviors.receive {
        case (ctx, BuyBook(title, maxPrice, seller)) =>
            val session = ctx.spawnAnonymous(buyBook(maxPrice, address, ctx.self))
            // The RequestQuote is sent by the secretary to introduce the seller
            // and the buyer, which is the new child
            seller ! RequestQuote(title, session)
            ctx.watchWith(session, NotBought)
            Behaviors.same
        case (ctx, Bought(shippingDate)) => Behaviors.stopped
        case (ctx, NotBought) => Behaviors.stopped
    }
```

Notice how we also have DeathWatch here to watch the child actor. However, this functionality is enhanced and we can even specify with `ctx.watchWith` which message we want to inject to the secretary in case that DeathWatch is triggered.

## Defer Handling a Message

Another useful utility is to defer handling a message until the actor is ready for it.

The order of message reception sometimes is not deterministic, but the actor needs to process a particular message first. A solution for this can be stashing messages in a buffer:

```scala
val initial = Behaviors.setup[String] { ctx =>
    val buffer = StashBuffer[String](100)

    Behaviors.receiveMessage {
        case "first" =>
            buffer.unstashAll(ctx, running)
        case other =>
            buffer.stash(other)
            Behaviors.same
    }
}
```

The `StashBuffer` is parametrized by the type of message it can hold - in this case `String` - and its capacity. If the capacity is exceeded it will throw an exception, which if not handled will terminate the actor.

## Type-safe Service Discovery

Suppose that we have an actor A that speaks a certain protocol P. Actor A only exists because it wants to provide this protocol to other actors, for example actor B. So actor B needs to speak with an implementation of protocol P.

* In a local system, dependencies can be injected by first creating A and then pass an `ActorRef[P]` to B
* Dependency graph can become unwieldy
* This approach does not work for a cluster: there is no one to introduce actor A and B so they can talk to each other.

Solution: cluster-capable well-known service registry at each `ActorSystempp:

```scala
val ctx: ActorContext[_] = ???
ctx.system.receptionist: ActorRef[Receptionist.Command]
```

Actors can talk to this service registry using the receptionist protocol in order to register their services or ask for service implementations. An `ActorRef` for speaking in this system is available through the actor context in order to allow the receptionist to introduce actors to one another through the cluster.

### Registering a Service Provider

Create a serializable cluster-wide identifier for the protocol:

```scala
val key = ServiceKey[Greeter]("greeter")
```

Let's now create an actor with the `Greeter` behavior and register its Service using the `ServiceKey`:

```scala
val greeter = ctx.spawn(Greeter.behavior, "greeter")
ctx.system.receptionist ! Register(key, greeter)
```

The type system will ensure that the `key` and the `greeter` in the `Register` do match.

### Looking up a Service Implementation

Assuming a friendly actor that wants to send a greeting to a new actor:

```scala
sealed trait FriendlyCommand
case class Intro(friend: String) extends FriendlyCommand
case class SetGreeter(listing: Listing) extends FriendlyCommand
```

First of all, it needs to know the `greeter` command and query the service registry:

```scala
val friendly = Behaviors.setup[FriendlyCommand] { ctx => 
    val receptionist = ctx.system.receptionist
    val listingRef = ctx.messageAdapter(SetGreeter)
    receptionist ! Find(key, listingRef)

    // wait for an implementation
    val buffer = StashBuffer[FriendlyCommand](100)

    Behaviors.receiveMessage {
        case SetGreeter(key.Listings(refs)) if refs.isEmpty =>
            ctx.schedule(3.seconds, receptionist, Find(key, listingRef))
            Behaviors.same
        case SetGreeter(key.Listings(refs)) =>
            buffer.unstashAll(ctx, friendlyRunning(refs.head))
        case other =>
            buffer.stash(other)
            Behaviors.same
    }
}
```
