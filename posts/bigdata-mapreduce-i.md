---
title: MapReduce I
published: true
description: |
    So what is exacty Map Reduce? How big data analytics worked
    before we could all use complex frameworks such as Spark?
    In this post we'll cover the origins of modern tools.
category: Big Data
ctime: 2018-06-11
---

We saw that MapReduce is one of the **Hadoop** modules. It provides an analytics environment for programmers to use (it does not gives analytics per se), and while it is related to HDFS, they do not require each other, as there are different ways to access and analyze HDFS data. The prime idea behind MapReduce is *Divide et Impera*, as high perfomance is mainly achieved by parallelizing the algorithms. We want our query to being able to attack the different chunks of data independently (and with no consequence) and then group the results to obtain the final evaluation.


## Sequential Access

MapReduce benefits from the Sequential Access' perfomance and gets data chunk after chunk and  further boosting speed by means of *caching* and *pre-fetching* data. This means that while it is perfoming operations on one chunk, it is already loading the next and saving its contents in memory so it does not need to wait when an operation finishes.

## Operating with data

Recall how we presented a way of organizing data by selecting a **key** that linked an observation to some **values** with no explicit schema on them. MapReduce follows this idea with some changes: keys do not need to be unique and we will define them **dynamically** depending on our needs.

## Map & Reduce basics

Both Map and Reduce are user defined functions that perform some action on the data:

<img src="../../images/posts/bigdata/mapreducebasics.png" class="w-84 my-4 justify-center m-auto">

Where we are processing pairs $\\{key, value\\}$,

$$ map(key \: \textit{k}, value \: \nu) \mapsto [ (i k_1, i\nu_1), \ldots, (ik_n, i\nu_n)  ] , $$
$$ reduce(key \: ik, vset \: i\nu s) \mapsto [ o\nu_1, \ldots o\nu_r ], $$

where the **map** can generate one, zero or multiple outputs with different keys, and the **reduce** operates on all values belonging to the same key. 

> OBS: while map output MUST be in form of pairs $\\{key, value\\}$ so that the reduce can act, reduce is free to generate keys or not. However, as we can chain multiple MapReduce operations, if a reduce is acting before the next map, keys will be needed.


The whole process comprises

1. Obtaining data from node.
2. Applying the map function.
3. Merge-sorting data by key.
4. Performing the reduce operation.
5. Writting results on disk.

## Merge-Sort: Shuffling

It's a recursive algorithm that splits data into $n$ parts that can fit in memory and order each of those parts. Then, partitions get compared by pairs and *merged*, ending up with $n/2$ ordered partitions and so on (the gif in [wikipedia](https://en.wikipedia.org/wiki/Merge_sort) is very illustrative). 

Using this kind of sorting allows for easy parallelization, so data can be treated separatedly by the **map workers**, then results sorted by key and accessed by the **reduce workers**, that can perform *sequential access* on elements with same key as they end up all together.

> Note that after the Map phase, data is written to local disk sorted, Reducer reads that data remotely and after the Reduce phase, we are writting to disk again.

## Example

Suppose we have the following sales data

<img src="../../images/posts/bigdata/mapreducedata.png" class="w-84 my-4 justify-center m-auto">

It is important to keep in mind that keys are not fixed, and there is not *a better key for the data*, it **depends on our analytical needs**.

If, for example, I'm interested in checking whether a customer is a good customer (he/she spends a lot of money), I will assign as key the UserID on the map and sum the spendings on the reduce:

<img src="../../images/posts/bigdata/reduce.png" class="w-84 my-4 justify-center m-auto">

However, if I want to know how many items I have sold in each department:

<img src="../../images/posts/bigdata/reduce2.png" class="w-84 my-4 justify-center m-auto">

I need to specify the department as key and count the length of the array in the reduce.

## Benefits

1. Progamming simple model.
2. Does not assume any data structure, we are free to play around.
3. Scalable: distribution and parallelism has no effect in the code. 
4. Tries to execute the map localy (query shipping vs. data shipping).
5. Balances worload (but never further than what the built HDFS allows for).
6. Provides fault tolerance: If a chunk of data fails in the execution, we just need to execute that chunk again, the other chunks are saved in disk.
