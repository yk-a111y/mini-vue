import { camelize, toHandleKey } from "../shared";

export function emit(instance, event, ...args) {
  console.log('emit', event);

  const { props } = instance;

  const handleName = toHandleKey(camelize(event));
  const handler = props[handleName];
  handler && handler(...args);
}