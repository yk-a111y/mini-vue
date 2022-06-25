export const extend = Object.assign;

export const isObject = obj => {
  return obj !== null && typeof obj === 'object'
}

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
}

export const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// kebab转camel
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : '';
  })
}
// event 转 onEvent
export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
}
// 首字母大写
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
