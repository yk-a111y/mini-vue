import { extend } from "../shared";

export class ReactiveEffect {
  private _fn;
  deps = [];
  active = true; // 控制stop函数是否执行；只有在active的情况下才cleanupEffect;
  onStop?: () => void;

  constructor(fn, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    // 当前执行的ReactiveEffect对象
    if (!this.active) {
      return this._fn();
    }

    // 清空依赖, 避免多分支函数的依赖重复执行
    cleanupEffect(this);

    activeEffect = this;
    effectStack.push(activeEffect); // *activeEffect 推入 副作用栈中
    shouldTrack = true;

    const res = this._fn();

    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];

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
const targetMap = new WeakMap();
const effectStack: ReactiveEffect[] = []; // *避免嵌套的effect在收集上发生内层副作用嵌套外层副作用的情况
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
  if (!isTracking()) return; // *避免obj.foo++这种情况无限递归收集依赖

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

  trackEffects(dep);
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  triggerEffects(dep);
}

export function triggerEffects(dep) {
  // 重新构造执行的set，避免一边删除依赖，一边添加依赖造成死循环
  const effectToRun = new Set<ReactiveEffect>(dep);
  for (const effect of effectToRun) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
