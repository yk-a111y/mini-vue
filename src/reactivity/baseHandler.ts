import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive';
import { isObject } from '../shared/index'

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true)
const set = createSetter();

function createGetter (isReadOnly = false, shallow = false) {
  return function get (target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) return !isReadOnly;
    else if (key === ReactiveFlags.IS_READONLY) return isReadOnly;

    const res = Reflect.get(target, key);

    if (shallow) return res;
    // 如果res是对象，递归处理
    if (isObject(res)) return isReadOnly ? readonly(res) : reactive(res);
    // 数据可读，才用track添加依赖
    if (!isReadOnly) track(target, key);

    return res
  }
}

function createSetter () {
  return function set (target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  }
}


// 不同的baseHandlers
// 1.
export const mutableHandlers = {
  get,
  set,
}
// 2. readonly的handler
export const readonlyHandlers = {
  get: readonlyGet,
  set (target, key, value) {
    console.warn(`key: ${key} set 失败， 因为target是readonly`, target);
    return true;
  }
}
// shallowReadonly的handler
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set (target, key, value) {
    console.warn(`key: ${key} set 失败， 因为target是readonly`, target);
    return true;
  }
}