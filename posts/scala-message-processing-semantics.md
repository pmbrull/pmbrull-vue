---
title: Message Processing Semantics
published: true
description: |
    How do actors interact with each other?
    How can we reach the rest of the actors
    in the system? Let's have a high level
    look of the underlying logic.
category: Scala
ctime: 2019-12-25
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Actor Encapsulation

There is no direct way to get the actor's behavior, only through messages, which can only be sent to known addresses `ActorRef`.

* Every actor knows its own address
* Creating an actor returns its address
* addresses can be sent within messages (e.g., sender, which is automatically captured)

Other important aspects of actors are the based on Actors being independent agents of computation:

* local execution, no notion of global synchronization
* all actors run fully concurrently
* message-passing primitive is one-way communication. It does not way for the receiver to do anything with the message.

## Actor-Interval Evaluation Order

On the inside, actors work on a single thread:

* messages are received sequentially
* behavior change is effective before processing the next message
* processing one message is the atomic unit of execution.

While having the benefits of synchronized methods, blocking is replaced by queueing messages.

> OBS: It is good practice to define the Actor's messages in its companion object.

## Actor Collaboration

Picture actors as persons and model activities as actors.

## Message Delivery Guarantees

All communication is inheretly unreliable. Whenever we send a message, we cannot be 100% sure that it will be received.

The delivery of a message requires eventual availability of the receiver and the communication channel. We have different degrees of effort to ensure that a message is being processed:

1. `at-most-once`: We send the message once, so it gets delievered $[0,1]$ times.
2. `at-least-once`: The sender will cache the message and send it until it receives an acknowledgement. Message is delievered $[1, \infty)$.
3. `exactly-once`: The most costly approach. Processing only first reception delivers exactly 1 time. This means to keep track of what messages have been or not received and processed.

## Reliable Messaging

The good thing of making messages explicit is that it supports reliability:

* messages can be persisted
* can include unique IDs
* delivery can be retried until successful.

Reliability can only be ensured by business-level acknowledgement.

Moreover, note that if an actor sends multiple messages to the same recipient, they will not arrive out of order (Akka specific feature).
