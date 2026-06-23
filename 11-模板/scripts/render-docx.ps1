param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$InputPath,

    [Parameter(Position = 1)]
    [string]$OutputDir,

    [switch]$EmitPdf,

    [switch]$VerboseRender
)

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding
$env:PYTHONIOENCODING = 'utf-8'

$python = 'C:\Users\蕾赛\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$script = 'C:\Obsidion\妙妙屋\11-模板\scripts\render_docx_windows.py'

if (-not (Test-Path -LiteralPath $InputPath)) {
    throw "Input file not found: $InputPath"
}

$inputItem = Get-Item -LiteralPath $InputPath
$resolvedInput = $inputItem.FullName

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($inputItem.Name)
    $OutputDir = Join-Path $inputItem.DirectoryName ($stem + '_render')
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDir)

$args = @(
    $script
    $resolvedInput
    '--output_dir'
    $resolvedOutput
)

if ($EmitPdf) {
    $args += '--emit_pdf'
}

if ($VerboseRender) {
    $args += '--verbose'
}

& $python @args

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Render complete"
Write-Host "Input : $resolvedInput"
Write-Host "Output: $resolvedOutput"
