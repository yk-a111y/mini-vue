import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null;
export const App = {
  // 1. render 编译模板成 template
  render () {
    window.self = this;
    return h(
      'div', 
      {
        id: 'yk-test',
        // onClick() {
        //   console.log('click');
        // },
        // onMouseDown() {
        //   console.log('onMouseDown');
        // }
      }, 
      [
        h('div', {id: 'inner'},'hi, ' + this.msg), 
        h('p', { class: 'red'}, '红色文字'),
        h(Foo, {}, {
          // 具名插槽
          header: ({ age }) => [
            h('p', {}, 'render header' + age),
            createTextVNode('文本节点')
          ],
          footer: () => h('p', {}, 'render footer')
        }),
        // h(Foo, { count: 1, onAdd(a, b) {
        //   console.log('Execute onAdd');
        //   console.log(a + b);
        // }, onAddFoo() {
        //   console.log('Execute add-foo');
        // } }, [])
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