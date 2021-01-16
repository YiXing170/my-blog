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

这种hash每次打包会强制给文件改名字，浏览器拿资源会去服务器拿，不利于我们去做缓存

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