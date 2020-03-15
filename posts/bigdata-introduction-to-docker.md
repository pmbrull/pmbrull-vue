---
title: Introduction to Docker
published: true
description: |
    Big data architectures are usually characterized for being 
    loosely-coupled systems, meaning that one has to individually 
    build up and configure each different part of the needed resources 
    for the data ingestion, storage and processing and also their 
    connection, so that everything can run as a whole. 
category: Big Data
ctime: 2018-08-13
---

Contrary to old relational architectures, where you could deploy an already prepared system, with big data each part has to fulfill a strict need in a very specific way. That's why there is no single product capable of reaching a global solution for this newborn paradigm called big data, but rather hundreds of small pieces to achieve the major goal.

This means that the final system will be built upon different blocks that need to correctly communicate with each other and with the cluster. For example: A process listening to an event that triggers a function that reads stored data and performs a given computation that has to be received by yet another part of the system. A problem here arises by the developer's needs of changing and improving the final product, which usually means interacting with just a part of the whole process and, mainly, avoiding this updates to have side effects on all the grids.

So, how to achieve this desired degree of block independence in a fully connected and dependent environment? The answer is **Docker**. 

As defined by the creator's team:

> The key benefit of Docker is that it allows users to **package an application with all of its dependencies into a standardized unit** for software development.

Which essentially means that now, the big data architect can work with smaller construction blocks of fully functioning parts of the application that have no requirements on each other more than the final workflow. This way, we can update our system by replacing the desired container with the confidence that we will not break anything else during the process.

For getting started with Docker, please visit the official [link](https://docker-curriculum.com).
