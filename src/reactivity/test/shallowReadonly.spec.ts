import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReanonly", () => {
  it("should not make non-reactive properties reactive", () => {
    const props: any = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false)
  })

  it("warn the call set", () => {
    console.warn = jest.fn();

    const user = shallowReadonly({
      age: 10,
    })
    user.age = 11;

    expect(console.warn).toBeCalled();
  })
})