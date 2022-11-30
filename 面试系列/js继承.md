#### 1、原型链继承

**重写原型对象，代之以一个新类型的实例**

```javascript
function SuperType() {
    this.property = true;
}

SuperType.prototype.getSuperValue = function() {
    return this.property;
}

function SubType() {
    this.subproperty = false;
}

// 这里是关键，创建SuperType的实例，并将该实例赋值给SubType.prototype
SubType.prototype = new SuperType(); 

SubType.prototype.getSubValue = function() {
    return this.subproperty;
}

var instance = new SubType();
console.log(instance.getSuperValue()); // true
```

原型链方案存在的缺点：多个实例对引用类型的操作会被篡改。

```javascript
function SuperType(){
  this.colors = ["red", "blue", "green"];
}
function SubType(){}

SubType.prototype = new SuperType();

var instance1 = new SubType();
instance1.colors.push("black");
alert(instance1.colors); //"red,blue,green,black"

var instance2 = new SubType(); 
alert(instance2.colors); //"red,blue,green,black"
```

#### 2、借用构造函数继承

使用父类的构造函数来增强子类**实例**，等同于复制父类的实例给子类（不使用原型）

```javascript
function  SuperType(){
    this.color=["red","green","blue"];
}
function  SubType(){
    //继承自SuperType
    SuperType.call(this);
}
var instance1 = new SubType();
instance1.color.push("black");
alert(instance1.color);//"red,green,blue,black"

var instance2 = new SubType();
alert(instance2.color);//"red,green,blue"
```

缺点：

- 只能继承父类的**实例**属性和方法，不能继承原型属性/方法
- 无法实现复用，每个子类都有父类实例函数的副本，影响性能

#### 3、组合继承

组合上述两种方法就是组合继承。用原型链实现对**原型**属性和方法的继承，用借用构造函数技术来实现**实例**属性的继承。

```javascript
function SuperType(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
  alert(this.name);
};

function SubType(name, age){
  // 继承属性
  // 第二次调用SuperType()
  SuperType.call(this, name);
  this.age = age;
}

// 继承方法
// 构建原型链
// 第一次调用SuperType()
SubType.prototype = new SuperType(); 
// 重写SubType.prototype的constructor属性，指向自己的构造函数SubType
SubType.prototype.constructor = SubType; 
SubType.prototype.sayAge = function(){
    alert(this.age);
};

var instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
alert(instance1.colors); //"red,blue,green,black"
instance1.sayName(); //"Nicholas";
instance1.sayAge(); //29

var instance2 = new SubType("Greg", 27);
alert(instance2.colors); //"red,blue,green"
instance2.sayName(); //"Greg";
instance2.sayAge(); //27
```

缺点：

- 第一次调用`SuperType()`：给`SubType.prototype`写入两个属性name，color。
- 第二次调用`SuperType()`：给`instance1`写入两个属性name，color。

实例对象`instance1`上的两个属性就屏蔽了其原型对象SubType.prototype的两个同名属性。所以，组合模式的缺点就是在使用子类创建实例对象时，其原型中会存在两份相同的属性/方法。

#### 4、原型式继承

利用一个空对象作为中介，将某个对象直接赋值给空对象构造函数的原型。

```javascript
function object(obj){

  function F(){}

  F.prototype = obj;

  return new F();

}

```



object()对传入其中的对象执行了一次`浅复制`，将构造函数F的原型直接指向传入的对象。

```javascript
var person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};

var anotherPerson = object(person);
anotherPerson.name = "Greg";
anotherPerson.friends.push("Rob");

var yetAnotherPerson = object(person);
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");

alert(person.friends);   //"Shelby,Court,Van,Rob,Barbie"
```

缺点：

- 原型链继承多个实例的引用类型属性指向相同，存在篡改的可能。
- 无法传递参数

另外，ES5中存在`Object.create()`的方法，能够代替上面的object方法。

#### 5、寄生式继承

核心：在原型式继承的基础上，增强对象，返回构造函数

```
function createAnother(original){
  var clone = object(original); // 通过调用 object() 函数创建一个新对象
  clone.sayHi = function(){  // 以某种方式来增强对象
    alert("hi");
  };
  return clone; // 返回这个对象
}
```

函数的主要作用是为构造函数新增属性和方法，以**增强函数**

```
var person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};
var anotherPerson = createAnother(person);
anotherPerson.sayHi(); //"hi"
```

缺点（同原型式继承）：

- 原型链继承多个实例的引用类型属性指向相同，存在篡改的可能。
- 无法传递参数

#### 6、寄生组合式继承

结合借用构造函数传递参数和寄生模式实现继承

其实是前面组合继承的升级版，实现：

1子类原型上不在有父类实例的属性

2 寄生的方式增强对象

```javascript
function inheritPrototype(subType, superType){
  var prototype = Object.create(superType.prototype); // 创建对象，创建父类原型的一个副本
  prototype.constructor = subType;                    // 增强对象，弥补因重写原型而失去的默认的constructor 属性
  subType.prototype = prototype;                      // 指定对象，将新创建的对象赋值给子类的原型
}

// 父类初始化实例属性和原型属性
function SuperType(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
  alert(this.name);
};

// 借用构造函数传递增强子类实例属性（支持传参和避免篡改）
function SubType(name, age){
  SuperType.call(this, name);
  this.age = age;
}

// 将父类原型指向子类实例的__proto__上
inheritPrototype(SubType, SuperType);

// 新增子类原型属性
SubType.prototype.sayAge = function(){
  alert(this.age);
}

var instance1 = new SubType("xyc", 23);
var instance2 = new SubType("lxy", 23);

instance1.colors.push("2"); // ["red", "blue", "green", "2"]
instance1.colors.push("3"); // ["red", "blue", "green", "3"]
```

这个例子的高效率体现在它只调用了一次`SuperType` 构造函数，并且因此避免了在`SubType.prototype` 上创建不必要的、多余的属性。于此同时，原型链还能保持不变；因此，还能够正常使用`instanceof` 和`isPrototypeOf()`



#### 7、混入方式继承多个对象

```
function MyClass() {
     SuperClass.call(this);
     OtherSuperClass.call(this);
}

// 继承一个类
MyClass.prototype = Object.create(SuperClass.prototype);
// 混合其它
Object.assign(MyClass.prototype, OtherSuperClass.prototype);
// 重新指定constructor
MyClass.prototype.constructor = MyClass;

MyClass.prototype.myMethod = function() {
     // do something
};
复制代码
```

`Object.assign`会把  `OtherSuperClass`原型上的函数拷贝到 `MyClass`原型上，使 MyClass 的所有实例都可用 OtherSuperClass 的方法。



#### 8、ES6类继承extends

`extends`关键字主要用于类声明或者类表达式中，以创建一个类，该类是另一个类的子类。其中`constructor`表示构造函数，一个类中只能有一个构造函数，有多个会报出`SyntaxError`错误,如果没有显式指定构造方法，则会添加默认的 `constructor`方法，使用例子如下。

```
class Rectangle {
    // constructor
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
    
    // Getter
    get area() {
        return this.calcArea()
    }
    
    // Method
    calcArea() {
        return this.height * this.width;
    }
}

const rectangle = new Rectangle(10, 20);
console.log(rectangle.area);
// 输出 200

-----------------------------------------------------------------
// 继承
class Square extends Rectangle {

  constructor(length) {
    super(length, length);
    
    // 如果子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    this.name = 'Square';
  }

  get area() {
    return this.height * this.width;
  }
}

const square = new Square(10);
console.log(square.area);
// 输出 100
```
`extends`继承的核心代码如下，其实现和上述的寄生组合式继承方式一样

```javascript
function _inherits(subType, superType) {
  
    // 创建对象，创建父类原型的一个副本
    // 增强对象，弥补因重写原型而失去的默认的constructor 属性
    // 指定对象，将新创建的对象赋值给子类的原型
    subType.prototype = Object.create(superType && superType.prototype, {
        constructor: {
            value: subType,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    
    if (superType) {
        Object.setPrototypeOf 
            ? Object.setPrototypeOf(subType, superType) 
            : subType.__proto__ = superType;
    }
}
```

#### 总结

1、函数声明和类声明的区别

函数声明会提升，类声明不会。首先需要声明你的类，然后访问它，否则像下面的代码会抛出一个ReferenceError。

```
let p = new Rectangle(); 
// ReferenceError

class Rectangle {}
复制代码
```

2、ES5继承和ES6继承的区别

- ES5的继承实质上是先创建子类的实例对象，然后再将父类的方法添加到this上（Parent.call(this)）.
- ES6的继承有所不同，实质上是先创建父类的实例对象this，然后再用子类的构造函数修改this。因为子类没有自己的this对象，所以必须先调用父类的super()方法，否则新建实例报错

#### 其他：

#### babel转译的class

```javascript
class Animal {
  constructor(name) {
    this.name = name || 'Kat'
  }
}
```

最后 [babel 编译出来](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=true&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Ces2017%2Creact%2Cstage-0%2Cstage-3&prettier=false&targets=&version=6.26.0&envVersion=)的代码如下。这里笔者用的是 Babel 6 的稳定版 6.26，不同版本编译出来可能有差异，但不至于有大的结构变动。

```javascript
'use strict'

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

var Animal = function Animal(name) {
  _classCallCheck(this, Animal)

  this.name = name || 'Kat'
}
```

` _classCallCheck` 为检查是否为类调用 ，主要是检查this的指向，用new 调用this 是构造函数的实例



给class加上方法

```javascript
class Animal {
  constructor(name) {
    this.name = name || 'Kat'
  }

  move() {}
  getName() {
    return this.name
  }
}
```

转译成

```javascript
'use strict'

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

var Animal = (function() {
  function Animal(name) {
    _classCallCheck(this, Animal)

    this.name = name || 'Kat'
  }

  _createClass(Animal, [
    {
      key: 'move',
      value: function move() {},
    },
    {
      key: 'getName',
      value: function getName() {
        return this.name
      },
    },
  ])

  return Animal
})()
```

例子长了不少，但其实主要的变化只有两个：一是 `Animal` 被包了一层而不是直接返回；二是新增的方法 `move` 和 `getName` 是通过一个 `_createClass()` 方法来实现的。它将两个方法以 `key`/`value` 的形式作为数组传入，看起来，是要把它们设置到 `Animal` 的原型链上面，以便后续继承之用

先来看看_createClass 是什么

```javascript
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i]
      descriptor.enumerable = descriptor.enumerable || false
      descriptor.configurable = true
      if ('value' in descriptor) descriptor.writable = true
      Object.defineProperty(target, descriptor.key, descriptor)
    }
  }

  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps)
    if (staticProps) defineProperties(Constructor, staticProps)
    return Constructor
  }
})()
```

它就是把你定义的 `move`、`getName` 方法通过 `Object.defineProperty` 方法设置到 `Animal.prototype` 上去

再看看继承底下的实现机制是怎么样的，以及它的 `constructor` 和 `__proto__` 属性将如何被正确设置。带着这两个问题，

```javascript
class Animal {
  constructor(name) {
    this.name = name || 'Kat'
  }
}

class Tiger extends Animal {
  constructor(name, type) {
    super(name)
    this.type = type || 'Paper'
  }
}
```



我们一起来看下编译后的源码：

```javascript
'use strict'

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    )
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    )
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  })
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass)
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

var Animal = function Animal(name) {
  _classCallCheck(this, Animal)

  this.name = name || 'Kat'
}

var Tiger = (function(_Animal) {
  _inherits(Tiger, _Animal)

  function Tiger(name, type) {
    _classCallCheck(this, Tiger)

    var _this = _possibleConstructorReturn(
      this,
      (Tiger.__proto__ || Object.getPrototypeOf(Tiger)).call(this, name)
    )

    _this.type = type || 'Paper'
    return _this
  }

  return Tiger
})(Animal)
```



相比无继承的代码，这里主要增加了几个函数。`_possibleConstructorReturn` 顾名思义，可能不是很重要，回头再读。精华在 `_inherits(Tiger, Animal)` 这个函数，我们按顺序来读一下。首先是一段异常处理，简单地检查了 `superClass` 要么是个函数，要么得是个 null。也就是说，如果你这样写那是不行的：

```javascript
const Something = 'not-a-function'
class Animal extends Something {}
// Error: Super expression must either be null or a function, not string
```

接下来这句代码将 `prototype` 和 `constructor` 一并设置到位，是精华。注意，这个地方留个问题：为什么要用 `Object.create(superClass.prototype)`，而不是直接这么写：

```javascript
function _inherits(subClass, superClass) {
  subClass.prototype = superClass && superClass.prototype
  subClass.prototype.constructor = { ... }
}
```

很明显，是为了避免任何对 `subClass.prototype` 的修改影响到 `superClass.prototype`。使用 `Object.create(asPrototype)` 出来的对象，其实上是将 `subClass.prototype.__proto__ = superClass.prototype`，这样 `subClass` 也就继承了 `superClass`，可以达到这样两个目的：

1. 当查找到 `subClass` 上没有的属性时，会自动往 `superClass` 上找；这样 `superClass.prototype` 原型上发生的修改都能实时反映到 `subClass` 上
2. `subClass.prototype` 本身是个新的对象，可以存放 `subClass` 自己的属性，这样 `subClass.prototype` 上的任何修改不会影响到 `superClass.prototype`

最后，如果 `superClass` 不为空，那么将 `subClass.__proto__` 设置为 `superClass`。这点我并不是很理解,猜测是为了子类去继承父类的静态属性和方法

至此，一个简单的继承就完成了。在使用了 `extends` 关键字后，实际上背后发生的事情是：

- 子「类」`prototype` 上的 `__proto__` 被正确设置，指向父「类」的 `prototype`: `subClass.prototype = { __proto__: superClass.prototype }`
- 子「类」`prototype` 上的 `constructor` 被正确初始化，这样 `instanceof` 关系能得到正确结果

#### 手写new

```javascript
function People(name) {
      this.name = name;
    }
People.prototype.sayName = function () {
      console.log(this.name);
    }
    
function myNew(func, ...args) {
    if (typeof func !== 'function') {
        throw '第一个参数必须是方法体'
    }
    const obj = {}
    obj.__proto__ = func.prototype;
    const res = func.apply(obj, args)
    if (typeof res === 'function' || (typeof res === 'object' && res !== null)) {
        return res
    } else {
        return obj
     }
}

    let me = myNew(People, 'yjl')

    me.sayName()  // yjl
    console.log(me.constructor === People) //true
    console.log(me.__proto__ === People.prototype)  //true
    console.log(me instanceof People) //true
```

