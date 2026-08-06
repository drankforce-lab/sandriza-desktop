<#
================================================================================
 MENAGE DES PAQUETS DANS R2
================================================================================
 Chaque version publiee depose environ 240 Mo pour Windows (trois installateurs
 d'a peu pres 80 Mo). Les anciennes versions macOS pesent bien davantage : un
 .dmg ET un .zip par architecture, soit pres de 400 Mo par version. A raison de
 plusieurs publications par jour, le bucket se remplit tres vite — 3,71 Go sur
 10 Go constates le 2026-08-06.

 ⚠ ON NE COMPRESSE PAS DAVANTAGE : electron-builder empaquete deja en LZMA, et
 l'essentiel du poids est le moteur Electron lui-meme. Le seul vrai levier est
 de NE PAS GARDER toutes les versions.

 CE QU'IL GARDE
   - LA DERNIERE VERSION, et rien d'autre (-Garder 1 par defaut, sur demande
     explicite de l'utilisateur le 2026-08-06 : << ne garde jamais les anciennes
     versions >>).
     ⚠ Consequence a assumer : plus de paquet de retour arriere dans R2. Si une
     version se revele mauvaise, on rebatit la precedente depuis git — la source
     est la, c'est deux minutes. Ce qu'on ne peut PAS faire, c'est la
     retelecharger.
   - TOUJOURS les fiches Windows `latest*.yml` et `latest.json` : les effacer
     couperait la mise a jour de tous les postes.

 ⚠ CECI N'AFFECTE PAS LES MISES A JOUR DIFFERENTIELLES. electron-updater
 telecharge le `.blockmap` de la NOUVELLE version et le compare au paquet deja
 present DANS SON CACHE LOCAL, sur le poste — pas dans R2. Supprimer les
 anciennes versions du bucket ne l'empeche donc pas de ne recuperer que les
 blocs modifies.

 ⚠ MARCHE A BLANC PAR DEFAUT. Une suppression dans R2 est irreversible : aucune
 corbeille, aucun versionnage. On regarde la liste, puis on relance avec
 -Appliquer.

     pwsh -File tools\menage.ps1                    # dit ce qu'il supprimerait
     pwsh -File tools\menage.ps1 -Appliquer         # supprime
     pwsh -File tools\menage.ps1 -Garder 1 -Appliquer
     pwsh -File tools\menage.ps1 -SansMac:$false    # garder aussi les paquets mac
================================================================================
#>
[CmdletBinding()]
param(
  [int]$Garder = 1,
  [switch]$Appliquer,
  # Les paquets macOS ne sont plus construits (aucun Mac en service, et la mise
  # a jour automatique y est impossible sans signature Apple) : ils ne servent
  # a rien et occupent le plus de place. On les retire par defaut.
  [bool]$SansMac = $true
)

$ErrorActionPreference = 'Stop'
function Bon($t) { Write-Host "  OK   $t" -ForegroundColor Green }
function Mauvais($t) { Write-Host "  ECHEC $t" -ForegroundColor Red; exit 1 }

foreach ($v in 'R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_ENDPOINT','R2_BUCKET') {
  if (-not [Environment]::GetEnvironmentVariable($v)) {
    # Un processus herite l'environnement de son parent : une variable posee
    # apres l'ouverture du terminal n'y est pas visible. On relit la source.
    $reg = Get-ItemProperty -Path 'HKCU:\Environment' -ErrorAction SilentlyContinue
    if ($reg.$v) { Set-Item -Path "Env:$v" -Value $reg.$v }
    else { Mauvais "variable $v absente (voir l'en-tete de publier.ps1)" }
  }
}

# ── Signature SigV4, methode quelconque ─────────────────────────────────────
function Hmac([byte[]]$cle, [string]$msg) {
  $h = New-Object System.Security.Cryptography.HMACSHA256; $h.Key = $cle
  return $h.ComputeHash([Text.Encoding]::UTF8.GetBytes($msg))
}
function Hex([byte[]]$o) { -join ($o | ForEach-Object { $_.ToString('x2') }) }
$VIDE = Hex ([Security.Cryptography.SHA256]::Create().ComputeHash([byte[]]@()))

function Appel-R2 {
  param([string]$Methode, [string]$Cle = '', [hashtable]$Requete = @{})

  $endpoint = $env:R2_ENDPOINT.TrimEnd('/')
  $hote = ([Uri]$endpoint).Host
  $chemin = '/' + $env:R2_BUCKET + $(if ($Cle) { '/' + (($Cle -split '/' | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/') } else { '/' })

  # La chaine de requete canonique doit etre triee par nom de parametre.
  $qs = ''
  if ($Requete.Count) {
    $qs = (($Requete.GetEnumerator() | Sort-Object Name | ForEach-Object {
      [Uri]::EscapeDataString($_.Name) + '=' + [Uri]::EscapeDataString([string]$_.Value)
    }) -join '&')
  }

  $now = [DateTime]::UtcNow
  $amzDate = $now.ToString('yyyyMMddTHHmmssZ'); $jour = $now.ToString('yyyyMMdd')
  $portee = "$jour/auto/s3/aws4_request"

  $canon = @($Methode, $chemin, $qs, "host:$hote", "x-amz-content-sha256:$VIDE",
             "x-amz-date:$amzDate", '', 'host;x-amz-content-sha256;x-amz-date', $VIDE) -join "`n"
  $shaCanon = Hex ([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($canon)))
  $aSigner = @('AWS4-HMAC-SHA256', $amzDate, $portee, $shaCanon) -join "`n"

  $k = Hmac ([Text.Encoding]::UTF8.GetBytes('AWS4' + $env:R2_SECRET_ACCESS_KEY)) $jour
  $k = Hmac $k 'auto'; $k = Hmac $k 's3'; $k = Hmac $k 'aws4_request'
  $sig = Hex (Hmac $k $aSigner)

  $auth = "AWS4-HMAC-SHA256 Credential=$($env:R2_ACCESS_KEY_ID)/$portee, " +
          "SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=$sig"

  # ⚠ -SkipHeaderValidation : .NET refuse la forme AWS de l'en-tete Authorization.
  return Invoke-WebRequest -Method $Methode -Uri ($endpoint + $chemin + $(if ($qs) { '?' + $qs })) `
    -SkipHttpErrorCheck -SkipHeaderValidation -TimeoutSec 120 -Headers @{
      'Authorization' = $auth; 'x-amz-date' = $amzDate
      'x-amz-content-sha256' = $VIDE; 'Host' = $hote
    }
}

# ── 1. Inventaire ───────────────────────────────────────────────────────────
Write-Host "`n=== Inventaire de desktop/" -ForegroundColor Cyan
$objets = @(); $suite = ''
do {
  $q = @{ 'list-type' = '2'; 'prefix' = 'desktop/'; 'max-keys' = '1000' }
  if ($suite) { $q['continuation-token'] = $suite }
  $r = Appel-R2 -Methode 'GET' -Requete $q
  if ($r.StatusCode -ne 200) { Write-Host $r.Content -ForegroundColor DarkGray; Mauvais "listage (HTTP $($r.StatusCode))" }
  $x = [xml]$r.Content
  foreach ($c in $x.ListBucketResult.Contents) {
    $objets += [pscustomobject]@{ Cle = $c.Key; Taille = [int64]$c.Size }
  }
  $suite = $x.ListBucketResult.NextContinuationToken
} while ($suite)

$total = ($objets | Measure-Object Taille -Sum).Sum
Bon ("{0} objets, {1:N2} Go" -f $objets.Count, ($total / 1GB))

# ── 2. Quelles versions garder ──────────────────────────────────────────────
# La version se lit dans le NOM du fichier (SANDRIZA-Admin-Setup-0.8.0-x64.exe).
$versions = $objets | ForEach-Object {
  if ($_.Cle -match '-(\d+\.\d+\.\d+)-') { $Matches[1] }
} | Select-Object -Unique | Sort-Object { [version]$_ } -Descending

if (-not $versions) { Bon 'aucune version reperee — rien a faire'; exit 0 }
$aGarder = $versions | Select-Object -First $Garder
Write-Host "  versions presentes : $($versions -join ', ')"
Write-Host "  conservees         : $($aGarder -join ', ')" -ForegroundColor Green

# ── 3. Ce qu'on supprime ────────────────────────────────────────────────────
$supprimer = @()
foreach ($o in $objets) {
  $nom = Split-Path $o.Cle -Leaf
  $estMac = $o.Cle -like 'desktop/mac/*'

  # ⚠ LA FICHE macOS PART AVEC SES PAQUETS, et c'est important.
  # `latest-mac.yml` annonce encore des paquets 0.6.0 ; les supprimer en la
  # laissant en place ferait pointer le flux vers des fichiers absents — une
  # mise a jour qui echoue en 404 est PIRE qu'un flux qui n'existe pas, parce
  # qu'elle laisse croire qu'une version est disponible. Sans paquet mac, pas
  # de flux mac.
  if ($SansMac -and $estMac) {
    $supprimer += [pscustomobject]@{ Cle = $o.Cle; Taille = $o.Taille; Raison = 'macOS (plus construit)' }
    continue
  }

  # ⚠ INTOUCHABLES : les fiches que lit electron-updater pour Windows. Les
  # effacer couperait la mise a jour de TOUS les postes — l'inverse exact du
  # but recherche.
  if ($nom -match '\.(yml|yaml|json)$') { continue }
  $ver = if ($nom -match '-(\d+\.\d+\.\d+)-') { $Matches[1] } else { $null }

  if ($ver -and ($aGarder -notcontains $ver)) {
    $supprimer += [pscustomobject]@{ Cle = $o.Cle; Taille = $o.Taille; Raison = "version $ver, plus conservee" }
  }
}

if (-not $supprimer.Count) { Bon 'rien a supprimer'; exit 0 }
$poids = ($supprimer | Measure-Object Taille -Sum).Sum
Write-Host "`n=== $($supprimer.Count) objet(s) a supprimer — $([math]::Round($poids/1GB,2)) Go liberes" -ForegroundColor Yellow
$supprimer | Sort-Object Taille -Descending | ForEach-Object {
  "  {0,8:N0} Mo  {1}   ({2})" -f ($_.Taille/1MB), $_.Cle, $_.Raison
}

if (-not $Appliquer) {
  Write-Host "`nMARCHE A BLANC — rien n'a ete supprime. Relancez avec -Appliquer." -ForegroundColor Yellow
  exit 0
}

# ── 4. Suppression ──────────────────────────────────────────────────────────
Write-Host "`n=== Suppression" -ForegroundColor Cyan
$n = 0
foreach ($s in $supprimer) {
  $r = Appel-R2 -Methode 'DELETE' -Cle $s.Cle
  if ($r.StatusCode -ne 204 -and $r.StatusCode -ne 200) {
    Write-Host "  echec $($s.Cle) (HTTP $($r.StatusCode))" -ForegroundColor Red
  } else { $n++ }
}
Bon "$n objet(s) supprime(s), $([math]::Round($poids/1GB,2)) Go liberes"
Write-Host "Reste : $([math]::Round(($total - $poids)/1GB,2)) Go dans desktop/" -ForegroundColor Green
