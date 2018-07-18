# Event Positions

This is a small library used to determining the the positions that events happened at
in code views.

## Installation

```shell
npm i event-positions
```

## Usage

It is currently exposed as an [RxJs Operator](http://reactivex.io/rxjs/manual/overview.html#operators)

```javascript
import { findPositionsFromEvents } from 'event-positions'

observableOfDomElements
  .pipe(
    findPositionsFromEvents({
      ...props,
    })
  )
  .subscribe(positionEvent => console.log(positionEvent)) // { line: ..., character: ..., token: ... }
```
