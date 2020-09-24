---
title: AZ-400 - Develop an Instrumentation Strategy IV
published: true
description: |
  Azure has some guidings that aim to help us design high quality
  projects and architectures: Azure Well-Architected framework.
  In this post, we are going to review one of its pillars: 
  performance efficiency.  
category: Cloud
ctime: 2020-09-19
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/azure-well-architected-performance-efficiency/). It is important to keep in mind that **performance efficiency** is just one aspect of the [Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/), consisting of Cost Optimization, Operational Excellence, Performance Efficiency, Reliability and Security.

So in this review we are going to visit *just one* of the goals one should keep in mind when designing software in Azure.

# Microsoft Azure Well-Architected Framework - Performance efficiency

Learning objectives:
* Scale your capacity based on workload.
* Optimize network performance.
* Optimize storage and database performance.
* Improve application performance by identifying bottlenecks.

## Use scaling up and scaling out in your architecture

On premises applications are useful in terms of security and regulation compliance and give the IT team huge control on its infrastructure (hand in hand by its time investment!). However, what is hard to achieve is flexibility. How can we plan, reducing possible errors, the user flow, metal usage, possible new incoming projects...?

On premises are then tied to getting more infrastructure power based on a forecasting that can be more or less accurate. However, this flexibility in terms of compute capacity is much easier to achieve in a cloud environment, and here terms as scaling can become part of daily work.

**Scaling** is the process of managing your resources to help your application meet a set of performance requirements, where can increase / decrease our computing power base on a flowing and changing needs. The idea is that we want our users to have top notch experience while spending money in the most efficient way.
  - **Scaling up** is the process where you increase the capacity of a given instance (memory, CPU...). **Scaling down** refers to decrease these capacities.
    - For VMs, we have different sizes; azure SQL can be scaled based on DTUs (database transaction units - abstraction of underlying resources) or vCPUs; Azure App Services have different plans that can be changed from one tier to another.
  - **Scaling out** is then the process of adding extra instances to handle workload. **Scaling in** means reducing the number of working instances.
    - For VMs, we can play around with scale sets that allow us to handle identical load-balanced VMs based on schedules or metrics; Azure SQL has *sharding* to distribute data across independent dbs; App Service plan is a virtual web server farm that hosts the application, so we can manage underlying VMs as with scale sets.

Moreover, for some of the services we can configure **Autoscale** to automatically handle this scaling out by setting a min / max number of instances based on specific metrics as CPU or memory or schedule.

Some considerations when scaling out are the startup time of our application, as it needs to start it the new instances. When scaling in, we need to take into account the state of the removed instance, so it is better to externalize it to another service so that users do not lose track of their sessions.

### Throttling

This is an interesting technique we can use to limit the number of requests from a source. This is most often used for application that serve an API, where we can then limit the number of requests per user & time so that we are certain that we can reach the overall system SLA. This means that we can safeguard performance limits by putting some thresholds at application level.

### Serverless

Serverless computing provides an execution environment where the underlying infrastructure is completely abstracted from us. This means that we do not need to manage it and thus, the scaling is done automatically, while being billed only by the resources we use. Some examples are Azure Functions, Container Instances and Logic Apps.

### Containers

Containers are virtualizations at OS level that serve our applications. This means that it is possible to host multiple containers in the same OS, making them a great choice for being easily created, scaled out and stopped. Note that this would also allow to run different applications in the same machine!

Azure offers some services that are an improvement of running containers directly on VMs:

- **Azure Kubernetes Service (AKS)**: Here we can abstract the hosting of the containers, setting a number of nodes / workers (VMs) that can be easily scaled with the Azure CLI or even with Autoscaler. Also, at k8s level, one can use the Horizontal Pod Scaler to scale the number of instances of each container that are deployed.
- **Azure Container Instances**: Serverless offering that allows us to create and execute containers on demand. We can use Virtual Kubelet to connect Azure Container Instances into your Kubernetes environment, which includes AKS.

In both cases we are only charged for the resources used.

## Optimize network performance

Network latency is the time that it takes for data to travel between a source to a destination across a network. Azure Cloud is designed to be scalable, so resources might not even be in the same datacenter. This means that eventhough there is high speed fiber, we cannot go beyond the speed of light, meaning that each required round trip of information equals to a latency tax we need to pay.

### Latency between Azure resources

Some approaches we can follow to reduce this latency in resource vs. resource fashion are:

* Create read replicas in different regions (although writes will still be penalized).
* Sync your data between regions with Azure SQL Data Sync.
* Use a globally distributed database such as Azure Cosmos DB. This database allows both reads and writes to occur regardless of location.
* Use caching technology, such as Azure Cache for Redis, to minimize high-latency calls to remote databases for frequently accessed data.

### Latency between users and Azure resources

However, we also need to reduce the latency of resource vs. user.

#### Use a DNS load balancer for endpoint path optimization

* Traffic Manager is a DNS-based load balancer that you can use to distribute traffic within and across Azure regions. This routing can happen based on priority instances, some defined weights on instances, performance (routing to the closest front-end instance) or at geographical level.

>OBS: It's important to note that this load balancing of the Traffic Manager is only handled via DNS. No inline load balancing or caching is happening here. Traffic Manager simply returns the DNS name of the closest front end to the user.

#### Use a CDN to cache content close to users

Static content can be delivered to users faster by using a content delivery network (CDN), such as Azure Content Delivery Network. The idea is to put the content closer to the user.

However, it is tricky to use CDN for dynamic content, as it can get outdated. This expiration date can be handled via time to live (TTL) setting.

One way to handle cached content is with a feature called dynamic site acceleration, which can increase performance of webpages with dynamic content. Dynamic site acceleration can also provide a low-latency path to additional services in your solution. An example is an API endpoint.

#### Use ExpressRoute for connectivity from on-premises to Azure

ExpressRoute is a private, dedicated connection between your network and Azure. It gives you guaranteed performance and ensures that your users have the best path to all of your Azure resources.

## Optimize storage performance

### Optimize virtual machine storage performance

Depending on our application, we might need to optimize the latency of reads / writes or how to handle large input / output operations per second (IOPS). There are four options of disks for our VMs:

* **Local SSD storage**: Each virtual machine has a **temporary** disk that's backed by **local** SSD storage. Note the word temporary: data can be lost during maintenance or redeployment, but performance is high.
* **Standard storage HDD**: A dev/test workload where guaranteed performance isn't required is a great use case for this disk type.
* **Standard storage SSD**: Low latency, but with lower levels of throughput. A non-production web server is a good use case for this disk type.
* **Premium storage SSD**: Greatest reliability, demand consistent low latency, or need high levels of throughput and IOPS. Recommended for all prod workloads.

> OBS: Disks can be striped by using a striping technology like Storage Spaces on Windows or mdadm on Linux. Striping increases the throughput and IOPS by spreading disk activity across multiple disks. You can use disk striping to push the limits of performance for disks. Striping is often seen in high-performance database systems and other systems with intensive storage requirements.

### Optimize storage performance for your application

#### Caching

Here we want to deliver faster frequently access data or temp data such as user session. By caching we store that in memory, so there is no need to retrieve that from storage each time. An example could be Azure Cache for Redis.

#### Polyglot persistence

It is the usage of different data storage technologies to handle your storage requirements. This also means that we will be using different data stores that are designed to fulfill slightly different use cases and therefore, accesses or latency in responses might be different.

This rises another challenge, and it is data consistency. As it would be really hard to keep locking and serializing data we can approach this with **eventual consistency**: replica data stores eventually converge if there are no further writes. This strategy enables for higher scale as there is low latency for reads and writes.

## Identify performance bottlenecks in your application

When talking about performance, there is really no end to how much time and other resources you can invest. Therefore, when designing an app, it is important to write down not only functional requirements, but also *nonfunctional* requirements that can be directly correlated to performance, e.g., How fast a transaction must return a result.

By adding some specific goals, it is easier to define our approach to performance optimization without incurring into overexpenses nor non-necessary results.

### Performance monitoring options in Azure

Monitoring is the act of collecting and analyzing data to determine the performance, health, and availability of your business application and associated resources. We can define those at both infrastructure and application layer.

#### Azure Monitor

Which centralizes infrastructure monitoring. Azure Monitor maximizes the availability and performance of your applications by delivering a comprehensive solution for collecting, analyzing, and acting on telemetry from your cloud and on-premises environments.

Based on input data from the application, OS, Azure resources and even from the subscription and tenant, Azure Monitor feeds Logs and Metrics datastores that can then be exploited.

Azure Monitor is the place to start for all your resource metric insights gathered in near real time, and many resources start feeding data automatically after being deployed.

#### Log Analytics

This service allows us to query logs from all of our different sources, which gives a 360 view of our applications and infrastructure, and is a great approach to troubleshoot performance issues.

### Application performance management

An APM solution helps to track down low-level application performance and behavior by extracting telemetry from the different events happening in our application (page load times, exceptions, and even custom metrics). This is given by Azure with Application Insights, which presents a package that can be installed in our app and set up in the portal.

We can then setup scheduled tests and even custom metrics to be sent. Application Insights stores its data in a common repository, and metrics are shared with Azure Monitor and can even be used to set alerts, dashboards and be queried with Log Analytics. It is used to monitor availability, performance, and the use of web applications.
