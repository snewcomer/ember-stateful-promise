ember-stateful-promise
==============================================================================

[ember-concurrency](http://ember-concurrency.com/docs/introduction/) is the go to solution in the Ember community for tracking async action state and many other tasks around async behaviour.  

This library seeks to simplify and expose a few flags on a promise object for you to use.  Moreover, they are tracked! This library can be used if you only need derived state and/or need a lightweight version of ember-concurrency.

Also [ember-promise-helpers](https://github.com/fivetanley/ember-promise-helpers) is another great library if you want to calculate state from your promises.  This library is different in that is seeks to provide derived state.

- `isRunning`
- `isResolved`
- `isError`
- `isCancelled`

## Usage

There are a few ways to use this addon.  Likely, you only need the `statefulAction` decorator.  However, if you need the lower level util, we make that available as `StatefulPromise` as well.

### Stateful Promise

- Promise `interface`
```
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

```
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

```
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

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

### Decorator
```
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { statefulAction } from 'ember-stateful-promise/decorators/stateful-action';

class MyComponent extends Component {
    @action
    @statefulAction
    async clickMe() {
        await fetch(url);
    }
}
```

```
<button
  disabled={{if this.clickMe.isRunning "true"}}
  {{on "click" this.clickMe}}>
    Click
</button>
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
