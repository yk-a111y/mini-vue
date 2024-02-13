import { mutableHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler';

export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
  return createActiveObj(raw, mutableHandler);
}

export function shallowReadonly(raw) {
  return createActiveObj(raw, shallowReadonlyHandler)
}

export function readonly(raw) {
  return createActiveObj(raw, readonlyHandler);
}

function createActiveObj(raw: any, baseHandler) {
  // proxy(target, handler)
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