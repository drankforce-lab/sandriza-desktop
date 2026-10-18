<#
  logo.ps1 — BASCULE L'ICÔNE DE L'APPLICATION (exe, barre des tâches, raccourcis, installateur, zone de notification).
  (2026-10-18, sa demande : « applique le nouveau logo… mais fais-moi un backup et un retour en arrière possible »)

    pwsh -File tools/logo.ps1 -Jeu ancien     # l'ancienne icône (« S » doré sur marine)
    pwsh -File tools/logo.ps1 -Jeu nouveau    # la nouvelle (monogramme « Sz » crème et caramel sur noir)

  Copie build/marque/<jeu>/icon.png sur build/icon.png ET src/icone-veilleur.png (les deux sont la même image),
  puis : commit, push, livrer (l'icône est cuite dans l'exe : elle n'arrive qu'avec une nouvelle version).
  Le site et les six logos ont leurs propres bascules : Sandriza/tools/marque/logo.ps1 et Logos et marque › Jeu de logos.
  Filet ultime : l'étiquette git `logo-ancien-2026-10-18`.
#>
param([Parameter(Mandatory = $true)][ValidateSet('ancien', 'nouveau')][string]$Jeu)
$ErrorActionPreference = 'Stop'
$R = Resolve-Path (Join-Path $PSScriptRoot '..')
$src = Join-Path $R "build\marque\$Jeu\icon.png"
if (-not (Test-Path $src)) { throw "Fichier absent : $src" }
foreach ($c in 'build\icon.png', 'src\icone-veilleur.png') { Copy-Item $src (Join-Path $R $c) -Force; Write-Host "  OK  $c" }
Write-Host ''
Write-Host "Icône du jeu « $Jeu » en place. Reste à : committer, pousser, puis livrer une version (tools/livrer.ps1)."
