
### 🚀 性能优化总览

| 优化类型   | 方法                             | 适用场景          |
| ------ | ------------------------------ | ------------- |
| 渲染优化   | `memo`、`useMemo`、`useCallback` | 避免不必要的重新渲染    |
| 组件拆分   | 拆成更小组件 + 懒加载                   | 大组件或列表渲染      |
| 列表优化   | 虚拟滚动、分页加载                      | 超长列表渲染        |
| 状态管理优化 | 降低全局状态依赖，提升局部状态                | 组件层级复杂，状态更新频繁 |
| 网络请求优化 | 请求合并、缓存、请求节流                   | 请求过多或高频       |
| 重绘重排优化 | CSS 分离布局与动画                    | 动画频繁，布局复杂     |

---

### ⚙️ 核心优化方法

#### 1. **React.memo**：组件层级渲染优化

```jsx
const MyComponent = React.memo(({ name }) => {
  console.log("rendered");
  return <div>{name}</div>;
});
```

适用于：**纯函数组件**、**props 不变就不重新渲染**

---

#### 2. **useMemo/useCallback**：避免函数或值重复计算

```jsx
const expensiveValue = useMemo(() => computeHeavyStuff(data), [data]);

const handleClick = useCallback(() => {
  doSomething();
}, []);
```

**注意：**

* `useMemo` 用于缓存值
* `useCallback` 用于缓存函数（传给子组件时非常有用）

---

#### 3. **虚拟滚动（Windowing）**

使用如 [`react-window`](https://github.com/bvaughn/react-window)、`react-virtualized`：

```jsx
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={1000}
  itemSize={35}
  width={300}
>
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</List>
```

适用于：**渲染上百或上千项的列表**

---

#### 4. **懒加载组件 + 代码分割**

```jsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

> 配合 Webpack 的动态导入 `import()` 使用，可以减少首次包体积。

---

#### 5. **避免不必要的 re-render**

* 不要把函数/对象字面量直接传入子组件
* 用 `key` 唯一且稳定（别用 `index`）
* 用 `shouldComponentUpdate` 或 `React.PureComponent`（类组件）

---

#### 6. **Batching & Debounce**

**场景：** 表单、输入框等频繁触发 `setState` 的组件

```jsx
const handleChange = debounce((value) => {
  setState(value);
}, 300);
```

> 推荐使用 `lodash.debounce`、`use-debounce` 等库

---

#### 7. **状态粒度控制（Context/Redux/Atom）**

避免 Context 造成全组件树刷新：

```jsx
// bad: 所有子组件都会重新渲染
<MyContext.Provider value={someBigObject}>
```

解决方法：

* 拆分 context
* 使用 `useContextSelector`（如 [zustand](https://github.com/pmndrs/zustand)、`jotai`）

---

#### 8. **Profiler 工具分析瓶颈**

React DevTools 自带 Profiler：

* 查看哪些组件 render 了
* 找出 render 次数过多的组件
* 结合 flame graph 精确定位瓶颈

---

### 🎯 真实优化案例总结

| 场景           | 优化手段                          |
| ------------ | ----------------------------- |
| 页面初始加载慢      | 懒加载路由组件 + 图片懒加载 + CDN         |
| 列表滚动卡顿       | `react-window` 虚拟滚动           |
| 表单响应慢        | `debounce` 输入 + `useCallback` |
| 子组件频繁 render | `React.memo` + `useCallback`  |
| 状态变化引发大范围刷新  | 局部 state 替代 context/props 传递  |
| 文件体积大        | `import()` 分包 + Tree-shaking  |

---

### ✅ 总结

React 性能优化可以总结为：

> **减少 render 次数、减少 render 复杂度、减少初始体积、减少无效状态更新。**

---
