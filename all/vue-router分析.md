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

