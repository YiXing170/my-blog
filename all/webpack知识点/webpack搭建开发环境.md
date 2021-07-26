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



##### babel

安装

```
npm install babel-loader @babel/core -D    // @babel/core 是babel核心库
npm install @babel/preset-env @babel/preset-react -D
```

babel的作用就不多说了，说说配置babel的文件，主要有以下两种

+ .babelrc文件----针对项目中的文件进行编译
+ babel.config.js----会影响整个项目中的代码，包含node_modules中的代码

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

1.   presets的执行顺序是倒序的，从后到前，和webpack的loader配置中的use字段类似

2.   presets中的preset如果有参数传入，可以写成`["@babel/preset-env",{target:'default'}]`的形式

3.   @babel/preset-env只会转化js句法（语句，代码块），不会转化新的api，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法(Object.assign)都不会转化，所以需要引入`@ babel / polyfill`包，最常见的方式就是在入口文件的第一行写上:

     ```javascript
         import '@babel/polyfill'   // 主要都是为了适配ie
     ```

         这种方式相应的缺点就是包全引入了，相应的按需的引入的方案肯定也有，这里就不赘述啦

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

  - ``` javascript
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

+   webpack文档里常说的HMR（Hot Module Replacement）属于热加载（Hot Reload）

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