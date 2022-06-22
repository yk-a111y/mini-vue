import { h } from '../../lib/guide-mini-vue.esm.js'

window.self
export const App = {
  // 1. render 编译模板成 template
  render () {
    window.self = this
    return h (
      'div', 
      {
        id: 'root',
        class: ['red', 'hard'],
        onClick() {
          console.log('click')
        }
      },
      [
        h('h1', { class: 'red' }, '标题'),
        h('p', { class: 'blue' }, '内容'),
        h('p',{ class: 'red' }, this.msg)
      ]
    );
  },
  // 2. setup (composition APIs)
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}