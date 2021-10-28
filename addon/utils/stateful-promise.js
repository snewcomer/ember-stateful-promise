import { tracked } from '@glimmer/tracking';
import { registerDestructor, isDestroying } from '@ember/destroyable';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';

export class StatefulPromise extends Promise {
  /**
  @type {'RUNNING' | 'RESOLVED' | 'ERROR' | 'CANCELED'}
  @private
  */
  @tracked _state = 'RUNNING';

  destroyable = null;

  _resolve = null;
  _reject = null;

  constructor(fn) {
    let resolveFn;
    let rejectFn;

    let state;
    super((resolve, reject) => {
      // fn when .then or .catch is executed
      // or if an executor is provided directly from the function invocation
      if (fn) {
        // preserve native Promise behaviour
        // Interface when .then or .catch is called
        fn(
          (data) => {
            resolve(data);
            state = 'RESOLVED';
          },
          (err) => {
            reject(err);
            state = 'ERROR';
          }
        );
      } else {
        // store resolve/reject fns for later use in .create method
        resolveFn = resolve;
        rejectFn = reject;
      }
    });

    if (!fn) {
      this._resolve = resolveFn;
      this._reject = rejectFn;
    }

    if (state) {
      this._state = state;
    }
  }

  create(destroyable, executor) {
    if (!destroyable) {
      throw new Error('destroyable is required as first argument');
    }

    registerDestructor(destroyable, () => {
      this._state = 'CANCELED';
      this._reject(
        new CanceledPromise(
          'The object this promise was attached to was destroyed'
        )
      );
    });

    // Three options for executor
    // 1. a promise instance
    // 2. a callback with resolve and reject arguments
    // 3. a primitive or non function or Promise
    if (typeof executor !== 'function') {
      if (!executor.then) {
        executor = Promise.resolve(executor);
      }

      executor
        .then((result) => {
          if (isDestroying(destroyable)) {
            this._state = 'CANCELED';
            this._reject(
              new CanceledPromise(
                'The object this promise was attached to was destroyed'
              )
            );
          } else {
            this._state = 'RESOLVED';
            this._resolve(result);
          }
        })
        .catch((e) => {
          this._state = 'ERROR';
          this._reject(e);
        });
    } else {
      executor(
        // resolve fn
        (data) => {
          if (isDestroying(destroyable)) {
            this._state = 'CANCELED';
            this._reject(
              new CanceledPromise(
                'The object this promise was attached to was destroyed'
              )
            );
          } else {
            this._state = 'RESOLVED';
            this._resolve(data);
          }
        },
        // reject fn
        (err) => {
          this._state = 'ERROR';
          this._reject(err);
        }
      );
    }

    return this;
  }

  get isRunning() {
    return this._state === 'RUNNING';
  }

  get isResolved() {
    return this._state === 'RESOLVED';
  }

  get isError() {
    return this._state === 'ERROR';
  }

  get isCanceled() {
    return this._state === 'CANCELED';
  }
}
