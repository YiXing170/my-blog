// 参数报错 返回值不报错  但开启双向协变后 都不报错
type Func = (a: string) => void

const func: Func = (a: 'hello') => undefined

// U extends U 是为了触发联合类型的 distributive 的性质，让每个类型单独传入做计算，最后合并。

type UnionToIntersectionCopy<U> =
  // 这里理解为                              extends左边就是子类型   根据逆变规则 子类型的参数类型就是父类型参数类型的 父类型
  (U extends U ? (x: U) => unknown : never) extends (x: infer R) => unknown
    ? R
    : never

type test = any extends number ? 1 : 2

// 非父子类型之间不会发生型变，只要类型不一样就会报错：

// ts 里只要结构上是一致的，那么就可以确定父子关系，这种叫做结构类型系统（structual type）。
