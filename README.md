ember-stateful-promise
==============================================================================

[![Download count all time](https://img.shields.io/npm/dt/ember-stateful-promise.svg)](https://badge.fury.io/js/ember-stateful-promise)
[![GitHub Actions Build Status](https://img.shields.io/github/workflow/status/snewcomer/ember-stateful-promise/CI/main)](https://github.com/snewcomer/ember-stateful-promise/actions/workflows/ci.yml?query=branch%3Amain)
[![npm version](https://badge.fury.io/js/ember-stateful-promise.svg)](https://badge.fury.io/js/ember-stateful-promise)
[![Ember Observer Score](https://emberobserver.com/badges/ember-stateful-promise.svg)](https://emberobserver.com/addons/ember-stateful-promise)

[ember-concurrency](http://ember-concurrency.com/docs/introduction/) is the go to solution in the Ember community for tracking async action state and many other tasks around async behaviour.  

`ember-stateful-promise` seeks to *simplify* with native `async/await` instead of generators and expose a few flags on a promise object for you to use.  Moreover, they are tracked! This library can be used if you simply need derived state your async functions and/or need a lightweight version of ember-concurrency.

Also [ember-promise-helpers](https://github.com/fivetanley/ember-promise-helpers) is another great library if you want to calculate state from your promises.  `ember-stateful-promise` is different in that is seeks to provide derived state.

Lastly, if you already use ember-concurrency but rather author with `async/await`, [ember-concurrency-async](https://github.com/chancancode/ember-concurrency-async) is available as a babel build time plugin.  Again, you just need to weigh the tradeoffs (size, complexity) for your project.

## API

Supports

1. Derived state
2. Debouncing async functions
3. Cleanup of async functions wired up with `@ember/destroyable`

- `isRunning`
- `isResolved`
- `isError`
- `isCanceled`
- `performCount`

## Usage

There are a few ways to use this addon.  Likely, you only need the `stateful-function` decorator.  However, if you need the lower level util, we make that available as `StatefulPromise` as well.


### Decorator

```js
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { statefulFunction } from 'ember-stateful-promise/decorators/stateful-function';

class MyComponent extends Component {
    @statefulFunction
    async clickMe() {
        await fetch(url);
    }
}
```

```hbs
<button
  disabled={{if this.clickMe.isRunning "true"}}
  {{on "click" this.clickMe}}>
    Click 
</button>
<p>(Clicked this many times - {{this.clickMe.performCount}})</p>
```

Note - the default behaviour out of the box is to `debounce` the action.  When clicked while a promise is outstanding, the first promise will be rejected and a new promise will be created.

To throttle the function, pass `{ throttle: true }` to the decorator arguments.

```js
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { statefulFunction } from 'ember-stateful-promise/decorators/stateful-function';

class MyComponent extends Component {
    @statefulFunction({ throttle: true })
    async clickMe() {
        await fetch(url);
    }
}
```

Note - If you decorate a function with the `@action` decorator, you will lost the derived state.  `@statefulFunction` will bind `this` for you.  As a result, `@statefulFunction` replaces `@action` while giving you all the features of this addon!


### Stateful Promise

- Promise `interface`
```js
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

const promise = fetch(url);
let result = new StatefulPromise((resolveFn, rejectFn) => {
    promise.then((data) => resolveFn(data)).catch((e) => rejectFn(e));
});

result.isRunning; // true
result.isResolved; // false
result.isError; // false

await result;

result.isRunning; // false
result.isResolved; // true
result.isError; // false
```

- `create` method with destroyable

```js
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

const promise = fetch(url);
let result = new StatefulPromise().create(this, promise);

result.isRunning; // true
result.isResolved; // false
result.isError; // false

await result;

result.isRunning; // false
result.isResolved; // true
result.isError; // false
```

```js
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { action } from '@ember/object';

class MyComponent extends Component {
    @action
    clickMe() {
        const promise = fetch(url);
        // Destroyable registered
        let result = new StatefulPromise().create(this, (resolveFn, rejectFn) => {
            promise.then((data) => resolveFn(data)).catch((e) => rejectFn(e));
        });

        // Component destroyed
        // and then
        try {
            await result;
        } catch (e) {
            // WILL ERROR here!
        }

    }
}
```

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.20 or above
* Ember CLI v3.20 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-stateful-promise
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
