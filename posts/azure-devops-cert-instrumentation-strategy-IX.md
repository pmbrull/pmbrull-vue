---
title: AZ-400 - Develop an Instrumentation Strategy IX
published: true
description: |
  After diving deep into both infrastructure and app
  monitoring and log & metrics collection with Azure Monitor
  and App Insights, let's review why monitoring the resources
  is crucial and discuss new concepts such as
  everyday remediation.  
category: Cloud
ctime: 2020-09-24
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/cmu-monitor-cloud-resources/).

## Monitor cloud resources

We've already been checking what Azure offers us to monitor our platform, infrastructure and applications. This learning doc might be a bit more generic than that, but it is always interesting to have a wider look at key concepts.

## Common APM Performance Metrics

* Requests (or queries) per minute
* Response times - often expressed as medians
* Idle connections - where the server is awaiting requests from the client
* Service availability - The percentage of a given interval when a service or application appeared to be responsive to requests
* CPU utilization - as a percentage
* Error rate - which might vary depending on the platform, but it is also useful to track exceptions used to catch errors in the code.
* Garbage collector invocations - This metric is especially important for a language interpreter such as Java, whose code uses data objects in memory, but then relies upon a "garbage collector" to free that memory when those objects are released.
* App load - quantity of requests handled by an application

However, there are some other important metrics that can be considered **complex metrics**, as they are the combination of 1+ directly measurable conditions as the ones described above.

> OBS: Utilization and saturation are too often confused with one another. In all forms of engineering, including software, they are distinct. An underutilized resource is one that can be clearly measured as performing no work for too long a period. That same resource may become over-saturated as a direct result; the backlog of requests may stack up in its queue.

* **Request saturation point**: rate at which requests are received, as well as their rate of fulfillment. If app load increases, responses can get slower until reaching a point that it is not acceptable for the client.
* **Application Performance Index (Apdex)**: Performance per se might be a tricky subject, as it can be seen as what the user *feels*. This index gives us three toleration zones on a scale between 0 and 100: "Satisfied," "Tolerating," and "Frustrated." The apdex formula based on an $n$ number of runs of one application is:

$$Apdex = \frac{\text{#Satisfied} + 0.5 * \text{#Tolerating}}{n}$$

## Correlations

However, while we might be able to track countless events & metrics, troubleshooting an error and understanding a system's behavior can only be done by correlations of multiple data points.

### The USE method

Utilization + Saturation + Errors symbolizes the most common correlation applied to evaluating the status of a solution.

* **Utilization** - % representing the time over a given interval a resource is busy rather than idle.
* **Saturation** - A determination of how many requests the resource processed over the same interval, often coupled with a measurement of the size of the queue of unprocessed requests during that time.
* **Errors** - The number of incidents of unhandled exceptions and unfulfilled requests during the same period.

However, there is not a golden formula that gives us the best relationship between these factors.

### The RED Method

Derived from USE, focusing on microservices environments, where saturation rates are harder to determine. Instead, it focused on factors related to responsiveness:

* **Rate** - The number of requests a service processes over a given interval (usually one second)
* **Errors** - The number of failed requests in that same interval
* **Duration** - The average time a service consumes in responding to a request before rendering a response

Again, there's no standard formula or ratio relating these three factors.

## Remediation planning

APM (Application Performance Management) platforms helps us to identify problems, but we still need to solve them. **Remediation planning** is the process by which you define how problems uncovered by monitoring are mitigated and resolved. This can be divided into:
* **Responsive remediation**: triggered by APM alarms.
* **Proactive remediation**: Let's not wait for something to fail and instead try to continually improve our systems.

### Problem Ticketing

In order to distribute issues and oversee tasks for ops departments, they usually use ticketing platforms. However, this might cause a pivot in the objectives to a mindset focused on "fixing issues" rather than stablish goals and objectives.

## Key Performance Indicators

Individual metrics typically geared to trigger warnings or alerts when their values fall above or below predetermined levels. However, some APM platforms recommend KPIs that actually are nothing but direct metrics. So when linking business, we should expand the definition to: a KPI is a **quantifiable value that represents some aspect of performance** as it pertains to at least two of the following:

* System health
* Relative progress in meeting business objectives
* End-user satisfaction with the system
* Efficiency of the IT department in resolving issues

Business managers may expect KPIs to take into account more than just IT, so they might end up being tied to business-operations data. Some examples:
* **Mean Time to Detection (MTTD)** - The interval between the time that an error or other system issue occurred, and the time it was detected.
* **Mean Time to Resolution (MTTR)** - The interval between the time an issue was detected and the time it was resolved.

In the end, KPIs might be driven based on the organization, as the leadership is the one setting the objectives. Therefore, a KPI should come from a process where we are setting business priorities, identify how we can quantify those objective parameters and dedicate the APM to gather metrics capable of being translated into those terms.

## Everyday Remediation

The basic tenet of modern remediation planning in IT is that the state of the organization's infrastructure, services, and applications may all be **continually improved** in a process known as *everyday remediation* or *continuous remediation*. Some principles following this:

* Nothing is "normal" anymore: The goal for service levels becomes a moving target, systems evolve.
* Massive upheavals can be avoided if small changes are being made all the time.
* A working knowledge of the system is more deeply engrained in the minds of everyone assigned to its upkeep. We will easily find issues if we are familiarized with the systems before they even fail.
* The security team and the operations team should work together on a permanent basis. Performance issues are, at some level, security issues, especially to the extent that they can be exploited.


