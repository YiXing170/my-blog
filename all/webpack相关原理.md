##### webpack中的模块

```javascript
//es.js
export const age = 18;
export const name = "前端";
export default "ESModule";

//common.js
exports.sayHello = (name, desc) => {
  console.log('前端真好玩');
}

//index.js  入口文件
import _, { name } from './es';
let co = require('./common');
co.sayHello(name);
export default _;
```

打包出来的代码类似

```javascript
(function (modules) { // webpackBootstrap
  //...  省略了相关代码
  // Load entry module and return exports
  return __webpack_require__(__webpack_require__.s = 36);  // 加载入口模块
})({
  "./src/index.js":
    (function (module, __webpack_exports__, __webpack_require__) {/*模块内容代码*/ }),
  "./src/es.js":
    (function (module, __webpack_exports__, __webpack_require__) {/*模块内容代码*/ }),
  "./src/common.js":
    (function (module, exports) {/*模块内容*/ })
});
//# sourceMappingURL=main.6196cc781843c8696cda.js.map
```

上面的就是webpack打包出来的代码模型，几个关键的点：

+ 整体是IIFE，参数是包含所有模块的modules对象，key为路径，value为包含模块内容的函数，webpack用函数作用域来hack模块化的效果。
+ IIFE执行时,会从入口开始执行，并返回要导出的数据

所以关键点就是弄清楚__webpack_require__， __webpack_exports__， **module**，**exports** 等到底是什么东西 

先看__webpack_require__：

```javascript
var installedModules = {};  //缓存对象
  // The require function
  function __webpack_require__ (moduleId) {
    // Check if module is in cache  检查缓存
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)  创建模块并放置到缓存
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    // Execute the module function  执行模块函数
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // Flag the module as loaded  标示模块已经加载完毕
    module.l = true;
    // Return the exports of the module  //得到模块的导出
    return module.exports;  
  }
  
```

上面最关键的一步就是执行模块函数，下面举例说明：

```javascript
// 以加载common.js为例

"./src/common.js":
    /*! no static exports found */
    /*! all exports used */
    (function (module, exports) {
      exports.sayHello = function (name, desc) {  // 将sayHello方法存到 {i：moduleId，exports：{sayHello}}
        console.log("\u6B22\u8FCE\u5173\u6CE8[\u524D\u7AEF\u4E8B\u52A1\u6240]~");
      };
    }),
```

当执行 __ _webpack_require_ _ _  (相当于代码里的require)的时候 ，最终拿到 module.exports,里面存有sayHello，下面的代码才得以执行

> let co = require('./common');
> co.sayHello(name);

其实这就是webpack对commonjs的实现

下面说一说es module的实现

```javascript
"./src/es.js":
    /*! exports provided: age, name, default */
    /*! exports used: default, name */
    (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      /* unused harmony export age */
      /* harmony export (binding) */
      // 在__webpack_exports__上定义一个只读的属性b，属性值为 name
      __webpack_require__.d(__webpack_exports__, "b", function () { return name; });
      var age = 18;
      var name = "前端事务所";
      /* harmony default export */
      __webpack_exports__["a"] = ("ESModule");  // export default导出
    }),
```

最后导出的值都定义在 module.exports上了，下面是打包后 使用import模块中的变量

```javascript
"./src/index.js":
    /*! exports provided: default */
    /*! all exports used */
    (function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);  // 给__webpack_exports__打上标记，为es模块
      /* harmony import */   // 引用es模块
      var _es__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./es */ "./src/es.js");  
      var co = __webpack_require__(/*! ./common */ "./src/common.js"); // import co from './common';
      co.sayHello(_es__WEBPACK_IMPORTED_MODULE_0__[/* name */ "b"]);  //使用模块中的变量
      /* harmony default export */
      __webpack_exports__["default"] = (_es__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]);
    }),
```

下面是几个值得注意的点

+ __webpack_require__.d 方法是为了实现ESM的规范：导出不是值的复制，而是共享的引用。使用时exports.name，会触发getter返回name的当前值

+ es模块对commonjs模块的导入会是什么情况呢，反过来又会如何呢？

  答案是没有影响，webpack内部做了处理

  ```javascript
  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function(module) {
      var getter = module && module.__esModule ?
          function getDefault() { return module['default']; } :
          function getModuleExports() { return module; };
      __webpack_require__.d(getter, 'a', getter);
      return getter;
  };
  ```

  简单说就是做了兼容处理，当是es模块时导出module['default']，否则导出module

下面说说webpack中是如何实现模块动态加载的，实现动态加载的方式有两种：`import`和`require.ensure`

