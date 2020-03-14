---
title: Actors - Scalability
published: true
description: |
    We want our processes to being able to handle
    a changing flow of inputs while still delivering
    fast responses to those inputs. A system that is not
    able to handle peaks, possible ends up collapsing,
    while a system that spends too much resources
    on a valley is just throwing money away.
category: Scala
ctime: 2020-01-11
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

An important aspect of Reactive Programming is that we favor scalability over performance. Why? Low performance means the system is slow for a single client, where low scalability means the system is fast when used by a single client but slow when used by many clients. So, instead of pushing performance - where we maximize a single client speed by optimizing CPU - we rather want a solution that can handle a growing number of requests / clients without the fear of reaching a ceiling too soon, compromising the service quality.

## Replication of Actors

What does this mean when implementing an Actor System?

An actor can process one message at a time, no more, eventhough there are more messages coming in. The only way to speed the resolution of requests is to increase the number of Actors responding to them. A possible pattern would be creating a new actor for each new request (or define a pool of workers). Another would be having replicas of actors. If those are stateless, then multiple replicas can run concurrently.

As actor messaging is asynchronous, the client does not know (and does not care) if the computation has been done in the receiver or has been routed to another actor. This allows easily for vertical scalability, i.e., using more actors in more CPUs.

There are two types of routing messages to worker pools:
* Stateful (round robin, smallest queue, adaptative, ...)
* Stateless (random, consistent hashing, ...)

## Stateful Routing

## Round-Robin Routing

* Equal distribution of messages to routees. We keep distributing the messages to the workers in the pool in the same order, one message at a time.
* Hiccups or unequal message processing times introduce imbalance
* Imbalances lead to larger spread in latency spectrum

The imbalances in processing time, usually originated by an actor failing and then accumulating messages in the queue, can be fixed by the following routing approach.

## Smallest Mailbox Routing

* Requires routees to be local to inspect message queue (it does not work over the network!)
* Evens out imbalances, less persistent latency spread
* High routing cost, only worth it for high processing cost

Moreover, we could even share the message queue between different actors.

## Shared Work Queue

* Requires routees to be local
* Most homogenous latency
* Effectively a pull model

Here, all actor keep *pulling* out the oldest message in the queue.

## Adaptive Routing

* Requires feedback about processing times, latencies, queue sizes
* Feedback can be sampled coarsely
* Steering the routing weights subject to feedback control theory, otherwise we can end up creating
    * Oscillations
    * Over-dampening

If we gather the imbalance data every X seconds, we can steer the imbalance weights dynamically, so that messages are more frequently sent to more free actors.

## Stateless Routing

## Random Routing

* Asymptotically equal distribution of messages to routees
* No shared state necessary: low routing overhead, as we don't even need a routing actor that does nothing. The sender can randomly distribute the messages.
* Works with several distributed routers to the same routees
* Can stochastically lead to imbalances

## Consistent Hashing

* Splitting incoming message stream according to some criterion
* Bundle substream and send them to the same routees consistently
* Can exhibit imbalances based on hashing function - we need to find a uniform distribution
* Different latencies for parts of the input spectrum
* No shared state necessary between different routers to the same targets

An example could be sending the messages from the same users to the same actors. This way we can even use computation that are stateful based on a given user, as the state could be retrieved from the actor.

## Replication of Stateful Actors

Consistent Hashing can be used if substreams correspond to independent parts of the state. But if we have multiple writers to the same state require appropriate data structures and are eventually consistent.

Stateful Actors can be persistent as well:

* Based on persisted state
* Only one instance active at all times
* Consistent routing to the active instance
* Possibly buffering messages during recovery
* Migration means recovery at a different location

## Summary

* Asynchronous message passing enables vertical scalability
* Location transparency enables horizontal scalability
