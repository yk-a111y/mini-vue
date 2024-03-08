import { h, ref } from '../../lib/guide-mini-vue.esm.js';

const nextChildren = 'newChildren';
const prevChildren = 'Children'

export default {
  name: 'TextToText',
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
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren) 
  }
}
