import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public dep;
  // 为isRef方法创建ref对象的唯一标识
  public __v_isRef = true;
  constructor (value) {
    // 为了set新旧值的对比，保存原始数据
    this._rawValue = value
    // 1. 看看value是不是对象，是的话为了调用x.value.attrName需要reactive
    this._value = convert(value);

    this.dep = new Set();
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.dep)
    }
    return this._value;
  }

  set value (newValue) {
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue;
      // 新值若是对象，为了保持响应式，继续调用reactive
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function convert (value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref (value) {
  return new RefImpl(value);
}

export function isRef (ref) {
  return !!ref.__v_isRef
}

export function unRef (ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    // 不是ref，直接返回
    // 是ref，返回ref对象的.value属性
    get (target, key) {
      return unRef(Reflect.get(target, key));
    },
    // 非ref对象赋值给ref对象 => ref.value = value
    // 否则，直接复制即可
    set (target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    }
  })
}