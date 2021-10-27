import { timeout } from 'ember-stateful-promise/utils/timeout';
import { module, test } from 'qunit';

module('Unit | Utility | timeout', function () {
  // TODO: Replace this with your real tests.
  test('it works', async function (assert) {
    let result = timeout();
    assert.ok(result.isRunning);
    assert.notOk(result.isResolved);
    await result;
    assert.notOk(result.isRunning);
    assert.ok(result.isResolved);
  });
});
