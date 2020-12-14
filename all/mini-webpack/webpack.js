//来源：https://juejin.cn/post/6893809205183479822#heading-0

const fs = require('fs');
const path = require('path');
let modules = {}
const fileToModule = function (path) {
    const fileContent = fs.readFileSync(path).toString()
    return {
        id: path,
        // 这里加壳了
        code: `function(require,exports){     
            ${fileContent.toString()};
        }`,
        dependencies: getDependencies(fileContent), // 获取依赖数组 [ './action.js', './name.js' ]
    }
}
let result = fileToModule('./index.js')
modules[result['id']] = result.code


function getDependencies(fileContent) {
    let reg = /require\(['"](.+?)['"]\)/g;
    let result = null;
    let dependencies = [];
    while ((result = reg.exec(fileContent))) {
        dependencies.push(result[1]);
    }
    return dependencies;
}


function createGraph(filename) {
    let module = fileToModule(filename);
    let queue = [module]; // [{}]

    for (let module of queue) {
        const dirname = path.dirname(module.id);
        module.dependencies.forEach((relativePath) => { // [ './action.js', './name.js' ]
            const absolutePath = path.join(dirname, relativePath);
            const child = fileToModule(absolutePath);
            queue.push(child);
        });
    }
    // 上面得到的是一个数组。转化成对象
    let modules = {}
    queue.forEach((item) => {
        modules[item.id] = item.code;
    })
    return modules;
}
console.log(createGraph("./index.js"));