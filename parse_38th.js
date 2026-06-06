const fs = require('fs');

const content = fs.readFileSync('mineru02/2024年第38届化学竞赛决赛试题及解析.md', 'utf-8');

// Split into questions and answers sections
const splitMarker = '# 第38届中国化学奥林匹克(决赛)第二场参考答案';
const splitIdx = content.indexOf(splitMarker);

const questionsSection = content.slice(0, splitIdx);
const answersSection = content.slice(splitIdx);

function findSections(sectionText, isAnswers = false) {
    const results = [];
    const foundStarts = new Set();

    // Pattern 1: # 第 N 题 (X 分) 标题
    let regex = /# 第\s*(\d+)\s*题\s*\((\d+)\s*分\)\s*(.+?)(?=\n|$)/g;
    let match;
    while ((match = regex.exec(sectionText)) !== null) {
        if (!foundStarts.has(match.index)) {
            foundStarts.add(match.index);
            results.push({
                num: parseInt(match[1]),
                score: parseInt(match[2]),
                title: match[3].trim(),
                start: match.index,
                end: match.index + match[0].length
            });
        }
    }

    // Pattern 2: # 第 N 题 标题 (X 分)
    regex = /# 第\s*(\d+)\s*题\s+(.+?)\s*\((\d+)\s*分\)(?=\n|$)/g;
    while ((match = regex.exec(sectionText)) !== null) {
        if (!foundStarts.has(match.index)) {
            foundStarts.add(match.index);
            results.push({
                num: parseInt(match[1]),
                score: parseInt(match[3]),
                title: match[2].trim(),
                start: match.index,
                end: match.index + match[0].length
            });
        }
    }

    if (isAnswers) {
        // Pattern 3: 第 N 题 (X 分) 标题  without #
        regex = /^(?![ \t]*#)[ \t]*第\s*(\d+)\s*题\s*\((\d+)\s*分\)\s*(.+?)(?=\n|$)/gm;
        while ((match = regex.exec(sectionText)) !== null) {
            if (!foundStarts.has(match.index)) {
                foundStarts.add(match.index);
                results.push({
                    num: parseInt(match[1]),
                    score: parseInt(match[2]),
                    title: match[3].trim(),
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }

        // Pattern 4: 第N题 标题 (X分) without #
        regex = /^(?![ \t]*#)[ \t]*第\s*(\d+)\s*题\s+(.+?)\s*\((\d+)\s*分\)(?=\n|$)/gm;
        while ((match = regex.exec(sectionText)) !== null) {
            if (!foundStarts.has(match.index)) {
                foundStarts.add(match.index);
                results.push({
                    num: parseInt(match[1]),
                    score: parseInt(match[3]),
                    title: match[2].trim(),
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }
    }

    results.sort((a, b) => a.num - b.num);

    // Extract content between sections
    for (let i = 0; i < results.length; i++) {
        if (i < results.length - 1) {
            results[i].content = sectionText.slice(results[i].end, results[i+1].start).trim();
        } else {
            results[i].content = sectionText.slice(results[i].end).trim();
        }
    }

    return results;
}

const questions = findSections(questionsSection, false);
const answers = findSections(answersSection, true);

console.log(`Found ${questions.length} questions and ${answers.length} answers`);
for (const q of questions) {
    console.log(`Q${q.num}: ${q.title} (${q.score}分)`);
}
for (const a of answers) {
    console.log(`A${a.num}: ${a.title} (${a.score}分)`);
}

// Save parsed data
const data = { questions, answers };
fs.writeFileSync('parse_38th.json', JSON.stringify(data, null, 2));
console.log('Saved to parse_38th.json');
