---
title: MapReduce II
published: true
description: |
    We have seen what Map Reduce is and a high level
    view of how it works. After explaining the basics 
    of MapReduce functionalities, let's dive deeper into it.
category: Big Data
ctime: 2018-06-12
---

## Architecture

The decision to take here is the **number of mappers** (M) and the **number of reducers** (N) keeping in mind the following:

* There is one Master, to whom the job is submitted, dedicated to scheduling the system, and many workers.

* Jobs are decomposed into smaller tasks, which are assigned to the available workers by the Master. This means $O(M+R)$ scheduling decisions.

* In order to compensate for the scheduling time, mappers should take more than a minute to execute its tasks.

* Try to benefit from locality: if we have a node containing data to be used, apply there the functions rather than moving the data (query shipping vs. data shipping).

* As computation comes close to completion, tasks that are yet to be finished are reassigned to multiple workers (using chunk's replicas) and we keep the first obtained result. This way we have a workaround to device's computational missbehaviour.

* The Master is the brain of the network: it keeps track of all Map and Reduce tasks, worker state (idle, ongoing or completed) and the identity of the worker machines (to benefit from locality).

* Also, the Master has the size and location of intermediate files produced by each map task: Stores $O(M * R)$ states in memory.

## Fault-tolerance mechanisms

Same with HDFS, Master uses a periodic ping (heartbeat) to check on all the workers. Also, task rescheduling is a safe measure for worker failure. As for the Master, there is a record of checkpoints of the data structure.

## Algorithm

### Data Load

Input data is partitioned into blocks and replicated accross the network. This, however, is delegated to the HDFS or any other storage system.

<img src="../../images/posts/bigdata/MRalgo1.png" class="w-72 my-4 justify-center m-auto">

### Map Phase I

* Each map subplan reads a subset of blocks called **split** and divides it into records. We try to perform query shipping, so if data is distributed properly accross the network, we can also distribute the workers to try to read data locally as much as possible.

* Map is executed on each record and kept in memory divided into **spills**. 

> Spilling happens when mappers run out of memory and have to emit data to files, known as spilled files. At least, spilling happens once when the mapper is finished.

<img src="../../images/posts/bigdata/MRalgo2.png" class="h-56 my-4 justify-center m-auto">

### Map Phase II

* Partition spills per number of reducers using a *hash* function over the new key.

* Each partition is sorted independently. Then, if a **combine** function is defined, it is locally executed after sorting.

> OBS: If the reduce function is commutative and associative, we can define a combiner to do the same as the recuder. For example, if the reducer task is to perform the minimum, the result of performing the minimum to a subset of the data and then to the rest does not change. This would not hold, however, for operations like the mean.

* Store the spill partitions into disk: Massive writting!

> OBS: if we define a combiner, then we have to store and ship less data to the reducer.

<img src="../../images/posts/bigdata/MRalgo3.png" class="h-56 my-4 justify-center m-auto">

### Map Phase III

* Spill partitions are merged, and each merge is sorted independently in memory.

* Results are stored again (without partition).

<img src="../../images/posts/bigdata/MRalgo4.png" class="h-56 my-4 justify-center m-auto">

### Shuffle and Reduce

* *Data shipping* from mappers to reducers.
* **Shuffling**: merge and sort the mappers output while data is arriving to the reducer.
* Execute reduce function on the array of values grouped by key.
* Store results: Third writting of the process.


<img src="../../images/posts/bigdata/MRalgo5.png" class="h-56 my-4 justify-center m-auto">

## Bottlenecks

Data shipping and shuffling in the reducers is a major bottleneck in the whole procedure. Although data can start shipping before mappers are totally finished, all mappers need to finish before reduce can be executed: Huge synchronization barriers.

Also, if chaining multiple MapReduce, all reducers need ot finish before starting the new mappers.
