import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';
import { tracked } from '@glimmer/tracking';

export function statefulFunction(target, _property, descriptor) {
  const actualFunc = descriptor.value;

  const fn = actualFunc.bind(target);
  let rej;
  const _statefulFunc = function (...args) {
    if (rej) {
      rej(
        new CanceledPromise(
          'This promise was canceled. Another promise was created while the other was outstanding.'
        )
      );
    }

    _statefulFunc.performCount++;

    const maybePromise = fn.call(this, ...args);
    // wrapping the promise in a StatefulPromise
    const sp = new StatefulPromise().create(target, (resolveFn, rejectFn) => {
      // store away in case we need to cancel
      rej = rejectFn;
      maybePromise
        .then((result) => resolveFn(result))
        .catch((e) => rejectFn(e));
    });

    Object.defineProperty(_statefulFunc, 'isRunning', {
      get() {
        return sp.isRunning;
      },
      configurable: true,
    });

    return sp;
  };

  Object.defineProperty(_statefulFunc, 'performCount', {
    get() {
      if (this._performCount) return this._performCount;

      return 0;
    },
    set(value) {
      this._performCount = value;
    },
  });

  descriptor.value = _statefulFunc;

  return descriptor;
}
