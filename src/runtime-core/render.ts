import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render (vnode, container) {
    // 1. patch(内部判断类型，component调用processComponent，element调用processElement)
    patch(vnode, container, null);
  }

  function patch (vnode, container, parentComponent) {
    // 1.1 处理组件 or 元素
    console.log(vnode.type);
      // shapeFlags判断vNode的类型
    const { shapeFlag, type } = vnode

    // Fragment => 只渲染children，解决slot渲染总是包裹在div里的问题
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break;
      case Text:
        processText(vnode, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        }
    }
  }

  /* ****************** 处理Text ********************* */
  function processText(vnode, container) {
    // 文本节点中，children为传入的字符串
    const { children } = vnode
    // 文本赋值给el属性
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  /* ****************** 处理Fragment ********************* */
  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }


  /* ****************** 处理Element ********************* */
  function processElement(vnode: any, container: any, parentComponent) {
    // 挂载虚拟节点
    mountElement(vnode, container, parentComponent);
  }

  function mountElement (vnode, container, parentComponent) {
    // 1. vnode.el保存当前的DOM元素，用于$el的获取
    // 2. 不再依赖于单一工具的API，而是使用createElement，实现自定义render
    const el = (vnode.el = hostCreateElement(vnode.type));
    const { children, shapeFlag } = vnode;
    // a. children 为字符串，设为文本；为数组，
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }
    // b. 处理vnode的props，为标签设置属性
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      // 正则判断属性是否是注册事件
      // const isOn = (key: string) => /^on[A-Z]/.test(key)
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, val);
      // } else {
      //   el.setAttribute(key, val);
      // }
      hostPatchProp(el, key, val);
    }
    // 挂载
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(element => {
      patch(element, container, parentComponent);
    });
  }


  /* ****************** 处理组件 ********************* */
  function processComponent(vnode: any, container: any, parentComponent) {
    // 1.2 挂载组件
    mountComponent(vnode, container, parentComponent);
  }

  function mountComponent(initialVNode: any, container: any, parentComponent) {
    // 1.2.1 根据虚拟节点创建组件实例
    // instance: { vnode, type: vnode.type(rootComponent), setupState }
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 1.2.2 对组件实例进行配置
    setupComponent(instance);

    // 1.2.3 
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container: any) {
    // 拿到render返回的虚拟节点树(即在App中return出来的h函数)
    const { proxy } = instance
    // render的this指向创建好的代理对象，这样在render执行时，可以访问到setup中的数据
    // subTree 为 组件render部分调用h函数返回的VNode
    const subTree = instance.render.call(proxy);
    // 基于subTree再次调用patch
    // 情况一: 是element类型，调用pathc的processElement()
    // 情况二: 是component类型，则继续调用processComponent()
    patch(subTree, container, instance)
    // 当所有组件和元素都patch结束后，获取el(根组件)
    initialVNode.el = subTree.el;
  }

  return {
    createApp: createAppApi(render)
  }
}
