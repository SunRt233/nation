const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '03-知识点');
const TARGET_VALUES = new Set(['7d', '30d', '90d']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function normalizeFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.startsWith('---')) return null;

  const match = original.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  let frontmatter = match[1];
  const body = match[2];
  if (!/^type:\s*知识点$/m.test(frontmatter)) return null;

  let changed = false;
  let action = [];

  frontmatter = frontmatter.replace(/^review_cycle:\s*["'](7d|30d|90d)["']\s*$/m, (_, value) => {
    changed = true;
    action.push('normalized');
    return `review_cycle: ${value}`;
  });

  if (!/^review_cycle:\s*/m.test(frontmatter)) {
    const insertLine = 'review_cycle: 30d';
    if (/^source_type:.*$/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^source_type:.*$/m, (line) => `${line}\n${insertLine}`);
    } else if (/^sources:.*$/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^sources:.*$/m, (line) => `${line}\n${insertLine}`);
    } else if (/^has_images:.*$/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^has_images:.*$/m, `${insertLine}\n$&`);
    } else if (/^updated:.*$/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^updated:.*$/m, `${insertLine}\n$&`);
    } else {
      frontmatter += `\n${insertLine}`;
    }
    changed = true;
    action.push('filled');
  }

  if (!changed) return null;

  const updated = `---\n${frontmatter}\n---\n${body}`;
  fs.writeFileSync(filePath, updated, 'utf8');
  return { filePath, action: action.join('+') };
}

function main() {
  const files = walk(ROOT);
  const changed = [];

  for (const file of files) {
    const result = normalizeFile(file);
    if (result) changed.push(result);
  }

  const summary = changed.reduce((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1;
    return acc;
  }, {});

  console.log(`Files scanned: ${files.length}`);
  console.log(`Files changed: ${changed.length}`);
  console.log(JSON.stringify(summary, null, 2));
  for (const item of changed.slice(0, 80)) {
    console.log(`${item.action}: ${item.filePath}`);
  }
}

main();
