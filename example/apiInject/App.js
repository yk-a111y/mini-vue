import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'foo-value')
    provide('bar', 'bar-value')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Procider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'foo2-value')
    const foo = inject('foo')
    // 带默认值的inject
    const baz = inject('baz', () => 'bazDefault')
    return {
      foo, baz
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo: ${this.foo}--${this.baz}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    return {
      foo, bar
    }
  },
  render() {
    return h('div', {}, `Consumer: ${this.foo}--${this.bar}`)
  }
}

// 导出App组件
export default {
  name: 'App',
  setup() {
  },
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)])
  }
}