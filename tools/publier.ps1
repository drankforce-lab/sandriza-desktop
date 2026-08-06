<#
================================================================================
 PUBLIER UNE VERSION — DEPUIS TA MACHINE, SANS GITHUB
================================================================================
 Construit les paquets Windows et les depose dans Cloudflare R2. Deux minutes,
 aucune file d'attente, aucune dependance a un service tiers.

 POURQUOI CE SCRIPT EXISTE
   Le 2026-08-06, GitHub Actions est tombe en panne majeure au milieu d'une
   serie de publications : erreurs 500 au declenchement, jobs jamais attribues
   (<< The job was not acquired by Runner of type hosted >>), annulations en
   bloc. Une chaine de publication qui depend d'un service tiers s'arrete quand
   ce service s'arrete. Celle-ci ne depend que de ce poste.
   Les workflows GitHub restent en place comme filet — notamment pour macOS,
   qui ne peut pas etre construit sur Windows.

 CE QU'IL FAUT, UNE SEULE FOIS
   Poser les identifiants R2 dans l'environnement de TA session. Ils ne doivent
   JAMAIS etre ecrits dans un fichier du depot : celui-ci est PUBLIC.

     $env:R2_ACCESS_KEY_ID     = '...'
     $env:R2_SECRET_ACCESS_KEY = '...'
     $env:R2_ENDPOINT          = 'https://<compte>.r2.cloudflarestorage.com'
     $env:R2_BUCKET            = '...'
     $env:ELG_APP_KEY          = 'sz1_...'      # cle du verrou d'application

   Pour les rendre permanents (a refaire une seule fois) :
     [Environment]::SetEnvironmentVariable('R2_BUCKET','...','User')

 UTILISATION
     pwsh -File tools\publier.ps1 -Version 0.7.0
     pwsh -File tools\publier.ps1 -Version 0.7.0 -Arch arm64     # une seule cible
     pwsh -File tools\publier.ps1 -Version 0.7.0 -SansTelever    # construire seulement
================================================================================
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Version,
  # ⚠ UNE CONSTRUCTION PAR ARCHITECTURE, JAMAIS LES TROIS D'UN COUP.
  # electron-builder ecrit UN SEUL `latest.yml` par execution : lancer les trois
  # ensemble le fait ecraser deux fois, et deux flux sur trois annoncent alors le
  # mauvais paquet. On boucle, et on range la sortie apres chaque passe.
  [string[]]$Arch = @('x64', 'ia32', 'arm64'),
  [switch]$SansTelever,
  # Reprend l envoi avec les paquets DEJA construits dans `paquets\`. Utile quand
  # le televersement echoue : rebatir trois architectures pour reessayer un
  # envoi, c est cinq minutes pour rien.
  [switch]$SansConstruire
)

$ErrorActionPreference = 'Stop'
$racine = Split-Path -Parent $PSScriptRoot
Set-Location $racine

function Etape($t) { Write-Host "`n=== $t" -ForegroundColor Cyan }
function Bon($t)   { Write-Host "  OK   $t" -ForegroundColor Green }
function Mauvais($t) { Write-Host "  ECHEC $t" -ForegroundColor Red; exit 1 }

# ── 1. Controles AVANT de construire ────────────────────────────────────────
# Une construction de 80 Mo qui echoue au televersement parce qu'une variable
# est vide, c'est cinq minutes perdues pour rien. On verifie d'abord.
Etape 'Controles'

$manquantes = @()
foreach ($v in 'ELG_APP_KEY') {
  if (-not [Environment]::GetEnvironmentVariable($v)) { $manquantes += $v }
}
if (-not $SansTelever) {
  foreach ($v in 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT', 'R2_BUCKET') {
    if (-not [Environment]::GetEnvironmentVariable($v)) { $manquantes += $v }
  }
}
if ($manquantes.Count) {
  Write-Host "  Variables d'environnement absentes : $($manquantes -join ', ')" -ForegroundColor Red
  Write-Host "  Voir l'en-tete de ce script pour les poser." -ForegroundColor Yellow
  exit 1
}
Bon 'identifiants presents'

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.version -ne $Version) {
  # On monte la version dans package.json : c'est elle qu'electron-builder ecrit
  # dans latest.yml, et c'est elle que l'application compare au lancement.
  $pkg.version = $Version
  ($pkg | ConvertTo-Json -Depth 20) | Set-Content package.json -Encoding UTF8
  Bon "package.json monte a $Version"
} else {
  Bon "version $Version"
}

# ⚠ LA CLE N'EST PAS DANS LE DEPOT (il est public) : on l'ecrit ici, dans un
# fichier ignore par git, exactement comme le fait le workflow.
"module.exports = { APP_KEY: '$($env:ELG_APP_KEY)' };" | Set-Content src\cle.js -Encoding UTF8
Bon 'cle du verrou injectee (src\cle.js, ignore par git)'

if (-not (Test-Path node_modules)) {
  Etape 'Dependances'
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { Mauvais 'npm install' }
}

Etape 'Controle de syntaxe'
Get-ChildItem src\*.js | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { Mauvais "syntaxe : $($_.Name)" }
}
Bon "$((Get-ChildItem src\*.js).Count) fichiers"

# ── 2. Construction, une architecture a la fois ─────────────────────────────
$scene = Join-Path $racine 'paquets'
if ($SansConstruire) {
  if (-not (Test-Path $scene)) { Mauvais "aucun paquet a envoyer dans $scene" }
  Bon "reprise : paquets deja construits ($((Get-ChildItem $scene -Directory).Count) architecture(s))"
  $Arch = @()
} else {
  if (Test-Path $scene) { Remove-Item -Recurse -Force $scene }
  New-Item -ItemType Directory -Force $scene | Out-Null
}

foreach ($a in $Arch) {
  Etape "Construction Windows $a"
  if (Test-Path dist) { Remove-Item -Recurse -Force dist }
  npx electron-builder --win --$a --publish never
  if ($LASTEXITCODE -ne 0) { Mauvais "electron-builder $a" }

  $dest = Join-Path $scene "win-$a"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Get-ChildItem dist -File | Where-Object { $_.Extension -in '.exe', '.blockmap' -or $_.Name -like 'latest*.yml' } |
    ForEach-Object { Copy-Item $_.FullName $dest }
  Bon "$a : $((Get-ChildItem $dest).Count) fichier(s)"
}

if ($SansTelever) {
  Write-Host "`nConstruction terminee. Paquets dans : $scene" -ForegroundColor Green
  Write-Host "Rien n'a ete televerse (-SansTelever)." -ForegroundColor Yellow
  exit 0
}

# ── 3. Televersement dans R2 (SigV4, sans aucune dependance) ────────────────
# On signe nous-memes : ni AWS CLI, ni module a installer. R2 accepte un PUT
# simple avec l'empreinte du contenu dans `x-amz-content-sha256`.
# ⚠ NE PAS utiliser l'encodage `aws-chunked` : R2 le refuse.

function Hmac([byte[]]$cle, [string]$msg) {
  $h = New-Object System.Security.Cryptography.HMACSHA256
  $h.Key = $cle
  return $h.ComputeHash([Text.Encoding]::UTF8.GetBytes($msg))
}
function Hex([byte[]]$o) { -join ($o | ForEach-Object { $_.ToString('x2') }) }

function Envoyer-R2 {
  param([string]$Chemin, [string]$Cle, [string]$TypeContenu = 'application/octet-stream')

  $endpoint = $env:R2_ENDPOINT.TrimEnd('/')
  $hote     = ([Uri]$endpoint).Host
  $uri      = '/' + $env:R2_BUCKET + '/' + $Cle
  $maintenant = [DateTime]::UtcNow
  $amzDate  = $maintenant.ToString('yyyyMMddTHHmmssZ')
  $jour     = $maintenant.ToString('yyyyMMdd')
  $portee   = "$jour/auto/s3/aws4_request"

  $empreinte = (Get-FileHash -Algorithm SHA256 -Path $Chemin).Hash.ToLower()

  # Les en-tetes signes doivent etre tries, en minuscules.
  $canon = @(
    'PUT', $uri, '',
    "host:$hote",
    "x-amz-content-sha256:$empreinte",
    "x-amz-date:$amzDate",
    '',
    'host;x-amz-content-sha256;x-amz-date',
    $empreinte
  ) -join "`n"

  $shaCanon = Hex ([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($canon)))
  $aSigner  = @('AWS4-HMAC-SHA256', $amzDate, $portee, $shaCanon) -join "`n"

  $kDate    = Hmac ([Text.Encoding]::UTF8.GetBytes('AWS4' + $env:R2_SECRET_ACCESS_KEY)) $jour
  $kRegion  = Hmac $kDate 'auto'
  $kService = Hmac $kRegion 's3'
  $kSigning = Hmac $kService 'aws4_request'
  $signature = Hex (Hmac $kSigning $aSigner)

  $auth = "AWS4-HMAC-SHA256 Credential=$($env:R2_ACCESS_KEY_ID)/$portee, " +
          "SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=$signature"

  # ⚠ -SkipHeaderValidation EST INDISPENSABLE ICI.
  # .NET traite `Authorization` comme un en-tete STRUCTURE (schema + parametres)
  # et refuse la forme d AWS : « The format of value 'AWS4-HMAC-SHA256
  # Credential=…' is invalid ». Ce n est pas R2 qui rejette la requete — elle ne
  # part meme pas. Ce commutateur dit a PowerShell de transmettre l en-tete tel
  # quel, ce qui est exactement ce qu il faut pour une signature calculee a la
  # main. (Vecu le 2026-08-06 : trois constructions reussies, envoi impossible.)
  $r = Invoke-WebRequest -Method PUT -Uri ($endpoint + $uri) -InFile $Chemin `
        -ContentType $TypeContenu -SkipHttpErrorCheck -SkipHeaderValidation -TimeoutSec 900 -Headers @{
          'Authorization'        = $auth
          'x-amz-date'           = $amzDate
          'x-amz-content-sha256' = $empreinte
          'Host'                 = $hote
        }
  if ($r.StatusCode -ne 200 -and $r.StatusCode -ne 201) {
    Write-Host $r.Content -ForegroundColor DarkGray
    Mauvais "televersement $Cle (HTTP $($r.StatusCode))"
  }
}

Etape 'Televersement dans R2'
$entrees = @()
foreach ($d in Get-ChildItem $scene -Directory) {
  $arch = $d.Name -replace '^win-', ''
  foreach ($f in Get-ChildItem $d.FullName -File) {
    $type = if ($f.Extension -eq '.yml') { 'text/yaml' } else { 'application/octet-stream' }
    Envoyer-R2 -Chemin $f.FullName -Cle "desktop/win/$arch/$($f.Name)" -TypeContenu $type
    Write-Host "       $($f.Name)  ->  desktop/win/$arch/" -ForegroundColor DarkGray
  }
  # ⚠ ON FILTRE SUR L'ARCHITECTURE, pas << le premier .exe venu >>. Un manifeste
  # qui pointe le mauvais paquet fait telecharger a quelqu'un une application
  # qui ne demarrera pas sur sa machine, sans le moindre message.
  $paquet = Get-ChildItem $d.FullName -File -Filter "*-$arch.exe" | Select-Object -First 1
  if (-not $paquet) { Mauvais "aucun .exe $arch dans $($d.Name)" }
  $entrees += [ordered]@{ os = 'win'; arch = $arch; key = "desktop/win/$arch/$($paquet.Name)"; size = $paquet.Length }
  Bon "win/$arch"
}

# ── 4. Manifeste ────────────────────────────────────────────────────────────
# ⚠ CE MANIFESTE NE CONTIENDRA QUE DU WINDOWS, et c'est assume.
# Il est lu par la page de telechargement (adm-download.php) pour offrir le bon
# paquet selon la machine. Une publication faite d'ici ne peut pas produire de
# paquet macOS — electron-builder exige un vrai Mac — donc l'annoncer serait
# mentir : la page proposerait un fichier qui n'existe pas pour cette version.
# Le manifeste dit ce qui a REELLEMENT ete publie.
#
# 👉 Le jour ou un Mac entre en service, publier par GITHUB (workflow
#    << Construire >> avec `avec_mac`, puis << Publier >> depuis le depot prive) :
#    cette chaine-la construit les cinq cibles et ecrit un manifeste complet.
#    C'est precisement pour ca qu'on la garde.
$manifeste = [ordered]@{ version = $Version; files = @() }
foreach ($e in $entrees) { $manifeste.files += $e }

$tmp = Join-Path $env:TEMP 'latest.json'
($manifeste | ConvertTo-Json -Depth 10 -Compress) | Set-Content $tmp -Encoding UTF8
Envoyer-R2 -Chemin $tmp -Cle 'desktop/latest.json' -TypeContenu 'application/json'
Bon 'manifeste desktop/latest.json'

Write-Host "`n=== Version $Version publiee ===" -ForegroundColor Green
Write-Host "Les postes la recevront a leur prochain lancement." -ForegroundColor Green
Write-Host "Verification : https://adm.sandriza.com/update/win/x64/latest.yml (en-tete X-Sandriza-App requis)" -ForegroundColor DarkGray
