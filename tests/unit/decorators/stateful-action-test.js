import { statefulAction } from 'ember-stateful-promise/decorators/stateful-action';
import { module, test } from 'qunit';
import { timeout } from 'ember-stateful-promise/utils/timeout';

module('Unit | decorators | stateful-action', function () {
  test('it works', async function (assert) {
    class Person {
      @statefulAction
      async clickMe() {
        await timeout(this, 200);
      }
    }

    const person = new Person();
    const promise = person.clickMe();
    assert.true(promise.isRunning);
    assert.equal(person.clickMe.performCount, 1);
    await promise;
    assert.false(promise.isRunning);
    assert.equal(person.clickMe.performCount, 1);
  });

  test('debounces by default', async function (assert) {
    assert.expect(10);
    class Person {
      @statefulAction
      async clickMe() {
        await timeout(this, 200);
      }
    }

    const person = new Person();
    const promise = person.clickMe();
    assert.true(promise.isRunning);
    assert.false(promise.isError);
    assert.equal(person.clickMe.performCount, 1);

    const promise2 = person.clickMe();

    assert.equal(person.clickMe.performCount, 2);
    // first promise was canceled
    assert.false(promise.isRunning);
    assert.true(promise.isError);
    assert.false(promise.isCanceled); // TODO think about overloading fn executor with a canceled callback

    assert.true(promise2.isRunning);

    try {
      await promise;
    } catch (e) {
      assert.equal(
        e.message,
        'This promise was canceled. Another promise was created while the other was outstanding.'
      );
    }

    await promise2;
    assert.false(promise2.isRunning);
  });
});
