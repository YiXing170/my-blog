[生成器](https://link.jianshu.com?t=https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)对象是由function* 返回的，并且符合[可迭代协议和迭代器协议](https://link.jianshu.com?t=https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)。
这里有几个概念生成器、可迭代协议、迭代器协议。具体的概念可以点击链接查看MDN文档。

function*: 定义一个生成器函数，返回一个Generator对象；
可迭代协议： 允许 JavaScript 对象去定义或定制它们的迭代行为；
迭代器协议： 定义了一种标准的方式来产生一个有限或无限序列的值；当一个对象被认为是一个迭代器时，它实现了一个 next() 的方法，next()返回值如下：

```javascript
{
 done:true,//false迭代是否结束，
 value:v,//迭代器返回值
}
```

简单的迭代生成函数

```javascript
// 1. 迭代器生成

let iterator = (items)=>{
  let iter = {
    index:0,
    max:items.length,
    next:function(){ // 返回调用结果
      return this.index === this.max ? {value:undefined,done:true}
      : {value:items[this.index++],done:false};
    }
  }

  return iter;
}

ieerator([1,2,3,4])
```

Generator

```javascript
// generator
function *generator(items){
  let index = 0;
  let max = items.length;

  while (index < max){
    yield items[index++];
  }

}

let gene = generator([1,2,3,4]);
result = null;
console.log('``````````generator`````````');
do{
  result = gene.next();
  console.log(result)
}while(!result.done)
```

使用生成器 处理异步任务   =>按照同步的方式执行

```javascript
let tick = (duration)=>{
  return new Promise((resolve)=>{
    setTimeout(function () {
      console.log(duration,new Date());
      resolve(duration);
    },duration);
  });
};

function *generator() {
  var result = yield tick(2000);
  console.log('result = ',result);
  result = yield tick(4000);
  console.log('result = ',result);
  result = yield tick(3000);
  console.log('result = ',result);
}

// 做使用的封装
let run = (generator,res)=>{
  var result = generator.next(res);
  if(result.done) return;
  result.value.then((res)=>{
    run(generator,res);
  });
}

run(generator());
```

async /await  实现

```javascript
let tick = (duration)=>{
  return new Promise((resolve)=>{
    setTimeout(function () {
      console.log(new Date());
      resolve(duration);
    },duration);
  });
}


async function asyncFunc(){
  var result = await tick(1000);
  console.log(result);
  result = await tick(2000);
  console.log(result);
  result = await tick(3000);
  console.log(result);
}

asyncFunc();
```



1 内置执行器。

上面的代码调用了`asyncFunc`函数，然后它就会自动执行，输出最后结果。这完全不像 Generator 函数，需要调用`next`方法，或者用`co`模块，才能真正执行，得到最后结果。

2更好的语义。

`async`和`await`，比起星号和`yield`，语义更清楚了。`async`表示函数里有异步操作，`await`表示紧跟在后面的表达式需要等待结果。

3更广的适用性。

`co`模块约定，`yield`命令后面只能是 Thunk 函数或 Promise 对象，而`async`函数的`await`命令后面，可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）。

4返回值是 Promise。

`async`函数的返回值是 Promise 对象，这比 Generator 函数的返回值是 Iterator 对象方便多了。你可以用`then`方法指定下一步的操作。

进一步说，`async`函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而`await`命令就是内部`then`命令的语法糖。

