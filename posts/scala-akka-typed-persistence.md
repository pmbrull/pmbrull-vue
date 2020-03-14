---
title: Akka Typed Persistence
published: true
description: |
    We are going to describe and build an example
    on how important persistence is. Moreover, we
    will see how to recover the state of our
    application after a failure.
category: Scala
ctime: 2020-01-16
---

In this post I'll write down some notes on the lectures of the Programming Reactive Systems [course](https://www.edx.org/course/programming-reactive-systems).

The principal of Akka Persistence if that actors can take note of changes that occur so that these changes can be later replayed, for example after a system reboot.

* Incoming commands may result in events
* Events are persisted in the journal
* Persisted events are applied as state changes

This pattern lends itself well to a type-safe expression:

* One function turns commands into events
* One function codified the effect of an event on the state

## Persistence example: Money Transfer

Bank account example:

* A and B have accounts held in a ledger
* The transfer is performed in two steps by a transfer protocol
* When the credit to B fails, A gets a refund (rollback)

Assume a simple ledger service:

```scala
sealed trait Ledger
case class Debit(account: String, amount: BigDecimal,
                 replyTo: ActorRef[Result]) extends Ledger
case class Credit(account: String, amount: BigDecimal,
                  replyTo: ActorRef[Result]) extends Ledger
```

Now, take a look at the initialization of the `ActorSystem` that will host this:

```scala
ActorSystem(Behaviors.setup[Result] { ctx =>
    val ledger = ctx.spawn(Ledger.initial, "ledger")
    // send 1000.0 from A to B using the ledger
    // The result will be sent to this guardian actor: ctx.self
    val config = TransferConfig(ledger, ctx.self, 1000.0, "A", "B")
    val transfer = ctx.spawn(PersistentBehaviors.receive(
        persistenceId = "transfer-1",
        // Initial state: await debit in A
        emptyState = AwaitingDebit(config),
        commandHandler = commandHandler,
        eventHandler = eventHandler
    ), "transfer")

    Behaviors.receiveMessage(_ => Behaviors.stopped)
}, "Persistence")
```

We use the `PersistenceBehavior` and add it an id, so that if the system crashes, the events can be replayed and the state recovered.

Let's look at the input commands:

```scala
sealed trait Command
case object DebitSuccess extends Command
case object DebitFailure extends Command
case object CreditSuccress extends Command
case object CreditFailure extends Command
case object Stop extends Command
```

Also, describe the events:

```scala
sealed trait Event
case object Aborted extends Event
case object DebitDone extends Event
case object CreditDone extends Event
case object RollbackStarted extends Event
case object RollbackFailed extends Event
case object RollbackFinished extends Event
```

The third element to define is the internal state: the stateful command handler

```scala
sealed trait State
case class AwaitingDebit(config: TransferConfig) extends state
case class AwaitingCredit(config: TransferConfig) extends state
case class AwaitingRollback(config: TransferConfig) extends state
case class Finished(result: ActorRef[Result]) extends state
case class Failed(result: ActorRef[Result]) extends state

val commandHandler: CommandHandler[Command, Event, State] = 
    CommandHandler.byState {
        case _: AwaitingDebit => awaitingDebit
        case _: AwaitingCredit => awaitingCredit
        case _: AwaitingRollback => awaitingRollback
        case _ => (_, _, _) => Effect.stop
    }
```

Here, the state that the actor is in defines the function that will handle the incoming commands. In the `Finished` and `Failed` states, the actors must terminate if it receives any further command.

## Tangent: a single-use adapter

Sometimes a single response is enough, follow-ups shall be dropped. An actor's lifecycle makes this easy to express.

What we want is that, for example, the debit request for A should result either into a `DebitSuccess` or `DebitFailure`, but never into a `CreditSuccess` nor `CreditFailure`. Thus, we will create adapter that are just for a single use.

```scala
def adapter[T](ctx: ActorContext[Command], f: T => Command): ActorRef[T] = 
    ctx.spawnAnonymous(Behaviors.receiveMessage[T] { msg =>
        ctx.self ! f(msg)
        Behaviors.stopped
    })
```

With this utility we can come back to the example:

## Handling a step

```scala
val awaitingDebit: CommandHandler[Command, Event, State] = {
    case (ctx, AwaitingDebit(tc), DebitSuccess) =>
        Effect.persist(DebitDone).andThen { state =>
            tc.ledger ! Credit(tc.to, tc.amount, adapter(ctx, {
                case Success => CreditSuccess
                case Failure => CreditFailure
            }))
        }
    case (ctx, AwaitingDebit(tc), DebitFailure) =>
        Effect.persist(Aborted)
            .andThen((state: State) => tc.result ! Failure)
            .andThenStop
    case x => throw new IllegalStateException(x.toString)
}

val eventHandler: (State, Event) => State = { (state, event) =>
    (state, event) match {
        case (AwaitingDebit(tc), DebitDone) => AwaitingCredit(tc)
        case (AwaitingDebit(tc), Aborted) => Failed(tc.result)
        case (AwaitingCredit(tc), CreditDone) => Finished(tc.result)
        case (AwaitingCredit(tc), RollbackStarted) => AwaitingRollback(tc)
        case (AwaitingRollback(tc), RollbackFinished) => Failed(tc.result)
        case (AwaitingRollback(tc), RollbackFailed) => Failed(tc.result)
        case x => throw new IllegalStateException(x.toString)
    }
}
```

## Taking the process back after recovery

When waking up after a crash, we can find ourselves in any state:

* Needs to take up the transfer again while still successful
* Needs to take up the rollback again if already failed
* Needs to signal completion if already terminated

What we need to do is re initiate at the right point:

```scala
PersistentBehavior.receive(
    ...
).onRecoveryCompleted {
    case (ctx, AwaitingDebit(tc)) =>
        ledger ! Debit(tc.from, tc.ammount, adapter(ctx, {
            case Success => CreditSuccess
            case Failure => CreditFailure 
        }))
    ...
    case (ctx, Finished(result)) =>
        println("still finished")
        ctx.self ! CreditSuccess // will effectively stop this actor
        result ! Success
    case (ctx, Failed(result)) =>
        println("still failed")
        ctx.self ! CreditFailure // will effectively stop this actor
        result ! Failure
}
```

To use the `onRecoveryCompleted`, we have the context as the first argument and the state from which we recover as the second.
