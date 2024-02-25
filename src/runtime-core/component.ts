import { publicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vNode) {
  const component = {
    type: vNode.type,
    vNode
  }

  return component;
}

export function setupComponent(instance) {
  // TODO initProps
  // TODO initSlots

  // 为组件挂载状态
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  // 设置instance的proxy属性
  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers)

  // 获取组件的setup函数
  const { setup } = Component;

  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}