import { statefulAction } from 'ember-stateful-promise/decorators/stateful-action';
import { module, skip } from 'qunit';
import { timeout } from 'ember-stateful-promise/utils/timeout';

module('Unit | decorators | stateful-action', function () {
  skip('it works', async function (assert) {
    class Person {
      @statefulAction
      async clickMe() {
        await timeout(200);
      }
    }

    const person = new Person();
    const promise = person.clickMe();
    assert.ok(promise.isRunning);
    await promise;
    assert.notOk(promise.isRunning);
  });
});
