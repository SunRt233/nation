const fs = require('fs');
const path = require('path');

function mergeKP(basePath, deepPath, kpName) {
    const baseContent = fs.readFileSync(basePath, 'utf8');
    const deepContent = fs.readFileSync(deepPath, 'utf8');

    // Strip frontmatter from deep version
    const deepFmMatch = deepContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    const deepWithoutFm = deepFmMatch ? deepContent.slice(deepFmMatch[0].length) : deepContent;

    // Remove the # title line if present
    const deepBody = deepWithoutFm.replace(/^# .+\r?\n/, '').trim();

    // Append to base with separator
    const separator = `\n\n---\n\n## 深化补充（决赛要求）\n\n> 以下内容整合自原决赛要求深化版，面向决赛阶段对${kpName}的系统深入要求。\n\n`;
    const mergedContent = baseContent.trim() + separator + deepBody;

    fs.writeFileSync(basePath, mergedContent, 'utf8');
    fs.unlinkSync(deepPath);
    console.log(`Merged ${kpName} successfully.`);
}

// Merge 晶体场理论
mergeKP(
    '03-知识点/化学原理/晶体场理论.md',
    '03-知识点/决赛要求/结构与配位深化/晶体场理论.md',
    '晶体场理论'
);

// Merge 高自旋与低自旋
mergeKP(
    '03-知识点/化学原理/高自旋与低自旋.md',
    '03-知识点/决赛要求/结构与配位深化/高自旋与低自旋.md',
    '高自旋与低自旋'
);

console.log('All merges completed.');
