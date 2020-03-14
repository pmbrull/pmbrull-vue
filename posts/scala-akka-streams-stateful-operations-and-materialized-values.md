---
title: Akka Streams - Stateful Operations and Materialized Values
published: true
description: |
    We are going to analyze how to work with
    stateful operations and create bijections
    with their stateless companion. Moreover, let's
    see how we can extract that meaningful piece
    of information thanks to materialized values.
category: Scala
ctime: 2020-01-22
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Stateful Operations

While stream processing often can "get away with" being stateless, such that each operator only needs to operate on the current element, for example with operators such as `map` and `filter`, sometimes we may need to implement an operator that depends on some state that is constructed from all previously processed elements.

## statefulMapConcat

We can think of `statefulMapConcat` as being basically a `flatMap`.

```scala
source
    .statefulMapConcat { () => 
    // safe to keep state here
    var state = ???
    // end of place to keep mutable state

    // invoked on every element:
    element => {
        val elementsToEmit = List[String]()

        // return a List of elements that shall be emitted
        elementsToEmit
    }
}
```

Note how we always create a new instance: `() =>`. This is because for every materialization we want to have a different instance of the state, so that every stream gets its own state.

## Example 1: implement with zipWithIndex

* `zipWithIndex` produces elements paired with their indexes
* It has to keep track of how many elements have been previously produced.

```scala
def zipWithIndex[A]: Flow[A, (A, Int), _] =
    Flow[A].statefulMapConcat { () =>
        var i = -1
        element => {
            i += 1
            // it's like a flatMap, so it expects a collection
            (element -> i) :: Nil
        }
    }
```

## Example 2: Filter above current average

Imagine you are implementing a ranking system, and from all incoming ratings maintain a "current average rating".

Based on that value, you want to filter elements that are above the current average score.

```scala
val aboveAverage: Flow[Rating, Rating, _] =
    Flow[Rating].statefulMapConcat { () =>
        var sum = 0 // current sum of ratings
        var n = 0 // number of summed ratings
        ratings => {
            sum += rating.value
            n += 1
            val average = sum / n
            if (rating.value >= average) rating :: Nil
            else Nil
        }
    }
```

The good thing of Akka Streams is that even if we want to return a huge list, it automatically takes care of all the back-pressure downstream and pulling from the upstream.

## Materialized Values

So far we have mostly ignored materialized values, however they are crucial in building non-trivial streams. Simplest example:

```scala
val sink: Sink[Int, Future[Int]] = Sink.head
```

`sink` describes a process that consumes at most one `Int` element. When this process is executed, it returns a `Future[Int]`, which is completed when the element is received. We can use materialized values to communicate to elements that are not in the stream.

```scala
val eventuallyResult: Future[Int] = someSource.runWith(sink)
```

See how we obtain the future value once we actually run the stream.

## Example 2

We can also use materialized values to feed data into streams.

Here is an example of use of a value materialized by a `Source`:

```scala
// First, describe a source
val source: Source[Int, Promise[Option[Int]]] = Source.maybe[Int]
// Second, materialize it
// Sink.ignore does nothing
val promise: Promise[Option[Int]] = source.to(Sink.ignore).run()
// Third, emit exactly one element
promise.complete(Some(42))
```

If we would have sent a `None`, the stream would just have sent an `onComplete` signal right await. Moreover, insted of `promise.complete(...)` we could have used `promise.failure(new Exception ...)`, and this would have made the stream to terminate but passing the exception downstream.

## Keeping materialized values

When we combine two stages together (for instance, a `Source` and a `Sink`), by default only one of their materialized values is kept:

```scala
// keeps the materialized value of the source
source.to(sink).run(): Promise[Option[Int]]
// keeps the materialized value of the sink
source.runWith(sink): Future[Int]
```

We can get more fine-grained control on what to do with materialized values by using `toMat` instead of `to`:

```scala
source
    .toMat(sink)((sourceMat, sinkMat) => (sourceMat, sinkMat))
    .run(): (Promise[Option[Int]], Future[Int])
```

But we don't need to write all of these methods, as there is a `Keep` builder of these functionalities:

```scala
trait Source[+O, +M] {
    def toMat[M2, M3](s: Sink[O, M2])(op: (M, M2) => M3): RunnableGraph
}

source.toMat(sink)(Keep.both): RunnableGraph[Promise[Option[Int]]], Future[Int])
source.toMat(sink)(Keep.right): RunnableGraph[Future[Int]]
source.toMat(sink)(Keep.left): RunnableGraph[Promise[Option[Int]]]
source.toMat(sink)(Keep.none): RunnableGraph[NotUsed]
```

## Materializing "control" objects

Materialized values can be used to control the execution of a stream. By *control* we mean that from a running stream we want to do something from our side. Tell the stream that something has changed after a given action. This is useful in Kafka streams or timers.

Consider for instance the following stream that emits values each second when it is executed:

```scala
val ticks: Source[Int, Cancellable] = Source.tick(1.second, 1.second)
val cancellable = ticks.to(Sink.ignore).run()

// the stream will run forever...
// ... unless we explicitly cancel it
cancellable.cancel()
```

## Summary

* How to build stateful operations using `statefulMapConcat`
* Why materialized values are useful and powerful
* How to use the `*Mat` versions of APIs to "keep" only the materialized values we care about.
