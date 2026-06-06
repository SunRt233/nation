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

function extractFrontmatter(content) {
    const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return m ? m[1] : null;
}

function parseTitle(fm) {
    const m = fm.match(/^title:\s*(.+)$/m);
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function parseAliases(fm) {
    const m = fm.match(/^aliases:\s*\[(.*)\]\s*$/m);
    if (!m) return [];
    return m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(s => s);
}

// === Step 1: Build KP lookup table ===
console.log('Building KP lookup table...');
const kpMap = new Map(); // tag -> mainTitle
const kpFiles = walkDir('03-知识点', '.md');
for (const f of kpFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const fm = extractFrontmatter(content);
    if (!fm) continue;
    const title = parseTitle(fm);
    if (title) kpMap.set(title, title);
    for (const a of parseAliases(fm)) {
        if (a) kpMap.set(a, title);
    }
}
console.log(`KP entries: ${kpMap.size}`);

// === Step 2: Scan exam files, classify tags ===
console.log('Scanning exam files...');
const examFiles = walkDir('04-题库', '.md');
const tagStats = new Map(); // tag -> { count, hasKp, kpName }

for (const f of examFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    let inFm = false;
    for (const line of lines) {
        if (line.trim() === '---') {
            inFm = !inFm;
            if (!inFm) break;
            continue;
        }
        if (inFm && line.startsWith('knowledge_points:')) {
            const m = line.match(/^knowledge_points:\s*\[(.*)\]\s*$/);
            if (!m) continue;
            const inner = m[1];
            // Parse inline array elements carefully
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

            for (const item of items) {
                const trimmed = item.trim();
                if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) continue; // already wikilink
                // Strip quotes to get raw tag
                let tag = trimmed;
                const qm = trimmed.match(/^["'](.*)["']$/);
                if (qm) tag = qm[1];
                tag = tag.trim();
                if (!tag) continue;

                if (!tagStats.has(tag)) {
                    tagStats.set(tag, {
                        count: 0,
                        hasKp: kpMap.has(tag),
                        kpName: kpMap.get(tag) || ''
                    });
                }
                tagStats.get(tag).count++;
            }
            break;
        }
    }
}

// === Step 3: Make decisions ===
let replaceCount = 0, redlinkCount = 0, ignoreCount = 0;
for (const [tag, stat] of tagStats) {
    if (stat.hasKp) {
        stat.decision = 'REPLACE';
        replaceCount++;
    } else if (tag.startsWith('题型-')) {
        stat.decision = 'IGNORE';
        ignoreCount++;
    } else if (stat.count >= 3) {
        stat.decision = 'REDLINK';
        redlinkCount++;
    } else {
        stat.decision = 'IGNORE';
        ignoreCount++;
    }
}

console.log(`Total unique plain text tags: ${tagStats.size}`);
console.log(`REPLACE (has KP): ${replaceCount}`);
console.log(`REDLINK (missing KP, freq>=3): ${redlinkCount}`);
console.log(`IGNORE (type or low freq): ${ignoreCount}`);

// Output CSV for review
const sorted = [...tagStats.entries()].sort((a, b) => b[1].count - a[1].count);
const csvLines = ['count,tag,decision,kp_name'];
for (const [tag, stat] of sorted) {
    csvLines.push(`${stat.count},"${tag}",${stat.decision},"${stat.kpName || ''}"`);
}
fs.writeFileSync('tag_analysis.csv', csvLines.join('\n'), 'utf8');
console.log('CSV written: tag_analysis.csv');

// === Step 4: Batch replace ===
console.log('Applying replacements...');
let filesModified = 0;
let totalReplaced = 0, totalRedlinked = 0;

for (const f of examFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    let modified = false;
    let inFm = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '---') {
            inFm = !inFm;
            if (!inFm) break;
            continue;
        }
        if (inFm && line.startsWith('knowledge_points:')) {
            const m = line.match(/^knowledge_points:\s*\[(.*)\]\s*$/);
            if (!m) break;
            const inner = m[1];
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

            let lineChanged = false;
            const newItems = items.map(item => {
                const trimmed = item.trim();
                if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) return trimmed;
                let tag = trimmed;
                const qm = trimmed.match(/^["'](.*)["']$/);
                if (qm) tag = qm[1];
                tag = tag.trim();
                if (!tag) return item;
                const stat = tagStats.get(tag);
                if (!stat) return item;
                if (stat.decision === 'REPLACE') {
                    lineChanged = true;
                    totalReplaced++;
                    return `[[${stat.kpName}]]`;
                } else if (stat.decision === 'REDLINK') {
                    lineChanged = true;
                    totalRedlinked++;
                    return `[[${tag}]]`;
                } else {
                    return item;
                }
            });

            if (lineChanged) {
                lines[i] = `knowledge_points: [${newItems.join(', ')}]`;
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
console.log(`Tags replaced (has KP): ${totalReplaced}`);
console.log(`Tags redlinked (missing KP): ${totalRedlinked}`);
console.log('Done.');
