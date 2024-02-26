export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === 'object';
}

export const hasChanged = (newVal, val) => {
  return !Object.is(newVal, val);
}

export const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key);
}