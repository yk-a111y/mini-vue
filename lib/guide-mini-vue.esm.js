const isObject = obj => {
    return obj !== null && typeof obj === 'object';
};
const hasOwn = (obj, key) => {
    return Object.prototype.hasOwnProperty.call(obj, key);
};
// kebab转camel
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
// event 转 onEvent
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};
// 首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    // $slots
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// Track
const targetMap = new Map();
// Trigger
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */)
            return !isReadOnly;
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */)
            return isReadOnly;
        const res = Reflect.get(target, key);
        if (shallow)
            return res;
        // 如果res是对象，递归处理
        if (isObject(res))
            return isReadOnly ? readonly(res) : reactive(res);
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
// 不同的baseHandlers
// 1.
const mutableHandlers = {
    get,
    set,
};
// 2. readonly的handler
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败， 因为target是readonly`, target);
        return true;
    }
};
// shallowReadonly的handler
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set 失败， 因为target是readonly`, target);
        return true;
    }
};

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
// createActiveObject 接收raw 和 不同的baseHandlers来创建reactive, readonly, shallowReadonly等方法
function createActiveObject(raw, baseHandler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
    }
    return new Proxy(raw, baseHandler);
}

function emit(instance, event, ...args) {
    // console.log('emit', event)
    // props => 内部包含虚拟节点的事件配置
    const { props } = instance;
    console.log(instance);
    console.log(props);
    // 事件名称处理
    const handlerName = toHandlerKey(camelize(event));
    // 根据event名找props中的对应函数
    const handler = props[handlerName];
    // 如果存在，执行该handler
    handler && handler(...args);
}

function initSlots(instance, children) {
    // 判断vnode类型是否是插槽
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
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

function createComponentInstance(vnode, parent) {
    console.log('createInstance: ', parent, vnode);
    // 组件实例: Instance
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent
    };
    component.emit = emit.bind(null, component);
    return component; // 被render中的instance变量接收
}
function setupComponent(instance) {
    // 初始化组件的props属性
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 初始化有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 拿到组件的setup:
    // a. createApp(rootComponent)，之后rootComponent被当做vnode的type参数创建虚拟节点。
    // b. 而vnode作为instance的属性之一，在createComponentInstance中被返回
    const Component = instance.type;
    // 创建代理对象，使setup中的函数可以被render中this.key访问到值
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 取出Component的setup API
    const { setup } = Component;
    // 有setup, 将其返回值赋值给setupResult
    if (setup) {
        // instance赋值给currentInstance，记录当前组件实例
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        // 处理拿到的结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 拿到的是对象，将其作为instance的setupState属性
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    // 拿到组件
    const component = instance.type;
    // 假设组件一定有render
    instance.render = component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

// 插槽类型声明
const Fragment = Symbol('Fragment');
// 文本节点类型声明
const Text = Symbol('Text');
// 1. 根据传入的type等参数创建虚拟节点vnode
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type),
        el: null
    };
    // 判断children
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 是组件类型且children为Object => 满足插槽的特征
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function render(vnode, container) {
    // 1. patch(内部判断类型，component调用processComponent，element调用processElement)
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    // 1.1 处理组件 or 元素
    console.log(vnode.type);
    // shapeFlags判断vNode的类型
    const { shapeFlag, type } = vnode;
    // Fragment => 只渲染children，解决slot渲染总是包裹在div里的问题
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                processComponent(vnode, container, parentComponent);
            }
    }
}
/* ****************** 处理Text ********************* */
function processText(vnode, container) {
    // 文本节点中，children为传入的字符串
    const { children } = vnode;
    // 文本赋值给el属性
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
/* ****************** 处理Fragment ********************* */
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
}
/* ****************** 处理Element ********************* */
function processElement(vnode, container, parentComponent) {
    // 挂载虚拟节点
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    // a. children 为字符串，设为文本；为数组，
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el, parentComponent);
    }
    // b. 处理vnode的props，为标签设置属性
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        // 正则判断属性是否是注册事件
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 挂载
    container.append(el);
}
function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(element => {
        patch(element, container, parentComponent);
    });
}
/* ****************** 处理组件 ********************* */
function processComponent(vnode, container, parentComponent) {
    // 1.2 挂载组件
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVNode, container, parentComponent) {
    // 1.2.1 根据虚拟节点创建组件实例
    // instance: { vnode, type: vnode.type(rootComponent), setupState }
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 1.2.2 对组件实例进行配置
    setupComponent(instance);
    // 1.2.3 
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    // 拿到render返回的虚拟节点树(即在App中return出来的h函数)
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // 基于subTree再次调用patch
    // 情况一: 是element类型，调用pathc的processElement()
    // 情况二: 是component类型，则继续调用processComponent()
    patch(subTree, container, instance);
    // 当所有组件和元素都patch结束后，获取el(根组件)
    initialVNode.el = subTree.el;
}

// 1. createApp 返回一个App对象，这个对象调用mount()方法挂载
function createApp(rootComponent) {
    return {
        // 1.1 createApp内部返回一个包含mount函数的对象，接收container使App挂载其上
        mount(rootContainer) {
            // 1.2 component -> VNode， 后续的操作全部基于组件转换的VNode
            const vnode = createVNode(rootComponent /* app { render, setup } */);
            // 1.3 基于vnode和rootContainer在内部调用patch方法，将vnode渲染为真实的DOM
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // 每次渲染slot都会包裹在一个div中
            // 给予特殊标志Fragment，让slot直接渲染children而不用包裹在div中
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    // 父级组件存数据
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 初始化当前组件的provide => 当前provide与父组件的provide相等时(父组件有provide)
        // 证明该组件正在进行provide的初始化
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    // 子组件取数据
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === 'function')
                return defaultVal();
            return defaultVal;
        }
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
