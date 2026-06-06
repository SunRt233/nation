# Migrate KP files from v1.1 to v1.3 template
# Only first layer: frontmatter + paragraph framework, no content filling.

$BASE_DIR = "C:\Obsidion\妙妙屋\03-知识点\决赛要求\结构与配位深化"

$FILES = @(
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
    "钻穿效应.md"
)

$STANDARD_SECTIONS = @(
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
    "## 十五、待完善项"
)

function Parse-Frontmatter($content) {
    if (-not $content.StartsWith("---")) {
        return $null, $content
    }
    $endIdx = $content.IndexOf("`n---", 3)
    if ($endIdx -eq -1) {
        return $null, $content
    }
    $fmText = $content.Substring(3, $endIdx - 3).Trim()
    $body = $content.Substring($endIdx + 4).TrimStart("`n")

    $fm = @{}
    foreach ($line in $fmText -split "`n") {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
        if ($trimmed -match "^([^:]+):\s*(.*)$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            $fm[$key] = $val
        }
    }
    return $fm, $body
}

function Get-FmValue($fm, $key, $default) {
    $val = $fm[$key]
    if ($val -eq $null -or $val -eq "" -or $val -eq "[]") {
        return $default
    }
    return $val
}

function Build-Frontmatter($fm) {
    # Remove syllabus_codes (plural)
    $fm.Remove("syllabus_codes")

    $syllabus_code = Get-FmValue $fm "syllabus_code" "[]"
    $subject = Get-FmValue $fm "subject" "无机和结构化学"
    $module = Get-FmValue $fm "module" "决赛要求"
    $submodule = Get-FmValue $fm "submodule" "结构与配位深化"

    $parent_module = $fm["parent_module"]
    if ($parent_module -eq $null -or $parent_module -eq "" -or $parent_module -match "决赛要求") {
        $parent_module = "决赛要求-$submodule"
    }

    $difficulty = Get-FmValue $fm "difficulty" "4"
    $importance = Get-FmValue $fm "importance" "4"
    $sources = Get-FmValue $fm "sources" "[]"
    $source_type = Get-FmValue $fm "source_type" "[]"
    $source_notes = Get-FmValue $fm "source_notes" "[]"
    $key_images = Get-FmValue $fm "key_images" "[]"

    $images_priority = Get-FmValue $fm "images_priority" "low"
    $images_note = Get-FmValue $fm "images_note" ""
    $has_images = Get-FmValue $fm "has_images" "false"
    $image_count = Get-FmValue $fm "image_count" "0"
    $review_cycle = Get-FmValue $fm "review_cycle" "30d"
    $teaching_ready = Get-FmValue $fm "teaching_ready" "false"
    $status = Get-FmValue $fm "status" "已填充"
    $updated = Get-Date -Format "yyyy-MM-dd"

    $newFm = @"
---
title: $($fm["title"])
aliases: $($fm["aliases"])
type: $($fm["type"])
template_version: v1.3
subject: $subject
module: $module
submodule: $submodule
syllabus_stage: $($fm["syllabus_stage"])
parent_overview: $($fm["parent_overview"])
parent_module: $parent_module
syllabus_code: $syllabus_code
syllabus_module: $($fm["syllabus_module"])
tags: $($fm["tags"])
related: $($fm["related"])
prerequisite: $($fm["prerequisite"])
problem_types: $($fm["problem_types"])
difficulty: $difficulty
importance: $importance
status: $status
sources: $sources
source_type: $source_type
source_notes: $source_notes
review_cycle: $review_cycle
has_images: $has_images
image_count: $image_count
images_priority: $images_priority
images_note: "$images_note"
teaching_ready: $teaching_ready
key_images: $key_images
updated: $updated
---
"@
    return $newFm
}

function Normalize-Sections($body) {
    $lines = $body -split "`n"
    $newLines = @()
    $seenSections = @{}

    $sectionPatterns = @{
        "^##\s*一、" = "## 一、定义"
        "^##\s*二、" = "## 二、考纲对应"
        "^##\s*三、" = "## 三、核心原理"
        "^##\s*四、" = "## 四、关键结论"
        "^##\s*五、" = "## 五、常见分类或情形"
        "^##\s*六、" = "## 六、适用条件与限制"
        "^##\s*七、" = "## 七、常见比较与易混点"
        "^##\s*八、" = "## 八、与其他知识点的联系"
        "^##\s*九、" = "## 九、典型题型"
        "^##\s*十、" = "## 十、例题"
        "^##\s*十一、" = "## 十一、易错点"
        "^##\s*十二、" = "## 十二、🎯 教学视角"
        "^##\s*十三、" = "## 十三、竞赛拓展"
        "^##\s*十四、" = "## 十四、外部资料出处"
        "^##\s*十五、" = "## 十五、待完善项"
    }

    foreach ($line in $lines) {
        $matched = $false
        foreach ($pattern in $sectionPatterns.Keys) {
            if ($line -match $pattern) {
                $standard = $sectionPatterns[$pattern]
                $secKey = $standard -replace "^##\s*", "" -replace "、.*", ""
                $seenSections[$secKey] = $true
                $newLines += $standard
                $matched = $true
                break
            }
        }
        if (-not $matched) {
            $newLines += $line
        }
    }
    return ($newLines -join "`n"), $seenSections
}

function Ensure-Sections($body, $seenSections) {
    $lines = @($body.TrimEnd() -split "`n")

    # Find last section index
    $lastSectionIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^##\s*[一二三四五六七八九十]+、") {
            $lastSectionIdx = $i
        }
    }

    $additions = @()
    foreach ($sec in $STANDARD_SECTIONS) {
        $secKey = ($sec -replace "^##\s*", "") -replace "、.*", ""
        if (-not $seenSections.ContainsKey($secKey)) {
            $additions += $sec
            $additions += ""
            $additions += "- [待填充]"
            $additions += ""
        }
    }

    if ($additions.Count -gt 0) {
        # Remove trailing blank lines
        while ($lines.Count -gt 0 -and $lines[$lines.Count - 1].Trim() -eq "") {
            $lines = $lines[0..($lines.Count - 2)]
        }
        $body = ($lines -join "`n") + "`n`n" + ($additions -join "`n")
    }

    return $body
}

$successCount = 0
$errors = @()

foreach ($filename in $FILES) {
    $filepath = Join-Path $BASE_DIR $filename
    try {
        $content = Get-Content -Path $filepath -Raw -Encoding UTF8
    } catch {
        $errors += "$filename`: Read error: $_"
        Write-Host "[ERR] $filename`: Read error: $_" -ForegroundColor Red
        continue
    }

    $fm, $body = Parse-Frontmatter $content
    if ($fm -eq $null) {
        $errors += "$filename`: No frontmatter found"
        Write-Host "[ERR] $filename`: No frontmatter found" -ForegroundColor Red
        continue
    }

    $newFm = Build-Frontmatter $fm
    $body, $seenSections = Normalize-Sections $body
    $body = Ensure-Sections $body $seenSections

    $newContent = $newFm + "`n`n" + $body

    try {
        Set-Content -Path $filepath -Value $newContent -Encoding UTF8 -NoNewline
        $successCount++
        Write-Host "[OK] $filename" -ForegroundColor Green
    } catch {
        $errors += "$filename`: Write error: $_"
        Write-Host "[ERR] $filename`: Write error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=" * 50
Write-Host "Total: $($FILES.Count), Success: $successCount, Failed: $($errors.Count)"
if ($errors.Count -gt 0) {
    Write-Host "Errors:"
    foreach ($e in $errors) {
        Write-Host "  - $e" -ForegroundColor Red
    }
}
