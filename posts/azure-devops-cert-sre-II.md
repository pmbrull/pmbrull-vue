---
title: AZ-400 - Develop SRE strategy II
published: true
description: |
  As SRE is also tied to monitoring, we're going to
  review alerts with Azure Monitor and expand the 
  discussion to some interesting tools such as
  smart groups.
category: Cloud
ctime: 2020-09-28
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/incident-response-with-alerting-on-azure/).

# Improve incident response with alerting on Azure

Learning objectives:
* Explore alerts by using Azure Monitor.
* Understand when to use metric, log, and activity log events.
* Create and use metric, log, and activity log alerts.
* Learn the benefits of using smart groups.

## Explore the different alert types that Azure Monitor supports

We want to make sure, after setting up the monitoring of apps and infrastructure, that the right people are being alerted, at the right level.

With Azure Monitor we can enable or disable alerts, as some of them might only be needed during a while after a new deployment.

### Composition of an alert rule

Recall how we said that Azure Monitor gathers data from apps, OSs, Azure resources, subscriptions and tenants. A data type will be log, metric or both.

* **Metric** alerts provide an alert trigger when a specified threshold is exceeded. For example, a metric alert can notify you when CPU usage is greater than 95 percent. Metric alerts are ideally suited to monitoring for threshold breaches or spotting trends.
* **Activity log** alerts notify you when Azure resources change state. For example, an activity log alert can notify you when a resource is deleted.
* **Log** alerts are based on things written to log files. For example, a log alert can notify you when a web server has returned a number of 404 or 500 responses. Log alerts allow for greater analytical monitoring of historical data.

Every alert or notification available in Azure Monitor is the product of a **rule**. Some of these rules are built into the Azure platform. You use alert rules to create custom alerts and notifications, but the composition is always the same:

* **RESOURCE**: The type of resource will define the available *signal types* and we can assign multiple alert resources to a single rule.
* **CONDITION**: The *signal type* to be used to assess the rule: it can be a metric, an activity log, or logs + The **alert logic** applied to the data that's supplied via the signal type.
* **ACTIONS**: The *action* (e.g.,sending an email) + an *action group* recipient of the action.
* **ALERT DETAILS**: An *alert name* and *alert description* + the *severity* of the alert if the logic evaluates to true. There are different levels (0: Critical, 1: Error, 2: Warning, 3: Informational, 4: Verbose).

### Scope of alert rules

you can create alert rules for these items and more:

* Metric values
* Log search queries
* Activity log events
* Health of the underlying Azure platform
* Tests for website availability

The following alert capabilities aren't yet available for the generation of monitoring data:

* Service health alerts based on activity logs
* Web availability tests through Application Insights

### Understanding the alert state in the resolution process

To control the state of the alert while it is being resolved, there are three states: New, Acknowledged (when an admin is working on it) and Closed, when it is resolved.

Note that from the summary window we have a satellite view of the alerts being reported in Azure Monitor. We can then apply filters on **smart groups**, **resource type**, **resource**, **severity**, **monitor condition** (This filter is set by the system and indicates if the alert is fired or resolved) and **alert state** (to find New and Acknowledged alerts).

## Use metric alerts to alert on performance issues in your Azure environment

Use metric alerts to achieve regular threshold monitoring of Azure resources. Azure Monitor runs metric alert trigger conditions at regular intervals.

### Composition of a metric alert

All alerts are governed by their rules. For metric alerts, there's an additional factor to define: the condition type, which can be static or dynamic. For both types we need to define the statistical analysis to run on top, such as the min, max or average. This means that we also need to define a data interval, and finally, how often we need to check this condition.

* Static thresholds are defined values that will trigger an alert based on the resulting computation of the metric, e.g., CPU utilization > 85%.
* Dynamic thresholds use ML tools to improve the accuracy of the first initialized threshold. We need to define then:
  * The *look-back* period: how many previous periods need to be evaluated, and
  * The *number of violations*: how many times the logic condition has to deviate from the expected behavior before the alert rule fires a notification.

> OBS: We can also use multiple dimensions in our metrics, so we can define a single metric alert rule and have it applied to multiple related instances. We then receive an individual notification for each instance when the rule conditions are triggered.

### Scaling metric alerts

We can also create metrics that monitor multiple resources based on scaling. So far this is limited to VMs. Like dimensions, a scaling metric alert is individual to the resource that triggered it.

### Creation

Metrics can either be created via the portal or by Azure CLI, e.g.,

```
az monitor metrics alert create \
    -n "Cpu80PercentAlert" \
    --resource-group [sandbox resource group name] \
    --scopes $VMID \
    --condition "max percentage CPU > 80" \
    --description "Virtual machine is running at or greater than 80% CPU utilization" \
    --evaluation-frequency 1m \
    --window-size 1m \
    --severity 3
```

## Use log alerts to alert on events in your application

We can use Azure Monitor to capture important information from **log files** created by applications, operating systems, other hardware, or Azure services.

They work a bit differently than other alerts. We need to define a **log search rule**, composed by:
* Log query that runs when the alert rule fires
* Time period for the query
* Frequency
* Threshold: trigger point for an alert to be created.

Then, log search results are one of two types:
* **Number of records**: useful with an event or event-driven data.
* **Metric measurements**: same basic functionality as metric alert logs. They require additional settings:
  * Aggregate function, returning an `AggregatedValue`.
  * Group field, by which the result will be grouped (used in conjunction with the aggregate function).
  * Interval by which the data is aggregated,
  * Threshold: A point defined by an aggregated value and the total number of breaches.
  Consider using this type of alert when you need to add a level of tolerance to the results found. For example, if the CPU > 85% more than five times within the given time period.

### Stateless nature of log alerts

This means that a log alert will generate new alerts every time the rule criteria are triggered, regardless of whether the alert was previously recorded.

## Use activity log alerts to alert on events within your Azure infrastructure

> OBS: Activity Log alerts will monitor events only in the subscription where the log alert was created.

There are two types:

* **Specific operations**: Apply to resources within your Azure subscription and often have a scope with specific resources or a resource group. Reports a change to an aspect of your subscription.
* **Service health events**: Include notice of incidents and maintenance of target resources.

### Composition of an activity log alert

Activity Log alerts are best created using Azure Monitor by filtering the events in our subscription and then select **Add activity log alert**.

They have the following attributes:
* Category: Administrative, service health, autoscale, policy, or recommendation.
* Scope: Resource level, resource group level, or subscription level.
* Resource group: Where the alert rule is saved.
* Resource type: Namespace for the target of the alert.
* Operation name: Operation name.
* Level: Verbose, informational, warning, error, or critical.
* Status: Started, failed, or succeeded.
* Event initiated by: The email address or Azure Active Directory identifier (**caller**) for the user.

### Creating a resource-specific log alert

When you create your activity log alert, you choose Activity Log for the signal type. Then you'll see all the available alerts for the resource you choose. Changing the monitor service will enable you to reduce the list of options.

### Creating a service health alert

Service health alerts are not like all the other alert types we've seen so far. To create a new alert, on the Azure portal, search for Service Health > Health alerts. After you select + Create service health alert.

The only difference is that you no longer need to select a resource, because the alert is for a whole region in Azure. What you can select is the kind of health event that you want to be alerted on. It's possible to select service issues, planned maintenance, or health advisories, or to choose all of the events.

### Performing actions when an alert happens

When any event is triggered, you can create an associated action in an action group. **Action groups allow you to define actions that will be run**, and can be reused on multiple alerts. You can run one or more actions for each triggered alert. The available actions are:

* Send an email
* Send an SMS message
* Create an Azure app push notification
* Make a voice call to a number
* Call an Azure function
* Trigger a logic app
* Send a notification to a webhook
* Create an ITSM ticket
* Use a runbook (to restart a VM, or scale a VM up or down)

You can add or create action groups at the same time that you create your alert. We can also edit an existing alert to add an action group after we've created it.

## Use smart groups to reduce alert noise in Azure Monitor

In a large environment, Azure Monitor can generate a large number of alerts, making it hard to see the difference between critical and nonessential issues.

Smart groups are an automatic feature of Azure Monitor. By using machine learning algorithms, Azure Monitor groups together alerts based on repeat occurrence or similarity. Smart groups allow you to address a group of alerts instead of each alert separately. The name of the smart group is assigned automatically and is the name of the first alert in the group. It's important to assign meaningful names to each alert that we create, because the name of the smart group can't be changed or amended.

Using smart groups can reduce alert noise by more than 90 percent. The power of smart groups is that they show you all related alerts and give improved analytics. They can often identify a previously unseen root cause.

### Smart group states

As alerts, smart groups have their own state showing their progress in the resolution process. Changing the state of a smart group doesn't alter the state of the individual alerts. To change the state, select Change smart group state.

States are the same as alerts: New, Acknowledged and Closed.
