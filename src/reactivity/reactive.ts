import { isObject } from "../shared/index";
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

export function reactive (raw) {
  // reactiveActiveObject 根据handler的类型返回特定的Proxy对象
  return createActiveObject(raw, mutableHandlers);
}

export function readonly (raw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly (raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive (value) {
  return !!value[ReactiveFlags.IS_REACTIVE]; // !!转布尔值
}

export function isReadonly (value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy (value) {
  return isReactive(value) || isReadonly(value);
}

// createActiveObject 接收raw 和 不同的baseHandlers来创建reactive, readonly, shallowReadonly等方法
function createActiveObject (raw: any, baseHandler) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`)
  }
  return new Proxy(raw, baseHandler);
}

