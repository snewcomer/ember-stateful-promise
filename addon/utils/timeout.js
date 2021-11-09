import { StatefulPromise } from './stateful-promise';
import { later } from '@ember/runloop';

/**
 * Destroyable is an optional argument
 *
 * @function timeout
 * @param {Class} [destroyable]
 * @param {Number} t
 * @returns Promise
 */
export function timeout(...args) {
  if (args.length === 2) {
    const [destroyable, t] = args;
    return new StatefulPromise().create(destroyable, (resolve) => {
      later(
        destroyable,
        () => {
          resolve();
        },
        t
      );
    });
  } else {
    return new StatefulPromise((resolve) => {
      later(() => {
        resolve();
      }, args[0]);
    });
  }
}
