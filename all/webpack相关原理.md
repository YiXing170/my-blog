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

+ __webpack_require__.d 方法是为了实现ESM的规范：导出不是值的复制，而是共享的引用。使用时exports.name，会触发getter返回name的当前值

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
2. 如果没有缓存，则创建一个`promise`，并将`promise`和`resolve`、`reject`缓存在`installedChunks`中
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



##### webpack处理流程

关心如下几点：

1. webpack 的编译过程主要有哪些阶段？（生命周期）
2. webpack 是如何 从 entry 开始解析出整个依赖树的？
3. loaders 是在何时被调用的？
4. 最终是如何知道要生成几个文件，以及每个文件的内容的？ 而其他一些不重要的问题我们尽量忽略，比如如何解析配置，如何处理错误，HASH 规则等。等看完主线流程后再回头单独看这些点。

webpack 整体上是一个插件的架构，绝大多数功能都是通过插件实现的。 这里有一点比较容易让人迷惑，webpack 的插件有一个apply方法，他是在webpack的生命周期上再注册一些回调函数。所以插件有两个阶段：

- 注册阶段，每个插件会在自己需要的生命周期上注册自己的回调
- 编译阶段，webpack会把编译过程分为很多个生命周期，在编译启动后，会通过 `applyPlugins(name)` 各个生命周期中调用对应的回调函数。

工作流程：

![11](https://gitee.com/yijili/diving-into-webpack/raw/master/images/pipe-line.png)

我们从 `bin/webpack.js` 开始，假设我们有一个 `main.js` 作为入口文件。

**bin/webpack.js** 注意区分有两个 `webpack.js`，其中 `bin/webpack.js` 是处理命令行相关的参数的，也是我们通过命令行直接启动的入口，而 `lib/webpack.js` 是webpack的逻辑入口。为什么有两个呢？因为webpack既可以当做 命令行工具用，也可以在node中调用。下面如果没有特别标注的都是指 `lib` 目录下的文件

这里面会先调用 `yargs` 处理命令行传入的参数， 然后会调用 new Webpack()

**webpack.js**

`new Webpack` 的时候会创建一个 `compiler` 并且会根据我们的配置把插件都注册好

```javascript
function webpack(options, callback) {
    // 参数 options 就是我们的配置，当然是经过一些处理的
    // 省略 validate 和 multiCompiler 处理代码

        compiler = new Compiler(); 
        compiler.context = options.context;
        compiler.options = options;
        new NodeEnvironmentPlugin().apply(compiler);
        if(options.plugins && Array.isArray(options.plugins)) {
            compiler.apply.apply(compiler, options.plugins);// 这里是我们配置的插件，会注册一些回调
        }
        compiler.applyPlugins("environment"); // applyPlugins 就是调用由插件注册在对应名字的生命周期上的回调函数，这里就是处理 environment 相关的
        compiler.applyPlugins("after-environment");
        compiler.options = new WebpackOptionsApply().process(options, compiler); // 根据我们的配置，会注册对应的内部插件

    // 省略 callback
    return compiler;
}
```

`compiler.run` 方法会启动编译，然后在不同的生命周期调用对应的插件（的回调函数），主要有这么几个生命周期：

1. before-run
2. run
3. before-compile
4. compile
5. this-compilation
6. compilation 这里进行一些代码编译的准备工作
7. make 这里进行代码编译
8. after-compile 这里会根据编译结果 合并出我们最终生成的文件名和文件内容。

下面我们从 entry 开始，看看对entry的处理流程：

`WebpackOptionsApply.js` 这个文件中注册一个 `EntryOptionsPlugin` 插件

```
compiler.apply(new EntryOptionPlugin());
compiler.applyPluginsBailResult("entry-option", options.context, options.entry);
```

然后 `EntryOptionPlugin` 又会调用 `SingleEntryPlugin`，进入到这里：

```
 apply(compiler) {
        compiler.plugin("compilation", (compilation, params) => {
            const normalModuleFactory = params.normalModuleFactory;

            compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
        });

        compiler.plugin("make", (compilation, callback) => {
            const dep = SingleEntryPlugin.createDependency(this.entry, this.name);
            compilation.addEntry(this.context, dep, this.name, callback);
        });
    }
   static createDependency(entry, name) {
        const dep = new SingleEntryDependency(entry);
        dep.loc = name;
        return dep;
    }
```

在 compilation 阶段会记录好依赖的工厂类，然后在 `make` 阶段的时候会创建一个 `SingleEntryPlugin` 实例，然后调用 `compilation.addEntry` 方法。

`compilation` 是一个编译对象，他会存储编译一个 `entry` 的所有信息，包括他的依赖，对应的配置等。一般我们会有两个 `compilation` 对象，一个处理我们配置的 `entry` （entry 中有多个 `chunk` 也是同一个 `compilation` 处理的，不过他会分别处理），因为 `index.html` 的编译也是独立进行的。

`addEntry` 会调用 `_addModuleChain` 方法，最终经过几次调用后会进入到 `NormalModule.js` 中的 `build` 方法。

因为 `build` 方法会先调用 `doBuild` 那么我们先看看 `doBuild` 是做什么的：

```javascript
// 其实很容易看出来，doBuild 方法就是调用了相应的 `loaders` ，把我们的模块转成标准的JS模块，无论这个模块是JS、CSS还是图片。也就是说，我们在webpack配置文件中配置的loaders，就是在这里进行调用的。
// 这里以我们直接通过 `babel-loader` 来编译 `main.js` 为例，那么这个函数就是调用 `babel-loader` 来编译 `main.js` 的源码，并返回编译后的结果对象 result
// result 是一个数组，数组的第一项就是编译后的代码，还记得前面讲babel-loader 的实现原理么，这个result 就是我们的 babel-loader 返回的结果
// 不止entry文件会在这里调用loader，它依赖的任何一个模块都会在这里调用，比如css模块，就会在这里调用对应的css-loader和style-loader把它转换成JS对象
doBuild(options, compilation, resolver, fs, callback) {
        this.cacheable = false;
        const loaderContext = this.createLoaderContext(resolver, options, compilation, fs);

        runLoaders({
            resource: this.resource,  // 假设这里是 /xxx/main.js
            loaders: this.loaders, // 这里一般是 `
            context: loaderContext,
            readResource: fs.readFile.bind(fs)
        }, (err, result) => {
            if(result) {
                this.cacheable = result.cacheable;
                this.fileDependencies = result.fileDependencies;
                this.contextDependencies = result.contextDependencies;
            }

            const resourceBuffer = result.resourceBuffer;
            const source = result.result[0]; // 这里就是 babel-loader 编译后的代码
            const sourceMap = result.result[1];

            // this._source 是一个 对象，有name和value两个字段，name就是我们的文件路径，value就是 编译后的JS代码
            this._source = this.createSource(asString(source), resourceBuffer, sourceMap);
            return callback();
        });
    }
```

经过 `doBuild` 之后，我们的任何模块都被转成了标准的JS模块，那么下面我们就可以编译JS了。

```
build(options, compilation, resolver, fs, callback) {
        // 一些变量初始化 省略

        return this.doBuild(options, compilation, resolver, fs, (err) => {
            // 省略一些不重要的代码
           // 源码经过loader编译已经成为标准的JS代码，下一步就是调用 parser.parse 对JS代码进行语法解析
                this.parser.parse(this._source.source(), {
                    current: this,
                    module: this,
                    compilation: compilation,
                    options: options
                });
                callback();
        });
    }
```

那么我们来看看 `parser.parse` 的代码：

```javascript
parse(source, initialState) {
        let ast = acorn.parse(source); // 简化了代码，这里的一大段其实就是这一句。调用 acorn 对JS进行语法解析，acorn 就是一个JS的 parser
        // 省略一些代码
        if(this.applyPluginsBailResult("program", ast, comments) === undefined) {
            this.prewalkStatements(ast.body); 
            this.walkStatements(ast.body);
        }
        return state;
    }
```

显然如果我们有 `import a from 'a.js'` 这样的语句，那么经过 babel-loader 之后会变成 `var a = require('./a.js')` ，而对这一句的处理就在 `walkStatements`中，这里经过了几次跳转，最终会发现进入了 `walkVariableDeclarators` 方法，因为我们这是声明了一个 `a` 变量。那么这个方法的主要内容如下：

```
walkVariableDeclarators(declarators) {
        declarators.forEach(declarator => {
            switch(declarator.type) {
                case "VariableDeclarator":
                    {
                        // 省略
                            this.walkPattern(declarator.id); // 这里就是我们的变量名， `a` 
                            if(declarator.init)
                                this.walkExpression(declarator.init); // 这里就是我们的表达式 `require('./a.js')`
                        }
                        break;
                    }
            }
        });
    }
```

然后 会进入到 `walkCallExpression` ，显然因为 `require('./a.js')` 本身就是一个函数调用。最终会发现进入了 `call require` 的生命周期，这时会调用注册在这些生命周期上的插件了，这里会进入 `AMDRequireDependenciesBlockParserPlugin.js` 中，在这里就会创建一个依赖，记录下对 `a.js` 模块的依赖关系，最终这些依赖会被放到 `module.dependencies` 中。

收集完所有依赖之后，最终又会回到 `compiler.js` 中的compile方法里，他会调用 `compilation.seal` 方法，这个方法就会把所有依赖的模块都通过对应的模板 `render` 出一个拼接好的字符串，比如 `app.js` 的内容就是在这里拼接的，而 `render` 生命周期就是专门进行JS代码拼接的， 经过`seal` 之后，module中的 `asset`字段里面就有了最终编译出的文件对应的源码，截图如下：

![img](https://gitee.com/yijili/diving-into-webpack/raw/master/images/assets.png)



这个截图就是我的 `main.js` 对应的 `compilation.assets`，可以看到他包含了这个 entry 会编译出的两个文件，一个是 `app.js` 一个是依赖的一张图片。

`seal` 函数最主要是调用了这行代码：

```
self.createChunkAssets() // 把相关的JS模块的代码都收集起来，其实 `app.js` 就是一个 chunk，如果你有配置commen chunk的话，这里可能会有不止一个chunk
```

这个方法会遍历 `this.chunks` ，然后生成对应的文件的内容，比如我们如果是 `main.js` 入口，那么这里就只有一个 `chunk` 就是 `main.js` ，如果我们有多个entry，那么这里就有多个 `chunks`。然后他的 `dependencies` 中记录了自己依赖的 `modules`，这样就形成了一颗完整的依赖树。把这个 `chunk` 传给 `MainTemplate`中的 `render` 插件，他就会根据这颗依赖树生成最终的代码。

MainTemplate 中的 `render` 插件：

```javascript
this.plugin("render", (bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
            const source = new ConcatSource();
            source.add("/******/ (function(modules) { // webpackBootstrap\n");
            source.add(new PrefixSource("/******/", bootstrapSource));
            source.add("/******/ })\n");
            source.add("/************************************************************************/\n");
            source.add("/******/ (");
            const modules = this.renderChunkModules(chunk, moduleTemplate, dependencyTemplates, "/******/ "); // 这里会遍历所有的依赖，递归进行render
            source.add(this.applyPluginsWaterfall("modules", modules, chunk, hash, moduleTemplate, dependencyTemplates));
            source.add(")");
            return source;
        });
```

这个就是对一个JS模块应该如何生成他的代码。

还记得我们前面讲到的，webpack 最终生成的代码中的依赖顺序是 中序遍历的结果，上面的 `renderChunkModules` 就是他进行中序遍历的地方。为什么要中序遍历，而不是先序或者后序呢，因为中序遍历就是一个简单的递归，是最好实现的。而webpack只要知道每个模块的对应关系即可，对顺序其实没有要求，那么就自然会选择最好事先的中序遍历。

到此为止，我们从代码上大概理清楚了webpack 是如何编译我们的源码的。总结下来主要是如下几步：

1. 根据我们的webpack配置注册好对应的插件
2. 调用 compile.run 进入编译阶段，
3. 在编译的第一阶段是 `compilation`，他会注册好不同类型的module对应的 factory，不然后面碰到了就不知道如何处理了
4. 进入 `make` 阶段，会从 `entry` 开始进行两步操作：
5. 第一步是调用 loaders 对模块的原始代码进行编译，转换成标准的JS代码
6. 第二步是调用 acorn 对JS代码进行语法分析，然后收集其中的依赖关系。每个模块都会记录自己的依赖关系，从而形成一颗关系树
7. 最后调用 `compilation.seal` 进入 `render` 阶段，根据之前收集的依赖，决定生成多少文件，每个文件的内容是什么

这只是非常非常粗略的流程，实际上在整个过程中 webpack 的生命周期包含几十个点，感觉很难完全搞清楚每一步都是干什么的（其实也没有必要）。

每一个 入口文件会生成一个 compilation 对象，这个对象存储了编译这个入口需要的所有信息，比如 输入 输出路径，模块依赖等，整个编译的过程都是围绕 `compilation` 进行的。 如果我们只有一个入口文件，一般也会有两个 `compilation` 对象，那是因为一般我们都会用

一个典型的compilation对象如下：

![img](https://gitee.com/yijili/diving-into-webpack/raw/master/images/compilation.png)