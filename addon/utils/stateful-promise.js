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
    super((resolve, reject) => {
      if (destroyable) {
        registerDestructor(destroyable, () => {
          this._state = 'ERROR';
          reject(
            new Error('The object this promise was attached to was destroyed')
          );
        });
      }

      executor(
        // resolve fn
        (data) => {
          if (destroyable && isDestroying(destroyable)) {
            this._state = 'ERROR';
            reject(
              new Error('The object this promise was attached to was destroyed')
            );
          } else {
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
    });
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
