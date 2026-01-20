深入理解 JavaScript 闭包（Closures）是掌握 JavaScript 高级编程的关键。闭包不仅是语言的特性，更是一种思维方式，涉及作用域链、内存管理、模块化等多个方面。

---

### 🧠 什么是闭包？

闭包是一个函数和其\*\*词法作用域（lexical scope）\*\*之间的组合。当一个函数在其外部作用域中引用了变量，并在外部调用时仍能访问这些变量，这个函数就是一个闭包。

> 简单来说：**闭包 = 函数 + 外部变量的访问权**

---

### 📦 示例解释

```javascript
function outer() {
  let counter = 0;
  return function inner() {
    counter++;
    console.log(counter);
  };
}

const fn = outer();
fn(); // 1
fn(); // 2
```

* `inner()` 是一个闭包。
* 它访问了 `outer()` 中的局部变量 `counter`。
* 即使 `outer()` 执行完毕，其局部变量依然被 `inner()` 引用并保存在内存中。

---

### 🔍 闭包的工作原理

1. 每当函数被创建，它会“记住”定义它的作用域链。
2. 当外层函数执行完毕，返回的内层函数依旧持有对作用域链中变量的引用。
3. JavaScript 引擎会将这些被闭包捕获的变量保留在内存中，而不是回收。

---

### 📚 应用场景

#### 1. **封装私有变量**

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.get());      // 1
```

#### 2. **函数工厂**

```javascript
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
console.log(add5(3)); // 8
```

#### 3. **事件监听绑定变量**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 1000);
  })(i);
}
```

---

### 🧨 常见问题

#### ❌ 闭包导致内存泄漏

* 如果闭包引用了大量 DOM 元素，可能无法被垃圾回收。
* 解决方案：**及时解除不再使用的引用**。

#### ❌ 闭包中的变量共享问题

```javascript
let funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(() => console.log(i));
}
funcs.forEach(fn => fn()); // 输出三个3
```

* 解决方案：

  * 使用 `let` 替代 `var`。
  * 或者使用 IIFE。

---

### 🧠 思维方式：闭包≠“技巧”，而是一种作用域模型

闭包并不是 JavaScript 的“黑科技”，它是语言的基础特性，用来**维持状态**、**控制可访问性**、**延迟执行**。理解闭包，关键在于理解 JavaScript 的作用域链和执行上下文。

---

### ✅ 总结一句话：

> **闭包是函数和其定义时的作用域的绑定，它允许函数在词法作用域之外访问并“记住”其外部变量。**
