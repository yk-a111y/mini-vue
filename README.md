## mini-vue

理解和阅读Vue3源码的过程中，实现的一个简易的vue模型。
目前包括reactivity和runtime-core两大模块的基本功能


#### reactive: 响应式模块，利用jest实现TDD开发。

- [x] reactive方法: 基于传入对象返回响应式数据
  - [x] track: 收集依赖
  - [x] trigger: 触发依赖
  - [x] 支持 isReactive
  - [x] 支持嵌套 reactive

- [x] readonly方法: 基于传入对象返回只读数据
  - [x] 支持isReadonly
  - [x] 支持 shallowReadonly

- [x] ref方法: 基于传入基本数据类型返回响应式数据
  - [x] 支持 isRef、unRef

- [x] effect方法:
  - [x] 支持 effect.scheduler
  - [x] 支持 effect.stop

- [x] computed 的实现

#### runtime-core: 从createApp开始，实现初始化的整个流程
