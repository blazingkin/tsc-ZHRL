import * as source from "../ZHRL";

test('constant 3 should parse to itself', () => {
    expect(source.ZHRL.parse(3)).toBe(3);
});

test('constant true should parse to itself', () => {
    expect(source.ZHRL.parse(true)).toBe(true);
});

test('lambda expression should be parse correctly', () => {
    expect(source.ZHRL.parse(["lam", ["x", "y"], "x"])).toEqual(new source.ZHRL.LamC(["x", "y"], new source.ZHRL.IdC("x")));
})