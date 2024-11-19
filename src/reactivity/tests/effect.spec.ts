import { reactive } from "../reactive";
import { effect, stop } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    // user.age触发getter，执行并收集依赖函数fn
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    // update
    user.age = 11;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    let foo = 10;
    // runner effect 中函数的返回值
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe("foo");
  });

  it("clean up duplicate effect branch", () => {
    let text;
    const obj = reactive({
      ok: true,
      text: "obj text",
    });

    // *这种分支切换，会产生遗留的副作用函数
    effect(() => {
      text = obj.ok ? obj.text : "branch 2";
    });
    expect(text).toBe("obj text");
    obj.ok = false;
    expect(text).toBe("branch 2");
  });

  it("recursive effect", () => {
    const obj = reactive({ foo: 1, bar: 2 });
    let baz1;
    let baz2;
    effect(() => {
      console.log("effect1 执行");
      effect(() => {
        console.log("effect2 执行");
        baz2 = obj.bar + 1;
      });
      baz1 = obj.foo + 1;
    });
    // *foo改变时，触发effect1，effect2；bar改变时，仅触发effect2
    obj.bar = 0;
  });

  // 调度器是指trigger触发副作用时，框架有能力决定effectFn的执行时机、次数和方式
  it("scheduler", () => {
    const obj = reactive({ foo: 1 });
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;
    // 响应式对象的值改变，执行scheduler而不是fn
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    const obj = reactive({ prop: 1 });
    let dummy;
    const runner = effect(() => {
      dummy = obj.prop;
    });

    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3;
    obj.prop++; // 本质为：obj.prop = obj.prop + 1; 会触发get操作，重新收集依赖。
    expect(dummy).toBe(2);
    // runner()
    // expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });

    const onStop = jest.fn();
    let dummy;

    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner); // 执行onstop函数
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
