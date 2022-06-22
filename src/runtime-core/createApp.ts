import { render } from "./render";
import { createVNode } from "./vnode";

// 1. createApp 返回一个App对象，这个对象调用mount()方法挂载
export function createApp (rootComponent) {
  return {
    // 1.1 createApp内部返回一个包含mount函数的对象，接收container使App挂载其上
    mount(rootContainer) {
      // 1.2 component -> vNode， 后续的操作全部基于组件转换的vNode
      const vnode = createVNode(rootComponent);
      // 1.3 基于vnode和rootContainer在内部调用patch方法，将vnode渲染为真实的DOM
      render(vnode, rootContainer);
    }
  }
}