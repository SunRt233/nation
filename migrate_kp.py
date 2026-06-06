#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KP v1.1 -> v1.3 迁移脚本
处理 frontmatter + 补全15段标准标题
"""

import os
import re
import yaml
from datetime import datetime

# 24个文件列表
FILES = [
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\共轭效应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\共振论.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\光氧化还原催化.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\过碘酸氧化.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\环氧化反应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\卡宾.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\离去基与pKa.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\邻二醇切断.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\膦化合物.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\卤代内酯化反应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\前线轨道理论.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\亲核体与亲电体.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\双羟化反应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\羧酸衍生物.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\碳正离子.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\鎓离子.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\烯烃复分解.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\氧化还原反应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\影响亲核性的因素.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\诱导效应.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\质谱.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\质子转移可行性.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\重氮化合物.md",
    r"C:\Obsidion\妙妙屋\03-知识点\有机化学\重氮盐.md",
]

# v1.3 要求的 frontmatter 字段（按标杆样本顺序）
V13_FIELDS_ORDER = [
    "title", "aliases", "type", "template_version", "subject", "module", "submodule",
    "syllabus_stage", "parent_overview", "parent_module", "syllabus_code",
    "syllabus_module", "tags", "related", "prerequisite", "problem_types",
    "difficulty", "importance", "status", "sources", "source_type",
    "review_cycle", "has_images", "images_priority", "images_note",
    "updated", "source_notes", "key_images", "image_count", "teaching_ready"
]

# 15段标准标题（中文数字）
STANDARD_SECTIONS = [
    "## 一、定义",
    "## 二、考纲对应",
    "## 三、核心原理",
    "## 四、关键结论",
    "## 五、常见分类或情形",
    "## 六、适用条件与限制",
    "## 七、常见比较与易混点",
    "## 八、与其他知识点的联系",
    "## 九、典型题型",
    "## 十、例题",
    "## 十一、易错点",
    "## 十二、🎯 教学视角",
    "## 十三、竞赛拓展",
    "## 十四、外部资料出处",
    "## 十五、待完善项",
]


def parse_frontmatter(text):
    """解析 YAML frontmatter，返回 (frontmatter_dict, rest_of_text)"""
    if not text.startswith("---"):
        return None, text

    # 找到第二个 ---
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not match:
        return None, text

    fm_text = match.group(1)
    rest = text[match.end():]

    try:
        fm = yaml.safe_load(fm_text)
        if fm is None:
            fm = {}
    except Exception as e:
        print(f"  YAML parse error: {e}")
        # 尝试手动解析
        fm = {}
        for line in fm_text.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                if val.startswith('[') and val.endswith(']'):
                    val = eval(val)
                elif val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                fm[key] = val

    return fm, rest


def build_frontmatter(fm):
    """构建 v1.3 标准 frontmatter"""
    # 1. 删除 syllabus_codes（复数），保留 syllabus_code（单数）
    if 'syllabus_codes' in fm:
        del fm['syllabus_codes']

    # 2. 确保 syllabus_code 存在
    if 'syllabus_code' not in fm:
        fm['syllabus_code'] = []

    # 3. 更新 template_version
    fm['template_version'] = 'v1.3'

    # 4. 设置 parent_module
    fm['parent_module'] = '基础要求-有机化学'

    # 5. 确保 parent_overview
    if 'parent_overview' not in fm:
        fm['parent_overview'] = '中国化学奥林匹克基本要求-总览'

    # 6. 设置 review_cycle
    fm['review_cycle'] = '30d'

    # 7. 设置 has_images
    fm['has_images'] = False

    # 8. 设置 images_priority
    fm['images_priority'] = '结构/机理 medium，纯公式 low'

    # 9. 设置 teaching_ready
    fm['teaching_ready'] = False

    # 10. 确保字段存在（若原无则设默认值）
    for field in ['sources', 'source_type', 'source_notes', 'key_images']:
        if field not in fm:
            fm[field] = []

    # 11. difficulty/importance 若原无则 3
    for field in ['difficulty', 'importance']:
        if field not in fm:
            fm[field] = 3

    # 12. 添加缺失字段
    if 'images_note' not in fm:
        fm['images_note'] = ''
    if 'image_count' not in fm:
        fm['image_count'] = 0

    # 13. 更新 updated
    fm['updated'] = '2026-05-25'

    # 构建有序 frontmatter
    lines = ["---"]
    for key in V13_FIELDS_ORDER:
        if key in fm:
            val = fm[key]
            if val is None:
                continue
            if isinstance(val, list):
                if len(val) == 0:
                    lines.append(f"{key}: []")
                else:
                    lines.append(f"{key}:")
                    for item in val:
                        lines.append(f"  - {item}")
            elif isinstance(val, str):
                if val == '':
                    lines.append(f'{key}: ""')
                else:
                    # 检查是否需要引号
                    if any(c in val for c in [':', '#', '[', ']', '{', '}', ',', '&', '*', '?', '|', '-', '<', '>', '=', '!', '%', '@', '`', '"', "'"]):
                        # 转义双引号
                        escaped = val.replace('"', '\\"')
                        lines.append(f'{key}: "{escaped}"')
                    else:
                        lines.append(f"{key}: {val}")
            elif isinstance(val, bool):
                lines.append(f"{key}: {str(val).lower()}")
            elif isinstance(val, int):
                lines.append(f"{key}: {val}")
            else:
                lines.append(f"{key}: {val}")

    lines.append("---")
    return '\n'.join(lines) + '\n'


def find_existing_sections(body):
    """找出正文中已存在的标准段落标题"""
    existing = {}
    for i, section in enumerate(STANDARD_SECTIONS):
        # 匹配标题（允许后面有内容）
        pattern = re.escape(section) + r'(\s|$)'
        if re.search(pattern, body):
            existing[i] = section
    return existing


def insert_missing_sections(body):
    """在正文中插入缺失的标准段落标题"""
    existing = find_existing_sections(body)

    # 如果没有任何标准段落，就不处理（保留原样）
    if not existing:
        return body

    # 找到第一个和最后一个现有段落的位置
    first_idx = min(existing.keys())
    last_idx = max(existing.keys())

    # 获取现有段落的实际位置（用于插入）
    lines = body.split('\n')
    result_lines = []
    section_positions = {}  # idx -> line_number

    for line_num, line in enumerate(lines):
        for idx, section in enumerate(STANDARD_SECTIONS):
            if line.strip().startswith(section):
                section_positions[idx] = line_num

    # 重新构建：遍历每一行，在适当位置插入缺失的段落
    inserted = set()
    result_lines = []

    for line_num, line in enumerate(lines):
        # 检查这一行是否是某个标准段落的开始
        is_section_start = False
        for idx, section in enumerate(STANDARD_SECTIONS):
            if line.strip().startswith(section):
                is_section_start = True
                # 插入之前缺失的段落（如果有）
                # 找到上一个存在的段落和当前段落之间缺失的
                break

        result_lines.append(line)

        # 在当前行之后，检查是否需要插入下一个缺失段落
        for idx, section in enumerate(STANDARD_SECTIONS):
            if idx in section_positions and section_positions[idx] == line_num:
                # 这是当前段落，检查下一个段落是否缺失
                next_idx = idx + 1
                while next_idx < len(STANDARD_SECTIONS) and next_idx not in section_positions:
                    # 下一个段落缺失，在当前段落后插入
                    # 但我们需要等到当前段落内容结束后才插入
                    pass
                    next_idx += 1

    # 更简单的方法：直接在缺失位置插入
    # 找到每个现有段落的结束位置，然后插入下一个缺失段落
    new_lines = list(lines)

    # 从后往前插入，避免位置偏移
    for idx in range(len(STANDARD_SECTIONS) - 1, -1, -1):
        if idx not in section_positions:
            # 找到应该插入的位置（在前一个存在的段落之后）
            insert_after = -1
            for prev_idx in range(idx - 1, -1, -1):
                if prev_idx in section_positions:
                    insert_after = section_positions[prev_idx]
                    break

            if insert_after >= 0:
                # 找到前一个段落的结束位置（下一个标准段落或文件末尾）
                next_section_line = len(new_lines)
                for next_idx in range(idx + 1, len(STANDARD_SECTIONS)):
                    if next_idx in section_positions:
                        next_section_line = section_positions[next_idx]
                        break

                # 插入位置：在前一个段落和下一个段落之间
                # 找到前一个段落的最后一个非空行
                insert_pos = insert_after
                for i in range(insert_after + 1, min(next_section_line, len(new_lines))):
                    if new_lines[i].strip():
                        insert_pos = i

                # 在 insert_pos 后插入新段落
                new_lines.insert(insert_pos + 1, "")
                new_lines.insert(insert_pos + 2, STANDARD_SECTIONS[idx])
                new_lines.insert(insert_pos + 3, "")
                # 更新位置
                section_positions[idx] = insert_pos + 2
                for k in section_positions:
                    if section_positions[k] > insert_pos + 2:
                        section_positions[k] += 3

    return '\n'.join(new_lines)


def process_file(filepath):
    """处理单个文件"""
    print(f"Processing: {os.path.basename(filepath)}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ERROR reading: {e}")
        return False

    # 解析 frontmatter
    fm, body = parse_frontmatter(content)

    if fm is None:
        print(f"  WARNING: No frontmatter found, skipping")
        return False

    # 构建新 frontmatter
    new_fm = build_frontmatter(fm)

    # 处理正文：插入缺失段落
    new_body = insert_missing_sections(body)

    # 组合
    new_content = new_fm + new_body

    # 写入
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  OK")
        return True
    except Exception as e:
        print(f"  ERROR writing: {e}")
        return False


def main():
    success = 0
    failed = 0
    errors = []

    for filepath in FILES:
        if process_file(filepath):
            success += 1
        else:
            failed += 1
            errors.append(os.path.basename(filepath))

    print(f"\n{'='*50}")
    print(f"Total: {len(FILES)}")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    if errors:
        print(f"Errors: {', '.join(errors)}")


if __name__ == '__main__':
    main()
