$files = Get-ChildItem -Path "04-题库" -Filter "*.md" -Recurse -File
$plainTags = @{}
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match "(?s)---\r?\n(.*?)\r?\n---") {
        $fm = $matches[1]
        if ($fm -match "knowledge_points:\s*(.+)") {
            $kpRaw = $matches[1]
            $items = @()
            if ($kpRaw -match "^\[") {
                $inner = $kpRaw.Trim("[]")
                $arr = $inner -split "," | ForEach-Object { $_.Trim().Trim("'"").Trim() }
                $items += $arr
            } else {
                $lines = $kpRaw -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
                foreach ($line in $lines) {
                    if ($line -match "^-\s+(.+)$") {
                        $items += $matches[1].Trim().Trim("'""").Trim()
                    } elseif ($line -notmatch "^\s*#") {
                        $items += $line.Trim("'""").Trim()
                    }
                }
            }
            foreach ($item in $items) {
                if ($item -and ($item -notmatch "^\s*$")) {
                    if ($item -notmatch "\[\[") {
                        $clean = $item.Trim()
                        if ($plainTags.ContainsKey($clean)) {
                            $plainTags[$clean]++
                        } else {
                            $plainTags[$clean] = 1
                        }
                    }
                }
            }
        }
    }
}
$sorted = $plainTags.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 50
$out = @()
$out += "count,tag"
foreach ($e in $sorted) {
    $out += "$($e.Value),`"$($e.Key)`""
}
[System.IO.File]::WriteAllLines("temp_tag_stats.csv", $out, [System.Text.Encoding]::UTF8)
Write-Output "done"
