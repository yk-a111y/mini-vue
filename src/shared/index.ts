export const extend = Object.assign;

export const EMPTY_OBJ = {}

export const isObject = (val) => {
  return val !== null && typeof val === 'object';
}

export const hasChanged = (newVal, val) => {
  return !Object.is(newVal, val);
}

export const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key);
}

export const captialize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
  })
}

export const toHandleKey = (str: string) => {
  return str ? 'on' + captialize(str) : '';
}

export const isSameVNodeType = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key;
}