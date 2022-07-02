import { track, trigger } from './effect'
import { reactive, ReactiveFlags, readonly } from './reactive';
import { isObject } from '../shared/index'

// 根据isReadOnly和shallow创建不同的Getter
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true)
// 创建setter
const set = createSetter();

function createGetter (isReadOnly = false, shallow = false) {
  return function get (target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) return !isReadOnly;
    else if (key === ReactiveFlags.IS_READONLY) return isReadOnly;

    const res = Reflect.get(target, key);

    // 如果shallow为true => 证明是shallowReadOnly的Getter，直接return res即可
    // 无需实现嵌套逻辑(shallow为true)和track收集依赖(只读)
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