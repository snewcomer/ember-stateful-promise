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
});
