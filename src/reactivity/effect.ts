import { extend } from '../shared/index'

let activeEffect;
let shouldTrack;

export class ReactiveEffect {
  private _fn: any;
  public scheduler: Function | undefined;
  deps = [];
  // 最初为true，调用stop之后为false
  active = true;
  onStop?: () => void;

  constructor (fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  
  run () {
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const res = this._fn();

    shouldTrack = false

    return res;
  }
  stop () {
    // 控制stop重复调用时，只执行一次
    if (this.active) {
      cleanupEffect(this)
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
  if (dep.has(activeEffect)) return
  dep.add(activeEffect);
  // 通过activeEffect反向收集effect至deps
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
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

// Effect
export function effect (fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options有onStop等等属性，用更优雅的方式将其挂载到effect上
    extend(_effect, options);

    _effect.run();
    // runner = 当前effect内部的函数，并作为返回值
    const runner: any = _effect.run.bind(_effect);
    // 记录runner的effect属性，为了调用stop(runner)
    runner.effect = _effect;

    return runner;
}

// stop将effect函数从depsMap中移除
export function stop (runner) {
  runner.effect.stop();
}