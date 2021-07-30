##### 什么是前端路由？

url地址到页面的映射，URL 变化引起 UI 更新（无需刷新页面）

后端路由又可称之为服务器端路由，因为对于服务器来说，当接收到客户端发来的HTTP请求，就会根据所请求的相应URL，来找到相应的映射函数，然后执行该函数，并将函数的返回值发送给客户端。对于最简单的静态资源服务器，可以认为，所有URL的映射函数就是一个文件读取操作。对于动态资源，映射函数可能是一个数据库读取操作，也可能是进行一些数据的处理，等等。然后根据这些读取的数据，在服务器端就使用相应的模板来对页面进行渲染后，再返回渲染完毕的页面。

对于前端路由来说，路由的映射函数通常是进行一些DOM的显示和隐藏操作。这样，当访问不同的路径的时候，会显示不同的页面组件。

##### 如何实现前端路由？

hash 实现

hash一般用作锚点页面内进行导航，改变#后面的字段不会引起页面刷新

通过 hashchange 事件监听 URL 的变化，改变 URL 的方式只有这几种：

1. 通过浏览器前进后退改变 URL
2. 通过a标签改变 URL
3. 通过window.location改变URL

history 实现

history 提供了 pushState 和 replaceState 两个方法，**这两个方法改变 URL 的path 部分不会引起页面刷新**

history 提供类似 hashchange 事件的 popstate 事件，但 popstate 事件有些不同：

1. 通过浏览器前进后退改变 URL 时会触发 popstate 事件
2. 通过pushState/replaceState或<a>标签改变 URL **不会触发 popstate 事件**。
3. 好在我们可以拦截 pushState/replaceState的调用和a标签的点击事件来检测 URL 变化
4. 通过js 调用history的back，go，forward方法可触发该事件

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
  console.log('THEY DID IT AGAIN! replaceState 111111'); // 拦截后做组件渲染
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

> A：父beforeCreate-> 父created -> 父beforeMount  -> 子beforeCreate ->子create ->子beforeMount ->子 mounted -> 父mounted

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

```javascript
const router = new VueRouter({
  mode:"history",
  routes
})
```



当new VueRouter时传入了一个为数组的路由表routes，还有一个代表 当前是什么模式的mode。因此我们可以先这样实现VueRouter

```javascript
class VueRouter{
    constructor(options) {
        this.mode = options.mode || "hash"
        this.routes = options.routes || [] //你传递的这个路由是一个数组表
    }
}

```

直接处理routes是十分不方便的，所以我们先要转换成`key：value`的格式

```javascript
//myVueRouter.js
let Vue = null;
class VueRouter{
    constructor(options) {
        this.mode = options.mode || "hash"
        this.routes = options.routes || [] //你传递的这个路由是一个数组表
        this.routesMap = this.createMap(this.routes)
        console.log(this.routesMap);
    }
  //  '/url'=>'component'
    createMap(routes){
        return routes.reduce((pre,current)=>{
            pre[current.path] = current.component
            return pre;
        },{})
    }
}
```

保存当前的路由信息

```javascript
//myVueRouter.js
let Vue = null;
class HistoryRoute {
    constructor(){
        this.current = null
    }
}
class VueRouter{
    constructor(options) {
        this.mode = options.mode || "hash"
        this.routes = options.routes || [] //你传递的这个路由是一个数组表
        this.routesMap = this.createMap(this.routes) // 生成url到组件的映射
        this.history = new HistoryRoute();  // 保存当前url
        新增代码
        this.init()

    }
    新增代码
    init(){
        if (this.mode === "hash"){
            // 先判断用户打开时有没有hash值，没有的话跳转到#/
            location.hash? '':location.hash = "/";
            window.addEventListener("load",()=>{
                this.history.current = location.hash.slice(1)
            })
            window.addEventListener("hashchange",()=>{
                this.history.current = location.hash.slice(1)
            })
        } else{
            location.pathname? '':location.pathname = "/";
            window.addEventListener('load',()=>{
                this.history.current = location.pathname
            })
            window.addEventListener("popstate",()=>{
                this.history.current = location.pathname
            })
        }
    }

    createMap(routes){
        return routes.reduce((pre,current)=>{
            pre[current.path] = current.component
            return pre;
        },{})
    }

}
```

实现$route

```javascript
VueRouter.install = function (v) {
    Vue = v;
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
            });
             // 新增代码  拿到current
            Object.defineProperty(this,'$route',{
                get(){
                    return this._root._router.history.current
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
```

完善router-view组件

我们已经保存了当前路径，也就是说现在我们可以获得当前路径，然后再根据当前路径从路由表中获取对应的组件进行渲染

```javascript
Vue.component('router-view',{
    render(h){
        let current = this._self._root._router.history.current   // self为代理对象
        let routeMap = this._self._root._router.routesMap;
        return h(routeMap[current])
    }
})
```

render函数里的this指向的是一个Proxy代理对象，代理Vue组件，而我们前面讲到每个组件都有一个_root属性指向根组件，根组件上有_router这个路由实例。所以我们可以从router实例上获得路由表，也可以获得当前路径。然后再把获得的组件放到h()里进行渲染。

现在已经实现了router-view组件的渲染，但是有一个问题，就是你改变路径，视图是没有重新渲染的，所以需要将_router.history进行响应式化。

```javascript
Vue.mixin({
    beforeCreate(){
        if (this.$options && this.$options.router){ // 如果是根组件
            this._root = this; //把当前实例挂载到_root上
            this._router = this.$options.router;
            新增代码
            Vue.util.defineReactive(this,"xxx",this._router.history)
        }else { //如果是子组件
            this._root= this.$parent && this.$parent._root
        }
        Object.defineProperty(this,'$router',{
            get(){
                return this._root._router
            }
        });
        Object.defineProperty(this,'$route',{
            get(){
                return this._root._router.history.current
            }
        })
    }
})

```

当我们第一次渲染**router-view**这个组件的时候，会去访问`this._router.history`这个对象，就会把**router-view**组件的依赖**wacther**收集到`this._router.history`对应的收集器**dep**中，因此`this._router.history`每次改变的时候。`this._router.history`对应的收集器**dep**就会通知**router-view**的组件依赖的**wacther**执行**update()**，从而使得`router-view`重新渲染（**其实这就是vue响应式的内部原理**）

完善router-link组件

link的使用

```javascript
<router-link to="/home">Home</router-link> 
<router-link to="/about">About</router-link>
```

```javascript
Vue.component('router-link',{
    props:{
        to:String
    },
    render(h){
        let mode = this._self._root._router.mode;
        let to = mode === "hash"?"#"+this.to:this.to
        return h('a',{attrs:{href:to}},this.$slots.default)
    }
})
```

总结： Vue.use()进行 $router和$route 的挂载（此时并不是真正挂载，只是利用mixin ，让每个组件都有beforecreated钩子，其中作了 $router 和  ​$route 的代理，再 new VueRouter()得到全局router，在在new Vue（）中传进去router配置，每个组件执行beforecreated钩子后就会有 $  router 和 $ route 属性



