export function createVNode(type, props?, children?) {
  const vNode = {
    type, // 字符串 或 组件对象
    props, // props对象
    children // 子组件 or 子元素
  };

  return vNode;
}