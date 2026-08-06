#Requires -Version 5.1
<#
  make-cert.ps1 — crée UNE FOIS un certificat de signature de code AUTO-SIGNÉ.

  Produit dans desktop\certs\ :
    sandriza-codesign.cer  -> clé PUBLIQUE  (à déployer sur les postes ; committable)
    sandriza-codesign.pfx  -> clé PRIVÉE    (sert à SIGNER ; JAMAIS committée/servie)

  Le .pfx est ignoré par git ET par Docker (.dockerignore) — il ne doit jamais
  quitter les postes de construction.

  Usage :
    pwsh -File tools\make-cert.ps1
#>
[CmdletBinding()]
param(
  [string]$Subject = 'CN=SANDRIZA Admin (auto-signe), O=SANDRIZA',
  [int]$Years = 5,
  [string]$OutDir,
  [System.Security.SecureString]$PfxPassword
)
$ErrorActionPreference = 'Stop'

if (-not $OutDir) { $OutDir = Join-Path $PSScriptRoot '..\certs' }
$OutDir = [System.IO.Path]::GetFullPath($OutDir)
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$cerPath = Join-Path $OutDir 'sandriza-codesign.cer'
$pfxPath = Join-Path $OutDir 'sandriza-codesign.pfx'

if (Test-Path $pfxPath) {
  Write-Host "Un certificat existe deja : $pfxPath" -ForegroundColor Yellow
  Write-Host "Supprime-le d'abord si tu veux en regenerer un." -ForegroundColor Yellow
  return
}

if (-not $PfxPassword) {
  $PfxPassword = Read-Host -AsSecureString -Prompt 'Choisis un mot de passe pour la cle privee (.pfx)'
}

Write-Host 'Creation du certificat auto-signe (signature de code)...' -ForegroundColor Cyan
$cert = New-SelfSignedCertificate `
  -Type CodeSigningCert `
  -Subject $Subject `
  -KeyUsage DigitalSignature `
  -KeyAlgorithm RSA -KeyLength 3072 `
  -CertStoreLocation 'Cert:\CurrentUser\My' `
  -NotAfter (Get-Date).AddYears($Years) `
  -FriendlyName 'SANDRIZA Admin - signature de code (auto-signe)'

Export-Certificate -Cert $cert -FilePath $cerPath -Force | Out-Null
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $PfxPassword | Out-Null

Write-Host ''
Write-Host "OK. Empreinte (thumbprint) : $($cert.Thumbprint)" -ForegroundColor Green
Write-Host "  Cle PUBLIQUE (a deployer) : $cerPath" -ForegroundColor Green
Write-Host "  Cle PRIVEE   (a garder)   : $pfxPath" -ForegroundColor Green
Write-Host ''
Write-Host "⚠ Ne committe JAMAIS le .pfx (deja ignore par git et Docker)." -ForegroundColor Yellow
Write-Host "Pour construire un installateur SIGNE :" -ForegroundColor Cyan
Write-Host "  pwsh -File tools\build.ps1 -SelfSign" -ForegroundColor Gray
