type IsAny<T> = 'dong' extends 'guang' & T ? true : false

type IsEqual2<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T
>() => T extends B ? 1 : 2
  ? true
  : false

type IsNever<T> = [T] extends [never] ? true : false

// 除此以外，any 在条件类型中也比较特殊，如果类型参数为 any，会直接返回 trueType 和 falseType 的合并：
type TestAny<T> = T extends number ? 1 : 2
//  传入any 返回 1|2

type IsTuple<T> = T extends readonly [...params: infer Eles]
  ? NotEqual<Eles['length'], number>
  : false

type NotEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <
  T
>() => T extends B ? 1 : 2
  ? false
  : true

type UnionToIntersection<U> = (
  U extends U ? (x: U) => unknown : never
) extends (x: infer R) => unknown
  ? R
  : never

type GetOptional<Obj extends Record<string, any>> = {
  [Key in keyof Obj as {} extends Pick<Obj, Key> ? Key : never]: Obj[Key]
}
// 把可选过滤掉
type isRequired<Key extends keyof Obj, Obj> = {} extends Pick<Obj, Key>
  ? never
  : Key

type GetRequired<Obj extends Record<string, any>> = {
  [Key in keyof Obj as isRequired<Key, Obj>]: Obj[Key]
}

// 过滤掉索引签名

type RemoveIndexSignature<Obj extends Record<string, any>> = {
  [Key in keyof Obj as Key extends `${infer Str}` ? Str : never]: Obj[Key]
}

// 过滤出class public
type ClassPublicProps<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: Obj[Key]
}

// TypeScript 默认推导出来的类型并不是字面量类型。
const obj = { a: 1, b: 2 }

// 类型编程很多时候是需要推导出字面量类型的，这时候就需要用 as const：
const obj2 = { a: 1, b: 2 } as const

// 但是加上 as const 之后推导出来的类型是带有 readonly 修饰的，所以再通过模式匹配提取类型的时候也要加上 readonly 的修饰才行。
