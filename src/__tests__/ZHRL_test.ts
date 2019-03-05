import * as source from "../ZHRL";
import { stringify } from "querystring";

test('constant 3 should parse to itself', () => {
    expect(source.ZHRL.parse(3)).toBe(3);
});

test('constant true should parse to itself', () => {
    expect(source.ZHRL.parse(true)).toBe(true);
});

test('lambda expression should be parse correctly', () => {
    expect(source.ZHRL.parse(["lam", ["x", "y"], "x"])).toEqual(new source.ZHRL.LamC(["x", "y"], new source.ZHRL.IdC("x")));
})

test('interp a literal should return that literal', () => {
    expect(source.ZHRL.interp(3, source.ZHRL.emptyEnv)).toEqual(3);
    expect(source.ZHRL.interp(false, source.ZHRL.emptyEnv)).toEqual(false);
});

test('interp ifC should return correct values', () => {
    var IfC = source.ZHRL.IfC;
    expect(source.ZHRL.interp(new IfC(true, 1, 2), source.ZHRL.emptyEnv)).toEqual(1);
    expect(source.ZHRL.interp(new IfC(false, 1, 2), source.ZHRL.emptyEnv)).toEqual(2);
});

test('interp IdC should return the correct bound value, or throw error', () => {
    var IdC = source.ZHRL.IdC;
    var map = new Map<string, source.ZHRL.Value>();
    map.set("a", 3);
    map.set("b", false);
    expect(source.ZHRL.interp(new IdC("a"), map)).toEqual(3);
    expect(source.ZHRL.interp(new IdC("b"), map)).toEqual(false);
    expect(() => {source.ZHRL.interp(new IdC("c"), map)}).toThrow("ZHRL: Unbound identifier c");
})

test('very simple function application should work', () => {
    var prog = [["lam", ["x"], "x"], 30];
    expect(source.ZHRL.topInterp(prog)).toEqual(30);
});