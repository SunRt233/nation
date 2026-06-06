const fs = require('fs');
const path = require('path');

function walkDir(dir, ext) {
    const results = [];
    function walk(current) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === '.obsidian') continue;
                walk(fullPath);
            } else if (entry.name.endsWith(ext)) {
                results.push(fullPath);
            }
        }
    }
    walk(dir);
    return results;
}

function parseInlineArray(inner) {
    const items = [];
    let cur = '';
    let inQuotes = false, qChar = null;
    let inBrackets = 0;
    for (const ch of inner) {
        if (!inQuotes && (ch === '"' || ch === "'")) {
            inQuotes = true; qChar = ch; cur += ch;
        } else if (inQuotes && ch === qChar) {
            inQuotes = false; qChar = null; cur += ch;
        } else if (!inQuotes && ch === '[') {
            inBrackets++; cur += ch;
        } else if (!inQuotes && ch === ']') {
            inBrackets--; cur += ch;
        } else if (!inQuotes && ch === ',' && inBrackets === 0) {
            items.push(cur.trim());
            cur = '';
        } else {
            cur += ch;
        }
    }
    if (cur.trim()) items.push(cur.trim());
    return items;
}

const files = walkDir('.', '.md');
let filesModified = 0;
let typeLabelsFixed = 0;
let mineruPathsFixed = 0;

// Mineru path corrections: old -> new
const mineruCorrections = {
    'mineru/34届初赛试题解析': 'mineru/02-真题解析/34届初赛试题解析',
};

for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('knowledge_points:')) {
            const m = lines[i].match(/^knowledge_points:\s*\[(.*)\]\s*$/);
            if (!m) continue;
            const items = parseInlineArray(m[1]);

            const newItems = items.map(item => {
                let tag = item.trim();
                const qm = tag.match(/^["'](.*)["']$/);
                if (qm) tag = qm[1];
                tag = tag.trim();

                // Fix mineru path errors
                if (tag.startsWith('[[mineru/')) {
                    for (const [oldPath, newPath] of Object.entries(mineruCorrections)) {
                        if (tag === `[[${oldPath}]]`) {
                            mineruPathsFixed++;
                            return `"[[${newPath}]]"`;
                        }
                    }
                }

                // Remove wikilink from type labels
                if (tag.startsWith('[[题型-') && tag.endsWith(']]')) {
                    const plain = tag.slice(2, -2); // remove [[ and ]]
                    typeLabelsFixed++;
                    return plain; // return as plain text
                }

                // Return unchanged
                return item;
            });

            const newLine = `knowledge_points: [${newItems.join(', ')}]`;
            if (newLine !== lines[i]) {
                lines[i] = newLine;
                modified = true;
            }
            break;
        }
    }

    if (modified) {
        fs.writeFileSync(f, lines.join('\n'), 'utf8');
        filesModified++;
    }
}

console.log(`Files modified: ${filesModified}`);
console.log(`Type labels fixed: ${typeLabelsFixed}`);
console.log(`Mineru paths fixed: ${mineruPathsFixed}`);
