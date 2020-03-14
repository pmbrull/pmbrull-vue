---
title: Actor Composition
published: true
description: |
    When we are working with Actors that do not hold
    any specific type, can we use the usual
    composition patterns as we do with functions?
    How can we then divide huge tasks into small pieces?
    Let's have a look at Actor Composition.
category: Scala
ctime: 2020-01-10
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## The Type of an Actor

The type of an object describes how that object looks from the outside, what you can do with it. The interface of an Actor is defined by its accepted messages types, which makes the type of an Actor *structural*. This structure may change over time (`context.become(...)`) defined by a protocol.

> OBS: We say that the Actor type is structural as it is not bound to the Actor name. Otherwise it would be called nominal.

Looking at the types appear in actor implementations there are two main methods:

* Sending a message (tell function or `!`) is `(Any => Unit)`
* Behavior is `PartialFunction[Any, Unit]`.

However, these types do not restrict what you can send. This limitation is not fundamental. While it is true that an Actor can change its behavior, this is not the usual case. Even if it was, the total number of accepted message types would be bounded, and we saw that it's useful to define the complete set of messages they accept in the companion object. However, we still do not have fully typed actors that can be catched by the compiler, as things as the state can change and make an actor get unhandled messages on the fly.

## Actor Composition

As actors are not statically typed, we cannot compose them as we do with functions. Instead, Actor Systems are composed like human organizations: split a task in part and have each actor perform a piece and then take the results together. This means that Actor are composed at protocol level.

An Actor can:

* Translate and forward requests,
* Translate and forward replies, and
* Split up requests and aggregate replies.

Let's now check some Design Patterns:

## The Customer Pattern

* This is the most fundamental pattern, based on a request-reply pattern.
* The customer address is included in the (original) request (which enables us to reply!)
* Allows for dynamic composition of actor systems. For example, we could forward the request to a third actor, which would also know the sender address to reply to. The forwarding actor can decide dynamically who should handle the request.

## Interceptors

We could also take an `ActorRef` and wrap it inside another actor

```scala
class AuditTrail(target: ActorRef) extends Actor with ActorLogging {
    def receive = {
        case msg =>
            log.info("sent {} to {}", msg, target)
            target forward msg
    }
}
```

A one-way proxy does not need to keep state.

## The Ask Pattern

In this pattern you expect exactly one reply.

```scala
import akka.pattern.ask

class PostByEmail(userSerivce: ActorRef) extends Actor {
    implicit val timeout = Timeout(3.seconds)
    def receive = {
        // when we get an email
        case Get(email) =>
            // Find by email everything you know about that user
            (userService ? FindByEmail(email)).mapTo[UserInfo] // returns a Future[Any]
                .map(info => Result(info.posts.filter(_.email == email))) // Future[Result]
                .recover { case ex => Failure(ex) }
                .pipeTo(sender) // Pipe the Future back to the sender
    }
}
```

Importing the `ask` pattern gives us an implicit conversion on `ActorRef`s, which gives the `?` operator. It is pronounced `userService ask FindByEmail`.

> OBS: As Actors are not usefully typed, this gives a `Future[Any]`, but we expect back another type, so we map it to transform the Future under the hood. After `mapTo` we have a `Future[UserInfo]`.

However, actors can only send messages to `ActorRef` and in this case there is not an explicit one to reply to. Therefore, the `ask` operator creates a lightweight pseudo-actor. If the `Future` has not been completed before the preset timeout, this pseudo-actor will be stopped (`AskTimeoutException`), as it is just an Actor linked to a Promise.

We could of course manually create the `userService` actor, forward the message and have him reply to the sender. The Ask Pattern is just an optimized form to do this. Although it may seem atractive, it is important to keep this pattern for clear logic paths. If the functions and Futures become hard to follow and recover from exceptions, it's better to create a custom actor.

Another use case where the Ask Pattern is useful with **Result Aggregation** from multiple actors:

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

## Risk Delegation

An Actor is not limited to transforming the values which travel. It can also transform the lifecycle monitoring or the semantics of how an actor works.

Moreover, it is useful to design the system in a way that the risk is delegated to children actors to ensure that all requests end up being responded even if the actor performing the actual task fails:

* Create subordinate to perform dangerous task
* Apply lifecycle monitoring
* Report success / failure back to the requestor
* Ephemeral actor shuts down after each task.

An example could be a request to write to a file. Instead of handling everything (request + operation) in the same Actor, we will create a two step communication to delegate risk:

```scala
class FileWriter extends Actor {
    var workerToCustomer = Map.empty[ActorRef, ActorRef]
    override val supervisorStrategy = SupervistorStrategy.stoppingStrategy
    def receive = {
        case Write(contents, file) =>
            val worker = context.actorOf(Props(new FileWorker(contents, file, self)))
            context.watch(worker)
            workerToCustomer += worker -> sender
        // message sent by the worker
        case Done =>
            workerToCustomer.get(sender).foreach(_ ! Done)
            workerToCustomer -= sender
        case Terminated(worker) =>
            workerToCustomer.get(worker).foreach(_ ! Failed)
            workerToCustomer -= worker

    }
}
```
