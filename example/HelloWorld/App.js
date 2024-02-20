import { h } from '../../lib/guide-mini-vue.esm.js' 

export const App = {
  // 1. render 编译模板成 template
  render () {
    return h(
      'div', 
      {id: 'yk-test'}, 
      [
        h('div', {id: 'inner'},'hi, mini-vue'), 
        h('p', { class: 'red'}, '红色文字')
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