---
title: Azure DevOps Certification - Overview
published: true
description: |
  I just scheduled the Azure DevOps Expert certification exam
  for a couple of months from now. In this post I am going
  to underline a summary of what the exam covers and during the
  following days I'll keep posting my notes of the material.
category: Cloud
ctime: 2020-09-19
---

Playing around with Azure DevOps all day at work makes one wonder what could you be getting wrong (or not that good), so I am actually pretty excited about diving deep for this certification.

With DevOps we try to bring to our development process the agile thinking, delivering faster and testing better our work. You can find the link to Microsoft's DevOps page [here](https://docs.microsoft.com/en-us/learn/certifications/devops-engineer). As pointed out there, one first needs to be either a Developer or Admin associate prior to jumping to this exam. Let's take a look at the [measured skills](https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE3VP84).

## Develop an Instrumentation Strategy (5-10%)

This makes sense, right? We're talking about improving the lifecycle of an application, so first of all we need to make sure we can obtain all the necessary information of what is going on in our environments. This part is broken down in the following points:

1. **Design and implement logging**: Where one needs to define a log framework, log aggregation and storage (Azure Storage, Azure Monitor), manage access control to logs and finally integrate crash analytics.
1. **Design and implement telemetry**: Extracting information about app and infrastructure metrics, setting alerts & user analytics.
1. **Integrate logging and monitoring solutions**: Using monitoring tools for apps and containers (Azure Monitor), manage access to such tools and extract feedback from the monitoring data.

## Develop a Site Reliability Engineering (SRE) strategy (5-10%)

Based on the information retrieval tools, set metrics and alerts to control the health of both application and infrastructure.

1. **Develop an actionable alerting strategy**: Identify metrics and setting alerts based on metrics, logs and health checks. Develop communication mechanisms to inform users about degraded systems.
1. **Design a failure prediction strategy**: Analyze failure conditions and metrics and apply a failure prediction strategy.
1. **Design and implement a health check**: Integrate and implement health checks, analyze dependencies and design approach for partial health situations.

## Develop a security and compliance plan (10-15%)

Make use of Azure services such as Active Directory and Key Vault to manage access and sensitive information.

1. **Design an authentication and authorization strategy**: With solutions as Azure AD to manage users and groups, Service Principals, Managed Identities and service connections.
1. **Design a sensitive information management strategy**: With Azure Key Vault, security certificates and secrets. How to securely deploy secrets during a release.
1. **Develop security and compliance**: Dependency scanning for security and compliance (licensing), asses and reports risks and design a source code compliance solution.
1. **Design governance enforcement mechanisms**: Implement Azure policies to enforce organizational requirements and responses to security incidents.

## Manage source control (10-15%)

To ensure a healthy code management and team collaboration.

1. **Develop a modern source control strategy**: Integrate source control systems, auth strategies, manage large binary files (Git LFS), cross repo sharing and workflow hooks.
1. **Plan and implement branching strategies for the source code**: PR guidelines & workflows, branch merging restrictions (policies), branch strategy and enforce static code analysis for code-quality consistency on PR.
1. **Configure repositories**: configure permissions, organize the repo with tags, manage oversized repos, content recovery and data purging.
1. **Integrate source control with tools**: With DevOps pipelines, Github & AD, GitOps, ChatOps and changelogs.

## Facilitate communication and collaboration (10-15%)

Ensuring rapid insights and feedback on the project lifecyle health.

1. **Communicate deployment and release information with business stakeholders**: Custom dashboards on Azure DevOps, cost management strategy, work item tracing and communicate user analytics.
1. **Generate DevOps process documentation**: Onboarding process for new employees, asses and document dependencies and artifacts.
1. **Automate communication with team members**: Integrate monitoring tools, build and release pipelines with communication platforms & notify key metrics with alerts.

## Define and implement continuous integration (20-25%)

This block and the next are the most fundamental ones, as once we have the environment ready with access control, source management, logging and monitoring, we need to create the CICD process per se.

1. **Design build automation**: Integrate the build pipeline with external tools and set quality gates and testing strategy.
2. **Design a package management strategy**: Design Azure Artifacts implementation, dependency updating and version strategy for code, packages and deployment artifacts.
3. **Design an application infrastructure management strategy**: Asses configuration management mechanisms for the infrastructure and enforce the desired state for your environments. 
4. **Implement a build strategy**: Design and implement build agent infrastructure and costs, tools and maintenance, build pipelines and triggers, orchestration and integrate the configuration in the build process.
5. **Maintain build strategy**: Monitor pipeline health, optimize build cost, time and performance. Manage agents and investigate test failures.
6. **Design a process for standardizing builds across organization**: Manage self-hosted agents and create reusable build subsystems (YAML templates, task groups, variable groups).

## Define and implement a continuous delivery and release management strategy (10-15%)

1. **Develop deployment scripts and templates**: Define a deployment solution, implement IaC, define application and database deployment, integrate configuration management.
2. **Implement an orchestration automation solution**: Combine release targets depending on release deliverables, manage dependencies and release configurations, gates and approvals.
3. **Plan the deployment environment strategy**: Design and implement a release strategy, minimize downtime during deployments and design a hotfix path plan.

## Summary

To sum up, in this post we just went through the Microsoft sources to list all the skills required to take the exam to start ordering the ideas in our heads.
