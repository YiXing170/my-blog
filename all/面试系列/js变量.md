- `var`：

1. `var` 可以重复声明
2. 作用域：全局作用域 和 函数作用域
3. 会进行预解析

- `let`：

1. 统一作用域下不能重复声明
2. 作用域：全局作用域 和 块级作用域 `{}`
3. 不进行预解析

- `let` 和 `var` 比较：

  块级作用域

  > 1. `var` 声明的变量只能是全局或者整个函数块的
  > 2. `let` 允许声明一个在作用域限制在块级的变量、语句或者表达式（块级作用域）

  重复声明

  > `let` 不能重复声明

  提升的问题

  > 1. `let` 存在临时死区（temporal dead zone）
  > 2. let 不会被预解析（hoisting），这条存疑？参考https://zhuanlan.zhihu.com/p/28140450

- `const`：

1. `let` 有的它也有
2. 初始化必须赋值
3. 赋值后不能改动类型