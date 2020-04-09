---
title: Process Logging with Azure Data Factory
published: true
description: |
    Building ETL pipelines with Azure Data Factory is
    easy thanks to its intuitive UI. However, if
    we try to get a bit beyond the surface, there are
    aspects a bit tricky to find in the docs, so now
    we are going to explore a couple of interesting
    features.
category: Cloud
ctime: 2020-04-09
---

Azure Data Factory (ADF) is the go-to tool when we are building **pipelines** in the cloud with Azure. It has beyond great integration with different services that we usually want to tie together such as Azure SQL (for storing logs and metadata) and Databricks (where the real magic happens with the data).

As a first approach, one can get started really fast with the UI, setting all the logic and even adding flow control with conditionals and loops*, but in this post we are going to get into how we can correctly organize our processes **logging**.

> *OBS: Be careful with loops! As cost also happens per activity.

It is true that ADF brings us a great monitoring tool where we can keep track the history of executions, but those are only visuals. We cannot build dashboards and automate KPIs based on that! That's why we try to keep processes well organized and logged with external services and to do so properly, we need to access the internal values of pipelines and activities.

## Pipeline Variables

This first set of parameters that we are going to use is easy to find in the [docs](https://docs.microsoft.com/bs-latn-ba/azure/data-factory/control-flow-system-variables), but yet it's useful knowing that they exist in the first place, so we'll start with those.

Thanks to pipeline variables we can create activities that feed on the pipeline metada: pipeline name, its internal id, information about the trigger... To invoke those, we just need to make use of ADF's **dynamic content**, so we could retrieve the name and `runId` as:

```
@pipeline().Pipeline
@pipeline().RunId
```

Then, those can be treated as regular parameters and inserted into our logging table via another activity or by calling a stored procedure.

## Activity Variables

Now, what if we need to log the results of a previous activity? Let's have a review on the info regarding the [Lookup Activity](https://docs.microsoft.com/en-us/azure/data-factory/control-flow-lookup-activity), which can be used to obtain data from a **Dataset**. Therefore, we want to do something with what we obtain back. This can be achieved again thanks to dynamic content. To get some values we could do:

```
@activity('LookupActivity').output.firstRow.myColumn
```

Where we would be taking the *myColumn* property from the source Dataset.

> OBS: Note that dynamic parameters can be thought in the end as a JSON, and we can keep navigating into its nested structures via dots `.`.

Again, so far so good. Getting into the docs for the different activities we are interested in we can find information about how to retrieve its data. However, what was a bit harder to find was how to get a variable with the errors of a previous activity. This is a usual scenario, where we want to keep track of the error messages we obtain in our logging table. Let's keep going with our Lookup example:

```
@activity('LookupActivity').output.errors
```

However, if we stopped here, we would just see in our logs the definition of a rather cryptic ADF object used to store the errors in a list. Thus, as the magic work here is list and we know that everything is a JSON, we could continue as:

```
@activity('LookupActivity').output.errors[0].Message
```

Obtaining the real message that caused our activity to fail.

This was quite a flash post, but we've reviewed how we can make use of dynamic content to create flexible pipelines and feed logging tables based on our processes.
