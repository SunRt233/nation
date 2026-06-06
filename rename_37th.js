const fs = require('fs');
const path = require('path');

const sessions = [
  { dir: '04-题库/真题/第37届决赛/理论/第一场', sessionNum: 1 },
  { dir: '04-题库/真题/第37届决赛/理论/第二场', sessionNum: 2 }
];

for (const { dir, sessionNum } of sessions) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const oldPath = path.join(dir, file);
    const content = fs.readFileSync(oldPath, 'utf-8');

    // Extract question number from filename: 题-37决理-{num}-{title}.md
    const match = file.match(/^题-37决理-(\d+)-(.+)\.md$/);
    if (!match) continue;

    const qNum = match[1];
    const qTitle = match[2];

    const newFilename = `题-37决理-${sessionNum}-${qNum}-${qTitle}.md`;
    const newPath = path.join(dir, newFilename);

    // Update frontmatter title
    const newContent = content.replace(
      /^title: 题-37决理-\d+-.+$/m,
      `title: 题-37决理-${sessionNum}-${qNum}-${qTitle}`
    );

    fs.writeFileSync(newPath, newContent, 'utf-8');
    fs.unlinkSync(oldPath);
    console.log(`Renamed: ${file} -> ${newFilename}`);
  }
}

console.log('Done!');
