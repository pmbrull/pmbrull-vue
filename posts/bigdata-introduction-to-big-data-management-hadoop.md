---
title: Introduction to Big Data Management - Hadoop
published: true
description: |
    All the underlying theory behind Big Data tools
    is not easy to grasp. Through a series of posts
    I'll try to organize my ideas around the topic
    and hopefully help someone out there.
category: Big Data
ctime: 2018-06-09
---

With roughly a couple months left, I have nearly finished the courses of the master's degree. A big part of it was a pace from zero-to-hero in **Distributed Data Management and Processing**, and today I got asked some deep understanding questions in a serious environment. And what a surprise: could not really answer. It was pretty naive of me thinking that I could retain ALL knowledge from late night classes I had 3 months ago while also working 40h per week and handing in weekly homework. 

Thus, I decided to sit down and tidy up all the concepts floating in my brain and notebook rather than re-scheduling it as I've been doing since day 0.

Starting from the beginning, we have **Hadoop**:

<img src="../../images/posts/bigdata/hadoop_logo.jpg" class="w-64 my-4 justify-center m-auto">

What helps me organize and relate all the different concepts involved in *Big Data* is the thought that **great ideas come from great necessities**. So what was Hadoop trying to achieve when it first came out? With data being an ever growing resource, the objective was being capable of analyzing information that could not be physically stored in a single device. Quoting the Apache Foundation:

> The Apache Hadoop software library is a framework that allows for the distributed processing of large data sets across clusters of computers using simple programming models.


Following this idea, Hadoop is an ecosystem (*not* a single product) that complements Data Warehouses rather than replacing them, bringing together the following modules:

## **YARN**

The manager of the whole system resources and the job scheduler.

## **HDFS**

Hadoop Distributed File System (remarking File System, **not** a DB), designed to handle large collections of data which do not need to hold any kind of fixed schema on an underlying structure of linked machines. Data will be written once, but accessed many times by different users and replicated accross the nodes to ensure failure recovery. This allows for systems that are easily scalable, and when having big enough amounts of data, it will be uniformly distributed. How does this work?

* A **Master Node** that receives client connections and maintains the description of the whole system (meaning that it knows in which devices - plural -  is located a specific file). When inserting a new file, it gets partitioned into the so-called **chunks** (by default: 128MB) and these chunks get replicated and sent randomly to different data nodes.

* Many servers that receive file chunks and store them.

HDFS was designed to ensure both availability and scalability, as we assume that in a huge server network nodes can - and will - fail. That is why data gets replicated, so that a chunk will always be available in multiple locations. Also, the Master Node monitors the whole system with a *heartbeat* message to all data nodes. If there is no answer, it means that the node is down and the Master will redirect a client looking for a specific chunk to any of its replicas. This allows for fast detection of failures. 

However, not only data nodes are protected. There is a specific recovery protocol to protect the master, consisting in a mirror image that can easily replace him. Regarding scalability there is a **client cache**, so that it also knows where the chunks he accesses come from in case he needs to access again, do not need to ask the master the same information.

Putting all together:

<img src="../../images/posts/bigdata/HDFS_diagram.png" class="h-96 my-4 justify-center m-auto">

## **Map Reduce**

Named after the two operations lying behind: map and reduce, this module is in charge of analyzing the system data.

## **Hadoop Common**

The common utilities that support all the Hadoop modules together.

In next posts, we will make an in-depth analysis of how Map Reduce works and its perfomance!
