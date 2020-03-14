---
title: Actors are Distributed II
published: true
description: |
    How do actors share their state within a cluster?
    How is this used to schedule the flow of our processes?
category: Scala
ctime: 2020-01-08
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

Now it's time to deepen a bit the knowledge from the last part:

When a cluster node wants to join the cluster, it enters in the **joining** state. Then, when all members of the cluster have seen all of the newjoiners, then the node becomes **up**.

To shut down the cluster, the cluster main shuts itself down declaring that it wants to leave the cluster. This makes the cluster main to enter the **leaving** state. Note that this transition can be done by any node (from up to leaving) without any interaction from the leader. Therefore, this transition is also propagated to all members of the cluster. Finally, the node is moved to the **exiting** state. This is the signal for all cluster members to remove the leaving node from their membership list.

> OBS: The leader is just selected by a matter of internal node ordering, it has nothing to do with any extra privileges or functionalities.

To sum up, the **cluster main** transitions throughout the following states.

`JOINING -> UP -> LEAVING -> EXITING -> REMOVED`

## Cluster needs Failure Detection

Recall how we defined a cluster as a set of nodes about which all members are in agreement - they know who is in the cluster and who is not.

* This consensus is unattainable if some members are unreachable.
* Every node is monitored using heartbeats from several others.
* A node unreachable from one other is considered unreachable for all.
* Nodes can be removed to restore the cluster consensus.

However, having all nodes monitoring the rest could end up making quite a lot of communication pairs in a rather big cluster, so it is not practical. Therefore, a technied is applied where only neighbors monitor each other.

Now, we need to define how to find neighbors. As all members are aware of the rest and their addresses can be sorted, we can set up a proximity rule, where each node monitors $n$ other nodes.

Let's suppose that there are 3 nodes monitoring a failing node $x$. If each heartbeat is sent in a 5 seconds interval, then within 5 seconds all 3 nodes will be aware of the failure, although we cannot say that just one flunky heartbeat means that a node is down, so it's better to set three or four consecutive failures. Then, once a node detects the failure, it will *gossip* this information randomly to the rest of the members. As we have already discussed, everyone will eventually be aware.

> OBS: The more nodes monitoring a node, the fastest we can detect a failure.

Therefore, we need to add a flag to the states described above: the **unreachable** flag. From any state, any node can become unreachable and if it did not really crash, it can become reachable again.

Finally, in order to create a new cluster with a consistent state, the node should communicate that is leaving. However, as it cannot, the state state becomes **down** - from unreachable. We need to define a policy for which a unreachability period moves a node to the **down** state. Among all of the remaining cluster nodes, the leader removes the node.

Then, the history talled by the Cluster Worker would be:

* It was joining
* Saw the main joining and then up
* Once the main program stopped, the worker detected the main as being unreachable.
* Then, we could set an option in the worker `autodown`: as soon as a node becomes unreachable, this transition happens automatically.

In terms of listening to events, the cluster main is maybe more interested in the *MemberUp* transition - from joining to up - so that it can give them work. A worker, on the other side, will be listening more to the *MemberRemoved* transition - from down or exiting to removed.

## Cluster and DeatWatch

Actors on nodes which are removed from the cluster must be dead.

* Allows clean-up of remote-deployed child actors.
* Decision must be taken consistently within the cluster.
* Once `Terminated` was delivered, the actor cannot come back. If a node was removed from the cluster it has to be completely restarted before he can join again and also all its actors still on it. We cannot break the `Terminated` message contract.

Lifecycle monitoring is important for distributed fail-over:

* Delivery of `Terminated` is guaranteed (contrary to any other akka message!), and
* This is only possible because it can be synthesized when needed, meaning that it even reaches the audience when the sender is not able to send it anymore.

Then, instead of having the workers listening to the `MemberDown` event, it should rather use `DeatWatch`:

```scala
val cluster = Cluster(context.system)
cluster.subscribe(self, classOf[ClusterEvent.MemberUp])
// get the main node, always using port 2552
val main = cluster.selfAddress.copy(port = Some(2552))
cluster.join(main)

def receive = {
    case ClusterEvent.MemberUp(member) =>
        if (member.address == main) {
            // the receptionist always exists in our example, so we
            // can retrieve its ActorRef from the main address
            // and using the hierarchy path
            val path = RootActorPath(main) / "user" / "app" / "receptionist"
            // resolve the path with actorSelection and send an identify
            // msg with some random tag
            context.actorSelection(path) ! Identify(42)
        }
    // if we cannot resolve the receptionist something must be wrong, let's stop
    case ActorIdentity("42", None) => context.stop(self)
    // we watch the receptionist otherwise
    case ActorIdentity("42" Some(ref)) => context.watch(ref)
    // once the receptionist is down, we stop the program
    case Terminated(_) => context.stop(self)
}
```
