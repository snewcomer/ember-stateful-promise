import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';

module('Unit | Utility | stateful-promise', function () {
  test('it works with promise executor', async function (assert) {
    const maybePromise = Promise.resolve(2);
    const obj = {};
    let result = new StatefulPromise().create(obj, (resolveFn, rejectFn) => {
      maybePromise
        .then((result) => resolveFn(result))
        .catch((e) => rejectFn(e));
    });

    assert.true(result.isRunning);
    assert.false(result.isResolved);
    assert.false(result.isError);
    await result;
    assert.false(result.isRunning);
    assert.true(result.isResolved);
    assert.false(result.isError);
  });

  test('it works with resolved promise', async function (assert) {
    const resolvedPromise = Promise.resolve(2);
    const obj = {};
    let result = new StatefulPromise().create(obj, resolvedPromise);

    assert.true(result.isRunning);
    assert.false(result.isResolved);
    assert.false(result.isError);
    await result;
    assert.false(result.isRunning);
    assert.true(result.isResolved);
    assert.false(result.isError);
  });

  test('it works with primitive', async function (assert) {
    const obj = {};
    let result = new StatefulPromise().create(obj, 2);

    assert.true(result.isRunning);
    assert.false(result.isResolved);
    assert.false(result.isError);
    assert.false(result.isCancelled);
    await result;
    assert.false(result.isRunning);
    assert.true(result.isResolved);
    assert.false(result.isError);
    assert.false(result.isCancelled);
  });

  test('it works with promise', async function (assert) {
    const promise = new Promise((resolve) => {
      resolve(2);
    });
    let instance = new StatefulPromise();
    const obj = {};
    instance.create(obj, promise);

    assert.true(instance.isRunning);
    assert.false(instance.isResolved);
    assert.false(instance.isError);

    await instance;
    assert.false(instance.isRunning);
    assert.true(instance.isResolved);
    assert.false(instance.isError);
  });

  test('it errors', async function (assert) {
    assert.expect(6);
    const maybePromise = Promise.reject(2);
    const obj = {};
    let result = new StatefulPromise().create(obj, (resolveFn, rejectFn) => {
      maybePromise
        .then((result) => resolveFn(result))
        .catch((e) => rejectFn(e));
    });

    assert.true(result.isRunning);
    assert.false(result.isResolved);
    assert.false(result.isError);
    try {
      await result;
    } catch (e) {
      assert.false(result.isRunning, false);
      assert.false(result.isResolved, false);
      assert.true(result.isError, true);
    }
  });

  test('will reject if destroyable destroyed', async function (assert) {
    assert.expect(9);
    const maybePromise = Promise.resolve(2);
    const obj = {};
    let result = new StatefulPromise().create(obj, (resolveFn, rejectFn) => {
      maybePromise
        .then((result) => resolveFn(result))
        .catch((e) => rejectFn(e));
    });

    destroy(obj);

    assert.true(result.isRunning);
    assert.false(result.isResolved);
    assert.false(result.isError);
    assert.false(result.isCancelled);
    try {
      await result;
    } catch (e) {
      assert.equal(
        e.message,
        'The object this promise was attached to was destroyed'
      );
      assert.false(result.isRunning);
      assert.false(result.isResolved);
      assert.false(result.isError);
      assert.true(result.isCancelled);
    }
  });

  test('will reject if reject called', async function (assert) {
    assert.expect(9);
    const obj = {};
    let result = new StatefulPromise().create(obj, (_resolveFn, rejectFn) => {
      rejectFn(new Error('error'));
    });

    assert.false(result.isRunning);
    assert.false(result.isResolved);
    assert.true(result.isError);
    assert.false(result.isCancelled);
    try {
      await result;
    } catch (e) {
      assert.equal(e.message, 'error');
      assert.false(result.isRunning);
      assert.false(result.isResolved);
      assert.true(result.isError);
      assert.false(result.isCancelled);
    }
  });

  test('it works with Promise API success', async function (assert) {
    assert.expect(5);
    let instance = new StatefulPromise((resolveFn) => {
      resolveFn(2);
    });
    const done = assert.async();
    instance.then((data) => {
      assert.equal(data, 2);
      assert.false(instance.isRunning);
      assert.true(instance.isResolved);
      assert.false(instance.isError);
      assert.false(instance.isCancelled);

      done();
    });
  });

  test('it works with Promise API error', async function (assert) {
    assert.expect(5);
    let instance = new StatefulPromise((_resolveFn, rejectFn) => {
      rejectFn(new Error('error'));
    });
    const done = assert.async();
    instance.catch((e) => {
      assert.equal(e.message, 'error');
      assert.false(instance.isRunning);
      assert.false(instance.isResolved);
      assert.true(instance.isError);
      assert.false(instance.isCancelled);

      done();
    });
  });
});
