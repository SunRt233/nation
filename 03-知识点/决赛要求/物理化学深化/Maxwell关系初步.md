---
title: Maxwell关系初步
aliases: [Maxwell Relations, Maxwell关系式, 热力学基本方程]
type: 知识点
template_version: v1.3
subject: 决赛要求
module: 决赛要求
submodule: 物理化学深化
syllabus_stage: 决赛
parent_overview: 中国化学奥林匹克基本要求-总览
parent_module: 决赛要求-物理化学深化
syllabus_code: [决赛04]
syllabus_module: [物理化学深化]
tags: [化竞, 决赛, 物理化学, 热力学, Maxwell关系]
related: [化学热力学, 热力学第一定律深化, 热力学第二定律深化, 化学势与平衡]
prerequisite: [全微分, 偏导数, 热力学基本方程]
problem_types: [题型-推导证明, 题型-偏导数转换]
difficulty: 5
importance: 5
status: 已填充
sources: []
source_type: []
source_notes: []
review_cycle: 30d
has_images: false
image_count: 0
images_priority: low
images_note: "当前以文字、公式或表格表达为主，暂未单独配置图像文件；后续备课如需增强直观性，再按需补图。"
teaching_ready: false
key_images: []
updated: 2026-05-16
---

# Maxwell关系初步

- 总览：[[决赛要求-总览]]
- 所属模块：[[决赛要求-物理化学深化]]
- 对应考纲条目：[[决赛04-热力学]]
- 综合笔记：[[化学热力学]]（§3.4–3.5）
- 关联提炼笔记：[[提炼-Atkins物理化学-主题2-3-热力学定律]]

## 一、定义



Maxwell关系是由热力学势函数的全微分性质导出的四组偏导数等式。它们将难以直接测量的热力学量（如熵随体积/压力的变化）转换为容易由实验测量的量（如热膨胀系数、等温压缩系数）。

## 二、考纲对应



[待填充]

## 三、核心原理


### 2.1 热力学势与基本方程

| 热力学势 | 定义 | 自然变量 | 基本方程 |
|---------|------|---------|---------|
| 内能 $ | — | , V$ | $\mathrm{d}U = T\mathrm{d}S - p\mathrm{d}V$ |
| 焓 $ |  + pV$ | , p$ | $\mathrm{d}H = T\mathrm{d}S + V\mathrm{d}p$ |
| Helmholtz自由能 $ |  - TS$ | , V$ | $\mathrm{d}A = -S\mathrm{d}T - p\mathrm{d}V$ |
| Gibbs自由能 $ |  - TS = A + pV$ | , p$ | $\mathrm{d}G = -S\mathrm{d}T + V\mathrm{d}p$ |

### 2.2 Maxwell关系的推导

若  = f(x,y)$ 的全微分为 $\mathrm{d}z = M\mathrm{d}x + N\mathrm{d}y$，则必有：

\left(\frac{\partial M}{\partial y}\right)_x = \left(\frac{\partial N}{\partial x}\right)_y

将此应用于四个热力学势：

**第一组（来自 $）**：
\left(\frac{\partial T}{\partial V}\right)_S = -\left(\frac{\partial p}{\partial S}\right)_V

**第二组（来自 $）**：
\left(\frac{\partial T}{\partial p}\right)_S = \left(\frac{\partial V}{\partial S}\right)_p

**第三组（来自 $）**：
\left(\frac{\partial S}{\partial V}\right)_T = \left(\frac{\partial p}{\partial T}\right)_V

**第四组（来自 $）**：
\left(\frac{\partial S}{\partial p}\right)_T = -\left(\frac{\partial V}{\partial T}\right)_p

### 2.3 记忆技巧

以 (T,p)$ 为例：
- $-S$ 对 $ 求偏导 = $ 对 $ 求偏导，注意负号
- 口诀：**"同侧同号，异侧异号"** — 看变量在基本方程中的位置

更系统的记忆：将 ,S$ 和 ,V$ 看作对角，利用Jacobian或循环关系推导。

### 2.4 竞赛中的典型应用

**应用1：证明 $\left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{\partial p}{\partial T}\right)_V - p$**

由 $\mathrm{d}U = T\mathrm{d}S - p\mathrm{d}V$，在等温下对 $ 求偏导：
\left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{\partial S}{\partial V}\right)_T - p = T\left(\frac{\partial p}{\partial T}\right)_V - p

对于理想气体， = nRT/V$，代入得 $\left(\frac{\partial U}{\partial V}\right)_T = 0$。

**应用2：熵随压力的变化**

\left(\frac{\partial S}{\partial p}\right)_T = -\left(\frac{\partial V}{\partial T}\right)_p = -\alpha V

其中 $\alpha$ 为体膨胀系数。由此可得：
\Delta S = -\int_{p_1}^{p_2} \alpha V \, \mathrm{d}p

对于凝聚相（$\alpha, V$ 近似常数）：$\Delta S \approx -\alpha V(p_2 - p_1)$

对于理想气体：$\Delta S = -nR\ln\frac{p_2}{p_1}$

**应用3： - C_V$ 的严格证明**

C_p - C_V = T\left(\frac{\partial p}{\partial T}\right)_V\left(\frac{\partial V}{\partial T}\right)_p = \frac{\alpha^2TV}{\kappa_T}

### 2.5 其他重要热力学关系

利用Maxwell关系还可导出：

\left(\frac{\partial H}{\partial p}\right)_T = V - T\left(\frac{\partial V}{\partial T}\right)_p = V(1 - \alpha T)

**Joule-Thomson系数**（另见[[热力学第一定律深化]]）：
\mu_{\mathrm{JT}} = \left(\frac{\partial T}{\partial p}\right)_H = \frac{1}{C_p}\left[T\left(\frac{\partial V}{\partial T}\right)_p - V\right]

## 四、关键结论



[待填充]

## 五、常见分类或情形



[待填充]

## 六、适用条件与限制



[待填充]

## 七、常见比较与易混点



[待填充]

## 八、与其他知识点的联系



[待填充]

## 九、典型题型


1. **利用Maxwell关系证明热力学恒等式**
2. **将难测量量转换为可测量量**：如 $\left(\frac{\partial S}{\partial p}\right)_T \to \alpha$
3. **结合状态方程计算具体偏导数**

## 十、例题



[待填充]

## 十一、易错点


1. **符号错误**：第三、四组Maxwell关系有负号，极易遗漏
2. **混淆下标**：注意恒定的变量（下标）是什么
3. **自然变量混淆**：必须从正确的热力学势出发推导

## 十二、🎯 教学视角



[待填充]

## 十三、竞赛拓展



[待填充]

## 十四、外部资料出处



[待填充]

## 十五、待完善项



[待填充]

## 五、修订记录

| 日期 | 版本 | 修订内容 | 修订人 |
|-----|------|---------|-------|
| 2026-05-16 | v1.0 | 基于Atkins主题3创建，含推导、记忆技巧、竞赛应用 | AI助手 |

