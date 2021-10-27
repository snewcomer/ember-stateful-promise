import { StatefulPromise } from './stateful-promise';

export function timeout(t) {
  return new StatefulPromise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
