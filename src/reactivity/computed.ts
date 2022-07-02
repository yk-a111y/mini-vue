import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any;
  private _value: any;
  private _dirty: boolean = true;
  private _effect: any;
  constructor (getter) {
    this._getter = getter;
    // 传入scheduler, 值改变 =>触发trigger时，有scheduler执行scheduler，将dirty置为true，使得this._value可以重新计算
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) this._dirty = true;
    });
  }
  get value () {
    // 当依赖的响应式对象值发生改变时，dirty应该重新置为true
    if (this._dirty) { 
      this._dirty = false;
      this._value = this._effect.run();
    }
    // this._dirty为false时 => 数据未发生变化，始终return缓存的这个value
    return this._value;
  }
}
export function computed (getter) {
  return new ComputedRefImpl(getter);
}