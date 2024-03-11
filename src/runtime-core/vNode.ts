import { shapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vNode = {
    type, // 字符串 或 组件对象
    props, // props对象
    children, // 子组件 or 子元素
    key: props?.key, // diff所使用的key
    el: null,
    shapeFlag: getShapeFlag(type)
  };

  if (typeof children === 'string') {
    vNode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vNode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  if (vNode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vNode.shapeFlag |= shapeFlags.SLOT_CHIDREN;
    }
  }

  return vNode;
}

export function createTextVNode(text) {
  return createVNode(Text, {}, text);
}

function getShapeFlag(type) {
  return typeof type === 'string' ? shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT;
}