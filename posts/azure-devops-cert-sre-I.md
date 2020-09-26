---
title: AZ-400 - Develop SRE strategy I
published: true
description: |
  System and application reliability is crucial, and it gets
  harder when we are continuously developing and releasing
  new features. How can we achieve reliability in such
  fast paced environments? Site Reliability Engineering
  is an approach to this challenge. 
category: Cloud
ctime: 2020-09-27
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/intro-to-site-reliability-engineering/).

# Introduction to Site Reliability Engineering (SRE)

Learning Objectives:
* Gain a basic understanding of Site Reliability Engineering (SRE)
* Learn how to get started with this valuable operations practice

## What is SRE and why does it matter?

> SRE is an **engineering discipline** devoted to helping an organization sustainably achieve the appropriate level of reliability in their systems, services, and products.

It is more than important to have our applications up and running, otherwise than can harm our business and our brand. Note that with SRE we are saying *appropriate* levels of reliability, as not all systems need to be up 100% of the time, so you don't need to waste money and efforts and instead we need to be pragmatic and discuss if a level X of reliability matches our domain and use case.

The last important word in the definition is *sustainably*. Systems are built and maintained by people, so we need to make sure that our operations processes are sustainable over time.

## SRE vs. DevOps

While both strive to apply monitoring and observability to our systems and automation, there are some key differences:

* SRE is an engineering discipline that focuses on reliability, DevOps is a cultural movement that emerged from the urge to break down the silos typically associated with separate Development and Operations organizations.
* SRE can be the name of a role, DevOps can't. No one, strictly speaking, is a "DevOps" for a living.
* SRE tends to be more prescriptive, DevOps is intentionally not so.

SRE comes from a software engineering background, and developed historically in parallel with DevOps.

## Key SRE principles and practices: virtuous cycles

**Virtuous cycles** are practices that build feedback loops that help an organization to continuously get better.

### Virtuous cycle #1: SLIs and SLOs

Stakeholders and developers need to discuss what would be the appropriate level of reliability. 
* First, we need to define what indicators will be used to measure the service health (a **Service Level Indicator** or SLI).
* Now, what level of reliability do we expect? Do we expect a 20% failure rate? This generic number will be the **Service Level Objective** (SLO). This needs to be accurately measured in our monitoring systems.

### Error Budgets

Furthermore, SRE takes another step for cases where the SLO is being met or exceeded. Some organizations use SLOs to construct what they call **error budgets**.

Imagine that we defined a SLO of 80%. This means that we have a "free" 20% slot of unreliability that can be used, for example, for our deployments, patching, or any other activity because "we do not care" whether the system is up or down.

However, the other case around is a bit more complicated. If our SLO is 80% but we just achieve a 60% of reliability based on our SLI, then we have already used all our error budget and we might need to delay new releases to not further compromise the system's health and we end up needed to assign development resources to towards reliability.

### Virtuous cycle #2: blameless postmortems

A **postmortem** is the retrospective analysis of a significant, usually undesired event. In SRE we need the postmortem to be blameless and instead focus on the failure of the process or the technology during the incident, not the actions of specific people. We are searching for ways to improve the systems or processes, not punish individuals.

## Key SRE principles and practices: The human side of SRE

Successful operations processes, focuses both on how we treat machines and individuals.

### Toil

Toil refers to operations work being done by a human that has certain characteristics. This is one of the places automation comes into play in SRE, as we want to reduce toil as much as possible to free up the team to work on more rewarding and impactful things. We want to eliminate toil wherever and whenever it is possible: *appropriate* comes again.

### Project work vs. reactive "ops" work

Here we come back to the ticketing problem. If an SRE is just focused on solving issues, proactive work - such as automation - cannot be done. A usual figure is around 50% on "ops" (firefighting, replying to pages, ticketing, which is mostly toil) and the rest for improvements. Otherwise, that is recipe for burnout and poor reliability.
