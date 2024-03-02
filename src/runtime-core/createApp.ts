import { createVNode } from "./vNode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 根据rootComponent创建虚拟节点
        const vNode = createVNode(rootComponent);
  
        // vNode render 到根容器
        render(vNode, rootContainer);
      }
    }
  }
}

