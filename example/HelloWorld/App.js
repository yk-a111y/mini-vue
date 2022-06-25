import { h } from '../../lib/guide-mini-vue.esm.js'
import { foo } from './Foo.js' 

window.self
export const App = {
  // 1. render 编译模板成 template
  render () {
    window.self = this
    return h (
      'div', 
      {
        id: 'root',
        class: ['red'],
        onClick() {
          console.log('click')
        }
      },
      "内容"
      // [
      //   h('h1', { class: 'red' }, '标题'),
      //   h('p', { class: 'blue' }, '内容'),
      //   h('p',{ class: 'red' }, this.msg),
      //   h(foo, {
      //     // foo组件接收emit发送过来的函数
      //     // on + event
      //     onAdd(a, b) {
      //       console.log('onAdd', a + b)
      //     },
      //     onAddFoo(a, b) {
      //       console.log('onAddFoo', a + b)
      //     }
      //   }, { count: 1 })
      // ]
    );
  },
  // 2. setup (composition APIs)
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}