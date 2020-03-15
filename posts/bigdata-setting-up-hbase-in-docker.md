---
title: Setting up HBase in Docker
published: true
description: |
    Going on with our road to Docker, it's time to add another 
    character to the stage as a key-value store for our application: 
    Hbase
category: Big Data
ctime: 2018-08-26
---

Looking around in the [Hub](https://hub.docker.com/) for which seems to be the best Image to use, we are not lucky enough to find another Official Image, as when we were setting up the ElasticSearch DB. However, an amazing engineer has put a ton of hours into preparing many tools for big data environments (all shown in his [GitHub](https://github.com/HariSekhon/Dockerfiles)), so thank you sir!

What we are trying to build through all these posts is a dockerized application consisting of an ElasticSearch and HBase DBs and a python script talking to both of them. However, we are going to play around a simple (not dockerized) script for simplicity and testing purposes. So, without further delay, let's get started:

The ingredients for this part are:

1. Docker Image `harisekhon/hbase`
2. Python's [HappyBase](https://happybase.readthedocs.io/en/latest/index.html) - HBase API


## 1. Getting HBase Image

```
docker pull harisekhon/hbase
```

```
docker run -d --name hb -p 9090:9090 harisekhon/hbase
```

> OBS: we are mapping port 9090 (hbase.regionserver.thrift.port) for being able to connect Python HappyBase API with the simple Python script.



## 2. Loading CSV data

As now we have our raw data in .csv format, we can just try to load it using HappyBase module. As port 9090 is already mapped, setting the connection is as simple as

```python
import happybase

connection = happybase.Connection('localhost')
```

Following the examples in the API [docs](https://happybase.readthedocs.io/en/latest/index.html), we have a really simple approach for creating tables, storing and retrieving data:

```python
# Create table with default options
connection.create_table(
    'test-table',
    {'cf1': dict()}
)
```

 ```python
# Store some data
table = connection.table('test-table')
table.put(b'row-key', {b'cf1:col1': b'value1',
                       b'cf1:col2': b'value2'})
 ```

```python
# Retrieve data
row = table.row(b'row-key')
print(row[b'cf1:col1']) # b'value1'
```

Now, let's try to replicate this with our users data (randomly created):

```python
import pandas as pd

# Force read to str in order to being able to insert encoded data
df = pd.read_csv('people.csv', sep='|', dtype=str)
df.head()
```

| ID | NAME | SURNAME | AGE | GENDER | ... | INTOLERANCIAS |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | IZAN | POZO GIL | 41 | Male | ... | NaN |
| 1 | ALEJANDRA | FLORES GARRIGA | 22 | Female | ... | NaN |
| 2 | ALEJANDRA | REQUENA FUENTES | 27 | Female | ... | NaN |
| 3 | CATALINA | HURTADO PULIDO | 43 | Female | ... | NaN |
| 4 | ANTONIA | SANS MORALES | 39 | Female | ... | NaN |

```python
df.fillna('NULL', inplace=True)
```

> OBS: We need to use `df.fillna()` in order to really cast null values to strings, as NaN are numpy floats and will raise an error when trying to encode values as bytes.

We are going to prepare a table called *Users*, playing with just one column-family, and we can use the ID field as row-key. However, we are not going to just insert row by row as in the example, because each `put` command makes a connection to the server, and that would be quite inefficient. That's why HappyBase also includes [batch](https://happybase.readthedocs.io/en/latest/user.html#performing-batch-mutations) operations.

```python
connection.create_table(
    'Users',
    {'cf1': dict()}
)
```

```python
table = connection.table('Users')

# Specify column-family for each column and encode values
with table.batch() as b:
    for i, row in df.iterrows():
        b.put(str.encode(row['ID']), {
            b'cf1:NAME': str.encode(row['NAME']),
            b'cf1:SURNAME': str.encode(row['SURNAME']),
            b'cf1:AGE': str.encode(row['AGE']),
            b'cf1:GENDER': str.encode(row['GENDER']),
            b'cf1:IDCLUSTER': str.encode(row['IDCLUSTER']),
            b'cf1:DESCLUSTER': str.encode(row['DESCLUSTER']),
            b'cf1:INTOLERANCIAS': str.encode(row['INTOLERANCIAS']),
            b'cf1:AZUCARES': str.encode(row['AZUCARES']),
            b'cf1:GRASAS': str.encode(row['GRASAS'])
        })
```

Finally, check that the insert went smoothly:

```python
row = table.row(b'0')
print(row)
```

```
{b'cf1:AGE': b'41', b'cf1:IDCLUSTER': b'4', b'cf1:INTOLERANCIAS': b'NULL', b'cf1:GENDER': b'Male', b'cf1:AZUCARES': b'NULL', b'cf1:SURNAME': b'POZO GIL', b'cf1:GRASAS': b'NULL', b'cf1:NAME': b'IZAN', b'cf1:DESCLUSTER': b'HombreMayor'}
```

Now we have everything ready for the final part of the Docker series, where we will put all the pieces together. Hope this helped someone :)
