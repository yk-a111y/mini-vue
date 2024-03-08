import { h, ref } from '../../lib/guide-mini-vue.esm.js';

const nextChildren = 'nextChildren';
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')];

export default {
  name: 'TextToArray',
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange
    }
  },
  render() {
    const self = this;

    return self.isChange === true
      ? h('div', {}, prevChildren)
      : h('div', {}, nextChildren) 
  }
}