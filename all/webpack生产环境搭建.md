##### 前言

本篇的目的是了解webpack生产环境的配置，常用的优化手段，常考的webpack面试知识点。

##### 文件指纹

文件指纹指的是打包出来的文件名都带有的hash码，这个hash是我们可以去控制的。

应用文件指纹的目的是为了配合浏览器的缓存功能：

> 打包出来的文件hash码发生了改变，前端代码中对应引用最新的文件

```javascript
entry: {                          //多入口配置
    main: './src/index.js',
    slove: './src/slove.js' 
},
output: {
    filename: '[name].[hash].js',    // 注意name 和hash的占位符 [hash:8]指定hash长度为8
    path: path.resolve(__dirname, 'dist')
}
```

![img](https://upload-images.jianshu.io/upload_images/3597745-adcb54f97f328f4c.png?imageMogr2/auto-orient/strip|imageView2/2/w/618/format/webp)

hash分为三种：

hash & chunkhash & contenthash

> hash :同一次打包产出的产物的hash值都是一样的，如上图

这种hash每次打包会强制给文件改名字，浏览器都会去请求最新的资源，不利于我们去做缓存

chunkhash :

> 模块的hash，也就是根据模块内容计算的hash值

打包结果：

![img](https://upload-images.jianshu.io/upload_images/3597745-3ffe2fbaebbfffe5.png?imageMogr2/auto-orient/strip|imageView2/2/w/610/format/webp)

main.js中依赖main.css了，把他们看做同一chunk了，所以chunkHash值一致，但与solve.js为不同的chunk，chunkHash不一致

contenthash:

> 它是根据文件内容来定义hash值的

将css文件做contenthash

```
new MiniCssExtractPlugin({    // 作用：提取css成文件，后面会介绍
    filename: "[name].[contenthash].css"
})
```

![img](https://upload-images.jianshu.io/upload_images/3597745-b93f122d14ab75cd.png?imageMogr2/auto-orient/strip|imageView2/2/w/620/format/webp)

很明显，css文件已经应用上contenthash

##### css额外处理

前面说到把css提取成单独的css文件，同时也注意到dist目录下的js/css/img都是在同一目录，不太方便管理，

需要处理一下

```javascript
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
// ...
output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name]_[chunkhash:8].js'  // 将js文件输出到 ./dist/js/ 下
  },
module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader?cacheDirectory=true'],  // 开启babel编译缓存
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    },
    {
      test: /\.less$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        'css-loader',
        {
          loader: 'px2rem-loader',
          options: {
            remUnit: 75,
            remPrecision: 8
          }
        },
        'less-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [
              require('autoprefixer')({
                overrideBrowserslist: ['last 2 version', '>1%']
              })
            ]
          }
        }
      ]
    },
    {
      test: /\.(png|gif|svg|jpg|jpeg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'img/[name]_[hash:8].[ext]',   //  将图片输出到 ./dist/img/ 下

        }
      }]
    },
    {
      test: /\.(woff2?|eot|ttf)$/,
      use: 'file-loader'
    }
    ]
  },    
 plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[contenthash:8].css'  //  将css文件输出到 ./dist/css/ 下
    }),
    new CleanWebpackPlugin(),   // 自动清除构建产物
  ].concat(htmlWebpackPlugin),   
    
```

注意上面的配置还额外对css作了额外的处理，

> 1. 调试过vue样式应该都知道，vue-cli搭建的项目给样式自动添加了厂商前缀，利用的正是postcss-loader，postcss-loader自己又可以加载一些功能性的插件（套娃？），具体的介绍可以看https://www.jianshu.com/p/a52889370871
> 2. 注意提取css既要配置mini-css-extract-plugin插件，还要将MiniCssExtractPlugin插件中的loader对象与style-loader替换掉，很好理解:提取成css文件了，就不需要style-loader了
> 3. 如果有移动端开发需求，还可配置px2rem-loader，按照传入的配置，将px转化为为rem
> 4. 注意这几个loader的加载顺序，从后到前

##### 压缩

压缩是性能优化的一种有效手段，在webpack里讲压缩，压缩的对象自然也就是js/css/html/img 等文件了

1. js压缩是webpack自带的功能，不设置会按照自带的规则去压缩，但也可去自定义

   ```javascript

   // config 为导出的整个配置对象
   // config.optimization.minimizer 可以用来覆盖压缩时的一些默认行为，像对注释的处理，修改压缩配置等（自定义）
   // 像生产时去除console，也是在这里配置的
   optimization: {
       minimizer: [
         new TerserPlugin({
           cache: true,   //使用压缩缓存，提高打包速度
           parallel: true  //启用多线程打包
         })
       ]
   },
   ```

2. css压缩

   ```javascript
   // 需要安装插件optimize-css-assets-webpack-plugin  和包cssnano
   // cssnano能和插件optimize-css-assets-webpack-plugin配合，也能和postcss-loader一起使用
   // nano的释义为 毫微/纳米
   new OptimizeCssAssetsPlugin({
         assetNameRegexp: /\.css$/,
         cssProcess: require('cssnano')  
       })
   ```

3. html压缩

   html的压缩还是运用之前讲到的html-webpack-plugin，具体配置详情可看https://blog.csdn.net/zhaoruda/article/details/74859338

   ```javascript
   plugins: [
       new MiniCssExtractPlugin({
         filename: '[name]_[contenthash:8].css'
       }),
       // css 压缩
       new OptimizeCssAssetsPlugin({
         assetNameRegexp: /\.css$/,
         cssProcess: require('cssnano')
       }),
       // html 压缩
       new HtmlWebpackPlugin({
         template: path.join(__dirname, './src/search.html'),
         filename: 'search.html',
         chunks: ['search'],   //只包含search chunk ，多页面打包时，只引入search模块相关的css/js
         inject: true, // 注入css和js
         minify: {   // 压缩的主要配置
           html5: true,  // 按照html5的规范输出
           collapseWhitespace: true, // 与preserveLinebreak一起配合压缩html空白部分，必须同时使用
           preserveLinebreak: true,
           minifyCSS: true,  // 压缩style中css样式
           minifyJS: true,	// 压缩script中js
           removeComments: true  //移除注释
         }
       })
     ]
   ```

4. 压缩图片

   - 推荐使用 image-webpack-loader
   - 有很多定制选项，可以引入更多第三方库优化，如pngquant，可以处理多种图片格式

   ```javascript
   {
         test: /\.(png|gif|svg|jpg|jpeg)$/,
         use: [{
           loader: 'url-loader',
           options: {
             limit: 10240,
             name: 'img/[name]_[hash:8].[ext]',

           }
         },
         {
           loader: 'image-webpack-loader',
           options: {
             mozjpeg: {
               progressive: true,
               quality: 65
             },
             // optipng.enabled: false will disable optipng
             optipng: {
               enabled: false,
             },
             pngquant: {
               quality: [0.65, 0.90],
               speed: 4
             },
             gifsicle: {
               interlaced: false,
             },
             // the webp option will enable WEBP
             webp: {
               quality: 75
             }
           }
         }
         ]
    },
   ```



##### 速度优化

前面的压缩其实是体积优化的一部分，现在讲讲构建速度的优化，无外乎就是开启缓存，多进程打包等等

多进程打包,使用thread-loader

>文档介绍：
>
>把这个 loader 放置在其他 loader 之前， 放置在这个 loader 之后的 loader 就会在一个单独的 worker 池(worker pool)中运行
>
>在 worker 池(worker pool)中运行的 loader 是受到限制的。例如：
>
>- 这些 loader 不能产生新的文件。
>- 这些 loader 不能使用定制的 loader API（也就是说，通过插件）。
>- 这些 loader 无法获取 webpack 的选项设置。
>
>每个 worker 都是一个单独的有 600ms 限制的 node.js 进程。同时跨进程的数据交换也会被限制。
>
>**请仅在耗时的 loader 上使用**

根据最后一句其实知道，这个load最佳的使用地方是在babel-loader（耗时）,同时也开启babel-loader 的缓存

```javascript
{
      test: /\.js$/,
      use: [
        {
        	loader: 'thread-loader',
        	options: {
         	   workers: 3   //开启的最大进程
        	}
      	},
        'babel-loader?cacheDirectory=true'   //开启babel-loader 的缓存
      ],
},
```

```javascript
 // 开启压缩的缓存
 optimization: {
        minimizer: [
          new TerserPlugin({
            cache: true,  //开启
            parallel: true  //使用多进程并发运行以提高构建速度
          })
        ]
  }
  plugins:[
    new HardSourceWebpackPlugin(), // HardSourceWebpackPlugin是webpack的插件，为模块提供中间缓存步骤。为了查									看结果，您需要使用此插件运行webpack两次：第一次构建将花费正常的时间。第										二次构建将显着加快（大概提升90%的构建速度）
    ...							 // 也能运用到dev环境，提升npm run server的启动速度			
  ]  
```

还有一些其他方案，像dll处理（Webpack DLLPlugin），打包出来的DLL文件相当于我们项目的**工程基础包，** 下次构建就不需要再去打包这些基础包，简单的配置如下：

将公共包(react /react-dom /redux) 抽离成一个文件，单独起一个webpack.dll..js

```
//webpack.dll.js

const path = require('path');
const webpack = require('webpack')
module.exports = {
  entry: {
    library: ['react', 'react-dom']
  },
  output: {
    filename: '[name].dll.js',    // 此处的name值为入口key --library
    path: path.join(__dirname, 'build/library'),  // 生成的文件都在build/library下
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      path: path.join(__dirname, 'build/library/[name].json')
    })
  ]
}
```

再运行    webpack --config webpack.dll.js  命令

会在当前配置的目录下生成

> /build/library/library.dll.js   //源码文件
>
> /build/library/library.json  // 访问node_modules 中的react时  映射到 上面的源码文件



项目引用的时候直接配置prod文件即可

同样，其他项目需要react和react-dom ，自己把

```
// 在webpack.prod.js中引入
//...
new webpack.DllReferencePlugin({
      context: path.join(__dirname, 'build/library'),
      manifest:require('./build/library/library.json')
    })
    
//...
```

引用文件，这一步，经常会被忘记。一定要在HtmlWebpackPlugin的template 模版html文件中，手动引入    /build/library/library.dll.js文件

总结：

webpack DllPlugin优化，使用于将项目依赖的基础模块（第三方模块）抽离出来，然后打包到一个个单独的动态链接库中。当下一次打包时，通过webpackReferencePlugin，如果打包过程中发现需要导入的模块存在于某个动态链接库中，就不能再次被打包，而是去动态链接库中get到。

##### tree shaking

面试很喜欢问的一个webapck问题

- import导入时，未使用的方法和未导入的方法
- dead code 如 `if(false) a()`
- mode设置为production即会触发tree shaking

##### scope hoisting

可以简单的把scope hoisting理解为是把每个模块被webpack处理成的模块初始化函数整理到一个统一的包裹函数里，也就是把多个作用域用一个作用域取代，以减少内存消耗并减少包裹块代码，从每个模块有一个包裹函数变成只有一个包裹函数包裹所有的模块，但是有一个前提就是，当模块的引用次数大于1时，比如被引用了两次或以上，那么这个效果会无效，也就是被引用多次的模块在被webpack处理后，会被独立的包裹函数所包裹

##### 代码分割和动态import

分割chunks:两种方案 require.ensure() 和 动态import

- 动态import要使用插件@babel/plugin-syntax-dynamic-import

