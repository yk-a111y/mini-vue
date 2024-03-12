import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isSameVNodeType } from "../shared";
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
    patch(null, vNode, container, {}, null);
  }

  // n1 -> oldSubTree; n2 -> newSubTree
  function patch(n1, n2: any, container, parent, anchor) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent, anchor);
        break;
      case Text:
        processTextNode(n1, n2, container);
        break;
      default:
        if (shapeFlag & shapeFlags.ELEMENT) {
          // 处理元素
          processElement(n1, n2, container, parent, anchor);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parent, anchor);
        }
        break;
    }
  }
  
  function processFragment(n1, n2, container, parent, anchor) {
    mountChildren(n2.children, container, parent, anchor);
  }
  
  function processTextNode(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  
  function processElement(n1, n2, container, parent, anchor) {
    if (!n1) {
      // 挂载逻辑
      mountElement(n2, container, parent, anchor);
    } else {
      // 更新逻辑
      patchElement(n1, n2, container, parent, anchor);
    }
  }

  // 更新Element
  function patchElement(n1, n2, container, parentComponent, anchor) {
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
    patchChildren(n1, n2, el, parentComponent, anchor);
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
  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        // 1. 删除文本节点
        hostSetElementText(container, '');
        // 2. mount 新的数组
        mountChildren(n2.children, container, parentComponent, anchor);
      } else {
        // 新老节点都为数组：启动Diff算法
        patchKeyedChidren(n1.children, n2.children, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChidren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 1. 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    // 2. 右侧
    while(i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--, e2--;
    }

    // 3. 新的比老的多 => patch创建新节点
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = (nextPos < c2.length) ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    // 4. 老的比新的多 => hostRemove删除节点
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    // 5. 乱序
    } else {
      console.log('乱序');
    }
  }
  
  function processComponent(n1, n2, container, parent, anchor) {
    mountComponent(n2, container, parent, anchor);
  }
  
  function mountElement(vNode, container, parent, anchor) {
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
      mountChildren(vNode.children, el, parent, anchor);
    }
  
    // el加入容器中
    hostInsert(el, container, anchor);
  }
  
  function mountChildren(children, container, parent, anchor) {
    children.forEach( v => {
      patch(null, v, container, parent, anchor);
    });
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }
  
  function mountComponent(vNode: any, container, parent, anchor) {
    // 创建组件实例
    const instance = createComponentInstance(vNode, parent);
  
    setupComponent(instance);
    setupRenderEffect(instance, vNode, container, anchor);
  }
  
  function setupRenderEffect(instance: any, vNode, container, anchor) {
    // effect包裹，实现副作用收集
    effect(() => {
      if (!instance.isMounted) {
        // 初始化逻辑
        console.log('init-----------');
        const { proxy } = instance;
        // this指向通过setupStatefulComponent生成的proxy对象
        const subTree = (instance.subTree = instance.render.call(proxy));
      
        patch(null, subTree, container, instance, null);
      
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
        patch(prevSubTree, subTree, container, instance.parent, anchor);
      }
    })
    
  }

  return {
    createApp: createAppAPI(render)
  }
}