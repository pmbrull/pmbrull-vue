---
title: AZ-400 - Develop SRE strategy III
published: true
description: |
  In this module, MS gives us a refresh on cloud elasticity.
  Scaling allows us to fine-tune our resources with a high
  level of flexibility, ensuring top tier performance
  for a varying computation loads, while spending only
  for what we need at each point in time.
category: Cloud
ctime: 2020-09-29
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/cmu-cloud-elasticity/).

As we've already seen some of these contents, we will directly jump here into what might be interesting to refresh or get more information about: Load Balancing & Serverless computing.

# Scale your cloud resources with elasticity

Learning objectives:
* Describe the importance of load balancing in cloud applications and enumerate various methods to achieve it
* List the primary benefits of serverless computing and explain the concept of serverless functions

## Load balancing

There are two requirements that justify load balancing:
1. Throughput is improved by parallel processing
2. Load-balanced resources yield higher availability

Historically, the simplest strategy employed to dispatch IP addresses is to use a round-robin queue, where after each DNS response, the list of addresses is permuted. Modern load balancing often refers to the use of a dedicated instance (or a pair of instances) to dispatch incoming requests to back-end servers based on a  distribution strategy.

When sending back the response to the client, there are two basic strategies:
* **Proxying**: Where the load-balancer receives the response from the back end and passes it to the client, as a standard web proxy.
* **TCP Handoff**: Where the TCP connection to the client is passed on to the back-end, so the server responds directly to the client.

### Benefits of load balancing

One of the benefits of load balancing is that it helps mask failures in a system, as if an instance fails, the LB can redirect traffic. This means that to avoid single points of failure, LBs are often deployed in pairs in different AZs.

More importantly, load balancing improves responsiveness by distributing workloads across several compute resources in the cloud. However, this means that monitoring needs to be granted so that the LB knows when some services become unhealthy to redirect their traffic.

In addition to distributing requests among back-end servers, load balancers often employ mechanisms to reduce the load on the servers and improve overall throughput. Some of those mechanisms include:
* **SSL offload**: As HTTPS traffic equals to poorer performance due to encryption, SSL is used to connect to the LB, while just HTTP is used to reach the back-end.
* **TCP buffering**: A strategy to offload clients with slow connections to the load balancer to relieve servers that are serving responses to these clients.
* **Caching**: The LB can maintain a cache for the most popular requests
* **Traffic shaping**: Delay or reprioritize the flow of packets to optimize traffic for the server configuration.

There are different load balancing techniques:

* **Equitable dispatching**: Simple round-robin algorithm to distribute traffic evenly between all nodes. It does not take into account each node utilization.
* **Hash-based distribution**: To ensure that the same user is always redirected to the same server, allowing for easier treatment of session data (instead of using external services as Redis).
* **Other** strategies might take into consideration server health & usage to not just divide requests, but to even the workload.


## Serverless computing

Here we just want some process to be executed without worrying about where the code is stored and how and where it's executed. Serverless functions are frequently used to carry out stand-alone tasks such as nightly backups and billing. They are also used to connect other cloud services and compose rich solutions by using cloud services as building blocks.

Serverless Computing has three main benefits:

* **Lower computing costs**: as they support *consumption pricing*, where we're billed just by the time it takes to execute the code, rather than having monthly bills by IaaS and PaaS resources.
* **Automatic scalability**: transparently and automatically scaling out to meet increased demand and scaling in when demand subsides without any required configuration other than enabling this option.
* **Reduced administrative costs**: as we just need to focus on executing code and workflows.

However, there are also some drawbacks:

* Some function runtimes impose a limit on the amount of time that a function is allowed to execute.
* Some function runtimes don't guarantee that a function will execute immediately unless you are willing to pay more for that to happen.
* Serverless functions are generally stateless.

When talking about serverless function in Azure we have Azure Functions, but we also can think of Logic Apps as Serverless Workflows and even a Serverless Db version of Azure SQL.

A scenario where we should not use serverless computing would be a web site that experiences varying loads at different times of day, with occasional 10X spikes in traffic, as Serverless solutions are generally used for tasks that run frequently but not constantly.
