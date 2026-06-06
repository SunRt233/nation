const fs = require('fs');

const data = JSON.parse(fs.readFileSync('parse_38th.json', 'utf-8'));

const subjectMap = {
    1: '无机化学',
    2: '无机化学',
    3: '物理化学',
    4: '无机化学',
    5: '物理化学',
    6: '结构化学',
    7: '无机化学',
    8: '有机化学',
    9: '有机化学',
    10: '有机化学'
};

const submoduleMap = {
    1: '元素化学',
    2: '簇合物与团簇',
    3: '同位素化学与热力学',
    4: '金属有机化学',
    5: '化学动力学与电化学',
    6: '高压化学与晶体结构',
    7: '配位化学',
    8: '有机化学基础',
    9: '有机反应机理',
    10: '杂环化学与合成'
};

const difficultyMap = {
    1: 3,
    2: 4,
    3: 3,
    4: 4,
    5: 4,
    6: 4,
    7: 4,
    8: 2,
    9: 4,
    10: 4
};

const kpMap = {
    1: ['铍化学', '环戊二烯配合物', '氧化态', 'NMR谱学'],
    2: ['硅团簇', '八隅律', 'NMR表征', '异构化'],
    3: ['同位素效应', '零点能', '简谐振动', '化学平衡', '电化学富集'],
    4: ['N-H键活化', '氧化加成', '过渡金属配合物', '主族元素化学', '热力学循环'],
    5: ['电化学', '生化标准态', '酶动力学', '米氏方程', '双倒数作图'],
    6: ['高压化学', '氮化物结构', '晶体学', '二维材料'],
    7: ['自旋态', '晶体场理论', '磁矩', 'EPR', '热力学'],
    8: ['格氏试剂', '乳化', '萃取', '构象分析', '红外光谱'],
    9: ['碳正离子', '溶剂解反应', '氘代', '超共轭', '邻基参与'],
    10: ['氮杂环', '芳香亲电取代', '芳香亲核取代', '同位素编辑', '扩环反应']
};

function cleanContent(text) {
    // Remove details blocks that are OCR artifacts
    text = text.replace(/<details>\s*<summary>chemical<\/summary>[\s\S]*?<\/details>/g, '');
    text = text.replace(/<details>\s*<summary>text_image<\/summary>[\s\S]*?<\/details>/g, '');

    // Fix image paths
    // Convert ![](path/hash.jpg) or ![alt](path/hash.jpg) to ![[hash.jpg]]
    text = text.replace(/!\[([^\]]*)\]\([^)]*?\/([a-f0-9]+\.\w{3,4})\)/g, '![[$2]]');

    // Also convert <img src="path/hash.jpg"/> to ![[hash.jpg]]
    text = text.replace(/<img[^>]*src="[^"]*\/([a-f0-9]+\.\w{3,4})"[^>]*\/>/g, '![[$1]]');

    // Remove excessive blank lines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

function createFilename(num, title) {
    // Remove math and special chars, keep Chinese and alphanumeric
    const cleanTitle = title.replace(/\$[^$]+\$/g, '').replace(/[\\/:*?"<>|]/g, '').trim();
    return `题-38决理-${num}-${cleanTitle}.md`;
}

const baseDir = '04-题库/真题/第38届决赛/理论';

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
title: 题-38决理-${q.num}-${q.title}
aliases: []
type: 题目
exam_stage: 决赛
exam_type: 理论
exam_session: 第二场
year: 2024
exam_date: 2024-10-27
source: 第38届中国化学奥林匹克(决赛)
subject: ${subjectMap[q.num]}
module: 决赛要求
submodule: ${submoduleMap[q.num]}
question_type: 综合题
difficulty: ${difficultyMap[q.num]}
teaching_level: 拔高
syllabus_codes: []
knowledge_points: [${kpMap[q.num].map(kp => `"${kp}"`).join(', ')}]
tags: [化竞, 决赛, 理论]
updated: 2026-05-20
---`;

    const body = `# 第 ${q.num} 题 ${q.title} (${q.score} 分)

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

*本题由第38届化学奥林匹克(决赛)第2场试题答案提炼，导入时间：2026-05-20*
`;

    fs.writeFileSync(filepath, frontmatter + '\n\n' + body);
    console.log(`Created: ${filepath}`);
}

console.log('Done!');
