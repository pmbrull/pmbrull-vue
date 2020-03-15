---
title: ES backup data in Docker
published: true
description: |
    Docker volumes bring us a great utility when
    managing containerized databases. Now, we are going
    to have a look on how we could restore some local 
    data into an ElasticSearch container
category: Big Data
ctime: 2018-08-25
---

The motivation behind this is having an already built-up DB with some data we want to maintain when preparing our application environment in Docker. In our case, we have product data already stored and we want our dockerized application to being able to query this same data.

I am sure there are other ways of achieving the same result, but this is the approach I could figure out, as I found nothing in the Internet involving this specific scenario:

<img src="../../images/posts/bigdata/ES-restore.png" class="h-56 my-4 justify-center m-auto">

We will divide our process in three steps:

1. Create a snapshot from local data to a given directory
2. Make user image of ElasticSearch able to reaching that snapshot
3. Backup the data inside the container

## 1. Create Snapshot

We are going to work inside the directory `/ES/` to build our final Image. That's where we need to create the Dockerfile, the `elasticsearch.yml` file that we will use for the Image and the directory with the data snapshot. Then, for the first step, we need to add the path `/ES/backup-data/` to the paths where we can create snapshots in our local DB. In order to do so, add this line to `/elasticsearch-<version>/config/elasticsearch.yml`:

```
path.repo: /ES/backup-data
```

Then, start the ES service and register a snapshot named `my_backup`:

```
curl -XPUT 'http://localhost:9200/_snapshot/my_backup' -H 'Content-Type: application/json' -d '{
  "type": "fs",
  "settings": {
    "location": "/ES/backup-data/",
    "compress": true
  }
}'
```

> We need to add: -H 'Content-Type: application/json' . This is due to **strict content-type checking** introduced in ElasticSearch 6.0, as explained in [this post](https://www.elastic.co/blog/strict-content-type-checking-for-elasticsearch-rest-requests).

Finally, create the actual snapshot:

```
curl -XPUT 'http://localhost:9200/_snapshot/my_backup/snapshot-number-one?wait_for_completion=true'
```

```
"snapshot":{"snapshot":"snapshot-number-one","uuid":"9GZw5LlERsKO273iew-0ZQ","version_id":6030099,"version":"6.3.0","indices":["bodega","pasta-arroz-y-legumbres","higiene-y-belleza","congelados","productos-bebe","limpieza-y-hogar","salsas","aceite-vinagre-y-condimentos","conservas","sopas-pures-y-caldos","mascotas","huevos-y-productos-lacteos","panaderia-y-desayunos","postres-chocolates-y-dulces",".kibana","aperitivos-y-snacks","bebidas","queso-y-embutidos","helados","cafe-infusiones-y-cacao","platos-preparados-y-masas"],"include_global_state":true,"state":"SUCCESS","start_time":"2018-08-25T17:13:38.006Z","start_time_in_millis":1535217218006,"end_time":"2018-08-25T17:13:44.599Z","end_time_in_millis":1535217224599,"duration_in_millis":6593,"failures":[],"shards":{"total":101,"failed":0,"successful":101}}}
```

If we now go to `/ES/backup-data`, we should see something similar to

```
pmbrull@pmbrull-GE62-6QD:~/ES/backup-data$ ll
total 32
drwxr-xr-x  3 root    root    4096 ago 25 19:46 ./
drwxrwxr-x  3 pmbrull pmbrull 4096 ago 25 20:08 ../
-rw-r--r--  1 root    root    1990 ago 25 19:46 index-0
-rw-r--r--  1 root    root       8 ago 25 19:46 index.latest
drwxr-xr-x 23 root    root    4096 ago 25 19:46 indices/
-rw-r--r--  1 root    root    6999 ago 25 19:46 meta-9GZw5LlERsKO273iew-0ZQ.dat
-rw-r--r--  1 root    root     460 ago 25 19:46 snap-9GZw5LlERsKO273iew-0ZQ.dat
```

Now, remember to stop our local DB.

## 2. Make ElasticSearch Image

As we have already seen in previous posts, the base file for creating an Image is the `Dockerfile`. Ours will look like this:

```dockerfile
# Use official ES Image as Base Image
FROM docker.elastic.co/elasticsearch/elasticsearch:6.3.2
# Create directory where we will store the backup
RUN mkdir /usr/share/elasticsearch/backup-data/
# Allow access
RUN chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/backup-data/
# Copy the snapshot
COPY /backup-data/ /usr/share/elasticsearch/backup-data/
# Copy the configuration
COPY elasticsearch.yml /usr/share/elasticsearch/config/
```

Following the Official Image implementation, we work in the container with `/usr/share/elasticsearch` as base directory. Basically what we are making here is creating inside the container the directory `/usr/share/elasticsearch/backup-data/` where we are copying the actual snapshot we just made. 

Again, we need to change the `elasticsearch.yml` of the Image to add the repo for the snapshots:

```
path.repo: /usr/share/elasticsearch/backup-data
network.host: 0.0.0.0
```

We also need to add the `network.host` line in order to being able to later play with `cUrl` and talk to the DB. Your directory should be similar to this:

```
pmbrull@pmbrull-GE62-6QD:$ tree ES/ 
├── backup-data
│   ├── index-0
│   ├── index.latest
│   ├── indices
│   │   ├── 125aFF0fTt6axt8HDZcAOg
...
├── Dockerfile
└── elasticsearch.yml
```

With these ingredients, we are ready to build our custom Image, which we will name *es-custom*.

```
docker build --tag=es-custom .
```

Then, start it as we have done [before](https://pmbrull.dev/post/bigdata-docker-multi-container-environments):

```
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" es-custom
```

Before going further, let's check that we haven't messed it up somewhere, so we can try to talk to the container:

```
pmbrull@pmbrull-GE62-6QD:~$ curl localhost:9200
{
  "name" : "eTASwLS",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "NigiL0w2TAKSPoOAn3ffQQ",
  "version" : {
    "number" : "6.3.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "053779d",
    "build_date" : "2018-07-20T05:20:23.451332Z",
    "build_snapshot" : false,
    "lucene_version" : "7.3.1",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

> OBS: we are making requests to localhost:9200 as before, but now we are talking to the container, no our local ElasticSearch DB, as we linked those ports with `docker run -p 9200:9200`.



## 3. Backup Data

Everything went on flawlessly! We now need to repeat the step of registering the snapshot directory:

```
curl -XPUT 'http://localhost:9200/_snapshot/my_backup' -H 'Content-Type: application/json' -d '{
  "type": "fs",
  "settings": {
    "location": "/ES/backup-data/",
    "compress": true
  }
}'
```

Here comes the exciting part. We copied the data already in the registered path, so let's try to restore it:

```
curl -XPOST 'http://localhost:9200/_snapshot/my_backup/snapshot-number-one/_restore'
```

And check if we have some loaded indexes...

```
curl -XGET 'localhost:9200/_cat/indices'
```

```
yellow open helados                      NIcJAmTfSj-nSAhfhdo0GQ 5 1 127  0 631.4kb 631.4kb
yellow open bodega                       c242YQKMQKOkRCQXiqlLHA 5 1 159  0 431.5kb 431.5kb
yellow open sopas-pures-y-caldos         vshMi8KZT0uwFojYU69MKQ 5 1 101  2 401.1kb 401.1kb
...
yellow open platos-preparados-y-masas    i0u477NOQ7KDDY4r-be9vg 5 1 203  1 710.9kb 710.9kb
green  open .kibana                      KjJ41Ze6SAekyrlUeKlzkA 1 0   8  1  52.2kb  52.2kb
```

Yay! To be next level sure, we can also query the data:

```
curl -XGET 'localhost:9200/sopas-pures-y-caldos/_search?search_type=scan&scroll=10m&size=50'  -H 'Content-Type: application/json' -d '
{
    "query" : {
        "match_all" : {}
    }
}'
```

It actually took me some time and lot's of StackOverflow surfing to get to this solution, so I hope this helps someone :)
