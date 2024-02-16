import { trackEffects, triggerEffects, isTracking } from './effect';
import { hasChanged, isObject } from '../shared/index'
import { reactive } from './reactive';

class RefImpl {
  private _rawValue: any;
  private _value: any;
  public __v_isRef: boolean = true;
  public dep;
  constructor(value) {
    this._rawValue = value;
    this._value = isObject(value) ? reactive(value) : value; // value为对象时，应为响应式对象
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 新旧值相等，不做trigger操作
    if (hasChanged(newValue, this.value)) {
      this._rawValue = newValue;
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      triggerEffects(this.dep);
    }

  }
}

export function ref (value) {
  return new RefImpl(value);
}

export function isRef (ref) {
  return !!ref.__v_isRef;
}

export function unRef (ref) {
  return isRef(ref) ? ref.value : ref;
}

function trackRefValue (ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}