'use strict';

/*
 * LA FENÊTRE QUI SUIT LA COPIE DES FICHIERS PENDANT L'INSTALLATION (2026-11-28)
 * =============================================================================
 * Sa demande : « un suivi des fichiers en copie pendant l'installation », et son choix : « une petite fenêtre Sandriza »,
 * indépendante de l'application.
 *
 * ⚠ ELLE NE PEUT PAS ÊTRE UNE FENÊTRE ELECTRON : l'installateur ferme l'application et REMPLACE ses fichiers — Electron
 * compris. Elle est donc un script PowerShell (présent sur tout Windows) qui dessine une fenêtre WinForms : fond nuit,
 * or Sandriza, un rond qui tourne, le fichier en cours et le compte. Elle observe le dossier d'installation
 * (FileSystemWatcher), et se ferme seule :
 *   · quand la NOUVELLE application a démarré et que la copie est calme depuis 2 s ;
 *   · au bout de 6 minutes, quoi qu'il arrive (jamais une fenêtre orpheline) ;
 *   · si rien n'a bougé en 2 minutes : elle le dit (l'autorisation Windows a peut-être été refusée), puis se ferme.
 * ⚠ AUCUN ACCENT GRAVE dans le script ci-dessous : c'est le caractère d'échappement de PowerShell.
 * ⚠ Le fichier est écrit en UTF-8 AVEC BOM par main.js : sans BOM, PowerShell 5 lit les accents de travers.
 */

function script() {
  return String.raw`param([string]$Dossier, [string]$Exe, [string]$Version = '', [string]$Langue = 'fr', [int]$PidAncien = 0)
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$en = ($Langue -eq 'en')
function L($fr, $an) { if ($en) { return $an } else { return $fr } }

$nuit = [System.Drawing.Color]::FromArgb(17, 21, 29)
$carte = [System.Drawing.Color]::FromArgb(21, 26, 36)
$or = [System.Drawing.Color]::FromArgb(201, 165, 126)
$gris = [System.Drawing.Color]::FromArgb(154, 164, 181)
$blanc = [System.Drawing.Color]::FromArgb(232, 236, 242)

$f = New-Object System.Windows.Forms.Form
$f.Text = 'Sandriza'
$f.FormBorderStyle = 'None'
$f.StartPosition = 'CenterScreen'
$f.ClientSize = New-Object System.Drawing.Size(460, 236)
$f.BackColor = $carte
$f.TopMost = $true
$f.ShowInTaskbar = $true

$bord = New-Object System.Windows.Forms.Panel
$bord.Dock = 'Top'; $bord.Height = 3; $bord.BackColor = $or
$f.Controls.Add($bord)

$marque = New-Object System.Windows.Forms.Label
$marque.Text = 'SANDRIZA'; $marque.ForeColor = $or; $marque.AutoSize = $true
$marque.Font = New-Object System.Drawing.Font('Georgia', 15, [System.Drawing.FontStyle]::Regular)
$marque.Location = New-Object System.Drawing.Point(104, 30)
$f.Controls.Add($marque)

$titre = New-Object System.Windows.Forms.Label
$titre.Text = (L 'Installation de la mise à jour' 'Installing the update') + $(if ($Version) { ' ' + $Version } else { '' })
$titre.ForeColor = $blanc; $titre.AutoSize = $true
$titre.Font = New-Object System.Drawing.Font('Segoe UI Semibold', 11)
$titre.Location = New-Object System.Drawing.Point(104, 62)
$f.Controls.Add($titre)

$etat = New-Object System.Windows.Forms.Label
$etat.Text = L "En attente de l’installateur…" 'Waiting for the installer…'
$etat.ForeColor = $gris; $etat.AutoSize = $false
$etat.Size = New-Object System.Drawing.Size(330, 20)
$etat.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$etat.Location = New-Object System.Drawing.Point(104, 92)
$f.Controls.Add($etat)

$fichier = New-Object System.Windows.Forms.Label
$fichier.Text = ''
$fichier.ForeColor = $gris; $fichier.AutoSize = $false; $fichier.AutoEllipsis = $true
$fichier.Size = New-Object System.Drawing.Size(410, 20)
$fichier.Font = New-Object System.Drawing.Font('Consolas', 8.5)
$fichier.Location = New-Object System.Drawing.Point(26, 150)
$f.Controls.Add($fichier)

$compte = New-Object System.Windows.Forms.Label
$compte.Text = ''
$compte.ForeColor = $blanc; $compte.AutoSize = $true
$compte.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$compte.Location = New-Object System.Drawing.Point(26, 180)
$f.Controls.Add($compte)

$note = New-Object System.Windows.Forms.Label
$note.Text = L "Ne fermez pas l’ordinateur. L’application redémarre toute seule." 'Do not shut down. The application restarts by itself.'
$note.ForeColor = $gris; $note.AutoSize = $true
$note.Font = New-Object System.Drawing.Font('Segoe UI', 8)
$note.Location = New-Object System.Drawing.Point(26, 204)
$f.Controls.Add($note)

# Le rond : un arc dore qui tourne, dessine a la main (un PictureBox repeint 25 fois par seconde).
$rond = New-Object System.Windows.Forms.PictureBox
$rond.Size = New-Object System.Drawing.Size(52, 52)
$rond.Location = New-Object System.Drawing.Point(30, 34)
$rond.BackColor = $carte
$script:angle = 0
$script:fini = $false
$rond.Add_Paint({
  param($s, $e)
  $g = $e.Graphics
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $fond = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 201, 165, 126), 4)
  $g.DrawEllipse($fond, 4, 4, 44, 44)
  $p = New-Object System.Drawing.Pen($or, 4)
  $p.StartCap = 'Round'; $p.EndCap = 'Round'
  if ($script:fini) { $g.DrawEllipse($p, 4, 4, 44, 44) } else { $g.DrawArc($p, 4, 4, 44, 44, $script:angle, 100) }
})
$f.Controls.Add($rond)

# Le suivi du dossier : chaque fichier cree, ecrit ou renomme par l'installateur.
$script:vus = New-Object 'System.Collections.Generic.HashSet[string]'
$script:dernier = [DateTime]::MinValue
$debut = Get-Date
$w = New-Object System.IO.FileSystemWatcher
$w.Path = $Dossier
$w.IncludeSubdirectories = $true
$w.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, DirectoryName'
$w.SynchronizingObject = $f
$quandFichier = {
  param($s, $e)
  $rel = $e.FullPath.Substring([Math]::Min($e.FullPath.Length, $Dossier.Length)).TrimStart('\')
  [void]$script:vus.Add($rel)
  $script:dernier = Get-Date
  $fichier.Text = $rel
  $etat.Text = L 'Copie des fichiers…' 'Copying files…'
  $compte.Text = ($script:vus.Count.ToString() + (L ' fichiers copiés' ' files copied'))
}
$w.Add_Created($quandFichier)
$w.Add_Changed($quandFichier)
$w.Add_Renamed($quandFichier)
$w.EnableRaisingEvents = $true

$t = New-Object System.Windows.Forms.Timer
$t.Interval = 40
$script:tic = 0
$t.Add_Tick({
  $script:angle = ($script:angle + 9) % 360
  $rond.Invalidate()
  $script:tic++
  if ($script:tic % 25 -ne 0) { return }
  $maintenant = Get-Date
  $ecoule = ($maintenant - $debut).TotalSeconds
  # la nouvelle application a demarre, et la copie est calme : c'est fini
  $neuve = Get-Process -Name $Exe -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PidAncien -and $_.StartTime -gt $debut }
  $calme = ($script:dernier -ne [DateTime]::MinValue) -and (($maintenant - $script:dernier).TotalSeconds -ge 2)
  if ($neuve -and ($calme -or $script:vus.Count -eq 0) -and -not $script:fini) {
    $script:fini = $true
    $etat.Text = L "Installation terminée — l’application redémarre." 'Installation complete — the application is restarting.'
    $fichier.Text = ''
    $script:fermerA = $maintenant.AddSeconds(2)
  }
  if ($script:fini -and $script:fermerA -and $maintenant -gt $script:fermerA) { $f.Close() }
  if (-not $script:fini -and $script:vus.Count -eq 0 -and $ecoule -gt 120) {
    $script:fini = $true
    $etat.Text = L "L’installateur n’a pas démarré (autorisation Windows refusée ?)." 'The installer did not start (Windows permission declined?).'
    $script:fermerA = $maintenant.AddSeconds(8)
  }
  if ($ecoule -gt 360) { $f.Close() }
})
$t.Start()
[void]$f.ShowDialog()
$w.EnableRaisingEvents = $false
`;
}

module.exports = { script };
