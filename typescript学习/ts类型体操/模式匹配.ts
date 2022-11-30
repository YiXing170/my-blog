// 提取  Promise 类型的value

type p = Promise<'liang'>


type GetValueType<T> = T extends Promise<infer V> ? V : never

type v = GetValueType<p>

//数组类型想提取第一个元素的类型怎么做呢？

type arr = [1, 2, 3]

type GetFirstType<T extends unknown[]> = T extends [infer V, ...unknown[]] ? V : never


type first = GetFirstType<arr>

// 同理获取最后一个
type GetLastType<T extends unknown[]> = T extends [...unknown[], infer V] ? V : never

type last = GetLastType<arr>


//也可以取剩余的数组，比如取去掉了最后一个元素的数组
type PopArr<T extends unknown[]> = T extends [] ?
  [] : T extends [... infer Rest, unknown] ? Rest : never
type pop = PopArr<arr>

// 反之可得ShiftArr 实现

type ShiftArr<T extends unknown[]> = T extends [] ?
  [] : T extends [unknown, ... infer Rest] ? Rest : never



// 字符串类型也同样可以做模式匹配，匹配一个模式字符串，把需要提取的部分放到 infer 声明的局部变量里。

type StartWith<Str extends string, Prefix extends string> = Str extends `${Prefix}${string}` ? true : false
type flag = StartWith<'1234', '12'>


// replace 实现

type Replace<Str extends string, From extends string, To extends string> = Str extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Suffix}` : Str
type ReplaceAll<Str extends string, From extends string, To extends string> = Str extends `${infer Prefix}${From}${infer Suffix}` ? ReplaceAll<`${Prefix}${To}${Suffix}`, From, To> : Str
type exStr = 'aabbccaaffggg'
type exRes = ReplaceAll<exStr, 'aa', 'dd'>

// trim实现

type TrimLeft<T extends string> = T extends `${' ' | '\t' | '\n'}${infer Rest}` ? TrimLeft<Rest> : T
type TrimRight<T extends string> = T extends `${infer Rest}${' ' | '\t' | '\n'}` ? TrimLeft<Rest> : T
type Trim<T extends string> = TrimRight<TrimLeft<T>>






// 函数同样也可以做类型匹配，比如提取参数、返回值的类型。

// 提取参数
type GetParamsType<T extends Function> = T extends (...args: infer Params) => unknown ? Params : never
type func = (name: string, age: number) => string
type pRes = GetParamsType<func>

// 返回值的类型
type GetReturnType<T extends Function> = T extends (...args: any[]) => infer ReturnType ? ReturnType : never
type rRes = GetReturnType<func>

//  获取this

class Dong {
  name: string;

  constructor() {
    this.name = "dong";
  }
  // 可以在方法声明时指定 this 的类型：
  hello(this: Dong) {
    return 'hello, I\'m ' + this.name;
  }
  hello1() {
    return 'hello, I\'m ' + this.name;
  }
}

const dong = new Dong()
dong.hello()
// 如果没有报错，说明没开启 strictBindCallApply 的编译选项，这个是控制是否按照原函数的类型来检查 bind、call、apply
dong.hello.call({ xxx: 1 })

type GetThisParameterType<T> = T extends (this: infer ThisType, ...arg1: any[]) => any ? ThisType : never
type GetThisParameterTypeRes = GetThisParameterType<typeof dong.hello1>



// 构造器和函数的区别是，构造器是用于创建对象的，所以可以被 new。

// 同样，我们也可以通过模式匹配提取构造器的参数和返回值的类型：

interface Person {
  name: string;
}

interface PersonConstructor {
  new(name: string): Person;
}

type GetInstanceType<ConstructorType extends new (...args: any) => any> = ConstructorType extends new (...args: any) => infer InstanceType ? InstanceType : never

type GetInstanceTypeRes = GetInstanceType<PersonConstructor>

type GetConstructorParameters<ConstructorType extends new (...args: any) => any> = ConstructorType extends new (...args: infer Params) => any ? Params : never

type GetConstructorParametersRes = GetConstructorParameters<PersonConstructor>

// 索引类型

type GetRefProps<Props> =
  'ref' extends keyof Props
  ? Props extends { ref?: infer Value | undefined }
  ? Value
  : never
  : never;