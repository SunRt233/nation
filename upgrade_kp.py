#!/usr/bin/env python3
"""
Upgrade 20 organic chemistry KPs from v1.1 to v1.3.
Rules:
1. Frontmatter: template_version v1.1 -> v1.3, updated -> 2026-05-25, add 16 new fields.
2. Section structure: 一、总览 -> 一、定义; 二、核心概念/原理 -> 三、核心原理 (insert 二、考纲对应); add missing sections 四~十五 as - [待补充]; keep existing content.
3. Preserve all existing field values.
4. Do not invent content.
"""

import os
import re
from pathlib import Path

# New fields to add (with defaults)
NEW_FIELDS = {
    "parent_overview": "中国化学奥林匹克基本要求-总览",
    "parent_module": "基础要求-有机化学",
    "syllabus_module": ["有机化学"],
    "problem_types": [],
    "difficulty": None,
    "importance": None,
    "sources": [],
    "source_type": [],
    "review_cycle": "30d",
    "has_images": False,
    "image_count": 0,
    "images_priority": "low",
    "images_note": '""',
    "teaching_ready": False,
    "source_notes": [],
    "key_images": [],
}

# Standard 15 sections in v1.3
STANDARD_SECTIONS = [
    "一、定义",
    "二、考纲对应",
    "三、核心原理",
    "四、关键结论",
    "五、常见分类或情形",
    "六、适用条件与限制",
    "七、常见比较与易混点",
    "八、与其他知识点的联系",
    "九、典型题型",
    "十、例题",
    "十一、易错点",
    "十二、教学视角",
    "十三、竞赛拓展",
    "十四、外部资料出处",
    "十五、待完善项",
]

# Section mapping for renaming
SECTION_RENAMES = {
    "一、总览": "一、定义",
    "二、核心概念": "三、核心原理",
    "二、核心原理": "三、核心原理",
    "二、核心概念/原理": "三、核心原理",
}

# Files to process
FILES = [
    "03-知识点/有机化学/构象分析.md",
    "03-知识点/有机化学/串联反应.md",
    "03-知识点/有机化学/全合成.md",
    "03-知识点/有机化学/环化反应.md",
    "03-知识点/有机化学/卡宾化学.md",
    "03-知识点/有机化学/Kekulé式.md",
    "03-知识点/有机化学/Zincke反应.md",
    "03-知识点/有机化学/硬软亲核试剂.md",
    "03-知识点/有机化学/铜锂试剂.md",
    "03-知识点/有机化学/场效应.md",
    "03-知识点/有机化学/超分子识别.md",
    "03-知识点/有机化学/ANRORC.md",
    "03-知识点/有机化学/¹H NMR.md",
    "03-知识点/有机化学/离子对机理.md",
    "03-知识点/有机化学/构造异构.md",
    "03-知识点/有机化学/构象异构.md",
    "03-知识点/有机化学/E1反应.md",
    "03-知识点/有机化学/多肽合成.md",
    "03-知识点/有机化学/逆合成分析.md",
    "03-知识点/有机化学/Stille偶联.md",
]

BASE_DIR = Path("C:/Obsidion/妙妙屋")


def parse_frontmatter(text):
    """Parse YAML frontmatter from markdown text."""
    if not text.startswith("---"):
        return None, text

    end_idx = text.find("\n---", 3)
    if end_idx == -1:
        return None, text

    fm_text = text[3:end_idx].strip()
    body = text[end_idx + 4:].lstrip("\n")

    # Parse key-value pairs
    fields = {}
    current_key = None
    current_value_lines = []
    in_list = False
    in_multiline = False

    lines = fm_text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check if this is a new key
        if ":" in stripped and not stripped.startswith("-") and not in_multiline:
            # Save previous field
            if current_key is not None:
                val = "\n".join(current_value_lines).strip()
                fields[current_key] = val

            key, val = stripped.split(":", 1)
            current_key = key.strip()
            val = val.strip()

            if val == "":
                # Check next line for list or multiline
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line.startswith("-"):
                        in_list = True
                        current_value_lines = []
                    elif next_line == "|" or next_line == ">":
                        in_multiline = True
                        current_value_lines = []
                        i += 1  # skip the | or >
                    else:
                        current_value_lines = []
                else:
                    current_value_lines = []
            else:
                current_value_lines = [val]
                if val.startswith("[") and val.endswith("]"):
                    pass  # inline list
                elif val.startswith('"') and val.endswith('"'):
                    pass  # inline string
                elif val.startswith("'") and val.endswith("'"):
                    pass
        elif stripped.startswith("-") and in_list:
            current_value_lines.append(stripped)
        elif in_multiline:
            if stripped == "" or not stripped.startswith("  "):
                # End of multiline
                in_multiline = False
                # Save current field
                if current_key is not None:
                    val = "\n".join(current_value_lines).strip()
                    fields[current_key] = val
                current_key = None
                current_value_lines = []
                i -= 1  # reprocess this line
            else:
                current_value_lines.append(line)
        else:
            if current_key is not None:
                current_value_lines.append(line)

        i += 1

    # Save last field
    if current_key is not None:
        val = "\n".join(current_value_lines).strip()
        fields[current_key] = val

    return fields, body


def build_frontmatter(fields):
    """Build YAML frontmatter string from fields dict, preserving order."""
    # Define desired order
    order = [
        "title", "aliases", "type", "template_version", "subject", "module", "submodule",
        "syllabus_stage", "syllabus_code", "syllabus_codes",
        "parent_overview", "parent_module", "syllabus_module",
        "tags", "related", "prerequisite",
        "problem_types", "difficulty", "importance",
        "status", "sources", "source_type", "review_cycle",
        "has_images", "image_count", "images_priority", "images_note",
        "teaching_ready", "source_notes", "key_images",
        "updated", "redlink_freq",
    ]

    lines = ["---"]
    used = set()

    for key in order:
        if key in fields and fields[key] is not None:
            val = fields[key]
            lines.append(format_field(key, val))
            used.add(key)

    # Add any remaining fields not in order
    for key, val in fields.items():
        if key not in used and val is not None:
            lines.append(format_field(key, val))

    lines.append("---")
    return "\n".join(lines)


def format_field(key, val):
    """Format a single YAML field."""
    if val == "" or val == ' ""' or val == "None":
        return f"{key}:"

    # Check if it's a list
    if isinstance(val, list):
        if len(val) == 0:
            return f"{key}: []"
        items = []
        for item in val:
            items.append(f"  - {item}")
        return f"{key}:\n" + "\n".join(items)

    # Check if it's a multiline string
    val_str = str(val).strip()
    if "\n" in val_str:
        return f"{key}:\n{val_str}"

    # Check if it needs quotes
    if val_str.startswith("[") and val_str.endswith("]"):
        return f"{key}: {val_str}"
    if val_str.startswith('"') and val_str.endswith('"'):
        return f"{key}: {val_str}"
    if val_str.startswith("'") and val_str.endswith("'"):
        return f"{key}: {val_str}"
    if ":" in val_str or "#" in val_str or val_str in ["true", "false", "yes", "no", "null", "~"]:
        if not (val_str.startswith('"') or val_str.startswith("'")):
            return f'{key}: "{val_str}"'

    # Boolean handling
    if val_str.lower() in ["true", "false"]:
        return f"{key}: {val_str.lower()}"

    # Number handling
    try:
        float(val_str)
        return f"{key}: {val_str}"
    except ValueError:
        pass

    return f"{key}: {val_str}"


def parse_frontmatter_v2(text):
    """Simpler frontmatter parser using regex."""
    if not text.startswith("---"):
        return {}, text

    match = re.match(r'^---\n(.*?)\n---\n?(.*)$', text, re.DOTALL)
    if not match:
        return {}, text

    fm_text = match.group(1)
    body = match.group(2)

    fields = {}
    lines = fm_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue

        # Check for key: value or key:
        m = re.match(r'^(\w+):\s*(.*)$', line)
        if m:
            key = m.group(1)
            val = m.group(2).strip()

            # Check if next lines are list items
            if not val and i + 1 < len(lines) and lines[i + 1].strip().startswith('-'):
                list_items = []
                j = i + 1
                while j < len(lines) and lines[j].strip().startswith('-'):
                    item = lines[j].strip()[1:].strip()
                    list_items.append(item)
                    j += 1
                fields[key] = list_items
                i = j - 1
            elif val.startswith('[') and val.endswith(']'):
                # Inline list
                inner = val[1:-1]
                items = [x.strip().strip('"\'') for x in inner.split(',') if x.strip()]
                fields[key] = items
            elif val.startswith('"') and val.endswith('"'):
                fields[key] = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                fields[key] = val[1:-1]
            elif val.lower() == 'true':
                fields[key] = True
            elif val.lower() == 'false':
                fields[key] = False
            elif val == '':
                fields[key] = ''
            else:
                # Try int
                try:
                    fields[key] = int(val)
                except ValueError:
                    try:
                        fields[key] = float(val)
                    except ValueError:
                        fields[key] = val
        i += 1

    return fields, body


def upgrade_frontmatter(fields):
    """Upgrade frontmatter fields from v1.1 to v1.3."""
    # Update version and date
    fields['template_version'] = 'v1.3'
    fields['updated'] = '2026-05-25'

    # Add new fields if not present
    for key, default in NEW_FIELDS.items():
        if key not in fields or fields[key] is None or fields[key] == '':
            fields[key] = default

    # Ensure key_images exists
    if 'key_images' not in fields:
        fields['key_images'] = []

    return fields


def process_sections(body):
    """Process body sections: rename, insert missing, keep content."""
    lines = body.split('\n')

    # Find all section headers
    sections = {}  # section_name -> (start_line, end_line)
    section_list = []

    for i, line in enumerate(lines):
        m = re.match(r'^(#{2,3})\s+(.+)$', line)
        if m:
            level = len(m.group(1))
            name = m.group(2).strip()
            section_list.append((i, level, name))

    # Build section content map
    section_contents = {}
    for idx, (start, level, name) in enumerate(section_list):
        end = section_list[idx + 1][0] if idx + 1 < len(section_list) else len(lines)
        section_contents[name] = lines[start:end]

    # Rename sections
    renamed_contents = {}
    for name, content in section_contents.items():
        new_name = SECTION_RENAMES.get(name, name)
        # Update the header line
        if content:
            header_line = content[0]
            # Replace the name part
            for old, new in SECTION_RENAMES.items():
                if old in header_line:
                    header_line = header_line.replace(old, new)
                    break
            content[0] = header_line
        renamed_contents[new_name] = content

    # Check if we need to insert 二、考纲对应
    has_kaogang = any('考纲对应' in name for name in renamed_contents.keys())
    has_yizong = any('总览' in name for name in renamed_contents.keys())

    # Build output sections in standard order
    output_lines = []
    processed = set()

    for std_name in STANDARD_SECTIONS:
        if std_name in renamed_contents:
            output_lines.extend(renamed_contents[std_name])
            processed.add(std_name)
        elif std_name == "二、考纲对应" and not has_kaogang:
            # Insert empty 考纲对应
            output_lines.append(f"## {std_name}")
            output_lines.append("- [待补充]")
            output_lines.append("")
        elif std_name not in processed:
            # Missing section - add placeholder
            # Check if there's a similar section already
            found = False
            for name in list(renamed_contents.keys()):
                if name not in processed:
                    # Check if this is a match for current standard
                    if std_name.replace("、", "") in name.replace("、", ""):
                        output_lines.extend(renamed_contents[name])
                        processed.add(name)
                        found = True
                        break
            if not found:
                output_lines.append(f"## {std_name}")
                output_lines.append("- [待补充]")
                output_lines.append("")

    # Add any remaining sections not in standard list
    for name, content in renamed_contents.items():
        if name not in processed:
            output_lines.extend(content)

    return '\n'.join(output_lines)


def process_file(filepath):
    """Process a single KP file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Parse frontmatter
    fields, body = parse_frontmatter_v2(text)

    # Upgrade frontmatter
    fields = upgrade_frontmatter(fields)

    # Build new frontmatter
    new_fm = build_frontmatter(fields)

    # Process sections
    new_body = process_sections(body)

    # Combine
    new_text = new_fm + '\n\n' + new_body

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_text)

    return True


def main():
    success = []
    failed = []

    for rel_path in FILES:
        filepath = BASE_DIR / rel_path
        try:
            process_file(filepath)
            success.append(rel_path)
            print(f"OK: {rel_path}")
        except Exception as e:
            failed.append((rel_path, str(e)))
            print(f"FAIL: {rel_path} - {e}")

    print(f"\nSuccess: {len(success)}/{len(FILES)}")
    if failed:
        print(f"Failed: {len(failed)}")
        for p, e in failed:
            print(f"  {p}: {e}")

    return success, failed


if __name__ == "__main__":
    main()
