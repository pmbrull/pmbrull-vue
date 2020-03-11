---
title: Final Multi-Container Application
published: true
description: |
    We're still making progress into building the final application
    for the Master's thesis. So far we have been setting up 
    the ingredients to being able to prepare a process capable 
    of extracting data from two different NoSQL databases, 
    each one mounted as a Docker container.
category: Big Data
ctime: 2018-08-29
---

Summing up, there are four major pillars holding our application:

1. Container with ElasticSearch and its product data [backed up](https://pmbrull.dev/post/bigdata-eS-backup-data-in-docker).
2. Container with HBase and user data [ready](https://pmbrull.dev/post/bigdata-setting-up-hbase-in-docker).
3. Container with Python script handling the queries.
4. All three containers being under the same [network](https://pmbrull.dev/post/content/bigdata-docker-multi-container-environments).

Thus, in this post we are going to get ready the third point as an ephemeral container that when triggered, executes a function and then removes itself, freeing space for other processes to run. First of all, let's prepare the network and DB containers with alias to being able to easily connect those with our Python process:

```
docker network create app-net

docker run -d --name es --net app-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" es-custom

docker run -d --name hb --net app-net -p 9090:9090 harisekhon/hbase
```

 Now, we can check out if everything went as expected so far with `docker inspect app-net`:

```
"Containers": {
            "05870cd14615887d120b72916bcb5c7e865791a0c91ffc3e4bfe99ea21651712": {
                "Name": "es",
                "EndpointID": "0dc39999ce302d9e090e01ec82a931047b69cee8b6e7e45d6305e44b687ecc4b",
                "MacAddress": "02:42:ac:14:00:02",
                "IPv4Address": "172.20.0.2/16",
                "IPv6Address": ""
            },
            "a05810f7d5d52913afd5a7255b7d833cd3e140daea72f0549ae3f9a8c3c5e418": {
                "Name": "hb",
                "EndpointID": "c44b738bd0eb0376bbfd73192d75a0b40be7a290552e9a3ac5e5b448a741c0fc",
                "MacAddress": "02:42:ac:14:00:03",
                "IPv4Address": "172.20.0.3/16",
                "IPv6Address": ""
            }
        },
```

As we see both DBs in there, so far so good! Thus, we are going to start with the last piece of the puzzle that is going to tie it all using Python with ElasticSearch and HBase APIs. The idea here is, when receiving an input user and product, answering whether the given user can consume it or not based on the alimentary intolerances of his or her profile. Behind this simple idea all the theorization on which DB to use for both product and user data was born.

As discussed [here](https://pmbrull.dev/post/bigdata-elasticsearch-as-db-of-choice), ES fits really well for the product data, as thank's to its **Text Search** capabilities, we can get easily find out if the given product contains an ingredient querying on a rather unstructured and unprocessed field that has the same information as the real packaging. On the other hand, HBase looks like a solid choice as Random Access queries can be performed really fast having the unique user identifier as Key.

Without further delay, let's jump to the script's code. We will name the script *query.py*.

```python
from elasticsearch import Elasticsearch

import happybase
import argparse


# Initializations
es = Elasticsearch([{'host': 'es', 'port': 9200}])
hb = happybase.Connection('hb')

# Getting arguments
parser = argparse.ArgumentParser()
parser.add_argument("--productId", help="Product Identifier.")
parser.add_argument("--userId", help="User Identifier.")

args = parser.parse_args()
productId, userId = args.productId, args.userId

# Build the body of the query
query = {'query': {'bool': {
                    'must_not': [],
                    'must': {'term': {'_id': productId}}
                  }}
        }

# Get HBase values from table Users
table = hb.table('Users')
row = table.row(str.encode(userId))

intolerances = row[b'cf1:INTOLERANCIAS'].decode()

# Add to the query all forbidden ingredients
if intolerances != 'NULL':
    for i in intolerances.split(','):
        query['query']['bool']['must_not'].append({'term': {'ingredients': i}})


# Perform query and print results
res = es.search(index='products',
                body=query)

print("Got {} Hits.".format(res['hits']['total']))

if res['hits']['total'] == 0:
    print('Not Consumable')
else:
    print('Consumable')
```

What is happening here is that we are asking ES to return the product if it does not contain any forbidden ingredient. Thanks to structuring the query as a JSON, it is fairly simple to dynamically generate them independently of the user. 

An important step to remember before continuing is witting down the `requirements.txt` for our script. To get a list with the installed packages and versions, you can use:

```
pip freeze
```

Ours requirements look like this:

```
elasticsearch==6.3.0
happybase==1.1.0
```

Now, we can get started with the **Dockerfile**. We are not setting everything up using Docker Compose to being able to trigger the querying as many times as desired, so I feel like using the `run` command is an easier approach here.

```dockerfile
# Select base Image
FROM ubuntu:latest

# Get Python dependencies
RUN apt-get -yqq update
RUN apt-get -yqq install python-pip python-dev gnupg
   
# Add our code
ADD scripts /scripts
WORKDIR scripts

RUN pip install -r requirements.txt
   
# Run the command with input arguments
ENTRYPOINT ["python", "./query.py"]
```

Finally, we should have our working directory looking like this:

```bash
pmbrull@pmbrull-GE62-6QD:~/$ tree py-query/
py-query/
├── Dockerfile
└── scripts
    ├── query.py
    └── requirements.txt
```

So, let's try to build it up. It may take a while...

```
sudo docker build -t pmbrull/py-query .
```



To run it, we need to specify both user and product IDs. For the product data, we can cheat a bit now for testing purposes and use Kibana to get a product we like (recall that we have the ports linked with our local machine, so Kibana can connect to the container with no problems at all!). I love chocolate so I'll go with `Milka_Chocolate-Cacahuetes-y-Caramelo`. For the users, the one with ID 0 has no intolerances, so it is a simple way to start:

```
docker run --rm --net app-net pmbrull/py-query --productId=Milka_Chocolate-Cacahuetes-y-Caramelo --userId=0
```

```
Got 1 Hits.
Consumable
```

This is so nice! I mean, really nice! We managed to create two separated databases, populate them with data and connect a third container asking questions to both of them. Cheating again, we are going to run the process with the user with ID 5, as he is lactose intolerant and we will be able to check this other scenario:

```
docker run --rm --net app-net pmbrull/py-query --productId=Milka_Chocolate-Cacahuetes-y-Caramelo --userId=5
```

```
Got 0 Hits.
Not Consumable
```

Perfect! It has been an interesting journey, thanks to all the heroes posting their knowledge. This is me trying to do my bit, so I hope it helped someone :)
