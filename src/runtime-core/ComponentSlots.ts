import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots (instance, children) {
  // 判断vnode类型是否是插槽
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normailizeObjectSlots(children, instance.slots);
  }
}

function normailizeObjectSlots(children, slots) {
  // instance.slots = Array.isArray(children) ? children : [children];
  for (const key in children) {
    // value => 对应的slot
    const value = children[key];
    slots[key] = (props) => normailizeSlotValue(value(props));
  }
}

function normailizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}