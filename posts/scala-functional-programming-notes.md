---
title: Functional Programming notes
published: true
description: |
    hese are just a bunch of notes I took 
    from the Functional Programming 
    Specialization course in Coursera.
category: Scala
ctime: 2019-03-29
---

Link to the [course](https://www.coursera.org/specializations/scala).

## Week 1

Scala uses an scheme of expression that is called the substitution model, formalized in the lambda-calculud, which gives a foundation for functional programming. The idea underlying this model is that all evaluations reduce an expression to a value. This can be applied to all expressions, as long as they do not have side effects. (ex: i++, cada vegada que no llencem ens dóna un valor més elevat pk està substituint el valor d'una variable)

We can define variables in three ways:

```scala
def example = 2      // evaluated when called
val example = 2      // evaluated immediately
lazy val example = 2 // evaluated once when needed
```

With this same idea, when evaluating a function $f(x_i)$ there are two scenarios:

* call-by-value: we first evaluate all the arguments x_i of the function and then its body.
* call-by-name: We first evaluate the body of the function and then its arguments.

Therefore, using the substitution model, we can say that if a statement evaluated by CBV terminates, then using CBN too, but the opposite does not hold (as we can define outlier cases like `def loop = loop`).

We need to avoid the usage of loops and rather use recursion. We should try to always create a recursive function that follows **Tail Recursion**, meaning that the result is the function itself in order to avoid JVM stack overflow errors.

## Week 2

Functional Programming languages treat functions as first-class values. This means that, as any other value, a function can be passed as a parameter or returned from another function, which will be called higher order functions.

```scala
// Take the sum of all integers between a and b
def sumInt(a: Int, b: Int): Int =
  if (a > b) 0 else a + sumInt(a + 1, b)

// But what if we want to sum the cubes? We could do:
def cube(x: Int): Int = x * x * x
def sumCubes(a: Int, b: Int): Int = 
  if (a > b) 0 else cube(a) + sumCubes(a + 1, b)

// However, for any other f(n) that we want to sum, we would need to define other functions. Let's define a higher order function
def sum(f: Int => Int, a: Int, b: Int) = 
  if (a > b) 0 else f(a) + sum(f, a + 1, b)

// Then, the above cases becomes:
def id(x: Int) = x

def sumInt(a: Int, b: Int) = sum(id, a, b)
def sumCubes(a: Int, b: Int) = sum(cube, a, b)

// Now, with anonymous functions
def sumCubes(a: Int, b: Int) = sum(x => x * x * x, a, b)


// Build this we tail-recursion
def sum(f: Int => Int, a: Int, b: Int) = {
    def loop(a: Int, acc: Int): Int = 
      if (a > b) acc else loop(a + 1, acc + f(a))
    loop(a, 0)
}
```

### Currying

Let's rewrite the sum function so that now it returns another function:

```scala
def sum(f: Int => Int): (Int, Int) => Int = {
    def sumF(a: Int, b: Int): Int = 
      if (a > b) 0 else sumF(a + 1, b)
    sumF
}

// Thus, we can also redefine sumInts and sumCubes:
def sumInts = sum(x => x)
def sumCubes = sum(x => x * x * x)

// And use them like
val mySum = sumInts(1, 10)

// But, can we get rid of the `sumInts` middleman? YES!
val mySum = sum (x => x) (1, 10)
```

What is happening here is that sum(x => x) is sumCubes, which needs arguments a and b. This can be done as function applications associate to the left. Moreover, there is more syntactic sugar we can apply here by using multiple parameter lists:

```scala
def sum(f: Int => Int)(a: Int, b: Int): Int = 
  if (a > b) 0 else f(a) + sum(f)(a + 1, b)
```

With this definition of sum, the value of `sum(f)` is valid and is another function. Thus, if we had $n$ input argument lists we can say that
$$
def f(args_1)...(args_n) = E
$$
is equivalent to
$$
def f = (args_1 => (args_2 => ...(args_n => E)...))
$$
This style of definition and function application is called **currying**.

### Exercise

1. Write a product function that calculates the product of the values of a function for the points on a given interval.
2. Write factorial in terms of product.
3. Write a more general function that generalizes both sum and product.

```scala
def product(f: Int => Int)(a: Int, b: Int): Int = 
  if (a > b) 1 else f(a) * product(f)(a + 1, b)

def factorial(n: Int) = product(x => x)(1, n)

def mapReduce(f: Int => Int, combine: (Int, Int) => Int, zero: Int)
             (a: Int, b: Int): Int = 
  if (a > b) zero else combine(f(a), mapReduce(f, combine, zero)(a + 1, b))

// Generalize product:
def product(f: Int => Int)(a: Int, b: Int) = mapReduce(f, (x, y) => x * y, 1)(a, b)
```

### Language Elements

We have seen  language elements to express type, expressions and definitions. We give their context-free syntax in Extended Backus-Naur form (EBNF), where

```
| denotes an alternative
[...] an option (0 or 1)
{...} a repetition (0 or more)
```

#### Types

```
Type = SimpleType | FunctionType
FunctionType = SimpleType '=>' Type
             | '(' [Types] ')' '=>' Type
SimpleType = Ident
Types = Type {',', Type}
```

A type can be numeric, boolean, string or function type.

#### Expressions

An expression can be:

* An identifier such as x
* A literal, like "abc"
* A function application
* An operator application
* A selection, like math.abs
* A conditional expression, like if (x < 0)
* A block, like {val x = math.abs(y); x * 2}
* An anonymous function

#### Definitions

* A function definition, like def square(x: Int) = x * x
* A value definition, like val y = square(2)

#### Parameters

* Call-by-value parameter, (x: Int)
* Call-by-name parameter, (y: => Double)

## Week 3

#### Class Hierarchies

```scala
abstract class IntSet {
    def incl(x: Int): IntSet
    def contains(x: Int): Boolean
}
```

We can keep the body of those functions empty as long as the class is abstract. Abstract classes can contain members which are missing an implementation. Consequently, no instances of an abstract class can be created with the operator `new`.

#### Class Extensions

Let's consider implementing sets as binary trees. There are two types of possible trees: a tree for the empty set and a tree consisting of an integer and two ordered subtrees. Here are their implementations:

```scala
class Empty extends IntSet {
    def contains(x: Int): Boolean = false
    def incl(x: Int): IntSet = new NonEmpty(x, new Empty, new Empty)
    override def toString = "."
}

class NonEmpty(elem: Int, left: IntSet, right: IntSet) extends IntSet {
    def contains(x: Int): Boolean = 
      if (x < elem) left contains x
      else if (x > elem) right contains x
      else true
    
    def incl(x: Int): IntSet = 
      if (x < elem) new NonEmpty(elem, left incl x, right)
      else if (x > elem) new NonEmpty(elem, left, right incl x)
      else this
    
    override def toString = "{" + left + elem + right + "}"
}

// Worksheet
val t1 = new NonEmpty(3, new Empty, new Empty) // {.3.}
val t2 = t1 incl 4                             // {.3{.4.}}
```

Notice this we are playing with immutable classes! When we speak of including a new element in the tree, we are not changing the actual tree, but creating a new one that will contain the new element. This data structures are called **persistent** data structures. When we do changes to the data structure, the old data structure is maintained. They are one cornerstone of FP.

> Empty and NonEmpty both extend the class IntSent. This implies that the types Empty and NonEmpty conform to the type IntSet. This means that an object of type Empty or NonEmpty can be used wherever an object of type IntSet is required.

> IntSet is the superclass of Empty and NonEmpty, which are the subclasses of IntSet

In Scala, any user-defined class extends another class. If no superclass is given, the standard class Object in the Java package `java.lang` is assumed. The direct or indirect superclasses of a class C are called base classes of C. So, the base classes of NonEmpty are IntSet and Object.

The definitions of *contains* and *incl* in the classes Empty and NonEmpty **implement** the abstract functions in the base *trait* IntSet. It is also possible to redefine an existing, non-abstract definition in a subclass by using override (like in the case of *toString*).

```scala
abstract class Base {
    def foo = 1
    def bar: Int
}

class Sub extends Base {
    override def foo = 2
    def bar = 3
}
```

#### Object Definitions

In the IntSet example, one could argue that there is really only a single empty IntSet. So it seems overkill to have the user create many instances of it. We can express this case better with an *object* definition:

```scala
object Empty extends IntSet {
    def contains(x: Int): Boolean = false
    def incl(x: Int): IntSet = new NonEmpty(x, Empty, Empty)
}
```

This defines a **singleton object** named Empty. No other Empty instances can be (or need to be) created. Singleton objects are values, so Empty evaluates to itself. We go from the abstract platonic idea or blueprint of an element defined by class to rather a named instance, which is the object, and will be created the first time you reference it.

#### Programs

So far we have executed all Scala code from the REPL or the worksheet. But it is also possible to create standalone applications in Scala. Each such application contains an object with a main method. For instance:

```scala
object Hello {
    def main(args: Array[String]) = println("hello world!")
}
```

Once this program is compiled, you can start it from the command line with `> scala Hello`

#### Exercise

Write a method *union* for forming the union of two sets. You should implement the following abstract class.

```scala
abstract class IntSet {
    def incl(x: Int): IntSet
    def contains(x: Int): Boolean
    def union(other: IntSet): IntSet
}
```

```scala
class Empty extends IntSet {
    def contains(x: Int): Boolean = false
    def incl(x: Int): IntSet = new NonEmpty(x, new Empty, new Empty)
    override def toString = "."
    def union(other: IntSet): IntSet = other
}

class NonEmpty(elem: Int, left: IntSet, right: IntSet) extends IntSet {
    def contains(x: Int): Boolean = 
      if (x < elem) left contains x
      else if (x > elem) right contains x
      else true
    
    def incl(x: Int): IntSet = 
      if (x < elem) new NonEmpty(elem, left incl x, right)
      else if (x > elem) new NonEmpty(elem, left, right incl x)
      else this
    
    override def toString = "{" + left + elem + right + "}"
    def union(other: IntSet): IntSet = 
      ((left union right) union other) incl elem
}
```

The union recursion terminates as each call to union is done on a smaller set, so at some point we should reach an Empty set whose union just return *other*.

#### Dynamic Binding

Object-oriented languages (including Scala) implement **dynamic method dispatch**. This means that the code invoked by a method call depends on the runtime type of the object that contains the method.

Ex: using the substitution method:

```
Empty cotains 1 -> [1/x] [Empty/this] false
```

```
(new NonEmpty(7, Empty Empty)) contains 7 ->
[7/elem] [7/x] [New NonEmpty(7, Empty, Empty)/this]
  if (x < elem) this.left contains x
  else if (x > elem) this.right contains x else true
= if (7 < 7) new NonEmpty(7, Empty, Empty).left contains 7
  else if (7 > 7) new NonEmpty(7, Empty, Empty).right contains 7
  else true
-> true
```

#### One question to ponder

Dynamic dispatch of methods is analogous to calls to higher-order functions.

Can we implement one concept in terms of the other?

* Objects in terms of higher-order functions?
* Higher-order functions in terms of objects?

### How Classes Are Organized

#### Packages

Classes and objects are organized in packages. To place a class or object inside a package, use a package clause at top of your source file.

```scala
package progfun.examples
object Hello {...}
```

This would place *Hello* in the package `progfun.examples`. You can then refer to Hello by its fully qualified name `progfun.examples.Hello`. For instance, to run the Hello program: `> scala progfun.examples.Hello`.

Different forms of import, where the first two are called *named* imports and the last one is called a *wildcard* import.

```scala
import week1.Rational           // import just Rational
import week1.{Rational, Hello}  // import Rational and Hello
import week1._                  // import everything in package week1
```

You can import from either a package or an object.

#### Automatic Imports

Some entities are automatically imported in any Scala program. These are:

* All members of package scala
* All members of package java.lang
* All members of the singleton object scala.Predef.

For example: 

```
Int -> scala.Int
Object -> java.lang.Object
require -> scala.Predef.require
```

#### Traits

In Java, as well as in Scala, a class can only have one superclass (single-inheritance language). But what if a class has several natural supertypes to which it conforms or from which it wants to inherit code?

Here, you could use traits. A trait is declared like an abstract class:

```scala
trait Planar {
    def height: Int
    def width: Int
    def surface = height * width
}
```

Classes, objects and traits can inherit from at most one class but arbitrary many traits.

```scala
class Square extends Shape with Planar with Movable...
```

Traits can never have value parameters (No val, just def).

#### Top Types

At the top of the scala language hierarchy we find:

* Any: the base type of all types. Methods `==`, `!=`, `equals`, `toString`
* AnyRef: the base type of all reference types. Alias of java.lang.Object
* AnyVal: the base type of all primitive types (Int, Boolean...)

#### The Nothing Type

*Nothing* is at the bottom of Scala's type hierarchy. It is a subtype of every other type. There is no value of type *Nothing*. Why is that useful?

* To signal abnormal termination
* As an element type of empty collections

#### Exceptions

Scala's exception handling is similar to Java's. The expression `throw Exc` aborts evaluation with the exception Exc. The type of this expression is *Nothing*.

#### The Null Type

Every reference class type also has null as a value. The type of null is Null. Null is a subtype of every class that inherits from `Object`; it is incompatible with subtypes of AnyVal.

```scala
val x = null          // x: Null
val y: String = null  // y: String
val z: Int = null     // error: type mismatch
```

#### Exercise

What is the type of 

```scala
if (true) 1 else false
```

It is **AnyVal**.We get AnyVal as we either get Int or Boolean, which do not match but are both values. So they go both to their superclass AnyVal.

### Polymorphism

More flexible ways to express and parametrize Types. For the sake of discussion, we will follow the **Cons-List** as example.

#### Cons-Lists

A fundamental data structure in many functional languages is the immutable linked list. It is constructed from two building blocks:

* Nil: the empty list
* Cons: a cell containing an element and the remainder (a pointer/reference) of the list. (Squares are the Cons, where the first element is the cell and the other the remainder)

![cons-lists]({{ "/resources/images/scala/cons-lists.png" | absolute_url }})

Here's an outline of a class hierarchy that represents lists of integers in this fashion:

```scala
trait IntList ...
class Cons(val head: Int, val tail: IntList) extends IntList ...
class Nil extends IntList
```

So a list is either:

* an empty list new Nil, or
* a list new Cons(x, xs) consisting of a head element x and a tail list xs.

#### Value Parameters

Note the abbreviation (`val head: Intl val tail: IntList`) in the definition of Cons. This defines at the same time parameters and fields of a class. It is equivalent to:

```scala
class Cons(_head: Int, _tail: IntList) extends IntList {
    val head = _head
    val tail = _tail
}
```

where `_head` and `_tail` are otherwise unused names.

#### Type Parameters

It seems too narrow to define only lists with Int elements. We'd need another class hierarchy for *Double* lists and so on, one for each possible element type. We can generalize the definition using a type parameter:

```scala
trait List[T]
class Cons[T](val head: T, val tail: List[T]) extends List[T]
class Nil[T] extends List[T]
```

Type parameters are written in square brackets, e.g. [T]. Developing this further:

```scala
trait List[T] {
    def isEmpty: Boolean
    def head: T
    def tail: List[T]
}

class Cons[T](val head: T, val tail: List[T]) extends List[T] {
    def isEmpty = false // Cons cells are never empty by definition
}
class Nil[T] extends List[T] {
    def isEmpty: Boolean = true
    def head: Nothing = throw new NoSuchElementException("Nil.head")
    def tail: Nothing = throw new NoSuchElementException("Nil.tail")
}
```

We can use a method that returns Nothing because Nothing is a subtype of any other Type. In this case, T.

#### Generic Functions

Like classes, functions can have type parameters. For instance, here is a function that creates a list consisting of a single element:

```scala
def singleton[T](elem: T) = new Cons[T](elem, new Nil[T])

// we can write:
singleton[Int](1)
singleton[Boolean](true)
```

#### Type Inference

In fact, the Scala compiler can usually deduce the correct type parameters from the values arguments of a function call. So, in most cases, type parameters can be left out. You could also write:

```scala
singleton(1)
singleton(true)
```

#### Types and Evaluation

Type parameters do not affect evaluation in Scala. We can assume that all type parameters and type arguments are removed before evaluating the program. This is also called **type erasure**. This means that types are important for the compiler, who needs to run some checks on the code, but are not relevant in terms of execution.

#### Polymorphism

Polymorphism means that a function type comes "in many forms". In programming it means that

* The function can be applied to arguments of many types, or
* The type can have instances of many types.

We have seen two principal forms of polymorphisms:

* subtyping: instances of a subclass can be passed to a base class. (If we have a List as superclass of Nil and Cons, we could pass either of those where a List can be passed)
* generics: instances of a function or class are created by type parametrization. (Using generics we could create  list of Ints, Doubles, Booleans... whatever type that we want)

#### Exercise

Write a function nth that takes an integer n and a list and selects the nth element of the list. Elements are numbered from 0. If index is outside the range from 0 up to the length of the list minus one, a IndexOutOfBoundsException should be thrown.

```scala
trait List[T] {
    def isEmpty: Boolean
    def head: T
    def tail: List[T]
}

class Cons[T](val head: T, val tail: List[T]) extends List[T] {
    def isEmpty = false // Cons cells are never empty by definition
}
class Nil[T] extends List[T] {
    def isEmpty: Boolean = true
    def head: Nothing = throw new NoSuchElementException("Nil.head")
    def tail: Nothing = throw new NoSuchElementException("Nil.tail")
}

def nth[T](n: T, xs: List[T]): T = 
  if (xs.isEmpty) throw new IndexOutOfBoundsException
  else if (n == 0) xs.head
  else nth(n - 1, xs.tail)
```
