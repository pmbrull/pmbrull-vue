---
title: Reading CSV with PySpark
published: true
description: |
    Flash post! How to read csv data with Pyspark
    ensuring that we are getting the expected types...
    And expected values!
category: Spark
ctime: 2018-07-28
---

With this heat it is hard to buckle down to work, so this will be another flash post! This time, about loading a csv file into a Spark Dataframe using the new built-in csv data source (verion 2.2.0 +).  Again, we will be using PySpark API and some randomly generated data.

Recall that if you are using PySpark with Jupyter Notebook, you do not need to initiliaze the SparkContext:

```python
import pyspark

sc
```

```python
SparkContext

Spark UI

Version
    v2.3.0
Master
    local[*]
AppName
    PySparkShell
```
When loading the data, you can both infer the schema (let the script assume the column types, useful for having a first taste of what is going on) or write it down, which is preferred. To do so, we need to initialize the SQL module, as we are going to work with DFs instead of RDDs.

```python
from pyspark.sql import SQLContext
from pyspark.sql.types import StructType, StructField
from pyspark.sql.types import DoubleType, IntegerType, StringType

sqlContext = SQLContext(sc)
```

```python
schema = StructType([
    StructField("NAME", StringType()),
    StructField("SURNAME", StringType()),
    StructField("AGE", IntegerType()),
    StructField("GENDER", StringType()),
    StructField("IDCLUSTER", IntegerType()),
    StructField("DESCLUSTER", StringType()),
    StructField("INTOLERANCIAS", StringType()),
    StructField("AZUCARES", DoubleType()),
    StructField("GRASAS", DoubleType())
])
```

In this dataset, the last three columns could be left empty, as they describe people's intolerances to some foods and their limit in sugar and fat ingestion.

Now, we are ready to read the data and apply some options:

```python
people_df = sqlContext.read\
    .option("sep","|")\
    .schema(schema)\
    .option("header", "true")\
    .csv("/path/to/data.csv")

people_df.show()
```

What is going on here:

* We can adjust the data separator, in this case is the pipe character.
* We force the schema we had previously defined.
* Use first row as header.
* Specify the file path.

However, we find ourselves in a tricky situation...

```
+----------+-------------+----+------+---------+----------+-------------+--------+------+
|      NAME|      SURNAME| AGE|GENDER|IDCLUSTER|DESCLUSTER|INTOLERANCIAS|AZUCARES|GRASAS|
+----------+-------------+----+------+---------+----------+-------------+--------+------+
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
|INMACULADA|GARRIGA PEREZ|  22|Female|        1|MujerJoven|         null|     3.0|  11.0|
|      null|         null|null|  null|     null|      null|         null|    null|  null|
+----------+-------------+----+------+---------+----------+-------------+--------+------+
```

(Almost) everything was loaded as **null**! What happens here is that with the schema defined, Spark is having trouble with the last numerical columns, as he is encountering there the string *null* and raises a conflict, as it cannot be loaded as a double. With the *INTOLERANCIAS* column, though, there is no problem as it loads *null* as a string.

To fix this, and as a general practice, we should specify how will Null values be written ("null", "NULL", "NA"...). Just add the following line:

```python
.option("nullValue", "null")
```

and then we finally obtain the whole set correctly:

```
+----------+---------------+---+------+---------+-----------+-------------+--------+------+
|      NAME|        SURNAME|AGE|GENDER|IDCLUSTER| DESCLUSTER|INTOLERANCIAS|AZUCARES|GRASAS|
+----------+---------------+---+------+---------+-----------+-------------+--------+------+
|      IZAN|       POZO GIL| 41|  Male|        4|HombreMayor|         null|    null|  null|
| ALEJANDRA| FLORES GARRIGA| 22|Female|        1| MujerJoven|         null|    null|  null|
| ALEJANDRA|REQUENA FUENTES| 27|Female|        1| MujerJoven|         null|    null|  null|
|  CATALINA| HURTADO PULIDO| 43|Female|        2| MujerMayor|         null|    null|  null|
|   ANTONIA|   SANS MORALES| 39|Female|        2| MujerMayor|         null|    null|  null|
|     ARNAU| BOSCH ESCUDERO| 29|  Male|        3|HombreJoven|leche,pescado|    null|  null|
|       JON|   PLAZA LOZANO| 31|  Male|        3|HombreJoven|         null|    null|  null|
|    ESTHER|    RIBERA CANO| 47|Female|        2| MujerMayor|        avena|    null|  null|
|INMACULADA|  GARRIGA PEREZ| 22|Female|        1| MujerJoven|         null|     3.0|  11.0|
|ROSA MARIA|    RUIZ CAMPOS| 43|Female|        2| MujerMayor|         null|    null|  null|
+----------+---------------+---+------+---------+-----------+-------------+--------+------+
```

Hope this was useful to someone :)
