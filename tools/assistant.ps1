#Requires -Version 5.1
<#
  assistant.ps1 — Assistant d'installation de SANDRIZA Admin, en 3 ÉTAPES.

    ÉTAPE 1 : Déploie le certificat auto-signé dans les magasins de confiance
              du poste (Racine de confiance + Éditeurs approuvés). Windows fait
              alors confiance à l'installateur signé, sans avertissement.
    ÉTAPE 2 : Installation (lance l'installateur, après contrôle de signature).
    ÉTAPE 3 : Vérification & intégrité (signature valide + chaînée, empreinte
              SHA-256 conforme au manifeste, présence de l'application installée).

  L'étape 1 écrit dans le magasin LocalMachine -> DROITS ADMIN requis. Le script
  s'auto-élève au besoin.

  Usage :
    pwsh -File tools\assistant.ps1            # les 3 étapes
    pwsh -File tools\assistant.ps1 -Step 3    # une seule étape
#>
[CmdletBinding()]
param(
  [ValidateSet('All','1','2','3')] [string]$Step = 'All',
  [string]$CerPath,
  [string]$InstallerPath,
  [string]$ChecksumPath,
  [switch]$NoElevate
)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

if (-not $CerPath) { $CerPath = Join-Path $root 'certs\sandriza-codesign.cer' }
if (-not $InstallerPath) {
  $InstallerPath = Get-ChildItem -Path (Join-Path $root 'dist') -Filter 'SANDRIZA-Admin-Setup-*.exe' -ErrorAction SilentlyContinue |
                   Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $ChecksumPath) { $ChecksumPath = Join-Path $root 'dist\checksums.txt' }

function Test-Admin {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  (New-Object Security.Principal.WindowsPrincipal($id)).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

# Auto-élévation si l'étape 1 est concernée et qu'on n'est pas admin.
if (($Step -eq 'All' -or $Step -eq '1') -and -not (Test-Admin) -and -not $NoElevate) {
  Write-Host 'Élévation requise pour déployer le certificat (magasin LocalMachine)...' -ForegroundColor Yellow
  $a = @('-NoProfile','-ExecutionPolicy','Bypass','-File', "`"$PSCommandPath`"", '-Step', $Step)
  if ($CerPath)       { $a += @('-CerPath', "`"$CerPath`"") }
  if ($InstallerPath) { $a += @('-InstallerPath', "`"$InstallerPath`"") }
  if ($ChecksumPath)  { $a += @('-ChecksumPath', "`"$ChecksumPath`"") }
  Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $a
  return
}

function Write-Head($n, $title) {
  Write-Host ''
  Write-Host ("======== ÉTAPE $n : $title ========") -ForegroundColor Cyan
}

# ── ÉTAPE 1 : déploiement du certificat ──────────────────────────────────────
function Invoke-Step1 {
  Write-Head 1 'Déploiement du certificat auto-signé'
  if (-not (Test-Path $CerPath)) {
    throw "Certificat public introuvable : $CerPath. Lance d'abord tools\make-cert.ps1."
  }
  $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $CerPath
  Write-Host "Certificat : $($cert.Subject)"
  Write-Host "Empreinte  : $($cert.Thumbprint)"
  foreach ($storeName in @('Root','TrustedPublisher')) {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName,'LocalMachine')
    $store.Open('ReadWrite')
    $exists = $store.Certificates | Where-Object { $_.Thumbprint -eq $cert.Thumbprint }
    if ($exists) { Write-Host "  déjà présent dans LocalMachine\$storeName" -ForegroundColor DarkGray }
    else { $store.Add($cert); Write-Host "  ajouté à LocalMachine\$storeName" -ForegroundColor Green }
    $store.Close()
  }
  Write-Host 'Étape 1 terminée : le poste fait désormais confiance à ce certificat.' -ForegroundColor Green
}

# ── ÉTAPE 2 : installation ────────────────────────────────────────────────────
function Invoke-Step2 {
  Write-Head 2 "Installation de l'application"
  if (-not $InstallerPath -or -not (Test-Path $InstallerPath)) {
    throw "Installateur introuvable. Construis-le d'abord (tools\build.ps1) ou passe -InstallerPath."
  }
  Write-Host "Installateur : $InstallerPath"
  $sig = Get-AuthenticodeSignature -FilePath $InstallerPath
  Write-Host "Signature    : $($sig.Status)"
  if ($sig.Status -eq 'Valid') { Write-Host "  signé par : $($sig.SignerCertificate.Subject)" -ForegroundColor Green }
  elseif ($sig.Status -eq 'NotSigned') { Write-Host '  ⚠ Installateur NON SIGNÉ (prototype). Windows peut avertir.' -ForegroundColor Yellow }
  else { Write-Host "  ⚠ Signature $($sig.Status) — à examiner." -ForegroundColor Yellow }
  $go = Read-Host "Lancer l'installation maintenant ? (O/N)"
  if ($go -notmatch '^[OoYy]') { Write-Host 'Installation annulée.'; return }
  Start-Process -FilePath $InstallerPath -Wait
  Write-Host 'Étape 2 terminée.' -ForegroundColor Green
}

# ── ÉTAPE 3 : vérification & intégrité ────────────────────────────────────────
function Invoke-Step3 {
  Write-Head 3 'Vérification & intégrité'
  $ok = $true

  if ($InstallerPath -and (Test-Path $InstallerPath)) {
    # 3.1 Signature Authenticode (Valid = signée ET chaînée à une racine de confiance)
    $sig = Get-AuthenticodeSignature -FilePath $InstallerPath
    if     ($sig.Status -eq 'Valid')     { Write-Host "[OK] Signature valide et approuvée : $($sig.SignerCertificate.Subject)" -ForegroundColor Green }
    elseif ($sig.Status -eq 'NotSigned') { Write-Host '[i ] Installateur non signé (prototype) — contrôle de signature ignoré.' -ForegroundColor Yellow }
    else   { Write-Host "[X ] Signature : $($sig.Status)" -ForegroundColor Red; $ok = $false }

    # 3.2 Empreinte SHA-256 vs manifeste
    if (Test-Path $ChecksumPath) {
      $leaf = Split-Path $InstallerPath -Leaf
      $line = Get-Content $ChecksumPath | Where-Object { $_ -match [regex]::Escape($leaf) } | Select-Object -First 1
      $exp  = if ($line) { ($line -split '\s+')[0] } else { $null }
      $act  = (Get-FileHash -Algorithm SHA256 -Path $InstallerPath).Hash
      if     ($exp -and ($exp.ToUpper() -eq $act.ToUpper())) { Write-Host '[OK] Empreinte SHA-256 conforme au manifeste.' -ForegroundColor Green }
      elseif ($exp) { Write-Host "[X ] SHA-256 DIFFÉRENT ! attendu=$exp obtenu=$act" -ForegroundColor Red; $ok = $false }
      else   { Write-Host "[i ] Aucune entrée pour ce fichier dans le manifeste." -ForegroundColor Yellow }
    } else { Write-Host "[i ] Pas de manifeste ($ChecksumPath) — contrôle d'intégrité ignoré." -ForegroundColor Yellow }
  } else { Write-Host '[i ] Installateur introuvable — contrôles signature/somme ignorés.' -ForegroundColor Yellow }

  # 3.3 Présence de l'application installée
  $candidates = @(
    (Join-Path ${env:ProgramFiles} 'Sandriza\SANDRIZA Admin.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Sandriza\SANDRIZA Admin.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\sandriza-admin-desktop\SANDRIZA Admin.exe')
  )
  $found = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($found) { Write-Host "[OK] Application installée : $found" -ForegroundColor Green }
  else { Write-Host '[i ] Exécutable installé non localisé (chemins usuels vérifiés).' -ForegroundColor Yellow }

  Write-Host ''
  if ($ok) { Write-Host 'Vérification terminée : aucun problème bloquant.' -ForegroundColor Green }
  else     { Write-Host 'Vérification terminée : DES CONTRÔLES ONT ÉCHOUÉ (voir ci-dessus).' -ForegroundColor Red }
}

switch ($Step) {
  '1' { Invoke-Step1 }
  '2' { Invoke-Step2 }
  '3' { Invoke-Step3 }
  default { Invoke-Step1; Invoke-Step2; Invoke-Step3 }
}
if ($Step -eq 'All') { try { Read-Host 'Appuie sur Entrée pour fermer' | Out-Null } catch {} }
