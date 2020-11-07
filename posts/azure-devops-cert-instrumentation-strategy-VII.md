---
title: AZ-400 - Develop an Instrumentation Strategy VII
published: true
description: |
  Keeping up with the core, infrastructure and application
  monitoring, it is time to jump onto Application Insights
  to take a deep look into our web apps behavior and
  performance.
category: Cloud
ctime: 2020-09-22
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/capture-page-load-times-application-insights/).

## Capture and view page load times in your Azure web app with Application Insights

Application Insights, a feature of Azure Monitor, is an extensible Application Performance Management (APM) service for developers and DevOps professionals. It monitors live web applications and you can enable it for many Azure App Service web apps without modifying any of the app's code.

In most cases, app monitoring can be enabled without applying changes to code using auto-instrumentation or codeless attach. However, it is possible to extend log information via SDKs or when codeless attach is not supported.

Learning objectives:
* Enable Application Insights runtime instrumentation on a new or existing Azure web app.
* Identify the Application Insights telemetry visualization features of the Azure portal.
* Create a chart to view data for a specific metric.

## Enable Application Insights on an Azure web app

You can enable runtime instrumentation, the type of Application Insights instrumentation that doesn't require you to change your app's code, when the app is first created or at any time afterwards. As Azure Monitor, it captures two types of data:

* **Events**: individual data points that can be technical - based on app runtime - or based on business logic or user actions.
* **Metrics**: data measurements taken at regular intervals. They can also be technical, based on the infrastructure (length of a queue), or part of business domain (clicks last hour).

### Application Insights resources

Application Insights is a resource deployed to one of your **subscriptions**. Each Application Insights resource you create is a repository for application telemetry data. To send telemetry data to an Application Insights resource from an app, you need to configure the app with the *instrumentation key* of the Application Insights resource.

### Visualizations

In the Azure portal, you can visualize the telemetry captured in different ways:
* **Live metrics streams**: near-real time.
* **Metrics explorer**: To check metrics variation over time.
* **Alerts**: To be aware of critical issues when measures exceed some thresholds.
* **Profiler**: Shows how a set of requests were delivered. Useful to check what elements are loading slowly.
* **Application Map**: Displays the components of an application and how they link to each other. Useful to discover bottlenecks.
* **Usage analysis**: Information about your app's users. Useful to discover retention.

Apart from checking those from the portal, you can use Power BI.

### Runtime instrumentation and build-time instrumentation

There are two ways to configure your app to send data to Application Insights:
* **Runtime instrumentation**: Can be enabled via the portal and does not require any app code change. This can be enabled at create time in the Monitoring tab or after the app is created on the Application Insights pane.
* **Build-time instrumentation**: Add server-side SDKs to the web app code. This allows to add custom events and telemetry.

We can also enable **client-side instrumentation** for an app by including a standard Application Insights JS library that will capture load times, performance data about AJAX calls and browser exceptions. To automatically inject the JavaScript SDK and necessary configuration into pages served by your web app, add a new application setting (directly in the Azure portal!) named `APPINSIGHTS_JAVASCRIPT_ENABLED` and set the value to true.

### Web app requirements

Runtime instrumentation and automatic client-side instrumentation is supported only on **Windows** web apps and ASP.NET or ASP.NET Core frameworks have the best integration. These features rely on capabilities of IIS, the web server technology that powers Windows apps on App Service. The use of Application Insights in Linux apps is fully supported, but you need to modify application code to reference the Application Insights SDK. 

## View Application Insights metrics in the Azure portal

There are several tools we can use to display App Insights gathered data:
* **Azure Portal**: Where we can find a common set of charts, an application map, performance and failures pages. We can use the Metrics page to create **custom charts** and add them to dashboards.
* **Power BI**: to display web app telemetry data.
* **Visual Studio**: to view the same charts and data displayed in the portal.
* **Custom tools**: that can be build based on the data available from the App Insights API.

### Go to the Application Insights resource and dashboard

The Application Insights resource is separate from the App Service resource that contains the instrumented web app. In the Application Insights resource (also linked in the App Service that contains the instrumented app), we can select Application Dashboard on the Overview page. This can also be viewed in the portal dashboard.

> OBS: If we make some changes into a dashboard, we might need to re-publish it so that other users can see it.
