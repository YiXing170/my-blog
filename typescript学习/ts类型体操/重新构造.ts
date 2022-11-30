type tuple = [1, 2, 3];

type Push<Arr extends unknown[], Ele> = [...Arr, Ele]
type pushRes = Push<tuple, 4>

type Unshift<Arr extends unknown[], Ele> = [Ele, ...Arr]


type tuple1 = [1, 2];
type tuple2 = ['guang', 'dong'];
type Zip<one extends [unknown, unknown], other extends [unknown, unknown]> =
  one extends [infer oneFirst, infer oneSecond] ?
  other extends [infer otherFirst, infer otherSecond] ? [[oneFirst, otherFirst], [oneSecond, otherSecond]] : []
  : []

type zipRes = Zip<tuple1, tuple2>


type ZipAll<one extends unknown[], other extends unknown[]> =
  one extends [infer oneFirst, ...infer oneRest] ?
  other extends [infer otherFirst, ...infer otherRest] ? [[oneFirst, otherFirst], ...ZipAll<oneRest, otherRest>] : []
  : []

type zipAllRes = ZipAll<tuple1, tuple2>


// 首字符大写
type CapitalizeStr<Str extends string> =
  Str extends `${infer First}${infer Rest}` ?
  `${Uppercase<First>}${Rest}` : Str



type CamelCase<Str extends string> =
  Str extends `${infer Left}_${infer Right}${infer Rest}`
  ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
  : Str;

type DropSubStr<Str extends string, SubStr extends string> =
  Str extends `${infer Prefix}${SubStr}${infer Suffix}`
  ? DropSubStr<`${Prefix}${Suffix}`, SubStr> : Str;




// 函数

type AppendArgument<Func extends Function, Arg> =
  Func extends (...args: infer Args) => infer ReturnType ?
  (...args: [...Args, Arg]) => ReturnType : never

type AppendArgumentRes = AppendArgument<(name: string) => string, number>




type UppercaseKey<Obj extends object> = {
  [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
}
// type res =UppercaseKey<{1:2}>

// TypeScript 提供了内置的高级类型 Record 来创建索引类型


type RecordCopy<K extends string | number | symbol, T> = { [P in K]: T; }

// type UppercaseKey<Obj extends Record<string, any>> = {
//   [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key]
// }


type ToPartial<T> = {
  [Key in keyof T]?: T[Key]
}
type ToPartialRes = ToPartial<{ name: 'jack' }>

// 去掉只读
type ToMutable<T> = {
  -readonly [Key in keyof T]: T[Key]
}

// 过滤索引类型
type FilterByValueType<
  Obj extends Record<string, any>,
  ValueType
> = {
    [Key in keyof Obj as Obj[Key] extends ValueType ? Key : never]: Obj[Key]
  }