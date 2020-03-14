---
title: Jupyter on EC2
published: true
description: |
    This will be a short, easy and painless post
    about how to work with a jupyter notebook
    directly on an AWS EC2 instance, showed to
    me by a collaegue and I ended up using it 
    in my daily work rutine.
category: Python
ctime: 2018-06-05
---

Data scientists usually like to work with jupyter as you can run code chunk by chunk and always have at plain sight all the data transformations you are applying before building the final pipeline or to check and keep customizing a bunch of plots for further data insight. However, laptops do not always meet the highly demanding computational requirements some data needs (and I am not even talking about deep learning!), so AWS has become business' best friend as it lets personnel work comfortably in a somehow low-cost environment easily adapted to the changing project needs and with a never stopping growth of possible add-ons (Lambda, S3, Redshift...).

If you want to check it out, remember AWS offers free instance trials (freemium business strategy that has shown to work out outstandingly well). So, without further delay, let's get into what matters. EC2 is just a server hosted in the cloud, so as any server can be accessed via SSH. 

1. First, open a linux terminal (or any software in windows that allows unix commands, like GitBash), and type:

```bash
ssh -i "</path/to/server_file.pem>" -L 8000:localhost:9500 ec2-user@ec2-public-ip
```

What happens here is that we are making a tunnel between our own laptopt from port 8000 to the EC2 instance port 9500. Note that port numbers do not matter as long as you have put your own ip in the **AWS security group** for the EC2 port you are willing to use.

2. If you have not done it already, install jupyter notebook in the server and start it at the specified EC2 port.

```bash
jupyter notebook --no-browser --port=9500 
```

In the terminal will appear a long URL like

```
localhost:9500/<huge string of random characters that work as security>
```

3. Copy that to your computer's browser, replace the port with 8000 and you will be good to go!

As promised, easy, painless and 100% useful.
