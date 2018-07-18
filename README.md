# Event Positions

[![build](https://badge.buildkite.com/434abbf1e973ff68219e3b153d49c9354ebb2099fa368ee0e3.svg?branch=master)](https://buildkite.com/sourcegraph/event-positions)
[![codecov](https://codecov.io/gh/sourcegraph/event-positions/branch/master/graph/badge.svg?token=QmvTu3ZEPp)](https://codecov.io/gh/sourcegraph/event-positions)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

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
