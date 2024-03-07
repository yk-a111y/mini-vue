import { effect } from "../reactivity/effect";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vNode";


export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert
  } = options;

  function render(vNode, container) {
    // 递归处理 vnode 和其对应容器
    patch(null, vNode, container, {});
  }

  // n1 -> oldSubTree; n2 -> newSubTree
  function patch(n1, n2, container, parent) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent);
        break;
      case Text:
        processTextNode(n1, n2, container);
        break;
      default:
        if (shapeFlag & shapeFlags.ELEMENT) {
          // 处理元素
          processElement(n1, n2, container, parent);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parent);
        }
        break;
    }
  }
  
  function processFragment(n1, n2, container, parent) {
    mountChildren(n2, container, parent);
  }
  
  function processTextNode(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  
  function processElement(n1, n2, container, parent) {
    if (!n1) {
      mountElement(n2, container, parent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log('n1: ', n1);
    console.log('n2: ', n2);
  }
  
  function processComponent(n1, n2, container, parent) {
    mountComponent(n2, container, parent);
  }
  
  function mountElement(vNode, container, parent) {
    // 同时在vNode上保存el，用于this.$el访问
    const el = vNode.el = hostCreateElement(vNode.type);
  
    // 配置props
    const { props } = vNode;
    for (const key in props) {
      const val = props[key];
      hostPatchProps(el, key, val);
    }
  
    // 配置children(可能是文本，也可能是数组内嵌套多个vNode)
    const { children } = vNode;
    if(vNode.shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vNode.shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vNode, el, parent);
    }
  
    // el加入容器中
    hostInsert(el, container);
  }
  
  function mountChildren(vNode, container, parent) {
    vNode.children.forEach( v => {
      patch(null, v, container, parent);
    });
  }
  
  function mountComponent(vNode: any, container, parent) {
    // 创建组件实例
    const instance = createComponentInstance(vNode, parent);
  
    setupComponent(instance);
    setupRenderEffect(instance, vNode, container);
  }
  
  function setupRenderEffect(instance: any, vNode, container) {
    // effect包裹，实现副作用收集
    effect(() => {
      if (!instance.isMounted) {
        // 初始化逻辑
        console.log('init-----------');
        const { proxy } = instance;
        // this指向通过setupStatefulComponent生成的proxy对象
        const subTree = (instance.subTree = instance.render.call(proxy));
      
        patch(null, subTree, container, instance);
      
        // patch自顶向下处理完成后，获得el
        vNode.el = subTree.el;
        // 挂载完成
        instance.isMounted = true;
      } else {
        // 更新逻辑
        console.log('update-------------');
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        // 更新subTree
        instance.subTree = subTree;
        // patch比较两个树的不同
        patch(prevSubTree, subTree, container, instance.parent);
      }
    })
    
  }

  return {
    createApp: createAppAPI(render)
  }
}