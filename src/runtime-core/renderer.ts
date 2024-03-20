import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isSameVNodeType } from "../shared";
import { shouldComponentUpdate } from './componentUpdateUtils'
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
    
    if (i > e1) {  // 3. 新的比老的多 => patch创建新节点
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = (nextPos < c2.length) ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {  // 4. 老的比新的多 => hostRemove删除节点
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {  // 5. 乱序
      let s1 = i;
      let s2 = i;

      let toBePatched = e2 - s2 + 1;
      let patched = 0;

      const keyToNewIndexMap = new Map();
      // 建立新旧索引关系
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      // 中间节点是否发生了移动
      let moved = false;
      let maxNewIndexSoFar = 0;

      // 遍历新节点，生成keyToNewIndexMap
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 遍历老节点的每一项，看是否可以复用
      for (let i = s1; i <= e1; i++) {
        let prevChild = c1[i];
        let newIndex;

        // 优化：当处理的节点数量 大于 新节点数量时，证明旧节点过长，可以将之后的全部删除，不用再做校验了
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        // 用户设置了key，去map中检索，否则需要遍历
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
        // 用户没有设置key，则需要遍历新节点看是否有可复用节点
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 如果newIndex不存在 => 新节点不可复用老节点，故删除
        // 如果newIndex存在 => 可复用，执行patch深度对比二者
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex > maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true; // 新节点发生了移动
          }
          // newIndex存在，存储新旧映射关系
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          // 每处理完一个节点，patched++
          patched++;
        }
      }

      // 生成最长递增子序列
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
      let j = increasingNewIndexSequence.length - 1; // 指向最长递增子序列的指针
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) { // 为0 => 老节点中无该元素，需要创建该元素
          patch(null, nextChild, container, parentComponent, anchor);
        }

        if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) { // 如果当前索引 !== 最长递增子序列的索引 => 需要移动元素
            hostInsert(nextChild.el, container, anchor)
          } else { // 相等的话 => 元素不必移动，指针继续向前搜索
            j--;
          }
        }
      }
    }
  }
  
  function processComponent(n1, n2, container, parent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parent, anchor);
    } else {
      updateComponent(n1, n2)
    }
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
    const instance = (vNode.component = createComponentInstance(vNode, parent));
  
    setupComponent(instance);
    setupRenderEffect(instance, vNode, container, anchor);
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component); // n2当前无Component，所以要把n1的component赋值过来
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2; // 存储新的VNode
      instance.update();
    } else {
      console.log('无更新逻辑触发');
      n2.el = n1.el;
      instance.vNode = n2; 
    }
  }
  
  function setupRenderEffect(instance: any, vNode, container, anchor) {
    // effect包裹，实现副作用收集
    instance.update = effect(() => {
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
        const { proxy, next, vNode } = instance;
        if (next) {
          next.el = vNode.el;
          updateComponentPreRender(instance, next);
        }
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

function updateComponentPreRender(instance, nextVNode) {
  // 更新实例对象上的VNode
  instance.vNode = nextVNode;
  instance.next = null;
  // 更新实例对象上的props
  instance.props = nextVNode.props;
}


// 最大递增子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];

  let i, j, u, v, c;
  const len = arr.length;

  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }

      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}