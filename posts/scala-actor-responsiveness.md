---
title: Actors - Responsiveness
published: true
description: |
    What are the main characteristics of working
    with Actors? In this post we will discuss
    Responsiveness and how this ties our
    programs together.
category: Scala
ctime: 2020-01-11
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

So far we've seen three primordial aspects of Actors:

1. Message driven / Event driven nature
2. Supervision: to make them resilient against failure
3. Achieving scalability through routing

Now, we will look at the fourth, which ties all of these characteristics together.

**Responsiveness** is the ability to respond to input in a given time limit. A system which does not respond in time is not available. This means that resilience is not achieved if the system cannot respond or equivalently, the goal of resilience is to be available.

Responsiveness also implies resilience to overload scenarios.

In this post we will see how to achieve responsiveness in both normal and failure cases and underload.

## Exploit Parallelism

Performing queries sequentially adds up latency. Let's take another look at the example from the Actor Composition (aggregation patterns):

```scala
class PostSummary(...) extends Actor {
    implicit val timeout = Timeout(500.millis)
    def receive = {
        case Get(postId, user, password) =>
            val response = for {
                status <- (publisher ? GetStatus(postId)).mapTo[PostStatus]
                text <- (postStore = Get(postId)).mapTo[Post]
                auth <- (authService ? Login(user, password)).mapTo[AuthStatus]
            } yield
            if (auth.successful) Result(status, text)
            else Failure("not authorized")
        response pipeTo sender
    }
}
```

What happens here is that we ask to the actors one after the other, after we get a reply. We can make this respond quite a lot sooner if we process the three queries in parallel:

```scala
class PostSummary(...) extends Actor {
    implicit val timeout = Timeout(500.millis)
    def receive = {
        case Get(postId, user, password) =>
            // Ask in parallel
            val status = (publisher ? GetStatus(postId)).mapTo[PostStatus]
            val text = (postStore = Get(postId)).mapTo[Post]
            val auth = (authService ? Login(user, password)).mapTo[AuthStatus]

            // Tie the resulting futures
            val response = for (s <- status; t <- text; a <- auth) yield {
                if (a.successful) Result(status, text)
                else Failure("not authorized")
            }
            response pipeTo sender
    }
}
```

## Load vs. Responsiveness

When incoming request rate rises, latency tipically rises for everyone using the system.:

* Avoid dependency of processing cost on load
* Add parallelism elastically (resizing routers)

When the rate exceeds the system's capacity, requests will pile up:

* Processing gets backlogged
* Clients timeout, leading to unnecessary work being performed

Once we have exploited all the possible parallelism, it is important to look at each component's responsiveness and try to reduce the latency there.

## Circuit Breaker

In order to achieve this increased performance we do not want to keep computing for a lost cause, for example because one of the Futures fails. Thus, we can introduce the Circuit Breaker pattern:

```scala
class Retriever(userService: ActorRef) extends Actor {
    implicit val timeout = Timeout(2.seconds)
    val cb = CircuitBreaker(
        context.system.scheduler,
        maxFailures = 3,
        callTimeout = 1.second,
        resetTimeout = 30.seconds
        )

    def receive = {
        case Get(user) =>
            val result = cb.withCircuirBreaker(userService ? user).mapTo[String]
            ...
    }
}
```

The `CircuitBreaker` wraps up the `Future` and looks if it succeeds and when it succeeds. For example, in this case it will look if the Future put inside was completed within 1 second. If it was not, it increases the failure counter. Once it reaches 3, the circuit breaker opens and all subsequent requests will fail immediately without contacting the service user. This takes the pressure off the `userService` and makes the system respond a lot faster. After that, as requests keep coming, the CB will allow one in every 30 seconds to see if it succeeds. If it does, then the CB closes and the program proceeds normally. However, if the new request also fails, the CB will open for another 30 seconds.

The last thing we need to consider is to segregate resources to make different parts of the system independent from each other.

## Bulkheading

* Separate computing intensive parts from client-facing parts.
* Actor isolation is not enough: execution mechanism is still shared.
* Dedicate disjoing resources to different parts of the system. For example, different actors running on different nodes or different dispatchers.

This last part can be configured as follows:

```scala
props[MyActor].withDispatcher("compute-jobs")
```

This will make the actor (and all of those in the same dispatcher) run on a different thread pool. If we do not specify it, actors run on the `default-dispatcher`:

```scala
akka.actor.default-dispatcher {
    executor = "fork-join-executor"
    fork-join-executor {
        parallelism-min = 8
        parallelism-max = 64
        // 3 times the number of CPU cores available
        parallelism-factor = 3.0
    }
}

// define our own dispatcher adding another config section
compute-jobs.fork-join-executor {
    parallelism-min = 4
    parallelism-max = 4
}
```

## Failures vs. Responsiveness

* Detecting failure in distributed systems takes time, usually a timeout.
* Immediate fail-over requires the backup to be readily available.
* Instant fail-over is possible in active-active configurations. For example, maintaining several times the same actors running and responding to the client once you get +2 responses that match. This way, if one actor fails, the system remains intact as there are actor performing the same exact job. However, this is resource consuming.

## Summary

* Event-driven systems can be scaled horizontally and vertically
* Responsiveness demands resilience and scalability
