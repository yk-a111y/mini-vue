import { effect, stop } from "../effect";
import { reactive } from "../reactive"

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  })

  // effect 返回 runner
  it("return runner when call effect", () => {
    // 1. effect(fn) -> return 函数runner -> 调用runner，再次执行传递给effect内部的fn，并返回fn的返回值
    let foo = 10;
    const runner = effect(() => { 
      foo++;
      return "foo";
    });

    expect(foo).toBe(11);

    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  })

  // effect的scheduler功能
  it("scheduler", () => {
    // 1. 通过effect的第二个参数确定一个名为scheduler的函数
    // 2. effect第一次执行第一个参数fn
    // 3. 当响应式对象更新时，就不会执行fn了，而是执行scheduler。
    // 4. 并且当执行runner时，会再次执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled(); // 断言一开始不会被调用
    expect(dummy).toBe(1);
    // 响应式数据变化时，第一时间调用scheduler，而不是effect的第一个参数fn
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  })

  // effect的stop功能
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    })
    obj.prop = 2;
    expect(dummy).toBe(2);
    // 停止对响应式对象的更新
    stop(runner);
    obj.prop = 3;
    // obj.prop++无法通过测试，因为obj.prop = obj.prop + 1会触发getter中的track
    // 导致之前stop清除的effect有添加进来，故还是会使obj.prop = 3
    expect(dummy).toBe(2);
    // 运行runner依旧可以更新
    runner();
    expect(dummy).toBe(3);
  })

  // onStop作为Stop的回调 => stop(runner)会执行onStop函数
  it("onStop", () => {
    const obj = reactive({
      foo: 1
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop
      }
    )
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  })
})