import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {
    // props
    // console.log(props);

    // props为shallowReadonly数据
    // props.count++;
    // console.log(props);

    // emit
    const emitAdd = () => {
      console.log('emitAdd')
      // 点击foo的btn时，触发向父组件传递事件add的操作
      emit('add', 1, 2)
      emit('add-foo', 1, 2)
    }
    return {
      emitAdd
    }
  },
  render() {
    // const btn = h('button', {
    //   onClick: this.emitAdd
    // }, "emitAdd")
    // console.log(this.$slots);
    const foo = h('p', {}, "foo")

    const age = 18;

    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        age
      }),
      foo,
      renderSlots(this.$slots, 'footer')]);
  }
}