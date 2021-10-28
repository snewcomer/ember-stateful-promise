import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';
import { tracked } from '@glimmer/tracking';

class Handler {
  // these track the properties in stateful-promise
  @tracked isCanceled = false;
  @tracked isResolved = false;
  @tracked isRunning = false;
  @tracked isError = false;

  @tracked performCount = 0;

  apply(target, _thisArg, argumentsList) {
    return target(...argumentsList);
  }

  get(_target, prop) {
    if (this[prop] !== undefined && this[prop] !== null) {
      return this[prop];
    }

    return Reflect.get(...arguments);
  }
}

export function statefulFunction(target, _property, descriptor) {
  const actualFunc = descriptor.value;
  const fn = actualFunc.bind(target);

  const handler = new Handler();
  let rej;
  const _statefulFunc = function (...args) {
    if (rej) {
      rej(
        new CanceledPromise(
          'This promise was canceled. Another promise was created while the other was outstanding.'
        )
      );
    }

    handler.performCount++;

    const maybePromise = fn.call(this, ...args);
    // wrapping the promise in a StatefulPromise
    const sp = new StatefulPromise().create(target, (resolveFn, rejectFn) => {
      // store away in case we need to cancel
      rej = rejectFn;
      maybePromise
        .then((result) => {
          resolveFn(result);
        })
        .catch((e) => {
          rejectFn(e);
        })
        .finally(() => {
          handler.isRunning = sp.isRunning;
          handler.isResolved = sp.isResolved;
          handler.isError = sp.isError;
          handler.isCanceled = sp.isCanceled;
        });
    });

    handler.isRunning = true;

    return sp;
  };

  descriptor.value = new Proxy(_statefulFunc, handler);

  return descriptor;
}
