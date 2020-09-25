---
title: AZ-400 - Develop an Instrumentation Strategy XI
published: true
description: |
  This will be the last chapter in the MS Learn center regarding
  instrumentation. It does a general review of services but yet
  manages to explore a couple of new solutions: Azure Security
  Center and Azure Sentinel.
category: Cloud
ctime: 2020-09-26
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/design-monitoring-strategy-on-azure/).

# Design a holistic monitoring strategy on Azure


Learning objectives:
* Select the appropriate monitoring solution based on use case.
* Integrate monitoring solutions to create a unified monitoring strategy.

## Continuous monitoring in Azure

By monitoring your applications and infrastructure continuously, you respond to changes and issues appropriately and on time. In the long run, your organization will become more productive, cost-effective, secure, and competitive.

## Azure Security Center

Is a service that manages the security of your infrastructure from a centralized location. It also works for on-prem workloads. It gives analysis on data security, network security, application security, identity and access. All in all, it helps you understand the security of your architecture.

* **Improve your protection against security threats** and implement recommendations.
* **Ease the configuration of your security**. Security Center is natively integrated with other Azure services, such as PaaS services like Azure SQL Database. For IaaS services, enable automatic provisioning in Security Center.

You use Security Center if:
* You want to identify and address risks and threats to your infrastructure.
* You don't have the traditional in-house skills and capital needed to secure a complex infrastructure.
* You want to secure an infrastructure that consists of on-premises and cloud resources.

### Protect against threats with Azure Security Center

It enables the configuration of blocks to help protect your resources. For example, protect your VMs through **Just-in-Time** (JIT) access, that blocks persistent access to VMs. This can be enabled in the Advanced Cloud Defense section of Security Center in the portal.

You can also control what applications can run in your VMs through **Adaptative Application Controls**.

### Respond to threats with Azure Security Center

You need to dismiss an alert, even if it is a false positive and you need to block known malicious IPs. Also, you must decide which alerts require more investigation.

Playbooks are automated procedures that you run against alerts to respond faster. You create a playbook by configuring a logic app using Security Center connectors and triggers.

In Threat Protection > Security Alerts, you can view and drill down into incidents and you can run configured playbooks against the alerts.

## Application Insights

Application Insights works with Azure Pipelines. When an Azure Pipelines release pipeline receives an alert from Application Insights that something went wrong, it can stop the deployment. It then rolls back the deployment until the issue that caused the alert is resolved. This way, you respond much earlier and more effectively to issues as they arise in the development lifecycle.

To make this link work, you need to use **Azure App Service deployment with continuous monitoring**, link it to your App Insights and enable gates in the pre-deployment conditions and select the gate you want, for example *Query Azure Monitor Alerts*.

> OBS: Use availability tests to continuously monitor your application from different geographic locations.

## Azure Monitor

Service for collecting, combining, and analyzing data from different sources.

All the application log data that Application Insights collects is stored in a workspace that Azure Monitor can access. You'll then have a central location to monitor and analyze the health and performance of all your applications. The same happens with Security Center, whose data can also be accessed through Azure Monitor. You can run a single query over the logs collected from your services. You can then analyze log data collected from several sources, and have a unified understanding of all of your data.

You use Azure Monitor if:

* You need a single solution to help you collect, analyze, and act on log data from both cloud and on-premises.
* You're using services such as Azure Application Insights and Azure Security Center. Those services store their collected data in workspaces for Azure Monitor. You can then use Azure Monitor Log Analytics to interactively query the data.

## Azure Sentinel

Used to analyse enterprise security. You use Azure Sentinel if:

* You want a detailed overview of your organization, potentially across multiple clouds and on-premises locations.
* You want to avoid reliance on complex and disparate tools.
* You want to use enterprise-grade AI, built by experts, to identify and handle threats across your organization.

You create an Azure Sentinel resource in the Azure portal. The process for creating this resource involves creating a Log Analytics workspace, and then adding it to Sentinel.

As per data sources, you can connect AAD and Office 365 through connectors and also other non-microsoft solutions. Afterwards, data is automatically synced. You can configure alert rules to investigate anomalies and threats more intelligently. You need to create alert **rules**. These rules allow you to specify the threats and activities that should raise alerts. You can respond manually or by using playbooks for automated responses.

When you create a rule, you need to specify whether it should be enabled or disabled at the outset. You also specify the severity of the alert, along with a rule query. For example, to check suspicious activities with VMs, you can use the following kusto query:

```
AzureActivity
 | where OperationName == "Create or Update Virtual Machine" or OperationName == "Create Deployment"
 | where ActivityStatus == "Succeeded"
 | make-series dcount(ResourceId)  default=0 on EventSubmissionTimestamp in range(ago(7d), now(), 1d) by Caller
```

Sentinel combines your generated alerts into incidents for further investigation. Use the Incidents pane to see details about your incidents, such as how many you've closed and how many remain open. The investigation map lets you drill down into an incident. You can, for example, get details about a user who is identified as part of the incident.