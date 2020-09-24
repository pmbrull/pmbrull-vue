---
title: AZ-400 - Develop an Instrumentation Strategy VI
published: true
description: |
  Through this first series of our AZ-400 study journey we've
  seen how we need core, infrastructure and application
  monitoring. Now, let's take a look at how to monitor infrastructure
  with Azure Monitor.
category: Cloud
ctime: 2020-09-23
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/analyze-infrastructure-with-azure-monitor-logs/).

# Analyze your Azure infrastructure by using Azure Monitor logs

Learning objectives:
* Identify the features and capabilities of Azure Monitor logs.
* Create basic Azure Monitor log queries to extract information from log data.

## Features of Azure Monitor logs

Azure Monitor is a service for collecting and analyzing telemetry. It helps you get maximum performance and availability for your cloud applications, and for your on-premises resources and applications. It shows how your applications are performing and identifies any issues with them.

Recall how we discussed that Azure Monitor automatically collects data about our **applications** (related to our custom app code), **OS**, **resources** anv even both **subscription** - Azure health & availability - and **tenant** - from organization level services as AAD.

It collects two types of data stored under two main datastores:
* **Metrics**: how the resource is performing and the other resources that it is consuming.
* **Logs**: showing when resources are created or modified.

On top of this data, Azure Monitor performs actions such as analysis, alerting, and streaming to external systems.

This data gets ingested as soon as the resource is created, but we can extend it:
* **Enabling Diagnostics**: as some resources might be able to send more exhaustive information, such as Azure SQL. This can be done via Portal, Azure CLI or PS.
* **Adding an Agent**: Installing the Log Analytics agent on VMs to send data to Log Analytics Workspace.
* **Data Collector API**: REST communication that can be added to custom code, such as an Azure Function or mobile app.

## Logs

Logs contain time-stamped information about changes made to resources as an **event**. The type of information recorded varies by log source and is organized into records with varying sets of properties. The logs can include numeric values such as Azure Monitor metrics, but most include text data rather than numeric values.

You log data from Azure Monitor in a Log Analytics workspace. Azure provides an analysis engine and a rich query language. The logs show the context of any problems and are useful for identifying root causes.

## Metrics

Metrics are numerical values that describe some aspect of a system at a point in time. Azure Monitor can capture metrics in near real time. The metrics are collected at regular intervals and are useful for alerting because of their frequent sampling. You can use a variety of algorithms to compare a metric to other metrics and observe trends over time.

They are stored in a time-series db.

## Analyzing logs by using Kusto

To retrieve, consolidate, and analyze data, you specify a query to run in Azure Monitor logs with the **Kusto** query language, also used by Azure Data Explorer. These log queries can be directly tested in the portal. Then, you can create custom dashboards in the portal linking an Azure Monitor tile that shows a chart based on a Kusto query.

A query example could be:

```kusto
Events
| where StartTime >= datetime(2018-11-01) and StartTime < datetime(2018-12-01)
| where State == "FLORIDA"  
| count
```

> OBS: The database that hosts the `Events` table is implicit here, and is part of the connection information.

A Kusto query consists of a sequence of query statements, delimited by a semicolon (;). At least one statement is a tabular expression statement. Moreover, Azure Monitor Logs has some predefined example queries that answer common questions related to the health, availability, usage and performance of their resources.

By using Azure dashboards, you can combine various kinds of data, including both logs and metrics, into a single pane in the Azure portal.
