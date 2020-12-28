##### 什么是前端路由？

url地址到页面的映射，URL 变化引起 UI 更新（无需刷新页面）

后端路由又可称之为服务器端路由，因为对于服务器来说，当接收到客户端发来的HTTP请求，就会根据所请求的相应URL，来找到相应的映射函数，然后执行该函数，并将函数的返回值发送给客户端。对于最简单的静态资源服务器，可以认为，所有URL的映射函数就是一个文件读取操作。对于动态资源，映射函数可能是一个数据库读取操作，也可能是进行一些数据的处理，等等。然后根据这些读取的数据，在服务器端就使用相应的模板来对页面进行渲染后，再返回渲染完毕的页面。

对于前端路由来说，路由的映射函数通常是进行一些DOM的显示和隐藏操作。这样，当访问不同的路径的时候，会显示不同的页面组件。

##### 如何实现前端路由？

hash 实现

hash一般用作锚点页面内进行导航，改变#后面的字段不会引起页面刷新

通过 hashchange 事件监听 URL 的变化，改变 URL 的方式只有这几种：

1. 通过浏览器前进后退改变 URL
2. 通过`[`](undefined)标签改变 URL
3. 通过window.location改变URL

history 实现

history 提供了 pushState 和 replaceState 两个方法，**这两个方法改变 URL 的path 部分不会引起页面刷新**

history 提供类似 hashchange 事件的 popstate 事件，但 popstate 事件有些不同：

1. 通过浏览器前进后退改变 URL 时会触发 popstate 事件
2. 通过pushState/replaceState或<a>标签改变 URL **不会触发 popstate 事件**。
3. 好在我们可以拦截 pushState/replaceState的调用和a标签的点击事件来检测 URL 变化
4. 通过js 调用history的back，go，forward方法课触发该事件

所以监听 URL 变化可以实现，只是没有 hashchange 那么方便。



hash

```html
<!DOCTYPE html>
<html lang="en">
<body>
<ul>
    <ul>
        <!-- 定义路由 -->
        <li><a href="#/home">home</a></li>
        <li><a href="#/about">about</a></li>

        <!-- 渲染路由对应的 UI -->
        <div id="routeView"></div>
    </ul>
</ul>
</body>
<script>
    let routerView = routeView
    window.addEventListener('hashchange', ()=>{
        let hash = location.hash;
        routerView.innerHTML = hash
    })
    window.addEventListener('DOMContentLoaded', ()=>{
        if(!location.hash){//如果不存在hash值，那么重定向到#/
            location.hash="/"
        }else{//如果存在hash值，那就渲染对应UI
            let hash = location.hash;
            routerView.innerHTML = hash
        }
    })
</script>
</html>

```

history

```html
<!DOCTYPE html>
<html lang="en">
<body>
<ul>
    <ul>
        <li><a href='/home'>home</a></li>
        <li><a href='/about'>about</a></li>

        <div id="routeView"></div>
    </ul>
</ul>
</body>
<script>
    let routerView = routeView
    window.addEventListener('DOMContentLoaded', onLoad)
    window.addEventListener('popstate', ()=>{
        routerView.innerHTML = location.pathname
    })
    function onLoad () {
        routerView.innerHTML = location.pathname // pathname:'/home' 
        var linkList = document.querySelectorAll('a[href]')
        // 通过pushState/replaceState或<a>标签改变 URL 不会触发 popstate 事件。通过拦截a标签的点击行为
        // 也可通过自定义事件
        linkList.forEach(el => el.addEventListener('click', function (e) {  
            e.preventDefault() //阻止默认行为
            history.pushState(null, '', el.getAttribute('href'))  //pushState(state, title, url)
            routerView.innerHTML = location.pathname
        }))
    }

</script>
</html>

```

利用函数劫持，触发自定义的事件

```javascript
var _wr = function(type) {
   var orig = history[type];
   return function() {
       var rv = orig.apply(this, arguments);
      var e = new Event(type);
       e.arguments = arguments;
       window.dispatchEvent(e);
       return rv;
   };
};
 history.pushState = _wr('pushState'); 
 history.replaceState = _wr('replaceState');

window.addEventListener('replaceState', function(e) {
  console.log('THEY DID IT AGAIN! replaceState 111111');
});
window.addEventListener('pushState', function(e) {
  console.log('THEY DID IT AGAIN! pushState 2222222');
});
```

##### 剖析VueRouter本质

Vue项目引入VueRouter。

1. 安装VueRouter，再通过`import VueRouter from 'vue-router'`引入
2. 先 `const router = new VueRouter({...})`,再把router作为参数的一个属性值，`new Vue({router})`
3. 通过Vue.use(VueRouter) 使得每个组件都可以拥有store实例  =>VueRouter拥有install方法



```javascript
//myVueRouter.js

class VueRouter{

}

VueRouter.install = function () {

    

}

export default VueRouter

```



分析Vue.use(plugin)

{ Object | Function } plugin

如果插件是一个对象，必须提供install方法。如果插件是一个函数，它会被作为install方法。调用install方法时，会将Vue作为参数传入。install方法被同一个插件多次调用时，插件也只会被安装一次。

1、插件的类型，可以是install方法，也可以是一个包含install方法的对象。

2、插件只能被安装一次，保证插件列表中不能有重复的插件

实现

```javascript
Vue.use = function(plugin){
	const installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
	if(installedPlugins.indexOf(plugin)>-1){
		return this;
	}
	<!-- 其他参数 -->
	const args = toArray(arguments,1);
	args.unshift(this);
	if(typeof plugin.install === 'function'){
		plugin.install.apply(plugin,args);
	}else if(typeof plugin === 'function'){
		plugin.apply(null,plugin,args);
	}
	installedPlugins.push(plugin);
	return this;
}

```

我们把Vue作为install的第一个参数，所以我们可以把Vue保存起来

同时注册router-link和router-view组件

```javascript
//myVueRouter.js
let Vue = null;
class VueRouter{

}
VueRouter.install = function (v) {
    Vue = v;
   Vue.component('router-link',{
        render(h){
            return h('a',{},'首页')
        }
    })
    Vue.component('router-view',{
        render(h){
            return h('h1',{},'首页视图')
        }
    })

};

export default VueRouter

```

install 一般是给每个vue实例添加东西的

在这里就是**给每个组件添加$route和$router**。

`$router`是VueRouter的实例对象，`$route`是当前路由对象，也就是说`$route`是`$router`的一个属性

```javascript
new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
```

这里的Vue 是根组件啊。也就是说目前只有根组件有这个router值，而其他组件是还没有的，所以我们需要让其他组件也拥有这个router。

继续完善

```javascript
//myVueRouter.js
let Vue = null;
class VueRouter{

}
VueRouter.install = function (v) {
    Vue = v;
    // 新增代码
    Vue.mixin({
        beforeCreate(){
            if (this.$options && this.$options.router){ // 如果是根组件
                this._root = this; //把当前实例挂载到_root上
                this._router = this.$options.router;
            }else { //如果是子组件
                this._root= this.$parent && this.$parent._root
            }
            Object.defineProperty(this,'$router',{
                get(){
                    return this._root._router
                }
            })
        }
    })

    Vue.component('router-link',{
        render(h){
            return h('a',{},'首页')
        }
    })
    Vue.component('router-view',{
        render(h){
            return h('h1',{},'首页视图')
        }
    })
};

export default VueRouter


```

这里有个问题，为什么判断当前组件是子组件，就可以直接从父组件拿到_root根组件呢？这让我想起了曾经一个面试官问我的问题：**父组件和子组件的执行顺序**？

> A：父beforeCreate-> 父created -> 父beforeMounte  -> 子beforeCreate ->子create ->子beforeMount ->子 mounted -> 父mounted

可以得到，在执行子组件的beforeCreate的时候，父组件已经执行完beforeCreate了，那理所当然父组件已经有_root了。

然后我们通过

```
Object.defineProperty(this,'$router',{
  get(){
      return this._root._router
  }
})
```

将`$router`挂载到组件实例上。

其实这种思想也是一种代理的思想，我们获取组件的`$router`，其实返回的是根组件的`_root._router`