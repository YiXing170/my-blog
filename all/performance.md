前端性能统计的数据大致有以下几个：

- 白屏时间：从打开网站到有内容渲染出来的时间节点；
- 首屏时间：首屏内容渲染完毕的时间节点；
- 用户可操作时间节点：domready触发节点；
- 总下载时间：window.onload的触发节点。

利用performance.timing 来做计算

timing对象提供了各种与浏览器处理相关的时间数据。具体如下表

| 名称                         | 作用（这里所有时间戳都代表UNIX毫秒时间戳）                  |
| -------------------------- | ---------------------------------------- |
| connectEnd                 | 浏览器与服务器之间的连接建立时的时间戳，连接建立指的是所有握手和认证过程全部结束 |
| connectStart               | HTTP请求开始向服务器发送时的时间戳，如果是持久连接，则等同于fetchStart。 |
| domComplete                | 当前网页DOM结构生成时，也就是Document.readyState属性变为“complete”,并且相应的readystatechange事件触发时的时间戳。 |
| domContentLoadedEventEnd   | 这个时刻为所有需要尽早执行的脚本不管是否按顺序，都已经执行完毕。（译注：即DOM Ready |
| domContentLoadedEventStart | 当前网页DOMContentLoaded事件发生时，也就是DOM结构解析完毕、所有脚本开始运行时的时间戳。 |
| domInteractive             | 当前网页DOM结构结束解析、开始加载内嵌资源时，也就是Document.readyState属性变为“interactive”、并且相应的readystatechange事件触发时的时间戳。 |
| domLoading                 | 当前网页DOM结构开始解析时,也就是Document.readyState属性变为“loading”、并且相应的readystatechange事件触发时的时间戳。 |
| domainLookupEnd            | 域名查询结束时的时间戳。如果使用持久连接，或者从本地缓存获取信息的，等同于fetchStart |
| domainLookupStart          | 域名查询开始时的时间戳。如果使用持久连接，或者从本地缓存获取信息的，等同于fetchStart |
| fetchStart                 | 浏览器准备通过HTTP请求去获取页面的时间戳。在检查应用缓存之前发生。      |
| loadEventEnd               | 当前网页load事件的回调函数结束时的时间戳。如果该事件还没有发生，返回0。   |
| loadEventStart             | 当前网页load事件的回调函数开始时的时间戳。如果该事件还没有发生，返回0。   |
| navigationStart            | 当前浏览器窗口的前一个网页关闭，发生unload事件时的时间戳。如果没有前一个网页，就等于fetchStart |
| redirectEnd                | 最后一次重定向完成，也就是Http响应的最后一个字节返回时的时间戳。如果没有重定向，或者上次重定向不是同源的。则为0 |
| redirectStart              | 第一次重定向开始时的时间戳，如果没有重定向，或者上次重定向不是同源的。则为0   |
| requestStart               | 浏览器向服务器发出HTTP请求时（或开始读取本地缓存时）的时间戳。        |
| responseEnd                | 浏览器从服务器收到（或从本地缓存读取）最后一个字节时（如果在此之前HTTP连接已经关闭，则返回关闭时）的时间戳 |
| responseStart              | 浏览器从服务器收到（或从本地缓存读取）第一个字节时的时间戳。           |
| secureConnectionStart      | 浏览器与服务器开始安全链接的握手时的时间戳。如果当前网页不要求安全连接，则返回0。 |
| unloadEventEnd             | 如果前一个网页与当前网页属于同一个域下，则表示前一个网页的unload回调结束时的时间戳。如果没有前一个网页，或者之前的网页跳转不是属于同一个域内，则返回值为0。 |
| unloadEventStart           | 如果前一个网页与当前网页属于同一个域下，则表示前一个网页的unload事件发生时的时间戳。如果没有前一个网页，或者之前的网页跳转不是属于同一个域内，则返回值为0。 |

了解上面timeing提供的各种属性之后，我们可以计算出网页在加载时候某一部分消耗的具体时间，可以精确到千分之一毫秒

- DNS查询耗时 = domainLookupEnd - domainLookupStart
- TCP链接耗时 = connectEnd - connectStart
- request请求耗时 = responseEnd - responseStart
- 解析dom树耗时 = domComplete - domInteractive  // 只是解析，还有渲染的过程
- 白屏时间 = domloading - fetchStart   //可以在页面上看到元素
- domready时间 = domContentLoadedEventEnd - fetchStart  // 可以操作dom
- onload时间 = loadEventEnd - fetchStart  // 所有资源加载完毕



js阻塞的问题

defer-延迟加载：1、并发

                   2、多个js，按定义的顺序执行

                   3、在文档解析完，才执行（HTML）

                   4、在DOMContentLoaded事件之间执行完

                   5、只支持外部引入方式（IE7以前的除外）

async-异步加载：1、并发

                  2、多个js,不一定按顺序执行

                  3、加载完就执行，在load事件之前（JS）

                  4、在load事件之前执行完

                  5、只支持外部引入方式



css阻塞的问题：

1. css并不会阻塞DOM树的解析。

2. css加载会阻塞DOM树渲染。

3. css加载会阻塞后面js语句的执行

4. 如果页面中同时存在css和js，并且存在js在css后面，则DOMContentLoaded事件会在css加载完后才执行。其他情况下，DOMContentLoaded都不会等待css加载，并且DOMContentLoaded事件也不会等待图片、视频等其他资源加载。

   ​

