---
title: Introduction to PyTorch V
published: true
description: |
    All previous examples were run on MNIST data,
    which can be directly accessed from PyTorch module,
    so we still need to go through on the real fun 
    tackling more interesting datasets.
category: Python
ctime: 2019-06-15
---

These are just my notes about Udacity's Secure and Private AI course. You can find all the information about the course [here](https://eu.udacity.com/course/secure-and-private-ai--ud185).
    
## Data Loaders and Transforms

The first we need, when managing image data, is having everything organized correctly. This means keeping all the dataset in a paren directory which is divided into as many subdirectories as categories we got, for example:

```
/parent/cat/random_cat.png
/parent/dog/random_dog.png
```        

This partitioning is actually what the `datasets` module needs to infer the different categories and label the images. However, as we are trying to input all that different data into the same net, we require the same dimensions for all the images, which will be hardly given. For that, wecan use different **transforms**, which are operations that we can run when preparing preparing the dataset to standardize the data or apply any operation that can help train our model. Finally, **data loaders** are used to create the image generator, divided into batches, that is going to feed our network. Note how by using a generator we just can iterate through the data loader object once, but also keeps our machined from filling their memory up, as only calculates the elements when they are being called.
        
This gives us the following ingredients:
        
* **Dataset:** Obtained by loading the images from the categorized directories, to whom we can apply any transform.
* **Transforms:** Used to modify the data we are loading. We can pipe any number of them.
* **Data Loaders:** To create the generator that will feed the model.

Putting all that into code would give the following example:
        
```python
import torch
from torchvision import datasets, transforms

# Prepare transforms
transform = transforms.Compose([
    transforms.Resize(255),
    transforms.CenterCrop(224),
    transforms.ToTensor()
])

# Create dataset
dataset = datasets.ImageFolder('/parent/path/', transform=transform)
# Prepare data loader
dataloader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)
```

The more broad idea that we brought here is the one about transforms, so it will be useful to keep all the documentation on that at [hand](https://pytorch.org/docs/master/torchvision/transforms.html).
        
Moreover, note how in the documentation transforms are divided into PIL (Python Imaging Library) Images or Tensors transforms, as we will treat images on both formats. All the data will be in PIL format until we specify it to become a tensor, which is the right format to feed our nets.
        
A last note on transforms is about `transforms.Normalize`, where we can specify a list of means and standard deviations that will be applied in the normalization of each channel - RGB, e.g., 

```python
train_transforms = transforms.Compose([
    ...
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5])
])
```

## Data Augmentation
        
When working with image data sometimes it is useful to apply random transforms on our data in order to create some noise that will help our network to identify different aspects of the dataset. For example, if we were just working with perfect photos taken out from Google about dogs, then it would be harder to generalize the model to lower quality photos taken from phones or with dogs in different positions. For that, we can apply transforms such as ,`RandomRotation`, `RandomResizedCrop` or `RandomHorizontalFlip`.
