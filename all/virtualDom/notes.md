Vue的变化侦测机制决定了它必然会在每次状态发生变化时都会发出渲染的信号，但Vue会在收到信号之后检查队列中是否已经存在这个任务，保证队列中不会有重复。如果队列中不存在则将渲染操作添加到队列中。

之后通过异步的方式延迟执行队列中的所有渲染的操作并清空队列 => 回调函数 `vm._update(vm._render())`去驱动视图更新

`vm._render()` 其实生成的就是 `vnode`，而 `vm._update` 就会带着新的 `vnode` 去走触发 `__patch__` 过程。

patch()  判断两节点是否值得比较(主要是key相等)，值得比较则执行   `patchVnode`patchNode() =>



这个函数做了以下事情：

- 找到对应的真实dom，称为`el`
  - 判断`Vnode`和`oldVnode`是否指向同一个对象，如果是，那么直接`return`
- 如果他们都有文本节点并且不相等，那么将`el`的文本节点设置为`Vnode`的文本节点。
- 如果`oldVnode`有子节点而`Vnode`没有，则删除`el`的子节点
- 如果`oldVnode`·子节点而`Vnode`有，则将`Vnode`的子节点真实化之后添加到`el`
- 如果两者都有子节点，则执行`updateChildren`函数比较子节点，这一步很重要

=>updateChildren()

先说一下这个函数做了什么

- 将`Vnode`的子节点`Vch`和`oldVnode`的子节点`oldCh`提取出来
- `oldCh`和`vCh`各有两个头尾的变量`StartIdx`和`EndIdx`，它们的2个变量相互比较，一共有4种比较方式。如果4种比较都没匹配，如果设置了`key`，就会用`key`进行比较，在比较的过程中，变量会往中间靠，一旦`StartIdx>EndIdx`表明`oldCh`和`vCh`至少有一个已经遍历完了，就会结束比较。



参考：

1. https://juejin.cn/post/6844903607913938951#heading-10
2. https://blog.csdn.net/weixin_39843414/article/details/107650085





