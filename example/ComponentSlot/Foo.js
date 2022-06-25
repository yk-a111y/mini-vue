import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  render () {
    const foo = h('div', {}, 'foo')
    const age = 18
    // renderSlots => 根据传入的slots创建虚拟节点, createVNode(slots)
    // step2: 具名插槽
    // step3: 作用域插槽
    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        age
      }),
      foo,
      renderSlots(this.$slots, 'footer')
    ])
  },
  setup() {
    return {}
  }
}