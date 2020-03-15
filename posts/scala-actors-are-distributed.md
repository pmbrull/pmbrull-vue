---
title: Actors are Distributed
published: true
description: |
    Let's have a discussion on why the Actor
    System architecture itself makes actors
    distributed, and how all around them
    is based on this characteristic.
category: Scala
ctime: 2020-01-07
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Actors are designed to be distributed. We will see an example of this by using the Akka cluster.

## The Impact of Network Communication

Let's start by looking at the impact of network communication in a distributive program compared to in-process communication:

* Data sharing only by value, as the memory is not shared anymore. The object will copied over the network by serializing - sending - deserializing, thus the object will not be the same. Therefore only immutable object can be safely shared, as otherwise the state of a variable could end up being different in two nodes at the same time.
* Lower bandwidth & Higher latency
* Partial failure, meaning for example that the message arrives but a respond never comes back.
* Data corruption

Multiple processes on the same machine are quantitatively less impacted, but qualitative the issues are the same. Distributed computing breaks assumptions made by the synchronous programming model.

## Actors are Natively Distributed

So far, we know that:

* Actor communication is asynchronous, one-way and not guaranteed to arrive.
* Actor encapsulation makes them look the same, regardless where they live, as they are isolated and independent units: This is what we call *Location Transparent*, as Actors stay hidden behind `ActorRef` and we just need that to communicate.

Actors had been designed by looking at the network model and using that in the local machine, so they are natively distributed. The effort of writing a distributed program is the same as writing a local one, as the code will not look much different.

## Actor Paths

Every actor system has an Address, forming scheme and authority of a hierarchical URI. Actor names form the URI's path elements:

```scala
val system = ActorSystem("HelloWorld")
val ref = system.actorOf(Props[Greeter], "greeter")
println(ref.path) // akka://HelloWorld/user/greeter
```

They end up forming a tree, the same as a File System, where actors are folders.

* `akka://HelloWorld/` forms the authority part, displaying the address of the whole system.
* `/user/greeter/` forms the path.

Accessing a remote address of an actor system could be done as follows: `akka.tcp://HelloWorld@10.2.4.6:6565`. If we wanted to communicate (internally) with the `"greeter"` actor from the example above, we'd be doing: `akka.tcp://HelloWorld@10.2.4.6:6565/user/greeter`. This means that an actor is indentified at least by one URI, but it could have multiple, for example if the actor was reachable by multiple protocols or IP addresses.

## ActorRef vs. ActorPath

* **ActorPath**:
    * `ActorPath` is the full name, whether the actor exists or not.
    * Actor names are unique within a parent, but can be reused.
    * `ActorPath` can only optimistically send a message.

* **ActorRef**:
    * `ActorRef` points to an actor which was started; it points to an *incarnation* of the `ActorPath`.
    * `ActorRef` can be watched
    * `ActorRef` example: `akka://HelloWorld/user/greeter#43428347`. Note that the only difference with the `ActorPath` is the UID at the end, the *incarnation*.

## Resolving an ActorPath

If we need to communicate with an actor in a given system and we don't know the `ActorRef` yet, but we are aware of where it lies in the hierarchy, we can do:

```scala
context.actorSelection(path) ! msg
```

Giving some context in an example:

```scala
import akka.actor.{Identity, ActorIdentity}
case class Resolve(path: ActorPath)
case class Resolved(path: ActorPath, ref: ActorRef)
case class NotResolved(path: ActorPath)

class Resolver extends Actor {
    def receive = {
        case Resolve(path) =>
            context.actorSelection(path) ! Identity((path, sender))
        // Actor is alive
        case ActorIdentity((path, client), Some(ref)) =>
            client ! Resolved(path, ref)
        // Actor is not alive
        case ActorIdentity((path, client), None) =>
            client ! NotResolved(path)
    }
}
```

> OBS: `Identify` is the only operation that any actor automatically handles.

The only way to know if an actor is alive is by communicating to it, and the `ActorRef` must be given to us.

## Relative Actor Paths

We can look up actors relative to another actor position in the hierarchy:

* Looking up a grand-child: `context.actorSelection("child/grandchild")`
* Looking up a sibling: `context.actorSelection("../sibling")`
* Looking up from the local root: `context.actorSelection("/user/app")`
* Broadcast using wildcards: `context.actorSelection("user/controllers/*")`

The ability to communicate to an `ActorPath` instead of an `ActorRef` is exploited by the Akka Cluster module.

## The Formation of a Cluster

A cluster is a set of nodes (actor systems) about which all members are in agreement - they know who is in the cluster and who is not. These nodes can then collaborate on a common task.

A single node can declare itself a cluster, *"join itself"*. 

A single node can join a cluster:
* a request is sent to any member and
* once all current members know about the new node it is declared part of the cluster.

Information is spread using a gossip protocol: every node will send the information to some other nodes every X seconds, regardless if that was already received or if it is reaching the audience; eventually all the nodes will be aware. The Akka Cluster does not contain any central leader / coordinator, which would mean a single point of failure.

## Starting Up a Cluster

Prerequisites:

* `"com.typesafe.akka" %% "akka-cluster" % "2.2.1"`
* configuraion enabling cluster module:
    * In `application.conf`:
    ```
    akka {
        actor {
            provider = akka.cluster.ClusterActorRefProvider
        }
    }
    ```
    * Or as `-Dakka.actor.provider=...` in the Run Configuration.

Next, we need to write the main program:

```scala
class ClusterMain extends Actor {
    val cluster = Cluster(context.system)
    cluster.subscribe(self, classOf[ClusterEvent.MemberUp])
    cluster.join(cluster.selfAddress)

    def receive = {
        case ClusterEvent.MemberUp(member) =>
            if (member.address != cluster.selfAddress) {
                // new joiner
            }
    }
}
```

This will start a single-node cluster on port 2552 as default.

Now, let's add another node. Note that only one actor can listen to port 2552, so we need to configure a new one for the workers.

This needs configuration `akka.remote.netty.tcp.port = 0`, which means picking a random port,

```scala
class ClusterWorker extends Actor {
    val cluster = Cluster(context.system)
    cluster.subscribe(self, classOf[ClusterEvent.MemberRemoved])

    // Get the main address derived by the workers' address, just change the port
    val main = cluster.selfAddress.copy(port = Some(2552))
    // Then the worker joins the main
    cluster.join(main)

    // The workers listens to check if the main address shuts down, then he also stops 
    def receive = {
        case ClusterEvent.MemberRemoved(m, _) =>
            if (m.address == main) context.stop(self)
    }
}
```

## Cluster-Aware Routing

Now, we need to make a real use of the cluster. Let's prepare a `Receptionist`, that needs to be aware of who is in the cluster and who is not.

```scala
class ClusterReceptionist extends Actor {
    val cluster = Cluster(context.system)
    // Listen to cluster members state
    cluster.subscribe(self, classOf[ClusterEvent.MemberUp]) 
    cluster.subscribe(self, classOf[ClusterEvent.MemberRemoved])

    override def postStop(): Unit = cluster.unsubscribe(self)

    def receive = awaitingMembers

    val awaitingMembers: Receive = {
        case current: ClusterEvent.CurrentClusterState =>
            val addresses = current.members.toVector map (_.addresses)
            val notMe = addresses filter (_ != cluster.selfAddress)
            if (notMe.nonEmpty) context.become(active(notMe))
        case MemberUp(member) if member.address != cluster.selfAddress =>
            context.become(active(Vector(member.address)))
        case ...
    }
}
```

What we are making is constantly listening to the cluster state. If the behavior changes, we'd still need to process those messages and respond accordingly. By listening to the number of active nodes in the cluster and spawn there the tasks, for example:

```scala
val node : Address = ...
// perform the work on a remote node
val props = Props[Controller].withDeploy(Deploy(scope = RemoteScope(node)))
val controller = context.actorOf(props, "controller")
```

We can also change some implicit values:

```scala
implicit val s = context.parent
```

With this option, all the messages sent by a given actor will look like they were sent by the parent instead.
