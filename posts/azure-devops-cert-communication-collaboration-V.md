---
title: AZ-400 - Facilitate Communication & Collaboration V
published: true
description: |
  This chapter is a small parenthesis, but explores
  an important topic when moving to the cloud: pricing.
  We will see how Azure manages costs and how we
  can plan and manage costs ourselves.
category: Cloud
ctime: 2020-10-13
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/review-planning-managing-costs/).

# Review planning and managing Azure costs

Learning Objectives:
* Explore purchasing Azure products and services.
* Define the factors that affect your cost.
* Review and use the Azure Pricing Calculator and the Azure TCO Calculator.
* List ways of minimizing your costs.

## Purchase Azure products and services

There are three types of Azure customers:
* **Web direct**: customers pay public prices for Azure resources, and their monthly billing and payments occur through the Azure website.
* **Enterprise**: customers sign an Enterprise Agreement with Azure that commits them to spending a negotiated amount on Azure services. Payments are usually annually, but that can be customized.
* **Cloud Solution Provider**: Microsoft partner companies that a customer hires to build solutions on top of Azure.

## Explore factors affecting costs

When you provision an Azure resource, Azure creates one or more meter instances for that resource. The meters track the resources' usage, and each meter generates a usage record that is used to calculate your bill. Some usage meters are Compute Hours, IP Address Hours or Standard IO-Disk.

Costs are resource-specific, so the usage that a meter tracks and the number of meters associated with a resource depend on the resource type.

Also, note that costs may vary in different locations.

## Identify zones for billing purposes

Billing zones help determine the cost of services you are using. There are four different zones:
* Zone 1 – West US, East US, Canada West, West Europe, France Central and others
* Zone 2 – Australia Central, Japan West, Central India, Korea South and others
* Zone 3 - Brazil South
* DE Zone 1 - Germany Central, Germany Northeast

> OBS: A Zone for billing purposes is not the same as an Availability Zone. In Azure, the term Zone is for billing purposes only, and the full-term Availability Zone refers to the failure protection that Azure provides for datacenters.

## Explore the Pricing Calculator

The [pricing calculator](https://azure.microsoft.com/pricing/calculator) is a tool thats helps us to **estimate** costs of Azure products. We put data about region and tier and we get the billing options, support options, offers and dev/test pricing.

To put together our estimate, we will use the Products tab.

## Explore Total Cost of Ownership Calculator

The [Total Cost of Ownership Calculator](https://azure.microsoft.com/pricing/tco) is a tool that you use to estimate cost savings you can realize by migrating to Azure.

By putting information about servers, databases, storage and networking happening on-premises and then adjusting some assumptions, you get a full report of savings.

## Explore minimizing costs

There are some strategies we can follow when trying to minimize costs:

* We can minimize costs by using Azure Advisor, which will identified unused or under-utilized resources. On top of this, Azure Advisor will provide recommendations for high availability, security, performance and operational excellence.
* Moreover, Free trial customers and some credit-based Azure subscriptions can use the Spending Limits feature to not be charged with unexpected expenditures. 
* Using Azure Reservations we can get discounted prices on some services by reserving them and paying in advance.
* Deploy services in low cost regions.

## Define Azure Cost Management

[Cost Management](https://azure.microsoft.com/services/cost-management) is an Azure product that provides a set of tools for monitoring, allocating, and optimizing your Azure costs. Its main features are:

* **Reporting**: Generate reports using historical data to forecast future usage and expenditure.
* **Data enrichment**: Improve accountability by categorizing resources with tags that correspond to real-world business and organizational units.
* **Budgets**: Create and manage cost and usage budgets by monitoring resource demand trends, consumption rates, and cost patterns.
* **Alerting**: Get alerts based on your cost and usage budgets.
* **Recommendations**: Receive recommendations to eliminate idle resources and to optimize the Azure resources you provision.
* **Price**: Free to Azure customers.
