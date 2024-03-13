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
// const old = [
//   h('p', { key : 'C'}, 'C'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'A'}, 'A')
// ]
// const next = [
//   h('p', { key : 'E'}, 'E'),
//   h('p', { key : 'D'}, 'D'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'A'}, 'A'),
// ]

// 3. 新的比老的长 => 创建一系列新节点
// 3.1 左侧
// const prevChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B')
// ]

// const nextChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'C'}, 'C'),
//   h('p', { key : 'D'}, 'D'),
// ]

// 3.2 右侧
// const prevChildren = [
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'A'}, 'A')
// ]

// const nextChildren = [
//   h('p', { key : 'D'}, 'D'),
//   h('p', { key : 'C'}, 'C'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'A'}, 'A'),
// ]

// 4. 老的比新的长 => 删除
// 4.1 左侧
// const prevChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'C'}, 'C'),
//   h('p', { key : 'D'}, 'D'),
// ]

// const nextChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B')
// ]

// 4.2 右侧
// const prevChildren = [
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'A'}, 'A'),
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'C'}, 'C')
// ]

// const nextChildren = [
//   h('p', { key : 'B'}, 'B'),
//   h('p', { key : 'C'}, 'C')
// ]

// 5. 乱序
// 5.1 => 删除老的
const prevChildren = [
  h('p', { key : 'A'}, 'A'),
  h('p', { key : 'B'}, 'B'),
  h('p', { key : 'C', id: 'c-prev'}, 'C'),
  h('p', { key : 'D'}, 'D'),
  h('p', { key : 'E'}, 'E'),
  h('p', { key : 'K'}, 'K'),
  h('p', { key : 'L'}, 'L'),
  h('p', { key : 'F'}, 'F'),
  h('p', { key : 'G'}, 'G'),
]

const nextChildren = [
  h('p', { key : 'A'}, 'A'),
  h('p', { key : 'B'}, 'B'),
  h('p', { key : 'E'}, 'E'),
  h('p', { key : 'C', id: 'c-new'}, 'C'),
  h('p', { key : 'F'}, 'F'),
  h('p', { key : 'G'}, 'G'),
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
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren) 
  }
}