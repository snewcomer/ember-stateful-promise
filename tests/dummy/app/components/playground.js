import Component from '@glimmer/component';
import { statefulFunction, timeout } from 'ember-stateful-promise';

export default class PlaygroundComponent extends Component {
  @statefulFunction
  async clickMe() {
    await timeout(this, 1000);

    return 'done';
  }

  @statefulFunction
  async hammerMe() {
    await timeout(this, 1000);

    return 'done';
  }
}
