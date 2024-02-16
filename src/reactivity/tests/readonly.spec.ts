import { readonly, isReadonly, isProxy } from '../reactive'
describe('readonly', () => {
  it('happy path', () => {
    const original = {foo: 1, bar: { baz: 2}};
    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    // isReadonly
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    // isProxy
    expect(isProxy(wrapped)).toBe(true);
  })

  it.skip('nested readonly obj', () => {
    const original = {foo: 1, bar: { baz: 2}};
    const wrapped = readonly(original);

    expect(isReadonly(wrapped.bar)).toBe(true);
  })

  it('should not change readonly obj', () => {
    console.warn = jest.fn();
    const user = readonly({ age: 18 });
    user.age = 19;

    expect(console.warn).toHaveBeenCalledTimes(1);
  })
})