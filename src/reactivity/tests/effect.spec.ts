import { reactive } from "../reactive";
import { effect, stop } from '../effect'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    // user.age触发getter，执行并收集依赖函数fn
    effect(() => {
      nextAge = user.age + 1
    });
    expect(nextAge).toBe(11);
    // update
    user.age = 11;
    expect(nextAge).toBe(12);
  })

  it('should return runner when call effect', () => {
    let foo = 10;
    // runner effect 中函数的返回值
    const runner = effect(() => {
      foo++;
      return 'foo'
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe('foo');
  })

  it('scheduler', () => {
    const obj = reactive({ foo: 1 });
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    })
    const runner = effect(() => {
      dummy = obj.foo
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;
    // 响应式对象的值改变，执行scheduler而不是fn
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1)
    run();
    expect(dummy).toBe(2);
  })

  it('stop', () => {
    const obj = reactive({ prop: 1 });
    let dummy;
    const runner = effect(() => {
      dummy = obj.prop
    })
    
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner)
    // obj.prop = 3;
    obj.prop++; // 本质为：obj.prop = obj.prop + 1; 会触发get操作，重新收集依赖。
    expect(dummy).toBe(2);
    // runner()
    // expect(dummy).toBe(3);
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })

    const onStop = jest.fn();
    let dummy;

    const runner = effect(() => {
      dummy = obj.foo;
    }, {
      onStop
    })
    stop(runner); // 执行onstop函数
    expect(onStop).toHaveBeenCalledTimes(1);
  })
})
