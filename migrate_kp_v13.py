#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Migrate KP files from v1.1 to v1.3 template.
Only first layer: frontmatter + paragraph framework, no content filling.
"""

import os
import re
from datetime import datetime

BASE_DIR = r"C:\Obsidion\妙妙屋\03-知识点\决赛要求\结构与配位深化"

FILES = [
    "Bohr模型计算.md",
    "d轨道分裂.md",
    "Jahn-Teller效应.md",
    "VSEPR理论深化.md",
    "电子排布与周期性.md",
    "多电子原子能级.md",
    "分子轨道理论深化.md",
    "分子结构补充.md",
    "分子结构深化.md",
    "晶体场分裂与磁性.md",
    "晶体结构深化.md",
    "离域与分子稳定性.md",
    "配合物稳定性.md",
    "配体类型与电子给受性质.md",
    "配位平衡.md",
    "屏蔽效应.md",
    "箱中粒子模型.md",
    "休克尔方法.md",
    "异构与结构表征.md",
    "原子光谱与光谱项.md",
    "原子轨道与波函数.md",
    "原子结构补充.md",
    "原子结构深化.md",
    "杂化轨道理论深化.md",
    "钻穿效应.md",
]

# Standard 15 section titles
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

# Mapping from old section patterns to standard sections
SECTION_PATTERNS = {
    r"^##\s*一、": "## 一、定义",
    r"^##\s*二、": "## 二、考纲对应",
    r"^##\s*三、": "## 三、核心原理",
    r"^##\s*四、": "## 四、关键结论",
    r"^##\s*五、": "## 五、常见分类或情形",
    r"^##\s*六、": "## 六、适用条件与限制",
    r"^##\s*七、": "## 七、常见比较与易混点",
    r"^##\s*八、": "## 八、与其他知识点的联系",
    r"^##\s*九、": "## 九、典型题型",
    r"^##\s*十、": "## 十、例题",
    r"^##\s*十一、": "## 十一、易错点",
    r"^##\s*十二、": "## 十二、🎯 教学视角",
    r"^##\s*十三、": "## 十三、竞赛拓展",
    r"^##\s*十四、": "## 十四、外部资料出处",
    r"^##\s*十五、": "## 十五、待完善项",
}


def parse_frontmatter(content):
    """Extract frontmatter dict and body from markdown content."""
    if not content.startswith("---"):
        return None, content

    end_idx = content.find("\n---", 3)
    if end_idx == -1:
        return None, content

    fm_text = content[3:end_idx].strip()
    body = content[end_idx + 4:].lstrip("\n")

    fm = {}
    for line in fm_text.split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip()
            fm[key] = val

    return fm, body


def fm_value(fm, key, default):
    """Get frontmatter value with default."""
    val = fm.get(key, "")
    if val == "" or val == "[]":
        return default
    return val


def build_frontmatter(fm):
    """Build v1.3 frontmatter from existing values."""
    # Remove syllabus_codes (plural) if exists
    if "syllabus_codes" in fm:
        del fm["syllabus_codes"]

    # Ensure syllabus_code exists
    syllabus_code = fm.get("syllabus_code", "[]")
    if syllabus_code == "":
        syllabus_code = "[]"

    # Determine subject/module/submodule
    subject = fm_value(fm, "subject", "无机和结构化学")
    module = fm_value(fm, "module", "决赛要求")
    submodule = fm_value(fm, "submodule", "结构与配位深化")

    # parent_module: if subject=决赛要求 or module=决赛要求, use submodule
    parent_module = fm.get("parent_module", "")
    if parent_module == "" or "决赛要求" in parent_module:
        parent_module = f"决赛要求-{submodule}"

    # Default values for missing fields
    difficulty = fm_value(fm, "difficulty", "4")
    importance = fm_value(fm, "importance", "4")
    if difficulty == "":
        difficulty = "4"
    if importance == "":
        importance = "4"

    sources = fm_value(fm, "sources", "[]")
    source_type = fm_value(fm, "source_type", "[]")
    source_notes = fm_value(fm, "source_notes", "[]")
    key_images = fm_value(fm, "key_images", "[]")

    # images_priority logic
    images_priority = fm.get("images_priority", "")
    if images_priority == "":
        images_priority = "low"

    images_note = fm.get("images_note", "")
    if images_note == "":
        images_note = ""

    has_images = fm.get("has_images", "false")
    if has_images == "":
        has_images = "false"

    image_count = fm.get("image_count", "0")
    if image_count == "":
        image_count = "0"

    review_cycle = fm.get("review_cycle", "30d")
    if review_cycle == "":
        review_cycle = "30d"

    teaching_ready = fm.get("teaching_ready", "false")
    if teaching_ready == "":
        teaching_ready = "false"

    status = fm.get("status", "已填充")
    if status == "":
        status = "已填充"

    updated = datetime.now().strftime("%Y-%m-%d")

    # Build new frontmatter
    new_fm = f"""---
title: {fm.get('title', '')}
aliases: {fm.get('aliases', '[]')}
type: {fm.get('type', '知识点')}
template_version: v1.3
subject: {subject}
module: {module}
submodule: {submodule}
syllabus_stage: {fm.get('syllabus_stage', '决赛')}
parent_overview: {fm.get('parent_overview', '中国化学奥林匹克基本要求-总览')}
parent_module: {parent_module}
syllabus_code: {syllabus_code}
syllabus_module: {fm.get('syllabus_module', '[结构与配位深化]')}
tags: {fm.get('tags', '[]')}
related: {fm.get('related', '[]')}
prerequisite: {fm.get('prerequisite', '[]')}
problem_types: {fm.get('problem_types', '[]')}
difficulty: {difficulty}
importance: {importance}
status: {status}
sources: {sources}
source_type: {source_type}
source_notes: {source_notes}
review_cycle: {review_cycle}
has_images: {has_images}
image_count: {image_count}
images_priority: {images_priority}
images_note: "{images_note}"
teaching_ready: {teaching_ready}
key_images: {key_images}
updated: {updated}
---"""

    return new_fm


def normalize_section_headers(body):
    """Normalize existing section headers to standard v1.3 format."""
    lines = body.split("\n")
    new_lines = []
    seen_sections = set()

    for line in lines:
        matched = False
        for pattern, standard in SECTION_PATTERNS.items():
            if re.match(pattern, line.strip()):
                # Check if it's already the standard form
                section_key = standard.split("、")[0]
                seen_sections.add(section_key)
                # Replace with standard header
                new_lines.append(standard)
                matched = True
                break
        if not matched:
            new_lines.append(line)

    return "\n".join(new_lines), seen_sections


def ensure_sections(body, seen_sections):
    """Ensure all 15 standard sections exist. Add missing empty ones at the end."""
    lines = body.rstrip().split("\n")

    # Find the last existing section
    last_section_idx = -1
    for i, line in enumerate(lines):
        if re.match(r"^##\s*[一二三四五六七八九十]+、", line.strip()):
            last_section_idx = i

    # If no sections found, just append all missing sections
    if last_section_idx == -1:
        additions = []
        for sec in STANDARD_SECTIONS:
            sec_key = sec.split("、")[0]
            if sec_key not in seen_sections:
                additions.append(sec)
                additions.append("")
                additions.append("- [待填充]")
                additions.append("")
        return body.rstrip() + "\n\n" + "\n".join(additions) if additions else body

    # Insert missing sections before any trailing dataview blocks or revision records
    # But for simplicity, append at end
    additions = []
    for sec in STANDARD_SECTIONS:
        sec_key = sec.split("、")[0]
        if sec_key not in seen_sections:
            additions.append(sec)
            additions.append("")
            additions.append("- [待填充]")
            additions.append("")

    if additions:
        # Remove trailing blank lines
        while lines and lines[-1].strip() == "":
            lines.pop()
        body = "\n".join(lines) + "\n\n" + "\n".join(additions)

    return body


def process_file(filename):
    """Process a single KP file."""
    filepath = os.path.join(BASE_DIR, filename)

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return False, f"Read error: {e}"

    fm, body = parse_frontmatter(content)
    if fm is None:
        return False, "No frontmatter found"

    # Build new frontmatter
    new_fm = build_frontmatter(fm)

    # Normalize existing section headers
    body, seen_sections = normalize_section_headers(body)

    # Ensure all 15 sections exist
    body = ensure_sections(body, seen_sections)

    # Write back
    new_content = new_fm + "\n\n" + body

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
    except Exception as e:
        return False, f"Write error: {e}"

    return True, "OK"


def main():
    success_count = 0
    errors = []

    for filename in FILES:
        success, msg = process_file(filename)
        if success:
            success_count += 1
            print(f"[OK] {filename}")
        else:
            errors.append(f"{filename}: {msg}")
            print(f"[ERR] {filename}: {msg}")

    print(f"\n{'='*50}")
    print(f"Total: {len(FILES)}, Success: {success_count}, Failed: {len(errors)}")
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  - {e}")


if __name__ == "__main__":
    main()
