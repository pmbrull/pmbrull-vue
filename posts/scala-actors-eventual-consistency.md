---
title: Actor's Eventual Consistency
published: true
description: |
    Ever heard about the CAP theorem? In this post
    we will discuss different ways to structure
    consistency with Scala and define the consistency 
    tier for Actors.
category: Scala
ctime: 2020-01-09
---

# Actors - Eventual Consistency

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Sending messages, responding to them and disseminating the information are actions that take time to complete.

Let's start with some definitions:

* **Strong Consistency**: After an update completes, all reads will return the updated value. We can achieve this, for example, by applying `synchronization`:

    ```scala
    private var field = 0
    def update(f: Int => Int): Int = synchronized {
        field = f(field)
        field
    }
    def read(): Int = synchronized { field }
    ```

    However, note that here the locks on the Scala objects work because we are executing everything in the same JVM on the same computer. This not only is a kind of limited escenario, but we also discussed how blocking elements has computation drawbacks as we are not fully using the CPU and can also lead to *deadlocks*.

* **Weak Consistency**: After an update, conditions need to be met until reads return the updated value. This is the *inconsistency window*.

    ```scala
    private @volalite var field = 0
    def update(f: Int => Int): Future[Int] = Future {
        synchronized {
            field = f(field)
            field
        }
    }
    def read(): Int = field
    ```

    We can remove the need of blocking the thread by moving the synchronization into another execution context. As we mark the value as `volatile`, this makes sure that all threads see the updated value when they do their next read. We do not need synchronization for the read but we do need to wait to get the updated value.

* **Eventual Consistency**: Once no more updates are made to an object (the system becomes quiescent), there is a time after which reads return the last written value.

    Let's create an example with an Actor which holds a integer `field` but where are multiple actor sharing this value:

    ```scala
    case class Update(x: Int)
    case object Get
    case class Result(x: Int)
    case class Sync(x: Int, timestamp: Long)
    case object Hello

    class DistributedStore extends Actor {
        var peers: List[ActorRef] = Nil
        var field = 0
        /* 
         We use the variablelastUpdate in order to serialize the updates:
         to answer the question: which value do we keep when
         there are multiple updates occuring in different actors
         */
        var lastUpdate = System.currentTimeMillis()

        def receive = {
            case Update(x) =>
                field = x
                lastUpdate = System.currentTimeMillis()
                peers foreach (_ ! Sync(field, lastUpdate))
            case Get => sender ! Result(field)
            case Sync(x, timestamp) if timestamp > lastUpdate =>
                field = x
                lastUpdate = timestamp
            // We get a new peer
            case Hello =>
                peers ::= sender
                sender ! Sync(field, lastUpdate)
        }
    }
    ```

## Actors and Eventual Consistency

* An actor forms an island of consistency. Everything you do within an actor is sequentially consistent.
* Collaborating actors can at most be eventually consistent
* Actors are not automatically eventually consistent
* Event consistency requires eventual dissemination of all updates
* Need to employ suitable data structures, for example CRDTs (Convergent and Commutative Replicated Data Types).

An example of CRDTs is the Data Structure formed by the Akka Cluster states, for example `joining -> up -> leaving -> exiting`. They form a DAG: Directed Acyclic Graph, which ensures the convergence of states to the final state in the graph.
