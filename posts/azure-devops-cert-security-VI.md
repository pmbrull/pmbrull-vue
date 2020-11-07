---
title: AZ-400 - Develop a Security Compliance Plan VI
published: true
description: |
  Azure AD is one of the main pillars in the Azure cloud.
  It allows us to give permissions to specific users, groups
  and applications and fine-grain the access to the data
  that we manage. This means that it is mandatory to
  have a monitoring solution in place to properly 
  handle security of AAD.
category: Cloud
ctime: 2020-10-06
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/monitor-report-aad-security-events/).

## Monitor and report on security events in Azure AD

Learning objectives:
* Store Azure audit activity and sign-in activity logs in Azure Monitor.
* Create alerts for security events in Azure Monitor.
* Create and view dashboards to support improved monitoring.

## Use sign-in, audit, and provisioning logs to detect suspicious activity

AAD captures logs from all the tenant related to user behavior and interactions in the network and their assets. There are types of logs that might require special attention:

### Azure sign-in log files

Hold a copy of all attempts to manual sign in to your network (not automatic sign-in). They can be useful to check for user sign-in trends and overall status of users in our network.

Access to these logs is restricted. We need an Azure premium (or better) subscription and a user with Global Administrator, Report Reader, Security Reader, or Security Administrator role or permissions.

To access this data: Portal > AAD > Monitor > Sign-ins. The data will be about the user, timestamp, application that made the request... And we can add or remove columns based on a predefined list. 

### Azure audit log files

Provide a history of every task that's done in your tenant. Audit logs are maintained for compliance.

This data is also restricted, so we need the same permissions as with the sign-in log files.

The data hosted controls data, service, category...

> OBS: Here we will also find information about identity protection.

### Filter and Download

With both logs, the data can be filtered based on their columns to for example search for failed sign-ins or specific service categories. We can also download the data as csv or json, but we are limited to the most 250k recent rows.

### Access audit logs through users, groups, and enterprise applications

If we access this data with users or applications, it is filtered to only show our data.

## Integrate activity logs with Azure Monitor logs

Now we will see how to set up a Log Analytics workspace to hold and store the audit and sign-in log data and send the files to Azure Monitor. Note how after we have everything integrated in Azure Monitor, we can setup alerts there as with usual resources.

Moreover, we need to have the permissions listed above to access the log files.

### The Log Analytics workspace

Before importing the data to Azure Monitor, it needs to be gathered in a Log Analytics workspace. Note that each workspace is unique and has its own data repository and configuration, so we can create a new one for this purpose: Portal > Log Analytics workspaces > Add > Create New.

> OBS: All the data of sign-in and audit logs will take about 5 GB per month with a 1k users tenant.

To send the data to Azure Monitor: Portal > AAD > Monitoring > Diagnostic Settings > Create the connection between log files and Log Analytics workspace > Send to Log Analytics and configure which log files (Audit or Sign-in or both) we want to send.

### Analyze in Azure Monitor

We already know how to write queries there. In Kusto we can write table-based or search-based queries. The tables for the logs will be named after **SignInLogs** or **AuditLogs**. An example query would be:

```
SigninLogs
| where CreatedDataTime >= ago(7d)
| summarize signInCount = count() by AppDisplayName
| sort by signInCount desc
```

We can then create alerts clickin "Set Alert" by the results of a query and set a threshold value against the rule set.

### Visualization

In Github there are some prebuilt views we can import, but we can also create custom graphics with Kusto queries and create a security dashboard to easily monitor AAD. Then it can be exported to Excel or PowerBI.
