---
title: Akka Streams
published: true
description: |
    Akka Streams provides a high-level API for 
    streams processing and implements the 
    Reactive Streams protocol on all of its layers.
category: Scala
ctime: 2020-01-20
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Canonical Example

```scala
import akka.actor._ // untyped Actor System
import akka.stream.scaladsl{ Source, Flow, Sink } // main building blocks
implicit val system = ActorSystem()
implicit val mat = ActorMaterializer()

val eventuallyResult: Future[Int] =
    Source(1 to 10)
        .map(_ * 2)
        .runFold(0)((acc, x) => acc + x)
```

> OBS: We can also use Typed Actors for streaming!

The `ActorMaterializer()` uses the `system` we defined and transforms a description of a streaming pipeline, in our case `eventuallyResult` into an actual running execution of it. Moreover, note that the last part of the stream is characterized by the `runFold`. Whenever we see the `run` prefix it means executing the stream. Before this line, the stream is not running. Therefore, the `eventuallyResult` returns us a `Future[Int]` as the result of the folding operation.

If we dive a bit deeper, we can write the following, as the `runFold` is just syntactic sugar of:

```scala
runWith(
    Sink.fold(0)((acc: Int, x: Int) => acc + x)
)
```

Thus, we can see that `Sink`s, `Source`s and `Flow`s are built into the API to feel as native to the code as any other operation. We could always use `runWith()` with any custom function inside. Moreover, we could even write this same very code but constructing building blocks that could later be reused:

```scala
val numbers = Source(1 to 10)
val doubling = Flow.fromFunction((x: Int) => x * 2)
val sum = Sink.fold(0)((acc: Int, x: Int) => acc + x)

val eventuallyResult: Future[Int] = 
    numbers.via(doubling).runWith(sum)
```

## Shapes of Processing Stages

* In Akka Streams the "steps" of the processing pipeline (the Graph), are referred to as **stages**.
* The term **operator** is used for the fluent DSL's API, such as `map`, `filter`, etc.
* The term *stage* is more general, as it also means various fan-in and fan-out shapes (they can have multiple inputs and outputs).
* Akka Stream's main shapes we will be dealing with are:
    * `Source` - has exactly 1 output
    * `Flow` - has exactly 1 input and 1 output
    * `Sink` - has exactly 1 output

## Akka Streams - Reactive Streams correspondence

Akka Streams implement the Reactive Streams protocol, that means all stages adhere to the semantics we learnt about in the previous video.

Since Reactive Streams is an SPI, Akka Streams hides the raw SPI types from end-users (unless askes to expose them).

In general though there is 1:1 correspondence:

* `Source[O, _] (AS)` is equivalent to `Publisher[O] (RS)`.
* `Sink[I, _] (AS)` is equivalent to `Subscriber[I] (RS)`.
* `Flow[I, O, _] (AS)` is equivalent to `Processor[I, O] (RS)`.

## Composing Stages

* We can compose a `Source` and a `Flow` using `via`.
* We can compose a `Flow` and a `Sink` using `to`.

## Materializing (running) streams

*Running a stream* is performed by *materializing* it.

Materialization can be explained as the Sources, Flows and Sinks being the *description* of what needs to be dona, and by materializing it we pass this description to an execution engine - the **Materializer**.

By default, we will be using the `ActorMaterializer`. It takes the description of the execution graph and executes it using actors for the parallel aspects of it. However, at the same time it does apply *fusing*, for example if we have many `map` operations, they are best executed without asynchronous boundaries between them. It can optimize things a little bit, such as the `Catalyst` in Spark.

## Operator API similarity to Scala collections

Simple operations in Akka Streams are intentionally looking similar to Scala collections. For example:

```scala
tweets.filter(_.date < now).map(_.author)
```

The same lines of code would work if the `tweets` was op type `Source[Tweet, _]` or any of the collections in Scala.

> OBS: It is really useful to have the [Reference docs](https://doc.akka.io/docs/akka/current/index.html) at hand.

## Stream Execution Model / Resource Sharing

While the looks may be (almost) the same, the internals and execution mechanisms of those APIs could not be more different.

Consider the following code, printing out the thread on which the execution is happening:

```scala
tweets.wireTap(_ => println(Thread.currentThread.getName))
```

Could either return:

```scala
Followers-akka.actor.default-dispatcher-2
Followers-akka.actor.default-dispatcher-2
```

or 

```scala
Followers-akka.actor.default-dispatcher-1
Followers-akka.actor.default-dispatcher-2
Followers-akka.actor.default-dispatcher-1
```

This is because internally Akka Streams uses Actors, which can run in multiple threads. This execution plan is decided by the `Materializer`.

## Concurrency is not parallelism

> In programming, concurrency is the composition of independently executing processes, while parallelism is the simultaneous execution of (possibly related) computations. Concurrency is about dealing with lots of things at once. Parallelism is about doing lots of things at once. - Andrew Gerrand

Stages are by defition concurrent, yet depending on how they are fused and executed may or may not be running in parallel.

To introduce parallelism, use the `.async` operator (e.g., `"Source".async.map...`), or `*Async` (e.g., `mapAsync(parallelismFactor)(a => Future[b])`) versions of operators.

## Materialized Values

The last parameter of all stages is the materialized value, we obtain it when we `run` (materialize) the stream, i.e., how did we get the `Future[Int]` in the first example:

```scala
val sink: Sink[Int, Future[Int]] = // Sink[input, mat-value]
    Sink.fold(0)((acc, x) => acc + x)

val result: Future[Int] =
    Source(1 to 10)
        .runWith(sink) // materializes the sink's mat-value
```

Materialized values are values yielded by a stage when we run the stream.

Usually we keep the left-hand value when combining stages. The `runWith` method keeps the right-hand side. Alternatively, the `source.to(sink).run()` would keep the Source's mat-value. The `to` operator is really useful when the Source has a very interesting type of value that we want to to hold to.

## Accessing Materialized values in-line

You can change or access a materialized value by using the `.mapMaterializedValue(mat => newMat)` operator.

Sometimes you may not care about materialized values, and then you can simply ignore them.

## Summary

* Akka Streams basic building blocks are Source, Flow and Sink
* The Akka Streams DSL feels similar to the Scala collections API for basic operations
* Stream stages are by construction concurrent, however fusing and actual runtime (materializer) determine their parallelism
* Materialized values can be used to communicate from "within" the stream with the outside of it in a type-safe and thread-safe way
