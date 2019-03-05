export namespace ZHRL {

    abstract class NodeC {
        abstract interp(env : Env) : Value;
    }

    // If Contains
    // - a condition
    // - a body expression
    // - an else expression
    export class IfC extends NodeC {
        condition : ExprC;
        body : ExprC;
        else : ExprC;
        constructor(cond : ExprC, bo : ExprC, els : ExprC) {
            super();
            this.condition = cond;
            this.body = bo;
            this.else = els;
        }

        interp(env : Env) : Value {
            var conditionEvaluation = interp(this.condition, env);
            if (conditionEvaluation === true) {
                return interp(this.body, env);
            } else if (conditionEvaluation === false) {
                return interp(this.else, env);
            } else {
                // If they returned the wrong type in the condition
                throw new Error("ZHRL: Wrong type returned in if condition " + conditionEvaluation);
            }
        }
    }

    // An Id is a wrapped symbol
    export class IdC extends NodeC {
        symbol : string;
        constructor(sym : string) {
            super();
            this.symbol = sym;
        }

        interp(env : Env) : Value {
            if (env.has(this.symbol)) {
                return env.get(this.symbol);
            } else {
                throw new Error("ZHRL: Unbound identifier " + this.symbol);
            }
        }
    }
    export function isIdC(arg : any): arg is IdC {
        return typeof arg === "object" && arg.constructor.name === "IdC";
    };

    // A lambda expression has
    // - a list of parameters to which arguments should be bound
    // - a body
    export class LamC extends NodeC {
        parameters : string[];
        body : ExprC;
        constructor(par : string[], bo : ExprC) {
            super();
            this.parameters = par;
            this.body = bo;
        }

        interp(env : Env) : Value {
            return new CloV(env, this);
        }
    }

    // Function application has
    // - an operator (the function to be called)
    // - a list of arguments to bind
    export class AppC extends NodeC {
        operator : ExprC;
        arguments : ExprC[];
        constructor(op : ExprC, args: ExprC[]){
            super();
            this.operator = op;
            this.arguments = args;
        }

        interp(env : Env) : Value {
            var func = interp(this.operator, env);
            if (!isCloV(func)){
                throw new Error("ZHRL: Cannot execute a function that is not a closure. Got " + func + " instead");
            }
            var curriedInterp = (x : ExprC) => interp(x, env); 
            var args = this.arguments.map(curriedInterp);
            if (args.length !== func.args.length) {
                throw new Error("ZHRL: Function called with wrong arity");
            }

            var newEnv = copyEnv(env);
            for (var i = 0; i < args.length; i++) {
                newEnv.set(func.args[i], args[i]);
            }
            return interp(func.body, newEnv);
        }
    }

    export type ExprC = number | string | boolean | IfC | IdC | LamC | AppC

    export type Env = Map<String, Value>

    export var emptyEnv = new Map<String, Value>();
    export var globalEnv = new Map<String, Value>();

    export function copyEnv(env : Env) : Env {
        return new Map(env);
    }

    export class CloV {
        env : Env;
        args : string[];
        body : ExprC;
        constructor(environ : Env, lam : LamC) {
            this.env = environ;
            this.args = lam.parameters;
            this.body = lam.body;
        }
    }
    export function isCloV(val : any) : val is CloV {
        return typeof val === "object" && val.constructor.name === "CloV";
    }



    export type Builtin = (args : Value[]) => Value
    export type Value = number | string | boolean | Builtin | CloV

    export interface SexpArray extends Array<Sexp> {}
    export type Sexp = SexpArray | number | boolean | string

    export let input : Sexp = [["lam", ["x", "y"], ["+", "x", "y"]], 3, 4];


    // Typescript type asserter
    export function isSexpArray(expr : Sexp): expr is SexpArray {
        return typeof expr === "object" && expr.length !== undefined;
    }

    // This is a simple type coercion. Will throw an error if the user gave bad input
    export function assertStringArray(expr : SexpArray) : string[] {
        var result : string[] = [];
        for (var i = 0; i < expr.length; i++) {
            var entry : Sexp = expr[i];
            if (!(typeof entry === "string")) {
                throw new Error("ZHRL: expected " + entry + " to be an identifier");
            }
            result.push(entry);
        }
        return result;
    }

    // Parses a given "S-expression" into an ExprC tree
    export function parse(expr : Sexp) : ExprC {
        if (isSexpArray(expr)) {
            if (expr.length === 0) {
                throw new Error("ZHRL: Empty list is not a valid ZHRL expression");
            }

            // Try to parse the reserved forms
            var first : Sexp = expr[0];
            if (typeof first === "string") {
                // If it is a string, there is a chance it is a lambda, if, or var expression
                if (first === "if") {
                    if (expr.length != 4) {
                        throw new Error("ZHRL: If statment expects a condition, main block, and else block");
                    }
                    return new IfC(parse(expr[1]), parse(expr[2]), parse(expr[3]));
                } else if (first === "lam") {
                    if (expr.length != 3) {
                        throw "ZHRL: Lamda expects a list of symbols and a body";
                    }
                    var args : Sexp = expr[1];
                    if (isSexpArray(args)) {
                        return new LamC(assertStringArray(args), parse(expr[2]));
                    }
                    throw new Error("ZHRL: Lambda expects the second part to be a list of arguments");
                } else if (first == "var") {
                    // Natalie 
                    var secound : Sexp = expr[1];
                    var third : Sexp = expr[2];
                    if(secound == third){
                        throw "ZHRL: Duplicate Variable";
                    }
                    else if {

                    }
                    // stub, handle ths later
                    return false;
                }
            }
            return new AppC(parse(first), expr.slice(1).map(parse));
        }
        // handle all of the primitives
        if (typeof expr === "string"){
            return new IdC(expr);
        } else if (typeof expr == "boolean") {
            return expr;
        } else if (typeof expr == "number"){
            return expr;
        }
    }

    // Interp - handles interp on primitives and dispatches to nodes
    export function interp(node : ExprC, env : Env) : Value {
        
        // Handle the primitives
        if (typeof node === "boolean"){
            return node;
        } else if (typeof node === "number") {
            return node;
        } else if (node instanceof NodeC) {
            // Dispatch to the node object if it is not a primitive
            return node.interp(env);
        }
        return ""
    }

    export function topInterp(input : Sexp) : Value {
        return interp(parse(input), globalEnv);
    }

}