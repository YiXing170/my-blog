#### **nextTick简单实现**

```javascript
let callbacks = [];
let pending = false;
let timerFunc



if(typeof Promise !== 'undefined) { //判断当前浏览器是否支持promise，如支持，用promise实现异步刷新dom
   const p = Promise.resolve();
   timerFunc = () => {
       p.then(flushCallbacks)
   }
} else if(typeof MutationObserver !== 'undefined') {
   let counter = 1;
   const observe = new MutationObserver(flushCallbacks);
   const textNode = document.createTextNode(String(counter));
   observe.observe(textNode,{
       characterData: true
   })
   timerFunc = () => {
       conter = (conter + 1) % 2;
       textNode.data = String(counter)
   }
} else {
   timerFunc = () => {
       setTimeout(flushCallbacks,0)
   }
}

function flushCallbacks () {
   pending = false
   const copies = callbacks.slice(0)
   callbacks.length = 0
   for (let i = 0; i < copies.length; i++) {
       copies[i]()
   }
}

function nextTick(cb,ctx) { //ctx是vue实例
   let _resolve;
   callbacks.push(() => {
       if(cb) {
           cb.call(ctx) //官网对nextTick的解释 自动绑定调用他的实例，就是vue的实例
       } else if (_resolve) {
           _resolve(ctx);
       }
   })
   if(!pending) {
       pending = true;
       timerFunc();
   }
   if(!cb && type Promise !== 'undefined) {
       return new Promise(resolve => {
           _resolve = resolve
       })
   }
}
```

Vue 异步更新的大概流程：依赖收集结束之后，当响应式数据发生变化 -> 触发 setter 执行 dep.notify -> 让 dep 通知 自己收集的所有 watcher 执行 update 方法 -> watch.update 调用 queueWatcher 将自己放到 watcher 队列 -> 接下来调用 nextTick 方法将刷新 watcher 队列的方法（flushSchedulerQuene）放到 callbacks 数组 -> 然后将刷新 callbacks 数组的方法（flushCallbacks）放到浏览器的异步任务队列 -> 待将来执行时最终触发 watcher.run 方法，执行 watcher.get 方法。



#### 事件队列

所有任务可以分成两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）。

同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；

异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行 

（1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。

（2）主线程之外，还存在一个"任务队列"（task queue）。

（3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。

（4）主线程不断重复上面的第三步。

  注：只要主线程空了，就会去读取"任务队列"，这就是JavaScript的运行机制

   任务队列：

    "任务队列"中的事件，除了IO设备的事件以外，还包括一些用户产生的事件（比如鼠标点击、页面滚动等等）。只要指定过回调函数，这些事件发生时就会进入"任务队列"，等待主线程读取。"任务队列"是一个先进先出的数据结构，排在前面的事件，优先被主线程读取。



`任务队列(task queue)`中的异步任务分为两种：`微任务（microtask)`和`宏任务（macrotask)`。

 **宏任务（macrotask)：** 在浏览器端，其可以理解为该任务执行完后，在下一个macrotask执行开始前，浏览器可以进行页面渲染。触发macrotask任务的操作包括：

           `setTimeout`、`setInterval`、`setImmediate`、`I/O`、`UI rendering`macro task事件：

备注：宏任务一般是当前事件循环的最后一个任务，ui的渲染在这里最后执行，浏览器的ui绘制会插在每个macrotask之间，这就是为什么angularjs中settimeout会触发视图更新的原因。阻塞macrotask会导致ui数据不能更新



**微任务**（microtask）可以理解为页面渲染前立即执行的任务，值得注意的是，UI Rendering是在micro-task之后执行。给micro-task队列添加过多回调阻塞macro-task队列的任务执行是小事，重点是这有可能会阻塞UI Render，导致页面不能更新。浏览器也会基于性能方面的考虑，对micro-task中的任务个数进行限制。触发microtask任务的操作包括：

`    Promises(浏览器实现的原生Promise)`、`MutationObserver`、`process.nextTick`



**Macrotasks、Microtasks执行机制：**

      1.主线程执行完后会先到micro-task队列中读取可执行任务

      2.主线程执行micro-task任务

      3.主线程到macro-task任务队列中读取可执行任务

      4.主线程执行macro-task任务

      5....转到Step 1

