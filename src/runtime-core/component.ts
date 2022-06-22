import { PublicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance (vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component;
}

export function setupComponent (instance) {
  // TODO
  // initProps()
  // initSlots()

  // 初始化有状态的组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  // 拿到组件的setup:
  // a. createApp(rootComponent)，之后rootComponent被当做vnode的type参数创建虚拟节点。
  // b. 而vnode被当做createComponentInstance的返回值instance的属性
  const Component = instance.type;
  // 创建代理对象，使setup中的函数可以被render中this.key访问到值
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)

  const { setup } = Component;
  // 有setup, 将其返回值赋值给setupResult
  if (setup) {
    const setupResult = setup()
    // 处理拿到的结果
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // 拿到的是对象，将其作为instance的setupState属性
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  // 拿到组件
  const component = instance.type;
  // 假设组件一定有render
  instance.render = component.render;
}

