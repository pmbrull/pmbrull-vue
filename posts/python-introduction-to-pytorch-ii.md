---
title: Introduction to PyTorch II
published: true
description: |
    After a brief introduction about Deep Learning 
    origins and how we can use PyTorch to create 
    neural networks, we still need to prepare a model 
    that learns from our data. What we had coded was 
    just a carcass, therefore we yet have to develop 
    the methods that convert the forward propagation we 
    defined on the input data into actual information.
category: Python
ctime: 2019-06-10
---

These are just my notes about Udacity's Secure and Private AI course. You can find all the information about the course [here](https://eu.udacity.com/course/secure-and-private-ai--ud185).

        
With supervised learning models we need to define how to evaluate the behavior of an algorithm, i.e., we need to define the actual learning - specify how the algorithm needs to react to different scenarios. As when training a model we know beforehand the real target values, we will define a **Loss Function** to penalize for either incorrect classifications for categorical values or the distance between the correct value and the output for regression. An example of loss function for classification problems could be the squared loss:

$$
L = \frac{1}{2n}\sum_i^n{\left(y_i - \hat{y}_i\right)^2},
$$

where $\hat{y_i}$ are the predicted labels and $y_i$ the true ones.
        
Once defined a cost or loss function, the algorithm will try to minimize it. Finding minimum values ends up being really difficult, as there are no closed formulae that will always give a good result. Contrary to that, what you usually do is applying numerical methods to find the best approximation for the absolute minimum of a function. A family of methods that has proven great results in that regard are called **gradient descent**, where we look for the minimum by following the direction which offers the greatest slope. Reaching the minimum of a loss function means that we are minimizing the wrong results of a model, and thus obtaining the best possible model for our purpose.
        
## Backpropagation
        
All this theory is theory may be really interesting, but we still need to get to the point, as so far we just presented some ingredients. Recall how we presented neural networks as just layers of products between data and some weights that generate some outputs, which are sent from layer to layer. Training a network means obtaining the weight values that best approximate the real function that explains our model. As we only have a loss function to minimize, this means using the derivative of that by the weights. As with any numerical method, the first snapshot of our weights is generated by random values (following some constraints).
        
The first step which consists in passing the data through the net to obtain the result of the loss function is called **forward propagation**. On the other hand, using this result to update the weights is called , **backpropagation**. The result of this backpropagation is an updated weight

$$
\large W^\prime_i = W_i - \alpha \frac{\partial L}{\partial W_1},
$$

where the value of $\alpha$ is defined as the **learning rate** or step. The learning rate is an hyperparameter that we input to the model itself. However, in the numerical methods world, finding the right value of $\alpha$ is also pretty involved. See, for example, the [Wolfe Conditions](https://en.wikipedia.org/wiki/Wolfe_conditions).
        
What we actually do is iterate through many forward and back propagations. We divide our all input data in what are called batches - groups of observations. Then, we pass each batch forward in our net, update the weights by the backpropagation and then pass the next batch. A full pass of all batches is called an epoch, and we are free the apply an arbitrary number of those.

## Hands-on

Let's suppose that we have a classification problem in our hands. As we will be working with probabilities, we need to define our output layer with a Softmax activation. However, computations with values next to 1's and 0's with lots of decimals can carry a lot of errors that will propagate throughout all calculations. Then, it is also useful to apply a logarithm there:
        
```python
model = nn.Sequential(...,
                      nn.LogSoftmax(dim=1))
    
criterion = nn.NLLLoss()
optimizer = optim.SGD(model.parameters(), lr=0.003)

epochs = 5
for e in range(epochs):
    running_loss = 0
    for images, labels in myBatch:
        # Flatten images, use -1 to let pyTorch infer
        # that dimension based on the first one
        images = images.view(images.shape[0], -1)

        # Set gradients to zero, otherwise they get accumulated after each pass
        optimizer.zero_grad()

        output = model.forward(images)
        loss = criterion(output, labels)
        # Backpropagation
        loss.backward()
        # Update weights
        optimizer.step()

        running_loss += loss.item()
    else:
        print(f"Training loss: {running_loss/len(trainloader)}"))
```
        
Observe how we applied the Negative Log Likelihood Loss criterion. This is just the function that we define for the loss of the model. Then, after the model is trained, if we need to check the actual probability of a class, as the output layer gives us the Log of the Softmax, we need to apply an exponential there.
          
However, what it is important to note here is that the activation function defined on the output layer and the loss function need to "match". For example, there is another possible loss function in PyTorch that we could have chosen for classification algorithms. This is the Cross Entropy Loss. But using both a Log Softmax for the output layer and this Cross Entropy Loss will lead to possible errors. This is because Cross Entropy Loss directly applies the Log Softmax to the resulting values of the net, meaning that we can just stick with a Linear output layer rather than applying a second logarithm and then run a Softmax to get back the actual probabilities.