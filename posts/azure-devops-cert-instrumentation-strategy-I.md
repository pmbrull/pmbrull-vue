---
title: Azure DevOps Certification - Develop an Instrumentation Strategy I
published: true
description: |
  The core of this module is to get visibility on the
  services we have up and running in the cloud. In order
  to correctly plan an application lifecycle we need to
  have enough information about both the software and
  infrastructure behavior.
category: Cloud
ctime: 2020-09-20
---

Long story short, we need to manage logging, telemetry and monitoring. The information will mainly come from the [Learning Path](https://docs.microsoft.com/en-us/learn/modules/capture-application-logs-app-service/) and other interesting sources such as [this](https://azure.microsoft.com/es-es/blog/cloud-service-fundamentals-telemetry-basics-and-troubleshooting/), that I'll keep adding when they pop up.

Note that in the Learning Path, MS allows us to use some sandboxes to deploy services and play around with the topics explained without getting our subscriptions charged, which is a great way to get some hands-on experience!

# Capture Web Application Logs with App Service Diagnostics Logging

Learning objectives:
* Enable application logging on an Azure Web App.
* View live application logging activity with the log streaming service.
* Retrieve application log files from an application with Kudu or the Azure CLI.

## Enable and Configure App Service Application Logging

As a general definition, logs are the way that we can **retrieve runtime information** about our application. The types of logging depend on the app framework and the OS of the host. Using files to save our logs might be troublesome if we have excessive logging (can affect performance) and / or multiple threads hosting our app.

For example, ASP.NET Windows apps can only run on Windows and have different logging levels

```python
Trace.TraceError("Message"); // Writes an error message
Trace.TraceWarning("Message"); // Writes a warning message
Trace.TraceInformation("Message"); // Writes an information message
Trace.WriteLine("Message"); // Writes a verbose message
```

But for ASP.NET Core apps, which can run both on Windows and Linux, the application logs are based on the levels 0 ("verbose") - 5 ("error"). On Linux, however, only levels 4 and 5 (error) are logged.

Node.js apps can use `console.error` or `console.log` to log to STDERR or STDOUT for Windows and Linux.

Moreover, apps on Windows can log both on the File System or Blob Storage, while on Linux only the File System is enabled.

### Alternatives to application diagnostics

Azure App Insights is a great alternative to this first step possibility of logging. While we might need to plan for regular extra costs, it provides performance monitoring (CPU, memory, network and File System usage), allows us to set up alerts and by using the **App Insights SDK** we have access to the same set of telemetry and performance data for both ASP.NET or Node apps.

### Enable Logging

In the portal, application logging is managed from the **Diagnostics logs** of the app. We can configure both File System and Blob Storage as systems to store our logs and then set the log level (Error, Warning, Information, or Verbose). The storage account needs to be in the same region as the app.

> OBS: Logging to the file system is automatically disabled after 12 hours. Saving to Blob is not enabled for Linux application logs. When logging to blob storage, you must also set a Retention Period. Unlike the file system logs, blob logs are never deleted by default; the retention period option means that any logs older than the specified number of days will be deleted.

If we want to use the CLI:

```
az webapp log config --application-logging true --level verbose --name <app-name> --resource-group <resource-group-name>
```

> OBS: The current version of Azure CLI does not enable you to manage application logging to blob storage and we cannot disable it either with the CLI.

To reset the File System to error-level only:

```
az webapp log config --application-logging false --name <app-name> --resource-group <resource-group-name>
```

And to view the current logging status:

```
az webapp log show --name <app-name> --resource-group <resource-group-name>
```

## View Live Application Logging with the Log Streaming Service

While storing logs to a storage account is useful, for development / troubleshooting purposes it might be cumbersome to locate the log files in our systems. A better approach for some situations we have **Live Log Streaming**. They are interesting for some debugging purposes, but they are lacking for multi-instance apps or when we scale them up. What it does is to redirect the File System logs, so we see the same log level that has been configured in the Diagnostic logs. 

We can enable live log streaming from the command line using Azure CLI or curl commands:

Azure cli:
```
az webapp log tail --name <app name> --resource-group <resource group name>
```

For curl, we need **deployment credentials** which can be at *App Level* (automatically created when we deploy the web app, and each app has its own separate creds) or *User Level* (you can create your own credentials for use with any Web app; you can manage these credentials in the Azure portal, as long as you already have at least one Web app, or by using Azure CLI commands).

We can get this information in the portal from the Web App > Deployment Center > Deployment Credentials.

To create a new set of user-level creds:

```
az webapp deployment user set --user-name <name-of-user-to create> --password <new-password>
```

and then use curl to view the live log streaming:

```
curl -u {username} https://{sitename}.scm.azurewebsites.net/api/logstream
```

> OBS: For both Azure CLI or curl, use Ctrl + C to close the log streaming session.

## Retrieve Application Log Files

The Azure infrastructure used to run Windows Web apps is not the same as that for Linux apps, and log files are not stored in the same locations.

### Windows app log files

File System log files are stored in a virtual drive associated to our app as `D:\Home`, which includes a `LogFiles` folder with some subfolders: Application, Detailed Errors, http (IIS-level logs, if Web server Logging is enabled) and W3SVC (for failed http requests if Failed Requests is enabled).

In the blob storage, logs are partitioned by year, month, day and hour folders. Within the hour dir, csv files of 60min logs are stored.

### Linux app log files

Linux web apps are managed via an underlying Docker container, so messages are stored in the Docker log files. Therefore, SSH connection to the container is needed to check the logs.

### Methods for retrieving log files

For file system logs, we can use the Azure CLI or the Kudu console:

With Azure CLI, we can run
```
az webapp log download --log-file <filename>.zip  --resource-group <resource group name> --name <app name>
```

to copy the logs from the app's file system to our Azure Cloud Shell storage and then download them to our computers.

For **Kudu**, all Azure Web apps have an associated Source Control Management (SCM) service site. This site runs the Kudu service. One way to access the KUDU console, is gone to `https://<app name>.scm.azurewebsites.net`, and then sign in using deployment credentials. We can also access KUDU from the Azure portal: App > Development Tools > Advanced Tools > Go.

Once inside Kudu: Debug Console > CMD > LogFiles > Download Button.

If the logs are stored in a blob container, it is easy to go using the Storage Explorer.
