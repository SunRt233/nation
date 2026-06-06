const fs = require('fs');
const path = require('path');

function walkDir(dir, ext) {
    const results = [];
    function walk(current) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) walk(fullPath);
            else if (entry.name.endsWith(ext)) results.push(fullPath);
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

const files = walkDir('04-题库', '.md');
let fixedCount = 0;
let bracketFixed = 0;

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
                // Strip outer quotes
                const qm = tag.match(/^["'](.*)["']$/);
                if (qm) tag = qm[1];
                tag = tag.trim();

                // Fix excessive bracket nesting
                let changed = true;
                while (changed) {
                    const prev = tag;
                    // Collapse [[[X]]] or [[[[X]]]] etc. down to [[X]]
                    if (tag.startsWith('[[[') && tag.endsWith(']]]')) {
                        tag = tag.substring(1, tag.length - 1); // remove one [ from start and one ] from end
                    }
                    // Also handle cases like [[[[X]]]] (4 brackets)
                    tag = tag.replace(/^\[\[\[\[/g, '[[').replace(/\]\]\]\]$/g, ']]');
                    changed = (tag !== prev);
                }

                if (tag.startsWith('[[') && tag.endsWith(']]')) {
                    bracketFixed++;
                    return `"${tag}"`;
                }
                // Quote if contains special YAML chars
                if (tag.includes(',') || tag.includes(':') || tag.includes('[') || tag.includes(']')) {
                    return `"${tag}"`;
                }
                return tag;
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
        fixedCount++;
    }
}

console.log(`Files fixed: ${fixedCount}`);
console.log(`Wikilinks properly quoted: ${bracketFixed}`);
