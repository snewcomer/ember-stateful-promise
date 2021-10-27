import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';

module('Unit | Utility | stateful-promise', function () {
  test('it works with promise', async function (assert) {
    const maybePromise = Promise.resolve(2);
    let result = new StatefulPromise((resolveFn, rejectFn) => {
      maybePromise.then((result) => resolveFn(result)).catch((e) => rejectFn(e));
    }, this);

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
    assert.notOk(result.isError);
  });

  test('it works with resolved promise as executor', async function (assert) {
    const resolvedPromise = Promise.resolve(2);
    let result = new StatefulPromise(resolvedPromise, this);

    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
    assert.notOk(result.isError);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
    assert.notOk(result.isError);
  });

  test('it works with promise as executor', async function (assert) {
    const promise = new Promise((resolve) => {
      resolve(2);
    });
    let result = new StatefulPromise(promise, this);

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
    assert.notOk(result.isError);
  });

  test('it errors', async function (assert) {
    assert.expect(6);
    const maybePromise = Promise.reject(2);
    let result = new StatefulPromise((resolve, reject) => {
      maybePromise.then((result) => resolve(result)).catch((e) => reject(e));
    }, this);

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    try {
      await result;
    } catch (e) {
      assert.false(result.isRunning, false);
      assert.false(result.isResolved, false);
      assert.true(result.isError, true);
    }
  });

  test('will reject if destroyed', async function (assert) {
    assert.expect(7);
    const maybePromise = Promise.resolve(2);
    const obj = {};
    let result = new StatefulPromise((resolve, reject) => {
      maybePromise.then((result) => resolve(result)).catch((e) => reject(e));
    }, obj);

    destroy(obj);

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    try {
      await result;
    } catch (e) {
      assert.equal(
        e.message,
        'The object this promise was attached to was destroyed'
      );
      assert.false(result.isRunning, false);
      assert.false(result.isResolved, false);
      assert.true(result.isError, true);
    }
  });
});
