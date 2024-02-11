import { isObject } from '../shared';
import { track, trigger } from './effect';
import { ReactiveFlag, reactive, readonly } from './reactive';

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
  return function getter(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    // 解决嵌套对象的响应式问题
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    // 如果不是readonly，getter触发时会收集依赖
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  }
}

function createSetter() {
  return function setter(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖 => 要在set之后trigger，否则trigger的是旧的value
    trigger(target, key);
    return res;
  }
}

// reactive proxy 的 handler
export const mutableHandler = {
  get,
  set
}

// readonly proxy 的 handler
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key}: ${target} 的 ${key} 不可以被修改`);
    return true;
  }
}