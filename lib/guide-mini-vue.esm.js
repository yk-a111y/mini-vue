const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    // 初始化有状态的组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 拿到组件的setup:
    // a. createApp(rootComponent)，之后rootComponent被当做vnode的type参数创建虚拟节点。
    // b. 而vnode被当做createComponentInstance的返回值instance的属性
    const Component = instance.type;
    // 创建代理对象，使setup中的函数可以被render中this.key访问到值
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    // 有setup, 将其返回值赋值给setupResult
    if (setup) {
        const setupResult = setup();
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

function render(vnode, container) {
    // 1. patch(内部判断类型，component调用processComponent，element调用processElement)
    patch(vnode, container);
}
function patch(vnode, container) {
    // 1.1 处理组件 or 元素
    console.log(vnode.type);
    // shapeFlags判断vNode的类型
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 挂载虚拟节点
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    // a. children 为字符串，设为文本；为数组，
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
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
function mountChildren(vnode, container) {
    vnode.forEach(v => {
        patch(v, container);
    });
}
/* ****************** 处理组件 ********************* */
function processComponent(vnode, container) {
    // 1.2 挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 1.2.1 根据虚拟节点创建组件实例
    const instance = createComponentInstance(initialVNode);
    // 1.2.2 对组件实例进行配置
    setupComponent(instance);
    // 1.2.3 
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    // 拿到render返回的虚拟节点树(即在APP中return出来的h函数)
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // 基于subTree再次调用patch
    // 情况一: 是element类型，调用pathc的processElement()
    // 情况二: 是component类型，则继续调用processComponent()
    patch(subTree, container);
    // 当所有组件和元素都patch结束后，获取el(根组件)
    initialVNode.el = subTree.el;
}

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
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

// 1. createApp 返回一个App对象，这个对象调用mount()方法挂载
function createApp(rootComponent) {
    return {
        // 1.1 createApp内部返回一个包含mount函数的对象，接收container使App挂载其上
        mount(rootContainer) {
            // 1.2 component -> vNode， 后续的操作全部基于组件转换的vNode
            const vnode = createVNode(rootComponent);
            // 1.3 基于vnode和rootContainer在内部调用patch方法，将vnode渲染为真实的DOM
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
