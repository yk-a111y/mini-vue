import { reactive, isReactive } from '../reactive';
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
  })
})
