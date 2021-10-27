import { tracked } from '@glimmer/tracking';
import { registerDestructor, isDestroying } from '@ember/destroyable';

export class StatefulPromise extends Promise {
  /**
  @type {'RUNNING' | 'RESOLVED' | 'ERROR'}
  @private
  */
  @tracked _state = 'RUNNING';

  destroyable = null;

  constructor(executor, destroyable) {
    let state;

    super((resolve, reject) => {
      // this === inside promise
      if (destroyable) {
        registerDestructor(destroyable, () => {
          this._state = 'ERROR';
          reject(
            new Error('The object this promise was attached to was destroyed')
          );
        });
      }

      if (typeof executor !== 'function') {
        // executor is not async
        if (executor.then) {
          executor
            .then((result) => {
              state = 'RESOLVED';
              resolve(result);
            })
            .catch((e) => {
              state = 'ERROR';
              reject(e);
            });
        }
      } else {
        executor(
          // resolve fn
          (data) => {
            if (destroyable && isDestroying(destroyable)) {
              this._state = 'ERROR';
              reject(
                new Error(
                  'The object this promise was attached to was destroyed'
                )
              );
            } else {
              // this === instance
              resolve(data);
              this._state = 'RESOLVED';
            }
          },
          // reject fn
          (err) => {
            reject(err);
            this._state = 'ERROR';
          }
        );
      }
    });

    // do afterwards b/c we have proper "this"
    if (state) {
      this._state = state;
    }
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
}
