// TypeScript 对联合类型在条件类型中使用时的特殊处理：会把联合类型的每一个元素单独传入做类型计算，最后合并。

type Union = 'a' | 'b' | 'c'

type UppercaseA<Item extends string> = Item extends 'a' ? Uppercase<Item> : Item

type Str = `--${Union}`

type CamelcaseUnion<Item extends string> =
  Item extends `${infer Left}_${infer Right}${infer Rest}`
    ? `${Left}${Uppercase<Right>}${CamelcaseUnion<Rest>}`
    : Item

type BEM<
  Block extends string,
  Element extends string[],
  Modifiers extends string[]
> = `${Block}__${Element[number]}--${Modifiers[number]}`

type Combination<A extends string, B extends string> =
  | A
  | B
  | `${A}${B}`
  | `${B}${A}`

type AllCombinations<A extends string, B extends string = A> = A extends A
  ? Combination<A, AllCombinations<Exclude<B, A>>>
  : never

type AllCombinationsRes = AllCombinations<'A' | 'B' | 'C'>

// A extends A 不是没意义，意义是取出联合类型中的单个类型放入 A

// A extends A 才是分布式条件类型， [A] extends [A] 就不是了，只有左边是单独的类型参数才可以。
