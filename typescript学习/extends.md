# typescript中的extends关键字

+ 表示继承/扩展

  ```typescript
  interface name {
    name: string;
  }
  interface person extends name {
    age: number;
  }
  
  const p: person = { name: 'yi', age: 18 };
  ```

+ 表示约束

  ```typescript
  // 希望传入的数组中的每一个对象都有name属性
  function getNames <T extends { name: string }> (entities: T[]) :string[] {
    return entities.map(entity => entity.name)
  }
  
  getNames([{ name: 'yi' }]);
  ```

+ 条件类型     判断：左边的类型是否可以分配给右边，类似三元表达式

  ```typescript
  type A1 = 'x' extends 'x' ? string : number; // string
  type A2 = 'x' | 'y' extends 'x' ? string : number; // number
  
  type P<T> = T extends 'x' ? string : number;
  type A3 = P<'x' | 'y'>  // A3的类型是 string | number   满足两个要点即可适用分配律：第一，参数是泛型类型，第二，代入参数的是联合类型
  
  // 防止条件判断中的分配
    type P<T> = [T] extends ['x'] ? string : number;
    type A1 = P<'x' | 'y'> // number
    type A2 = P<never> // string
  // 在条件判断类型的定义中，将泛型参数使用[]括起来，即可阻断条件判断类型的分配，此时，传入参数T的类型将被当做一个整体，不再分配。
  ```

  

+ 在高级类型中的应用

  + Exclude

    ```typescript
    //定义
    type A = Exclude<'key1' | 'key2', 'key2'> // 'key1'
    
    type Exclude<T, U> = T extends U ? never : T
    ```

  + Extract

    ```typescript
    // 定义
    type Extract<T, U> = T extends U ? T : never
    
    type A = Extract<'key1' | 'key2', 'key1'> // 'key1'
    ```

  + Pick

    ```typescript
    // 高级类型Pick的定义
    type Pick<T, K extends keyof T> = {
        [P in K]: T[P]
    }
     
    interface A {
        name: string;
        age: number;
        sex: number;
    }
     
    type A1 = Pick<A, 'name'|'age'>
    // 报错：类型“"key" | "noSuchKey"”不满足约束“keyof A”
    type A2 = Pick<A, 'name'|'noSuchKey'>
    ```

    

+ keyof与Object.keys略有相似，只是 **keyof 是取 interface 的键**，**而且 keyof 取到键后会保存为联合类型。**

  ```typescript
  interface iUserInfo {
    name: string;
    age: number;
  }
  type keys = keyof iUserInfo; // 'name'|'age' 
  ```

+ **in用于取联合类型的值。主要用于数组和对象的构造 ** **但切记不要用于 interface，否则会出错**

  ```typescript
  type name = 'firstName' | 'lastName';
  type TName = {
    [key in name]: string;
  };
  ```

+ **infer**  **占位符式的关键字**  **作用：** 获取参数，返回值，泛型 的类型

  表示在 extends 条件语句中以占位符出现的用来修饰数据类型的关键字，被修饰的数据类型等用到的时候才能被推断出来

  ```typescript
  interface Customer {
      custname: string
      buymoney: number
  }
  
  //需求：获取custFuncType的参数类型
  type custFuncType = (cust: Customer) => string
  
  //实现：
  type inferType<T> = T extends (parmas: infer P) => any ? P : T
  
  type inferReusltType = inferType<custFuncType>  //Customer类型
  
  
  
  //详解
  type inferType<T> = T extends (parmas: infer P) => any ? P : T
  
  //传递泛型后等于：
  type inferType<custFuncType> = (cust: Customer) => string extends (parmas: infer P) => any ? P : (cust: Customer) => string
  
  //解释：
  //(cust: Customer) => string 的类型是否与 (parmas: infer P) => any 相同， 如果相同，返回P（这个P已经变成了Customer，这就是infer的作用，作   为占位符使用）， 如果不同返回原来的表达式
  //在这个例子中，是相同的，因为any 是任何类型的子类或父类，肯定包括string， 所以返回P，也就是Customer
  
  ```

  

+ 泛型和infer的区别

  **出现位置的不同**

  泛型出现在函数，接口，类中

  infer出现在 extends 后的表达式中

