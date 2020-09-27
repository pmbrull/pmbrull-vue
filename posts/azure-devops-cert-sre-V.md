---
title: AZ-400 - Develop SRE strategy V
published: true
description: |
  Last chapter of monitoring! We've already seen a ton of services:
  Azure Monitor, App Insights, Azure Sentinel, how to troubleshoot
  Azure Load Balancer... To conclude with the huge core, app & infrastructure
  monitoring (and alerting), we first need to review monitoring of
  VMs.
category: Cloud
ctime: 2020-09-30
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/monitor-azure-vm-using-diagnostic-data/).

# Monitor the health of your Azure virtual machine by using Azure Metrics Explorer and metric alerts

Learning objectives:
* Identify metrics and diagnostic data that you can collect for virtual machines
* Configure monitoring for a virtual machine
* Use monitoring data to diagnose problems

## Monitor the health of the virtual machine

In the portal we can view and graph the basic metrics of a VM:
* CPU usage
* Network traffic
* OS disk usage
* Boot success

Note that we can build our own KPI dashboard based on the information of our VMs.

To get a richer set of metrics, we need to install the Azure Diagnostics extension and the Log Analytics agent. Both tools are available for Windows and Linux, and they need a storage account to save the collected data.

After the installation, we can access near real-time data and:

* Investigate boot issues with enhanced boot diagnostics.
* Archive logs and metrics for future analysis.
* Autoscale virtual machine scale sets, depending on VM performance.
* Get app-level metrics by using Application Insights.
* Automate OS updates.
* Track VM configuration changes over time.

### Install & configure the Azure Diagnostics extension

* When creating a new VM: Monitoring > set OS guest diagnostics On.
* If the VM is already created: Monitoring > Diagnostic Settings > Enable guest-level monitoring.

It can also be done via `Set-AzVMDiagnosticsExtension` in PS.

> OBS: Crash dumps and Sink data (Azure Monitor, Application Insights), is not available for Linux machines.

The configuration is changed in the same place for both operating systems, on the Diagnostic settings page.


### DDoS attack

To create a chart or alert for a DDoS attack, in the Azure portal: Monitor > Metrics.Specify your public IP address as the resource to monitor and add DDoS metrics, including Under DDoS attack. We then add an alert to be notified of an attack.

We don't have to install the Azure Diagnostics extension to be alerted about DDoS attacks. The alert is on the public IP address resource, not the VM.
