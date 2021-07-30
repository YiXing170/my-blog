// var babel = require("@babel/core")

// module.exports = function (source, inputSourceMap) {
//   var babelOptions = {
//     presets: ['@babel/preset-env'],
//     inputSourceMap: inputSourceMap,
//     sourceMaps: true
//   }
//   var result = babel.transform(source, babelOptions)
//   this.callback(null, result.code, result.map)
// }



//这个插件可以获取传入option 
let loaderUtils = require("loader-utils");
//babel/core 有transform可以转代码成为ast抽象语法树
let babel = require("@babel/core");
function loader (source) {
  //source是文件的内容
  let cb = this.async();//添加异步
  //获取options传入进来的参数
  let options = loaderUtils.getOptions(this);
  //将代码转成为ast
  // let ast = babel.parse(source)
  babel.transform(source, {
    ...options,
    presets: ['@babel/preset-env'],
    sourceMap: true,
    filename: this.resourcePath.split('/').pop()
  }, function (err, r) {
    //有时候读取文件可能十异步，所以调用cb等于调用this.callback
    cb(err, r.code, r.map); // 这里需要处理一下source-map
  });
}

module.exports = loader;