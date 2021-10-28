import Component from '@glimmer/component';
import { action } from '@ember/object';
import { statefulFunction } from 'ember-stateful-promise/decorators/stateful-function';
import { timeout } from 'ember-stateful-promise/utils/timeout';

export default class PlaygroundComponent extends Component {
  @action
  @statefulFunction
  async clickMe() {
    await timeout(this, 500);

    return 'done';
  }
}
