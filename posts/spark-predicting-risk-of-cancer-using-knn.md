---
title: Predicting Risk of cancer using KNN
published: true
description: |
    While there are amazing tools that already provide
    us algorithm's implementations, sometimes it's just
    fun to go back to the books and build our own.
    Let's get hands-on with a vanilla example of KNN
    using Spark's first data model: RDDs.
category: Spark
ctime: 2018-03-08
---

In this post we are going to use Pyspark to implement the classification of breast tumors as malign or bening, performing predictions with the simplest version of the K Nearest Neighbour: 1NN. We will follow this guidelines:

1. Split the train and test sets.
2. Generate all possible combinations: cartesian product.
3. For each combination ${train_i, test_j} \forall i, j$, calculate Euclidian distance of the predictor variables.
4. For each test instance, predict with the observation of the training set with minimum distance.


```python
sc = SparkContext.getOrCreate()
```


```python
cancerRDD = sc.textFile("../input/Tumor/breast.csv")
print('The file has {} lines.'.format(cancerRDD.count()))
```

    The file has 570 lines.
    


```python
header = cancerRDD.first()
predictors = [x for x in header.split(',') 
              if x not in ['id','diagnosis','train']]
```


```python
print(predictors)
```

    ['mradius', 'mtexture', 'mperimeter', 'marea', 'msmooth', 'mcompact', 'mconcavity', 'mconc_p', 'msymmetry', 'mfractal', 'sradius', 'stexture', 'sperimeter', 'sarea', 'ssmooth', 'scompact', 'sconcavity', 'sconc_p', 'ssymmetry', 'sfractal', 'lradius', 'ltexture', 'lperimeter', 'larea', 'lsmooth', 'lcompact', 'lconcavity', 'lconc_p', 'lsymmetry', 'lfractal']
    

We are going to create two RDD's from this one, so we will cache the result of splitting the lines in order to not reading from disk twice. Train/test distinction is in the last position:


```python
splitRDD = cancerRDD.filter(lambda line: line != header)\
            .map(lambda line: line.split(','))\
            .cache()
        
trainRDD = splitRDD.filter(lambda f: f[32] == '1')
testRDD = splitRDD.filter(lambda f: f[32] == '0')

fullRDD = testRDD.cartesian(trainRDD)
print('The cartesian product has {} lines.'
      .format(fullRDD.count()))
```

    The cartesian product has 65440 lines.
    

Now we have tuples {key,value} where keys are the test instances and values each train observation. In order to get the minimum distance we need to group all values together for each key, calculate the distance.


```python
num_pred = len(predictors)

def calc_dist(Tuple):
    train = Tuple[1]
    test = Tuple[0]
    dist = 0.0
    for i in range(2,32):
        dist = dist + (float(train[i])-float(test[i]))**2
    return (test[0],((dist)**0.5, train[1]+'_'+test[1]))
```

The function *calc_dist* returns, given an input tuple {key=test, value=train}, another tuple with key the test *id* and value the distance calculated using the predictors.


```python
distRDD = fullRDD.map(calc_dist)
distRDD.take(5)
```
    [('842302', (341.7302620944424, 'M_M')),
     ('842302', (376.45576487702664, 'M_M')),
     ('842302', (538.0234879671779, 'M_M')),
     ('842302', (1389.4612365464616, 'M_M')),
     ('842302', (1206.344557277833, 'M_M'))]

## 1NN

Let's operate over every value of each key and keep the tuple {distance,prediction} that has the minimum value. Then, readjust the key, making it the X_Y value and compute the count of each distinct one:


```python
pred = distRDD.reduceByKey(lambda val1, val2: 
                           val1 if val1[0]<val2[0] else val2)\
            .mapValues(lambda value: value[1])\
            .values()\
            .map(lambda x: (x,1))\
            .reduceByKey(lambda val1, val2: val1 + val2)\
            .sortByKey()\
            .collect()

print('The final prediction set consists of:')
for elem in pred:
    print(elem)
```
    The final prediction set consists of:
    ('B_B', 94)
    ('B_M', 5)
    ('M_B', 4)
    ('M_M', 57)
    

## KNN

- Obtain a list of tuples {distance, prediction} for each *id*: groupByKey.
- Sort the list by the first value and keep the first K tuples: distance: mapValues + sorted + [:K]
- Convert list of tuples {dist,pred} to list of {pred}. 
- Get most common element in list.
- Again, readjust new key to the prediction and compute the counting.


```python
from collections import Counter
```


```python
pred = distRDD.groupByKey()\
            .mapValues(lambda vec: 
                       sorted(vec, key=lambda x: x[0])[:11])\
            .mapValues(lambda vec: [x[1] for x in vec])\
            .mapValues(lambda vec: 
                       Counter(vec).most_common(1)[0][0])\
            .values()\
            .map(lambda x: (x,1))\
            .reduceByKey(lambda val1, val2: val1 + val2)\
            .sortByKey()\
            .collect()

print('The final prediction set consists of:')
for elem in pred:
    print(elem)
```

    The final prediction set consists of:
    ('B_B', 95)
    ('B_M', 4)
    ('M_B', 3)
    ('M_M', 58)
    

With K=11 we get a small improvement. However, when testing with different numbers, K=5 resulted in worse predictions than just using 1NN. Let's plot the errors with different values of K:


```python
BM = []
MB = []
T = []

def generate_errors(K):
    pred = distRDD.groupByKey()\
            .mapValues(lambda vec: 
                       sorted(vec, key=lambda x: x[0])[:K])\
            .mapValues(lambda vec: [x[1] for x in vec])\
            .mapValues(lambda vec: 
                       Counter(vec).most_common(1)[0][0])\
            .values()\
            .map(lambda x: (x,1))\
            .reduceByKey(lambda val1, val2: val1 + val2)\
            .sortByKey()\
            .values()\
            .collect()
            
    BM.append(pred[1])
    MB.append(pred[2])
    T.append(pred[1]+pred[2])
```


```python
vecK = range(1,61)
for i in vecK:
    generate_errors(i)
```


```python
from plotly.offline import init_notebook_mode, iplot
import plotly.graph_objs as go

init_notebook_mode()

_PLOTLY_CONFIG = {"displaylogo": False,
                "modeBarButtonsToRemove": 
                ["sendDataToCloud", "select2d", "lasso2d", 
                 "resetScale2d"]}

# Create traces
trace0 = go.Scatter(
    x = list(vecK),
    y = BM,
    mode = 'lines+markers',
    name = 'False Positives'
)
trace1 = go.Scatter(
    x = list(vecK),
    y = MB,
    mode = 'lines+markers',
    name = 'False Negatives'
)
trace2 = go.Scatter(
    x = list(vecK),
    y = T,
    mode = 'lines+markers',
    name = 'Total Errors'
)

data = [trace0, trace1, trace2]

layout = go.Layout(
    title='KNN Prediction Errors',
    xaxis=dict(
        title='Values of K'
    ),
    yaxis=dict(
        title='Number of Errors'
    )
)

fig = go.Figure(data=data, layout=layout)
iplot(fig, filename='KNN Errors', config=_PLOTLY_CONFIG, 
      show_link=False)

print('Minimum number of False Positives: {}'.format(min(BM)))
print('Minimum number of False Negatives: {}'.format(min(MB)))
print('Minimum number of Errors: {}'.format(min(T)))
```

<img src="../../images/posts/spark/knn.png" class="h-96 my-4 justify-center m-auto">

    Minimum number of False Positives: 4
    Minimum number of False Negatives: 1
    Minimum number of Errors: 7
    

We can observe how there is a lower bound of error rate we cannot improve, with a minimum of 7 errors, as the *total errors* curve shows an increasing tendency. The only type of errors that gets to decrease are the *false negatives*. However this effect gets overwhelmed by the incerasing rate of *false positives*.
