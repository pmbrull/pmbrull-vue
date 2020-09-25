---
title: AZ-400 - Develop an Instrumentation Strategy X
published: true
description: |
  We've been talking and talking about making designs that capture
  data that we can then use to monitor our infrastructure. Let's see
  how we can use Azure Event Grid to receive events from multiple 
  sources and Logic Apps to react to these events.
category: Cloud
ctime: 2020-09-25
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/react-to-state-changes-using-event-grid/).

# React to state changes in your Azure services by using Event Grid

Learning objectives:
* Describe the capabilities and use cases for Event Grid
* Create an application that handles events with Event Grid and Logic Apps

## Respond to Azure events by using Event Grid & Logic App

Event Grid is a service that manages the routing of events from any sources and delivery to any destination. Event publishers and subscribers are decoupled by using the publisher/subscriber pattern (where publishers just categorize the messages into classes - **topics** - without knowledge of what subscribers, if any, are ingesting those events. At the same time, subscribers are not aware of specific publishers).

Event Grid doesn't require provisioning or managing. It's native to Azure, with the ability to be extended and customized, it has 24-hour retries to ensure reliability and can handle millions of events per second.

> OBS: You can also use a webhook handler to call a custom endpoint outside Azure as subscribers.

Subscriptions convey which events on a topic you're interested in receiving. These events can then be filtered by type or subject. A subscriber example could be a Logic App.

Note that when you create a logic app you can select a bunch of different triggers. Azure Event Grid manages natively events named *When a resource event occurs*, for example. Then, the resource name would be `Microsoft.Resources.ResourceGroups` and you can subscribe to multiple events such as `Microsoft.Resources.ResourceActionSuccess` and `Microsoft.Resources.ResourceDeleteSuccess`. Then, you can deep dive into the json describing the event using expressions such as `triggerBody()?['data']['operationName']` to apply conditions or any other logic you might need. A useful approach when subscribing to RG events would be sending information emails.
