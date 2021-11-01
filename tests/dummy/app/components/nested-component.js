import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class NestedComponent extends Component {
  @action
  hammerMe() {
    this.args.hammerMe();
  }
}
