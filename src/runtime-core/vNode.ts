import { shapeFlags } from "../shared/shapeFlags";

export function createVNode(type, props?, children?) {
  const vNode = {
    type, // 字符串 或 组件对象
    props, // props对象
    children, // 子组件 or 子元素
    el: null,
    shapeFlag: getShapeFlag(type)
  };

  if (typeof children === 'string') {
    vNode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vNode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  return vNode;
}

function getShapeFlag(type) {
  return typeof type === 'string' ? shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT;
}