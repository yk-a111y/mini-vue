import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  // 1. render 编译模板成 template
  render () {
    return h (
      'rect', 
      {
        x: this.x,
        y: this.y,
        onClick() {
          console.log('click')
        }
      },
      "内容"
    );
  },
  // 2. setup (composition APIs)
  setup () {
    return {
      x: 100,
      y: 100
    }
  }
}