import { isObject } from '../shared';
import { mutableHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler';

export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
  return createReactiveObj(raw, mutableHandler);
}

export function shallowReadonly(raw) {
  return createReactiveObj(raw, shallowReadonlyHandler)
}

export function readonly(raw) {
  return createReactiveObj(raw, readonlyHandler);
}

function createReactiveObj(raw: any, baseHandler) {
  // proxy(target, handler)
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`);
  }
  return new Proxy(raw, baseHandler);
}

export function isReactive(value) {
  return !!value[ReactiveFlag.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}