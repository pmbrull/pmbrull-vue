---
title: AWS with Cloudformation
published: true
description: |
    It's been a month since I enrolled into Udacity's Cloud DevOps Nanodegree program. 
    After getting some cloud fundamentals knowledge regarding both usage and services,
    we were presented an awesome tool: Cloudformation. It introduced the concept 
    of Infrastructure as Code (IAC), where we treat services as we do with usual software in
    the sense of developing, testing and promoting environments.
category: Cloud
ctime: 2019-07-21
---

## Infrastructure as Code

IaC gets extremely powerful when working with cloud providers, as each project has its own specific needs in terms of what services to use and even with security and networking. Usually this means spinning up a really complex architecture even when we are just messing around ith a web server that needs some external storage.

Thus, what we aim to do is iteratively describing this architecture, testing it together with software it supports and scaling environments as we get the tests to work out. This means that we are just applying CI/CD pipelines for code, but also for the platform, thus avoiding any **configuration drift** could occur when working with different environment descriptions. This does not mean, however, that then platform services become developer's responsibility, but rather the whole process to work as a single unit.

To illustrate this, the second nanodegree project consisted in preparing a web application obtaining
some code from an S3 bucket and using AWS services such as a Load Balancer and Autoscaling group to nsure
that we provide a service with high-availability and fault tolerance, as well as being flexible nough
to serve all the incoming users even when there are peaks with the requests. Not only that, but escribing
all the security and networking rules has also been as hard as it was interesting. For the code of he project
you can refer to this github [page](https://github.com/pmbrull/udacity-iac-project).

<img src="../../images/posts/cloud/IaC-architecture.png" class="h-114 my-4 justify-center m-auto">

You can find all the information about the Nanodegree [here](https://eu.udacity.com/course/cloud-dev-ops-nanodegree--nd9991).
