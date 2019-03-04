
interface ASTNode {

}

type Env = Map<String, Value>

type Builtin = ([Value]) => Value
type Value = number | string | boolean | Builtin 