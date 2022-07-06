import { extend } from '../shared/index'

// 当前激活的ReactiveEffect对象(track收集依赖使用)
let activeEffect;
let shouldTrack;

// 基于effect内部的fn，创建ReactiveEffect类
export class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  deps = [];
  // 最初为true，调用stop之后为false
  active = true;
  // 调用stop函数时执行的函数 => 即stop函数的回调
  onStop?: () => void;

  constructor (fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  
  run () {
    // active为false, 处于stop状态
    if (!this.active) {
      return this._fn();
    }

    // 不是stop状态，shouldTrack开关开启
    shouldTrack = true;
    activeEffect = this;

    // res作为runner的返回值
    const res = this._fn();

    // 因为是全局变量，故开启后要关闭
    shouldTrack = false

    return res;
  }
  stop () {
    // 控制stop重复调用时，只执行一次
    // 如果当前ReactiveEffect为active状态，stop才执行清空操作
    if (this.active) {
      cleanupEffect(this)
      // 如果onStop存在，调用stop时需要执行onStop作为其回调
      if (this.onStop) {
        this.onStop();
      }
      this.active = false
    }
  }
}

function cleanupEffect (effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  })
  effect.deps.length = 0;
}

// Track
const targetMap = new Map();
export function track (target, key) {
  // isTracking => shouldTrack 和 activeEffect都为true时，才应该收集依赖。否则，直接return即可
  if (!isTracking()) return;
  // targetMap: {target1: depMap1, target2: depMap2, ...}
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  // depsMap: {key1: depSet1, key2: depSet2, ...}
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  trackEffects(dep);
  
}

export function trackEffects(dep) {
  // dep收集effect，如果已经在dep中，没必要再添加
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  // 通过activeEffect(当前激活的ReactiveEffect对象) => 反向收集effect至deps，用以stop函数删除该依赖
  activeEffect.deps.push(dep);
}

export function isTracking () {
  return shouldTrack && activeEffect;
}

// Trigger
export function trigger (target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects (dep) {
  for (const effect of dep) {
    // 如果该ReactiveEffect对象存在scheduler，数据更新时调用scheduler
    if (effect.scheduler) {
      effect.scheduler();
    // 没有scheduler的情况下调用ReactiveEffect对象的run方法
    } else {
      effect.run();
    }
  }
}

// Effect
export function effect (fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options有onStop等等属性，用更优雅的方式将其挂载到_effect(ReactiveEffect对象)上
    extend(_effect, options);

    _effect.run();
    // runner = 当前effect内部的函数，并作为返回值
    // bind处理effect的run函数内部this的指向
    // 执行runner => 返回内部fn的返回值
    const runner: any = _effect.run.bind(_effect);
    // 记录runner的effect属性，为了调用stop(runner)
    // runner.effect的值是一个ReactiveEffect对象
    runner.effect = _effect;

    return runner;
}

// stop将effect函数从depsMap中移除
export function stop (runner) {
  // runner.effect记录了ReactiveEffect对象，调用其stop方法
  runner.effect.stop();
}