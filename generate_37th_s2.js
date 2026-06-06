const fs = require('fs');

const data = JSON.parse(fs.readFileSync('parse_37th_s2.json', 'utf-8'));

const subjectMap = {
  1: '生物化学',
  2: '无机化学',
  3: '物理化学',
  4: '电化学',
  5: '结构化学',
  6: '无机化学',
  7: '有机化学',
  8: '有机化学',
  9: '有机化学'
};

const submoduleMap = {
  1: '生物物理化学',
  2: '元素化学',
  3: '化学动力学',
  4: '电化学',
  5: '晶体结构与氢键',
  6: '纳米材料与光谱',
  7: '有机化学基础',
  8: '有机反应机理',
  9: '立体化学与重排'
};

const difficultyMap = {
  1: 3,
  2: 2,
  3: 4,
  4: 4,
  5: 4,
  6: 4,
  7: 2,
  8: 4,
  9: 4
};

const kpMap = {
  1: ['DNA纳米结构', '碱基配对', '动力学', '弹簧振子'],
  2: ['过氧化物制备', '过氧化钙', '纯度分析'],
  3: ['甲酸分解', '反应机理', 'van\'t Hoff方程', '速率方程'],
  4: ['锌碘电池', '电极电势', 'Nernst方程', '储能密度'],
  5: ['冰的结构', '氢键', '残余熵', '晶体坐标'],
  6: ['量子点', 'CdSe合成', '荧光淬灭', '稳态近似'],
  7: ['构象分析', '核磁共振', '化学位移', '芳香性'],
  8: ['ene反应', '杂原子ene反应', '周环反应'],
  9: ['重排反应', '溴化反应', '外消旋化', '立体化学']
};

function cleanContent(text) {
  // Remove details blocks that are OCR artifacts
  text = text.replace(/<details>\s*<summary>chemical<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>text_image<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>flowchart<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>line<\/summary>[\s\S]*?<\/details>/g, '');

  // Fix image paths - convert various formats to wiki-links
  text = text.replace(/!\[([^\]]*)\]\([^)]*?\/([a-f0-9]+\.\w{3,4})\)/g, '![[$2]]');
  text = text.replace(/<img[^>]*src="[^"]*\/([a-f0-9]+\.\w{3,4})"[^>]*\/>/g, '![[$1]]');

  // Remove excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function createFilename(num, title) {
  const cleanTitle = title.replace(/\$[^$]+\$/g, '').replace(/[\\/:*?"<>|]/g, '').trim();
  return `题-37决理-${num}-${cleanTitle}.md`;
}

const baseDir = '04-题库/真题/第37届决赛/理论/第二场';

for (const q of data.questions) {
  const a = data.answers.find(ans => ans.num === q.num);
  if (!a) {
    console.log(`Warning: no answer for Q${q.num}`);
    continue;
  }

  const questionContent = cleanContent(q.content);
  const answerContent = cleanContent(a.content);

  const filename = createFilename(q.num, q.title);
  const filepath = `${baseDir}/${filename}`;

  const frontmatter = `---
title: 题-37决理-${q.num}-${q.title}
aliases: []
type: 题目
exam_stage: 决赛
exam_type: 理论
exam_session: 第二场
year: 2023
exam_date: 2023-11-05
source: 第37届中国化学奥林匹克(决赛)
subject: ${subjectMap[q.num] || '综合'}
module: 决赛要求
submodule: ${submoduleMap[q.num] || '综合'}
question_type: 综合题
difficulty: ${difficultyMap[q.num] || 3}
teaching_level: 拔高
syllabus_codes: []
knowledge_points: [${(kpMap[q.num] || []).map(kp => `"${kp}"`).join(', ')}]
tags: [化竞, 决赛, 理论]
updated: 2026-05-20
---`;

  const body = `# 第 ${q.num} 题 ${q.title} (${q.score}%)

${questionContent}

---

## 参考答案

${answerContent}

---

## 考点抽象

> 这道题的表面是 ______，本质是 ______。

（待填充）

---

## 知识点映射

- **直接 KP**：[[ ]]
- **间接 KP**：[[ ]]
- **跨学科连接**：

---

## 解题思路

1.
2.
3.

---

## 变式拓展

- 如果把条件 A 换成 B，答案会如何变化？
- 这道题与往届决赛/初赛的哪道题是同构的？

---

## 易错分析

- 常见错误 1：
- 常见错误 2：

---

*本题由第37届化学奥林匹克(决赛)第2场试题答案提炼，导入时间：2026-05-20*
`;

  fs.writeFileSync(filepath, frontmatter + '\n\n' + body);
  console.log(`Created: ${filepath}`);
}

console.log('Done!');
