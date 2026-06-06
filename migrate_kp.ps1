# KP v1.1 to v1.3 Migration Script for Organic Chemistry files
$files = @(
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\共轭效应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\共振论.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\光氧化还原催化.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\过碘酸氧化.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\环氧化反应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\卡宾.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\离去基与pKa.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\邻二醇切断.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\膦化合物.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\卤代内酯化反应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\前线轨道理论.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\亲核体与亲电体.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\双羟化反应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\羧酸衍生物.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\碳正离子.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\鎓离子.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\烯烃复分解.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\氧化还原反应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\影响亲核性的因素.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\诱导效应.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\质谱.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\质子转移可行性.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\重氮化合物.md",
    "C:\Obsidion\妙妙屋\03-知识点\有机化学\重氮盐.md"
)

$fieldOrder = @(
    "title", "aliases", "type", "template_version", "subject", "module", "submodule",
    "syllabus_stage", "parent_overview", "parent_module", "syllabus_code",
    "syllabus_module", "tags", "related", "prerequisite", "problem_types",
    "difficulty", "importance", "status", "sources", "source_type",
    "review_cycle", "has_images", "images_priority", "images_note",
    "updated", "source_notes", "key_images", "image_count", "teaching_ready"
)

$standardSections = @(
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
    "## 十二、教学视角",
    "## 十三、竞赛拓展",
    "## 十四、外部资料出处",
    "## 十五、待完善项"
)

function Format-YamlValue {
    param($value, $key)
    if ($value -eq $null) { return "" }
    if ($value -is [System.Collections.IList]) {
        if ($value.Count -eq 0) { return $key + ": []" }
        $lines = @($key + ":")
        foreach ($item in $value) {
            $lines += "  - " + $item
        }
        return $lines -join "`n"
    }
    if ($value -is [bool]) {
        $s = if ($value) { "true" } else { "false" }
        return $key + ": " + $s
    }
    if ($value -is [int]) {
        return $key + ": " + $value
    }
    $s = [string]$value
    if ($s -eq "") { return $key + ': ""' }
    $needsQuote = $s -match '[\:\#\[\]\{\}\,\&\*\?\|\-\<\>\=\!\%\@\`\"\'']'
    if ($needsQuote) {
        $escaped = $s -replace '"', '\"'
        return $key + ': "' + $escaped + '"'
    }
    return $key + ": " + $s
}

function Parse-Frontmatter {
    param([string]$content)
    if (-not $content.StartsWith("---")) { return $null, $content }
    $endIdx = $content.IndexOf("`n---", 3)
    if ($endIdx -lt 0) { return $null, $content }
    $fmText = $content.Substring(4, $endIdx - 4).Trim()
    $rest = $content.Substring($endIdx + 5)
    $fm = @{}
    $lines = $fmText -split "`r?`n"
    $currentKey = $null
    $currentList = $null
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
        if ($trimmed -match "^-\s+(.+)$" -and $currentKey -ne $null -and $currentList -ne $null) {
            $currentList += $matches[1].Trim()
        }
        elseif ($trimmed -match "^([\w_]+)\s*:\s*(.*)$") {
            if ($currentKey -ne $null -and $currentList -ne $null) {
                $fm[$currentKey] = $currentList
            }
            $currentKey = $matches[1]
            $val = $matches[2].Trim()
            if ($val -eq "[]") {
                $fm[$currentKey] = @()
                $currentList = $null
            }
            elseif ($val -eq "") {
                $currentList = @()
            }
            elseif ($val -match "^\[(.*)\]$") {
                $inner = $matches[1]
                $items = @()
                foreach ($item in $inner -split ",") {
                    $t = $item.Trim()
                    if ($t.StartsWith('"') -and $t.EndsWith('"')) { $t = $t.Substring(1, $t.Length - 2) }
                    if ($t.StartsWith("'") -and $t.EndsWith("'")) { $t = $t.Substring(1, $t.Length - 2) }
                    if ($t -ne "") { $items += $t }
                }
                $fm[$currentKey] = $items
                $currentList = $null
            }
            else {
                $fm[$currentKey] = $val
                $currentList = $null
            }
        }
        elseif ($trimmed -match "^-\s+(.+)$" -and $currentKey -ne $null) {
            if ($currentList -eq $null) { $currentList = @() }
            $currentList += $matches[1].Trim()
        }
    }
    if ($currentKey -ne $null -and $currentList -ne $null) {
        $fm[$currentKey] = $currentList
    }
    return $fm, $rest
}

function Build-Frontmatter {
    param($fm)
    $fm.Remove("syllabus_codes")
    if (-not $fm.ContainsKey("syllabus_code")) { $fm["syllabus_code"] = @() }
    $fm["template_version"] = "v1.3"
    $fm["parent_module"] = "基础要求-有机化学"
    if (-not $fm.ContainsKey("parent_overview")) { $fm["parent_overview"] = "中国化学奥林匹克基本要求-总览" }
    $fm["review_cycle"] = "30d"
    $fm["has_images"] = $false
    $fm["images_priority"] = "结构/机理 medium，纯公式 low"
    if (-not $fm.ContainsKey("images_note")) { $fm["images_note"] = "" }
    $fm["teaching_ready"] = $false
    if (-not $fm.ContainsKey("image_count")) { $fm["image_count"] = 0 }
    foreach ($field in @("sources", "source_type", "source_notes", "key_images")) {
        if (-not $fm.ContainsKey($field)) { $fm[$field] = @() }
    }
    foreach ($field in @("difficulty", "importance")) {
        if (-not $fm.ContainsKey($field)) { $fm[$field] = 3 }
    }
    $fm["updated"] = "2026-05-25"
    $lines = @("---")
    foreach ($key in $fieldOrder) {
        if ($fm.ContainsKey($key)) {
            $val = $fm[$key]
            $formatted = Format-YamlValue -value $val -key $key
            if ($formatted -ne "") { $lines += $formatted }
        }
    }
    $lines += "---"
    return ($lines -join "`n") + "`n"
}

function Insert-MissingSections {
    param([string]$body)
    $lines = $body -split "`r?`n"
    $sectionPositions = @{}
    for ($i = 0; $i -lt $lines.Count; $i++) {
        for ($j = 0; $j -lt $standardSections.Count; $j++) {
            if ($lines[$i].Trim().StartsWith($standardSections[$j])) {
                $sectionPositions[$j] = $i
            }
        }
    }
    if ($sectionPositions.Count -eq 0) { return $body }
    $newLines = [System.Collections.Generic.List[string]]::new()
    $newLines.AddRange($lines)
    for ($idx = $standardSections.Count - 1; $idx -ge 0; $idx--) {
        if (-not $sectionPositions.ContainsKey($idx)) {
            $insertAfter = -1
            for ($prev = $idx - 1; $prev -ge 0; $prev--) {
                if ($sectionPositions.ContainsKey($prev)) {
                    $insertAfter = $sectionPositions[$prev]
                    break
                }
            }
            if ($insertAfter -ge 0) {
                $insertPos = $insertAfter
                $nextSectionLine = $newLines.Count
                for ($next = $idx + 1; $next -lt $standardSections.Count; $next++) {
                    if ($sectionPositions.ContainsKey($next)) {
                        $nextSectionLine = $sectionPositions[$next]
                        break
                    }
                }
                for ($i = $insertAfter + 1; $i -lt [Math]::Min($nextSectionLine, $newLines.Count); $i++) {
                    if ($newLines[$i].Trim() -ne "") { $insertPos = $i }
                }
                $newLines.Insert($insertPos + 1, "")
                $newLines.Insert($insertPos + 2, $standardSections[$idx])
                $newLines.Insert($insertPos + 3, "")
                $sectionPositions[$idx] = $insertPos + 2
                $keys = @($sectionPositions.Keys | Sort-Object)
                foreach ($k in $keys) {
                    if ($sectionPositions[$k] -gt $insertPos + 2) {
                        $sectionPositions[$k] = $sectionPositions[$k] + 3
                    }
                }
            }
        }
    }
    return $newLines -join "`n"
}

$success = 0
$failed = 0
$errors = @()

foreach ($filepath in $files) {
    $name = Split-Path $filepath -Leaf
    Write-Host "Processing: $name"
    try {
        $content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)
        $fm, $body = Parse-Frontmatter -content $content
        if ($fm -eq $null) {
            Write-Host "  WARNING: No frontmatter found"
            $failed++
            $errors += $name
            continue
        }
        $newFm = Build-Frontmatter -fm $fm
        $newBody = Insert-MissingSections -body $body
        $newContent = $newFm + $newBody
        [System.IO.File]::WriteAllText($filepath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "  OK"
        $success++
    }
    catch {
        Write-Host "  ERROR: $_"
        $failed++
        $errors += $name
    }
}

Write-Host ""
Write-Host ("=" * 50)
Write-Host "Total: $($files.Count)"
Write-Host "Success: $success"
Write-Host "Failed: $failed"
if ($errors.Count -gt 0) {
    Write-Host "Errors: $($errors -join ', ')"
}