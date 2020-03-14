---
title: Streaming with Kafka
published: true
description: |
    Kafka is one of the most used tools to setup
    live streams. Moreover, it interacts beautifully with Spark.
    After having seen how to manage the ingredients, we are
    going to prepare a small demo to play around
    with these tools.
category: Spark
ctime: 2018-09-19
---

I have just visited Prague and got the chance to enter to a tiny house in the *Golden Lane* where Franz Kafka wrote part of its work. Thus, this makes a great time to show some appreciation in the form of a post :)

In another [entry](https://pmbrull.dev/post/spark-playing-with-streams) we studied how we could set up a working environment consisting of Kafka - Spark - Maven. Now, we are going to go more in depth in the first couple (Kafka - Spark).  A quick glance to both Zookeeper's and Kafka's configurations:

* /config/zookeeper.properties:

  ```bash
  # the directory where the snapshot is stored.
  dataDir=/tmp/zookeeper
  # the port at which the clients will connect
  clientPort=2181
  # disable the per-ip limit on the number of connections
  # since this is a non-production config
  maxClientCnxns=0
  ```

* /config/server.properties

  ```bash
  # The id of the broker. 
  # This must be set to a unique integer for each broker.
  broker.id=0
  port=9092
  # Zookeeper connection string
  zookeeper.connect=localhost:2181
  ```

Again, we will start by creating a topic called *test*:

```bash
cd kafka_2.11-1.1.0

bin/zookeeper-server-start.sh config/zookeeper.properties

bin/kafka-server-start.sh config/server.properties

bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
```

In the [quickstart](https://kafka.apache.org/quickstart) guide of Kafka's main page, there is a producer - consumer test you can try in order to make sure that everything went as expected when setting up Kafka. 

As for Spark, following the linked post, we have it configured in order to deploy a 2 slaves cluster in our local machine.

```bash
sudo ln -s /usr/local/spark-2.2.1-bin-hadoop2.7/ /usr/local/spark

/usr/local/spark/sbin/start-all.sh
```

Now, we can jump to the code. A simple script that will connect to the Kafka's stream of data and count the word sent by the producer:

```python
from pyspark import SparkContext, SparkConf
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils

if __name__ == "__main__":
  
    sc = SparkContext(appName="WordCount")
    sc.setLogLevel("WARN")
    # Set the window time in seconds
    ssc = StreamingContext(sc, 5)
    
    kvs = KafkaUtils.createStream(ssc=ssc,
                     zkQuorum="localhost:2181",
                     groupId="streaming-consumer-id",
                     topics={"test": 1}) 

    lines = kvs.map(lambda x: x[1])
    counts = lines.flatMap(lambda line: line.split(" "))\
                  .map(lambda word: (word, 1))\
                  .reduceByKey(lambda a, b: a + b)

    counts.pprint()
    ssc.start()
    ssc.awaitTermination()
```

We will run it as a spark job, adding a package for download in order to being able to use the Kafka's module:

```bash
spark-submit --packages org.apache.spark:spark-streaming-kafka-0-8_2.11:2.3.1 kafka-test.py
```

If everything went OK, the script will start printing out 5 seconds time windows, but they will be blank until we actually send some messages to the data stream. For that, we will use the console's Producer:

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
```

And if we write anything there:

```
> Hello hello! testing testing
```

We will get back:

```bash
-------------------------------------------
Time: 2018-09-20 16:46:40
-------------------------------------------
(u'testing', 2)
(u'Hello', 1)
(u'hello!', 1)
```

Hope this helped someone :)
