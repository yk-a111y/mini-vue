import { render } from "./renderer";
import { createVNode } from "./vNode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 根据rootComponent创建虚拟节点
      const vNode = createVNode(rootComponent);

      // vNode render 到根容器
      render(vNode, rootContainer);
    }
  }
}