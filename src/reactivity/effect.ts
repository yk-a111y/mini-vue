import { extend } from "../shared";

class ReactiveEffect {
  private _fn;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor (fn, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    // 当前执行的ReactiveEffect对象
    activeEffect = this;
    return this._fn();
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
}

// 依赖图
const targetMap = new Map();
let activeEffect;
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
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
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