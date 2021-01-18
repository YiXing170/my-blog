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
   // config.optimization.minimizer 可以用来覆盖压缩时的一些默认行为，像对注释的处理，修改压缩配置等（文档看的头大）
   optimization: {
       minimizer: [
         new TerserPlugin({
           cache: true,   //使用压缩缓存，提高打包速度
           parallel: true  //启用多线程打包
         })
       ]
   },
   ```

   ​