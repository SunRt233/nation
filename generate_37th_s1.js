const fs = require('fs');

const content = fs.readFileSync('mineru02/2023年第37届中国化学奥林匹克决赛第一场化学试题（解析版）.md', 'utf-8');
const lines = content.split('\n');

// Parse sections
const sections = [];
let current = null;
let buffer = [];

const headerRegex = /^#\s*第\s*(\d+)\s*题\(([\d\.]+)\s*分[^)]*\)(.+)$/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(headerRegex);
  if (m) {
    if (current) {
      current.raw = buffer.join('\n');
      sections.push(current);
    }
    current = {
      num: parseInt(m[1]),
      score: parseFloat(m[2]),
      title: m[3].trim(),
      startLine: i
    };
    buffer = [];
  } else {
    buffer.push(line);
  }
}

if (current) {
  current.raw = buffer.join('\n');
  sections.push(current);
}

console.log(`Found ${sections.length} sections`);
for (const s of sections) {
  console.log(`Q${s.num}: "${s.title}" (${s.score}分)`);
}

// Split each section into question and answer parts
for (const s of sections) {
  const text = s.raw;
  const markers = ['【答案】', '【解析】'];
  let splitIdx = -1;
  let splitMarker = '';

  for (const marker of markers) {
    const idx = text.indexOf(marker);
    if (idx !== -1 && (splitIdx === -1 || idx < splitIdx)) {
      splitIdx = idx;
      splitMarker = marker;
    }
  }

  if (splitIdx !== -1) {
    s.question = text.slice(0, splitIdx).trim();
    s.answer = text.slice(splitIdx).trim();
  } else {
    s.question = text.trim();
    s.answer = '';
  }
}

const subjectMap = {
  1: '无机化学', 2: '无机化学', 3: '无机化学', 4: '无机化学',
  5: '物理化学', 6: '物理化学', 7: '物理化学', 8: '有机化学',
  9: '有机化学', 10: '有机化学', 11: '有机化学', 12: '有机化学', 13: '有机化学'
};

const submoduleMap = {
  1: '配位化学', 2: '元素化学', 3: '元素化学', 4: '结构化学',
  5: '化学动力学', 6: '热力学', 7: '化学热力学', 8: '自由基化学',
  9: '物理有机化学', 10: '有机合成实验', 11: '羰基化学', 12: '金属有机化学', 13: '天然产物合成'
};

const difficultyMap = {
  1: 3, 2: 3, 3: 3, 4: 4, 5: 3, 6: 3, 7: 3, 8: 4, 9: 3, 10: 2, 11: 4, 12: 4, 13: 4
};

const kpMap = {
  1: ['配位化学', '晶体场理论', '磁矩'],
  2: ['元素化学', '镧系收缩', '晶体结构'],
  3: ['硼化学', '硅化学', '水解反应'],
  4: ['磷化学', '簇合物结构', ' Wade规则'],
  5: ['化学动力学', '时钟反应', '速率方程'],
  6: ['量热学', '热力学', '燃烧热'],
  7: ['化学热力学', '热容', '熵'],
  8: ['自由基', '氧化反应', '自氧化'],
  9: ['取代基效应', 'Hammett方程', '芳香亲电取代'],
  10: ['酯化反应', '分水操作', '有机实验'],
  11: ['羰基化合物', '缩合反应', '立体化学'],
  12: ['金属卡宾', '烯烃复分解', '催化循环'],
  13: ['天然产物合成', '全合成', '逆合成分析']
};

function cleanContent(text) {
  text = text.replace(/<details>\s*<summary>chemical<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>text_image<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>flowchart<\/summary>[\s\S]*?<\/details>/g, '');
  text = text.replace(/<details>\s*<summary>line<\/summary>[\s\S]*?<\/details>/g, '');

  text = text.replace(/!\[([^\]]*)\]\([^)]*?\/([a-f0-9]+\.\w{3,4})\)/g, '![[$2]]');
  text = text.replace(/<img[^>]*src="[^"]*\/([a-f0-9]+\.\w{3,4})"[^>]*\/>/g, '![[$1]]');

  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function createFilename(num, title) {
  const cleanTitle = title.replace(/\$[^$]+\$/g, '').replace(/[\\/:*?"<>|]/g, '').trim();
  return `题-37决理-${num}-${cleanTitle}.md`;
}

const baseDir = '04-题库/真题/第37届决赛/理论/第一场';

for (const s of sections) {
  const questionContent = cleanContent(s.question);
  const answerContent = cleanContent(s.answer);

  const filename = createFilename(s.num, s.title);
  const filepath = `${baseDir}/${filename}`;

  const frontmatter = `---
title: 题-37决理-${s.num}-${s.title}
aliases: []
type: 题目
exam_stage: 决赛
exam_type: 理论
exam_session: 第一场
year: 2023
exam_date: 2023-11-04
source: 第37届中国化学奥林匹克(决赛)
subject: ${subjectMap[s.num] || '综合'}
module: 决赛要求
submodule: ${submoduleMap[s.num] || '综合'}
question_type: 综合题
difficulty: ${difficultyMap[s.num] || 3}
teaching_level: 拔高
syllabus_codes: []
knowledge_points: [${(kpMap[s.num] || []).map(kp => `"${kp}"`).join(', ')}]
tags: [化竞, 决赛, 理论]
updated: 2026-05-20
---`;

  const answerSection = answerContent ? `\n---\n\n## 参考答案\n\n${answerContent}\n` : '\n';

  const body = `# 第 ${s.num} 题 ${s.title} (${s.score} 分)

${questionContent}
${answerSection}---

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

*本题由第37届化学奥林匹克(决赛)第1场试题答案提炼，导入时间：2026-05-20*
`;

  fs.writeFileSync(filepath, frontmatter + '\n\n' + body);
  console.log(`Created: ${filepath}`);
}

console.log('Done!');
