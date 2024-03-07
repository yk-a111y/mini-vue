import { shallowReadonly } from "../reactivity/reactive";
import { proxyRefs } from "../reactivity/ref";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vNode, parent) {
  const component = {
    type: vNode.type,
    vNode,
    setupState: {},
    props: {},
    slots: {},
    provides: {},
    parent: parent,
    isMounted: false,
    subTree: {},
    emit: () => {}
  }

  component.emit = emit.bind(null, component) as any;

  return component;
}

export function setupComponent(instance) {
  // initProps
  initProps(instance, instance.vNode.props);
  // initSlots
  initSlots(instance, instance.vNode.children);

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
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}