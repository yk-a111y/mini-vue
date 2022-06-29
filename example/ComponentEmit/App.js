import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h('p', {}, 'App内容'), h(Foo, {
      // on + event: 接收子组件使用emit发出的事件
      onAdd () {
        console.log('onAdd')
      }
    })])
  },
  setup() {
    return {}
  }
}