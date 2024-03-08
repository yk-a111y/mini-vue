import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vNode";


export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options;

  function render(vNode, container) {
    // 递归处理 vnode 和其对应容器
    patch(null, vNode, container, {});
  }

  // n1 -> oldSubTree; n2 -> newSubTree
  function patch(n1, n2: any, container, parent) {
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
    mountChildren(n2.children, container, parent);
  }
  
  function processTextNode(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  
  function processElement(n1, n2, container, parent) {
    if (!n1) {
      // 挂载逻辑
      mountElement(n2, container, parent);
    } else {
      // 更新逻辑
      patchElement(n1, n2, container, parent);
    }
  }

  // 更新Element
  function patchElement(n1, n2, container, parentComponent) {
    console.log("🚀 ~ patchElement", 'patchElement')
    // console.log('n1: ', n1);
    // console.log('n2: ', n2);
    const el = (n2.el = n1.el);
    const prevProps = n1.props || EMPTY_OBJ;
    // console.log("🚀 ~ patchElement ~ oldProps:", prevProps)
    const nextProps = n2.props || EMPTY_OBJ;
    // console.log("🚀 ~ patchElement ~ nextProps:", nextProps)

    // 比较新旧props
    patchProps(prevProps, nextProps, el);
    // 更新children
    patchChildren(n1, n2, el, parentComponent);
  }
  function patchProps(prevProps, nextProps, el) {
    if (prevProps !== nextProps) {
      // 遍历nextProps，处理新增的props
      for (const key in nextProps) {
        const prevProp = prevProps[key];
        const nextProp = nextProps[key];
        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }

      if (prevProps !== EMPTY_OBJ) {
        // 遍历prevProps，删除不用的props
        for (const key in prevProps) {
          if (!(key in nextProps)) {
            hostPatchProps(el, key, prevProps, null);
          }
        }
      }
    }
    
  }
  function patchChildren(n1, n2, container, parentComponent) {
    const prevShapeFlag = n1.shapeFlag;
    // console.log("🚀 ~ patchChildren ~ shapeFlag:", prevShapeFlag)
    const shapeFlag = n2.shapeFlag;
    // console.log("🚀 ~ patchChildren ~ newShapeFlag:", shapeFlag)

    // 新节点为text文本，老节点为数组形式的元素
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
        // 1. 把老children删除
        unmountChildren(n1.children);
      }
      // n1为数组 n2为字符串 || n1 n2 均为不相等的字符串
      if (n1.children !== n2.children) {
        // 2. 设置text
        hostSetElementText(container, n2.children);
      }
    } else {
      // 新节点为数组，老节点为文本元素

      // 1. 删除文本节点
      hostSetElementText(container, '');
      // 2. mount 新的数组
      mountChildren(n2.children, container, parentComponent);
    }
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
      hostPatchProps(el, key, null, val);
    }
  
    // 配置children(可能是文本，也可能是数组内嵌套多个vNode)
    const { children } = vNode;
    if(vNode.shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vNode.shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vNode.children, el, parent);
    }
  
    // el加入容器中
    hostInsert(el, container);
  }
  
  function mountChildren(children, container, parent) {
    children.forEach( v => {
      patch(null, v, container, parent);
    });
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
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