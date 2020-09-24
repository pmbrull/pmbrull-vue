---
title: AZ-400 - Develop an Instrumentation Strategy VIII
published: true
description: |
  By now, we have discussed how to enable App Insights to our
  web apps by enabling instrumentation and how to visualize the
  obtained data. We've also discussed how there is an available SDK
  to be used directly in the code to either extend the information
  or completely enable it for Linux web apps. Let's take a look
  at this SDK.
category: Cloud
ctime: 2020-09-23
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/instrument-web-app-code-with-application-insights/).

# Instrument server-side web application code with Application Insights

Sometimes we are interested in custom metrics or more detailed data in events that is not given by default in the automatic telemetry gathered about performance and behavior.

With the SDK we can extend the collected data to better fit our business domain.

Learning objectives:
* Learn the benefits of adding the Application Insights SDK to the source code for an Azure App Service web app
* Install the Application Insights SDK in an ASP.NET Core web app
* Instrument a web app with code to gather information about custom events

## Install, configure, and initialize the Application Insights SDK

To use the Application Insights SDK, we need to reference a package or library and add configuration and code to your app.

### What is the Application Insights SDK?

Use of the SDK is not limited to web applications. We can instrument any kind of service or component for which you want to record telemetry, though most of the data that the SDK can record automatically is specific to web apps. And the SDK isn't limited to applications that are deployed to Azure.

It links the app with App Insights and sends there the telemetry data. App Insights service processes and aggregates the data to ease how we query and visualize it.

### Why install the SDK?

* **Comprehensive data collection**: Data like user retention, unique users, and unique sessions is available in Application Insights only when you use the Application Insights SDK.
* **Custom telemetry**: Add code to capture events and metrics that are specific to your app and its business domain.
* **Advanced features**: Some Application Insights features are available only when you use the SDK, e.g. Live Metrics Stream.
* **Local telemetry in Visual Studio**: Telemetry data from applications instrumented with the SDK can be viewed locally in Visual Studio when you run the app in the debugger.

### How to use the SDK

To install the SDK:

* Reference the SDK in your app.
* Configure your app with the instrumentation key of your Application Insights resource.
* Initialize the SDK in code to begin generating telemetry.

The exact steps might differ depending on the language and framework used for the web app. Let's follow an example for ASP.NET Core:

1. First, we need to install the SDK by running `dotnet add package Microsoft.ApplicationInsights.AspNetCore`.
2. Then, to configure the key we first need to retrieve it. We can do so with Azure CLI:
    ```
    az resource show \
        --resource-group <resource_group_name> \
        --name <resource_name> \
        --resource-type "Microsoft.Insights/components" \
        --query properties.InstrumentationKey
    ```
    To add the key to the app, it can be written in `appsettings.json` with the format
    ```json
    {
    "ApplicationInsights": {
        "InstrumentationKey": "11111111-2222-3333-4444-555555555555"
    }
    }
    ```
    or automatically read from an env variable called `APPINSIGHTS_INSTRUMENTATIONKEY`. The preferred way to configure it is by having different keys for different environments and hosting the key as an env variable to have the code as agnostic as possible.
3. Finally, initialize the SDK in your code. In ASP.NET this is done by adding `UseApplicationInsights()` in function `CreateWebHostBuilder()` in `Program.cs`:
    ```c#
    public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseApplicationInsights()
            .UseStartup<Startup>();
    ```

## Instrument the application

The `TelemetryClient` object is used to record information about application-specific events and metrics.

We can then name events based on whatever data they are tracking, for example `CommentAdded`. For metrics, they are pre-aggregated and can be multi-dimensional (record multiple values into a single metric).

### Add instrumentation to your code

After adding `UseApplicationInsights()` in the code, `TelemetryClient` is registered and can be called:

```c#
public class HomeController : Controller
{
    private TelemetryClient aiClient;

    public HomeController(TelemetryClient aiClient)
    {
        this.aiClient = aiClient;
    }
}
```

In this example, `aiClient` can be used in your controller methods to track events and metrics.

### Tracking events

```c#
// Track an event
this.aiClient.TrackEvent("CommentSubmitted");

// Track an event with properties
this.aiClient.TrackEvent("VideoUploaded", new Dictionary<string, string> {{"Category", "Sports"}, {"Format", "mp4"}});
```

Note that event names are ordinary Strings and we can add properties.

### Tracking metrics

As with events, we can assign names to metrics by calling `GetMetric` and then tracking one or multiple values:

```c#
this.aiClient.GetMetric("SimultaneousPlays").TrackValue(5);
```

or 

```c#
Metric userResponse = this.aiClient.GetMetric("UserResponses", "Kind");

userResponse.TrackValue(24, "Likes");
userResponse.TrackValue(5, "Loves");
```
