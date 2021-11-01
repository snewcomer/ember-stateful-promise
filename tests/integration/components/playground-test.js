import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | playground', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Playground />`);
    assert
      .dom('[data-test-playground-button]')
      .doesNotHaveAttribute('disabled');
    assert
      .dom('[data-test-playground-perform-count]')
      .hasText('Perform Count: 0');

    // await isn't right.  I would expect this to await until the StatefulPromise has finished
    // perhaps need to register with test infra
    await click('[data-test-playground-button]');

    assert.dom('[data-test-playground-button]').hasAttribute('disabled');
    assert
      .dom('[data-test-playground-perform-count]')
      .hasText('Perform Count: 1');

    await waitFor('[data-test-playground-button]:not([disabled])');

    assert
      .dom('[data-test-playground-button]')
      .doesNotHaveAttribute('disabled');
    assert
      .dom('[data-test-playground-perform-count]')
      .hasText('Perform Count: 1');
  });

  test('hammer it', async function (assert) {
    await render(hbs`<Playground />`);
    assert
      .dom('[data-test-playground-hammer-perform-count]')
      .hasText('Perform Count: 0');

    click('[data-test-playground-hammer-button]');
    click('[data-test-playground-hammer-button]');
    await click('[data-test-playground-hammer-button]');

    assert
      .dom('[data-test-playground-hammer-perform-count]')
      .hasText('Perform Count: 3');

    await waitFor('[data-test-playground-hammer-button]:not([disabled])');

    assert
      .dom('[data-test-playground-hammer-perform-count]')
      .hasText('Perform Count: 3');
  });

  test('not a promise', async function (assert) {
    await render(hbs`<Playground />`);
    assert
      .dom('[data-test-playground-not-a-promise-perform-count]')
      .hasText('Perform Count: 0');

    click('[data-test-playground-not-a-promise-button]');
    click('[data-test-playground-not-a-promise-button]');
    await click('[data-test-playground-not-a-promise-button]');

    assert
      .dom('[data-test-playground-not-a-promise-perform-count]')
      .hasText('Perform Count: 3');

    await waitFor(
      '[data-test-playground-not-a-promise-button]:not([disabled])'
    );

    assert
      .dom('[data-test-playground-not-a-promise-perform-count]')
      .hasText('Perform Count: 3');
  });
});
