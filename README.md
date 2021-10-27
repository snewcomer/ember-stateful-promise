ember-stateful-promise
==============================================================================

[ember-concurrency](http://ember-concurrency.com/docs/introduction/) is the go to solution in the Ember community for tracking async action state.  For simple scenarios, this addon seeks to expose a few flags on a promise object for you to use.  Moreover, they are tracked!

- `isRunning`
- `isResolved`
- `isError`

### Usage

```
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

const promise = fetch(url);
let result = new StatefulPromise((resolve, reject) => {
    promise.then((data) => resolve(data)).catch((e) => reject(e));
});

result.isRunning; // true
result.isResolved; // false
result.isError; // false

await result;

result.isRunning; // false
result.isResolved; // true
result.isError; // false
```

With destroyable
```
import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';

class MyComponent extends Component {
    @action
    clickMe() {
        const promise = fetch(url);
        let result = new StatefulPromise((resolve, reject) => {
            promise.then((data) => resolve(data)).catch((e) => reject(e));
        }, this);

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


Usage
------------------------------------------------------------------------------

[Longer description of how to use the addon in apps.]


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
