---
title: Asynchronous Programming - Futures
published: true
description: |
    Before we can dive deep into more state of the
    art frameworks such as Akka, we need to
    understand the basics of asynchronous
    programming.
category: Scala
ctime: 2019-12-18
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

## Introduction

To make a function call asynchronous, we need to add a `callback` to its signature, so we transform 

```scala
def func(a: A): B
```

to

```scala
def func(a: A, k: B => Unit): Unit
```

Where the callback function `k` specifies what should happen once we get the resulting type `B`. This is called `continuation passing style`. However, this approach can be simplified by adding an asynchronous result type `T`:

```scala
def func(a: A) => Future[B]
```

We can actually go from the first step, where the type `B` is the argument of a function to the `Future` usage by currying the initial function and taking a high level look at `Future` as a type:

```scala
type Future[+T] = (Try[T] => Unit) => Unit
```

By using `Future` we can play around to the `Success` or `Failures` of the execution of `myFuture.onComplete()` or retry with methods such as `recover` or `recoverWith` (asynchronous).

Programming with `Futures` comes with a great syntax to control the logic flow following a top to bottom layout:

```scala
def workRoutine(): Future[Work] = 
  for {
      work1 <- work()
      _ <- coffeeBreak()
      work2 <- work()
  } yield work1 + work2
```
