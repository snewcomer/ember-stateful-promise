import { StatefulPromise } from 'ember-stateful-promise/utils/stateful-promise';
import { module, test } from 'qunit';

module('Unit | Utility | stateful-promise', function () {
  test('it works', async function (assert) {
    const maybePromise = Promise.resolve(2);
    let result = new StatefulPromise((resolve, reject) => {
      maybePromise.then((result) => resolve(result)).catch((e) => reject(e));
    });

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
    assert.notOk(result.isError);
  });

  test('it errors', async function (assert) {
    const maybePromise = Promise.reject(2);
    let result = new StatefulPromise((resolve, reject) => {
      maybePromise.then((result) => resolve(result)).catch((e) => reject(e));
    });

    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    assert.notOk(result.isError);
    try {
      await result;
    } catch (e) {
      assert.expect(result.isRunning, false);
      assert.expect(result.isResolved, false);
      assert.expect(result.isError, true);
    }
  });
});
