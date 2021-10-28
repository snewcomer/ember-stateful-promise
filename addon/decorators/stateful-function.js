import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';

export function statefulFunction(target, _property, descriptor) {
  const actualFunc = descriptor.value;

  let rej;
  const _statefulFunc = function(...args) {
    if (rej) {
      rej(
        new CanceledPromise(
          'This promise was canceled. Another promise was created while the other was outstanding.'
        )
      );
    }

    _statefulFunc.performCount++;

    const maybePromise = actualFunc.call(this, ...args);
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
      }
    });

    return sp;
  }

  _statefulFunc.performCount = 0;

  descriptor.value = _statefulFunc;

  return descriptor;
}
