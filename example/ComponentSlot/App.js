import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render () {
    const app = h('div', {}, "App")
    const foo = h(Foo, {}, {
      // 具名插槽: 由于要传值，故将children改为函数组成的数组
      header: ({ age }) => [h('h1', {}, 'header' + age), createTextVNode('你好呀')], 
      footer: () => h('p', {}, 'footer')
    })
    return h('div', {}, [app, foo])
  },
  setup() {
    return {}
  }
}