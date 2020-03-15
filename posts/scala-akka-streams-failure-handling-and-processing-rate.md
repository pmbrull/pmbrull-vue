---
title: Akka Streams - Failure Handling and Processing Rate
published: true
description: |
    How can we handle failure with Akka Streams?
    Is it possible to apply logging in these situations?
    Can we recover from the occurring errors? Is it possible
    to correctly measure the end to end rate of a stream?
category: Scala
ctime: 2020-01-20
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Failure and Rate

These two concepts are slightly related, as they are what differentiates streams from just collections. Collections are usually strict. They do not have any processing rate attached to them so that you can process things as fast as you can. Moreover, a collection can't really fail - it is just a container of data - where streams a rather a live entity.

## Failure (in contrast to Error)

The Reactive Manifesto defines *failures* as:

> A failure is an unexpected event within a service that prevents it from continuing to function normally.

And contrasts them with *errors*:

> This is in constrast with an error, which is an expected and coded-for condition - for example an error discovered during input validation, that will be communicated to the client as part of the normal processing of the message.

In Reactive Streams, mostly due to historical naming of such methods, the name `onError` is used to talk about stream failure. Among other reasong why this should be seen as a failure signal is:

* `onError` signals can be sent out-of-bounds (no demand, as well as "overtake" `onNext` signals),
* `onError` carried failues are not part of the streams' data model, any exception could be thrown at any point in time, and
* an `onError` signal is *terminal*, if a failure happens and `onError` is sent, no further signals may be sent by that upstream.

## Carrying errors as values

While we will indeed use the failure handling mechanisms built-into Akka Streams, another important technique to be aware of is carrying errors as values, e.g.:

* `Flow[Validatable, ValidationResult, _]` representing a stream of values where each has to be validated: This is actually one of best ways to handle errors. Imagine for example we raised an error due to an invalid input. The best approach is to carry on as we can still validate all other ones. It's better to do some logs for the end user and not fail the entire stream.
* `Flow[Try[T], T, _]`, a "filter successful" flow.

## Failure Logging and Propagation

Failres flow only *downstream*; if a stage fails this signal is sent down, and a cancellation signal is sent upstream (if any).

Failures usually remain within the stream, unless exposed via materialized value for example, by a Sink such as `Sink.seq: Sink[T, Future[Seq[T]]]` which would fail the materialized *failed Future* if a failure is received.

One can also use the `.log().withAttributes(ActorAttributes.logLevels(...))` operator to log all signals at given point. Log levels can be set as `onNext`, `onError` or `onComplete`.

## Recovering from Failure

Akka Streams provides a number of ways to recover from failure signals of an upstream:

* `recover[T](pf: PartialFunction[Throwable, T])` operator, e.g., `myStream.recover{ ... }`. Note that this will end the stream.
* `recoverWith[T](pf: PartialFunction[Throwable, Source[T, _]])` operator
* restart stages with backoff support, including `RestartFlow.withBackoff(howManyRestarts, withinWhatTime)`. We also have `RestartSource` and `RestartSink`.

## Processing Rate

*Processing rate* is the throughput at which a stage is processing elements. We already discussed this: the need of back-pressure arises only if the processing rates of the streaming stages differ.

In streaming systems, it is often refered to as processing stages *throughput*, which we'll talk about in *elements per second* (or other time unit).

## "Global" vs. Local Rate Measurements

> Global measurements can be very misleading, as you can just properly calculate the rate in specific parts of a stream.

It is important to realise that the processing rate may be different at various points in the stream. For example, imagine the following 3-stage stream:

* A: An infinite source of numbers
* B: A flow stage, that only emits an element downstream if and only if it is divisible by 2
* C: A sink that accepts such numbers

Here, the rate from `B` to `C` will be half of the rate from `A` to `B`.

## "Rate Aware" operators

Some operators may take advantage of being aware of the Reactive Streams back-pressure:

* `conflate` - combines elements from upstream *while downstream back-pressures*
* `extrapolate` - in face of faster downstream, allows *extrapolating elements from last seen upstream element*.

We call them detached operations, as they separate the rates from the left and right side.

## Summary

* Failures of streams are propagated downstream through a stream (from Sources or Flows towards Sinks)
* Recovering from failure can be done using simple oeprators or advanced patterns like `Restart*` stages
* Processing rate is the throughput at which a stage is processing elements
* Rate must be measured at given points of a stream, since it may differ in various parts of the pipeline.
