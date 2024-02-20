import { h } from '../../lib/guide-mini-vue.esm.js'
import { foo } from './Foo.js' 

export const App = {
  // 1. render 编译模板成 template
  render () {
    return h('div', 'hi, ' + this.msg);
  },
  // 2. setup (composition APIs)
  setup () {
    return {
      msg: 'mini-vue'
    }
  }
}