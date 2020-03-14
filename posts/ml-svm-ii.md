---
title: Support Vector Machines II
published: true
description: |
    With Kernel Functions we put SVM on steroids.
    Nobody said that all datasets should be separable
    in just two dimensions... Let's study how we
    can keep on playing around geometrical ideas
    to obtain even better results.
category: ML
ctime: 2018-03-23
---

In Part I we had a small taste of SVM, however we will show here where they shine the most, allowing more powerful and extended applications.

## Linear and non-linear modelling

Although *linear model* is a term mostly used in regression techniques, its meaning embraces a high number of different algorithms with one thing in common: its modelization can be written as a linear combination of the parameters (do not confuse with the samples $x_i$), which comprises a strictly monotonic function. 
 
> A monotonic function is one where the order is preserved, either increasing or decreasing:
$$f(x_1) >= f(x_2) if (x_1) > (x_2).$$
We say that a function is strictly monotonic if the strict inequality holds. 


This can be formalised as:

$$y(\textbf{x},\beta) = g (  \beta_0 + \sum_{i=1}^d \beta_i x_i  ) = g(\beta^T\textbf{x}),$$

$$\textbf{x} = (1,x_1,\ldots,x_d)^T, \beta=(\beta_0,\beta_1,\ldots,\beta_d)^T.$$

For example, a polynomic function.

Thus, we can generalize and obtain non-linearity when the parameters do not go hand by hand with the predictors, but with a non-linear **Basis Function**: 

$$y(\textbf{x},\beta) = g (  \beta_0 + \sum_{j=1}^M \beta_j \phi_j(\textbf{x})  ) = g(\beta^T\phi(\textbf{x})),$$

$$\phi(\textbf{x}) = (1,\phi_1(\textbf{x}),\ldots,\phi_M(\textbf{x}))^T, \beta=(\beta_0,\beta_1,\ldots,\beta_d)^T.$$

## Kernel Functions

Recall how SVM performed poorly when data is not linearly separable, showed with the example of the Iris dataset. In the **Kernel functions** lies the bread and butter of the SVM's power.

The idea behind the *kernel method* is to apply the following statement: 

> $n+1$ point can always be linearly separated in $\mathbb{R}^n$.

Then we want to use a Basis Function so that data gets projected into a high-dimensional feature space $F$ and perform there the linear modelling.

$$ \Phi:X \rightarrow F $$

$$ \textbf{x} \mapsto (1,\phi_1(\textbf{x}),\ldots,\phi_M(\textbf{x})) $$

So far we have feature vectors $\vec{x}$ of dimension $d$ and a function $\Phi$ that maps them into a $M$-dimensional space, where we require M to be large, i.e $M \gg d$. Trying to solve a problem with such dimensionality issues would end up badly for the estimation of the parameters $\beta$. However, thanks to the **Representer Theorem** we can rather aim to solve the **dual** formulation of $y$:

$$ y(\textbf{x},\beta) = g(\beta_0 + \sum_{j=1}^M \beta_j\phi_j(\textbf{x})) \mapsto $$

$$ y(\textbf{x},\alpha) = g(\sum_{n=1}^N \alpha_n t_n \langle \Phi(x_n),\Phi(\textbf{x})\rangle_F) = $$

$$ g(\sum_{n=1}^N \alpha_n t_n k(x_n,\textbf{x})) $$

where $k(.,.) = \langle \Phi(.),\Phi(.)\rangle_F$ is the kernel function, which directly performs the inner product in the feature space $F$ withouth the need of previously projecting the data.

<img src="../../images/posts/ml/svm/kernel_diagram.png" class="w-96 my-4 justify-center m-auto">


Finally, the discriminant function is written as:

$$ y_{SVM}(\textbf{x}) = sgn( \sum_{n=1}^N \alpha_n t_n k(x_n,\textbf{x}) + b ). $$

## RBF: Radial Basis Function

RBF is one of the most popular kernels at the moment. It has the folowing form:

$$  K(\mathbf{x}, \mathbf{x'}) = \exp\left(-\frac{\|\mathbf{x} - \mathbf{x'}\|^2}{2\sigma^2}\right), $$

being $\sigma$ a free parameter that can be rewritten as $\gamma = \frac{1}{2\sigma^2}$.

Intuitively one can think about this kernel as a similarity measure between to feature vectors $\{ x,x' \}$ (as we are working with the Euclidean distance) times the value of $\gamma$, which is the parameter indicating the radius of influence of each sample. With low values of $\gamma$, the effect of each sample is vast, so there are zones affected by different samples. However, a high value of $\gamma$ implies a small radius, so there will be zones affected only by single points, leading to small influence islands in isolated samples. This would lead to an overfitting effect of the training data. 

If we compute the modelling with $\gamma = 100$ on the Iris dataset we can observe this effect:

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

<img src="../../images/posts/ml/svm/output_0_0.png" class="w-96 my-4 justify-center m-auto">


```python
from sklearn import svm
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.33, random_state=42)

clf = svm.SVC(kernel='rbf', C=1, gamma = 100)
clf.fit(X_train, y_train) 

y_pred = clf.predict(X_test)
print('Obtained accuracy with linear SVM is: {}.'
      .format(accuracy_score(y_test, y_pred)))
```

    Obtained accuracy with linear SVM is: 0.6.

```python
def plot_decision_regions(X, y, classifier, test_idx=None,
                          resolution=0.02):

    # setup marker generator and color map
    markers = ('s', 'x', 'o', '^', 'v')
    cmap=plt.cm.Set1
    
    # plot the decision surface
    x1_min, x1_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    x2_min, x2_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx1, xx2 = np.meshgrid(np.arange(x1_min, x1_max, resolution),
                           np.arange(x2_min, x2_max, resolution))
    Z = classifier.predict(np.array([xx1.ravel(), xx2.ravel()]).T)
    Z = Z.reshape(xx1.shape)
    plt.contourf(xx1, xx2, Z, alpha=0.4, cmap=cmap)
    plt.xlim(xx1.min(), xx1.max())
    plt.ylim(xx2.min(), xx2.max())

    for idx, cl in enumerate(np.unique(y)):
        plt.scatter(x=X[y == cl, 0], y=X[y == cl, 1],
                    alpha=0.8, c=cmap(idx),
                    marker=markers[idx], label=cl)

    # highlight test samples
    if test_idx:
        # plot all samples
        if not versiontuple(np.__version__) >= versiontuple('1.9.0'):
            X_test, y_test = X[list(test_idx), :], y[list(test_idx)]
            warnings.warn('Please update to NumPy 1.9.0 or newer')
        else:
            X_test, y_test = X[test_idx, :], y[test_idx]

        plt.scatter(X_test[:, 0],
                    X_test[:, 1],
                    c='',
                    alpha=1.0,
                    linewidths=1,
                    marker='o',
                    s=55, label='test set')
```

```python
import numpy as np
# Visualize the decision boundaries
plot_decision_regions(X_train, y_train, classifier=clf)
plt.legend(loc='upper left')
plt.tight_layout()
plt.show()
```

<img src="../../images/posts/ml/svm/iris_rbf.png" class="w-96 my-4 justify-center m-auto">

However, the right choice of parameters can lead to excellent models

```python
from sklearn.model_selection import GridSearchCV

parameters =  {'C': [1, 10, 100], 'gamma': [0.1, 1, 10], 'kernel': ['rbf']}
model = svm.SVC()
clf = GridSearchCV(estimator=model, param_grid=parameters, cv=5, n_jobs=-1)
clf.fit(X_train, y_train)
```
    GridSearchCV(cv=5, error_score='raise',
           estimator=SVC(C=1.0, cache_size=200, class_weight=None, coef0=0.0,
      decision_function_shape='ovr', degree=3, gamma='auto', kernel='rbf',
      max_iter=-1, probability=False, random_state=None, shrinking=True,
      tol=0.001, verbose=False),
           fit_params=None, iid=True, n_jobs=-1,
           param_grid={'C': [1, 10, 100], 'gamma': [0.1, 1, 10], 'kernel': ['rbf']},
           pre_dispatch='2*n_jobs', refit=True, return_train_score='warn',
           scoring=None, verbose=0)

```python
print("Best parameters set found on development set:")
print()
print(clf.best_params_)
print()
print("Grid scores on development set:")
print()
for params, mean_score, scores in clf.grid_scores_:
    print("%0.3f (+/-%0.03f) for %r"
          % (mean_score, scores.std() * 2, params))
```

    Best parameters set found on development set:
    
    {'C': 100, 'gamma': 0.1, 'kernel': 'rbf'}
    
    Grid scores on development set:
    
    0.810 (+/-0.122) for {'C': 1, 'gamma': 0.1, 'kernel': 'rbf'}
    0.800 (+/-0.096) for {'C': 1, 'gamma': 1, 'kernel': 'rbf'}
    0.790 (+/-0.153) for {'C': 1, 'gamma': 10, 'kernel': 'rbf'}
    0.810 (+/-0.122) for {'C': 10, 'gamma': 0.1, 'kernel': 'rbf'}
    0.790 (+/-0.153) for {'C': 10, 'gamma': 1, 'kernel': 'rbf'}
    0.730 (+/-0.183) for {'C': 10, 'gamma': 10, 'kernel': 'rbf'}
    0.820 (+/-0.154) for {'C': 100, 'gamma': 0.1, 'kernel': 'rbf'}
    0.740 (+/-0.176) for {'C': 100, 'gamma': 1, 'kernel': 'rbf'}
    0.710 (+/-0.195) for {'C': 100, 'gamma': 10, 'kernel': 'rbf'}
