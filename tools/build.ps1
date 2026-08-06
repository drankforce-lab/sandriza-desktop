#Requires -Version 5.1
<#
  build.ps1 — construit l'installateur Windows du prototype SANDRIZA Admin.

    - Vérifie Node / npm (option -InstallNode pour les poser via winget).
    - npm install
    - npm run dist    (NON signé par défaut ; SIGNÉ avec -SelfSign)
    - génère dist\checksums.txt (SHA-256 de l'installateur, pour l'étape 3)

  Usage :
    pwsh -File tools\build.ps1                 # prototype NON signé
    pwsh -File tools\build.ps1 -SelfSign       # signé avec le certificat auto-signé
    pwsh -File tools\build.ps1 -InstallNode    # installe Node LTS puis s'arrête
#>
[CmdletBinding()]
param(
  [switch]$SelfSign,
  [switch]$InstallNode,
  [string]$PfxPath,
  [string]$PfxPassword
)
$ErrorActionPreference = 'Stop'
$desktop = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location $desktop

function Have($cmd) { $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue) }

if (-not (Have 'node') -or -not (Have 'npm')) {
  if ($InstallNode -and (Have 'winget')) {
    Write-Host 'Installation de Node.js LTS via winget...' -ForegroundColor Cyan
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    Write-Host 'Node installé. FERME ce terminal, rouvre-en un neuf, puis relance build.ps1.' -ForegroundColor Yellow
    return
  }
  throw "Node.js / npm absents. Installe Node LTS (https://nodejs.org) ou relance avec -InstallNode."
}

Write-Host "Node $(node -v) / npm $(npm -v)" -ForegroundColor DarkGray
Write-Host 'Installation des dépendances (npm install)...' -ForegroundColor Cyan
npm install

if ($SelfSign) {
  if (-not $PfxPath) { $PfxPath = Join-Path $desktop 'certs\sandriza-codesign.pfx' }
  if (-not (Test-Path $PfxPath)) { throw "PFX introuvable ($PfxPath). Lance tools\make-cert.ps1 d'abord." }
  if (-not $PfxPassword) {
    $sec = Read-Host -AsSecureString 'Mot de passe du .pfx'
    $PfxPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
  }
  $env:CSC_LINK = $PfxPath
  $env:CSC_KEY_PASSWORD = $PfxPassword
  Write-Host 'Construction SIGNÉE (certificat auto-signé)...' -ForegroundColor Cyan
} else {
  Remove-Item Env:CSC_LINK -ErrorAction SilentlyContinue
  Remove-Item Env:CSC_KEY_PASSWORD -ErrorAction SilentlyContinue
  Write-Host 'Construction NON SIGNÉE (prototype)...' -ForegroundColor Cyan
}

npm run dist

$dist = Join-Path $desktop 'dist'
$installer = Get-ChildItem -Path $dist -Filter 'SANDRIZA-Admin-Setup-*.exe' -ErrorAction SilentlyContinue |
             Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($installer) {
  $h = (Get-FileHash -Algorithm SHA256 -Path $installer.FullName).Hash
  "$h  $($installer.Name)" | Set-Content -Path (Join-Path $dist 'checksums.txt') -Encoding ASCII
  Write-Host ''
  Write-Host "Installateur : $($installer.FullName)" -ForegroundColor Green
  Write-Host "SHA-256      : $h" -ForegroundColor Green
  Write-Host "Manifeste    : $(Join-Path $dist 'checksums.txt')" -ForegroundColor Green
  Write-Host ''
  Write-Host 'Ensuite, sur le poste cible : pwsh -File tools\assistant.ps1' -ForegroundColor Cyan
} else {
  Write-Host 'Aucun installateur trouvé dans dist\ — la construction a-t-elle échoué ?' -ForegroundColor Red
}
