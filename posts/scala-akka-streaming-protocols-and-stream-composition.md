---
title: Akka Streaming Protocols & Stream Composition
published: true
description: |
    High level look at protocols and how we can tie
    together Streams by composing small and reusable
    pieces.
category: Scala
ctime: 2020-01-21
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Streaming Protocols

Protocols can be classified as either *stream* or *message*-based.

Stream based protocols will expose (potentially) an infinite stream of data, and writes and reads operate by adding / reading from this infinite stream. An example would be TCP.

Message based protocols allow sending / reading a specific "single" message, framing and other implementation details behind obtaining an entire message, are hidden from end users. Example: UDP (datagrams), Actor messaging.

## Using TCP in Akka Streams

Reactive Streams, including Akka Streams, are message based - you can receive a single element and the request semantics are also defined in terms of elements.

It is however possible to combine the two, and in combination with a framing mechanism, obtain a useful back-pressured way to utilise raw TCP connections in your application.

### TCP Echo Server in Akka Streams

Akka provides a TCP extension that we can use: `Tcp(system)`.

```scala
import akka.actor._
import akka.stream.scaladsl._

implicit val system = ActorSystem("tcp-echo")
implicit val mat = ActorMaterializer()

val echoLogic = Flow[ByteString]
Tcp(system).bindAndHandle(echoLogic, "127.0.0.1", 1337)
```

The `Flow` that we are going is going to read from the TCP connection and reply to the same TCP connection - from the user to the user.

> Note that the same could be done with Akka Typed system.

### TCP Client using Akka Streams

The client side of the echo example can send messages and print responses:

```scala
val clientFlow: Flow[ByteString, ByteString, Future[Tcp.OutgoingConnection]] =
    Tcp().outgoingConnection("127.0.0.1", 1337)
    // Tcp() gets the system implicitly

val localDataSource = 
    Source.repeat(ByteString("Hello!"))
        .throttle(1, per = 1.second, maximumBurst = 10, mode = Throttle)

val localDataSink = 
    Sink.foreach[ByteString](data => println(s"from server: $data"))

localDataSource.via(clientFlow).to(localDataSink)
    .run()
```

### Side note: Materialized value of the clientFlow

```scala
val clientFlow: Flow[
    ByteString, // incoming element type
    ByteString, // outgoing element type
    Future[Tcp.outgoingConnection] // materialized value type
] = Tcp().outgoingConnection("127.0.0.1", 1337)
```

Materialized values are really useful to carry additional information or control structures.

```scala
clientFlow.mapMaterializedValue(_.map { connection => 
    println(
        s"Connection established; " + 
        s"    local address ${connection.localAddress}, " + 
        s"    remote: ${connection.remoteAddress}"
    )
})
```

Information obtained only once the stream has materialized is exposed using the *materialized value*.

## Stream Composability

A key feature of Akka (and Reactive) Streams is that they are nicely composable.

A type is composable when it is possible to combine multiple instances.

> In Scala this is often also associated with the composition being type-safe, i.e. if a composition of objects compiles, it is expected to be correct.

### Using Stream Composability for testing

In the previous example, we had defined the server's logic as a `Flow[ByteString, ByteString, _]`.

We can make use of this in order to test the logic without having to invoke the real TCP infrastructure:

```scala
"echo a single value" in {
    val source = Source.single("Hello").map(ByteString(_))
    val sink = Sink.seq[ByteString]

    val futureSeq = source.via(echoLogic).runWith(sink)

    futureSeq.futureValue shouldEqual Seq(ByteString("Hello"))
}
```

The `futureValue` is a `scalatest` tool to get the Future value easily.

### Simulating TCP with stub streams

We can do the same for the client code, where we want to stub-out the server side.

In other workds, we can provide a `Flow` that will act as-if it was the real TCP connection.

```scala
def run(connection: Flow[ByteString, ByteString, _]) = 
    // our client logic

run(Tcp().outgoingConnection("127.0.0.1", 1337)) // real TC

run(Flow[ByteString]) // "mock" TCP
```

## Summary

* The difference between streaming and message based protocols
* How akka Streams and Reactive Streams can make use of TCP
* How to use the compositional building blocks of Akka Streams to enable nice "pluggable" testing.
