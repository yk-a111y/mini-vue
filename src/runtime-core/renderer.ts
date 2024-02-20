import { createComponentInstance, setupComponent } from "./component";

export function render(vNode, container) {
  // 递归处理 vnode 和其对应容器
  patch(vNode, container);
}

function patch(vNode, container) {
  // 组件处理
  processComponent(vNode, container);

  // TODO processElement
}

function processComponent(vNode, container) {
  mountComponent(vNode, container);
}

function mountComponent(vNode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(vNode);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render;

  patch(subTree, container);
}