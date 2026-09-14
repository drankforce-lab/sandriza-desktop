<#
================================================================================
 LIVRER UNE VERSION — UN SEUL GESTE, DE LA VERIFICATION AU DEPOT DANS R2
================================================================================
 pwsh -File tools\livrer.ps1 -Version 5.67.0

 POURQUOI CE SCRIPT EXISTE — DEUX PANNES QUI SE REPETENT
 ----------------------------------------------------------------------------
 La livraison passe par DEUX travaux, dans DEUX depots differents :

   1. << Construire >>                  depot PUBLIC  (sandriza-desktop)
   2. << Publier l'application ... >>   depot PRIVE   (Sandriza)

 ⚠⚠ LE SECOND A ETE OUBLIE SEPT FOIS. Une construction verte ressemble a une
 livraison finie : les paquets existent, le travail dit << success >>, et rien
 a l'ecran ne rappelle qu'ils ne sont ALLES NULLE PART. Le depot dans R2 est un
 autre geste, dans un autre depot, avec un autre nom.

 ⚠⚠ ET LE VERDICT DE << Construire >> A ETE LU DE TRAVERS. Le 2026-09-14 on a
 decouvert que le travail `contrastes` etait ROUGE depuis deux jours et que
 CINQ versions (5.60.0 -> 5.64.0) etaient parties par-dessus. Deux raisons :
   . `verifier.ps1 -SansRendu` ne regarde pas ce terrain — il le DIT, et la
     seule mesure est ce travail-la, sur GitHub, ou personne ne va voir ;
   . `gh run watch --exit-status | tail` rend le code de `tail`, pas le sien.
     On lisait << 0 >> sur une construction en echec.

 ➡ CE SCRIPT REFUSE DE PUBLIER SI UN SEUL TRAVAIL DE LA CONSTRUCTION A ECHOUE,
   et il NOMME lequel. Il ne lit jamais un code de sortie a travers un tube.

 CE QU'IL ENCHAINE
 ----------------------------------------------------------------------------
   0. la version demandee == celle de package.json  (le palier oublie)
   1. les deux depots sont propres, et la tete distante == la tete locale
   2. les 39 bancs (depot de l'application)
   3. verifier.ps1 (depot du site)            -SansRendu si demande
   4. << Construire >>, puis LECTURE DE CHAQUE TRAVAIL
   5. << Publier >>, puis confirmation du manifeste
   6. verifier.ps1 -EnLigne                   (sauf -SansEnLigne)

 OPTIONS
   -SansRendu     passe -SansRendu au verifier (Chrome en rafale sur ce poste)
   -SansControles saute les etapes 2 et 3 (elles viennent d'etre lancees)
   -SansEnLigne   saute le controle de production a la fin
   -Site <chemin> ou se trouve le depot du site (defaut : ..\Sandriza)

 ⚠ IL NE POUSSE RIEN ET NE COMMET RIEN. Livrer n'est pas committer : si un
 depot n'est pas a jour, il s'arrete et le dit. Decider quoi pousser reste un
 geste humain.
================================================================================
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [switch]$SansRendu,
  [switch]$SansControles,
  [switch]$SansEnLigne,
  [string]$Site
)

$ErrorActionPreference = 'Stop'
$racine = Split-Path -Parent $PSScriptRoot
if (-not $Site) { $Site = Join-Path (Split-Path -Parent $racine) 'Sandriza' }

function Etape($t)   { Write-Host "`n=== $t" -ForegroundColor Cyan }
function Bon($t)     { Write-Host "  OK    $t" -ForegroundColor Green }
function Note($t)    { Write-Host "  --    $t" -ForegroundColor DarkGray }
function Mauvais($t) { Write-Host "  ECHEC $t" -ForegroundColor Red; exit 1 }

if ($Version -notmatch '^\d+\.\d+\.\d+$') { Mauvais "-Version doit etre X.Y.Z (recu : $Version)" }
if (-not (Test-Path $Site)) { Mauvais "depot du site introuvable : $Site  (passer -Site <chemin>)" }

# Le slug vient du remote, jamais ecrit en dur : un depot renomme ne doit pas
# faire publier ailleurs en silence.
function Slug($chemin) {
  $url = (& git -C $chemin remote get-url origin) 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $url) { Mauvais "pas de remote << origin >> dans $chemin" }
  if ($url -notmatch '[:/]([^/:]+/[^/]+?)(\.git)?$') { Mauvais "remote illisible : $url" }
  return $Matches[1]
}
$slugApp  = Slug $racine
$slugSite = Slug $Site

# ── 0. LE PALIER DE VERSION ─────────────────────────────────────────────────
# ⚠ C'est l'oubli le plus banal : on lance la construction avec le numero
# suivant, et package.json porte encore le precedent. Le travail le refuse deja
# ("Verifier la version"), mais huit minutes plus tard. Ici, tout de suite.
Etape "0. Le palier de version"
$pkg = Get-Content (Join-Path $racine 'package.json') -Raw | ConvertFrom-Json
if ($pkg.version -ne $Version) {
  Mauvais "package.json porte $($pkg.version), pas $Version. Bumper AVANT de livrer (avec Edit, pas a la main dans un tube)."
}
Bon "package.json porte bien $Version"

# ── 1. LES DEUX DEPOTS SONT PROPRES ET POUSSES ──────────────────────────────
# ⚠ Construire lit la BRANCHE DISTANTE. Un commit oublie sur le poste donne une
# construction de l'etat PRECEDENT, verte, et qui ne contient pas le correctif.
Etape "1. Les deux depots"
foreach ($d in @(@{n='application'; p=$racine; s=$slugApp}, @{n='site'; p=$Site; s=$slugSite})) {
  $sale = (& git -C $d.p status --porcelain)
  if ($LASTEXITCODE -ne 0) { Mauvais "git status a echoue dans $($d.p)" }
  if ($sale) { Mauvais "$($d.n) : des modifications ne sont pas commitees.`n$sale" }

  $local = (& git -C $d.p rev-parse HEAD).Trim()
  $brut  = (& git -C $d.p ls-remote origin -h refs/heads/main)
  if ($LASTEXITCODE -ne 0 -or -not $brut) { Mauvais "$($d.n) : tete distante illisible" }
  $distant = ($brut -split '\s+')[0]
  if ($local -ne $distant) {
    Mauvais "$($d.n) : la tete distante ($($distant.Substring(0,8))) n'est PAS la tete locale ($($local.Substring(0,8))). Pousser d'abord."
  }
  Bon "$($d.n) : propre, et pousse ($($local.Substring(0,8)))"
}

# ── 2 et 3. LES CONTROLES ───────────────────────────────────────────────────
if ($SansControles) {
  Note "etapes 2 et 3 sautees (-SansControles) : les bancs et le verifier n'ont PAS ete relances"
} else {
  Etape "2. Les bancs de l'application"
  & node (Join-Path $racine 'tools\bancs.js')
  if ($LASTEXITCODE -ne 0) { Mauvais "un banc refuse — rien n'est livre" }
  Bon "les bancs passent"

  Etape "3. Le controle avant deploiement (site)"
  $args3 = @('-File', (Join-Path $Site 'tools\check\verifier.ps1'))
  if ($SansRendu) { $args3 += '-SansRendu' }
  & pwsh @args3
  if ($LASTEXITCODE -ne 0) { Mauvais "verifier.ps1 refuse — rien n'est livre" }
  Bon "le controle avant deploiement passe"
  if ($SansRendu) { Note "-SansRendu : les contrastes au rendu n'ont PAS ete mesures ici. C'est l'etape 4 qui les lira." }
}

# ── 4. CONSTRUIRE, PUIS LIRE CHAQUE TRAVAIL ─────────────────────────────────
Etape "4. Construire (depot public $slugApp)"

# ⚠ `gh workflow run` ne rend PAS le numero d'execution. On note l'instant du
# declenchement, puis on cherche la premiere execution `workflow_dispatch` creee
# APRES. Prendre simplement << la plus recente >> attraperait celle d'avant si
# GitHub tarde a la creer.
$avant = (Get-Date).ToUniversalTime().AddSeconds(-5)
& gh workflow run 'Construire' --repo $slugApp --ref main -f version=$Version
if ($LASTEXITCODE -ne 0) { Mauvais "le declenchement de << Construire >> a echoue" }

$idConstruction = $null
foreach ($essai in 1..20) {
  Start-Sleep -Seconds 3
  $brut = (& gh run list --repo $slugApp --workflow 'Construire' --event workflow_dispatch --limit 5 --json databaseId,createdAt)
  if ($LASTEXITCODE -ne 0 -or -not $brut) { continue }
  $cands = $brut | ConvertFrom-Json | Where-Object { [datetime]::Parse($_.createdAt).ToUniversalTime() -ge $avant }
  if ($cands) { $idConstruction = ($cands | Sort-Object createdAt | Select-Object -First 1).databaseId; break }
}
if (-not $idConstruction) { Mauvais "execution de << Construire >> introuvable apres 60 s" }
Bon "construction $idConstruction lancee"
Note "suivi : https://github.com/$slugApp/actions/runs/$idConstruction"

# ⚠ SANS TUBE. `gh run watch --exit-status | tail` rend le code de `tail`.
& gh run watch $idConstruction --repo $slugApp --exit-status | Out-Null
$codeWatch = $LASTEXITCODE

# ⚠⚠ ET ON NE SE CONTENTE PAS DU VERDICT GLOBAL : on lit CHAQUE travail, parce
# que c'est un travail precis (`contrastes`) qui a ete rouge deux jours sans
# que personne l'ouvre.
$brut = (& gh run view $idConstruction --repo $slugApp --json conclusion,jobs)
if ($LASTEXITCODE -ne 0 -or -not $brut) { Mauvais "verdict de la construction illisible" }
$vue = $brut | ConvertFrom-Json

Write-Host ""
foreach ($j in $vue.jobs) {
  $c = if ($j.conclusion) { $j.conclusion } else { 'sans verdict' }
  switch ($c) {
    'success' { Bon    "$($j.name)" }
    'skipped' { Note   "$($j.name) : saute" }
    default   { Write-Host "  ROUGE $($j.name) : $c" -ForegroundColor Red }
  }
}

$rouges = @($vue.jobs | Where-Object { $_.conclusion -and $_.conclusion -notin @('success','skipped') })
if ($vue.conclusion -ne 'success' -or $rouges.Count -gt 0 -or $codeWatch -ne 0) {
  Write-Host ""
  if ($rouges | Where-Object { $_.name -eq 'contrastes' }) {
    Write-Host "  ⚠⚠ << contrastes >> EST ROUGE. C'est le SEUL endroit ou les couleurs de" -ForegroundColor Red
    Write-Host "     l'administration sont mesurees quand on pousse en -SansRendu." -ForegroundColor Red
    Write-Host "     Cinq versions sont deja parties par-dessus ce rouge." -ForegroundColor Red
  }
  Mauvais "la construction n'est pas entierement verte — RIEN N'EST PUBLIE."
}
Bon "construction entierement verte"

# ── 5. PUBLIER — L'ETAPE OUBLIEE SEPT FOIS ──────────────────────────────────
Etape "5. Publier (depot prive $slugSite)"
$avant2 = (Get-Date).ToUniversalTime().AddSeconds(-5)
& gh workflow run "Publier l'application de bureau" --repo $slugSite --ref main -f run_id=$idConstruction -f version=$Version
if ($LASTEXITCODE -ne 0) { Mauvais "le declenchement de << Publier >> a echoue — les paquets existent mais ne sont ALLES NULLE PART" }

$idPublication = $null
foreach ($essai in 1..20) {
  Start-Sleep -Seconds 3
  $brut = (& gh run list --repo $slugSite --workflow "Publier l'application de bureau" --event workflow_dispatch --limit 5 --json databaseId,createdAt)
  if ($LASTEXITCODE -ne 0 -or -not $brut) { continue }
  $cands = $brut | ConvertFrom-Json | Where-Object { [datetime]::Parse($_.createdAt).ToUniversalTime() -ge $avant2 }
  if ($cands) { $idPublication = ($cands | Sort-Object createdAt | Select-Object -First 1).databaseId; break }
}
if (-not $idPublication) { Mauvais "execution de << Publier >> introuvable — verifier a la main, les paquets sont construits" }
Bon "publication $idPublication lancee"

& gh run watch $idPublication --repo $slugSite --exit-status | Out-Null
$brut = (& gh run view $idPublication --repo $slugSite --json conclusion)
if ($LASTEXITCODE -ne 0 -or -not $brut) { Mauvais "verdict de la publication illisible" }
if (($brut | ConvertFrom-Json).conclusion -ne 'success') {
  Mauvais "la publication a echoue — les paquets sont construits mais PAS deposes dans R2."
}

# ⚠ CONSTRUIRE N'EST PAS PUBLIER, ET PUBLIER N'EST PAS DEPOSER : on lit le
# manifeste dans le journal plutot que de croire le verdict.
$journal = (& gh run view $idPublication --repo $slugSite --log) 2>$null
if ($journal -match '\{"version":"([0-9.]+)"') {
  if ($Matches[1] -ne $Version) { Mauvais "le manifeste annonce $($Matches[1]), pas $Version" }
  Bon "manifeste ecrit : version $Version"
} else {
  Note "manifeste introuvable dans le journal — a verifier a la main"
}

# ── 6. LA PRODUCTION ────────────────────────────────────────────────────────
if ($SansEnLigne) {
  Note "controle en ligne saute (-SansEnLigne)"
} else {
  Etape "6. La production"
  & pwsh -File (Join-Path $Site 'tools\check\verifier.ps1') -EnLigne
  if ($LASTEXITCODE -ne 0) { Mauvais "le site en ligne n'est pas conforme" }
  Bon "site en ligne conforme"
}

Write-Host ""
Write-Host "==== $Version LIVREE — construite, publiee, deposee dans R2 ====" -ForegroundColor Green
if ($SansControles) { Write-Host "     (bancs et verifier NON relances : -SansControles)" -ForegroundColor DarkYellow }
if ($SansEnLigne)   { Write-Host "     (production NON controlee : -SansEnLigne)" -ForegroundColor DarkYellow }
