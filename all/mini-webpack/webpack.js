//来源：https://juejin.cn/post/6893809205183479822#heading-0

const fs = require('fs');
const path = require('path');
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const fileToModule = function (path) {
    const fileContent = fs.readFileSync(path).toString()
    return {
        id: path,
        // 这里加壳了
        code: function (require, exports) {
            eval(fileContent.toString())   // 看这里 里面的内容用eval来执行。外面是函数声明，不是一个字符串了。
        },
        dependencies: getDependencies(path), // 获取依赖数组 [ './action.js', './name.js' ]
    }
}


// 简易版本
// function getDependencies (fileContent) {
//     let reg = /require\(['"](.+?)['"]\)/g;
//     let result = null;
//     let dependencies = [];
//     while ((result = reg.exec(fileContent))) {
//         dependencies.push(result[1]);
//     }
//     return dependencies;
// }

function getDependencies (filePath) {
    let result = null;
    let dependencies = [];
    const fileContent = fs.readFileSync(filePath).toString();
    // parse
    const ast = parse(fileContent, { sourceType: "CommonJs" });
    // transform
    traverse(ast, {
        enter: (item) => {
            if (
                item.node.type === "CallExpression" &&
                item.node.callee.name === "require"
            ) {
                const dirname = path.dirname(filePath);
                dependencies.push(path.join(dirname, item.node.arguments[0].value));
                console.log("dependencies", dependencies);
            }
        },
    });
    return dependencies;
}



function createGraph (filename) {
    let module = fileToModule(filename);
    let queue = [module]; // [{}]

    for (let module of queue) {
        const dirname = path.dirname(module.id);
        module.dependencies.forEach((relativePath) => { // [ './action.js', './name.js' ]
            const absolutePath = path.join(dirname, relativePath);
            // 看这里看这里   判断一下模块集合中是否已经存在这个模块
            const result = queue.every((item) => {
                return item.id !== absolutePath;
            });
            if (result) {
                // 不存在，直接添加
                const child = fileToModule(absolutePath);
                queue.push(child);
            } else {
                // 存在终止本次循环
                return false;
            }

        });
        //判断一下模块集合中是否已经存在这个模块

    }
    // 上面得到的是一个数组。转化成对象
    let modules = {}
    queue.forEach((item) => {
        modules[item.id] = item.code;
    })
    return modules;
}

// { './index.js': //首先从index入口
//    'function(require,exports){     \n            let action = require("./action.
// js").action;\r\nlet name = require("./name.js").name;\r\nlet message = `${name}
// is ${action}`;\r\nconsole.log(message);;\n        }',
//   'action.js':  //检测到 require action和name
//    'function(require,exports){     \n            let action = "making webpack";\
// r\nexports.action = action;;\n        }',
//   'name.js':  // 在name中又检测到family-name.js
//    'function(require,exports){     \n            let familyName = require("./fam
// ily-name.js").name;\r\nexports.name = `${familyName} 阿尔伯特`;;\n        }',
//   'family-name.js':
//    'function(require,exports){     \n            exports.name = "haiyingsitan";;
// \n        }' }

// console.log(createGraph("./index.js"));


// const exec = function (moduleId) {
//     const fn = modules[moduleId];  // 获取到每个id对应的函数
//     let exports = {};
//     const require = function (filename) {
//         const dirname = path.dirname(moduleId);
//         const absolutePath = path.join(dirname, filename);
//         return exec(absolutePath);
//     }
//     fn(require, exports);
//     return exports
// }

let modules = createGraph("index.js");
// console.log(modules);
function isFileExisted (path_way) {
    return new Promise((resolve, reject) => {
        fs.access(path_way, (err) => {
            if (err) {
                reject(false);//"不存在"
            } else {
                resolve(true);//"存在"
            }
        })
    })
};

function createBundle (modules) {
    let __modules = "";
    for (let attr in modules) {
        __modules += `"${attr}":${modules[attr]},`;
    }
    const result = `(function(){
      const modules = {${__modules}};
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
    })()`;
    isFileExisted('./dist').then(res => {
        fs.writeFileSync("./dist/bundle.js", result);
    }).catch(err => {
        fs.mkdirSync('./dist');
        fs.writeFileSync("./dist/bundle.js", result);
    });

}



createBundle(modules)