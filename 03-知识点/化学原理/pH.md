---
title: pH
aliases: [pH值, pOH]
type: 知识点
template_version: v1.3
subject: 化学原理
module: 化学原理
submodule: 酸碱平衡
syllabus_stage: 基础
parent_overview: 中国化学奥林匹克基本要求-总览
parent_module: 基础要求-化学原理
syllabus_code: [5]
syllabus_module: [化学原理]
tags: [化竞, 酸碱]
related: [Brønsted酸碱理论, 酸碱平衡, 缓冲溶液, pKa]
prerequisite: [Brønsted酸碱理论]
problem_types: [题型-pH计算]
difficulty: 2
importance: 5
status: 已填充
sources:
  - 教学逻辑提炼-周坤无机新课-酸碱理论与电化学-第一轮
  - 专题-酸碱理论
source_type:
  - 教学逻辑提炼
  - 专题归纳
review_cycle: 30d
has_images: false
image_count: 0
images_priority: low
images_note: "当前以文字、公式或表格表达为主，暂未单独配置图像文件；后续备课如需增强直观性，再按需补图。"
teaching_ready: false
source_notes:
  - "[[教学逻辑提炼-周坤无机新课-酸碱理论与电化学-第一轮]]"
  - "[[专题-酸碱理论]]"
  - "[[04-课件/新授课/2026-06-02-酸碱理论-基础班]]"
updated: 2026-06-01
source_extracts:
  - source_file: "[[教学逻辑提炼-周坤无机新课-酸碱理论与电化学-第一轮]]"
    asset_id: "B2-关联"
    asset_type: "关联引用"
    asset_summary: "本KP未在周坤Batch 2资产清单中直接映射可提取资产，但pH概念与Brønsted理论共轭酸碱对密切相关"
    target_section: "—"
key_images: []
---

# pH

- 总览：[[中国化学奥林匹克基本要求-总览]]
- 所属模块：[[基础要求-化学原理]]
- 对应考纲条目：[[05-酸碱理论]]

## 一、定义
$$\mathrm{pH} = -\lg[\mathrm{H}^+] \quad \mathrm{pOH} = -\lg[\mathrm{OH}^-]$$

25°C 水溶液中：$\mathrm{pH} + \mathrm{pOH} = 14.00$

## 二、考纲对应
- [待填充]

## 三、核心原理
- pH 每差 1 → [H⁺] 差 10 倍（对数标度）
- Kw 随温度变化 → pH + pOH = pKw（非 25°C 时 ≠ 14）
- 25°C Kw = 1.0×10⁻¹⁴, pKw = 14.00

## 四、关键结论
### 各类溶液的 pH 公式（快速参考）
| 溶液 | 公式 |
|------|------|
| 强酸 c mol/L | pH = −lg c |
| 强碱 c mol/L | pH = 14 + lg c |
| 弱酸 HA | $[\ce{H+}] = \sqrt{K_a c}$（近似） |
| 弱碱 B | $[\ce{OH-}] = \sqrt{K_b c}$（近似） |
| 缓冲溶液 | $\mathrm{pH} = \mathrm{p}K_a + \lg\frac{[\mathrm{A}^-]}{[\mathrm{HA}]}$ |
| 两性物质 | $\mathrm{pH} = \frac{1}{2}(\mathrm{p}K_{a1} + \mathrm{p}K_{a2})$ |

## 五、常见分类或情形

### 1. 各类溶液的 pH 计算分类
| 溶液类型 | $\ce{[H3O+]}$ / $\ce{[OH-]}$ 公式 | 适用条件 |
|----------|------|------|
| 强酸（$c\ \mathrm{mol\cdot dm^{-3}}$） | $\ce{[H3O+]} = c$ | 完全电离 |
| 强碱（$c\ \mathrm{mol\cdot dm^{-3}}$） | $\ce{[OH-]} = c$ | 完全电离 |
| 一元弱酸 HA | $\ce{[H3O+]} = \sqrt{K_a c}$ | $c/K_a \geqslant 400$ |
| 一元弱碱 B | $\ce{[OH-]} = \sqrt{K_b c}$ | $c/K_b \geqslant 400$ |
| 缓冲溶液 | $\mathrm{pH} = \mathrm{p}K_a + \lg\frac{c(\text{共轭碱})}{c(\text{弱酸})}$ | 见 [[缓冲溶液]] |
| 两性物质 | $\ce{[H3O+]} = \sqrt{K_{a_1} \cdot K_{a_2}}$ | 见 [[酸碱平衡]] |
| 多元弱酸 | $\ce{[H3O+]} \approx \sqrt{K_{a_1} c}$ | $K_{a_1} \gg K_{a_2}$ |

### 2. 水的离子积 $K_w$ 与温度（教材表 8.3）
| $t / ^\circ\mathrm{C}$ | 0 | 10 | 20 | 25 | 50 | 100 |
|------|------|------|------|------|------|------|
| $K_w$ | $1.15\times 10^{-15}$ | $2.92\times 10^{-15}$ | $6.87\times 10^{-15}$ | $1.01\times 10^{-14}$ | $5.31\times 10^{-14}$ | $5.45\times 10^{-13}$ |

**室温近似**：一般工作时取 $K_w = 1.0\times 10^{-14}$。水的电离是**吸热**反应，温度越高 $K_w$ 越大。注意中性溶液的 $\mathrm{pH}$ 也随温度变化（$100^\circ\mathrm{C}$ 时中性 $\mathrm{pH} \approx 6.13$）。

### 3. pH 使用范围
- $\mathrm{pH}$ 和 $\mathrm{pOH}$ 使用范围一般在 $0\sim 14$ 之间
- 在这个范围以外，直接用浓度（$\mathrm{mol\cdot dm^{-3}}$）表示酸度和碱度反而更方便
- 室温条件：$\mathrm{pH} < 7$ 酸性，$\mathrm{pH} > 7$ 碱性，$\mathrm{pH} = 7$ 中性

### 4. 酸碱溶液中 $\ce{[H3O+]}$ 和 $\ce{[OH-]}$ 共存
不论酸性还是碱性溶液，$\ce{H3O+}$ 和 $\ce{OH-}$ 离子**同时存在**，浓度的乘积为常数 $K_w$。任何一个离子浓度随另一个浓度增大可以减小，但**不会等于零**。

**教材示例**：往纯水中加酸使 $[\ce{H3O+}] = 0.10\ \mathrm{mol\cdot dm^{-3}}$，则 $[\ce{OH-}] = K_w/[\ce{H3O+}] = 1.0\times 10^{-13}\ \mathrm{mol\cdot dm^{-3}}$。

### 5. pH 与水电离的抑制
弱酸（碱）电离出的 $\ce{H3O+}$（或 $\ce{OH-}$）会**抑制**水的自耦电离。如 $0.10\ \mathrm{mol\cdot dm^{-3}}$ HAc 溶液中，由水电离出的 $[\ce{H3O+}]$ 远小于 $10^{-7}\ \mathrm{mol\cdot dm^{-3}}$，与 HAc 电离的 $1.3\times 10^{-3}\ \mathrm{mol\cdot dm^{-3}}$ 相比完全可以忽略。

## 六、适用条件与限制

- $\mathrm{pH} + \mathrm{pOH} = 14$ **仅适用于 $25^\circ\mathrm{C}$**。在其他温度下 $K_w$ 不同，需用 $\mathrm{pH} + \mathrm{pOH} = \mathrm{p}K_w$。
- $\mathrm{pH}$ 的定义基于**活度**（$a_{\ce{H+}}$）而非浓度。教材中实验测定的 $\mathrm{pH}$ 与浓度计算值略有差别（见表 8.5 实验数据），正是因为溶液中存在离子间的相互作用。竞赛计算中一般忽略活度-浓度差异。
- 对于极浓的强酸或强碱溶液，$\mathrm{pH}$ 概念不适直接用（超出 $0\sim 14$ 范围），应改用浓度表示。
- 在非水溶剂中，$\mathrm{pH}$ 的定义需重新考虑（质子自递常数不同）。
- 简化公式 $[\ce{H3O+}] = \sqrt{K_a c}$ 仅在 $c/K_a \geqslant 400$（$\alpha \leqslant 5\%$）时有效，否则须精确求解二次方程。

## 七、常见比较与易混点

### 1. pH 与 pKa 的关系
- $\mathrm{pH}$ 描述**溶液**的酸度（$[\ce{H3O+}]$ 的对数）
- $\mathrm{p}K_a$ 描述**酸**的强度（$K_a$ 的对数）
- 二者通过 H-H 方程关联：$\mathrm{pH} = \mathrm{p}K_a + \lg([\ce{A-}]/[\ce{HA}])$
- 当 $[\ce{A-}] = [\ce{HA}]$ 时，$\mathrm{pH} = \mathrm{p}K_a$

### 2. pH 改变量与浓度改变量
$\mathrm{pH}$ 改变 $1$ 个单位 $\Longleftrightarrow$ $[\ce{H3O+}]$ 改变 $10$ 倍。这是经常被忽略的关键换算——小数的 $\mathrm{pH}$ 变化对应着较大的浓度变化。

### 3. 酸性溶液 vs 中性溶液的温度效应
- $25^\circ\mathrm{C}$：中性 $\mathrm{pH} = 7.00$
- $100^\circ\mathrm{C}$：中性 $\mathrm{pH} = -\lg\sqrt{5.45\times 10^{-13}} \approx 6.13$
- 判断酸碱性应以 $\mathrm{pH}$ 与当时温度下的中性 $\mathrm{pH}$ 比较，而非恒以 $7$ 为界

### 4. 计算 pH 时的常见误区
- 强酸极稀时（$c \lesssim 10^{-6}\ \mathrm{mol\cdot dm^{-3}}$），水的自耦电离不可忽略
- 多元弱酸的 $\mathrm{pH}$ 只由 $K_{a_1}$ 决定（前提是 $K_{a_1} \gg K_{a_2}$），初学者常误以为各步电离叠加
- 两性物质（如 $\ce{NaHCO3}$）的 $\mathrm{pH}$ 与浓度无关（近似条件下），初学者容易错误地用弱碱或弱酸公式计算

## 八、与其他知识点的联系
- 前置知识：[[Brønsted酸碱理论]]
- 相关知识：[[离去基与pKa]]、[[Kw]]、[[平衡常数]]
- 应用知识：[[酸碱平衡]]、[[缓冲溶液]]、[[酸碱滴定]]

## 九、典型题型
- 题型-pH计算

## 十、例题
[待补充]

## 十一、易错点
- 忘记 $25^\circ\mathrm{C}$ 时 $K_w = 1.0\times 10^{-14}$，$\mathrm{pH} + \mathrm{pOH} = 14$
- 极稀强酸（碱）忽略水的电离
- 用简化公式时不先判断 $c/K_a$ 是否满足条件
- 多元酸错误叠加各步电离来算 $[\ce{H+}]$

## 十二、🎯 教学视角
- [待补充]

## 十三、竞赛拓展
[待填充]

## 十四、外部资料出处
- 主要来源：[[提炼-普化原理-第8章-酸碱平衡]]（《普通化学原理 第4版》第 8 章 8.2 节：水的自耦电离平衡）
- 《分析化学》——活度与 pH 的严格定义

## 十五、待完善项
- [ ] 补充极稀溶液 pH 计算的例题
- [ ] 补充高温下中性 pH 的计算示例

---

## 相关真题

```dataview
TABLE file.name AS "文件名", year AS "年份", type AS "题型", difficulty AS "难度"
FROM "04-题库"
WHERE contains(knowledge_points, "pH")
SORT year DESC, difficulty ASC
```

