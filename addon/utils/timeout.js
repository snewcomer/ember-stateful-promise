import { StatefulPromise } from './stateful-promise';
import { later } from '@ember/runloop';

export function timeout(destroyable, t) {
  if (typeof destroyable !== 'number') {
    return new StatefulPromise().create(destroyable, (resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  } else {
    return new StatefulPromise((resolve) => {
      later(
        destroyable,
        () => {
          resolve();
        },
        t
      );
    });
  }
}
