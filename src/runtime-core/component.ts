import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initProps } from './componentProps';
import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initSlots } from './ComponentSlots'

export function createComponentInstance (vnode, parent) {
  console.log('createInstance: ', parent, vnode)
  // 组件实例: Instance
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {}, // 接收组件的props,
    emit: () => {}, // 接收组件的emit
    slots: {},
    provides: parent ? parent.provides : {},
    parent
  }

  component.emit = emit.bind(null, component) as any

  return component; // 被render中的instance变量接收
}

// instance => 基于vNode和parent创建的组件实例
export function setupComponent (instance) {
  // 初始化组件的props属性
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  // 初始化有状态的组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  // 拿到组件的setup:
  // a. createApp(rootComponent)，之后rootComponent被当做vnode的type参数创建组件的虚拟节点。
  // b. 而vnode作为instance的属性之一，在createComponentInstance中被返回
  const Component = instance.type;
  // 创建代理对象，使setup中的函数可以被render中this.key访问到值
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)
  // 取出Component的setup API
  const { setup } = Component;
  // 有setup, 将其返回值赋值给setupResult
  if (setup) {
    // instance赋值给currentInstance，记录当前组件实例
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null);
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

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}
export function setCurrentInstance(instance) {
  currentInstance = instance;
}

