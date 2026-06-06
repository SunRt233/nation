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

const NEW_FIELDS = {
    parent_overview: '中国化学奥林匹克基本要求-总览',
    parent_module: '基础要求-有机化学',
    syllabus_module: ['有机化学'],
    problem_types: [],
    difficulty: null,
    importance: null,
    sources: [],
    source_type: [],
    review_cycle: '30d',
    has_images: false,
    image_count: 0,
    images_priority: 'low',
    images_note: '""',
    teaching_ready: false,
    source_notes: [],
    key_images: [],
};

const STANDARD_SECTIONS = [
    '一、定义',
    '二、考纲对应',
    '三、核心原理',
    '四、关键结论',
    '五、常见分类或情形',
    '六、适用条件与限制',
    '七、常见比较与易混点',
    '八、与其他知识点的联系',
    '九、典型题型',
    '十、例题',
    '十一、易错点',
    '十二、教学视角',
    '十三、竞赛拓展',
    '十四、外部资料出处',
    '十五、待完善项',
];

const SECTION_RENAMES = {
    '一、总览': '一、定义',
    '二、核心概念': '三、核心原理',
    '二、核心原理': '三、核心原理',
    '二、核心概念/原理': '三、核心原理',
};

function parseFrontmatter(text) {
    if (!text.startsWith('---')) {
        return { fields: {}, body: text };
    }
    const endIdx = text.indexOf('\n---', 3);
    if (endIdx === -1) {
        return { fields: {}, body: text };
    }
    const fmText = text.substring(3, endIdx).trim();
    const body = text.substring(endIdx + 4).trimStart();

    const fields = {};
    const lines = fmText.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const m = line.match(/^(\w+):\s*(.*)$/);
        if (m) {
            const key = m[1];
            const val = m[2].trim();
            if (!val && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
                // List
                const items = [];
                let j = i + 1;
                while (j < lines.length && lines[j].trim().startsWith('-')) {
                    items.push(lines[j].trim().substring(1).trim());
                    j++;
                }
                fields[key] = items;
                i = j - 1;
            } else if (val.startsWith('[') && val.endsWith(']')) {
                const inner = val.substring(1, val.length - 1);
                const items = inner.split(',').map(x => x.trim()).filter(x => x).map(x => x.replace(/^["\']|["\']$/g, ''));
                fields[key] = items;
            } else if (val.startsWith('"') && val.endsWith('"')) {
                fields[key] = val.substring(1, val.length - 1);
            } else if (val.startsWith("'") && val.endsWith("'")) {
                fields[key] = val.substring(1, val.length - 1);
            } else if (val.toLowerCase() === 'true') {
                fields[key] = true;
            } else if (val.toLowerCase() === 'false') {
                fields[key] = false;
            } else if (val === '') {
                fields[key] = '';
            } else {
                const intVal = parseInt(val);
                if (!isNaN(intVal) && String(intVal) === val) {
                    fields[key] = intVal;
                } else {
                    fields[key] = val;
                }
            }
        }
        i++;
    }
    return { fields, body };
}

function formatField(key, val) {
    if (val === null || val === undefined) {
        return `${key}:`;
    }
    if (Array.isArray(val)) {
        if (val.length === 0) {
            return `${key}: []`;
        }
        return `${key}:\n` + val.map(item => `  - ${item}`).join('\n');
    }
    if (typeof val === 'boolean') {
        return `${key}: ${val}`;
    }
    if (typeof val === 'number') {
        return `${key}: ${val}`;
    }
    const str = String(val).trim();
    if (str === '') {
        return `${key}: ""`;
    }
    if (str.startsWith('[') && str.endsWith(']')) {
        return `${key}: ${str}`;
    }
    if (str.startsWith('"') && str.endsWith('"')) {
        return `${key}: ${str}`;
    }
    if (str.startsWith("'") && str.endsWith("'")) {
        return `${key}: ${str}`;
    }
    if (str.includes(':') || str.includes('#') || ['true', 'false', 'yes', 'no', 'null', '~'].includes(str.toLowerCase())) {
        return `${key}: "${str}"`;
    }
    return `${key}: ${str}`;
}

function buildFrontmatter(fields) {
    const order = [
        'title', 'aliases', 'type', 'template_version', 'subject', 'module', 'submodule',
        'syllabus_stage', 'syllabus_code', 'syllabus_codes',
        'parent_overview', 'parent_module', 'syllabus_module',
        'tags', 'related', 'prerequisite',
        'problem_types', 'difficulty', 'importance',
        'status', 'sources', 'source_type', 'review_cycle',
        'has_images', 'image_count', 'images_priority', 'images_note',
        'teaching_ready', 'source_notes', 'key_images',
        'updated', 'redlink_freq',
    ];

    const lines = ['---'];
    const used = new Set();

    for (const key of order) {
        if (key in fields && fields[key] !== null && fields[key] !== undefined) {
            lines.push(formatField(key, fields[key]));
            used.add(key);
        }
    }

    for (const [key, val] of Object.entries(fields)) {
        if (!used.has(key) && val !== null && val !== undefined) {
            lines.push(formatField(key, val));
        }
    }

    lines.push('---');
    return lines.join('\n');
}

function upgradeFrontmatter(fields) {
    fields.template_version = 'v1.3';
    fields.updated = '2026-05-25';

    for (const [key, defaultVal] of Object.entries(NEW_FIELDS)) {
        if (!(key in fields) || fields[key] === null || fields[key] === undefined || fields[key] === '') {
            fields[key] = defaultVal;
        }
    }

    if (!('key_images' in fields)) {
        fields.key_images = [];
    }

    // Rename syllabus_codes to syllabus_code if needed
    if ('syllabus_codes' in fields && !('syllabus_code' in fields)) {
        fields.syllabus_code = fields.syllabus_codes;
    }

    return fields;
}

function processSections(body) {
    const lines = body.split('\n');

    // Find all section headers
    const sections = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^(#{2,3})\s+(.+)$/);
        if (m) {
            sections.push({ start: i, level: m[1].length, name: m[2].trim() });
        }
    }

    // Build section content map
    const sectionContents = {};
    for (let idx = 0; idx < sections.length; idx++) {
        const start = sections[idx].start;
        const end = idx + 1 < sections.length ? sections[idx + 1].start : lines.length;
        sectionContents[sections[idx].name] = lines.slice(start, end);
    }

    // Rename sections
    const renamedContents = {};
    for (const [name, content] of Object.entries(sectionContents)) {
        let newName = name;
        for (const [old, neu] of Object.entries(SECTION_RENAMES)) {
            if (name.includes(old)) {
                newName = neu;
                if (content.length > 0) {
                    content[0] = content[0].replace(old, neu);
                }
                break;
            }
        }
        renamedContents[newName] = content;
    }

    const hasKaogang = Object.keys(renamedContents).some(n => n.includes('考纲对应'));

    // Build output
    const outputLines = [];
    const processed = new Set();

    for (const stdName of STANDARD_SECTIONS) {
        if (stdName in renamedContents) {
            outputLines.push(...renamedContents[stdName]);
            processed.add(stdName);
        } else if (stdName === '二、考纲对应' && !hasKaogang) {
            outputLines.push(`## ${stdName}`);
            outputLines.push('- [待补充]');
            outputLines.push('');
        } else {
            let found = false;
            for (const name of Object.keys(renamedContents)) {
                if (!processed.has(name)) {
                    const stdClean = stdName.replace(/[、]/g, '');
                    const nameClean = name.replace(/[、]/g, '');
                    if (nameClean.includes(stdClean) || stdClean.includes(nameClean)) {
                        outputLines.push(...renamedContents[name]);
                        processed.add(name);
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                outputLines.push(`## ${stdName}`);
                outputLines.push('- [待补充]');
                outputLines.push('');
            }
        }
    }

    // Add any remaining sections
    for (const [name, content] of Object.entries(renamedContents)) {
        if (!processed.has(name)) {
            outputLines.push(...content);
        }
    }

    return outputLines.join('\n');
}

function processFile(relPath) {
    const filepath = path.join(BASE_DIR, relPath);
    const text = fs.readFileSync(filepath, 'utf-8');

    const { fields, body } = parseFrontmatter(text);
    const upgradedFields = upgradeFrontmatter(fields);
    const newFm = buildFrontmatter(upgradedFields);
    const newBody = processSections(body);

    const newText = newFm + '\n\n' + newBody;
    fs.writeFileSync(filepath, newText, 'utf-8');
    return true;
}

const success = [];
const failed = [];

for (const relPath of FILES) {
    try {
        processFile(relPath);
        success.push(relPath);
        console.log(`OK: ${relPath}`);
    } catch (e) {
        failed.push({ path: relPath, error: e.message });
        console.log(`FAIL: ${relPath} - ${e.message}`);
    }
}

console.log(`\nSuccess: ${success.length}/${FILES.length}`);
if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
    for (const f of failed) {
        console.log(`  ${f.path}: ${f.error}`);
    }
}
