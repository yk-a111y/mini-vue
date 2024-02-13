import { reactive, isReactive, isProxy } from '../reactive';
describe('raeactive', () => {
  it('happy path', () => {
    const original = { foo: 1};
    const observed = reactive(original);

    // get
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    // set
    original.foo = 2;
    expect(observed.foo).toBe(2);
    // isReactive
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
    // isProxy
    expect(isProxy(observed)).toBe(true);
  })

  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }

    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  })
})
