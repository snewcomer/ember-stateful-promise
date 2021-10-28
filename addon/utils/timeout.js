import { StatefulPromise } from './stateful-promise';

export function timeout(destroyable, t) {
  return new StatefulPromise().create(destroyable, (resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
