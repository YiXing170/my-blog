let action = { name: "making webpack" };
exports.action = action;
setTimeout(() => {
  action = { a: 1 }
}, 5000)