import { tracked } from '@glimmer/tracking';

export class StatefulPromise extends Promise {
  /**
  @type {'RUNNING' | 'RESOLVED' | 'ERROR'}
  @private
  */
  @tracked _state = 'RUNNING';

  constructor(executor) {
    super((resolve, reject) => executor(
      (data) => {
        resolve(data);
        this._state = 'RESOLVED';
      },
      (err) => {
        reject(err);
        this._state = 'ERROR';
      },
    ));
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