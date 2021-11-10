export class DestroyableCanceledPromise extends Error {
  constructor(msg) {
    super(msg);

    Object.setPrototypeOf(this, DestroyableCanceledPromise.prototype);
  }
}
