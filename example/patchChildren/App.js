import { h } from '../../lib/guide-mini-vue.esm.js';
import arrayToText from './arrayToText.js';

export const App = {
  setup() {

  },
  render() {
    return h('div', {id: 'root'}, [
      h('div', {}, '主页'),
      h(arrayToText)
    ])
  }
}