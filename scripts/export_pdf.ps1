# Export the booklet to PDF using Microsoft Word (Windows only).
# Usage: powershell -ExecutionPolicy Bypass -File scripts\export_pdf.ps1
param(
  [string]$In = "$PSScriptRoot\..\booklet\Bible Outlines.docx",
  [string]$Out = "$PSScriptRoot\..\booklet\Bible Outlines.pdf"
)

$inPath = (Resolve-Path $In).Path
$outPath = [System.IO.Path]::GetFullPath($Out)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($inPath, $false, $true)
  $doc.ExportAsFixedFormat($outPath, 17)  # 17 = wdExportFormatPDF
  $doc.Close(0)
} catch {
  # Word sometimes drops the COM connection on Close after a successful export.
  if (-not (Test-Path $outPath)) { throw }
} finally {
  $word.Quit()
}
Write-Output "Wrote $outPath"
