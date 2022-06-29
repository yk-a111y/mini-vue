import { toHandlerKey, camelize } from "../shared/index";

export function emit (instance, event, ...args) {
  // console.log('emit', event)

  // props => 内部包含虚拟节点的事件配置
  const { props } = instance;
  console.log(instance)
  console.log(props)
  // 事件名称处理
  const handlerName = toHandlerKey(camelize(event));
  // 根据event名找props中的对应函数
  const handler = props[handlerName];
  // 如果存在，执行该handler
  handler && handler(...args)
}