import { shapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  if (instance.vNode.shapeFlag & shapeFlags.SLOT_CHIDREN) {
    let slots = {};
    for (const key in children) {
      const value = children[key];
      slots[key] = (props) => normalizeSlotValue(value(props));
    }

    instance.slots = slots;
  }
  
}
function normalizeSlotValue (value) {
  return Array.isArray(value) ? value : [value];
}