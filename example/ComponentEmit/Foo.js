import { h } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  name: 'Foo',
  render() {
    const btn = h('button', {
      onClick: this.emitAdd
    }, 'btn')
    const foo = h('p', {}, 'foo 内容')
    return h('div', {}, [foo, btn])
  },
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('emitAdd')
      // 向父组件传递事件名为add
      emit('add')
    }
    return {
      emitAdd
    }
  }
}