import Component from '@glimmer/component';
import { statefulFunction, timeout } from 'ember-stateful-promise';

export default class PlaygroundComponent extends Component {
  @statefulFunction
  notAPromise() {
    return 'done';
  }

  @statefulFunction
  async clickMe() {
    await timeout(this, 1000);

    return 'done';
  }

  @statefulFunction
  async cancelMe() {
    this.clickMe();
    this.clickMe.cancel();

    return 'canceled';
  }

  @statefulFunction
  async hammerMe() {
    await timeout(this, 1000);
    await this.clickMe();

    return 'done';
  }
}
