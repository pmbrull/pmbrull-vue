---
title: Docker's multi-container Environments
published: true
description: |
    While it may be simple to prepare single Docker container
    applications, those usually don't solve all of our needs.
    Let's discuss how we can manage multiple containers to
    achieve a decoupled application with independent pieces
    that allow for fine-grained control on our system.
category: Big Data
ctime: 2018-08-21
---

In the last posts of this Docker series, we saw a motivation about this technology and also a brief introduction into both its terms and practices. We managed containers from the registry and also built our own images playing around with Dockerfiles. However, not everything is as simple as preparing a single container getting all the work done. Although being already useful, there usually are dependencies among many other parts of the same applications (and even more in a big data environment as we are talking about loosely-coupled systems), and Docker brings us a way to comfortably handle those needs.

In this post, we are going to introduce Multi-Container Environments, how to prepare them and how they are able to talk to each other flawlessly. Again, this is just me putting my head together around this incredible [tutorial](https://docker-curriculum.com/), where you will find further examples and explanations, so a big thank you to the author! That post is kind of a life saver as we are also using ElasticSearch in the master's degree thesis (more on that [here](https://pmbrull.dev/post/bigdata-elasticsearch-as-db-of-choice)), so we'll go through the ES with Docker part as well :)

First of all, the good thing about using ElasticSearch here is that it has an official image, so there is no chance to miss the shot. We can use the `search` command to look for available images and then pull the one we are interested in:

```
docker search elasticsearch
```

```
docker pull docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

We will run the container in detached mode from our terminal, give it an alias **es**, which will be useful later, and link some ports to our machine. For the sake of simplicity, let's just run it as a single-node.

```
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

## Docker Network: Connecting Containers


Now that we have our database up and running, it would be time to add at least another container which needs to feed from that data or save there some information. The idea here is making sure that both containers understand each other. As Docker brings the abstraction level a long way up, sometimes it is hard to remember that a container is just a small and precise VM, but as a VM, it needs a network for communicating with others. Thus, let's check how those are handled:

```
docker network ls
```

```
NETWORK ID          NAME                DRIVER              SCOPE
bcf266bc412d        bridge              bridge              local
98284015673b        host                host                local
c01e0480e9ac        none                null                local
```

This command will show us the available networks that containers can use. One of those will be the network **bridge**, and is the one used by default. If we look deeper into it:

```
docker network inspect bridge
```

We will find an interesting part of the output showing the containers running on this network:

```
"Containers": {
            "d2708119c50af90296cd8efcd458a5156fca7fbba98b1412a468b5255d732118": {
                "Name": "es",
                "EndpointID": "e2d73976ffd0d950efbd04928684c9e85050d85cee70b665408838d9293f8af1",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            }
        },
```

The main part here would be on which IP address is the container allocated. We could make different containers connect to each other once we discover these ports. However, bridge network is shared among ALL containers and IPs may change, so this strategy would not be consistent enough. However, there is a way to overcome this, which is creating another bridge network for our app:

```
docker network create my-net
```

We then can tell the container in which network to connect by applying the `--net my-net` flag on the `run` command. This way, when we have all our containers running under the same roof, connecting to ES database in Python would be as simple as

```python
es = Elasticsearch(host='es')
```

This is indeed a useful approach when trying to prepare a system replicating what AWS Lambda does. We will have our DB ready and when there is an event triggering a process, we could just create a container to run that process and then to remove itself whenever it is done, keeping the rest of the server free.

-----

While useful in some cases, this approach is kind of manual. That's why Docker's team put their hands on another incredible tool: **Docker Compose**, which lets us run this multi-container environment projects in an easier manner. You can install it following this [instructions](https://docs.docker.com/compose/install/).

As when building self-made images, the bread and butter of Docker Compose is also a rather simple file. Using the same shown in docker-curriculum as an example:

```
version: "3"
services:
  es:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.3.2
    container_name: es
    environment:
      - discovery.type=single-node
    ports:
      - 9200:9200
    volumes:
      - esdata1:/usr/share/elasticsearch/data
  web:
    image: prakhar1989/foodtrucks-web
    command: python app.py
    depends_on:
      - es
    ports:
      - 5000:5000
    volumes:
      - ./flask-app:/opt/flask-app
volumes:
    esdata1:
      driver: local
```

We are first defining two services, the ES database, named **es**, and a python flask app named **web**, on which we can define parameters that would also be called when running the container with, such as the port linking. Moreover, we specify that *web* container `depends_on` *es*, so that we make sure that the database is started first. 

Another important point here are `volumes`, specially when playing around with databases, as they provide a way of preserving data between restarts. Note how we are going to save that in a local driver which we call esdata1, using the directory `/usr/share/elasticsearch/data`. Note how with this strategy we can start both containers without needing to mess around with networking by just going to the directory containing the file and running:

```
docker-compose up
```

Also, we can now understand a bit of the magic behind it, as if we take a look to `docker network ls`, we will see a new network created on which both containers are running.

As always, I hope it helped someone and another thx to [Prakhar Srivastav](https://prakhar.me)!
