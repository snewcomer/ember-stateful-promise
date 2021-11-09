import { timeout } from 'ember-stateful-promise/utils/timeout';
import { module, test } from 'qunit';

module('Unit | Utility | timeout', function () {
  test('it works', async function (assert) {
    let result = timeout(200);
    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
  });
});
