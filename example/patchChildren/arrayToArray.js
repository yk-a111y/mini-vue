import { h, ref } from '../../lib/guide-mini-vue.esm.js';

// 1. 左侧对比
// const prevChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'C'}, 'C')
// ]
// const nextChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'D'}, 'D'),
//   h('p', { key : 'E'}, 'E'),
// ]

// 2. 右侧对比
const old = [
  h('p', { key : 'C'}, 'C'),
  h('p', { key : 'B'}, 'B'),
  h('p', { key : 'A'}, 'A')
]
const next = [
  h('p', { key : 'E'}, 'E'),
  h('p', { key : 'D'}, 'D'),
  h('p', { key : 'B'}, 'B'),
  h('p', { key : 'A'}, 'A'),
]

export default {
  name: 'ArrayToArray',
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
      ? h('div', {}, next)
      : h('div', {}, old) 
  }
}