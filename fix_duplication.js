const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:/Obsidion/妙妙屋';

const FILES = [
    '03-知识点/有机化学/构象分析.md',
    '03-知识点/有机化学/串联反应.md',
    '03-知识点/有机化学/全合成.md',
    '03-知识点/有机化学/环化反应.md',
    '03-知识点/有机化学/卡宾化学.md',
    '03-知识点/有机化学/Kekulé式.md',
    '03-知识点/有机化学/Zincke反应.md',
    '03-知识点/有机化学/硬软亲核试剂.md',
    '03-知识点/有机化学/铜锂试剂.md',
    '03-知识点/有机化学/场效应.md',
    '03-知识点/有机化学/超分子识别.md',
    '03-知识点/有机化学/ANRORC.md',
    '03-知识点/有机化学/¹H NMR.md',
    '03-知识点/有机化学/离子对机理.md',
    '03-知识点/有机化学/构造异构.md',
    '03-知识点/有机化学/构象异构.md',
    '03-知识点/有机化学/E1反应.md',
    '03-知识点/有机化学/多肽合成.md',
    '03-知识点/有机化学/逆合成分析.md',
    '03-知识点/有机化学/Stille偶联.md',
];

function fixFile(relPath) {
    const filepath = path.join(BASE_DIR, relPath);
    const text = fs.readFileSync(filepath, 'utf-8');
    const lines = text.split('\n');

    // Find the last occurrence of '## 十五、待完善项'
    let lastShiwuIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '## 十五、待完善项') {
            lastShiwuIdx = i;
        }
    }

    if (lastShiwuIdx === -1) {
        console.log(`SKIP: ${relPath} - no '## 十五、待完善项' found`);
        return false;
    }

    // Find the next ## section after the last '## 十五、待完善项'
    let nextSectionIdx = -1;
    for (let i = lastShiwuIdx + 1; i < lines.length; i++) {
        if (lines[i].match(/^##\s+/)) {
            nextSectionIdx = i;
            break;
        }
    }

    // If there's a section after '## 十五、待完善项', it's duplicated content
    if (nextSectionIdx !== -1) {
        // Keep content up to and including the line after '## 十五、待完善项' placeholder
        // Look for '- [待补充]' after '## 十五、待完善项'
        let endIdx = lastShiwuIdx + 1;
        for (let i = lastShiwuIdx + 1; i < lines.length && i < nextSectionIdx; i++) {
            endIdx = i + 1;
        }

        const newLines = lines.slice(0, endIdx);
        const newText = newLines.join('\n') + '\n';
        fs.writeFileSync(filepath, newText, 'utf-8');
        console.log(`FIXED: ${relPath} - removed duplicated content from line ${nextSectionIdx + 1}`);
        return true;
    }

    console.log(`OK: ${relPath} - no duplication detected`);
    return false;
}

let fixed = 0;
let skipped = 0;

for (const relPath of FILES) {
    try {
        if (fixFile(relPath)) {
            fixed++;
        } else {
            skipped++;
        }
    } catch (e) {
        console.log(`ERROR: ${relPath} - ${e.message}`);
    }
}

console.log(`\nFixed: ${fixed}, Skipped/OK: ${skipped}, Total: ${FILES.length}`);
