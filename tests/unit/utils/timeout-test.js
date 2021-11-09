import { timeout } from 'ember-stateful-promise/utils/timeout';
import { module, test } from 'qunit';

module('Unit | Utility | timeout', function () {
  test('it works', async function (assert) {
    let result = timeout(200);
    assert.true(result.isRunning);
    assert.false(result.isResolved);
    await result;
    assert.false(result.isRunning);
    assert.true(result.isResolved);
  });

  test('it works with this', async function (assert) {
    let result = timeout(this, 200);
    assert.true(result.isRunning);
    assert.false(result.isResolved);
    await result;
    assert.false(result.isRunning);
    assert.true(result.isResolved);
  });
});
