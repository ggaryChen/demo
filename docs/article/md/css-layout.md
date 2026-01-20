
## 🎯 一句话对比

| 特性   | Flexbox            | Grid               |
| ---- | ------------------ | ------------------ |
| 方向   | 单维布局（行 *或* 列）      | 双维布局（行 *和* 列）      |
| 使用场景 | 内容驱动、列表、导航栏        | 容器驱动、网格结构、复杂页面整体布局 |
| 控制方式 | 子项为主：通过控制 item 对齐等 | 容器为主：定义行列线和区域      |

---

## 🔹 Flexbox 全解析（弹性盒模型）

### 🧱 基础语法

```css
.container {
  display: flex;
  flex-direction: row;     /* row | row-reverse | column | column-reverse */
  justify-content: center; /* 主轴对齐 */
  align-items: center;     /* 交叉轴对齐 */
  gap: 10px;               /* 项之间间距 */
}
```

### 🔑 常用属性

#### 容器属性

| 属性                | 说明                            |
| ----------------- | ----------------------------- |
| `flex-direction`  | 主轴方向（横向/纵向）                   |
| `justify-content` | 主轴对齐方式（start/center/space-\*） |
| `align-items`     | 交叉轴对齐方式                       |
| `flex-wrap`       | 是否换行                          |
| `gap`             | 设置子项之间的间距                     |

#### 子项属性

| 属性           | 说明                                   |
| ------------ | ------------------------------------ |
| `flex`       | `flex-grow` `flex-shrink` `basis` 简写 |
| `align-self` | 覆盖父容器 `align-items` 设置               |
| `order`      | 控制排序（数字越小越靠前）                        |

### ✅ 适用场景

* 水平/垂直导航栏
* 响应式卡片列表
* 按钮组、工具栏
* 表单布局（简单场景）

---

## 🔸 Grid 全解析（网格布局）

### 🧱 基础语法

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3列均分 */
  grid-template-rows: auto 100px 1fr;     /* 可混合不同单位 */
  gap: 10px;
}
```

### 🧩 子项定位

```css
.item {
  grid-column: 2 / 4; /* 跨第2~3列 */
  grid-row: 1 / 3;    /* 跨第1~2行 */
}
```

或者使用命名区域：

```css
.container {
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
}
```

```css
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
```

### 🔑 常用属性

#### 容器属性

| 属性                              | 说明                       |
| ------------------------------- | ------------------------ |
| `grid-template-columns`         | 列的宽度设定（支持 `fr` 单位）       |
| `grid-template-rows`            | 行的高度设定                   |
| `grid-template-areas`           | 命名区域语法                   |
| `auto-fit/auto-fill`            | 自适应网格列数（与 `minmax()` 配合） |
| `justify-items` / `align-items` | 对齐子项                     |

#### 子项属性

| 属性            | 说明              |
| ------------- | --------------- |
| `grid-column` | 跨列布局，例如 `1 / 3` |
| `grid-row`    | 跨行布局            |
| `place-self`  | 单项对齐            |
| `z-index`     | 控制层级            |

### ✅ 适用场景

* 整体页面布局（头部/侧边栏/主内容/页脚）
* 相册、瀑布流布局
* 控制面板、复杂表格、表单分区

---

## 📌 实战对比

| 场景          | 推荐模型 | 原因                               |
| ----------- | ---- | -------------------------------- |
| 水平导航条       | Flex | 子项按顺序、主轴对齐更自然                    |
| 宫格图片列表      | Grid | 明确的二维结构                          |
| 两栏布局（主 + 侧） | Grid | 用 `grid-template-columns` 精确控制宽度 |
| 横向滚动卡片      | Flex | 滚动时单轴流式排布                        |
| 表单对齐        | Grid | Label + Input 两列结构易于控制           |

---

## 🧠 进阶技巧

### 🔁 Flex + Grid 组合使用

```jsx
<main className="grid-container">
  <aside>Sidebar</aside>
  <section className="content">
    <div className="card-row">...</div>
  </section>
</main>
```

* 外层用 Grid 做大布局
* 内层用 Flex 做卡片排布

### 📱 响应式写法

```css
@media (max-width: 600px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

或者直接使用：

```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

---

## ✅ 总结

| 关键点  | Flexbox | Grid         |
| ---- | ------- | ------------ |
| 维度   | 一维      | 二维           |
| 排布方式 | 内容驱动    | 布局驱动         |
| 控制力  | 控制子项    | 控制整个布局网格     |
| 难度   | 入门简单    | 学习曲线略高，但功能强大 |

---
