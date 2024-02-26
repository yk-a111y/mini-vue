import { h } from '../../lib/guide-mini-vue.esm.js' 

window.self = null;
export const App = {
  // 1. render 编译模板成 template
  render () {
    window.self = this;
    return h(
      'div', 
      {
        id: 'yk-test',
        onClick() {
          console.log('click');
        },
        onMouseDown() {
          console.log('onMouseDown');
        }
      }, 
      [
        h('div', {id: 'inner'},'hi, ' + this.msg), 
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