"use strict";
exports.__esModule = true;
var source = require("../ZHRL");
test('constant 3 should parse to itself', function () {
    expect(source.ZHRL.parse(3)).toBe(3);
});
test('constant true should parse to itself', function () {
    expect(source.ZHRL.parse(true)).toBe(true);
});
test('lambda expression should be parse correctly', function () {
    expect(source.ZHRL.parse(["lam", ["x", "y"], "x"])).toEqual(new source.ZHRL.LamC(["x", "y"], new source.ZHRL.IdC("x")));
});
//test('var expression should be parse correctly', () => {
//expect(source.ZHRL.parse(["var", ["x", "y"], "x"])).toEqual(new source.ZHRL.LamC(["x", "y"], new source.ZHRL.IdC("x")));
//})
test('interp a literal should return that literal', function () {
    expect(source.ZHRL.interp(3, source.ZHRL.emptyEnv)).toEqual(3);
    expect(source.ZHRL.interp(false, source.ZHRL.emptyEnv)).toEqual(false);
});
test('interp ifC should return correct values', function () {
    var IfC = source.ZHRL.IfC;
    expect(source.ZHRL.interp(new IfC(true, 1, 2), source.ZHRL.emptyEnv)).toEqual(1);
    expect(source.ZHRL.interp(new IfC(false, 1, 2), source.ZHRL.emptyEnv)).toEqual(2);
});
test('interp IdC should return the correct bound value, or throw error', function () {
    var IdC = source.ZHRL.IdC;
    var map = new Map();
    map.set("a", 3);
    map.set("b", false);
    expect(source.ZHRL.interp(new IdC("a"), map)).toEqual(3);
    expect(source.ZHRL.interp(new IdC("b"), map)).toEqual(false);
    expect(function () { source.ZHRL.interp(new IdC("c"), map); }).toThrow("ZHRL: Unbound identifier c");
});
test('interpreting a lambda expression should yield a CloV', function () {
    var env = new Map();
    var lam = new source.ZHRL.LamC(["a", "b"], new source.ZHRL.IdC("a"));
    expect(source.ZHRL.interp(lam, env)).toEqual(new source.ZHRL.CloV(env, lam));
});
test('function application with not enough variables should fail', function () {
    var env = new Map();
    var lam = new source.ZHRL.LamC(["a", "b"], 3);
    var app = new source.ZHRL.AppC(lam, []);
    expect(function () { source.ZHRL.interp(app, env); }).toThrow("ZHRL: Function called with wrong arity");
});
test('var should parse to function application', function () {
    console.log(source.ZHRL.parse(["var", ["a", "=", 3], "a"]));
    expect(source.ZHRL.parse(["var", ["a", "=", 3], "a"])).toEqual(new source.ZHRL.AppC(new source.ZHRL.LamC(["a"], new source.ZHRL.IdC("a")), [3]));
});
test('very simple function application should work', function () {
    var prog = [["lam", ["x"], "x"], 30];
    expect(source.ZHRL.topInterp(prog)).toEqual("30");
});
test('serialize should return string version of ZHRL value', function () {
    expect(source.ZHRL.serialize(1)).toEqual("1");
});
test('test add builtin', function () {
    var add = source.ZHRL.globalEnv.get("+");
    if (!source.ZHRL.isBuiltin(add)) {
        throw new Error("Add should be a builtin");
    }
    expect(add.operator([2, 3])).toEqual(5);
});
test('test less than equal builtin', function () {
    var lte = source.ZHRL.globalEnv.get("<=");
    if (!source.ZHRL.isBuiltin(lte)) {
        throw new Error("less than equal should be a builtin");
    }
    expect(lte.operator([2, 3])).toEqual(true);
});
test('test less than equal builtin', function () {
    var eq = source.ZHRL.globalEnv.get("equal?");
    if (!source.ZHRL.isBuiltin(eq)) {
        throw new Error("equal? should be a builtin");
    }
    expect(eq.operator([2, 2])).toEqual(true);
});
test('test true builtin', function () {
    var tru = source.ZHRL.globalEnv.get("true");
    if (!source.ZHRL.isBuiltin(tru)) {
        throw new Error("true should be a builtin");
    }
    expect(tru.operator([true])).toEqual(true);
});
test('test false builtin', function () {
    var fals = source.ZHRL.globalEnv.get("false");
    if (!source.ZHRL.isBuiltin(fals)) {
        throw new Error("false should be a builtin");
    }
    expect(fals.operator([false])).toEqual(false);
});
test('test less than equal builtin again', function () {
    var lte = source.ZHRL.globalEnv.get("<=");
    if (!source.ZHRL.isBuiltin(lte)) {
        throw new Error("less than equal should be a builtin");
    }
    expect(lte.operator([3, 2])).toEqual(false);
});
test('test comprehensive test of many parts', function () {
    expect(source.ZHRL.topInterp(["var", ["a", "=", 3],
        ["b", "=", 10],
        ["*", "a", ["+", "b", 1]]])).toEqual("33");
});
