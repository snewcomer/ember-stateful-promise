import Component from '@glimmer/component';
import { statefulFunction } from 'ember-stateful-promise/decorators/stateful-function';
import { timeout } from 'ember-stateful-promise/utils/timeout';

export default class PlaygroundComponent extends Component {
  @statefulFunction
  async clickMe() {
    await timeout(this, 1000);

    return 'done';
  }
}
