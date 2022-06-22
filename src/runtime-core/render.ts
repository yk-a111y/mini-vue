import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render (vnode, container) {
  // 1. patch(内部判断类型，component调用processComponent，element调用processElement)
  patch(vnode, container);
}

function patch (vnode, container) {
  // 1.1 处理组件 or 元素
  console.log(vnode.type);
    // shapeFlags判断vNode的类型
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  // 挂载虚拟节点
  mountElement(vnode, container);
}

function mountElement (vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  // a. children 为字符串，设为文本；为数组，
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  // b. 处理vnode的props，为标签设置属性
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    // 正则判断属性是否是注册事件
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }
  // 挂载
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.forEach(v => {
    patch(v, container);
  })
}

/* ****************** 处理组件 ********************* */
function processComponent(vnode: any, container: any) {
  // 1.2 挂载组件
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container: any) {
  // 1.2.1 根据虚拟节点创建组件实例
  const instance = createComponentInstance(initialVNode);
  // 1.2.2 对组件实例进行配置
  setupComponent(instance);

  // 1.2.3 
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container: any) {
  // 拿到render返回的虚拟节点树(即在APP中return出来的h函数)
  const { proxy } = instance
  const subTree = instance.render.call(proxy);
  // 基于subTree再次调用patch
  // 情况一: 是element类型，调用pathc的processElement()
  // 情况二: 是component类型，则继续调用processComponent()
  patch(subTree, container);

  // 当所有组件和元素都patch结束后，获取el(根组件)
  initialVNode.el = subTree.el;
}
