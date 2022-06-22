export const extend = Object.assign;

export const isObject = obj => {
  return obj !== null && typeof obj === 'object'
}

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
}