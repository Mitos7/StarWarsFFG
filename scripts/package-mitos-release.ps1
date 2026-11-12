param([string]$OutputPath = (Join-Path $env:TEMP 'sw-release14'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$repo = Split-Path $PSScriptRoot -Parent
New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
function New-Package([string]$Root, [string[]]$Paths, [string]$Target) {
    if (Test-Path $Target) { Remove-Item $Target }
    $zip = [IO.Compression.ZipFile]::Open($Target, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($relative in $Paths) {
            $source = Join-Path $Root $relative
            if (!(Test-Path $source)) { throw "Missing package input: $source" }
            $files = if (Test-Path $source -PathType Container) { Get-ChildItem $source -File -Recurse } else { Get-Item $source }
            foreach ($file in $files) {
                $name = $file.FullName.Substring($Root.Length + 1).Replace('\', '/')
                [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $name, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        }
    } finally { $zip.Dispose() }
}
$systemPaths = @('assets','packs','fonts','images','lang','lib','modules','styles','templates','scripts','system.json','LICENSE.txt','README.md','README-MITOS-V14.md','package.json','CHANGELOG.md','CONTRIBUTING.md')
New-Package $repo $systemPaths (Join-Path $OutputPath 'system.zip')
New-Package (Join-Path $repo 'starter-kit') @('packs','module.json','LICENSE','README.md') (Join-Path $OutputPath 'swffg-mitos-starter.zip')
Copy-Item (Join-Path $repo 'system.json') (Join-Path $OutputPath 'system.json') -Force
Copy-Item (Join-Path $repo 'starter-kit/module.json') (Join-Path $OutputPath 'module.json') -Force
$zip = [IO.Compression.ZipFile]::OpenRead((Join-Path $OutputPath 'system.zip'))
try {
    $names = @($zip.Entries.FullName)
    $catalog = Get-Content (Join-Path $repo 'assets/starwars-original/sources.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($image in $catalog.images) { if ($image.file -notin $names) { throw "Image absent from ZIP: $($image.file)" } }
    $manifest = Get-Content (Join-Path $repo 'system.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($pack in $manifest.packs) { if ("$($pack.path)/CURRENT" -notin $names) { throw "Compendium absent from ZIP: $($pack.path)" } }
    if ('system.json' -notin $names -or ($names | Where-Object { $_.Contains('\') })) { throw 'Invalid archive root or path separators' }
    Write-Output "Validated $($catalog.images.Count) images and $($manifest.packs.Count) compendia in system.zip."
} finally { $zip.Dispose() }
Get-ChildItem $OutputPath -File | Where-Object Extension -in '.json','.zip' | Select-Object Name,Length
