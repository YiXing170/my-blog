let action = require("./action.js");  // 导入的是module.exports
// let name = require("./name.js").name;
// let message = `${name} is ${action}`;
// console.log(action);
setInterval(() => {
  console.log(action);
}, 1000)