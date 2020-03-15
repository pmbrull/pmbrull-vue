---
title: Akka - Introducing Reactive Streams Semantics
published: true
description: |
    Reactive systems need to overcome complex tasks:
    how do we efficiently exchange information? How do
    we handle failure and resources? Is it possible
    to tie different parts together?
category: Scala
ctime: 2020-01-19
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Flow-control and Reactive Streams

We need to discuss an important point of reactive streams: **back-pressure** or **flow-control**.

Flow control is a mechanism to control the *rate* at which an upstream publisher is emitting data to a downstream subscriber in proposition to the subscriber's receiving capabilites.

## Motivation Example

In general the need of back-pressure can be examplified in any asynchronous system in which the upstream is producing faster than the downstream consumer is able to process it.

These situations happen when:

* Adding elements to queues asynchronously
* Issuing HTTP requests to a slow service

So in the following scenario

* Upstream - produces data at a fast rate
* Downstream - Consumes data at a slow rate

What will end up having OOM errors or overflow exceptions. What we need to make sure is that the data is coming at a rate that we are able to process without breaking the system. How do we avoid these situations?

## Reactive Streams

The Reactive Streams initiative provides a standard for asynchronous stream processing with non-blocking back-pressure.

Breaking down the elements here we find:

* **Asynchronous**: send messages without waiting for the reply
* **Stream processing**: possibly infinite flow of elements through a pipeline
* **Back-presure**: Rate control of the data flow from publisher to consumer
* **Non-blocking**: Design the system in such a way that neither the publisher nor consumed become still while they wait for computations to happen.


## Reactive Streams Components

> Find the home page [here](http://www.reactive-streams.org/)

Reactive Streams was initially designed and developer in Java, however their core abstractions are language agnostic.

Reactive Stream define:

* A set of interaction Rules (the [Specification](https://github.com/reactive-streams/reactive-streams-jvm/blob/v1.0.3/README.md#specification))
* A set of types (the SPI or Service provider interface)
* A Technology Compliance Kit ([TCK](https://github.com/reactive-streams/reactive-streams-jvm/tree/v1.0.3/tck))

## Reactive Streams methods as Signals (Messages)

Method's return type is `void` (in Scala: `Unit`), this is the same idea here as with Actor messaging - lack of return type enables us, and leads us to, building the system as asynchronous signals.

By forcing the signatures to be `... => Unit` we allow implementations to dispatch the work asynchronously as quickly as possible, without enforcing much overhead (except for checking the validity of the call: i.e., `nulls` are not allowed).

## Challenges: Resource Efficiency

The Reactive Streams *implementors* are responsible of managing resources. Nevertheles:

> Care has been taken to mandate fully non-blocking and asynchronous behavior of all aspects of a Reactive Streams implementation - Reactive Streams specification.

Also, the `Publisher` can release resources when a subscription is *cancelled*: a signal sent by the Subscriber `cancel()`.

## Challenge: Failure Handling

> OBS: Errors can only flow downstream.

If the subscriber receives instead of `onNext(element)`, after he requests `request(numElements)`, an `onError(reason)`, this means that he gets notified about an upstream failure.

## Challenge: Separating business logic from plumbering

* Out of scope of Reactive Strams
* Left to libraries implementing the Reactive Streams protocol.

> [Reactive Streams's] primary purpose is to define interfaces such that different streaming implementations can interoperate; it is not the purpose of Reactive Streams to describe an end-user API - Akka Streams docs.

## Challenge: Interoperability

> It is the intention of this specification to allow the creation of many conforming implementations, which by virtue of abiding by the rules will be able to interporate smoothly, preserving the aforementioned benefits and characteristic across the whole processing graph of a stream application - Reactive Streams Specification

## Summary

* Reactive Streams is an initiative to provide a standard for asynchronous stream procesing with non-blocking back pressure.
* Reactive Streams mandate a "permit" based way of handling flow-control.
* Akka Streams is one of the many implementations of Reactive Streams.
