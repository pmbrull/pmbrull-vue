---
title: First contact with Docker
published: true
description: |
    Docker containers allow us to create decoupled
    applications built upon multiple independent
    and isolated pieces. It has been growing in
    usage and popularity during the last years, so
    let's get hands on!
category: Big Data
ctime: 2018-08-18
---

After a brief motivational [post](https://pmbrull.dev/post/bigdata-introduction-to-docker) about why has Docker become so much popular in the last years, it's time to starting to know each other. You can install docker following this [instructions](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository). To check that everything went smoothly, run:

```bash
docker run hello-world
```

In order to understand docker, the schema one should have in mind is the following:

<img src="../../images/posts/bigdata/Docker-schema.png" class="w-84 my-4 justify-center m-auto">

An interesting analogy in the documentation describes *images* like git repositories, where you can commit changes and have version control. Listing down some of the main commands, we have the following:

* To `pull` an [**image**](https://hub.docker.com/_/busybox/) from the [**Docker registry**](https://hub.docker.com/explore/) and save it to your system:

```bash
docker pull <name>
```

* Then, you can run it with the `run` command. If you try to run an unexisting image on your system, `docker run` will also try to pull it from the registry.
* To get a list of all containers (running or exited), run: `docker ps -a`. You can then delete a container by specifying its ID in `docker rm <id>`, or generally, delete all exited containers: `docker rm $(docker ps -a -q -f status=exited)`. 
* Adding the `--rm` flag on the run command deletes the container when the work gets done.
* To run a container *detached* from your terminal (you can navigate freely after run command), use `docker run -d`. To stop a detached run: `docker stop <id>`.
* For checking images available locally: `docker images`.

> OBS: If we run a container that exposes content on a given port for the server inside the container (for example, a web app), we should link this port to an external port to being able to access: `-p 8888:5000` will link our machine's port 8888 to container's port 5000 when running an image.

However, the interesting part about docker is not just running some created images, but rather *building* our own. But before let's note a major differentiation, as there are:

* **Base Images**: which have no parent image. Usually based on OS (for example, Ubuntu).
* **Child Images**: that are built on Base Images and give additional functionalities. All user images will be Child Images, and should be formated as `user/image-name`.

After this bit of theory, we can start preparing our first image! There is just one ingredient left to explain: the [Dockerfile](https://docs.docker.com/engine/reference/builder/). Docker can be seen as an evolution of Virtual Machines, which also provide separate environments for running applications. The distinctive point here is that Docker only requires the minimum amount of dependencies for the application to run, which makes it both faster and lighter. Thus, the **Dockerfile** is where we write down these dependencies. As an example, we will build a super simple python script into an Image:

1. Create a directory called `docker-test`.

2. Create the following script, which we will name `supersimple.py`:

   ```python
   print('Wow I am indeed simple...')
   ```

3. Create a Dockerfile like this named `Dockerfile`:

   ```dockerfile
   # Select Base Image
   FROM python:3
   
   # Add our script
   ADD ./supersimple.py /
   
   # run the command
   CMD ["python", "./supersimple.py"]
   ```

4. Run 

   ```bash
   docker build -t pmbrull/python-supersimple .
   ```

   (and do not forget the `.`!) which should give an output like this:

   ```bash
   Sending build context to Docker daemon 3.072 kB
   Step 1/3 : FROM python:3
    ---> 825141134528
   Step 2/3 : ADD ./supersimple.py /
    ---> 6228528d7e17
   Removing intermediate container 60abe53ac799
   Step 3/3 : CMD python ./supersimple.py
    ---> Running in 761cbeb0dd08
    ---> f7b62c31f924
   Removing intermediate container 761cbeb0dd08
   Successfully built f7b62c31f924
   ```

(If the python image had not yet been pulled, it will also pull it, so you could have more outputs)

Here we are basically *dockerizing* a python3 application that prints a sentence. Not too fancy but serves as an example. Now, try to run it to check that everything is OK, adding the `--rm` flag to free the container's space after the execution.

```
docker run --rm pmbrull/python-supersimple
```

As everything went as expected, and I can't foresee any other time to use this Image, we better remove it:

```
docker rmi pmbrull/python-supersimple
```

> OBS: the `rmi` command gave no problems in this case as the container got automatically deleted once the work was done. You cannot remove an image if there are yet existing containers based on it.

----

After this first approach, why don't we go a baby step further and prepare an image for the following script `justsimple.py`:

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--word", help="What to print.")

args = parser.parse_args()
word = args.word

print('I\'m dockerizing {}'.format(word))
```

Note that now we have input arguments! This means that we need to tweak the Dockerfile a bit, but really, just a bit: change `CMD` for `ENTRYPOINT` and we will be ready to go. Repeat the steps above and test it out:

```
docker run --rm pmbrull/python-justsimple --word=simplestuff
> I'm dockerizing simplestuff
```

Whenever we create a docker Image worth sharing, we can `push` it to the registry simply by running `docker push user/image-name`.

The major source of information here has been [docker curriculum](https://docker-curriculum.com/), which also contains some helpful examples to start feeling comfortable with Docker commands. Hope this helped someone :)
