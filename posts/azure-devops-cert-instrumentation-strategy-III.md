---
title: AZ-400 - Develop an Instrumentation Strategy III
published: true
description: |
  This certification is about DevOps, so a major focus is
  regarding automation in testing, integration and delivery. When
  we are talking about performing this steps for mobile apps, Visual
  Studio App Center brings together all of these commodities, even with
  UI testing and monitoring on top.
category: Cloud
ctime: 2020-09-18
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/paths/az-400-develop-instrumentation-strategy/).

As I find myself more focused on the part of the job related to data, it is always interesting to check how Azure provides services that allow developers to also automate tasks that are so different as mobile app development. With App Center, we can develop, test and distribute our apps, test the UI and even publish new versions to the App Stores after a commit. Moreover, it also adds a monitoring layer on top, with analytics and diagnostics data.

## How App Center Build works

If our app runs on IOs, Android UWP, or tvOS and is built with any of the modern languages (Swift, Kotlin...), then we can link App Center to our git repo (Github, Bitbucket, DevOps) and build the app seamlessly in a secure cloud infrastructure.

As with any other CICD tool, we can select the set of branches we want the build to happen on and then distribute the resulting app to the testers or directly publish it to the stores. If we need custom build pipelines, we can create our own scripts.

A new, clean VM will be created to run the build and release and it is cleaned up at the end. Builds for iOS and Android apps are run on macOS VMs with several development and runtime packages. UWP apps are built on VMs using Hosted Windows Agents.

On top of this, you can also toggle a test to see if the app is able to run on a real device after the build and it will send a screenshot of the result!

## How App Center Test works

As the testing needs to happen on real devices, there are some definitions to keep in mind:
* **Device configuration** is the combination of device model and operating system version.
* **Device tier** is a measure of device popularity: more popularity means more devices in place to run our tests.
* **Device set** is a collection of device configurations. Useful for repeated tasks.
* A **test run** is an execution of a set of tests against a device set using an application binary. As devices become available, application and test files get loaded and run.

## How App Center Distribute works

* A **distribution group** is a collection of users that you can manage together. If private, only users invited by email - e.g., testers - can download the app. Otherwise, for public groups, anyone can install it without auth. New users can be added to distribution groups by email address or AAD.
* A **shared distribution group** is a distribution group that is used across multiple apps within a single organization.

Moreover, App Center can manage the device provisioning that is required for iOS development installs automatically, instead of using the Apple developer portal.

After a build is finished and is signed-off, it can be distributed to specific groups or directly to app stores.

## How App Center Diagnostics works

App Center has an SDK that allows us to collect diagnostics data to find the source of an issue in a device. The issue details are written to local storage before the app unloads and when the app is started again, it will send the message to App Center. Moreover, we can control exception with usual try / catch blocks to prevent the app to crash and send the data directly to App Center.

We could also customize the sent data, for example by adding information such as the user ID. Collected data can directly be checked in the App Center web portal.

Currently you can only configure the data retention period for 90 days or 28 days. If we are interested in keeping historic data, we can configure App Center to export the data continually to a Blob Storage or App Insights.

## How App Center Analytics works

Analytics is the analysis of data, often looking for patterns, to know how the users interact with our apps. We can collect this data with the App Center SDK in our app to start gathering user insights.

With this we can check OS, type of devices, languages and even track the adoption of new users.

Events in App Center are actions taken by the user, and we can add extra information to a given event to have a more informative view. Note that event tracking creates a history of actions taken in the app that can help in finding the source of an issue.

The retention is the same as with the Diagnostics data.
