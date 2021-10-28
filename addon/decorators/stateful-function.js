import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';

export function statefulFunction(target, _property, descriptor) {
  const actualFunc = descriptor.value;

  let rej;
  function _statefulFunc(...args) {
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
      rej = rejectFn;
      maybePromise
        .then((result) => resolveFn(result))
        .catch((e) => rejectFn(e));
    });

    return sp;
  }

  _statefulFunc.performCount = 0;

  descriptor.value = _statefulFunc;

  return descriptor;
}
