(function(){
      const modules = {"index.js":function (require, exports) {
            eval(fileContent.toString())   // 看这里 里面的内容用eval来执行。外面是函数声明，不是一个字符串了。
        },"action.js":function (require, exports) {
            eval(fileContent.toString())   // 看这里 里面的内容用eval来执行。外面是函数声明，不是一个字符串了。
        },"name.js":function (require, exports) {
            eval(fileContent.toString())   // 看这里 里面的内容用eval来执行。外面是函数声明，不是一个字符串了。
        },"family-name.js":function (require, exports) {
            eval(fileContent.toString())   // 看这里 里面的内容用eval来执行。外面是函数声明，不是一个字符串了。
        },};
      const exec = function (moduleId) {
        const fn = modules[moduleId];
        let exports = {};
        const require = function (filename) {
          const dirname = path.dirname(moduleId);
          const absolutePath = path.join(dirname, filename);
          return exec(absolutePath);
        };
        fn(require, exports);
        return exports;
      };
      exec("index.js");
    })()