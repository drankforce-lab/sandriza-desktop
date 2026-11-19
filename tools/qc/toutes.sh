#!/bin/bash
# CONTRÔLE VISUEL (2026-11-19) : photographie chaque fenêtre (Épuré nuit, 1160x780 = taille ancrée), un seul Chrome à la fois.
# Usage : bash tools/qc/toutes.sh <dossier> ; puis python tools/qc/planche.py <dossier>/qc 6 → planches de 6 à REGARDER une à une.
# Les bancs mesurent ; une planche MONTRE ce qu’aucun banc ne cherche (texte qui chevauche, vignette qui déborde).
# Capture chaque fenêtre ayant un jeu de réponses, Épuré nuit, 1160x780, une à la fois.
S="$1"; cd /c/temp/sandriza-desktop
for f in $(node -e "console.log(Object.keys(require('./tools/reponses-fenetres.js')).map(k=>k.replace(/\.js$/,'')).join(' '))"); do
  [ -s "$S/qc/$f.png" ] && continue
  timeout 120 node tools/capture-fenetre.js "$f" --l 1160 --h 780 --js 'document.documentElement.setAttribute("data-sz-theme","epure");document.documentElement.setAttribute("data-sz-teinte","epure");' --sortie "$S/qc/$f.png" >/dev/null 2>&1 || echo "RATE $f"
done
echo FINI
