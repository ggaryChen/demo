## 🧭 第一部分：TypeScript 类型系统入门

### 🟢 基本类型

```ts
let age: number = 30;
let name: string = "Alice";
let isActive: boolean = true;
let tags: string[] = ["ts", "js"];
let scores: Array<number> = [1, 2, 3];
let anything: any = "可以是任意值";
```

### 🟢 元组（Tuple）

```ts
let tuple: [string, number] = ["hello", 10];
```

### 🟢 枚举（Enum）

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

### 🟢 联合类型（Union）

```ts
let id: string | number;
id = "abc";
id = 123;
```

### 🟢 类型别名（Type Alias）

```ts
type UserID = string | number;
let uid: UserID = 42;
```

---

## 🧭 第二部分：类型系统进阶

### 🔶 接口（Interface）

```ts
interface User {
  id: number;
  name: string;
  isAdmin?: boolean; // 可选属性
}
```

接口也支持继承：

```ts
interface Admin extends User {
  role: string;
}
```

---

### 🔶 函数类型定义

```ts
function greet(name: string): string {
  return "Hello, " + name;
}

const add: (a: number, b: number) => number = (a, b) => a + b;
```

---

### 🔶 类型断言（Type Assertion）

```ts
let someValue: unknown = "this is a string";
let strLength = (someValue as string).length;
```

---

### 🔶 字面量类型（Literal Types）

```ts
type Direction = "up" | "down" | "left" | "right";
let move: Direction = "up";
```

---

### 🔶 类型保护（Type Guards）

```ts
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  return padding + value;
}
```

---

### 🔶 类型交叉（Intersection）

```ts
type A = { name: string };
type B = { age: number };
type Person = A & B;
```

---

## 🧭 第三部分：泛型（Generics）

### 🔷 基本用法

```ts
function identity<T>(arg: T): T {
  return arg;
}
```

泛型变量命名通常用 `T`, `U`, `K`, `V` 等。

---

### 🔷 泛型约束

```ts
function logLength<T extends { length: number }>(input: T): void {
  console.log(input.length);
}
```

---

### 🔷 泛型接口

```ts
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

---

### 🔷 keyof 与映射类型

```ts
type Person = { name: string; age: number };
type PersonKeys = keyof Person; // "name" | "age"
```

---

### 🔷 条件类型

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"abc">; // true
type B = IsString<123>;   // false
```

---

## 🧭 第四部分：类型工具 & 类型操控技巧

### 🛠️ 常见内置工具类型

| 工具类型            | 含义              |
| --------------- | --------------- |
| `Partial<T>`    | 所有属性变成可选        |
| `Required<T>`   | 所有属性变成必填        |
| `Readonly<T>`   | 所有属性变成只读        |
| `Pick<T, K>`    | 选取部分属性          |
| `Omit<T, K>`    | 排除部分属性          |
| `Record<K, T>`  | 构造对象类型          |
| `ReturnType<T>` | 获取函数返回值类型       |
| `Parameters<T>` | 获取函数参数类型组成的元组类型 |

---

### 🧪 示例：类型体操风格题目

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

---

## 🧭 第五部分：实战应用与工程实践

### 🧩 类型安全 API 请求

```ts
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

---

### 🧩 表单数据校验工具配合

与 Zod、Yup、io-ts 配合使用类型推导：

```ts
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

type FormData = z.infer<typeof schema>;
```

---

### 🧩 前后端共享类型

* 使用 `.d.ts` 或 `*.ts` 公共模块
* 利用 `type-only` 导入来避免运行时代码

```ts
import type { User } from "@shared/types";
```

---

## ✅ 总结

| 等级 | 掌握重点                        |
| -- | --------------------------- |
| 入门 | 基本类型、接口、函数类型、断言、联合类型        |
| 进阶 | 泛型、映射类型、条件类型、工具类型、类型保护      |
| 实战 | 类型工具 + API 交互 + 表单验证 + 类型重用 |

---

## 📚 推荐练习与资源

* [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
* [Type Challenges](https://github.com/type-challenges/type-challenges) （推荐！）
* [TS深入之道 - Type-Level Programming](https://github.com/gogocodeio/type-thinking)
