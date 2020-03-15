---
title: Support Vector Machines I
published: true
description: |
    One of the most popular machine learning algorithms
    for supervised learning, Support Vector Machines
    have seen use cases from binary classification to image
    recognition. In this post we are going to have a first
    look at the underlying theory - geometry based - and
    how to implement them in Python.
category: ML
ctime: 2018-03-19
---

Support Vector Machine (SVM) is a *Supervized Learning* technique which aims to perform both **regression and classification** (binary of multiclass), showing outstanding performance in the predictions on a set of data that can be divided into predictors or features and a target or label. Let's show how this works using the classification as an example: The idea behind the algorithm is finding a hyperplane that builds a linear boundary that separates the different classes in the subspace. However, there are many (infinite) hyperplanes that can show such separation.

<img src="../../images/posts/ml/svm/example1.png" class="w-84 my-4 justify-center m-auto">

That is why SVM tries to find the hyperplane with the **largest** margin, which also means obtaining a model showing greater generalization, meaning that new data points (test dataset) have a higher probability of being classified correctly. Sticking with this binary classification schema, we would end with the following geometrical representation of the model:

<img src="../../images/posts/ml/svm/svm_schema.png" class="w-84 my-4 justify-center m-auto">

Where we have two hyperplanes defined by the Normal Vector $w$ that define the boundaries of the classes and some points that belong to them, which we will call *Support Vectors*. The hyperplane that lies halfway is the maximum-margin hyperplane.

## Properties and formalisation

So far we can state a couple of important properties of SVM:

1. They are an example of **discriminative classification**, as the model is built on finding curves or manifolds that separate classes from each other. (In contraposition of *generative models*, which describe the distribution of the underlying classes, such as Naive Bayes classification).

2. They provide robust models, as they do not rely on the whole dataset. Instead, we only need a few points, the support vectors, to build the model. This means that adding more points to the dataset will not end up with the need of retraining the model to correctly being able to fit the new data.

Entering *math mode* we have:

A set $ D = \\{ \(x_1,y_1 \), \ldots, \(x_n,y_n \)  \\}, x_i \in \mathbb{R^d} , y_i \in \\{-1,1\\},$ and two hyperplanes:

* $\Pi_1: \vec{w}·\vec{x}-b=1$, above this margin we have label 1.
* $\Pi_2: \vec{w}·\vec{x}-b=-1$, below this margin we have label -1.

Given that the distance between $\Pi_1, \Pi_2$ is $\frac{2}{\|\|\vec{w}\|\|}$ and we want to find the maximum, we thus need to minimize $\|\|w\|\|^2$ subject to $y_i(\vec{w}·\vec{x_i}-b)\geq 1, i=1,\ldots,n$.

These conditions define the **hard-margin** hyperplane, which is found by using a the constraint specifying perfect separation between classes. However, this will hardly be the type of data one will ever find, so we relax the constraint and obtain the **soft-margin or Regularized SVM**

$$ \min \{ \|w\|^2 + C\sum_{i=1}^n ( 1- y_i(\vec{w}·\vec{x_i}-b))  \}, $$

where $C$ is the parameter setting the cost of missclassifying (regularization). However, the greater $C$ is, the greater the cost and thus the higher the probability that the model will overfit our training data. In the following figure one can observe how with a hard parameter C, the red dot is well classified but new data (cross) gets missclassified if it was a black dot.

<img src="../../images/posts/ml/svm/hardC.png" class="w-84 my-4 justify-center m-auto">

## Use Case

Let's use SVM with the Iris dataset:

```python
from sklearn import svm, datasets
import matplotlib.pyplot as plt
%matplotlib inline

iris = datasets.load_iris()
X = iris.data[:, :2] # first 2 features
y = iris.target

plt.figure(figsize=(15, 5))
plt.subplot(121)
plt.scatter(X[:, 0], X[:, 1], c=y, cmap=plt.cm.Set1)
plt.xlabel('Sepal length')
plt.ylabel('Sepal width')
plt.title('Iris dataset')
plt.show()
```

<img src="../../images/posts/ml/svm/output_0_1.png" class="w-84 my-4 justify-center m-auto">


```python
from sklearn import svm
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.33, random_state=42)

clf = svm.SVC(kernel='linear', C=1)
clf.fit(X_train, y_train) 

y_pred = clf.predict(X_test)
print('Obtained accuracy with linear SVM is: {}.'
      .format(accuracy_score(y_test, y_pred)))
```

    Obtained accuracy with linear SVM is: 0.78.

Although it is a toy example, we obtained a 78% accuracy with 0 effort. However, what is really happening with the data?

<img src="../../images/posts/ml/svm/linearSVM.png" class="w-84 my-4 justify-center m-auto">

There is a class that can easily be linearly separated, but the other two don't, That's why just using a linear SVM is not performing good enough.
