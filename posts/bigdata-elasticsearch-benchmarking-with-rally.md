---
title: ElasticSearch benchmarking with Rally
published: true
description: |
    Analyzing correctly the performance of a database
    is not an easy task. When we want to benchmark its
    behavior there are lots of metrics involved and
    we need to have a clear idea of what queries we are
    interested in. In this post we are going to explore
    an amazing tool that will make our lives easier when
    benchmarking ElasticSearch!
category: Big Data
ctime: 2018-08-29
---

In another [post](https://pmbrull.dev/post/bigdata-elasticsearch-as-db-of-choice) we tried to briefly motivate the use of ElasticSearch for storing product data. There, we opened a question regarding the architecture of the database. What is it better to use in terms of query performance:

1. One general index containing all the products.
2. Separated indexes by product category.

The data we have available is just a sample of products that we managed to scrap online. It contains around 6k different entries. However, our theoretical range of products is limited to supermarket products, so if we were trying to estimate which would be the total number of different products sold in supermarkets in my country, I'd make a safe guess of ~20k (and I feel like I would be way up). When considering quantities like these, we are hardly speaking of Big Data in terms of the V of Volume, so the performance level of a single index is out of doubt, but also for separated indexes.

## Query benchmarking 

That is why we need benchmarking techniques, to actually test both scenarios and get prove where heuristics have no power. Going back a little bit, we are using just two queries to retrieve information from ES:

```python
"query": {"bool": {
             "must": {"term": {"_id": <productID>}}
             }
         }  
```

   ```python
"query": {"bool": {
              "must_not": [{"term": {"ingredients": <Intolerances>}}],
              "must": {"term": {"_id": <productID>}}
              }
         }
   ```

Depending on the user profile, we may be dynamically adding a list of forbidden ingredients to the query and we are interested in a True/False kind of answer to know if the productID can be recommended to the given user or not. In the first scenario there is no further trouble, as we will be running the queries on the *products* index. 

On the other hand, though, having a unique category assigned for each product means that for the multiple index case we could either query on all indexes or query already on the specific category. As the run-on-everything strategy would mean that either less data needs to be sent among the different processes or that we could avoid another query (for example on another HBase table) to get the mapping *product - category*, we will just advocate for simplicity. Also, if we had to run a previous query to get the information we need to run the actual query... Performance would be definitively worse.

## Introduction to ES Rally

Looking around for what seemed to be the best way of attacking these benchmarks, I found ElasticSearch's [Rally](https://github.com/elastic/rally). It got a bit laborious at first to really understand what was going on, but it ended up having an interesting mechanism and a lot of features, having in mind that it had been released a couple of years ago. Getting the information from their Github page, we are interested in these 3 points:

- Setup and teardown of an Elasticsearch cluster for benchmarking, which I find it to be the cleanest and safest way of actually testing performance, as in a development environment the database may not be in its best shape. 
- Running benchmarks and recording results, allowing us to export them to .csv for further analysis.
- Comparing performance results.

To make it work, we just need to `pip install esrally` and prepare some files it needs. The setup might not be really fast, but keeping in mind the first point it actually does not seem as much work for what you get back. So, as an example, we can go through the preparation of the environment for the one index scenario. The structure we will work with looks like this:

```bash
products-one-index/
├── challenges
│   └── index-and-query.json
├── index.json
├── operations
│   └── op.json
├── products.json
└── track.json
```

There are already some key words: **track**, **challenges** and **operations**. 

## Tracks

A **track** is the main part of the process, where we specify what will happen and on what data. Putting it in terms of Rally, it is what defines a *race*.

```python
{ % import "rally.helpers" as rally with context % }

{
  "version": 2,
  "description": "Benchmark for one-index product data",
  "indices": [
    {
      "name": "products",
      "body": "index.json",
      "types": ["products"]
    }
  ],
  "corpora": [
    {
      "name": "products",
      "documents": [
        {
          "source-file": "products.json",
          "document-count": 6302,
          "uncompressed-bytes": 5008002
        }
      ]
    }
  ],
  "operations": [
    { { rally.collect(parts="operations/*.json") } }
  ],
  "challenges": [
    { { rally.collect(parts="challenges/*.json")  } }
  ]
}
```

In this file, we are giving information about the name of the indices we want to load into the DB. In this case, it is just one. The actual data is stored in `products.json` and the [mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) in `index.json`.

> OBS: The products.json file should have one line per product. If you somehow happen to have it *prettyfied*, the document-count field and the actual numbering of the file won't match and thus raise an error.

> OBS2: As shown in Rally's [docs](https://esrally.readthedocs.io/en/stable/), to check the number of files of a document you can run `wc -l <file>`. 

## Operations

As for the **operations** field, there we can specify an array of tasks that can be executed:

```python
{
  "name": "delete",
  "operation-type": "delete-index"
},
{
  "name": "create",
  "operation-type": "create-index"
},
{
  "name": "wait-for-green",
  "operation-type": "cluster-health",
  "request-params": {
    "wait_for_status": "green"
  }
},
{
  "name": "query-match-all",
  "operation-type": "search",
  "body": {
  "query": {
    "match_all": {}
    }
  }
},
{   
  "name": "query-find-one-out",
  "operation-type": "search",
  "body": {
    "query": {"bool": {
              "must_not": [{"term": {"ingredients": "leche"}}],
              "must": {"term": {"_id": "Milka_Chocolate-Cacahuetes-y-Caramelo"}}
            }}
    }
},
{   
  "name": "query-find-one-in",
  "operation-type": "search",
  "body": {
    "query": {"bool": {
              "must": {"term": {"_id": "Milka_Chocolate-Cacahuetes-y-Caramelo"}}
            }}
    }
}
```

Note that we added both of the queries with real data to be run. Also we added the match_all query *pour le fun*. 

## Challenges

However, the operations file is just for definition. To create actual workloads or benchmarking scenarios we need **challenges**, where we can add the operations defined previously by their name and some run options, such as the number of *clients*, the number of *requests* sent to ElasticSearch (iterations) or the number of operations that ElasticSearch can perform per second (throughput):

```python
{
  "name": "index-and-query",
  "default": true,
  "schedule": [
    {
      "operation": "delete"
    },
    {
      "operation": "create"
    },
    {
      "operation": "wait-for-green"
    },
    {
      "operation": "query-match-all",
      "clients": 1,
      "warmup-iterations": 1000,
      "iterations": 1000,
      "target-throughput": 100
    },
    {
      "operation": "query-find-one-out",
      "clients": 1,
      "warmup-iterations": 1000,
      "iterations": 1000,
      "target-throughput": 100
    },
    {
      "operation": "query-find-one-in",
      "clients": 1,
      "warmup-iterations": 1000,
      "iterations": 1000,
      "target-throughput": 100
    }
  ]
}
```

> To have everything the tidiest as possible, I recommend using Jinja2 templating tools. Otherwise the whole file can end up being quite big and it is therefore easy to get lost. Also, defining both operations and challenges in separated files can make them reusable among different races.

## Races

Now, we are ready to get the benchmark data for this track by running a race

```bash
esrally --distribution-version=6.3.0 --track-path=~/.rally/benchmarks/tracks/products-one-index
```

and we get the following output with detailed metrics:

```bash
    ____        ____
   / __ \____ _/ / /_  __
  / /_/ / __ `/ / / / / /
 / _, _/ /_/ / / / /_/ /
/_/ |_|\__,_/_/_/\__, /
                /____/

[INFO] Preparing for race ...
[INFO] Racing on track [products-one-index], challenge [index-and-query] and car ['defaults'] with version [6.3.0].

[INFO] Preparing file offset table for [/home/pmbrull/.rally/benchmarks/tracks/products-one-index/products.json] ... [OK]
Running delete                                                                 [100% done]
Running create                                                                 [100% done]
Running wait-for-green                                                         [100% done]
Running query-match-all                                                        [100% done]
Running query-find-one-out                                                     [100% done]
Running query-find-one-in                                                      [100% done]

------------------------------------------------------
    _______             __   _____                    
   / ____(_)___  ____ _/ /  / ___/_________  ________ 
  / /_  / / __ \/ __ `/ /   \__ \/ ___/ __ \/ ___/ _ \
 / __/ / / / / / /_/ / /   ___/ / /__/ /_/ / /  /  __/
/_/   /_/_/ /_/\__,_/_/   /____/\___/\____/_/   \___/ 
------------------------------------------------------

|   Lap |                         Metric |               Task |       Value |   Unit |
|------:|-------------------------------:|-------------------:|------------:|-------:|
|   All |               Median CPU usage |                    |        33.5 |      % |
|   All |             Total Young Gen GC |                    |       0.047 |      s |
|   All |               Total Old Gen GC |                    |       0.025 |      s |
|   All |                     Store size |                    | 1.07102e-06 |     GB |
|   All |                  Translog size |                    | 5.12227e-07 |     GB |
|   All |                     Index size |                    | 3.62936e-06 |     GB |
|   All |                Totally written |                    | 0.000221252 |     GB |
|   All |         Heap used for segments |                    |           0 |     MB |
|   All |       Heap used for doc values |                    |           0 |     MB |
|   All |            Heap used for terms |                    |           0 |     MB |
|   All |            Heap used for norms |                    |           0 |     MB |
|   All |           Heap used for points |                    |           0 |     MB |
|   All |    Heap used for stored fields |                    |           0 |     MB |
|   All |                  Segment count |                    |           0 |        |
|   All |                 Min Throughput |    query-match-all |      100.03 |  ops/s |
|   All |              Median Throughput |    query-match-all |      100.05 |  ops/s |
|   All |                 Max Throughput |    query-match-all |      100.07 |  ops/s |
|   All |        50th percentile latency |    query-match-all |     3.24369 |     ms |
|   All |        90th percentile latency |    query-match-all |      3.8128 |     ms |
|   All |        99th percentile latency |    query-match-all |     4.59064 |     ms |
|   All |      99.9th percentile latency |    query-match-all |     29.0425 |     ms |
|   All |       100th percentile latency |    query-match-all |     37.3481 |     ms |
|   All |   50th percentile service time |    query-match-all |     3.09338 |     ms |
|   All |   90th percentile service time |    query-match-all |     3.66589 |     ms |
|   All |   99th percentile service time |    query-match-all |     4.27389 |     ms |
|   All | 99.9th percentile service time |    query-match-all |     5.01174 |     ms |
|   All |  100th percentile service time |    query-match-all |     37.2434 |     ms |
|   All |                     error rate |    query-match-all |           0 |      % |
|   All |                 Min Throughput | query-find-one-out |      100.03 |  ops/s |
|   All |              Median Throughput | query-find-one-out |      100.05 |  ops/s |
|   All |                 Max Throughput | query-find-one-out |      100.08 |  ops/s |
|   All |        50th percentile latency | query-find-one-out |     3.12489 |     ms |
|   All |        90th percentile latency | query-find-one-out |     3.41151 |     ms |
|   All |        99th percentile latency | query-find-one-out |     3.99409 |     ms |
|   All |      99.9th percentile latency | query-find-one-out |      4.5927 |     ms |
|   All |       100th percentile latency | query-find-one-out |     7.47395 |     ms |
|   All |   50th percentile service time | query-find-one-out |     2.96782 |     ms |
|   All |   90th percentile service time | query-find-one-out |     3.27527 |     ms |
|   All |   99th percentile service time | query-find-one-out |     3.87974 |     ms |
|   All | 99.9th percentile service time | query-find-one-out |     4.50381 |     ms |
|   All |  100th percentile service time | query-find-one-out |     7.35217 |     ms |
|   All |                     error rate | query-find-one-out |           0 |      % |
|   All |                 Min Throughput |  query-find-one-in |      100.04 |  ops/s |
|   All |              Median Throughput |  query-find-one-in |      100.05 |  ops/s |
|   All |                 Max Throughput |  query-find-one-in |      100.07 |  ops/s |
|   All |        50th percentile latency |  query-find-one-in |     3.02929 |     ms |
|   All |        90th percentile latency |  query-find-one-in |     3.25115 |     ms |
|   All |        99th percentile latency |  query-find-one-in |     3.86172 |     ms |
|   All |      99.9th percentile latency |  query-find-one-in |     7.12068 |     ms |
|   All |       100th percentile latency |  query-find-one-in |     14.3816 |     ms |
|   All |   50th percentile service time |  query-find-one-in |     2.87579 |     ms |
|   All |   90th percentile service time |  query-find-one-in |      3.1136 |     ms |
|   All |   99th percentile service time |  query-find-one-in |     3.72067 |     ms |
|   All | 99.9th percentile service time |  query-find-one-in |     5.74683 |     ms |
|   All |  100th percentile service time |  query-find-one-in |     14.2447 |     ms |
|   All |                     error rate |  query-find-one-in |           0 |      % |

--------------------------------
[INFO] SUCCESS (took 99 seconds)
--------------------------------
```

> Note that on the line `car ['defaults']` , a Rally *car* is a specific configuration of Elasticsearch.

> For the meaning of each metric, you can refer to [Metric Keys](https://esrally.readthedocs.io/en/stable/metrics.html#metric-keys).

## Tournaments

So far we learnt how to prepare a track, with both its operations and challenges. Now it's time to replicate this with a bit more of work, as we need to separately create a .json file with the products for each category their related information regarding counting and size.

After running the product-mult-index track, we can then run `esrally list races`:

```bash
Recent races:

Race Timestamp    Track                Track Parameters    Challenge        Car       User Tags
----------------  -------------------  ------------------  ---------------  --------  -----------
20180907T183729Z  products-mult-index                      index-and-query  defaults
20180907T181500Z  products-one-index                       index-and-query  defaults
```

And from the Race ID info, we can use yet another functionality that Rally gives us: **Tournaments** to compare one baseline race with another contender. Using products-one-index as baseline vs products-mult-index:

```bash
esrally compare --baseline=20180907T181500Z --contender=20180907T183729Z
```

```bash
    ____        ____
   / __ \____ _/ / /_  __
  / /_/ / __ `/ / / / / /
 / _, _/ /_/ / / / /_/ /
/_/ |_|\__,_/_/_/\__, /
                /____/


Comparing baseline
  Race timestamp: 2018-09-07 18:15:00
  Challenge: index-and-query
  Car: defaults

with contender
  Race timestamp: 2018-09-07 18:37:29
  Challenge: index-and-query
  Car: defaults

------------------------------------------------------
    _______             __   _____                    
   / ____(_)___  ____ _/ /  / ___/_________  ________ 
  / /_  / / __ \/ __ `/ /   \__ \/ ___/ __ \/ ___/ _ \
 / __/ / / / / / /_/ / /   ___/ / /__/ /_/ / /  /  __/
/_/   /_/_/ /_/\__,_/_/   /____/\___/\____/_/   \___/ 
------------------------------------------------------

|                         Metric |               Task |    Baseline |   Contender |     Diff |   Unit |
|-------------------------------:|-------------------:|------------:|------------:|---------:|-------:|
|             Total Young Gen GC |                    |       0.047 |       0.274 |    0.227 |      s |
|               Total Old Gen GC |                    |       0.025 |       0.022 |   -0.003 |      s |
|                     Store size |                    | 1.07102e-06 | 2.14204e-05 |    2e-05 |     GB |
|                  Translog size |                    | 5.12227e-07 | 1.02445e-05 |    1e-05 |     GB |
|                     Index size |                    | 3.62936e-06 | 6.95037e-05 |    7e-05 |     GB |
|                Totally written |                    | 0.000221252 |  0.00379944 |  0.00358 |     GB |
|         Heap used for segments |                    |           0 |           0 |        0 |     MB |
|       Heap used for doc values |                    |           0 |           0 |        0 |     MB |
|            Heap used for terms |                    |           0 |           0 |        0 |     MB |
|            Heap used for norms |                    |           0 |           0 |        0 |     MB |
|           Heap used for points |                    |           0 |           0 |        0 |     MB |
|    Heap used for stored fields |                    |           0 |           0 |        0 |     MB |
|                  Segment count |                    |           0 |           0 |        0 |        |
|                 Min Throughput |    query-match-all |     100.034 |     100.031 | -0.00333 |  ops/s |
|              Median Throughput |    query-match-all |     100.052 |     100.041 |  -0.0107 |  ops/s |
|                 Max Throughput |    query-match-all |     100.073 |     100.052 | -0.02063 |  ops/s |
|        50th percentile latency |    query-match-all |     3.24369 |     3.95991 |  0.71622 |     ms |
|        90th percentile latency |    query-match-all |      3.8128 |     4.63576 |  0.82296 |     ms |
|        99th percentile latency |    query-match-all |     4.59064 |     6.10055 |  1.50992 |     ms |
|      99.9th percentile latency |    query-match-all |     29.0425 |      15.115 | -13.9275 |     ms |
|       100th percentile latency |    query-match-all |     37.3481 |     15.4926 | -21.8555 |     ms |
|   50th percentile service time |    query-match-all |     3.09338 |     3.88191 |  0.78853 |     ms |
|   90th percentile service time |    query-match-all |     3.66589 |     4.53843 |  0.87254 |     ms |
|   99th percentile service time |    query-match-all |     4.27389 |     5.46505 |  1.19116 |     ms |
| 99.9th percentile service time |    query-match-all |     5.01174 |     15.0385 |  10.0267 |     ms |
|  100th percentile service time |    query-match-all |     37.2434 |      15.417 | -21.8264 |     ms |
|                     error rate |    query-match-all |           0 |           0 |        0 |      % |
|                 Min Throughput | query-find-one-out |     100.034 |     100.023 |  -0.0109 |  ops/s |
|              Median Throughput | query-find-one-out |     100.054 |     100.044 | -0.01061 |  ops/s |
|                 Max Throughput | query-find-one-out |     100.081 |      100.07 | -0.01085 |  ops/s |
|        50th percentile latency | query-find-one-out |     3.12489 |     4.01702 |  0.89214 |     ms |
|        90th percentile latency | query-find-one-out |     3.41151 |     5.18057 |  1.76906 |     ms |
|        99th percentile latency | query-find-one-out |     3.99409 |     7.52082 |  3.52673 |     ms |
|      99.9th percentile latency | query-find-one-out |      4.5927 |     13.0644 |  8.47175 |     ms |
|       100th percentile latency | query-find-one-out |     7.47395 |     15.1906 |  7.71669 |     ms |
|   50th percentile service time | query-find-one-out |     2.96782 |     3.92353 |  0.95571 |     ms |
|   90th percentile service time | query-find-one-out |     3.27527 |     5.07626 |  1.80099 |     ms |
|   99th percentile service time | query-find-one-out |     3.87974 |     6.93658 |  3.05684 |     ms |
| 99.9th percentile service time | query-find-one-out |     4.50381 |     12.9866 |  8.48279 |     ms |
|  100th percentile service time | query-find-one-out |     7.35217 |     15.1226 |  7.77045 |     ms |
|                     error rate | query-find-one-out |           0 |           0 |        0 |      % |
|                 Min Throughput |  query-find-one-in |     100.036 |     100.031 | -0.00537 |  ops/s |
|              Median Throughput |  query-find-one-in |     100.055 |     100.041 | -0.01355 |  ops/s |
|                 Max Throughput |  query-find-one-in |      100.07 |     100.069 | -0.00167 |  ops/s |
|        50th percentile latency |  query-find-one-in |     3.02929 |     4.05956 |  1.03027 |     ms |
|        90th percentile latency |  query-find-one-in |     3.25115 |     4.48395 |  1.23281 |     ms |
|        99th percentile latency |  query-find-one-in |     3.86172 |     7.40097 |  3.53925 |     ms |
|      99.9th percentile latency |  query-find-one-in |     7.12068 |     15.1473 |  8.02661 |     ms |
|       100th percentile latency |  query-find-one-in |     14.3816 |     15.7903 |  1.40875 |     ms |
|   50th percentile service time |  query-find-one-in |     2.87579 |     3.98709 |   1.1113 |     ms |
|   90th percentile service time |  query-find-one-in |      3.1136 |      4.3907 |   1.2771 |     ms |
|   99th percentile service time |  query-find-one-in |     3.72067 |     5.40816 |  1.68749 |     ms |
| 99.9th percentile service time |  query-find-one-in |     5.74683 |     15.0754 |  9.32856 |     ms |
|  100th percentile service time |  query-find-one-in |     14.2447 |     15.7206 |  1.47586 |     ms |
|                     error rate |  query-find-one-in |           0 |           0 |        0 |      % |

-------------------------------
[INFO] SUCCESS (took 1 seconds)
-------------------------------
```

Where we can see that running the match_all query gives better results for the multiple indexes design at 100th percentile, but for the queries that really matter to us, both **latency** and **service time** are constantly higher. Which means, that we can keep the one and only index as final architectural decision. 

> OBS: Interesting explanation on why use percentile when talking about latency: [link](https://www.elastic.co/blog/averages-can-dangerous-use-percentile).

## Data Visualization

Visualizing results makes things easier. Although we already know which option works better for our use-case, we can observe tendencies better with some plots:

<img src="../../images/posts/bigdata/benchmarking-match-all.png" class="h-96 my-4 justify-center m-auto">


For the match_all query, multiple indexes perform better when considering the whole result data. However, just looking until the 99th percentile still gives better results for a unique index. The huge jump when taking more than that percentage may be explained by the presence of outliers. Still, we want our application to give fast responses to everyone, so we could be conservative and consider this type of query a win for the multiple indexes.

This varies for the queries we intend to apply though, where we always find better performance with a unique index:

<img src="../../images/posts/bigdata/benchmarking-match-one.png" class="h-96 my-4 justify-center m-auto">

<img src="../../images/posts/bigdata/benchmarking-find-one-out.png" class="h-96 my-4 justify-center m-auto">

And in both cases, the mean is less than a half, showing smaller outliers and being sure that in less than 14 ms, we will be able to reach the data.

Hope this helped someone :)
