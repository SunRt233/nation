const fs = require('fs');
const path = require('path');

const dirs = [
  '04-题库/真题/第37届决赛/理论/第一场',
  '04-题库/真题/第37届决赛/理论/第二场'
];

const patterns = [
  { regex: /<details>\s*<summary>natural_image<\/summary>[\s\S]*?<\/details>/g, desc: 'natural_image' },
  { regex: /<details>\s*<summary>chemical<\/summary>[\s\S]*?<\/details>/g, desc: 'chemical' },
  { regex: /<details>\s*<summary>text_image<\/summary>[\s\S]*?<\/details>/g, desc: 'text_image' },
  { regex: /<details>\s*<summary>flowchart<\/summary>[\s\S]*?<\/details>/g, desc: 'flowchart' },
  { regex: /<details>\s*<summary>line<\/summary>[\s\S]*?<\/details>/g, desc: 'line' }
];

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const filepath = path.join(dir, file);
    let content = fs.readFileSync(filepath, 'utf-8');
    let changed = false;

    for (const pat of patterns) {
      if (pat.regex.test(content)) {
        content = content.replace(pat.regex, '');
        changed = true;
        console.log(`Removed ${pat.desc} from ${filepath}`);
      }
      // Reset regex lastIndex for next test
      pat.regex.lastIndex = 0;
    }

    if (changed) {
      content = content.replace(/\n{3,}/g, '\n\n');
      fs.writeFileSync(filepath, content, 'utf-8');
    }
  }
}

console.log('Cleanup done!');
