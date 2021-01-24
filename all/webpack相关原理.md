##### webpack中的模块

```javascript
//es.js
export const age = 18;
export const name = "前端";
export default "ESModule";

//common.js
exports.sayHello = (name, desc) => {
  console.log('Hello,'+name);
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
  return __webpack_require__(__webpack_require__.s = 36);
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

+ 整体是IIFE，参数是包含所有模块的modules对象，key为路径，value为包含模块内容的函数
+ IIFE执行时,会从入口开始执行，并返回要导出的数据

所以关键点就是弄清楚__webpack_require__， __webpack_exports__， **module**，**exports** 等到底是什么东西 



