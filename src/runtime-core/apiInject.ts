import { getCurrentInstance } from "./component";

export function provide (key, value) {
  // 父级组件存数据
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;

    // 初始化当前组件的provide => 当前provide与父组件的provide相等时(父组件有provide)
    // 证明该组件正在进行provide的初始化
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}

export function inject (key, defaultVal) {
  // 子组件取数据
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultVal) {
      if (typeof defaultVal === 'function') return defaultVal()
      return defaultVal;
    }
    
  }
}