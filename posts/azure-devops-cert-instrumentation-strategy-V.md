---
title: AZ-400 - Develop an Instrumentation Strategy V
published: true
description: |
  Following the Well-Architected Framework, now it is time to discuss
  Operational Excellence in order to determine if we are following
  the best practices when designing cloud solutions.
category: Cloud
ctime: 2020-09-20
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/azure-well-architected-operational-excellence). Operational Excellence is another pillar of the [Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/), and it tries to tackle questions such as: Are we using modern practices such as DevOps? Are we able to respond to unexpected events? Do we rely on manual interventions in our usual processes?

## Microsoft Azure Well-Architected Framework - Operational excellence 

Learning Content:
* Apply modern practices to design, build, and orchestrate resources on Azure
* Gain operational insights by using monitoring and analytics
* Reduce effort and error by using automation
* Identify issues and improve quality in your application by using tests

## Design, build, and orchestrate with modern practices

Now we are not only talking about using a service X or Y. We are also trying to adopt best practices at organizational level that we can use to improve our ability to build and deliver applications.

### DevOps

Here we are studying for a DevOps certificate, so it is time to give a proper definition, and Microsoft has aced it: **DevOps is the union of people, processes, and products to enable continuous delivery of value to end users**. This aims to create multidisciplinary teams that are no longer hard-broken into older dev & ops mindsets. Essential DevOps practices include agile planning, continuous integration, continuous delivery, and monitoring of applications.

Azure DevOps is a suite of products and tools that teams adopting DevOps practices can use to plan, develop, deliver, and operate their solutions. It brings solutions such as Azure pipeline, azure boards, repos, etc.

### Continuous Integration and Continuous Delivery (CI/CD)

* **Continuous Integration (CI)** is the practice of building and testing code every time a team member commits changes to version control. This allows to have real-time quality checks each time an update is done in the codebase and allows to find bugs earlier, which results into higher quality code.
* **Continuous Delivery (CD)** is the process to build, test, configure and deploy from a build environment to a production environment. We can then generate a pipeline to release our code to different testing and integration environments before reaching PROD.

Azure Pipelines combines continuous integration (CI) and continuous delivery (CD) to constantly and consistently test and build your code and ship it to any target.

### Microservices

A microservices architecture consists of services that are small, independent, and loosely coupled. This means that different components of our application can be treated independently, when being built, updated, tested and deployed. Each component treats and maintains its own data in an isolated manner, and is shared with the rest of the pieces via well-defined and consistent APIs.

Microservice architectures are technology agnostic, but you often see containers or serverless technologies used for their implementation.

### Environment consistency

By automating the deployment, we are able to bring to a minimum the chances of configuration drifts, as in each step of the release pipeline we will be deploying the same codebase following the same processes.

## Use monitoring and analytics to gain operational insights

When it comes to monitoring and analytics on Azure, we can bundle services into three specific areas of focus:

* Core monitoring
* Deep infrastructure monitoring
* Deep application monitoring

### Core monitoring

Here we are talking about the health visibility at Azure platform level which can be discussed in four areas:
* Activity Logging: tracking each change done on any resource, useful to troubleshoot errors and track changes. It answers questions like what configuration was changed and when, when a service was shut down, etc.
* Health of Cloud Services: Providing insights on issues that can happen at a global scale and may have an impact on our applications and processes.
* Metrics and Diagnostics: To be aware of anything that happens on our systems and instances. Azure Monitor enables core monitoring for Azure services by allowing the collection, aggregation, and visualization of metrics, activity logs, and diagnostic logs.
* Recommendations on best practices: Azure Advisor can give us information about potential performance, cost, high availability, or security issues within your resources based on our resource configuration and telemetry.

### Deep infrastructure monitoring

Azure Monitor can be easily configured to send their data to a Log Analytics workspace, which means that we can then query aggregated data from all of our different services, allowing us to track down issues that might be correlated or caused by different interacting services. 

Log Analytics allows us to create queries and interact with other systems based on those queries. The most common example is an alert.

### Deep application monitoring

Application Insights provides telemetry collection, query, and visualization capabilities. Instrumenting this level of monitoring requires little to no code changes; you only have to install a small instrumentation package into your application.

## Use automation to reduce effort and error

Managing infrastructure involves configuration tasks. However, manual intervention are prone to errors and can become hard to replicate in multiple environments.

### Infrastructure as Code

With **Infrastructure as Code** (IaC) we can manage infrastructure in a descriptive model and link it to a versioning system as part of our application codebase. IaC evolved to solve the problem of environment drift and it is used in DevOps practices as part of the continuous delivery.

When automating the deployment of services and infrastructure, there are two different approaches:
* **Imperative**: explicitly state the commands that are executed to produce the outcome you are looking for. This is usually achieved via the Azure CLI or Powershell. This allows us to create scripts to be executed in every environment, but those can easily become really complex and hard to maintain, plus we would need to add validation and error handling.
* **Declarative**: what you want the outcome to be instead of specifying how you want it done. On Azure, we can use ARM templates, JSON-structured files that specify what we want created. They can be used to manipulate most services in Azure. They have 4 sections:
  * Parameters handle input to be used within the template.
  * Variables provide a way to store values for use throughout the template.
  * Resources are the things that are being created.
  * Outputs provide details to the user of what was created.


### VM images vs. post-deployment configuration

With VMs we are usually not finished just by creating them, as they require further configuration. Two common strategies are:
* Custom images are generated by deploying a virtual machine, and then configuring that running instance. This image can then be used as a base for deploying other new virtual machines, so after deploying them we would be done. Here we need to keep in mind how to update and patch images.
* Post-deployment scripting typically leverages a basic base image, and then relies on scripting or a configuration management platform to perform the necessary configuration after the VM is deployed. The post-deployment scripting could be done by executing a script on the VM through the Azure Script Extension, or by leveraging a more robust solution such as Azure Automation Desired State Configuration (DSC). Here we need to note that after a VM is deployed, the build needs to finish before it is useful.

### Automation of operational tasks

**Azure Automation** reduces manual workloads, enables configuration and update management of compute resources, provides a framework for running any type of Azure task, and centralizes shared resources such as schedules, credentials, and certificates. This means being able to free our time from scheduled tasks such as starting / shutting down VMs or installing security patches.

### Automating development environments

We can use **Azure DevTest Labs** to deploy VMs with all of the correct tools and repositories that your developers need. Developers working on multiple services can switch between development environments without having to provision a new VM themselves. These VMs can be freely started and shut down.

## Testing strategies for your application

The faster we build and deploy, the more focused on testing we need to be.

A main DevOps principle is the **shift left** principle. This means that if our dev and deploy process consists in a series of steps executed from left to right, the majority of tests should be done as much in the left as possible. To put it easily, catch errors as soon as possible, which makes the fix easier, faster and cheaper.

We can use Azure Pipelines for automated testing and Azure Testing Plans for manual testing. But the idea is that everything needs to be tested, both application and infrastructure code.

### Automated Testing

As the best way to ensure that tests are executed, although we need to mind the frequency, which comes tied up with test duration and therefore, scope.

#### Unit Testing

Which checks code correctness, should be run each time a new version is commited. They should be extensive (code coverage) and quick (<30 seg). Unit tests should be applied both to application code and infrastructure code.


#### Smoke Testing

To verify that each component can be correctly built, and each component meets your criteria for expected functionality and performance. Smoke tests usually involve building the application code; and if you're deploying infrastructure as part of your process, then possibly testing the deployment in a test environment. < 15 min.

#### Integration Testing

Determine whether your components can interact with each other as they should. Your integration testing will detect interoperability issues between application components no later than one day after they were introduced. They can be run less frequently than smoke tests, so nightly runs are a good approach.

#### Manual Testing

The most expensive kind of testing, but still fundamental for the correct functioning of the DevOps feedback loop so that we can correct errors before it is too late.

### Acceptance Testing

How do we determine that a newly released application is behaving as it should?

* **Blue/Green deployments**: Deploy the new version alongside the current one and redirect users bit by bit. If anything wrong happens, we still have the current version running.
* **Canary release**: Expose new functionality to selected groups of users using feature flags. If they are satisfied, then the feature can be extended to the rest of the users. In this scenario we are talking about releasing functionality, and not necessarily about deploying a new version of the application.
* **A/B testing**: Similar to canary release testing, but while canary releases focus on mitigating risk, A/B testing focuses on evaluating the effectiveness of two similar ways of achieving different goals.

To measure the effectiveness of new features, we can use Application Insights User Behavior Analytic to determine how people are using your application.

### Stress tests

We have discussed how essential scaling is, so we need to test that the different parts of the application can handle correctly changing load conditions. We then need to monitor all the different components to identify possible bottlenecks or improvement areas. It is equally important to verify that after the stress test is concluded, your infrastructure scales back down to its normal condition in order to keep your costs under control.

### Fault injection

Your application should be resilient to infrastructure failures, and introducing faults in the underlying infrastructure and observing how your application behaves is fundamental for increasing the trust in your redundancy mechanisms. Chaos engineering is a practice adopted by some organizations to identify areas where faults may occur by purposefully making key pieces of infrastructure unavailable, for example with a forced shut down of some services.

### Security tests

To identify any application vulnerabilities that are introduced through code defects or through software dependencies with tools such as SonarQube or Veracode. Your security tests can also include red team exercises, where security teams attempt to compromise your application.
