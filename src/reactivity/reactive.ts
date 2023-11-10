import { track, trigger } from "./effect";

export function reactive (raw) {
  // proxy(target, handler)
   return new Proxy(raw, {
    get: (target, key) => {
      const res = Reflect.get(target, key);
      // 收集依赖
      track(target, key);
      return res;
    },
    set: (target, key, value) => {
      const res = Reflect.set(target, key, value);
      // 触发依赖 => 要在set之后trigger，否则trigger的是旧的value
      trigger(target, key);
      return res;
    }
   })
}