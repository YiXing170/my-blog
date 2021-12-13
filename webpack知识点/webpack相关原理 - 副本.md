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
    // Execute the module function  执行模块函数 模块内的this指向module.export
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

+ __webpack_require__.d 方法是为了实现ESM的规范：导出不是值的复制，而是共享的引用。使用时exports.name，会触发getter返回name的当前值，即始终指向name所在的地址

+ import一个commonjs模块会是什么情况呢，反过来又会如何呢？

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

  简单说就是做了兼容处理，当引入的是es模块时导出module['default']，否则导出module

下面说说webpack中是如何实现模块动态加载的，实现动态加载的方式有两种：`import`和`require.ensure`

```javascript
// index.js
'use strict';
import(/* webpackChunkName: "foo" */ './foo').then(foo => {
    console.log(foo());
})
import(/* webpackChunkName: "bar" */ './bar').then(bar => {
    console.log(bar());
})

// foo.js
'use strict';
exports.foo = function () {
    return 2;
}

// bar.js
'use strict';
exports.bar = function () {
    return 1;
}
```

编译后的代码，整体跟前两篇文章中使用commonjs和es6 module编写的代码编译后的结构差别不大，都是通过IFFE的方式启动代码，然后使用webpack实现的`require`和`exports`实现的模块化。

区别在于使用了`__webpack_require__.e`实现动态加载模块和实现基于promise的模块导入。

```javascript
__webpack_require__.e = function requireEnsure(chunkId) {
    // 1、缓存查找
    var installedChunkData = installedChunks[chunkId];
    if(installedChunkData === 0) {
        return new Promise(function(resolve) { resolve(); });
    }
    if(installedChunkData) {
        return installedChunkData[2];
    }
    // 2、缓存模块
    var promise = new Promise(function(resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
    });
    installedChunkData[2] = promise;
    // 3、加载模块
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.timeout = 120000;
    if (__webpack_require__.nc) {
        script.setAttribute("nonce", __webpack_require__.nc);
    }
    script.src = __webpack_require__.p + "" + ({"0":"foo"}[chunkId]||chunkId) + ".bundle.js";
    // 4、异常处理
    var timeout = setTimeout(onScriptComplete, 120000);
    script.onerror = script.onload = onScriptComplete;
    function onScriptComplete() {
        // avoid mem leaks in IE.
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        var chunk = installedChunks[chunkId];
        if(chunk !== 0) {
            if(chunk) {
                chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
            }
            installedChunks[chunkId] = undefined;
        }
    };
    head.appendChild(script);
    // 5、返回promise
    return promise;
};
```

代码大致逻辑如下：

1. 缓存查找：从缓存`installedChunks`中查找是否有缓存模块，如果缓存标识为0，则表示模块已加载过，直接返回`promise`；如果缓存为数组，表示缓存正在加载中，则返回缓存的`promise`对象
2. 如果没有缓存，则创建一个`promise`，并将`promise`（索引2）和`resolve`（索引0）、`reject`（索引1）缓存为一个数组，数组存储在`installedChunks` 对象中
3. 构建一个script标签，append到head标签中，src指向加载的模块脚本资源，实现动态加载js脚本
4. 添加script标签onload、onerror 事件，如果超时或者模块加载失败，则会调用reject返回模块加载失败异常
5. 最后返回当前模块`promise`，对应于`import()`

当资源加载完成，src指向的模块代码开始执行，那么我们来看一下模块代码的结构

```javascript
webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {
"use strict";
exports.foo = function () {
    return 2;
}
/***/ })
]);
```

可以看到，模块代码不仅被包在一个函数中（用来模拟模块作用域），外层还被当做参数传入`webpackJsonp`中。那么这个`webpackJsonp`函数的作用是什么呢？

其实这里的`webpackJsonp`类似于jsonp中的callback，作用是作为模块加载和执行完成的回调，从而触发`import`的`resolve`。

具体细看`webpackJsonp`代码来分析：

```javascript
window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
    var moduleId, chunkId, i = 0, resolves = [], result;
    // 1、收集模块resolve
    for(;i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if(installedChunks[chunkId]) {
            resolves.push(installedChunks[chunkId][0]);
        }
        installedChunks[chunkId] = 0;
    }
    // 2、copy模块到modules,所有模块都存在modules里面
    for(moduleId in moreModules) {
        if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
            modules[moduleId] = moreModules[moduleId];
        }
    }
    if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
    // 3、resolve import
    while(resolves.length) {
        resolves.shift()();
    }
};
```

代码大致逻辑如下：

1. 根据`chunkIds`收集对应模块的`resolve`，这里的`chunkIds`为数组是因为`require.ensure`是可以实现异步加载多个模块的，所以需要兼容
2. 把动态模块添加到IFFE的`modules`中，提供其他CMD方案使用模块
3. 直接调用`resolve`，完成整个异步加载

注意`index.js`  被编译成

```javascript
(function(module, exports, __webpack_require__) {
    "use strict";
    __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 1)).then(foo => {
        console.log(foo());
    })
    __webpack_require__.e/* import() */(1).then(__webpack_require__.bind(null, 2)).then(bar => {
        console.log(bar());
    })
})
```

`__webpack_require__.bind(null, 1)`  执行后返回动态模块的导出值 ，传递给下一个then 去执行



##### 编写loader

编写简单的babel-loader

```javascript
// myLoader.js
//这个插件可以获取传入option 
let loaderUtils = require("loader-utils");
//babel/core 有transform可以转代码成为ast抽象语法树
let babel = require("@babel/core");
function loader (source) {
  //source是文件的内容
  let cb = this.async();//添加异步
  //获取options传入进来的参数
  let options = loaderUtils.getOptions(this);
  //将代码按照preset-env的规则转化
  babel.transform(source, {
    ...options,
    presets: ['@babel/preset-env'],
    sourceMap: true,
    filename: this.resourcePath.split('/').pop()
  }, function (err, r) {
    //有时候读取文件可能是异步，所以调用cb等于调用this.callback
    cb(err, r.code, r.map); // 这里需要处理一下source-map
  });
}

module.exports = loader;


// 然后怎样在config文件中使用呢？
// 第1种  配置module.exports.resolveLoader
//...
 module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
 },
 resolveLoader: {
     alias: {
       "babel-loader": './myLoader'
     }
 },
//...

// 第二种   use的时候直接传入loader的绝对路径
 module: {
    rules: [{
      test: /\.js$/,
      use: path.join(__dirname, '/myLoader.js')
    }]
 },   
```

##### 编写plugin

`webpack` 插件由以下组成：

1. 一个 JavaScript 命名函数。
2. 在插件函数的 prototype 上定义一个 `apply` 方法。
3. 指定一个绑定到 webpack 自身的[事件钩子](https://www.webpackjs.com/api/compiler-hooks/)。
4. 处理 webpack 内部实例的特定数据。
5. 功能完成后调用 webpack 提供的回调。

让我们来写一个简单的示例插件，生成一个叫做 `filelist.md` 的新文件；文件内容是所有构建生成的文件的列表。这个插件大概像下面这样：

```javascript
function FileListPlugin(options) {}   // 上面插件组成1

FileListPlugin.prototype.apply = function(compiler) {    // 上面插件组成2
  compiler.plugin('emit', function(compilation, callback) {  // 上面插件组成3  注意事件钩子要去看文档  
    // 在生成文件中，创建一个头部字符串：					// emit为 生成资源到 output 目录之前。		
    var filelist = 'In this build:\n\n';

    // 遍历所有编译过的资源文件，
    // 对于每个文件名称，都添加一行内容。  
    for (var filename in compilation.assets) {   // 上面插件组成4  
      filelist += ('- '+ filename +'\n');		
    }

    // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
    compilation.assets['filelist.md'] = {
      source: function() {
        return filelist;
      },
      size: function() {
        return filelist.length;
      }
    };

    callback();   // 上面插件组成5
  });
};

module.exports = FileListPlugin;
```
