---
title: Ensemble metods and Random Forests I
published: true
description: |
    Bootstrap? Random Forests? Machine Learning
    algorithms are a playground of fancy words. Let's break
    down the theory behind the prime example of ensemble methods.
category: Machine Learning
ctime: 2018-05-13
---

In other posts we saw a full-speed intro into *Support Vector Machine*, a supervised ML algorithm that excels thanks to its discriminative robust models and, in conjunction with kernel functions, lets us solve both classification and regression problems with pretty good results.

Now, we are going to make a brief review on **Random Forests**, which lay on two primal concepts:

* Ensembling
* Bootsraping

## Ensemble Learning

Here we find methods that learn by training not one, but multiple individual learners which are not too complex and that obtain better predictions than using a model giving random predictions. Some of the ideas behind this practice are:

1. Instead of creating a huge model learning globally from data, create *local* experts and combine their outputs.
2. Divide the whole problem into smaller ones which are easier to understand (rather than making a huge Neural Network, where it is impossible to extract knowledge of the problem).

However, they are not always usable. These two hypothesis need to hold:

1. Their accuracy is higher than random modelling: otherwise, combining results worst than a random answer will give us nothing but garbage.
2. They are **INDEPENDENT** from each other. Please note the mayus and bold letters here.

To go from all those predictions the small models made to a unic prediction for each test observation there are different algorithms, however, most common ones include:

* Highest Voting for classification.
* Arithmetic Average for regression.

**Example**

How does one build an Ensemble Model? Let's imagine an example, just to get an idea of how ensembling works, where we have three groups in our data: A's, B's and C's. Each of them has a different addition rule, and we want to sum the whole data.

First, subsample training samples (keep extracting data from your training data bag), and build models on that small portion of data. This will make models learn local features from data. In this example, one model will learn more about A's rule, another about B's and last one about C's.

Finally, to sum the whole data, just use the knowledge from the three models generated earlier.


```python
plot_figure_1()
```

<img src="../../images/posts/ml/rf/output_4_0.png" class="h-96 my-4 justify-center m-auto">

## Bootsrap

Given a dataset $D = \{ (x_1, t_1), \ldots, (x_n, t_n) \}$, we draw $m$ bootstrap **resamples** of size $n$ uniformly and with replacement, i.e we can get the same observation twice. For large $n$, it is expected that $1-1/e \approx 63.2\%$ of samples are unique, being the rest duplicates. We will fit a model on each of these $m$ resamples.

<aside class="notice--info">
At each draw, an observation has probability $1/n$ of being selected, as samples are \textit{i.i.d}. Thus, the probability of never drawing an specific observation after $n$ times would be $P(n) = (1-1/n)^n$. Then, an observation has probability $P(n) = 1 - (1-1/n)^n$ of being selected at least once. 
Given $n \rightarrow \infty$, $P(n) \rightarrow 1-e^{-1}$.
</aside>

Its usefulnes heavily relies on the *independent and identically distributed* assumption on the data, as we will be using that distribution on the whole dataset and on the resamples will be the same.

At this point we can introduce another terminology:

## Bagging

Bagging, or Bootsrap aggregating, creates and ensemble by training individual classifiers on the mentioned resamples of the training set:

1. Generate bootsrap sample of size $n$.
2. Train a model on it.
3. Repeat $m$ times.

Bagging helps in reducing variance of unstable methos, such as **decision trees** and thus, improving predictions. 

Remember how we said that SVM was robust due to, when changing training data, final model stayed the same? Contrary to it we define unstable models, whose results deppend dramatically on training data.

Another thumbs up to bagging is **Out-of-bag error (OOB)**, which is a technique that uses data not in the bootstrap resample as test. This means that there is no need to CV when assessing model quality. But most important: these models are easily parallelizable. Thanks to independence hypothesis, local models can be trained separatedly and then its results joined together for the final prediction.

## Further discussion using Iris Dataset

```python
import sklearn.datasets as datasets
import pandas as pd
import pydotplus

from sklearn.externals.six import StringIO  
from IPython.display import Image  
from sklearn.tree import export_graphviz
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
```

```python
iris = datasets.load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
y = iris.target
```

Let's visualize a decision tree on a data split:

<aside class="notice--info">
In order to being able to run these graphics cells, please install GraphViz (download .msi file for Windows), add the executable file on system's path and, if it still does not work, open a new terminal and restart the notebook.
</aside>


```python
X_train, X_test, y_train, y_test = train_test_split(
    df, y, test_size=0.25, random_state=42)

dtree = DecisionTreeClassifier()
dtree.fit(X_train, y_train)

dot_data = StringIO()
export_graphviz(dtree, out_file=dot_data,  
                filled=True, rounded=True,
                special_characters=True)
graph = pydotplus.graph_from_dot_data(dot_data.getvalue())  
Image(graph.create_png())
```

<img src="../../images/posts/ml/rf/output_9_0.png" class="w-96 my-4 justify-center m-auto">

How about changing the seed?


```python
X_train, X_test, y_train, y_test = train_test_split(
    df, y, test_size=0.25, random_state=100)

dtree = DecisionTreeClassifier()
dtree.fit(X_train, y_train)

dot_data = StringIO()
export_graphviz(dtree, out_file=dot_data,  
                filled=True, rounded=True,
                special_characters=True)
graph = pydotplus.graph_from_dot_data(dot_data.getvalue())  
Image(graph.create_png())
```

<img src="../../images/posts/ml/rf/output_11_0.png" class="w-96 my-4 justify-center m-auto">

Before going any further, let's understang a bit what's happening here. A decision tree is nothing but the visualization of a set of rules. While going down the tree, they keep getting more complex, each hypothesis splitting into two theses, one with the predicates when the hypothesis holds, and one when not. 

In each node, we can see 4 types of information:

* The rule thats defines the split, for example, $X_3 \leq 0.8$.
* The **gini** value: Gini is an **entropy** measure, meaning that it gives different values regarding how chaotic each tree node is.
* Number of samples that arrived to that node. Top node has all the dataset.
* Value: indicating the number of samples in each category.

Observe how gini value decreases when we go deeper in the tree. This is because entropy or impurity reduction is a used algorithm when building CART decision trees (CART: Classification and Regression Trees). We are interesting in generating rules and splits so that category division gets clearer in the following nodes, minimizing the Gini formula:

$$ i(t) = \sum_{j\neq j'} p(C_j|t)p(C_{j'}|t), $$

where $j$ indicates a response class and $t$, each tree node.


Now, check the decision boundaries different trees would draw using the first two data coordinates:

```python
visualize_classifier(DecisionTreeClassifier(),
	                 X_train.values[:, :2],
	                 y_train)
```

<img src="../../images/posts/ml/rf/output_13_1.png" class="w-72 my-4 justify-center m-auto">

```python
X_train, X_test, y_train, y_test = train_test_split(
    df, y, test_size=0.25, random_state=500)

visualize_classifier(DecisionTreeClassifier(), 
	                 X_train.values[:, :2], 
	                 y_train)
```

<img src="../../images/posts/ml/rf/output_14_1.png" class="w-72 my-4 justify-center m-auto">

Observe how results change drastically. We are using data from the same source, and the same amount of it, just some observation have changed. Also, in the last two plots it is fairly easy to see how these simple models overfit a lot on training data. However, not every prediction is missleading, only the messy part in the middle gets changed, while we are obtaining steady predictions on the sides.

And this is why we use random forests! Train multiple easy-to-train and parallelize models and use all their results at the end, minimizing variance and obtaining better overall predictions rather than just using this unstable method.
