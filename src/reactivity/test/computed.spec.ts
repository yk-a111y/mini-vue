import { computed } from "../computed";
import { reactive } from "../reactive"

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 1
    });
    const age = computed(() => {
      return user.age;
    })
    expect(age.value).toBe(1);
  })

  // computed重要特点: 对计算结果缓存
  it('should compute lazily', () => {
    const value = reactive({
      foo: 1
    });
    const getter = jest.fn(() => {
      return value.foo;
    })
    const cValue = computed(getter);

    // Lazy => 不访问cValue.value不会调用getter
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1); // 访问之后，首次调用

    // should not compute again
    cValue.value;
    expect(getter).toBeCalledTimes(1); // 值未改变故不调用

    // should not compute until needed
    // value.foo的值改变，触发trigger执行对应的effect中的scheduler将dirty置为false
    value.foo = 2;
    expect(getter).toBeCalledTimes(1);

    // now it should be compute
    // scheduler 将dirty置为false后，就可以重新计算cValue.value的值了
    expect(cValue.value).toBe(2);
    expect(getter).toBeCalledTimes(2); // 值改变，重新计算并缓存，不能再用之前缓存的值了

    // should not compute again
    cValue.value;
    expect(getter).toBeCalledTimes(2);
  })
})