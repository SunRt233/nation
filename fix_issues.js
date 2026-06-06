const fs = require('fs');
const path = require('path');

function walkDir(dir, ext) {
    const results = [];
    function walk(current) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === '.obsidian' || entry.name === '.claudian') continue;
                walk(fullPath);
            } else if (entry.name.endsWith(ext)) {
                results.push(fullPath);
            }
        }
    }
    walk(dir);
    return results;
}

const files = walkDir('.', '.md');
let filesModified = 0;
let typeLabelsFixed = 0;
let mineruPathsFixed = 0;

// Files to skip for type label removal (intentional index placeholders)
const skipTypeLabelFiles = [
    '04-专题与题型/题型/README.md',
    '11-模板/real_broken_links_20260513.md',
];

for (const f of files) {
    const relPath = path.relative('.', f).replace(/\\/g, '/');
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;
    const original = content;

    // Fix 1: mineru path error (only the known incorrect path)
    // [[mineru/34届初赛试题解析]] → [[mineru/02-真题解析/34届初赛试题解析]]
    // [[mineru/34届初赛试题解析|text]] → [[mineru/02-真题解析/34届初赛试题解析|text]]
    const mineruRegex = /\[\[mineru\/34届初赛试题解析(\|[^\]]+)?\]\]/g;
    content = content.replace(mineruRegex, (match, aliasPart) => {
        mineruPathsFixed++;
        return `[[mineru/02-真题解析/34届初赛试题解析${aliasPart || ''}]]`;
    });

    // Fix 2: Remove wikilink from type labels (except in index files)
    if (!skipTypeLabelFiles.includes(relPath) && !relPath.startsWith('11-模板/')) {
        // [[题型-XXX]] → 题型-XXX (plain text)
        // [[题型-XXX|display]] → 题型-XXX (keep display? No, just plain text)
        const typeRegex = /\[\[题型-[^\]|]+(\|[^\]]+)?\]\]/g;
        content = content.replace(typeRegex, (match, aliasPart) => {
            typeLabelsFixed++;
            // Extract the type label name
            const inner = match.slice(2, -2); // remove [[ and ]]
            const labelName = inner.split('|')[0];
            return labelName;
        });
    }

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        filesModified++;
    }
}

console.log(`Files modified: ${filesModified}`);
console.log(`Type labels fixed: ${typeLabelsFixed}`);
console.log(`Mineru paths fixed: ${mineruPathsFixed}`);
