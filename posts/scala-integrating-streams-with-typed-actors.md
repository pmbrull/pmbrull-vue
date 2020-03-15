---
title: Integrating Streams with (Typed) Actors
published: true
description: |
    Sometimes streams are not enough. We may
    need to interact with more specific behaviors
    and have the freedom to design the bits
    and pieces of our solutions. Let's put
    typed actors back into the equation.
category: Scala
ctime: 2020-01-23
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Actors as Sinks or Sources

While most things are simple to implement by combining various stream operators, or implementing custom `GraphStages` (which we have not seen, but are a good addition), sometimes it is very useful to inter-op between Actors and Streams.

This can be done using simple `!` messages in-line, however then you'd lose the back-pressure aspects of streams. Sometimes this is absolutely fine, though.

In this section we introduce a number of provided operators that integrate streams and actors.

## Typed ActorRef as Source

As such, we can trivially use an Actor as Sink:

```scala
val ref: ActorRef[String] =
    ActorSource.actorRef[String](
        // which String signals stream completion
        completionMatcher = { case "complete" => },
        failureMatcher = PartialFunction.empty,
        bufferSize = 256,
        OverflowStrategy.dropNew
    ) // or Head, or Tail, or Buffer
    .to(Sink.ignore).run()

ref ! "one"
ref ! "two"
ref ! "complete"
```

> For an untyped actor this would be simply `Source.actorRef`

We've said that an Actor has no way to handle back-pressure automatically, but at least we can manage resource boundaries of the system with the `bufferSize` and the `OverflowStrategy`. Note that these setups cannot be changed dynamically.

## Alternatives to sourcing an Akka Stream

Alternatively one can use a simple `Source.queue[T]` to materialize a `SourceQueueWithComplete[T]`, which can be used to offer elements into a stream. This is also nicely usable from within Actors other normal functions.

```scala
val queue: SourceQueueWithComplete[Int] =
    Source.queue[Int](bufferSize: 1024, OverflowStrategy.dropBuffer)
        .to(Sink.ignore)
        .run()

// This allows us to offer elements into the stream
val r1: Future[QueueOfferResult] = queue.offer(1)
val r2: Future[QueueOfferResult] = queue.offer(2)
val r3: Future[QueueOfferResult] = queue.offer(3)
```

The atractive point of using this is that after offering an element, we get back a `Future[QueueOfferResult]` indicating us if the element was dropped, if it was accepted and also the timing.

It has a more powerful integration than the `tell` operator, we are not using actors here.

## Typed Actor as Sink, no back-pressure

```scala
val ref = spawn(Behaviors.receiveMessage[String] {
    case msg if msg.startsWith("FAILED: ") =>
        throw new Exception(s"Stream failed: $msg")
    case "DONE" =>
        Behaviors.stopped
    case msg =>
        // handle msg and...
        Behaviors.same
})

Source(1 to 10).map(_ + "!") // stringify the source
    .to(ActorSink.actorRef(
        ref = ref,
        onCompleteMessage = "DONE",
        onFailureMessage = { ex => "FAILED: " + ex.getMEssage }
        )
    ).run()
```

There is no back-pressure integration, so this will go as fast as it can, possibly overwhelming the actor mailbox.

This in practice does more or less the same than `foreach { m => ref ! m }`, but it has the additional information of the `onComplete` and `onFailure` messages handling.

## Typed Actor as a Sink, with back-pressure

Preserving back-pressure in communicating with Actors is also possible, however requires collaboration from the Actor.

We achieve back-pressure by creating some protocol that will be kind of translated into the back-pressure of an Akka Stream. We do so by providing some acknowledgement signal. Our ACK signal will be Ack. And we need a protocol to talk to the actor.

We also create a protocol so that the actor can manage the messages from the stream.

```scala
sealed trait Ack
case object Ack extends Ack

sealed trait AckProtocol
case class Init(streamSender: ActorRef[Ack]) extends AckProtocol

case class Msg(streamSender: ActorRef[Ack], msg: String)
    extends AckProtocol

case object Complete extends AckProtocol
case object Failed(ex: Throwable) extends AckProtocol
```

First we implement a pilot behavior that will accept the stream's messages:

```scala
val pilot: Behaviors.Receive[AckProtocol] =
    Behaviors.receiveMessage[AckProtocol] {
        case m @ Init(sender) =>
            // do something on init
            // tell the stream sender that we got the Init msg.
            // In this case, it translated to `demand`: I am ready
            // to receive more messages.
            sender ! Ack
            Behaviors.same
        case m @ Msg(sender, _) =>
            // do something with each msg ...
            sender ! Ack
            Behaviors.same
        case m =>
            // knowingly ignore others
            Behaviors.ignore
    }
```

Next, we spawn and specify the protocol defined previously:

```scala
val targetRef: ActorRef[AckProtocol] = spawn(pilot) // testkit

val source: Source[String, NotUsed] = Source.single("")

val in: NotUsed =
    source
        .runWith(ActorSink.actorRefWithAck(
            ref = targetRef,
            messageAdapter = Msg(_, _),
            onInitMessage = Init(_, _),
            ackMessage = Ack,
            onCompleteMessage = Complete,
            onFailureMessage = Failed(_)
        ))
```

Note how we make all the messages adapted to our own protocol, so we don't need to handle any Akka specifics in our actor.

## Asking Actors in a Flow

It sometimes is useful to delegate some operation to an Actor, since perhaps it is highly dynamic and performs other kinds of updating its state upon which the function it performs on an element changes (e.g., by or being applied external configuration).

One can ask actors by using the inline `ask` operator:

```scala
val replier = spawn(Behaviors.receiveMessage[Asking] {
    case asking =>
        asking.replyTo ! Reply(asking.s + "!!!")
        Behaviors.same
})
```

For the `ask` messages types to align, we need to "pack" the element into the `Asking` type, which the actor is able to handle, and we prodive it a `ref` that is supposed to answer to. That `ref`s type determinates the outging element type of the resulting `Source`:

```scala
val replier: ActorRef[Asking]

val in: Future[immutable.Seq[Reply]] = 
    Source.repeat("hello")
        .via(
            // specify the actor we want to target: replier
            ActorFlow.ask(replier)(
                elem, replyTo: ActorRef[Reply] => Asking(elem, replyTo)
            )
        )
        .take(3) // : Source[Reply, _]
```

A cool thing of the `ActorFlow` is that the target actor gets watched, so the `Terminated` message would also make the stream to end. This is way better than having the stream being timed out waiting for a response.

We just need to transform the element into the `Asking` message, and the actor will reply to the `replyTo`, which ends up being emitted to the downstream for us to `take`.

## Summary

* How to inter-op between (typed) Actors and Streams
* How to create ActorRefs that serve as sources of streams
* How to use ask properly within streams to query Actors.
