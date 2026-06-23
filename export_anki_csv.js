const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const KP_ROOT = path.join(ROOT, '03-知识点');
const OUTPUT_DIR = path.join(ROOT, '06-学生侧材料', '闪卡', 'anki-export');
const OUTPUT_CSV = path.join(OUTPUT_DIR, 'anki-kp-cards.csv');
const SAMPLE_CSV = path.join(OUTPUT_DIR, 'anki-kp-cards-sample.csv');

const DECK_MAP = {
  '7d': 'Chem::Weekly',
  '30d': 'Chem::Core',
  '90d': 'Chem::Review',
};

function walkMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { data: {}, body: text };
  }

  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: text };
  }

  const yaml = match[1];
  const body = match[2];
  const data = {};
  let pendingListKey = null;

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, '    ');
    const listItemMatch = line.match(/^\s*-\s+(.*)$/);
    if (listItemMatch && pendingListKey) {
      data[pendingListKey].push(stripQuotes(listItemMatch[1].trim()));
      continue;
    }

    const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyValueMatch) {
      pendingListKey = null;
      continue;
    }

    const key = keyValueMatch[1].trim();
    const rawValue = keyValueMatch[2].trim();

    if (rawValue === '') {
      data[key] = [];
      pendingListKey = key;
      continue;
    }

    pendingListKey = null;
    data[key] = parseScalarOrInlineArray(rawValue);
  }

  return { data, body };
}

function parseScalarOrInlineArray(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => stripQuotes(item.trim())).filter(Boolean);
  }
  return stripQuotes(value);
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function extractSection(body, heading) {
  const escaped = escapeRegExp(heading);
  const regex = new RegExp(`^##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=^##\\s+|\\Z)`, 'm');
  const match = body.match(regex);
  return match ? match[1].trim() : '';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .replace(/\|/g, ' | ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isUsableContent(text) {
  if (!text) return false;
  const normalized = text.replace(/\s+/g, '');
  if (!normalized) return false;
  if (normalized === '[待填充]' || normalized === '待填充') return false;
  if (normalized.includes('[待填充]') || normalized.includes('待填充')) return false;
  return true;
}

function firstNonEmptyParagraph(section) {
  const blocks = section
    .split(/\n\s*\n/)
    .map((block) => cleanMarkdown(block))
    .filter(Boolean);
  return blocks[0] || '';
}

function buildTags(frontmatter, reviewCycle, title) {
  const tags = [];
  const push = (value) => {
    if (!value) return;
    const safe = String(value).trim().replace(/\s+/g, '_');
    if (safe) tags.push(safe);
  };

  push(frontmatter.subject);
  push(frontmatter.module);
  push(frontmatter.submodule);
  push(title);
  push(`rc_${reviewCycle}`);

  if (Array.isArray(frontmatter.tags)) {
    for (const tag of frontmatter.tags.slice(0, 5)) {
      push(tag);
    }
  }

  return Array.from(new Set(tags)).join(' ');
}

function toCsvValue(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function makeCard(base, front, back, noteType, extra = '') {
  return {
    Front: front,
    Back: back,
    Tags: base.tags,
    Deck: base.deck,
    Source: base.source,
    ReviewCycle: base.reviewCycle,
    NoteType: noteType,
    Extra: extra,
  };
}

function buildCardsForFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  if (data.type !== '知识点') return [];

  const reviewCycle = String(data.review_cycle || '').trim();
  if (!DECK_MAP[reviewCycle]) return [];

  const title = String(data.title || path.basename(filePath, '.md')).trim();
  const definition = extractSection(body, '一、定义');
  const keyPoints = extractSection(body, '四、关键结论');
  const pitfalls = extractSection(body, '十一、易错点');

  const base = {
    tags: buildTags(data, reviewCycle, title),
    deck: DECK_MAP[reviewCycle],
    source: `[[${title}]]`,
    reviewCycle,
  };

  const cards = [];
  const definitionText = firstNonEmptyParagraph(definition);
  const keyPointsText = cleanMarkdown(keyPoints);
  const pitfallsText = cleanMarkdown(pitfalls);

  if (isUsableContent(definitionText)) {
    cards.push(
      makeCard(
        base,
        `什么是${title}？`,
        definitionText,
        '概念卡',
        isUsableContent(keyPointsText) ? `关键结论：\n${keyPointsText}` : ''
      )
    );
  }

  if (isUsableContent(keyPointsText)) {
    cards.push(
      makeCard(
        base,
        `${title} 的关键结论有哪些？`,
        keyPointsText,
        '总结卡',
        isUsableContent(definitionText) ? definitionText : ''
      )
    );
  }

  if (isUsableContent(pitfallsText)) {
    cards.push(
      makeCard(
        base,
        `${title} 有哪些常见易错点？`,
        pitfallsText,
        '易错点卡',
        isUsableContent(definitionText) ? definitionText : keyPointsText
      )
    );
  }

  return cards;
}

function writeCsv(filePath, rows) {
  const headers = ['Front', 'Back', 'Tags', 'Deck', 'Source', 'ReviewCycle', 'NoteType', 'Extra'];
  const lines = [headers.map(toCsvValue).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => toCsvValue(row[header])).join(','));
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function main() {
  const files = walkMarkdownFiles(KP_ROOT);
  const cards = files.flatMap(buildCardsForFile);
  writeCsv(OUTPUT_CSV, cards);
  writeCsv(SAMPLE_CSV, cards.slice(0, 30));

  const byDeck = cards.reduce((acc, card) => {
    acc[card.Deck] = (acc[card.Deck] || 0) + 1;
    return acc;
  }, {});

  console.log(`Markdown files scanned: ${files.length}`);
  console.log(`Cards exported: ${cards.length}`);
  console.log(`Full CSV: ${OUTPUT_CSV}`);
  console.log(`Sample CSV: ${SAMPLE_CSV}`);
  console.log(`Deck stats: ${JSON.stringify(byDeck, null, 2)}`);
}

main();
