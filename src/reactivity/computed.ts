import { ReactiveEffect } from "./effect";

class computedRefImpl {
  private _getter;
  private _dirty: boolean = true;
  private _value;
  private _effect;
  constructor (getter) {
    this._getter = getter;
    // 从新赋值触发trigger, 执行对应effect的scheduler功能，而不执行getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }

    return this._value;
  }
}

export function computed (getter) {
  return new computedRefImpl(getter);
}