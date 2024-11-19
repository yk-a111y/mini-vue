import { reactive } from "../reactive";
import { computed } from "../computed";
import { effect } from "../effect";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });

    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it("should comput lazily", () => {
    const value = reactive({
      foo: 1,
    });

    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not computed again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not computed until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should be calc
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not cmpute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("recursive computed effect", () => {
    const obj = reactive({ foo: 1, bar: 2 });
    const res = computed(() => obj.foo + obj.bar);

    const effectFn = jest.fn(() => {
      console.log(res.value);
    });

    effect(effectFn);

    obj.foo++; // TODO 并不会再次触发effectFn

    expect(effectFn).toHaveBeenCalledTimes(2);
  });
});
