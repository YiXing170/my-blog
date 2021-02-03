##### DOM

可以使用 `document` 或 `window` 元素的 API 来操作文档本身或获取文档的子类（Web 页面中的各种元素）。

```javascript
// 获取元素
const node = document.getElementById(id); // 或者 querySelector(".class|#id|name");

// 创建元素
const heading = document.createElement(name); // name: p、div、h1...
heading.innerHTML = '';

// 添加元素
document.body.appendChild(heading);

// 删除元素
document.body.removeChild(node);
```

##### 事件流

什么是事件流：事件流描述的是从**页面中接收事件的顺序**，`DOM 2` 级事件流包括下面几个阶段。

- 事件捕获阶段
- 处于目标阶段
- 事件冒泡阶段

如何让事件先冒泡后捕获：

在 `DOM` 标准事件模型中，是先捕获后冒泡。但是如果要实现先冒泡后捕获的效果，对于同一个事件，监听捕获和冒泡，分别对应相应的处理函数，监听到捕获事件，先暂缓执行，直到冒泡事件被捕获后再执行捕获之间。



`addEventListener` 方法将指定的监听器注册到 `EventTarget` 上，当该对象触发指定的事件时，指定的回调函数就会被执行。

`addEventListener` 事件目标可以是文档上的元素 `Element`、`Document` 和 `Window` 或者任何其他支持事件的对象（例如 `XMLHttpRequest`）。

- 语法：`target.addEventListener(type, listener, options/useCapture)`

1. `type`：表示监听事件类型的字符串
2. `listener`：所监听的事件触发，会接受一个事件通知对象。
3. `options`：一个指定有关 `listener` 属性的可选参数对象。可选值有 `capture`（事件捕获阶段传播到这里触发）、`once`（在 `listener` 添加之后最多值调用一次）、`passive`（设置为 `true` 时表示 `listener` 永远不会调用 `preventDefault()`）。
4. `useCapture`：在 DOM 树中，注册了 `listener` 的元素，是否要先于它下面的 `EventTarget` 调用该 `listener`。



> `addEventListener` 的第三个参数涉及到冒泡和捕获，为 `true` 时是捕获，为 `false` 时是冒泡。

> 或者是一个对象 `{ passive: true }`，针对的是 `Safari` 浏览器，禁止/开启使用滚动的时候要用到

事件捕获和事件冒泡分别是 **网景**（Netscape）和 **IE** 对 `DOM` 事件产生顺序的描述。

原理：

**网景** 认为 `DOM` 接收的事件应该最先是 `window`，然后到 `document`，接着一层一层往下，最后才到具体的元素接收到事件，即 **事件捕获**。

**IE** 则认为 `DOM` 事件应该是具体元素先接收到，然后再一层一层往上，接着到 `document`，最后才到 `window`，即 **事件冒泡**。

最后 **W3C** 对这两种方案进行了统一：将 `DOM` 事件分为两个阶段，事件捕获和事件冒泡阶段。

当一个元素被点击，首先是事件捕获阶段，`window` 最先接收事件，然后一层一层往下捕获，最后由具体元素接收；之后再由具体元素再一层一层往上冒泡，到 `window` 接收事件。

所以：

- **事件冒泡**：当给某个目标元素绑定了事件之后，这个事件会依次在它的父级元素中被触发（当然前提是这个父级元素也有这个同名称的事件，比如子元素和父元素都绑定了 `click` 事件就触发父元素的 `click`）。
- **事件捕获**：和冒泡相反，会从上层传递到下层。



阻止冒泡

- `event.stopPropagation();`

并不是所有的事件都有冒泡，例如：

- `onblur`
- `onfocus`
- `onmouseenter`
- `onmouseleave`



##### typeof 和 instanceof 的区别

- `typeof`：对某个变量类型的检测，基本类型除了 `null` 之外，都能正常地显示为对应的类型，引用类型除了函数会显示为 `function`，其他都显示为 `object`。
- `instanceof` 主要用于检测某个构造函数的原型对象在不在某个对象的原型链上。

`typeof` 会对 `null` 显示错误是个历史 Bug，`typeof null` 输出的是 `object`，因为 JavaScript 早起版本是 32 位系统，为了性能考虑使用低位存储变量的类型信息，`000` 开头代表是对象然而 `null` 表示为全零，所以它错误判断为 `object`。

另外还有 `Object.prototype.toString.call()` 进行变量判断。

##### 一句话描述 this

对于函数而言，指向最后调 

用函数的那个对象，是函数运行时内部自动生成的一个内部对象，只能在函数内部使用；对于全局而言，`this` 指向 `window`。

##### js元素的宽高/距离

`clientHeight`：获取所选元素可视区域的高度，不包含 `border` ，滚动条，margin

`offsetHeight`：获取所选元素可视区域的高度，包含了 `border` 和滚动条，不包含margin

`scrollHeight`：获取所选元素所有区域的高度，包含了因为滚动被隐藏的部分

`clientTop`：表示边框 `border` 的厚度，在未指定的情况下一般为`0`

`scrollTop`：滚动后被隐藏的高度，获取对象相对于由 `offsetParent` 属性指定的父坐标（CSS 定位的元素或 `body` 元素）距离顶端的高度。

`offsetTop`：当前元素顶部距离最近的设置了position属性的父元素顶部的距离,和有没有滚动条没有关系。单位px，只读元素。

`event.clientX` 相对文档的水平座标 
`event.clientY` 相对文档的垂直座标 

`event.offsetX` 相对容器的水平坐标 
`event.offsetY` 相对容器的垂直坐标  



##### 执行上下文类型

JavaScript 中有 3 种执行上下文类型：

- **全局执行上下文**：这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 `window` 对象（浏览器的情况下），并且设置 `this` 的值等于这个全局对象。一个程序中只会有一个全局执行上下文。
- **函数执行上下文**：每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建，它会按定义的顺序执行一系列步骤。
- **Eval 函数执行上下文**：执行在 `eval` 函数内部的代码也会有它属于自己的执行上下文，但由于 JavaScript 开发者并不经常使用 `eval`，所以在这里我不会讨论它。



**执行栈**，也就是在其它编程语言中所说的 “调用栈”，是一种拥有 `LIFO`（后进先出）数据结构的栈，被用来存储代码运行时创建的所有执行上下文。

当 JavaScript 引擎第一次遇到你的脚本时，它会创建一个全局的执行上下文并且压入当前执行栈。每当引擎遇到一个函数调用，它会为该函数创建一个新的执行上下文并压入栈的顶部。

引擎会执行那些执行上下文位于栈顶的函数。当该函数执行结束时，执行上下文从栈中弹出，控制流程到达当前栈中的下一个上下文。

```
let a = 'Hello World!';

function first() {
  console.log('Inside first function');
  second();
  console.log('Again inside first function');
}

function second() {
  console.log('Inside second function');
}

first();
console.log('Inside Global Execution Context');
```

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d9e8a01c9454a27acce6bef077e6793~tplv-k3u1fbpfcp-watermark.image)

函数递归也是执行栈的体现

##### babel 编译原理

- `babylon` 将 `ES6/ES7` 代码解析成 `AST`
- `babel-traverse` 对 `AST` 进行遍历转译，得到新的 `AST`
- 新 `AST` 通过 `babel-generator` 转换成 `ES5`

这一块的话 **jsliang** 并没有过分深究，单纯理解的话还是容易理解的：

1. 黑白七巧板组成的形状，拆分出来得到零件（`ES6/ES7` 解析成 `AST`）
2. 将这些零件换成彩色的（`AST` 编译得到新 `AST`）
3. 将彩色零件拼装成新的形状（`AST` 转换为 `ES5`）