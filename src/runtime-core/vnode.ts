import { ShapeFlags } from "../shared/ShapeFlags"

// 插槽类型声明
export const Fragment = Symbol('Fragment')
// 文本节点类型声明
export const Text = Symbol('Text')

// 1. 根据传入的type等参数创建虚拟节点vnode
export function createVNode (type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlags(type),
    el: null
  };

  // 判断children
  if (typeof children === 'string') {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }

  // 是组件类型且children为Object => 满足插槽的特征
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  
  return vnode;
}

function getShapeFlags (type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode (text: string) {
  return createVNode(Text, {}, text);
}