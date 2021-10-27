import { StatefulPromise } from './stateful-promise';

export function timeout(t, destroyable) {
  return new StatefulPromise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  }, destroyable);
}
