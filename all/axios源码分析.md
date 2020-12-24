##### 项目目录

```
├── /dist/                     # 项目输出目录
├── /lib/                      # 项目源码目录
│ ├── /cancel/                 # 定义取消功能
│ ├── /core/                   # 一些核心功能
│ │ ├── Axios.js               # axios的核心主类
│ │ ├── dispatchRequest.js     # 用来调用http请求适配器方法发送请求
│ │ ├── InterceptorManager.js  # 拦截器构造函数
│ │ └── settle.js              # 根据http响应状态，改变Promise的状态
│ ├── /helpers/                # 一些辅助方法
│ ├── /adapters/               # 定义请求的适配器 xhr、http
│ │ ├── http.js                # 实现http适配器
│ │ └── xhr.js                 # 实现xhr适配器
│ ├── axios.js                 # 对外暴露接口  入口文件
│ ├── defaults.js              # 默认配置 
│ └── utils.js                 # 公用工具
├── package.json               # 项目信息
├── index.d.ts                 # 配置TypeScript的声明文件
└── index.js                   # 入口文件
```

作为axios项目的入口文件，我们先来看下`axios.js`的源码

##### createInstance

能够实现axios的多种使用方式的核心是`createInstance`方法：

```javascript
// /lib/axios.js
function createInstance(defaultConfig) {
  // 创建一个Axios实例
  var context = new Axios(defaultConfig);

  // 以下代码也可以这样实现：var instance = Axios.prototype.request.bind(context);
  // 这样instance就指向了request方法，且上下文指向context，所以可以直接以 instance(option) 方式调用 
  // Axios.prototype.request 内对第一个参数的数据类型判断，使我们能够以 instance(url, option) 方式调用
  var instance = bind(Axios.prototype.request, context);

  // 把Axios.prototype上的方法扩展到instance对象上，
  // 这样 instance 就有了 get、post、put等方法
  // 并指定上下文为context，这样执行Axios原型链上的方法时，this会指向context
  utils.extend(instance, Axios.prototype, context);

  // 把context对象上的自身属性和方法扩展到instance上
  // 注：因为extend内部使用的forEach方法对对象做for in 遍历时，只遍历对象本身的属性，而不会遍历原型链上的属性
  // 这样，instance 就有了  defaults、interceptors 属性。（这两个属性后面我们会介绍）
  utils.extend(instance, context);

  return instance;
}

// 接收默认配置项作为参数（后面会介绍配置项），创建一个Axios实例，最终会被作为对象导出
var axios = createInstance(defaults);
```

因为最终想得到是一个函数，这个Function指向`Axios.prototype.request`，这个Function还会有`Axios.prototype`上的每个方法作为静态方法，且这些方法的上下文都是指向同一个对象。

而`Axios`构造函数的核心方法是原型上的`request`方法，各种axios的调用方式最终都是通过`request`方法发请求的

```javascript
// /lib/core/Axios.js
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

Axios.prototype.request = function request(config) {
  // ...省略代码
};

// 为支持的请求方法提供别名
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

通过以上代码，我们就可以以多种方式发起http请求了: `axios()、axios.get()、axios.post()`

一般情况，项目使用默认导出的axios实例就可以满足需求了，如果不满足需求需要创建新的axios实例，axios包也预留了接口，看下面的代码：

```
// /lib/axios.js  -  31行
axios.Axios = Axios;
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};
```

##### 用户配置的config是怎么起作用的？

这里说的`config`，指的是贯穿整个项目的配置项对象，
通过这个对象，可以设置：

`http请求适配器、请求地址、请求方法、请求头header、 请求数据、请求或响应数据的转换、请求进度、http状态码验证规则、超时、取消请求等`

可以发现，几乎`axios`所有的功能都是通过这个对象进行配置和传递的，既是`axios`项目内部的沟通桥梁，也是用户跟`axios`进行沟通的桥梁。

首先我们看看，用户能以什么方式定义配置项:

```javascript
import axios from 'axios'

// 第1种：直接修改Axios实例上defaults属性，主要用来设置通用配置
axios.defaults[configName] = value;

// 第2种：发起请求时最终会调用Axios.prototype.request方法，然后传入配置项，主要用来设置“个例”配置
axios({
  url,
  method,
  headers,
})

// 第3种：新建一个Axios实例，传入配置项，此处设置的是通用配置
let newAxiosInstance = axios.create({
  [configName]: value,
})
```

由此得出，多处配置的优先级由低到高是：
—> 默认配置对象`defaults`（`/lib/defaults.js`)
—> { method: 'get' }
—> Axios实例属性`this.defaults`
—> `request`请求的参数`config`

##### config是怎么传递的呢？

```javascript
Axios.prototype.request = function request(config) {
  // ...
  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);

  var chain = [dispatchRequest, undefined];
  // 将config对象当作参数传给Primise.resolve方法
  var promise = Promise.resolve(config);

  // ...省略代码

  while (chain.length) {
    // config会按序通过 请求拦截器 - dispatchRequest方法 - 响应拦截器
    // 关于拦截器 和 dispatchRequest方法，下面会作为一个专门的小节来介绍。
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};
```
##### 如何拦截请求响应并修改请求参数修改响应数据

```javascript
// 添加请求拦截器
const myRequestInterceptor = axios.interceptors.request.use(config => {
    // 在发送http请求之前做些什么
    return config; // 有且必须有一个config对象被返回
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  // 对响应数据做点什么
  return response; // 有且必须有一个response对象被返回
}, error => {
  // 对响应错误做点什么
  return Promise.reject(error);
});

// 移除某次拦截器
axios.interceptors.request.eject(myRequestInterceptor);

```

每个axios实例都有一个`interceptors`实例属性，interceptors对象上有两个属性`request`、`response`。

```javascript
function Axios(instanceConfig) {
  // ...
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
```

再看InterceptorManager函数，这个构造函数原型上有3个方法：use、eject、forEach。

```javascript
// /lib/core/InterceptorManager.js

function InterceptorManager() {
  this.handlers = []; // 存放拦截器方法，数组内每一项都是有两个属性的对象，两个属性分别对应成功和失败后执行的函数。
}

// 往拦截器里添加拦截方法
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

// 用来注销指定的拦截器
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

// 遍历this.handlers，并将this.handlers里的每一项作为参数传给fn执行
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

```

那么当我们通过`axios.interceptors.request.use`添加拦截器后，axios内部又是怎么让这些拦截器能够在请求前、请求后拿到我们想要的数据的呢？

```javascript

// /lib/core/Axios.js
Axios.prototype.request = function request(config) {
  // ...
  var chain = [dispatchRequest, undefined];

  // 初始化一个promise对象，状态为resolved，接收到的参数微config对象
  var promise = Promise.resolve(config);

  // 注意：interceptor.fulfilled 或 interceptor.rejected 是可能为undefined
  // request={handlers:[{fulfilled:-,rejected:-}]}  原型上有forEach
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 添加了拦截器后的chain数组大概会是这样的：
  // [
  //   requestFulfilledFn, requestRejectedFn, ..., 
  //   dispatchRequest, undefined,
  //   responseFulfilledFn, responseRejectedFn, ....,
  // ]

  // 只要chain数组长度不为0，就一直执行while循环
  while (chain.length) {
    // 数组的 shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
    // 每次执行while循环，从chain数组里按序取出两项，并分别作为promise.then方法的第一个和第二个参数

    // 按照我们使用InterceptorManager.prototype.use添加拦截器的规则，正好每次添加的就是我们通过InterceptorManager.prototype.use方法添加的成功和失败回调

    // 通过InterceptorManager.prototype.use往拦截器数组里添加拦截器时使用的数组的push方法，
    // 对于请求拦截器，从拦截器数组按序读到后是通过unshift方法往chain数组数里添加的，又通过shift方法从chain数组里取出的，所以得出结论：对于请求拦截器，先添加的拦截器会后执行
    // 对于响应拦截器，从拦截器数组按序读到后是通过push方法往chain数组里添加的，又通过shift方法从chain数组里取出的，所以得出结论：对于响应拦截器，添加的拦截器先执行

    // 第一个请求拦截器的fulfilled函数会接收到promise对象初始化时传入的config对象，而请求拦截器又规定用户写的fulfilled函数必须返回一个config对象，所以通过promise实现链式调用时，每个请求拦截器的fulfilled函数都会接收到一个config对象

    // 第一个响应拦截器的fulfilled函数会接受到dispatchRequest（也就是我们的请求方法）请求到的数据（也就是response对象）,而响应拦截器又规定用户写的fulfilled函数必须返回一个response对象，所以通过promise实现链式调用时，每个响应拦截器的fulfilled函数都会接收到一个response对象

    // 任何一个拦截器的抛出的错误，都会被下一个拦截器的rejected函数收到，所以dispatchRequest抛出的错误才会被响应拦截器接收到。

    // 因为axios是通过promise实现的链式调用，所以我们可以在拦截器里进行异步操作，而拦截器的执行顺序还是会按照我们上面说的顺序执行，也就是 dispatchRequest 方法一定会等待所有的请求拦截器执行完后再开始执行，响应拦截器一定会等待 dispatchRequest 执行完后再开始执行。

    promise = promise.then(chain.shift(), chain.shift());

  }

  return promise;
};
```

##### dispatchrequest都做了哪些事

dispatchRequest主要做了3件事：
1，拿到config对象，对config进行传给http请求适配器前的最后处理；
2，http请求适配器根据config配置，发起请求
3，http请求适配器请求完成后，如果成功则根据header、data、和config.transformResponse（关于transformResponse，下面数据转换器会进行讲解）拿到数据转换后的response，并return。

```javascript
// /lib/core/dispatchRequest.js
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // 对请求data进行转换
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // 对header进行合并处理
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  // 删除header属性里无用的属性
  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  // http请求适配器会优先使用config上自定义的适配器，没有配置时才会使用默认的XHR或http适配器，不过大部分时候，axios提供的默认适配器是能够满足我们的
  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(/**/);
};
```

##### axios是如何用promise搭起基于xhr的异步桥梁

用户无论以什么方式调用axios，最终都是调用的`Axios.prototype.request`方法，
这个方法最终返回的是一个Promise对象。

`Axios.prototype.request`方法会调用`dispatchRequest`方法，而`dispatchRequest`方法会调用`xhrAdapter`方法，`xhrAdapter`方法返回的是还一个Promise对象

```javascript
// /lib/adapters/xhr.js
function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    // ... 省略代码
  });
};

```

回到`dispatchRequest`方法内，首先得到`xhrAdapter`方法返回的Promise对象,
然后通过`.then`方法，对`xhrAdapter`返回的Promise对象的成功或失败结果再次加工，
成功的话，则将处理后的`response`返回，
失败的话，则返回一个状态为`rejected`的Promise对象，

```javascript
  return adapter(config).then(function onAdapterResolution(response) {
    // ...
    return response;
  }, function onAdapterRejection(reason) {
    // ...
    return Promise.reject(reason);
  });
};

```

那么至此，用户调用`axios()`方法时，就可以直接调用Promise的`.then`或`.catch`进行业务处理了。

##### 数据转换器-转换请求与响应数据

分为修改全局和某次的转换器

```javascript
import axios from 'axios'

//某次
// 往已经存在的转换器里增加转换方法
axios.get(url, {
  // ...
  transformRequest: [
    ...axios.defaults.transformRequest, // 去掉这行代码就等于重写请求转换器了
    (data, headers) => {
      // ...处理data
      return data;
    }
  ],
  transformResponse: [
    ...axios.defaults.transformResponse, // 去掉这行代码就等于重写响应转换器了
    (data, headers) => {
      // ...处理data
      return data;
    }
  ],
})

//全局
// 往现有的请求转换器里增加转换方法
axios.defaults.transformRequest.push((data, headers) => {
  // ...处理data
  return data;
});

// 重写请求转换器
axios.defaults.transformRequest = [(data, headers) => {
  // ...处理data
  return data;
}];

// 往现有的响应转换器里增加转换方法
axios.defaults.transformResponse.push((data, headers) => {
  // ...处理data
  return data;
});

// 重写响应转换器
axios.defaults.transformResponse = [(data, headers) => {
  // ...处理data
  return data;
}];
```

默认的`defaults`配置项里已经自定义了一个请求转换器和一个响应转换器，

```javascript
// /lib/defaults.js
var defaults = {

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    // ...
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

};
```

请求转换器的使用地方是http请求前，使用请求转换器对请求数据做处理，
然后传给http请求适配器使用。

```javascript
/ /lib/core/dispatchRequest.js
function dispatchRequest(config) {

  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  return adapter(config).then(/* ... */);
};

// /lib/core/transformData.js
function transformData(data, headers, fns) {
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });
  return data;
};

```

响应转换器的使用地方是在http请求完成后，根据http请求适配器的返回值做数据转换处理

##### 转换器和拦截器的关系？

拦截器同样可以实现转换请求和响应数据的需求，但根据作者的设计和综合代码可以看出，
在请求时，拦截器主要负责修改config配置项，数据转换器主要负责转换请求体，比如转换对象为字符串
在请求响应后，拦截器可以拿到`response`，数据转换器主要负责处理响应体，比如转换字符串为对象。

##### 自动转换json数据

```javascript
// 请求时，将data数据转换为JSON 字符串
// /lib/defaults.js 
transformRequest: [function transformRequest(data, headers) {
  // ...
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
}]

// 得到响应后，将请求到的数据转换为JSON对象
// /lib/defaults.js
transformResponse: [function transformResponse(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
}]
```









