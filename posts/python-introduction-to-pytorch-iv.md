---
title: Introduction to PyTorch IV
published: true
description: |
    We have already seen how to create, train and 
    validate our nets, so it's time to think about 
    how we can reuse or share the models we create.
category: Python
ctime: 2019-06-14
---

These are just my notes about Udacity's Secure and Private AI course. You can find all the information about the course [here](https://eu.udacity.com/course/secure-and-private-ai--ud185).

## Save and Load

Training ML algorithms takes time and computational power, and both experience a huge increase when talking with tasks related to Deep Learning, which is why sometimes we even need to use GPUs instead of the usual CPUs. Moreover, a model is of no use if we cannot deploy it in a production environment or share it in any way. This is why PyTorch presents an easy way to save and load the results of our hard work.
        

        
If we get back to basics, we discussed that a neural network is nothing else than just a bunch of tensors - vectors describing weights and biases for each layer. Thus, this is just what we need to save. All this information can be accessed in the model's `state_dict()`.
        
```python
        print("Our model: \n\n", model, '\n')
          print("The state dict keys: \n\n", model.state_dict().keys()))
```

```
Our model:

Network(
(hidden_layers): ModuleList(
    (0): Linear(in_features=784, out_features=512, bias=True)
    (1): Linear(in_features=512, out_features=256, bias=True)
    (2): Linear(in_features=256, out_features=128, bias=True)
)
(output): Linear(in_features=128, out_features=10, bias=True)
(dropout): Dropout(p=0.5)
)

The state dict keys:

odict_keys(['hidden_layers.0.weight', 'hidden_layers.0.bias', 'hidden_layers.1.weight',
'hidden_layers.1.bias', 'hidden_layers.2.weight', 'hidden_layers.2.bias', 'output.weight',
'output.bias'])
```
        
Therefore, if we want to save our model we just need to call `torch.save(model.state_dict(), 'checkpoint.pth')`, where the extension .pth is just a convention for PyTorch saved objects. Again, what this file will contain is just the serialized tensor data for weights and biases. Loading the model is just as straight forward as saving it, involving just a couple of calls from an already defined model: 
          
```python
model.load_state_dict(torch.load('checkpoint.pth')))
```
        
However, think about the shape of the tensors that we are using. They must match the architecture of the network in the first place, otherwise we'll just get an error. As the `state_dict` is just a Python dictionary, we can add another layer of information regarding this architecture so that we always know what we are loading:

```python
checkpoint = {
    'input_size': 784,
    'output_size': 10,
    'hidden_layers': [...],
    'state_dict': model.state_dict()
}

torch.save(checkpoint, 'checkpoint.pth')
model.load_state_dict(checkpoint['state_dict'])
mode.state_dict()
```

```
OrderedDict([('hidden_layers.0.weight',
              tensor([[-5.0936e-02, -4.0665e-02, -4.8763e-02,  ..., -5.2258e-02,
                      -3.0445e-02, -3.1720e-02],
                      [ 5.9936e-02,  6.6812e-02,  3.5556e-02,  ...
```
