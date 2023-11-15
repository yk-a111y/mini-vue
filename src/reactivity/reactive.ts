import { mutableHandler, readonlyHandler } from './baseHandler';

export function reactive(raw) {
  return createActiveObj(raw, mutableHandler);
}

export function readonly(raw) {
  return createActiveObj(raw, readonlyHandler);
}

function createActiveObj(raw: any, baseHandler) {
  // proxy(target, handler)
  return new Proxy(raw, baseHandler);
}