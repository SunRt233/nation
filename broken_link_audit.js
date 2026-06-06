const fs = require('fs');
const path = require('path');

const VAULT_ROOT = '.';
const INDEX_FILES = ['知识点总索引.md', '题库总索引.md'];

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

function extractFrontmatter(content) {
    const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return m ? m[1] : null;
}

function parseAliases(fm) {
    const m = fm.match(/^aliases:\s*\[(.*)\]\s*$/m);
    if (!m) return [];
    return m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(s => s);
}

// === Step 1: Build file + alias lookup table ===
console.log('Building file lookup table...');
const fileMap = new Map(); // basename (no ext) -> full path
const aliasMap = new Map(); // alias -> basename
const allPathsSet = new Set(); // relative path with forward slashes (no ext)

const allMdFiles = walkDir(VAULT_ROOT, '.md');
for (const f of allMdFiles) {
    const basename = path.basename(f, '.md');
    fileMap.set(basename, f);
    // Store relative path variants for Obsidian path resolution
    const relPath = f.replace(/\\/g, '/').replace(/^\.\//, '');
    allPathsSet.add(relPath);                       // path/to/file.md
    allPathsSet.add(relPath.replace(/\.md$/i, '')); // path/to/file
    const noExt = relPath.replace(/\.md$/i, '');
    if (noExt.includes('/')) {
        allPathsSet.add(noExt.split('/').slice(1).join('/')); // to/file (for subfolder matches)
    }
    const content = fs.readFileSync(f, 'utf8');
    const fm = extractFrontmatter(content);
    if (fm) {
        for (const a of parseAliases(fm)) {
            if (a) aliasMap.set(a, basename);
        }
    }
}
console.log(`Files: ${fileMap.size}, Aliases: ${aliasMap.size}, Path variants: ${allPathsSet.size}`);

// === Step 2: Extract all wikilinks ===
console.log('Scanning wikilinks...');
const wikilinkRegex = /!?\[\[([^\]]+)\]\]/g;

const categories = {
    valid: [],        // target exists
    indexPlaceholder: [], // in index files, target missing
    pathError: [],    // contains slash (path hint) but target missing
    redlink: [],      // target missing, not index, not path hint
};

for (const f of allMdFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const isIndex = INDEX_FILES.includes(path.basename(f));
    let match;
    while ((match = wikilinkRegex.exec(content)) !== null) {
        const raw = match[1];
        // Strip alias and heading anchor
        const target = raw.split('|')[0].split('#')[0].trim();
        if (!target) continue;

        const exists = fileMap.has(target) || aliasMap.has(target) || allPathsSet.has(target);
        const entry = { file: f, target, raw, line: '' };

        // Try to find line number
        const lines = content.substring(0, match.index).split(/\r?\n/);
        entry.line = lines.length;

        if (exists) {
            categories.valid.push(entry);
        } else if (isIndex) {
            categories.indexPlaceholder.push(entry);
        } else if (target.includes('/')) {
            categories.pathError.push(entry);
        } else {
            categories.redlink.push(entry);
        }
    }
}

console.log(`Valid: ${categories.valid.length}`);
console.log(`Index placeholder: ${categories.indexPlaceholder.length}`);
console.log(`Path error: ${categories.pathError.length}`);
console.log(`Redlink (broken): ${categories.redlink.length}`);

// === Step 3: Aggregate redlinks by target ===
const redlinkStats = new Map();
for (const r of categories.redlink) {
    if (!redlinkStats.has(r.target)) {
        redlinkStats.set(r.target, { count: 0, files: [] });
    }
    const s = redlinkStats.get(r.target);
    s.count++;
    if (s.files.length < 3) s.files.push(path.relative(VAULT_ROOT, r.file));
}

// === Step 4: Aggregate path errors ===
const pathErrorStats = new Map();
for (const r of categories.pathError) {
    if (!pathErrorStats.has(r.target)) {
        pathErrorStats.set(r.target, { count: 0, files: [] });
    }
    const s = pathErrorStats.get(r.target);
    s.count++;
    if (s.files.length < 3) s.files.push(path.relative(VAULT_ROOT, r.file));
}

// === Step 5: Output report ===
const now = new Date().toISOString().split('T')[0];
const reportPath = `09-审计报告/${now}-断链检测.md`;

let report = `---\ntitle: 断链检测-${now}\ntype: 审计\nupdated: ${now}\ntags: [审计, 断链]\n---\n\n# 断链检测 · ${now}\n\n`;
report += `| 类别 | 数量 |\n|:---|---:|\n`;
report += `| 正常链接（目标存在）| ${categories.valid.length} |\n`;
report += `| 索引占位（知识点/题库总索引）| ${categories.indexPlaceholder.length} |\n`;
report += `| 路径错误（含斜杠但目标缺失）| ${categories.pathError.length} |\n`;
report += `| **真断链（红链）** | **${categories.redlink.length}** |\n\n`;

report += `---\n\n`;

report += `## 🔴 路径错误（${categories.pathError.length} 处）\n\n`;
report += `| 目标 | 次数 | 示例文件 |\n|:---|---:|:---|\n`;
const sortedPathErrors = [...pathErrorStats.entries()].sort((a, b) => b[1].count - a[1].count);
for (const [target, stat] of sortedPathErrors.slice(0, 50)) {
    report += `| \`${target}\` | ${stat.count} | ${stat.files.join(', ')} |\n`;
}

report += `\n---\n\n`;

report += `## 🔴 真断链（红链 · ${categories.redlink.length} 处）\n\n`;
report += `| 目标 | 次数 | 示例文件 |\n|:---|---:|:---|\n`;
const sortedRedlinks = [...redlinkStats.entries()].sort((a, b) => b[1].count - a[1].count);
for (const [target, stat] of sortedRedlinks.slice(0, 100)) {
    report += `| \`${target}\` | ${stat.count} | ${stat.files.join(', ')} |\n`;
}

report += `\n---\n\n`;

report += `## 🟢 索引占位（无需处理 · ${categories.indexPlaceholder.length} 处）\n\n`;
report += `> 这些链接位于 \`知识点总索引.md\` 或 \`题库总索引.md\` 中，作为「待建清单」天然包含未创建文件的占位。\n\n`;
report += `前 30 个高频占位：\n\n`;
const indexStats = new Map();
for (const r of categories.indexPlaceholder) {
    if (!indexStats.has(r.target)) indexStats.set(r.target, 0);
    indexStats.set(r.target, indexStats.get(r.target) + 1);
}
const sortedIndex = [...indexStats.entries()].sort((a, b) => b[1] - a[1]);
for (const [target, count] of sortedIndex.slice(0, 30)) {
    report += `- \`${target}\` (${count} 次)\n`;
}

fs.writeFileSync(reportPath, report, 'utf8');
console.log(`Report written: ${reportPath}`);
