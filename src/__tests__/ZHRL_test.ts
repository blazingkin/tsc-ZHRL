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
});

test('interpreting a lambda expression should yield a CloV', () => {
    var env = new Map<String, source.ZHRL.Value>();
    var lam = new source.ZHRL.LamC(["a", "b"], new source.ZHRL.IdC("a"));
    expect(source.ZHRL.interp(lam, env)).toEqual(new source.ZHRL.CloV(env, lam));
});

test('function application with not enough variables should fail', () => {
    var env = new Map<String, source.ZHRL.Value>();
    var lam = new source.ZHRL.LamC(["a", "b"], 3);
    var app = new source.ZHRL.AppC(lam, []);
    expect(() => {source.ZHRL.interp(app, env)}).toThrow("ZHRL: Function called with wrong arity");
})

test('very simple function application should work', () => {
    var prog = [["lam", ["x"], "x"], 30];
    expect(source.ZHRL.topInterp(prog)).toEqual("30");
});

test('serialize should return string version of ZHRL value', () => {
    expect(source.ZHRL.serialize(1)).toEqual("1");
});

test('test add builtin', () => {
    var add = source.ZHRL.globalEnv.get("+");
    if (!source.ZHRL.isBuiltin(add)) {
        throw new Error("Add should be a builtin");
    }
    expect(add.operator([2, 3])).toEqual(5);
});

test('test less than equal builtin', () => {
    var lte = source.ZHRL.globalEnv.get("<=");
    if (!source.ZHRL.isBuiltin(lte)) {
        throw new Error("less than equal should be a builtin");
    }
    expect(lte.operator([2, 3])).toEqual(true);
});

test('test less than equal builtin', () => {
    var eq = source.ZHRL.globalEnv.get("equal?");
    if (!source.ZHRL.isBuiltin(eq)) {
        throw new Error("equal? should be a builtin");
    }
    expect(eq.operator([2, 2])).toEqual(true);
});

test('test true builtin', () => {
    var tru = source.ZHRL.globalEnv.get("true");
    if (!source.ZHRL.isBuiltin(tru)) {
        throw new Error("true should be a builtin");
    }
    expect(tru.operator([true])).toEqual(true);
});

test('test false builtin', () => {
    var fals = source.ZHRL.globalEnv.get("false");
    if (!source.ZHRL.isBuiltin(fals)) {
        throw new Error("false should be a builtin");
    }
    expect(fals.operator([false])).toEqual(false);
});

test('test less than equal builtin again', () => {
    var lte = source.ZHRL.globalEnv.get("<=");
    if (!source.ZHRL.isBuiltin(lte)) {
        throw new Error("less than equal should be a builtin");
    }
    expect(lte.operator([3, 2])).toEqual(false);
});