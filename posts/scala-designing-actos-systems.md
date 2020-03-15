---
title: Designing Actors Systems
published: true
description: |
    Some notes on the patterns that we could
    be following when designing the software
    architecture of Actor Systems.
category: Scala
ctime: 2019-12-26
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Schema

We can think of a flow like the following:

A `client` requests some action to be done. Then, there is a `receptionist` in charge of accepting all the requests, know who requested those, and distributing them, which means instantiating another actors that we'll call `controllers`. This `controllers` will know the state of the given requests and create new actors with specific and fine-grained tasks, if needed. When all the tasks are done, the `receptionist` will send the result back to the `client`.

It is useful to keep all necessary information in the messages, so that the `controller` does not need to remember any extra information.

## Important notes

* A reactive applications needs to be non-blocking and event-driven from top to bottom. If there is a piece that blocks a thread, we need to wrap that up in a `Future`.
* Actors are run by a `dispatcher` (`context.dispatcher`) - potentially shared - which can be used as the execution context to run Java and Scala Futures.
* Akka includes logging features with `class A extends Actor with ActorLogging`. As logging includes IO that can block indefinitely, Akka passes logging tasks to the dedicated actors. Different levels can be set, e.g., `akka.logLevel=DEBUG`. To use it in the class we can just specify `log.info("...")`. The logger will also include the Actor's name, so it is really important to get those right.
* Prefer immutable data structures, since they can be shared.
* To be thread-safe when working with Futures in the `dispatcher`, we need to send the results of the Future to the Actor per se, so that any further computations run on top of the future are accessed by the Actor. To do so, we can use the method `pipeTo` and send it to `self`.
* Do not refer to actor state from code running asynchronously. For example, if a method needs to pass the `sender`, create a separate value `val client = sender` to use.
* Prefer `context.become` for different states, with data local to the behavior.
