Proxy又叫拦截器,就是在你操作对象或函数前，进行拦截，拦截的同时提供了做了某些操作，通过Proxy，我们可以不操作对象，通过Proxy**代理对象**来间接操作对象或函数来达到我们的目的

```javascript
let obj = {
	name:'Juejin'
}
let customProxy = new Proxy(obj,{
	get(target,property){
    	console.log(`我在获取${property}属性的值`);
        return target[property]
    }
})

console.log(customProxy.name)
```



定义如下：const p = new Proxy(target, handler)

- `target`:就是你要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- `handler`:是一个对象，里面有各种你可以代理的方法

handler.get(target,property,receiver)

- `target`:就是你代理的对象
- `property`:你要读取的属性
- `receiver`:Proxy或者继承Proxy的对象



应用：不允许访问某个值

```javascript
let obj = {
  secret：'我是密码，我不想被外面拿到'
}
//定义proxy
const objp = new Proxy(obj,{
	get(target,property){
    	if(property==='secret'){
       		throw Error(`${property}属性不允许被访问`) 	
        }else{
        	return target[property]
        }
    }
})
console.log(objp.secret)
```



handler.set(target, property, value, receiver)

- `target`:就是你代理的对象
- `property`:你要读取的属性
- `value`:你要设置的新值
- `receiver`:Proxy或者继承Proxy的对象

```javascript
let obj = {
	name:'juejin',
    age:100
}
const objp =  new Proxy(obj,{
	set(target, property, value, receiver){
    	console.log(target,property,value,receiver)
        //当设置的只重複時,抛出警告
        if(value===target[property]){
        	console.warn('該值不可重複設置');
            throw Error('該值不可重複設置')
        }else{
            target[property] = value
        	return  target[property]
        }
    }
})
objp.name = "juejin";
```

拦截函数

handler.apply(target, thisArg, argumentsList)

- `target`:就是你代理的对象(必须是函数)
- `thisArg`:被调用时的上下文对象。（this）
- `argumentsList`:被调用时的参数数组

```javascript
function sum(a,b){
	return a+b
}
// 生成一个新函数
const sump = new Proxy(sum,{   
	apply(target,thisArg,argumentsList){
    	console.log(target,thisArg,argumentsList)
     	if(argumentsList.length>2){
        	throw new Error('该方法只接收两个参数，请避免输入过多参数');
        }
        return Reflect.apply(target, thisArg, argumentsList);
    }
})
sump(1,2,2)
```



在 ES6 中增加Reflect这个对象的目的：

1. 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上。现阶段，某些方法同时在 Object 和 Reflect 对象上部署，未来的新方法将只部署在 Reflect 对象上。也就是说，从 Reflect 对象上可以拿到语言内部的方法。
2. 修改某些 Object 方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty(obj, name, desc)则会返回 false。
3. 让 Object 操作都变成函数行为。某些 Object 操作是命令式，比如 name in obj 和 delete obj[name]，而 Reflect.has(obj, name)和 Reflect.deleteProperty(obj, name)让它们变成了函数行为。
4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。这就让 Proxy 对象可以方便地调用对应的 Reflect 方法，完成默认行为，作为修改行为的基础。也就是说，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。



个人理解,就是Reflect是ES6为了操作对象而提供的新API,未来的新方法将只部署在Reflect对象上，也就是Reflect的原型是Object. 

Reflect与Proxy是相辅相成的，Reflect拥有所有Proxy对象的方法（方便访问，返回值）

