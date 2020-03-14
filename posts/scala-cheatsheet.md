---
title: Scala Cheatsheet
published: true
description: |
    Because it is always useful to have
    some quick notes at hand.
category: Scala
ctime: 2018-07-06
---

A few days ago I started one of the [Udemy](//www.udemy.com) courses of Frank Kane about Spark with Scala! Although we had done an end-to-end Spark course in the Master's degree, I wanted to review all the concepts and libraries now that I had a better view on all of it. Also, learning Scala had an appeal on its own, as for every Spark answer I was looking in Java there were ten times the number of discussions in Scala.

In this post I'm going to put down a little summary on the brief introduction the course gave about Scala so that I can look at all the basics at the same place (I find it really hard to keep in mind all syntaxes for the different languages I play with everyday...). However, I really encourage you to take a look at the course, as Frank's communication capabilities and knowledge are outstanding :)

## Types

Starting with the basics of the basics, we can differentiate two types of objects. 

1. **Values:** constants that are immutable throughout the code. This philosophy aligns well with the concept of Spark's RDDs, which are again immutable collections of data, and thus cannot be changed. We want to use them as much as possible and create new immutable values from other immutable values.

```scala
val HelloWorld: String = "Hola!"  //> HelloWorld  : String = Hola!
```

2. **Variables:**  that are mutable.

```scala
var ChangingWorld: String = "Entropy"   //> ChangingWorld  : String = Entropy

// Concatenation with +
ChangingWorld = ChangingWorld + " and chaos!"
println(ChangingWorld)                  //> Entropy and chaos!
```

Then, both *val* and *var* can take the usual types:

```scala
  val myInt : Int = 1                         //> myInt  : Int = 1
  val myBool : Boolean = true                 //> myBool  : Boolean = true
  val myChar : Char = 'a'                     //> myChar  : Char = a
  val myDouble : Double = 3.14159265          //> myDouble  : Double = 3.14159265
  val myFloat : Float = 3.14159265f           //> myFloat  : Float = 3.1415927
  val myLong : Long = 1234567890l             //> myLong  : Long = 1234567890
  val myByte : Byte = 127                     //> myByte  : Byte = 127
```

Where a Float is a single-precision float with 32 bits, and a Double a double-precision float with 64 bits (the equivalent Int vs. Long).

## Prints

Prints are found in the middle of the way between Python's *print()* and Java's *System.out.println()*:

```scala
println(s"Using any saved variables is easy: $myChar, $myBool")
       //> Using any saved variables is easy: a, true

println(f"Rounding decimals on $myFloat%.3f")  //> Rounding decimals on 3.142
println(f"0's padding on the left on $myInt%05d")  //> 0's padding on the left on 00001
```

Also, thank's to **Expressions** we can even add computations:

```scala
println(s"Computing expressions: ${10 + 2}") //> Computing expressions: 12
```

## Regex

Fairly simmilar to other languages:

```scala
val someNumbers: String = "Here I have put some numbers 394823."
val pattern = """.* ([\d]+).*""".r //> pattern  : scala.util.matching.Regex = .* ([\d]+).*
val pattern(myExpression) = someNumbers //> myExpression  : String = 394823
```

## If/Else

```scala
  if (A > B) {
  	println("iiiiiiiiif!")
  } else {
  	println("eeeeeeeeeeeeelse")
  }                                              
```

Scala also has **Matching** using the special character _

```scala
  val number = 3                                  
  number match {
  	case 1 => println("One")
  	case 2 => println("Two")
  	case 3 => println("Three")
  	case _ => println("Anything different")
 	}                                         
```

## Loops

*For* loops syntax is also a bit unique:

```scala
for (x <- 1 to 4){ ... }
```

## Functions

Again, definitions order is changed:

```scala
 def squareInt(x: Int) : Int = {
  	x * x
  }  
```

But functions can also be any other function input! Which is the basic part of Functional Programming:

```scala
 def transformInt(x: Int, f: Int => Int) : Int = {
  	f(x)
  }  
```

Where this second functions takes as an input any function that works with Integers as input and output. However, defining functions throughout all the code can be tedious, so **Lambda functions** (or anonymous) can also be applied in the same schema:

```scala
transformInt(3, x => x * x * x)
```

Or going a bit further with expressions:

```scala
transformInt(2, x => {val y = x * 2; y * y})
```

## Tuples

```scala
val randomStuff = ("hello", true, 1)
println(randomStuff._1)                        //> hello
println(randomStuff._2)                        //> true
println(randomStuff._3)                        //> 1
```

Moreover, you can also create key-value pairs:

```scala
val pokemon = "Ash" -> "Pikachu"
println(pokemon._2)                            //> Pikachu
```

## Lists

Same with Python, indexes start at 0.

```scala
val pokeList = List("Pikachu", "Charmander", "Pidgey")
println(pokeList(1))                           //> Charmander
```

Head and tail give the first item and the rest:

```scala
println(pokeList.head)                        //> Pikachu
println(pokeList.tail)                        //> List(Charmander, Pidgey)
```

Iterating over the items in the list:

```scala
for (pokemon <- pokeList) {...}
```

We can apply functions to every item on the list: **map**:

```scala
val anotherPokeList = pokeList.map((pokemon: String) => {...})
```

**Reduce** can be used to combine all the elements of the list:

```scala
val someNumbers = List(1, 2, 3, 4, 5)             
val sum = someNumbers.reduce((x: Int, y: Int) => x + y)
```

Use **filter** to remove elements based on a rule:

```scala
val noFives = someNumbers.filter((x: Int) => x != 5)
```

Or in a more compact way:

```scala
val noThrees = someNumbers.filter(_ != 3)
```

To concatenate lists:

```scala
val finalList = List(1, 2, 3) ++ List(4, 5, 6)
```

Finally, some useful methods: **reverse**, **distinct**, **max**, **min**, **sum**, **contains**.

## Maps

Equivalent to Python's dictionaries.

```scala
val pokeMap = Map("Ash" -> "Pikachu", "Misty" -> "Togepy", "Brock" -> "Onix")
println(pokeMap("Misty"))            //> Togepy
```

And a little workaround for dealing with missing keys:

```scala
val GaryPoke = util.Try(pokeMap("Gary")) getOrElse "Unknown"
```

----------

Hope this basic summary is useful for someone and again, all credits go to Mr. Frank Kane :)
