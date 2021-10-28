export class CanceledPromise extends Error {
  constructor(msg) {
    super(msg);

    Object.setPrototypeOf(this, CanceledPromise.prototype);
  }
}
