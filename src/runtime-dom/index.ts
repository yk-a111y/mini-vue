import { createRenderer } from '../runtime-core'

function createElement (type) {
  console.log('-------------------createElement')
  return document.createElement(type);
}

function patchProp (el, key, val) {
  console.log('------------------patchProp')
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, val);
  } else {
    el.setAttribute(key, val);
  }
}

function insert (el, parent) {
  console.log('-------------------insert')
  parent.append(el);
}

// 基于上面的三块功能，生成renderer
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

// createApp => 调用createRenderer所返回的createApp函数
export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core'