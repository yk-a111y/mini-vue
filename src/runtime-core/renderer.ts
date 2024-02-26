import { isObject } from "../shared";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vNode, container) {
  // 递归处理 vnode 和其对应容器
  patch(vNode, container);
}

function patch(vNode, container) {
  if (vNode.shapeFlag & shapeFlags.ELEMENT) {
    // 处理元素
    processElement(vNode, container);
  } else if (vNode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vNode, container);
  }
}

function processElement(vNode, container) {
  mountElement(vNode, container);
}

function processComponent(vNode, container) {
  mountComponent(vNode, container);
}

function mountElement(vNode, container) {
  // 同时在vNode上保存el，用于this.$el访问
  const el = vNode.el = document.createElement(vNode.type);

  // 配置props
  const { props } = vNode;
  for (const key in props) {
    const val = props[key];

    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }

  // 配置children(可能是文本，也可能是数组内嵌套多个vNode)
  const { children } = vNode;
  if(vNode.shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (vNode.shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vNode, el);
  }

  // el加入容器中
  container.append(el);
}

function mountChildren(vNode, container) {
  vNode.children.forEach( v => {
    patch(v, container);
  });
}

function mountComponent(vNode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(vNode);

  setupComponent(instance);
  setupRenderEffect(instance, vNode, container);
}

function setupRenderEffect(instance: any, vNode, container) {
  const { proxy } = instance;
  // this指向通过setupStatefulComponent生成的proxy对象
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  // patch自顶向下处理完成后，获得el
  vNode.el = subTree.el;
}