import { StatefulPromise } from './stateful-promise';

export function timeout(destroyable, t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
