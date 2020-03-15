---
title: Akka Streams - Fan-in Fan-out Operations
published: true
description: |
    Let's have a look at the operations that
    let us divide or merge streams of data!
category: Scala
ctime: 2020-01-22
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Splitting and Merging Streams

Sources, flows and sinks only allow sequential pipelines of transformations:

* *Fan-in* operatios are operations which have multiple **input** ports
* *Fan-out* operations are operations which have multiple **output** ports

```
                    __ Flow __
Source --> Balance-|          |-> Merge --> Sink
                   |__ Flow __|
```

In this case, the `Balance` operator fans-out into a number of Flows, and the fan-in operations is the `Merge`.

## Examples of a static fan-in operators

### Merge

The merge operator allows us to put together multiple stream sources into the same one, without much caring into the ordering of the elements.

```scala
def coffees(
    mokaPot: Source[Coffee, _],
    frenchPress: Source[Coffee, _]
): Source[Coffee, _] = 
    mokaPot.merge(frenchPress)
```

We produce coffees by taking them as they arrive from each brewing system.

### ZipWith

Allows us to merge to upstreams into one downstreams, requiring that at the same time one element of each stream must be available for the `zip` part, and then still one operation needs to be applied for the `with` part on top of both.

```scala
def cappuccinos(
    coffeePowderSource: Source[CoffeePowder, _],
    milkSource: Source[Milk, _]
): Source[Cappuccino, _] =
    coffeePowderSource.zipWith(milkSource) {
        case (coffeePowder, milk) => makeCapuccino(coffeePowder, milk)
    }
```

We produce `cappuccinos` by takin one item of each source and combining them.

What happens if the milk source is faster than the coffee powder source? The `zip` operator will back-pressure the faster stream, so no elements will be requested from that upstream if we are still waiting for the slow stream elements.

## Examples of static fan-out operators

### Balance

It allows us to distribute some source work into multiple processors.

> Another useful and similar operator is `broadcast`, which repeats all data points into multiple streams.

## Dynamic fan-in

* The number of input ports of the `Merge` and `ZipWith` fan-in operators is fixed at the time the graph is described.
* However, there are some situations where you want to be able to add new input ports after the graph has started running.

Exmaple: a coffee factory allowing workers to join or leave the production line at any time without interrupting the production of coffee.

## Examples of dynamic fan-in operators

### MergeHub

```scala
class CoffeeFactory()(implicit mat: Materializer) {
    // Assumes that the factory can warehouse the produced coffee
    private def warehouse(coffe: Coffee): Unit = ...

    private val workersHub =
        MergeHub.source[Coffee]           // : Source[Coffee, Sink[Coffee, _]]
            .to(Sink.foreach(warehouse))  // : RunnableGraph[Sink[Coffee, _]]
            .run()                        // : Sink[Coffee, _]

    def connectWorker(worker: Source[Coffee, _]): Unit =
        worker.to(workersHub).run()
}
```

The `MergeHub` effectively becomes a source, which merges multiple upstreams into a single downstream, so we can apply all the operations we already know as a usual `Source`. However, the important part is that the **materialized value** of the `MergeHub` is a `Sink[Coffee]`.

So, each `worker` acts a `Sink`, but for us it is a `Source`, as we get coffee from it that will be merged by the `MergeHub`. The dynamic nature of it is that we can materialize the workers multiple times so people can arrive and leave without disrupting the outgoing flow of coffee.

To sum all of this up:

`MergeHub` creates a `Source` that emits elements merged from a dynamic set of producers:
* The `Source` returned by `MergeHub.source` produces no elements by itself, but running it materializes a `Sink`.
* That `Sink` can be materialized (i.e., run) arbitrary many times.
* Each of the `Sink` materialization feed the elements it receives to the original `Source`.

## Examples of dynamic fan-out operators

### BroadcastHub

It is the same as the `broadcast` operators, but allows for dynamic attaching of new subscribers.

```scala
private def warehouse: Flow[Coffee, StoredCoffee, _] = ...

private val (workersHub, customersHub) =
    MergeHub.source[Coffee]
        .via(warehouse)
        .toMat(BroadcastHub.sink[StorefCoffee])(Keep.both)
        .run()

def connectWorker(worker: Source[Coffee, _]): Unit = 
    worker.to(workersHub).run()

def connectCustomer(customer: Sink[StoredCoffee, _]): Unit = 
    customersHub.to(customer).run()
```

Note how we `Keep.both` as we want both the `MergeHub` source and the `BroadcastHub` sink materialized values.

It works in a similar way than `MergeHub`. It creates a `Sink` that receives elements from an upstream producer and broadcasts them to a dynamic set of consumers:

* After the `Sink` returned by `BroadcastHub.sink` is materialized, it returns a `Source`.
* That `Source` can be materialized arbitrary many times.
* Each of the `Source` materialization receives elements from the original `Sink`.

## Summary

* What fan-in and fan-our operations are
* How to use the static and dynamic fan-in and fan-out operations in Akka Streams
* How those operations relate to processing rate.
