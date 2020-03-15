---
title: Typed Actors - Intro to Protocols
published: true
description: |
    So far we've seen that Actors can can communicate 
    to any other actor with any kind of message at any time. 
    This leaves the compiler totally isolated and unable 
    to help us during the development, so now we will introduce 
    how to describe communication protocols that can be 
    understood by the computer.
category: Scala
ctime: 2020-01-12
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## What is a Protocol?

* Protocols are ubiquitous: two parties communicating with one another through the exchange of messages.
* Successful communication needs the recipient to be ready
* Who should what, and when?

What we need to do is finding a way to formalize the protocols for the machine to understand them.

## Formal Description with Session Types

* **Session**: an execution of a protocol. A concrete exchange between a number of parties participating in that exchange.

Session types try to formalize what happens in that exchange.

## The Type of a Channel

We have seen that the communication protocol governs not only when something is sent, but what is sent specifies a message type for each step. Since all communication happens across communication channels, we need to also look at them. So:

* The protocol governs not only when but also what is sent
* The message type is specified for each step.

Now there are two options

* Each participant has one channel per interlocutor, for example one channel between parties A and B.
* The second option is one channel for each message type: each message is represented by its own channel with a fixed type. Since Scala cannot change types over time, Akka uses this second option.
