###  安装和使用webpack
1. webpack4是把webpack和webpack-cli分开的。
### entry和output的使用
1. 单入口是字符串，多入口是对象

```
entry：'index.js'

// 多页面
entry:{
    app:'',
    adminApp:''
}
```

2. output 多出口用占位符 `[name]` 来命名，单出口是去掉占位符即可

```
output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  }
```
### loaders的概念
> webpack 开箱即用只支持js和json，通过loaders去支持其他的文件类型，并把它们添加到依赖图中。
loaders本身是一个函数，接收源文件作为参数，返回转换的结果

* 常见的loaders有哪些？

名称 | 作用
---|---
babel-loader | 转化es6 es7新特性语法
css-loader | 支持css文件的加载和解析
less-loader | 将less文件转化为css文件
ts-loader | 将ts文件转化为js文件
file-loader | 进行图片和字体的打包
raw-loader |将文件以字符串的形式打包
thread-loader |多进程打包js和css

* loaders的使用
> test 指定规则， use指定loader

```
module: {
    rules: [{
      test: /\.txt$/,
      use: 'raw-loader'
    }]
  }
```
### plugins概念
> 插件用于bundle.js文件 的优化，资源管理和环境变量的注入，作用于整个构建过程

* 常见的plugins有哪些？

名称 | 作用
---|---
CommonsChunkPlugin | 将chunks相同的代码提取到公共的js
CleanWebpackPlugin| 清理构建目录（构建前）
ExtractTextWebpackPlugin| 将bundle里的css提取成一个css文件
CopyWebpackPlugin | 将文件(夹)拷贝到构建目录
HtmlWebpackPlugin | 创建html文件去承载打包的js文件
UglifyjsWebpackPlugin |压缩js（有一个压缩配置，自己去选择怎么压缩）
ZipWebpackPlugin | 将打包的资源生成一个zip包

* 用法
> 插件实例化
```
plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ]
```
### mode的概念
 > mode用来指定当前的构建环境是none / production / development 。 设置mode可以使用webpack内置的函数
，默认值是production。

### 解析es6和react
+ 先配置.babelrc文件（插件未配置）

```
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```
+ 在配置babel-loader

```
 module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader'
    }]
  }
```

### 资源解析 css

+ css-loader用于解析 .css文件，转化为commomjs对象
+ style-loader将样式通过style标签插入到head中
+ loader加载的顺序是从右到左


```
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
```

### 解析图片和字体
+ 一般是使用 file-loader和url-loader
+ 后者可以将小图片转为base64


```
      {
        test: /\.(png|gif|svg|jpg|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240
          }
        }]
      },
      {
        test: /\.(woff2?|eot|ttf)$/,
        use: 'file-loader'
      }
```

### webpack中的文件监听

+ 文件监听是在源码发生变化时自动构建出新的输出文件
+ webpack开启文件监听有两种方式
  1. 启动webpack时带上`--watch`参数
  2. 在配置config文件中设置 `watch:true`
  3. 还是要去手动的刷新页面
  
```
{
    watch：true，
    watchOptions:{
        ignored:/node_modules/,
        // 延迟300 毫秒再去访问
        aggregateTimeout:300,
        // 每隔一秒访问一次
        poll:1000
    }
}
```

### webpack热更新
+ 利用的是webpack-dev-server插件和webpack.HotModuleReplacementPlugin 插件
+ 不需要再去刷新页面
+ 构建的产物是放在内存中的
 
```
{
    plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    hot: true,
    contentBase: './dist'
  },
}
```
### 文件指纹
+ 打包后生成的文件名后缀

> 文件指纹如何生成？

1. Hash ：和整个项目相关，只要项目文件有改变，hash就发生改变---图片/字体
2. Chunkhash： 和webpack打包的chunk有关，不同的entry会生成不同的chunkhash---js文件
3. ContentHash： 根据文件的内容来生成hash，文件内容不变，hash不变---css文件，注意要用MiniCssExtractPlugin插件，和style-loader冲突，要注意替换。


### 代码压缩
+ js 压缩 webpack自带的，也可以自己单独去配置
+ css 压缩
+ html 压缩

```
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
      chunks: ['search'],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLinebreak: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false
      }
    })
  ]
```

### 自动清理构建目录产物

> npm i clean-webpack-plugin -D

```
// 引入插件要解构
var {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')

// new CleanWebpackPlugin() 再使用
```

###  PostCSS插件autoprefixer自动补齐CSS3前缀


```
    {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          // 加入postcss-loader，注意顺序
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
```

### px转rem
+ 配合引入 lib-flexible 脚本去计算html的字体大小
```
{
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // 转换的loader
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,    // 1rem为多少px
              remPrecision: 8 //几位小数
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
```
### 资源内联
> 为什么？ 首屏的css 和一些初始化的脚本要内联。使用的是raw-loader


```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <!--引入html 或是css-->
  ${require('raw-loader!./meta.html')}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <!--引入js文件，注意空格和换行，不然会失败-->
  <script>${require('raw-loader!babel-loader!../node_modules/lib-flexible/flexible.js')}</script>
</head>

<body>
  <div id="root"></div>
</body>
</html>
```

### 多页面打包方案
+ 一般是通过glob包去动态匹配，再生成entry对象，和htmlWebpackPlugin 数组，最后添加到配置中就行了


```
const setMpa = () => {
  const entry = {};
  const htmlWebpackPlugin = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
  entryFiles.map(file => {
    const match = file.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];
    entry[pageName] = file;
    htmlWebpackPlugin.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, `./src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName],
        inject: true,
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLinebreak: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
        }
      })
    )
  })
  return {
    entry,
    htmlWebpackPlugin
  }
}
```
### source-map 
+ 开发时打开，可以debug到相应的源码位置；生产环境关闭


```
devtool:'source-map',// 不同的属性不同的效果（如cheap-source-map）
```

### 抽离公共资源

需要借助插件，有两个插件可供选择：html-webpack-externals-plugin 和 SplitChunsPlugin（webpack4内置，代替webpack3的CommonsChunkPlugin）

说明：
+ 两个插件不要混用
+ html-webpack-externals-plugin既可以将本地基础库分离，也可以直接使用CDN。本人试图将本地库进行分离，总是失败，暂没查明原因。
+ 使用SplitChunksPlugin中chunks时，如果没有使用异步加载，chunks建议"all"，但如果使用了异步加载，"all"则会导致错误，这时建议用"initial"
+ 要到htmlWebpackPlugin中配置chunk，抽离出的公共部分要加入到那些模板（htmlwebpackplugin）中
```
chunks: pageName==='search' ?['vendors',pageName]:[pageName],
```

> html-webpack-externals-plugin
```
npm i html-webpack-externals-plugin
 
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
 
plugins: [
      new HtmlWebpackExternalsPlugin({
         externals: [
            {
               module: "react", // 代码中引入的库的名称
               entry: "https://11.url.cn/now/lib/16.2.0/react.min.js",
               // entry: "cjs/react", // 相对于node_modules/react的路径【官网示例，实际并不成功】
               global: "React", // 代码中引入的库的全局对象的名称
            },
            {
               module: "react-dom",
               entry: "https://11.url.cn/now/lib/16.2.0/react-dom.min.js",
               // entry: "dist/react-dom", // 相对于node_modules/react-dom的路径 【官网示例，实际并不成功】
               global: "ReactDOM",
            },
 
         ],
      })
]
```

> SplitChunksPlugin

```
module.exports = {
   optimization: {
      splitChunks: {
         minSize: 0, // 分离包体积的最小大小
         cacheGroups: {
            commons: {
               // test: /(react|react-dom)/,  // 通过正则匹配，只分离react/react-dom这两个库，不写test则不作限制
               name: 'commonss',  // 分离块的名称，需要加在HtmlWebpackPlugin插件的chunks属性中，才能正确命名分离后的文件
               chunks: "all", // 需要分割哪些代码块，all表示所有代码块，async按需加载的代码块，initial初始化代码块
               // minChunks: 2, // 最小引用次数，少于这个引用次数就不会单独提取出来
            }
         }
      }
   }
};
```

### tree shaking

+ import导入时，未使用的方法和未导入的方法
+ dead code 如 `if(false) a()`
+ mode设置为production即会触发tree shaking

### scope hoisting
可以简单的把scope hoisting理解为是把每个模块被webpack处理成的模块初始化函数整理到一个统一的包裹函数里，也就是把多个作用域用一个作用域取代，以减少内存消耗并减少包裹块代码，从每个模块有一个包裹函数变成只有一个包裹函数包裹所有的模块，但是有一个前提就是，当模块的引用次数大于1时，比如被引用了两次或以上，那么这个效果会无效，也就是被引用多次的模块在被webpack处理后，会被独立的包裹函数所包裹

### 代码分割和动态import

分割chunks:两种方案 require.ensure() 和 动态import

+ 动态import要使用插件@babel/plugin-syntax-dynamic-import

```
{
  "presets": [["@babel/preset-env"], "@babel/preset-react"],
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```


```
handleClick(){
//动态import的方法
    import('./dynamicImport.js').then((value)=>{
      this.setState({Text:value.default})
    })
  }
  
  
// ./dynamicImport.js 文件

import React from 'react';
export default() => <span>动态引入的内容</span>;
```

### webpack中使用eslint
+ CI/CD 中设置eslint line
+ 使用eslint 的loader， eslintrc文件去配置

### webpack打包组件和基础库

```
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
  entry: {
    'large-number': './src/index.js',
    'large-number.min': './src/index.js'
  },
  output: {
    filename: '[name].js',
    library: 'largeNumber',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  mode: 'none',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js/，
        // parallel:true //开启并行打包，优化构建速度
      })
    ]
  }
}
```
### webpack ssr打包存在的问题

+ 浏览器的全局变量window document；
+ 组件适配：将不兼容的组件根据打包环境进行适配
+ 请求适配：使用axios 或者isomorphic-fetch
+  样式问题 node无法解析css
    1. 服务端打包忽略css （ignore-loader ）
    2. 将style-loader换成isomorphic-style-loader
+ 替换掉打包出的html中的html占位符或数据占位，再返给浏览器。

### 优化构建时的命令行日志
* 安装插件`friendly-errors-webpack-plugin`
+ 将stas设置为 error-only


```
plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ]
  
stas：'errors-only'
```

### webpack构建异常和中断处理

```
// 将这个函数写在插件数组中

function() {
            // webpack 3 为this.plugins()
            this.hooks.done.tap('done', (stats) => {
                if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1)
                {
                    console.log('build error');
                    process.exit(1);
                }
            })
        }   
```

### 速度分析


```
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const spm=new SpeedMeasurePlugin();
module.exports=spm.wrap({// 配置})
```

### 体积分析

```
 const {
   BundleAnalyzerPlugin
 } = require('webpack-bundle-analyzer')
 
 // new BundleAnalyzerPlugin()
 
```

### 多进程打包
使用 thread-loader

```
use: [
          // 在做解析的loader后面加
          {
            loader: 'thread-loader',
            options: {
              workers: 3
            }
          },

          'babel-loader'
        ],
```


### 将公共包(react /react-dom /redux) 抽离成一个文件

```
const path = require('path');
const webpack = require('webpack')
module.exports = {
  entry: {
    library: ['react', 'react-dom']
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, 'build/library'),
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
其他项目引用的时候直接配置prod文件即可


```
new webpack.DllReferencePlugin({
      context: path.join(__dirname, 'build/library'),
      manifest:require('./build/library/library.json')
    })
    
    new TerserPlugin({
            catch: true,
            parallel: true
          })
```

### 开启缓存
优化构建速度

```
     {
        test: /\.js$/,
        use: [{
            loader: 'thread-loader',
            options: {
              workers: 3
            }
          },
            // 开启babel的缓存
          'babel-loader?cacheDirectory=true'
        ],
        // use: 'happypack/loader',
      },
      
      // 开启压缩的缓存
      optimization: {
        minimizer: [
          new TerserPlugin({
            cache: true,
            parallel: true
          })
        ]
  }
    // 开启模块的缓存
    new HardSourceWebpackPlugin(),
      
```

### tree shaking
+ 是webpack4 自带的，擦除引入包中未使用的方法
+  同样，也可对css做优化 使用插件 `purgecss-webpack-plugin`,但要和`mini-css-extract-plugin`配合使用


```
const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    // 使用插件
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
  ]
}
```

### 图片压缩
+ 推荐使用 image-webpack-loader
+ 有很多定制选项，可以引入更多第三方库优化，如pngquant，可以处理多种图片格式

```
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
```

### 动态polyfill
+ polyfill全部引入的话太大了，但是其他方案也有相应的缺点，
+ babel-runtime加  babel-plugin-transform-runtime插件，可以按需引入，但是不能导入实例方法
+ 动态polyfill 根据ua来判断不支持那些方法，就引入这些方法。
使用方法是引入polyfill.io官方提供的script，或基于官方自建polyfill服务

### web商城的页面优化
+ 渲染优化
+ 弱网优化
+ webview优化