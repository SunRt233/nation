import re

with open('mineru02/2024年第38届化学竞赛决赛试题及解析.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into questions and answers sections
parts = content.split('# 第38届中国化学奥林匹克(决赛)第二场参考答案')
questions_section = parts[0]
answers_section = '# 第38届中国化学奥林匹克(决赛)第二场参考答案' + parts[1] if len(parts) > 1 else ''

# Find all question boundaries in questions section
q_starts = [(m.start(), m.group(0)) for m in re.finditer(r'# 第\s*\d+\s*题[\s(]', questions_section)]
print('Questions found:', len(q_starts))
for s, t in q_starts:
    print(repr(t))

# Find all answer boundaries in answers section
a_starts = [(m.start(), m.group(0)) for m in re.finditer(r'# 第\s*\d+\s*题[\s(]', answers_section)]
print('Answers found:', len(a_starts))
for s, t in a_starts:
    print(repr(t))
