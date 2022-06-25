import { createVNode, Fragment } from "../vnode"

export function renderSlots (slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === 'function') {
      // 每次渲染slot都会包裹在一个div中
      // 给予特殊标志Fragment，让slot直接渲染children而不用包裹在div中
      return createVNode(Fragment, {}, slot(props))
    }
  }
}