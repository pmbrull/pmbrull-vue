---
title: Akka - Stream Processing
published: true
description: |
    We've already seen how to work with Streaming
    with tools such as Spark and Kafka. However,
    Actors are natively well suited for this same
    task. Let's have a first look at how we can achieve it.
category: Scala
ctime: 2020-01-18
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Streaming is a rather broad term, most commonly associated with:

* Processing a number (possibly infinite) of elements
* By pushing / pulling elements through a "pipeline"
* Such pipeline is composed of operations that modify the elements
* Operations are often expressed as DSL similar to Scala collections (`map`, `flatMap`, `filter`)

## Motivation for streaming APIs

* Lots of applications are about processing data
* Data sources can be intermittent or unbounded
* Data has to flow throughout distributed nodes
* Stream processing = manipulation of data whose sources are intermittent and potentially unbounded

## Goals of Stream Processing

Stream processing aims to address:

* Compositional building-blocks
* Handle flow-control through such stream pipeline
* Process many, possibly infinite, elements at optimal rate

## Streaming and the Reactive Manifesto

> OBS: Find the Reactive Manifesto [here](https://www.reactivemanifesto.org/).

We have looked at various parts that make a system reactive, which is a term not only about streaming, but also related to other aspects already covered:

* Resilience
* Elasticity
* Message Driven
* Responsiveness

We will focus on **asynchronous stream processing**. However, streaming is not tied to all the manifesto elements per se. If we want it to be resilient, we need to note what does resiliency mean in our business case and apply it with the right patterns.

## Challenges

To get ourselves into the right problem solving mind-set, consider the following challenges:

* Resource efficiency
* Flow controlled processing
* Failure handling
* Separation of business and operational concerns
