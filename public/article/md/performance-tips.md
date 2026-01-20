## 🏁 一、资源加载与构建优化（加载快才是真的快）

### 1️⃣ 使用按需加载（Code Splitting）

* 利用 Webpack/Vite 的 `import()` 分割大文件。
* 路由级别拆分、组件级别懒加载。

```js
const Component = React.lazy(() => import('./HeavyComponent'));
```

---

### 2️⃣ 开启 Gzip 或 Brotli 压缩

* 减少传输体积，服务器支持 `Content-Encoding: gzip/br`.

---

### 3️⃣ 使用 HTTP 缓存（强缓存 + 协商缓存）

* 配置 `Cache-Control`, `ETag`, `Last-Modified` 等头部。

---

### 4️⃣ 减少 JS/CSS 文件体积

* Tree Shaking、依赖优化（e.g. lodash 按需引入）。
* 使用现代构建工具（esbuild、Vite、Terser）。

---

### 5️⃣ 图片优化（延迟加载 + 格式压缩）

* 使用现代格式：WebP、AVIF。
* 配置 `<img loading="lazy">` 实现懒加载。
* 小图 base64 内联，大图 CDN 加载。

---

### 6️⃣ 使用 CDN 加速静态资源

* JS、CSS、字体、图片等公共资源应由 CDN 托管。

---

### 7️⃣ 设置合理的首屏加载顺序

* CSS 优先加载、关键 JS 延后执行（`defer` / `async`）。
* 关键资源内联（Critical CSS）、非关键延迟加载。

---

### 8️⃣ 减少第三方依赖的引入和体积

* 精选必要库，如：用 `axios` 替代 `request`，用 `nanoid` 替代 `uuid`。

---

## 🎨 二、渲染性能与 DOM 操作优化

### 9️⃣ 避免频繁操作 DOM

* 使用虚拟 DOM 框架（如 React、Vue）可减少重绘重排。
* 合并 DOM 更新：用 DocumentFragment、requestAnimationFrame。

---

### 🔟 CSS 尽量使用合成属性（transform/opacity）

* 避免使用 `top/left/width/height` 做动画。
* 使用 `will-change` 提前通知浏览器优化。

---

### 1️⃣1️⃣ 合理使用异步渲染

* 大数据列表使用虚拟列表（如 `react-window`）。
* 表格分页、懒加载渲染等方式避免一次性渲染过多内容。

---

### 1️⃣2️⃣ 使用 `requestIdleCallback` / `requestAnimationFrame`

* 在空闲时执行非关键任务，在下一帧执行动画任务。

---

## ⚙️ 三、JavaScript 执行效率优化

### 1️⃣3️⃣ 使用事件委托减少绑定数量

```js
document.body.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) { ... }
});
```

---

### 1️⃣4️⃣ 使用节流与防抖优化高频事件

```js
window.addEventListener("scroll", debounce(handleScroll, 200));
```

---

### 1️⃣5️⃣ 减少计算复杂度（避免不必要的计算）

* 避免在渲染周期内调用复杂逻辑。
* 使用 `useMemo`、`useCallback` 缓存计算值或函数。

---

### 1️⃣6️⃣ 使用 Web Worker 处理重计算任务

* 将复杂运算从主线程移出，避免阻塞 UI。

---

## 📲 四、用户体验与交互响应优化

### 1️⃣7️⃣ 优化首屏体验（FCP/LCP）

* 使用骨架屏（Skeleton）、Loading 占位符。
* 优先渲染关键内容，延后不重要组件加载。

---

### 1️⃣8️⃣ 使用预加载/预连接技术

```html
<link rel="preload" href="main.css" as="style">
<link rel="preconnect" href="https://cdn.example.com">
```

---

### 1️⃣9️⃣ 减少白屏时间

* SSR（服务器渲染）+ Hydration 可加速首屏渲染。
* 或使用 CSR + Streaming 渐进式展示。

---

### 2️⃣0️⃣ 使用 Performance API 监控性能指标

```js
performance.mark('start');
// ...
performance.mark('end');
performance.measure('myTask', 'start', 'end');
```

结合 Lighthouse、Web Vitals、Sentry 等工具持续优化。

---

## ✅ 总结：优化的本质是平衡性能与体验

| 优化维度 | 关键策略               |
| ---- | ------------------ |
| 加载速度 | 资源压缩、按需加载、CDN      |
| 渲染效率 | 虚拟 DOM、合成属性、事件委托   |
| 交互响应 | 节流防抖、异步任务、骨架屏      |
| 用户体验 | SSR/Streaming、缓存策略 |
