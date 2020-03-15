---
title: Introduction to PyTorch I
published: true
description: |
    I recently started Udacity's Secure and Private AI course,
    so I will try to write down some posts with my personal 
    notes about the course to keep everything organized! 
    First chapter is a brief but pretty complete introduction
    to python's deep learning framework PyTorch.
category: Python
ctime: 2019-06-08
---

You can find all the information about the course [here](https://eu.udacity.com/course/secure-and-private-ai--ud185).

## Into Deep Learning

Deep learning has been around for quite a while. However, it just looks like it appeared now. This is because of the evolution undergone by hardware components these last few years. As deep learning techniques equire huge amounts of computational power, people could start applying it once this power became vailable for a much lower price.
          
      
The whole idea behind neural networks is to mimic how a brain works. At any given moment we are rocessing tons of information, but just a part of this information is actually valuable. We are able to respond to  any important impulse or stimulation because we are granting it a higher weight than the one we give to the rest of the noise we usually perceive. The most simple model that represents this behavior is the one consisting in just one neuron, called **perceptron**:

<img src="../../images/posts/python/pytorch/perceptron.png" class="h-72 my-4 justify-center m-auto">

As shown in the figure above, we are just giving some weights to our incoming features, summimg them up and finally applying what is called an *activation function*. Formally, it looks like this:

$$ y = f \left( \sum_i w_i x_i + b \right), $$
        
or what the same, apply the activation function to the dot product of two vectors with the sum of a bias factor. With PyTorch we use this second abstraction, where we can represent both features and weights as **tensors**, which are vectors of any arbitrary dimension. As with pandas, we can use `tensor.shape` to recover the dimensions of the tensor. Moreover in order to being able to correctly operate with the tensors and prepare a 1D input for our input layer, we sometimes may need to change the shape of our data:


* `tensor.view(a, b)` will create a new tensor, containing the same data but arranged with the new dimensions specified.
* As we may not always care about immutability, we can also change the shape of a tensor in-place with `tensor.resize_(a, b)`. The underscore at the end of the function marks that the method will be applied onto the same variable.
* `tensor.reshape(a, b)` is slightly different than `view()`, but usually gives the same result. More information about this can be found [here](https://stackoverflow.com/questions/49643225/whats-the-difference-between-reshape-and-view-in-pytorch).

The whole usage behind neural networks relies on building any kind of function generalization by composing simple algebraic computations as the one showed in the perceptron. Using more than one neuron at the same time gives us layers, and the usage of multiple layers derives in the concept of deep learning. We can divide the layers in three main groups: 

* Input layer - takes in the data,
* Hidden layers - Possible multiple layers transforming the data sequentially,
* Output layer - Returning a result that we can then transform into, for example, a given classification probability.
      
If we state that any model can be perfectly defined by a given function $f$, we just need to be ble to get the best approximation $\hat{f}$ possible to this function. However, $f$ will rarely be linear, so we need to use specific activation functions that help us to get as close as possible to non-linear functions. his means that these activation functions are requires to be non-linear too. A common activation function to apply to the hidden layers is the ReLU function - Rectified Linear Unit:

$$
f(x)  = \begin{cases}
    x & \mbox{if } x > 0 \\
    0 & \mbox{otherwise}
\end{cases}
$$
          
## Modelling Neural Networks

Now we are ready to prepare our first model. Let's follow the courses example on classifying the           MNIST digit data:
        
```python
import torch.nn.functional as F
    
    class Network(nn.Module):
        def __init__(self):
            super().__init__()
            # Defining the layers, 128, 64, 10 units each
            self.fc1 = nn.Linear(784, 128)
            self.fc2 = nn.Linear(128, 64)
            # Output layer, 10 units - one for each digit
            self.fc3 = nn.Linear(64, 10)
    
        def forward(self, x):
            ''' Forward pass through the network, returns the output logits '''
    
            x = self.fc1(x)
            x = F.relu(x)
            x = self.fc2(x)
            x = F.relu(x)
            x = self.fc3(x)
            x = F.softmax(x, dim=1)
    
            return x
```
      
Then, if we wanted to get the outputs of passing some data through our network, we would just need to call 
`model.forward(data)` or the equivalent `model(data)`. Note how in this case we are using a Softmax activation function for the outputs, as we want to get a probability for all observations to belong to any of the ten available target classes. We use the parameter `dim=1` so that the columns, which are the classes probabilities, sum a total of 1, not the rows. However, this notation for the model creation requires quite a bit of boilerplate. We can use PyTorch's Sequential function for a more convenient approach:
            
```python
# Hyperparameters for our network
input_size = 784
hidden_sizes = [128, 64]
output_size = 10

# Build a feed-forward network
model = nn.Sequential(
    nn.Linear(input_size, hidden_sizes[0]),
    nn.ReLU(),
    nn.Linear(hidden_sizes[0], hidden_sizes[1]),
    nn.ReLU(),
    nn.Linear(hidden_sizes[1], output_size),
    nn.Softmax(dim=1)
)
```

Finally, the same result can be obtained using dictionaries, so for more complex networks, we can access any layer directly by name:
        
```python
from collections import OrderedDict
model = nn.Sequential(
    OrderedDict([
        ('fc1', nn.Linear(input_size, hidden_sizes[0])),
        ('relu1', nn.ReLU()),
        ('fc2', nn.Linear(hidden_sizes[0], hidden_sizes[1])),
        ('relu2', nn.ReLU()),
        ('output', nn.Linear(hidden_sizes[1], output_size)),
        ('softmax', nn.Softmax(dim=1))
    ])
)
```
