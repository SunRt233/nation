const fs = require('fs');

function fixMergedFile(path, kpName) {
    let content = fs.readFileSync(path, 'utf8');

    // Remove the duplicated frontmatter + title + nav section after the "深化补充" marker
    // Pattern: after "深化补充" intro, there's another frontmatter block + # Title + nav lines
    const regex = new RegExp(
        `(## 深化补充（决赛要求）\\n\\n> 以下内容整合自原决赛要求深化版，面向决赛阶段对${kpName}的系统深入要求。\\n\\n)` +
        `---\\n[\\s\\S]*?\\n---\\n\\n` +
        `# .+\\n\\n` +
        `- 总览：\\[\\[.+?\\]\\]\\n` +
        `- 所属模块：\\[\\[.+?\\]\\]\\n` +
        `- 对应考纲条目：\\[\\[.+?\\]\\]\\n`,
        'g'
    );

    const original = content;
    content = content.replace(regex, '$1');

    if (content !== original) {
        fs.writeFileSync(path, content, 'utf8');
        console.log(`Fixed ${path}`);
    } else {
        console.log(`No fix needed for ${path} (or pattern not matched)`);
    }
}

fixMergedFile('03-知识点/化学原理/晶体场理论.md', '晶体场理论');
fixMergedFile('03-知识点/化学原理/高自旋与低自旋.md', '高自旋与低自旋');
console.log('Done.');
