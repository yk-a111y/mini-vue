import { h, ref } from '../../lib/guide-mini-vue.esm.js';

export const App = {
  name: 'APP',

  setup() {
    const count = ref(0);

    const onClick = () => {
      count.value++;
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const changePropDemo1 = () => {
      props.value.foo = 'new Foo'
    }
    const changePropDemo2 = () => {
      props.value.foo = undefined
    }
    const changePropDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }

    return {
      count,
      onClick,
      changePropDemo1,
      changePropDemo2,
      changePropDemo3,
      props
    }
  },

  render() {
    return h('div', { id: 'root ', ...this.props}, [
      h('div', {}, 'count: ' + this.count),
      h('button', {
        onClick: () => {
          this.onClick()
        }
      }, 'click'),
      h('button', {
        onClick: () => {
          this.changePropDemo1()
        }
      }, 'new foo'),
      h('button', {
        onClick: () => {
          this.changePropDemo2()
        }
      }, 'undefined foo'),
      h('button', {
        onClick: () => {
          this.changePropDemo3()
        }
      }, 'delete bar')
    ])
  }
}