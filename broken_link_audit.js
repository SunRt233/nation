const fs = require('fs');
const path = require('path');

const VAULT_ROOT = '.';
const INDEX_FILES = new Set(['知识点总索引.md', '题库总索引.md']);
const IGNORE_DIRS = new Set(['.obsidian', '.trash', '.claude', '.git', 'node_modules']);
const LOW_SIGNAL_SOURCE_PREFIXES = ['09-审计报告/', '11-模板/', 'skills/', 'copilot/'];
const STRIPPABLE_PREFIXES = [
    '专题-',
    '题型-',
    '提炼-',
    '教学逻辑提炼-',
    '网课上课思路提炼-',
    '习题-',
    '模板-',
    '任务卡-',
    'KP-',
];

function detectKnownPrefix(text) {
    for (const prefix of STRIPPABLE_PREFIXES) {
        if ((text || '').startsWith(prefix)) return prefix;
    }
    return null;
}

function walkDir(dir, ext = null) {
    const results = [];
    function walk(current) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (IGNORE_DIRS.has(entry.name)) continue;
                walk(fullPath);
            } else if (!ext || entry.name.endsWith(ext)) {
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

function parseScalarField(frontmatter, fieldName) {
    const pattern = new RegExp(`^${fieldName}:\\s*(.+?)\\s*$`, 'm');
    const m = frontmatter.match(pattern);
    if (!m) return '';
    return m[1].trim().replace(/^["']|["']$/g, '');
}

function parseAliases(frontmatter) {
    const lines = frontmatter.split(/\r?\n/);
    const aliases = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const inline = line.match(/^aliases:\s*\[(.*)\]\s*$/);
        if (inline) {
            inline[1]
                .split(',')
                .map((s) => s.trim().replace(/^["']|["']$/g, ''))
                .filter(Boolean)
                .forEach((alias) => aliases.push(alias));
            break;
        }

        if (/^aliases:\s*$/.test(line)) {
            for (let j = i + 1; j < lines.length; j++) {
                const aliasLine = lines[j];
                const item = aliasLine.match(/^\s*-\s+(.+?)\s*$/);
                if (!item) break;
                aliases.push(item[1].trim().replace(/^["']|["']$/g, ''));
                i = j;
            }
            break;
        }
    }

    return aliases.filter(Boolean);
}

function normalizeText(text) {
    return (text || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[`"'“”‘’]/g, '')
        .replace(/[：:·•，,、；;。！？!?\s\u3000_\-]/g, '')
        .replace(/[\/\\]/g, '/');
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripKnownPrefixes(text) {
    const variants = new Set([text]);
    let changed = true;

    while (changed) {
        changed = false;
        for (const current of [...variants]) {
            for (const prefix of STRIPPABLE_PREFIXES) {
                if (current.startsWith(prefix)) {
                    const stripped = current.slice(prefix.length).trim();
                    if (stripped && !variants.has(stripped)) {
                        variants.add(stripped);
                        changed = true;
                    }
                }
            }
        }
    }

    return [...variants];
}

function isPlaceholderTarget(target) {
    const normalized = target.trim();
    if (!normalized) return true;

    const exactPlaceholders = new Set([
        '-',
        '...',
        'xxx',
        'XX',
        '专题-XX',
        '题型-',
        'KP',
        'KP-1',
        'KP-2',
        'KP-XX',
        'Note Name',
        'source',
        'path',
        'mineru/path',
        '知识点文件名',
        '教学逻辑提炼-XX',
        '<KP>',
    ]);
    if (exactPlaceholders.has(normalized)) return true;

    if (/^<.+>$/.test(normalized)) return true;
    if (normalized.includes('<') || normalized.includes('>')) return true;
    if (/^(待建|待补充|占位)/.test(normalized)) return true;
    if (/^(专题|题型|KP)-?(XX|xxx)$/i.test(normalized)) return true;
    if (/^\d+([.-]\d+)*$/.test(normalized)) return true;
    if (/(^|\/)(xxx|XX|题号|文件名|目标|教材章节)(\/|$)/i.test(normalized)) return true;
    if (/^(题库|路径|folder|教师讲义|工具脚本)\//.test(normalized)) return true;

    return false;
}

function addToMultiMap(map, key, value) {
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
}

function dedupeRecords(records) {
    const seen = new Set();
    return records.filter((record) => {
        if (seen.has(record.relNoExt)) return false;
        seen.add(record.relNoExt);
        return true;
    });
}

function chooseCanonical(record) {
    return record.basename;
}

function makeDisplayLink(record) {
    return `[[${record.relNoExt}|${chooseCanonical(record)}]]`;
}

function aggregate(entries) {
    const stats = new Map();
    for (const entry of entries) {
        if (!stats.has(entry.target)) {
            stats.set(entry.target, { count: 0, files: [], examples: [] });
        }
        const stat = stats.get(entry.target);
        stat.count++;
        if (stat.files.length < 3) stat.files.push(entry.file);
        if (entry.suggestion && stat.examples.length < 3 && !stat.examples.includes(entry.suggestion)) {
            stat.examples.push(entry.suggestion);
        }
    }
    return [...stats.entries()].sort((a, b) => b[1].count - a[1].count);
}

function collectVariants(target) {
    const variants = new Set();
    for (const base of stripKnownPrefixes(target)) {
        variants.add(base);
        const basename = base.split('/').pop();
        if (basename) variants.add(basename);
    }
    return [...variants].filter(Boolean);
}

function isAssetLikeTarget(target) {
    const lastPart = target.split('/').pop() || target;
    return (
        /\.(png|jpe?g|gif|svg|webp|bmp|pdf|base|canvas|excalidraw|drawio|pptx?|docx?|xlsx?|csv|tsv|json)$/i.test(lastPart) ||
        target.includes('_images/') ||
        target.endsWith('/images') ||
        target.endsWith('_images') ||
        target.startsWith('mineru/') ||
        target.startsWith('10-附件/')
    );
}

function isLowSignalSource(file) {
    return LOW_SIGNAL_SOURCE_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function looksLikeVaultPath(target) {
    if (!target) return false;
    if (/^(\.\/|\.\.\/|\/)/.test(target)) return true;
    if (!target.includes('/')) return false;
    const first = target.split('/')[0];
    return topLevelPathRoots.has(first);
}

function collectSlashVariants(text) {
    const variants = new Set([text]);
    if (!/[\/\\]/.test(text)) return [...variants];

    variants.add(text.replace(/[\/\\]/g, '-'));
    variants.add(text.replace(/[\/\\]/g, '与'));
    variants.add(text.replace(/[\/\\]/g, ''));
    variants.add(text.replace(/[\/\\]\s*/g, '-'));
    variants.add(text.replace(/\s*[\/\\]\s*/g, '-'));

    if (text.includes('命名')) variants.add(text.replace(/命名/g, '构型'));
    if (text.includes('构型')) variants.add(text.replace(/构型/g, '命名'));

    return [...variants].filter(Boolean);
}

function collectSemanticVariants(text) {
    const variants = new Set();
    const queue = [text];
    const seen = new Set();

    const transforms = [
        (value) => value.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
        (value) => value.replace(/-(基础班|提高班|冲刺班|决赛班|复习课|新授课|习题课)$/, ''),
        (value) => value.replace(/-?第[一二三四五六七八九十]+轮试点$/, ''),
        (value) => value.replace(/-?第[一二三四五六七八九十]+轮$/, ''),
        (value) => value.replace(/-?L\d+\s*/g, '-'),
        (value) => value.replace(/^(网课上课思路提炼|教学逻辑提炼|资料提炼)-/, ''),
        (value) => value.replace(/^(质心|周坤|学而思|Zchem)-/, ''),
    ];

    function enqueue(value) {
        const cleaned = (value || '')
            .replace(/^-+|-+$/g, '')
            .replace(/--+/g, '-')
            .trim();
        if (!cleaned || cleaned === text || seen.has(cleaned)) return;
        seen.add(cleaned);
        variants.add(cleaned);
        queue.push(cleaned);
    }

    while (queue.length > 0) {
        const current = queue.shift();
        for (const transform of transforms) {
            enqueue(transform(current));
        }

        const parts = current.split('-').map((part) => part.trim()).filter(Boolean);
        if (parts.length >= 2) {
            enqueue(parts.slice(1).join('-'));
            enqueue(parts[parts.length - 1]);
        }
    }

    return [...variants];
}

function collectResolutionKeys(target) {
    const variants = new Set();

    for (const variant of collectVariants(target)) {
        variants.add(variant);
    }

    if (looksLikeVaultPath(target)) {
        const basename = target.split('/').pop();
        if (basename) {
            for (const variant of collectVariants(basename)) {
                variants.add(variant);
            }
            for (const semanticVariant of collectSemanticVariants(basename)) {
                for (const variant of collectVariants(semanticVariant)) {
                    variants.add(variant);
                }
            }
            for (const slashVariant of collectSlashVariants(basename)) {
                for (const variant of collectVariants(slashVariant)) {
                    variants.add(variant);
                }
            }
        }
    } else {
        for (const semanticVariant of collectSemanticVariants(target)) {
            for (const variant of collectVariants(semanticVariant)) {
                variants.add(variant);
            }
        }
        for (const slashVariant of collectSlashVariants(target)) {
            for (const variant of collectVariants(slashVariant)) {
                variants.add(variant);
            }
        }
    }

    return [...variants].filter(Boolean);
}

function resolveDirectoryReadmeTarget(target) {
    const normalized = target.replace(/\/+$/, '');
    const readmeNoExt = `${normalized}/README`;
    if (allPathsSet.has(readmeNoExt)) return readmeNoExt;
    if (allPathsSet.has(`${normalized}/README.md`)) return readmeNoExt;
    return '';
}

// === Step 1: Build file + alias lookup table ===
console.log('Building file lookup table...');
const exactNameMap = new Map();
const exactAliasMap = new Map();
const exactTitleMap = new Map();
const normalizedKeyMap = new Map();
const allPathsSet = new Set();
const topLevelPathRoots = new Set();
const searchEntries = [];
const notes = [];

const allVaultFiles = walkDir(VAULT_ROOT);
for (const fullPath of allVaultFiles) {
    const relPath = path.relative(VAULT_ROOT, fullPath).replace(/\\/g, '/');
    allPathsSet.add(relPath);
    const first = relPath.split('/')[0];
    if (first) topLevelPathRoots.add(first);
}

const allMdFiles = walkDir(VAULT_ROOT, '.md');
for (const fullPath of allMdFiles) {
    const basename = path.basename(fullPath, '.md');
    const relPath = path.relative(VAULT_ROOT, fullPath).replace(/\\/g, '/');
    const relNoExt = relPath.replace(/\.md$/i, '');
    const content = fs.readFileSync(fullPath, 'utf8');
    const frontmatter = extractFrontmatter(content) || '';
    const title = parseScalarField(frontmatter, 'title') || basename;
    const aliases = parseAliases(frontmatter);

    const note = { fullPath, relPath, relNoExt, basename, title, aliases };
    note.prefixes = new Set(
        [basename, title, ...aliases]
            .map(detectKnownPrefix)
            .filter(Boolean)
    );
    notes.push(note);

    addToMultiMap(exactNameMap, basename, note);
    addToMultiMap(exactTitleMap, title, note);
    for (const alias of aliases) addToMultiMap(exactAliasMap, alias, note);

    allPathsSet.add(relPath);
    allPathsSet.add(relNoExt);

    const searchKeys = new Set([basename, title, ...aliases]);
    for (const key of [...searchKeys]) {
        for (const variant of stripKnownPrefixes(key)) {
            searchKeys.add(variant);
        }
    }

    for (const key of searchKeys) {
        const normalized = normalizeText(key);
        if (!normalized) continue;
        addToMultiMap(normalizedKeyMap, normalized, note);
        searchEntries.push({ normalized, note, key });
    }
}

console.log(
    `Files: ${notes.length}, Exact names: ${exactNameMap.size}, Exact aliases: ${exactAliasMap.size}, Exact titles: ${exactTitleMap.size}, Normalized keys: ${normalizedKeyMap.size}`
);

function resolveExactCandidates(target) {
    const candidates = [
        ...(exactNameMap.get(target) || []),
        ...(exactAliasMap.get(target) || []),
        ...(exactTitleMap.get(target) || []),
    ];
    return dedupeRecords(candidates);
}

function resolveNormalizedCandidates(target) {
    const candidates = [];
    const variants = collectResolutionKeys(target);
    for (const variant of variants) {
        const normalized = normalizeText(variant);
        if (!normalized) continue;
        const variantPrefix = detectKnownPrefix(variant);
        const matches = (normalizedKeyMap.get(normalized) || []).filter((note) => {
            if (!variantPrefix) return true;
            return note.prefixes.has(variantPrefix);
        });
        candidates.push(...matches);
    }
    return dedupeRecords(candidates);
}

function resolveFuzzyCandidates(target) {
    const candidates = [];
    for (const variant of collectResolutionKeys(target)) {
        if (looksLikeVaultPath(variant)) continue;

        const targetPrefix = detectKnownPrefix(variant);
        const targetNorm = normalizeText(variant);
        if (!targetNorm || targetNorm.length < 4) continue;

        for (const entry of searchEntries) {
            const keyNorm = entry.normalized;
            if (keyNorm === targetNorm) continue;
            if (keyNorm.length < 4) continue;
            if (targetPrefix && !entry.note.prefixes.has(targetPrefix)) continue;

            const containsMatch =
                keyNorm.includes(targetNorm) || targetNorm.includes(keyNorm);

            if (!containsMatch) continue;
            const ratio = Math.min(keyNorm.length, targetNorm.length) / Math.max(keyNorm.length, targetNorm.length);
            if (ratio < 0.6) continue;
            candidates.push(entry.note);
            if (candidates.length >= 20) return dedupeRecords(candidates);
        }
    }

    return dedupeRecords(candidates);
}

// === Step 2: Extract all wikilinks ===
console.log('Scanning wikilinks...');
const wikilinkRegex = /!?\[\[([^\]]+)\]\]/g;

const categories = {
    valid: [],
    pathPrefixResolved: [],
    skippedPlaceholder: [],
    indexPlaceholder: [],
    sourceNoise: [],
    normalizedMatch: [],
    fuzzyCandidate: [],
    pathErrorAsset: [],
    pathErrorNote: [],
    pathError: [],
    redlink: [],
};

const unresolved = [];

for (const fullPath of allMdFiles) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const relFile = path.relative(VAULT_ROOT, fullPath).replace(/\\/g, '/');
    const isIndex = INDEX_FILES.has(path.basename(fullPath));
    let match;

    while ((match = wikilinkRegex.exec(content)) !== null) {
        const raw = match[1];
        const target = raw
            .split('|')[0]
            .split('#')[0]
            .trim()
            .replace(/\\/g, '/')
            .replace(/\/+$/, '');
        if (!target) continue;

        const entry = { file: relFile, target, raw };

        if (isPlaceholderTarget(target)) {
            categories.skippedPlaceholder.push(entry);
            continue;
        }

        const pathExactExists = allPathsSet.has(target);
        const exactCandidates = resolveExactCandidates(target);
        const targetBasename = target.split('/').pop();
        const basenameCandidates = target.includes('/') ? resolveExactCandidates(targetBasename) : [];
        const readmeTarget = looksLikeVaultPath(target) ? resolveDirectoryReadmeTarget(target) : '';

        if (pathExactExists || exactCandidates.length > 0) {
            categories.valid.push(entry);
        } else if (isIndex) {
            categories.indexPlaceholder.push(entry);
        } else if (readmeTarget) {
            categories.pathPrefixResolved.push({
                ...entry,
                suggestion: `[[${readmeTarget}|README]]`,
            });
        } else if (target.includes('/') && basenameCandidates.length > 0) {
            categories.pathPrefixResolved.push({
                ...entry,
                suggestion: basenameCandidates.length === 1 ? makeDisplayLink(basenameCandidates[0]) : basenameCandidates.map(makeDisplayLink).slice(0, 3).join(' / '),
            });
        } else {
            unresolved.push(entry);
        }
    }
}

// === Step 3: Reclassify unresolved targets ===
const unresolvedByTarget = new Map();
for (const entry of unresolved) {
    if (!unresolvedByTarget.has(entry.target)) unresolvedByTarget.set(entry.target, []);
    unresolvedByTarget.get(entry.target).push(entry);
}

for (const [target, entries] of unresolvedByTarget.entries()) {
    const liveEntries = entries.filter((entry) => !isLowSignalSource(entry.file));
    const noiseEntries = entries.filter((entry) => isLowSignalSource(entry.file));
    if (noiseEntries.length > 0) {
        categories.sourceNoise.push(...noiseEntries);
    }
    if (liveEntries.length === 0) continue;

    const normalizedCandidates = resolveNormalizedCandidates(target);

    if (normalizedCandidates.length === 1) {
        const suggestion = makeDisplayLink(normalizedCandidates[0]);
        for (const entry of liveEntries) {
            categories.normalizedMatch.push({ ...entry, suggestion });
        }
        continue;
    }

    const fuzzyCandidates = resolveFuzzyCandidates(target).slice(0, 3);
    if (fuzzyCandidates.length > 0) {
        const suggestion = fuzzyCandidates.map(makeDisplayLink).join(' / ');
        for (const entry of liveEntries) {
            categories.fuzzyCandidate.push({ ...entry, suggestion });
        }
        continue;
    }

    if (isAssetLikeTarget(target)) {
        categories.pathErrorAsset.push(...liveEntries);
        categories.pathError.push(...liveEntries);
    } else if (looksLikeVaultPath(target)) {
        categories.pathErrorNote.push(...liveEntries);
        categories.pathError.push(...liveEntries);
    } else {
        categories.redlink.push(...liveEntries);
    }
}

console.log(`Valid: ${categories.valid.length}`);
console.log(`Path-prefix resolved: ${categories.pathPrefixResolved.length}`);
console.log(`Skipped placeholder: ${categories.skippedPlaceholder.length}`);
console.log(`Index placeholder: ${categories.indexPlaceholder.length}`);
console.log(`Low-signal source noise: ${categories.sourceNoise.length}`);
console.log(`Normalized match: ${categories.normalizedMatch.length}`);
console.log(`Fuzzy candidate: ${categories.fuzzyCandidate.length}`);
console.log(`Path error (asset): ${categories.pathErrorAsset.length}`);
console.log(`Path error (note): ${categories.pathErrorNote.length}`);
console.log(`Path error (total): ${categories.pathError.length}`);
console.log(`Redlink (broken): ${categories.redlink.length}`);

// === Step 4: Output report ===
const now = new Date().toISOString().split('T')[0];
const reportPath = `09-审计报告/${now}-断链检测.md`;

function renderTable(title, entries, options = {}) {
    const { includeSuggestion = false, limit = 50, note = '' } = options;
    let section = `## ${title}（${entries.length} 处）\n\n`;
    if (note) section += `${note}\n\n`;

    const aggregated = aggregate(entries);
    if (aggregated.length === 0) {
        section += `- 无\n\n---\n\n`;
        return section;
    }

    section += includeSuggestion
        ? `| 目标 | 次数 | 建议目标 | 示例文件 |\n|:---|---:|:---|:---|\n`
        : `| 目标 | 次数 | 示例文件 |\n|:---|---:|:---|\n`;

    for (const [target, stat] of aggregated.slice(0, limit)) {
        if (includeSuggestion) {
            const suggestion = stat.examples[0] || '-';
            section += `| \`${target}\` | ${stat.count} | ${suggestion} | ${stat.files.join(', ')} |\n`;
        } else {
            section += `| \`${target}\` | ${stat.count} | ${stat.files.join(', ')} |\n`;
        }
    }

    section += `\n---\n\n`;
    return section;
}

let report = `---\ntitle: 断链检测-${now}\ntype: 审计\nupdated: ${now}\ntags: [审计, 断链]\n---\n\n# 断链检测 · ${now}\n\n`;
report += `> 新口径：本报告优先回答“哪些是真问题、哪些只是命名差异或模板噪声”。\n\n`;
report += `| 类别 | 数量 |\n|:---|---:|\n`;
report += `| 正常链接（精确命中） | ${categories.valid.length} |\n`;
report += `| 路径提示可解析（路径写法不准，但目标已存在） | ${categories.pathPrefixResolved.length} |\n`;
report += `| 模板/示例占位（跳过） | ${categories.skippedPlaceholder.length} |\n`;
report += `| 索引占位（知识点/题库总索引） | ${categories.indexPlaceholder.length} |\n`;
report += `| 历史报告/模板噪声（单独归档） | ${categories.sourceNoise.length} |\n`;
report += `| 命名差异候选（唯一已有目标） | ${categories.normalizedMatch.length} |\n`;
report += `| 疑似已有内容（需人工确认） | ${categories.fuzzyCandidate.length} |\n`;
report += `| 资产路径错误（图片 / 附件 / .base 等） | ${categories.pathErrorAsset.length} |\n`;
report += `| 笔记路径错误（含斜杠的 note 链接） | ${categories.pathErrorNote.length} |\n`;
report += `| **真断链（剩余未命中）** | **${categories.redlink.length}** |\n\n`;
report += `---\n\n`;

report += renderTable(
    '🟡 路径提示可解析',
    categories.pathPrefixResolved,
    {
        includeSuggestion: true,
        note: '> 这些链接路径写法不准，但 basename / title / alias 已能唯一或有限命中目标，优先级低于真断链。',
    }
);

report += renderTable(
    '🟡 命名差异候选',
    categories.normalizedMatch,
    {
        includeSuggestion: true,
        note: '> 这些目标大概率已在库中存在，只是命名不同（如前缀差异、空格差异、alias 命中、多行 alias 命中）。',
        limit: 80,
    }
);

report += renderTable(
    '🟠 疑似已有内容',
    categories.fuzzyCandidate,
    {
        includeSuggestion: true,
        note: '> 这些目标未能唯一命中，但存在 1-3 个强相关候选，适合后续做人工确认或批量规范化。',
        limit: 80,
    }
);

report += renderTable(
    '⚪ 历史报告/模板噪声',
    categories.sourceNoise,
    {
        note: '> 这些未命中链接只出现在旧审计、模板或技能草稿中，会干扰当前待办，因此单独归档，不计入“真断链”。',
        limit: 60,
    }
);

report += renderTable(
    '🔴 资产路径错误',
    categories.pathErrorAsset,
    {
        note: '> 这些目标看起来是图片、附件、PDF、`.base`、`mineru` 资产等路径，最适合单独做资源层清理。',
        limit: 80,
    }
);

report += renderTable(
    '🔴 笔记路径错误',
    categories.pathErrorNote,
    {
        note: '> 这些目标是带斜杠的笔记链接，但没有命中现有文件、alias、title 或规范化候选，优先检查路径写法或目录迁移遗留问题。',
        limit: 50,
    }
);

report += renderTable(
    '🔴 真断链',
    categories.redlink,
    {
        note: '> 这些链接既不是模板占位，也没命中现有文件、alias、title 或规范化候选，优先处理它们。',
        limit: 100,
    }
);

report += `## 🟢 模板/示例占位（${categories.skippedPlaceholder.length} 处）\n\n`;
report += `> 这些链接被识别为模板示例、占位符或非正式目标，不纳入真断链统计。\n\n`;
const skippedStats = aggregate(categories.skippedPlaceholder);
for (const [target, stat] of skippedStats.slice(0, 30)) {
    report += `- \`${target}\` (${stat.count} 次)\n`;
}
report += `\n---\n\n`;

report += `## 🟢 索引占位（${categories.indexPlaceholder.length} 处）\n\n`;
report += `> 这些链接位于 \`知识点总索引.md\` 或 \`题库总索引.md\` 中，作为待建清单天然允许为红链。\n\n`;
const indexStats = aggregate(categories.indexPlaceholder);
for (const [target, stat] of indexStats.slice(0, 30)) {
    report += `- \`${target}\` (${stat.count} 次)\n`;
}

fs.writeFileSync(reportPath, report, 'utf8');
console.log(`Report written: ${reportPath}`);
