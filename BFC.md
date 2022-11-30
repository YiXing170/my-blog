FC（Formatting Context）就是html页面中的某个元素内的**一套渲染规则，决定了其子元素如何布局**，以及**和其他元素在html页面中的位置**。

常见的FC还有

- IFC（inline formatting context，即内联级元素内的渲染规则
- GFC（grid formatting context，display为grid的元素内的渲染规则）
- FFC(flex formatting context，display为flex的元素内的渲染规则)。



触发BFC

1. 该元素是根元素，即``标签内就是一个BFC环境
2. float的值不为none
3. overflow的值不为visible(hidden scroll auto)
4. display的值为inline-block、table-cell、table-caption
5. position的值为absolute或fixed

特性

1.在块格式化上下文中，从包含块的顶部开始，垂直地一个接一个地排列盒子。

块级盒子会在垂直方向上一个接一个放置

2.垂直方向上的距离由margin决定，属于同一个BFC的两个相邻Box的margin会发生重叠。

 1 上下相邻的两个元素 2.父元素与子元素的margin发生重叠

3  bfc的区域不会与float的元素区域重叠。

4.在块格式化上下文中，每个box 的左外边缘都与`包含块`的左边缘相接触(对于从右到左的格式化，右边缘相接触)

<除非box建立了一个新的块格式上下文>

5.计算bfc的高度时，浮动元素也参与计算 <清除浮动>

6.bfc就是页面上的一个独立容器，容器里面的子元素不会影响外面元素。 <清除margin重叠>