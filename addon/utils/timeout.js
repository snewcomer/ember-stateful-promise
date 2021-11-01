import { StatefulPromise } from './stateful-promise';

export function timeout(destroyable, t) {
  if (typeof destroyable !== 'number') {
    return new StatefulPromise().create(destroyable, (resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  } else {
    return new StatefulPromise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }
}
