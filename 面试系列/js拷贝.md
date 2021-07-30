**深浅拷贝的区别**

浅拷贝拷贝的是值，基础类型就是原始值，对象类型就是堆内存的地址值，对象发生改变会互相影响

深拷贝就是不管是什么类型的值，不管有多深层级，完全复制且互不影响

**手写浅拷贝**

简单的手写版本

```javascript
const checkType = (target) => {
      return Object.prototype.toString.call(target).slice(8, -1)
    }
function shadowClone(target) {
      let result
      if (checkType(target) === 'Object') {
        result = {}
      } else {
        result = []
      }
      for (let key in target) {
        if (target.hasOwnProperty(key)) {
          result[key] = target[key]
        }
      }
      return result
 }
```

还有Object.assign() ，数组的concat slice， 展开运算符等都是浅拷贝

深拷贝

简单的手写版本

```javascript
const checkType = (target) => {
   return Object.prototype.toString.call(target).slice(8, -1)
}
function deepClone(target) {
      // let result
      // if (checkType(target) === 'Object') {
      //   result = {}
      // } else if (checkType(target) === 'Array') {
      //   result = []
      // } else {
      //   return target
      // }
      // for (let key in target) {
      //   if (target.hasOwnProperty(key)) {
      //     if (checkType(target[key]) === 'Object' || checkType(target[key]) === 'Array') {
      //       result[key] = deepClone(target[key])
      //     } else {
      //       result[key] = target[key]
      //     }
      //   }
      // }
      // return result

      // 复习

      let result
      if(Object.prototype.toString.call(target)==='[object Object]'){
        result={}
      }else if(Object.prototype.toString.call(target)==='[object Array]'){
        result={}
      }else{
         return target
      }

      for(let key in target){
        if(target.hasOwnProperty(key)){
          if(typeof target[key]==='object'){
            result[key]=deepClone(target[key])
          }else{
            result[key]=target[key]
          }
        }
      }
      return target
}
```

这个版本还有缺陷，如未考虑循环依赖 ，其他对象（像Date RegExp ），函数的拷贝等等，过程可参考https://juejin.cn/post/6844903929705136141#heading-0

业务开发中常用的是JSON.parse(JSON.stringify(obj))

但要注意不能拷贝 JSON中不支持的数据类型

如 ：1函数或者 Undefined，否则会丢失函数或者 Undefined；

2时间对象，否则会变成字符串形式

3 RegExp、Error 对象，否则会变成空对象

4 NaN、Infinity、-Infinity，否则会变成 null

也可使用函数库中深拷贝

如lodash ：_.deepClone(obj)

还有jquery中的 $.extend() 也可进行深拷贝

