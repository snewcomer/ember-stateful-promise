import { statefulFunction } from 'ember-stateful-promise/decorators/stateful-function';
import { module, test } from 'qunit';
import { timeout } from 'ember-stateful-promise/utils/timeout';

module('Unit | decorators | stateful-function', function () {
  test('it works', async function (assert) {
    class Person {
      @statefulFunction
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
      @statefulFunction
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
    assert.false(promise.isError);
    assert.true(promise.isCanceled);

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

  test('can throttle', async function (assert) {
    assert.expect(8);
    class Person {
      @statefulFunction({ throttle: true })
      async clickMe() {
        await timeout(200);
      }
    }

    const person = new Person();
    const promise = person.clickMe();
    assert.true(promise.isRunning);
    assert.false(promise.isError);
    assert.equal(person.clickMe.performCount, 1);

    const promise2 = person.clickMe();

    assert.equal(person.clickMe.performCount, 1);
    // first promise was canceled
    assert.true(promise.isRunning);
    assert.false(promise.isError);
    assert.false(promise.isCanceled); // TODO think about overloading fn executor with a canceled callback

    assert.notOk(promise2);

    try {
      await promise;
    } catch (e) {
      assert.false(
        true,
        'This promise was canceled. Another promise was created while the other was outstanding.'
      );
    }
  });

  test('can cancel', async function (assert) {
    assert.expect(10);

    class Person {
      @statefulFunction
      async clickMe() {
        await timeout(this, 200);
      }
    }

    const person = new Person();
    const promise = person.clickMe();
    person.clickMe.cancel();
    assert.true(promise.isRunning);
    assert.false(promise.isCanceled);
    assert.equal(person.clickMe.performCount, 1);
    try {
      await promise;
    } catch (e) {
      assert.equal(
        e.message,
        'This promise was canceled.  Either the object this promise was attached to was destroyed or you called fn.cancel().'
      );
      assert.false(promise.isRunning);
      assert.true(promise.isCanceled);
      assert.false(promise.isError);
      assert.equal(person.clickMe.performCount, 1);
      assert.false(person.clickMe.isRunning);
      assert.false(person.clickMe.isCanceled);
    }
  });
});
