# Step 1: 建立 KP 查找表 + 提取真题 plain text 标签
$kpMap = @{}  # 标签名 -> KP 主文件名
$kpFiles = Get-ChildItem -Path "03-知识点" -Recurse -Filter "*.md" -File

Write-Output "Scanning KP files..."
foreach ($f in $kpFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $lines = $content -split "`r?`n"
    $title = ""
    foreach ($line in $lines) {
        if ($line -match "^title:\s*(.+)$") {
            $title = $matches[1].Trim().Trim("'""").Trim("'")
            $kpMap[$title] = $title
        }
        if ($line -match "^aliases:\s*\[(.*)\]\s*$") {
            $inner = $matches[1]
            $aliases = $inner -split "," | ForEach-Object { $_.Trim().Trim("'""").Trim("'") }
            foreach ($a in $aliases) {
                if ($a -and ($a -notmatch "^\s*$")) {
                    $kpMap[$a] = $title
                }
            }
        }
    }
}
Write-Output "KP lookup table: $($kpMap.Count) entries"

# 提取真题标签
$tags = @{}  # 标签 -> 出现次数
$tagFiles = @{}  # 标签 -> 文件列表

$examFiles = Get-ChildItem -Path "04-题库" -Recurse -Filter "*.md" -File
Write-Output "Scanning exam files..."
foreach ($f in $examFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match "(?s)^---\r?\n(.*?)\r?\n---") {
        $fm = $matches[1]
        $fmLines = $fm -split "`r?`n"
        foreach ($line in $fmLines) {
            if ($line -match "^knowledge_points:\s*(.+)\s*$") {
                $rest = $matches[1].Trim()
                # 处理内联数组: [A, B, C]
                if ($rest -match "^\[(.*)\]$") {
                    $inner = $matches[1]
                    $items = $inner -split "," | ForEach-Object { $_.Trim().Trim("'""").Trim("'") }
                    foreach ($item in $items) {
                        if ($item -and ($item -notmatch "^\s*$") -and ($item -notmatch "\[\[")) {
                            $clean = $item.Trim()
                            if ($tags[$clean]) {
                                $tags[$clean]++
                                $tagFiles[$clean] += "|`($f.Name)"
                            } else {
                                $tags[$clean] = 1
                                $tagFiles[$clean] = $f.Name
                            }
                        }
                    }
                }
            }
        }
    }
}

# 输出 Top 100 + KP 存在状态
$sorted = $tags.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 100
$outLines = @("count,tag,has_kp,kp_name,sample_files")
foreach ($e in $sorted) {
    $hasKp = if ($kpMap[$e.Key]) { "YES" } else { "NO" }
    $kpName = if ($kpMap[$e.Key]) { $kpMap[$e.Key] } else { "" }
    $files = $tagFiles[$e.Key]
    $outLines += "$($e.Value),`"$($e.Key)`",$hasKp,`"$kpName`",`"$files`""
}

[System.IO.File]::WriteAllLines("tag_analysis.csv", $outLines, [System.Text.Encoding]::UTF8)
Write-Output "Done. Output: tag_analysis.csv ($($sorted.Count) tags)"
Write-Output "Total unique plain text tags: $($tags.Count)"
Write-Output "Tags with matching KP: $($sorted | Where-Object { $kpMap[$_.Key] } | Measure-Object | Select-Object -ExpandProperty Count)"
