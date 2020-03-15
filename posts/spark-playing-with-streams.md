---
title: Playing with Streams
published: true
description: |
    One of the most interesting topics in Big Data
    is how we can process streaming data. Thanks to Kafka
    and its connection with Spark, we can achieve a lot
    with minimum code. However, we first need to have
    everything up and running.
category: Spark
ctime: 2018-06-16
---

In this post, we are going to guide a few steps to being able to play with **Spark**, **Kafka** and **Maven**, setting up a cluster on our local machine and sending, receiving and handling a stream of data thanks to Ubuntu's mechanisms of easy navigation.

## Setup

## JavaHome

First of all, setup your JAVA_HOME with at least JDK 1.8. Download it and update the environment file:

```bash
sudo nano /etc/environment
```

and add:

```bash
JAVA_HOME="/path/to/java/dir"
```

This is the method I always follow, rather than putting an export into *bashrc*.

## Maven

This part is easy. Maven is an Apache tool that will be in charge of building the project and handling all needed dependencies.

First, get all Maven packages and install:

```bash
apt-cache search maven
sudo apt-get install maven
```

## Spark

[Download](https://spark.apache.org/downloads.html) Spark, but stick with version 2.2, as otherwise when using it altogether with Kafka, there are methods made *Abstract* at v2.3. Then:

```bash
tar -xvf spark-2.2.1-bin-hadoop2.7.tgz
sudo mv spark-2.2.1-bin-hadoop2.7 /usr/local/
```

Now, here comes a small trick! (Or maybe it was just me hadn't thought about that... and is pretty useful). I encountered with the **AbstractMethodError** when trying to replicate the uni's Lab exercise in my local machine, raised because of using Spark 2.3. So, how to safely change versions without breaking what I already had? *Links*.

```bash
sudo ln -s /usr/local/spark-2.2.1-bin-hadoop2.7/ /usr/local/spark
```

Now, we have a linking between a directory called *spark* and the real spark folder. Then, we set up the SPARK_HOME onto this link in our environment file. If we need to change versions for some use, just download the new version and update the link at will without worrying about install/uninstall.

To start the master node, which will run on localhost:

```bash
/usr/local/spark/sbin/start-master.sh
```

Then, go to localhost:8080 to open the Spark's UI to check everything went down smoothly. However, we are not satisfied with a master. We want a cluster!

Thus, let's change some configurations. On the conf/ directory:

```bash
nano slaves
```

Just write **localhost**, to start slaves in there. Then:

```bash
nano spark-env-sh

export SPARK_WORKER_MEMORY=2g
export SPARK_WORKER_INSTANCES=2 
export SPARK_WORKER_DIR=/dir-to-execute/
```

Where the worker_dir will be where the execution will be carried out and logs written.

Although we are almost done, there is one final config step. Master node will try to speak to the Workers through SSH, which is indeed our same machine. To ensure the SSH connection, run:

```bash
sudo apt-get install openssh-server
```

And the password will be your root pass.

Finally, at /usr/local/spark/sbin

```bash
./start-slave.sh spark://localhost:7077
```

If you now refresh the UI page, two worker instances should appear.

## Kafka

Following the [quickstart](https://kafka.apache.org/quickstart), download the latest stable version and:

```bash
tar -xzf kafka_2.11-1.1.0.tgz
cd kafka_2.11-1.1.0
```

Start both the Zookeeper 

> A centralized service for maintaining configuration information, naming,  providing distributed synchronization, and providing group services

```bash
bin/zookeeper-server-start.sh config/zookeeper.properties
```

and kafka

```bash
bin/kafka-server-start.sh config/server.properties
```

Now, create a topic:

```bash
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```

There is information about a test you can run to check everything is working correctly at the quickstart guide.

## Launch the job

On the main application, use

```java
SparkConf conf = new SparkConf().setAppName("test").setMaster("local[*]");
```

And change this config everywhere in the code that asks for interaction with Spark. Also, set the slaves configuration in the code at localhost.

Finally, navigate to the src/ dir and compile using Maven:

```bash
mvn clean package
```

which will generate a .JAR file inside a created target/ dir next to src, and submit the job to your fresh Spark cluster:

```bash
/usr/local/spark/bin/spark-submit /home/project_path/target/lambda-code-students-0.0.1-SNAPSHOT.jar -launch_config
```

Hope this is a time-saver for someone!
