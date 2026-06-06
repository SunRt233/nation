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

const files = walkDir('04-题库', '.md');
let fixedCount = 0;
let totalFixedLines = 0;

for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('knowledge_points:')) {
            const original = lines[i];
            // Fix excessive bracket nesting: [[[[X]]]] -> [[X]], [[[[[X]]]]] -> [[X]], etc.
            let fixed = original;
            // Repeatedly collapse until stable
            let prev;
            do {
                prev = fixed;
                fixed = fixed.replace(/\[\[\[\[/g, '[[').replace(/\]\]\]\]/g, ']]');
            } while (fixed !== prev);

            if (fixed !== original) {
                lines[i] = fixed;
                modified = true;
                totalFixedLines++;
            }
            break;
        }
    }

    if (modified) {
        fs.writeFileSync(f, lines.join('\n'), 'utf8');
        fixedCount++;
    }
}

console.log(`Fixed ${fixedCount} files, ${totalFixedLines} lines.`);
