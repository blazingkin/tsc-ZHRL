export namespace ZHRL {
    // If Contains
    // - a condition
    // - a body expression
    // - an else expression
    export class IfC {
        condition : ExprC;
        body : ExprC;
        else : ExprC;
        constructor(cond : ExprC, bo : ExprC, els : ExprC) {
            this.condition = cond;
            this.body = bo;
            this.else = els;
        }
    }

    // An Id is a wrapped symbol
    export class IdC {
        symbol : string;
        constructor(sym : string) {
            this.symbol = sym;
        }
    }

    // A lambda expression has
    // - a list of parameters to which arguments should be bound
    // - a body
    export class LamC {
        parameters : string[];
        body : ExprC;
        constructor(par : string[], bo : ExprC) {
            this.parameters = par;
            this.body = bo;
        }
    }

    // Function application has
    // - an operator (the function to be called)
    // - a list of arguments to bind
    export class AppC {
        operator : ExprC;
        arguments : ExprC[];
        constructor(op : ExprC, args: ExprC[]){
            this.operator = op;
            this.arguments = args;
        }
    }

    export type ExprC = Value | IfC | IdC | LamC | AppC

    export type Env = Map<String, Value>

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


    export type Builtin = (args : Value[]) => Value
    export type Value = number | string | boolean | Builtin | CloV

    export interface SexpArray extends Array<Sexp> {}
    export type Sexp = SexpArray | number | boolean | string

    export let input : Sexp = [["lam", ["x", "y"], ["+", "x", "y"]], 3, 4];


    export function isSexpArray(expr : Sexp): expr is SexpArray {
        return typeof expr === "object" && expr.length !== undefined;
    }

    export function assertStringArray(expr : SexpArray) : string[] {
        var result : string[] = [];
        for (var i = 0; i < expr.length; i++) {
            var entry : Sexp = expr[i];
            if (!(typeof entry === "string")) {
                throw "ZHRL: expected " + entry + " to be an identifier";
            }
            result.push(entry);
        }
        return result;
    }

    export function parse(expr : Sexp) : ExprC {
        if (isSexpArray(expr)) {
            if (expr.length === 0) {
                throw "ZHRL: Empty list is not a valid ZHRL expression";
            }

            // Try to parse the reserved forms
            var first : Sexp = expr[0];
            if (typeof first === "string") {
                // If it is a string, there is a chance it is a lambda, if, or var expression
                if (first === "if") {
                    if (expr.length != 4) {
                        throw "ZHRL: If statment expects a condition, main block, and else block";
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
                    throw "ZHRL: Lambda expects the second part to be a list of arguments";
                } else if (first == "var") {
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

    console.log(parse(input));
}