import { tracked } from '@glimmer/tracking';
import { registerDestructor, isDestroying } from '@ember/destroyable';
import { CanceledPromise } from 'ember-stateful-promise/utils/canceled-promise';
import { DestroyableCanceledPromise } from 'ember-stateful-promise/utils/destroyable-canceled-promise';

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
    let ctx;
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
            if (ctx) {
              ctx._state = state;
            }
          },
          (err) => {
            reject(err);
            state = 'ERROR';
            if (ctx) {
              ctx._state = state;
            }
          }
        );
      } else {
        // store resolve/reject fns for later use in .create method
        resolveFn = resolve;
        rejectFn = reject;
      }
    });

    ctx = this;

    if (!fn) {
      this._resolve = resolveFn;
      this._reject = rejectFn;
    }

    // keep this b/c ctx may be undefined if no async when invoking body of StatefulPromise callback
    if (state) {
      this._state = state;
    }
  }

  create(destroyable, executor) {
    if (!destroyable) {
      throw new Error('destroyable is required as first argument');
    }

    registerDestructor(destroyable, () => {
      if (this._state === 'RUNNING') {
        this._state = 'CANCELED';
        this._reject(
          new DestroyableCanceledPromise(
            'The object this promise was attached to was destroyed'
          )
        );
      }
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
              new DestroyableCanceledPromise(
                'The object this promise was attached to was destroyed while the promise was still outstanding'
              )
            );
          } else {
            this._state = 'RESOLVED';
            this._resolve(result);
          }
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            this._state = 'CANCELED';
          } else if (e instanceof DestroyableCanceledPromise) {
            this._state = 'CANCELED';
          } else {
            this._state = 'ERROR';
          }
          this._reject(e);
        });
    } else {
      executor(
        // resolve fn
        (data) => {
          if (isDestroying(destroyable)) {
            this._state = 'CANCELED';
            this._reject(
              new DestroyableCanceledPromise(
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
          if (err instanceof CanceledPromise) {
            this._state = 'CANCELED';
          } else if (err instanceof DestroyableCanceledPromise) {
            this._state = 'CANCELED';
          } else {
            this._state = 'ERROR';
          }
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
