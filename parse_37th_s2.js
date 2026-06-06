const fs = require('fs');

const qFile = 'mineru02/第37届中国化学奥林匹克（决赛第二场）试题.md';
const aFile = 'mineru02/第37届中国化学奥林匹克竞赛决赛第二场试题和解析.md';

const qContent = fs.readFileSync(qFile, 'utf-8');
const aContent = fs.readFileSync(aFile, 'utf-8');

function parseSections(text, isAnswers) {
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  let buffer = [];

  const patterns = isAnswers ? [
    { regex: /^#\s*第\s*(\d+)\s*题\s*\((\d+)\s*分[,，]\s*.*\)\s*(.+?)\s*$/, scoreGroup: 2, titleGroup: 3 },
    { regex: /^#\s*第\s*(\d+)\s*题\s*\(?(\d+)\s*分\)?\s*(.*?)\s*$/, scoreGroup: 2, titleGroup: 3 },
    { regex: /^第\s*(\d+)\s*题\s*\((\d+)\s*分[,，]\s*.*\)\s*(.+?)\s*$/, scoreGroup: 2, titleGroup: 3 },
    { regex: /^第\s*(\d+)\s*期(.+?)(\d+)\s*分/, scoreGroup: 3, titleGroup: 2, numGroup: 1 },  // OCR: 第4期...
    { regex: /^第\s*(\d+)\s*题\s*(.+?)(\d+)\s*分/, scoreGroup: 3, titleGroup: 2 },
    { regex: /^#\s*第\s*(\d+)\s*题\s*(.+?)$/, scoreGroup: -1, titleGroup: 2 }
  ] : [
    { regex: /^#\s*第\s*(\d+)\s*题\s+(.+?)\s*\((\d+)%\)\s*$/, scoreGroup: 3, titleGroup: 2 },
    { regex: /^#\s*第\s*(\d+)\s*题(.+?)\s*\((\d+)%\)\s*$/, scoreGroup: 3, titleGroup: 2 },
    { regex: /^第\s*(\d+)\s*题\s*(.+?)\s*\((\d+)%\)\s*$/, scoreGroup: 3, titleGroup: 2 }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;

    for (const pat of patterns) {
      const m = line.match(pat.regex);
      if (m) {
        if (current) {
          current.content = buffer.join('\n').trim();
          sections.push(current);
        }
        current = {
          num: parseInt(m[1]),
          title: pat.titleGroup > 0 ? m[pat.titleGroup].trim() : '',
          score: pat.scoreGroup > 0 ? parseInt(m[pat.scoreGroup]) : 0,
          startLine: i
        };
        buffer = [];
        matched = true;
        break;
      }
    }

    if (!matched && current) {
      buffer.push(line);
    }
  }

  if (current) {
    current.content = buffer.join('\n').trim();
    sections.push(current);
  }

  return sections;
}

const questions = parseSections(qContent, false);
const answers = parseSections(aContent, true);

console.log('Questions found:', questions.length);
for (const q of questions) {
  console.log(`Q${q.num}: "${q.title}" (${q.score}%) line ${q.startLine}`);
}

console.log('\nAnswers found:', answers.length);
for (const a of answers) {
  console.log(`A${a.num}: "${a.title}" (${a.score}分) line ${a.startLine}`);
}

// Save
fs.writeFileSync('parse_37th_s2.json', JSON.stringify({ questions, answers }, null, 2));
console.log('\nSaved to parse_37th_s2.json');
