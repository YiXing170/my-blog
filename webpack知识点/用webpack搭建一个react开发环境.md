

##### 前言

- 安装npm

- 安装webpack和webpack-cli（注意安装webpack时要指定版本，不然就变成了5版本，本文讨论的是@4.x）

  > - 需要注意的是webpack4拆分为 webpack和webpack-cli这两个包

- package.json中的scripts字段和bin字段

  > 以webpack包为例：
  >
  > - 为什么可以直接在命令行中执行 ` webpack scr/index.js  ` 命令？
  >
  > 首先，全局安装webpack后，webpack包中package的字段如下：
  >
  > ```javascript
  > {	
  >     //...省略
  >    "bin": "./bin/webpack.js", 
  >     //...省略
  > }
  > ```
  >
  > npm会收集bin字段，生成相应的shell/cmd脚本储存在全局的环境变量path中对应的npm目录（用yarn安装的就是在yarn目录下）
  >
  > ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/78efc0b3097f40b384ae6ca118ed0296~tplv-k3u1fbpfcp-watermark.image?)
  >
  > ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/790ce2acde654e02b75c03f77c6f11ce~tplv-k3u1fbpfcp-watermark.image?)
  >
  > ------
  >
  > 执行wepack命令就是在环境变量path中对应的目录下**查找**叫webpack的程序，即webpack.cmd
  >
  > 如下，关键点就是用node去执行bin字段对应的文件即"./bin/webpack.js"文件
  >
  > 环境变量相关知识点可参考：https://blog.csdn.net/n_s_x14/article/details/88081530
  >
  > cmd文件如下：
  >
  > ```shell
  > @ECHO off
  > SETLOCAL
  > CALL :find_dp0
  >
  > IF EXIST "%dp0%\node.exe" (
  >   SET "_prog=%dp0%\node.exe"
  > ) ELSE (
  >   SET "_prog=node"
  >   SET PATHEXT=%PATHEXT:;.JS;=;%
  > )
  >
  > "%_prog%"  "%dp0%\node_modules\webpack\bin\webpack.js" %*
  > ENDLOCAL
  > EXIT /b %errorlevel%
  > :find_dp0
  > SET dp0=%~dp0
  > EXIT /b
  > ```
  >
  > ------
  >
  > 但通常我们是执行的 npm run build这个命令来打包的，这个大家应该都知道是去package中找scripts字段，执行相应的命令
  >
  > ```javascript
  > "scripts": {
  >     "build": "webpack",
  >   },
  > ```
  >
  > 其实就是相当于新打开一个shell窗口，执行  ` webpack ` 这个命令而已
  >
  > 注意：项目本地安装的包中的bin字段，会被收集到/node_modules/.bin 文件夹下，即webpack只在本地安装的时候也可以使用上面的build命令，类似于先在本地查找命令，未找到再去全局的path目录下找。

##### 基本配置

- webpack4号称0配置，那直接执行  `webpack  ` 试试

  > 坑：webpack4.x的打包已经不能用`webpack 文件a 文件b`的方式，而是直接运行`webpack --mode development`或者`webpack --mode production`，这样便会默认进行打包，入口文件是`'./src/index.js'`，输出路径是`'./dist/main.js'`，其中src目录即index.js文件需要手动创建，而dist目录及main.js会自动生成。 

  ​

  ```javascript
  // src/index.js
  import {sum ,clg} from './utils'
  export default {sum,clg}

   // src/utils.js

    export function clg(value) {
        console.log(value)
          }

    export function sum(a, b) {

   return a + b
   }
  ```

  执行后：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13735e0ceb094ab99295ffccec6ac046~tplv-k3u1fbpfcp-watermark.image?)

```
新增dist目录，和目录下的main.js
```

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45550c3670fc4b4c90ce010907b40b6b~tplv-k3u1fbpfcp-watermark.image?)

  可以很明显的看出入口文件，以及在入口文件中依赖了哪些文件，按图索骥都打包进来了

  同时有一个配置的警告，执行webpack 的时候未输入mode选项，所以默认为production，也告诉我们还有developent，和none模式。none模式禁止默认行为，代表在其他模式时，webpack内部都有做一些事情，很明显的就是：production下打包出来的代码默认是压缩的。

  ​

- 但对不同的项目来说，肯定有自定义的需求，所以配置文件还是需要的

```javascript
  "scripts": {
      "build": "webpack --config webpack.config.js", // --config 指定后面的文件为配置文件
    }, 
```

- 根据我们上面提到的出口，入口，模式，先将配置文件写成如下

> 注意整个配置中我们使用 Node 内置的 [path 模块](https://nodejs.org/api/path.html)，并在它前面加上 [__dirname](https://nodejs.org/docs/latest/api/globals.html#globals_dirname)这个全局变量。可以防止不同操作系统之间的文件路径问题，并且可以使相对路径按照预期工作

```javascript
const path = require('path');

module.exports = {
  mode: "production", // "production" | "development" | "none"  

  entry: "./src/index.js",  //不设置时默认为 /src/index.js
 
  output: {
    path: path.resolve(__dirname, "dist"), // string
    filename: "bundle.js", // string  默认为main.js
  }  
}
```

基本的配置文件就完成啦，简单的后果就是最后只能打包js文件和json文件

> webpack 开箱即用只支持js和json，通过loaders去支持其他的文件类型，并把它们添加到依赖图中。
> loaders本身是一个函数，接收源文件作为参数，返回转换的结果

- 常见的loaders有哪些？

| 名称            | 作用              |
| ------------- | --------------- |
| babel-loader  | 转化es6 es7新特性语法  |
| css-loader    | 支持css文件的加载和解析   |
| less-loader   | 将less文件转化为css文件 |
| ts-loader     | 将ts文件转化为js文件    |
| file-loader   | 进行图片和字体的打包      |
| raw-loader    | 将文件以字符串的形式打包    |
| thread-loader | 多进程打包js和css     |

- loaders的使用

> test 指定规则， use指定loader

```javascript
module: {    // 为什么叫模块,在node中不同的文件就是不同的模块，处理模块就是处理文件啦
    rules: [{
      test: /\.txt$/,
      use: 'raw-loader'
    }]
  }
```

- plugins概念

> 插件用于bundle.js文件 的优化，资源管理和环境变量的注入，作用于整个构建过程
>
> 插件更多是功能性的，主要也是借助node的能力去实现的功能

- 常见的plugins有哪些？

| 名称                       | 作用                        |
| ------------------------ | ------------------------- |
| CommonsChunkPlugin       | 将chunks相同的代码提取到公共的js      |
| CleanWebpackPlugin       | 清理构建目录（构建前）               |
| ExtractTextWebpackPlugin | 将bundle里的css提取成一个css文件    |
| CopyWebpackPlugin        | 将文件(夹)拷贝到构建目录             |
| HtmlWebpackPlugin        | 创建html文件去承载打包好的js文件（自动引入） |
| UglifyjsWebpackPlugin    | 压缩js（有一个压缩配置，自己去选择怎么压缩）   |
| ZipWebpackPlugin         | 将打包的资源生成一个zip包(避免自己手动压缩)  |

- 用法

> 插件实例化

```javascript
plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'   // 当有定制html需求时使用
    }),
  ]
```

```
// 生成的文件
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>webpack App</title>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

好的 一个简单的配置文件就写好了

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
    rules: [{
      test: /\.txt$/,
      use: 'raw-loader'
    }]
  },
  
  plugins: [
    new HtmlWebpackPlugin(),
  ]
}
```

下一篇文章主题为：用webpack定制完整的react开发环境

webpack的关键就是在配置文件，直接基于基础配置开始扩展

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



##### babel

安装

```
npm install babel-loader @babel/core -D    // @babel/core 是babel核心库
npm install @babel/preset-env @babel/preset-react -D
```

babel的作用就不多说了，说说配置babel的文件，主要有以下两种

- .babelrc文件----针对项目中的文件进行编译
- babel.config.js----会影响整个项目中的代码，包含node_modules中的代码

我这里选择babelrc的方式搭建

```javascript
{
  "presets": [["@babel/preset-env"], "@babel/preset-react"],  //支持react中的jsx和es6
  "plugins": ["@babel/plugin-syntax-dynamic-import"]  //支持动态import
}
```

plugin代表要实现的一个语法功能，preset代表的是一系列plugin 的集合

说的通俗点：plugin相当于一个流量包，preset相当于一整个套餐

再说几个值得注意的点：

1. presets的执行顺序是倒序的，从后到前，和webpack的loader配置中的use字段类似

2. presets中的preset如果有参数传入，可以写成`["@babel/preset-env",{target:'default'}]`的形式

3. @babel/preset-env只会转化js句法（语句，代码块），不会转化新的api，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法(Object.assign)都不会转化，所以需要引入`@ babel / polyfill`包，最常见的方式就是在入口文件的第一行写上:

   ```javascript
           import '@babel/polyfill'   // 主要都是为了适配ie
   ```

   ```
       这种方式相应的缺点就是包全引入了，相应的按需的引入的方案肯定也有，这里就不赘述啦
   ```

babelrc配置完了，还需要在webpack的配置中注册babel-loader，将两者链接起来去解析js文件

```javascript
// ... 
module: {   
    rules: [
      {
        test:/\.js$/,
      	use:'babel-loader'
      }
    ]
  },
// ...    
```

​

##### css

- css-loader用于解析 .css文件，转化为commonjs对象,这个对象有个toString方法，返回的是解析后的 css字符串
- style-loader将样式（也就是上文说的字符串）通过style标签插入到head中，所以css-loader必须和style-loader一起配合，样式才会生效
- loader加载的顺序是从右到左
- 注意css中文件可能有@import和url语句，需要其他 loader 的帮助，也就是 [file-loader]和 [url-loader]（下面会配置）
- 对于生产环境构建，建议从 bundle 中提取 CSS，以便之后可以并行加载 CSS/JS 资源。可以通过使用 [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) 来实现，在生产环境模式运行中提取出 CSS文件，这里配的是开发环境就先不涉足了。

```javascript
// ... 
module: {   
    rules: [
      {
        test:/\.js$/,
      	use:'babel-loader'
      },
      {
        test:/\.css$/,
      	use:['style-loader','css-loader']
      },
      {
      	test: /\.less$/,
      	use: ['style-loader', 'css-loader', 'less-loader']  //其实loader都可以传入配置的,具体去看文档吧
      },										     // [{loader:'style-loader',options:{}},...]
    ]
  },
// ...   
```

​

##### 图片和字体

- 一般是使用 url-loader解析图片和file-loader解析字体

  - file-loader可以解析项目中的url引入（不仅限于css），根据我们的output配置，将图片拷贝到相应的路径，再根据我们的配置，修改打包后文件引用路径，使之指向正确的文件

  - ```javascript
    import img from '../images/1.jpg'
    console.log(img)   // 500bfebd5072138a71038d256ff086ed.jpg--打包后的路径
    ```

- url-loader内置了file-loader

- 当使用url-loader加载图片，图片大小小于上限值，则将图片转base64字符串；否则使用file-loader加载图片，都是为了提高浏览器加载图片速度。

```javascript
// ... 
module: {   
    rules: [
      {
        test:/\.js$/,
      	use:'babel-loader'
      },
      {
        test:/\.css$/,
      	use:['style-loader','css-loader']
      },
      {
      	test: /\.less$/,
      	use: ['style-loader', 'css-loader', 'less-loader']  //其实loader都可以传入配置的,具体去看文档吧
      },										     // [{loader:'style-loader',options:{}},...]
      {
        test: /\.(png|gif|svg|jpg|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240, //上限值
            name: '[path][name].[ext]'  //定义图片的名字，不然名字就是一串md5
            outputPath: 'images/'   // 把图片都打包到这个目录下，不然默认在dist目录
          }
        }]
      },
      {
        test: /\.(woff2?|eot|ttf)$/,
        use: 'file-loader'
      }
    ]
  },
// ...   
```

##### webpack中的文件监听

- 文件监听是在源码发生变化时自动构建出新的输出文件
- webpack开启文件监听有两种方式
  1. 启动webpack时带上`--watch`参数
  2. 在配置config文件中设置 `watch:true`
- 几个值得注意的点
  1. 监听时会自动打包构建，但还是要手动刷新浏览器，页面才会发生变化
  2. webpack中利用`chokidar` 包实现了监听功能，原理是利用node中的`fs.watch(filename[, options][, listener])` 来实现的
  3. ​

```
{
	//...
    watch：true，
    watchOptions:{
        ignored:/node_modules/, // 不做监听
        // 延迟300 毫秒再去访问
        aggregateTimeout:300,
        // 每隔一秒访问一次
        poll:1000  // 效率不太好
    }
}
```

##### webpack热更新

首先区分实时加载（Live Reload）和热加载（Hot Reload）的区别：实时加载应用更新时需要刷新当前页面，可以看到明显的全局刷新效果，而热加载基本上看不出刷新的效果，类似于局	部刷新。

- webpack文档里常说的HMR（Hot Module Replacement）属于热加载（Hot Reload）

先实现Live Reload，利用`webpack-dev-server` 包，在config中配置

```javascript
{
  //...
  devServer: {
    hot: true,   //启动热更新
    stats: 'errors-only',
    contentBase: './dist'
  },
  //...
}
```

注意scripts中命令也要做修改

```javascript
"dev": "webpack-dev-server --config webpack.dev.js --open", //config指定配置文件，open自动打开浏览器
```

浏览器打开后发现并没有要访问的页面

原因是利用webpack-dev-server构建生成的资源中并不包含html文件，自然也就访问不到页面

所以再安装`html-webpack-plugin` 插件,作用是按照模板文件（也可以不使用模板）生成一个html文件，这个html文件会自动引入相关的js/css路径

```javascript
plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/search/index.html'),
      filename: 'index.html'
    })
  ],
```

现在实测运行npm run dev就已经更新后会自动刷新页面了，但是很多教程里面都还在插件数组里还安装了

> plugins: [new webpack.HotModuleReplacementPlugin(), ...],

其实，没有必要，在webpack-dev-server内部会有检测机制

```javascript
if (options.hot || options.hotOnly) {
  config.plugins = config.plugins || [];
  if (
    !config.plugins.find(
      // Check for the name rather than the constructor reference in case
      // there are multiple copies of webpack installed
      (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
    )
  ) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin()); //配置了devServer.hot为true就会追加插件
  }
}
```

当然更高级的追求是实现Hot Reload，这就需要安装其他的包了，比方说在vue-cli中利用的`vue-hot-load-api` 包（cli自带）实现了局部更新——特别是在改动样式很丝滑。但像create-react-app生成的项目是没有热更新功能的，可以自己安装

`react-hot-loader` 实现，这里也不细说了

具体可参考下面的文章：

> https://juejin.cn/post/6877420505209667597              安装react-hot-loader
>
> https://blog.csdn.net/weixin_40906515/article/details/108016372   vue-hot-load-api原理分析

然后接下来应该要说的是HMR的原理了，毕竟面试题，但是只是去复制那一段段的描述我感觉也没太大意义，还是需要自己去钻研一下，暂时po篇文章在这里吧，有好的资料也可补充

> https://zhuanlan.zhihu.com/p/30669007

还有值得注意的点是：

```javascript
module.exports={
  //...
  devtool: 'source-map'
  //...
}
```

主要是为了调试方便，不加在sources面板中看到的就是webpack编译后的代码

同样为了调试css方便

```javascript
//开启css sourceMap
use:['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']; // ?号是添加loder配置的简写方式
```



综上，wepack搭建的开发环境就暂时完成了，不排除还有一些问题，欢迎大家指正。

下一篇的主题是：webpack生产环境的搭建，优化，相关知识点等