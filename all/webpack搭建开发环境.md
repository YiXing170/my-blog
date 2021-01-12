##### 为什么写这篇文章？

一直专注于业务开发，也没时间好好研究webpack，不说源码级的探究，起码要知道怎么去使用webpack这个工具吧。

##### 怎样去写这篇文章?

目的是达成一个完整的react开发环境,中间可能包含一些零碎的知识点,尽量减少记忆的成本吧,因为只想着去记住它,反而遗忘的很快.

##### 希望写完文章达到的水平

能够脱口而出，搭建环境的相关步骤及关键原理

-------

前一篇文章已经介绍了相关的基础概念，所以也知道webpack的关键就是在配置文件，直接基于基础配置开始扩展

```javascript
const path = require('path');

module.exports = {
  mode: "production", // "production" | "development" | "none"  

  entry: "./src/index.js",  //不设置时默认为 /src/index.js
 
  output: {
    path: path.resolve(__dirname, "dist"), // string
    filename: "bundle.js", // string  默认为main.js
  },
  
  module: {    // 为什么叫模块,在node中不同的文件就是不同的模块，处理模块就是处理文件啦
    rules: []
  },
  
  plugins: [
  ]
}
```



+ ##### babel

  受制于不同浏览器环境，有些高级的js语法可能无法生效，为了兼容这些高级写法

+ ##### css

+ ##### 图片和字体