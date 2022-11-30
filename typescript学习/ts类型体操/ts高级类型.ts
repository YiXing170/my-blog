// Parameters 提取函数参数

type ParametersCopy<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never

// ReturnType
type ReturnTypeCopy<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : never

// 构造器参数类型
type ConstructorParametersCopy<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never

// 构造器返回实例类型
type InstanceTypeCopy<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any

// 返回this类型
type ThisParameterTypeCopy<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown

// 去掉函数参数中的this类型
type OmitThisParameterCopy<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T
// 将索引类型中的属性变为可选
type PartialCopy<T> = {
  [P in keyof T]?: T[P]
}
// 把索引类型中的属性变为必选
type RequiredCopy<T> = {
  [P in keyof T]-?: T[P]
}
// 所有属性变为只读
type ReadonlyCopy<T> = {
  readonly [P in keyof T]: T[P]
}

// 获取索引类型的子集  又重新创建了一个索引类型
type PickCopy<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 创建新的索引类型 值为T  如果你开启了 keyOfStringsOnly 的编译选项，它就只是 stirng 了
type RecordCopy<K extends keyof any, T> = {
  [P in K]: T
}
// 当传入的 K 是 string | number | symbol，那么创建的就是有可索引签名的索引类型：

// 从联合类型中去除一部分
type ExcludeCopy<T, U> = T extends U ? never : T

// Extract 取交集

type ExtractCopy<T, U> = T extends U ? T : never

type exm1 = { name: 'jack'; age: 22 }
type exm2 = { name: 'jack' }

// type OmitType<T, K extends keyof T> = {
//   [P in Exclude<keyof T, K>]: T[P]
// }
type OmitType<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type resOmit = OmitType<exm1, keyof exm2>

// 取 Promise 的 ValuType 的高级类型  递归处理
type AwaitedCopy<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F): any }
  ? F extends (value: infer V, ...args: any) => any
    ? AwaitedCopy<V>
    : never
  : T

// 是否为非空
type NonNullableCopy<T> = T extends null | undefined ? never : T

// Uppercase、Lowercase、Capitalize、Uncapitalize
// 这四个类型是分别实现大写、小写、首字母大写、去掉首字母大写的
