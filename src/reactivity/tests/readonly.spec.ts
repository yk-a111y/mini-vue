import { readonly } from '../reactive'
describe('readonly', () => {
  it('happy path', () => {
    const original = {foo: 1, bar: { baz: 2}};
    const wrapped = readonly(original);

    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  })

  it('should not change readonly obj', () => {
    console.warn = jest.fn();
    const user = readonly({ age: 18 });
    user.age = 19;

    expect(console.warn).toHaveBeenCalledTimes(1);
  })
})