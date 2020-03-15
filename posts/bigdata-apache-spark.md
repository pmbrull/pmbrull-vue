---
title: Apache Spark
published: true
description: |
    In this post we are going to talk about Apache Spark,
    starting by busting some myths or misconceptions.
category: Big Data
ctime: 2018-06-13
---

Let's start by describing some of its major characteristics:

* Spark tries to process *as much as possible* in memory, which does not mean that Spark uses in-memory processing. Things would just blow up considering it was born to be used in Big Data.
* It inherits MapReduce's **shuffle**, but tries to pipeline data transformations (chaining multiple maps and reduces) instead of writting each time to disk, therefore improving perfomance. However, data must go to disk some times in order to have a robust system against failure.
* Spark is just an evolved version of MapReduce, but you can achieve the same final results with one framework or the other (not talking about perfomance, which is already mentioned). What changes is that Spark allows for a more friendly environment and gives further information about transformations (so there can be internal optimizer mechanisms) instead of working with map and reduce as total black boxes.
* Spark DOES NOT DISTRIBUTE! It can't distribute processing further than what the underlying file system permits, although it brings the ability to easily distribute on a healthy cluster.

## From MapReduce to Spark

Following the common thread in these series, what needs got raised by MapReduce that Spark tries to tackle?

1. A framework capable of chaining MapReduce jobs in a more optimal way: Recall the synchronization barriers showed in last [post](https://pmbrull.dev/post/bigdata-mapreduce-ii). With an environment allowing pipelining of data transformations, we can avoid some of them.
2. Reuse operations with **data persistence**. In MapReduce, processes were independent from each other. With Spark we are trying to use previous operations to improve perfomance, for example to just read from disk once and run different tasks with that data as starting point, instead of accessing to disk multiple times.  
3. Reflect the friendlier environment also in work distribution and fault tolerance, raising the abstraction to the user for both tasks.
4. Unify an execution model with the introduction of RDDs (*Resilient Distributed Datasets*), which allow for different structures on them, like tables or graphs.
5. Improve the limited scope of the existing programming model by adding different APIs, ending up with three possible programming languages: Scala, Java and Python.
6. Improve resource sharing: in MapReduce resources are defined statically, while in Spark, the *Driver* notifies **YARN** a more accurate approximation of required resources.

## Resilient Distributed Datasets

Getting into the name:

* Resilient: fault-tolerant and easy to recover failed partitions.
* Distributed: as data is located on multiple nodes.

Quoting Matei Zaharia, author of [Learning Spark](http://shop.oreilly.com/product/0636920028512.do) and one of the fathers of Spark (and one of the sources of info. of the post), RDDs are

> Unified abstraction for cluster computing, consisting in a read-only, partitioned collection of records. They can only be created through deterministic operations on either (1) data in stable storage or (2) other RDDs.

This means that modifying an RDD ends up with another RDD: RDDs are **immutable** collections of data! This allows for easy data sharing among multiple processes and for caching intermediate operations to be used again without concerns, as concurrency is easier to achieve than when reading and writting onto the same collection of data with several jobs at the same time.

## Contributions

* Low latency, as it performs in-memory storage when possible. Allows for executing tasks locally where data resides.
* Rich set of **coarse-grained operators**: transformations are applied to the whole RDD and generate a new one. Can't modify single tuples inplace.
* Control over data partitioning: adding partitions or coalescing data into fewer (in the same worker!).

## Architecture

Based on Virtual Machines that can be easily created and destroyed, they work as **containers** that execute the different tasks. In distributed mode, Spark follows a similar architecture to Hadoop: Master - Slave.

<img src="../../images/posts/bigdata/spark1.png" class="w-56 my-4 justify-center m-auto">


* One **Driver** coordinating and communicating with several workers called **executors**, each running on separate Java processes.
* The whole pack driver - executors is called a **Spark application**.
* The Spark application is launched on a machine network with an external service: a **cluster manager**. In the figure above, YARN. However, it also works with Apache Mesos or with Spark's built-in cluster manager *Standalone*.

### Driver

Process where the main() method of the program runs. It runs the user code that creates a **SparkContext**, creates RDDs and performs transformations and actions. Also:

* Converts the user program into smaller tasks: Any Spark program creates a **logical DAG** (directed acyclic graph) of the program's workflow: *logical plan*. When it runs, the graph is converted into a *physical execution plan*. As we mentioned, Spark contains an internal optimizer, which takes action here, for example pipelining map transformations together. Then, converts the execution graph into a set of **stages**, each one consisting in multiple **tasks** that are sent to the cluster.

* When converting from logical to physical plan, Spark tries to solve together *narrow dependencies*: where we can pipeline transformations tuple by tuple,  and then, *wide dependencies*: which need to send data to different workers for example when using ```groupByKey()```, where all elements with the same key need to be in the same machine.

* Schedules tasks on the executors in an appropiate location: based on data placement. Also, as tasks may trigger data caching, the Driver also tracks the location of cached data to schedule future tasks that may require it.

### Executors

* Worker processes running the individual tasks in a given Spark job and returning results to the Driver.

* Provide in-memory storage for cached RDDs, using a service called *Block Manager* that lives within each executor. As this cached data lives in the executor, tasks can run alongsive them (query shipping vs data shipping).


### Summary 

<img src="../../images/posts/bigdata/spark2.png" class="h-84 my-4 justify-center m-auto">
