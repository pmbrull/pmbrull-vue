---
title: AZ-400 - Define and Implement CI
published: true
description: |
  After exploring monitoring, system reliability,
  security and surfed through the devops
  taxonomy, it is time to start building
  Continuous Integration processes using
  Azure DevOps.
category: Cloud
ctime: 2020-10-14
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/create-a-build-pipeline/).

# Create a build pipeline with Azure Pipelines

Learning Objectives:
* Create a build pipeline in Azure Pipelines
* Map the manual build steps to automated build tasks
* Publish your builds so others can access them
* Use templates to build multiple configurations

## What is Azure Pipelines?

Azure Pipelines is a cloud service to automatically build, test, and deploy your code project. We can make it available to other users and it works with almost any language or project type.

> OBS: Recall that CI is the process of automating the build and testing of code every time a team member commits changes to version control.

The parts of a CI pipeline are:
* A pipeline defines the continuous integration process for the app. It's made up of steps called tasks.
* The pipeline runs when you submit code changes, automatically or manually. It can be connected to Github, Bitbucket or Subversion.
* A build agent is a piece of installable software that runs one build or deployment job at a time. With Azure Pipeline, we can use Azure hosted agents, so we do not need to care about maintenance.
* The final product of the pipeline is a build artifact: the smallest compiled unit that we need to test or deploy the app.

### Agents, Agent pools and Agent queues

Instead of using an Azure Hosted agent, you can configure your own **self-hosted agent** to have more control and install any software you need. You can install the agent on Linux, macOS, or Windows machines or even on a Linux Docker container.

An **agent pool** defines the sharing boundary for all agents in that pool. In Azure Pipelines, agent pools are scoped to the Azure DevOps organization so you can share an agent pool across projects. When creating a build or release pipeline we need to specify which agent pool to use. To share an agent pool with multiple projects, in each of those projects, you create a project agent pool pointing to an organization agent pool. While multiple pools across projects can use the same organization agent pool, multiple pools within a project cannot use the same organization agent pool. Also, each project agent pool can use only one organization agent pool.

If you are a project team member, you create and manage **agent build queues** from the agent pools tab in project settings.

### Service endpoints for integration with third-party systems

Service endpoints are a way for Azure DevOps to connect to external systems or services. They are a bundle of securely stored properties such as Service Name, URL, certificates or tokens and users & pwd.

### Concurrent pipelines

You can run concurrent pipelines (also called parallel jobs) in Azure Pipelines. One parallel job in Azure Pipeline lets you run a single build or release job at any given time. Parallel jobs are purchased at organization level.

When planning for a CICD process, we need to define how many parallel jobs we need - if any, where do we want our agents (Azure hosted or self-hosted) and the different tasks required for testing and deploying.

### What are Azure Pipelines tasks?

A task is a packaged script or procedure that's been abstracted with a set of inputs. This makes it easier to run common build functions.

Azure pipelines can be defined via the Azure Pipelines UI or by using a YAML file: Pipeline as code refers to the concept of expressing your build definitions as code.

During the build step of a pipeline, we usually have a script with a series of steps to be followed. These steps can be abstracted as tasks offered to us by Azure DevOps. For example, `npm install` will be the task `Npm@1`. 

> OBS: the `script` task is a shortcut for `CmdLine@2`.

In .NET Core, you can package your application as a .zip file. You can then use the built-in `PublishBuildArtifacts@1` task to publish the .zip file to Azure Pipelines. Publishing artifacts makes them visible in Azure pipelines and we can then use those in release steps.

### What are templates?

A template enables you to define common build tasks one time and reuse those tasks multiple times.

You call a template from the parent pipeline as a build step. You can pass parameters into a template from the parent pipeline.

## Automated testing

With unit tests we can ensure that the code follows some specified properties and behavior. It requires time for the developers to write those tests, but apart from becoming a quality gate, they can also serve as documentation.

We can make use of Azure Pipeline to automatically run unit tests.

According to the test pyramid, we should be running unit tests on classes and methods, not on the interface or services integration.

When running a task with tests, the `publishTestResults` argument adds the `--logger trx`. This argument tells the pipeline to generate the TRX file to a temporary directory, accessible through the `$(Agent.TempDirectory)` built-in variable. It also publishes the task results to the pipeline.

Test results in the pipeline can be checked in the build > Tests tab or in Test Plans > Runs. It is also interesting to add a test widget to the DevOps dashboard to check test evolution. This can be done using Add Widget > Test Result Trends and selecting our pipeline.

Code coverage tools inform us about the functions and classes being properly evaluated by unit tests. It is interesting to add code coverage tools - which vary depending on the language - to our pipeline tasks. To publish them after being run is as easy as using a predefined task:

```yaml
- task: PublishCodeCoverageResults@1
  displayName: 'Publish code coverage report'
  inputs:
    codeCoverageTool: 'cobertura'
    summaryFileLocation: '$(Build.SourcesDirectory)/**/coverage.cobertura.xml'
```

As with test results, code coverage can also be added into a DevOps dashboard.
