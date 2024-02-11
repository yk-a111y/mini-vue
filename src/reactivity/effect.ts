import { extend } from "../shared";

class ReactiveEffect {
  private _fn;
  deps = [];
  active = true; // 控制stop函数是否执行；只有在active的情况下才cleanupEffect;
  onStop?: () => void;

  constructor (fn, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    // 当前执行的ReactiveEffect对象
    if (!this.active) {
      return this._fn();
    }
    
    activeEffect = this;
    shouldTrack = true;

    const res = this._fn();
    // reset
    shouldTrack = false;

    return res;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      this.onStop && this.onStop();
    }
  }
}

// 清空dep中指定的effect
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

// 依赖图
const targetMap = new Map();
let activeEffect;
let shouldTrack;
export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // options
  extend(_effect, options);

  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}

export function track(target, key) {
  if (!isTracking()) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep ) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run();
    }
  }
}