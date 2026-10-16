#!/usr/bin/env node
/* ============================================================================
   banc-champs.js — AUCUN CHAMP DÉFORMÉ, AUCUN ESPACEMENT COLLÉ (2026-10-16)
   ----------------------------------------------------------------------------
   Sa demande du 2026-10-16 : « audite aussi tes espacements et vérifie
   qu'aucun champ ne se retrouve déformé, ou pourrait l'être par un manque de
   contrôle de champs ; fais des bancs de rendu et de test ».
   Le montage est celui de audit-boutons.js (faux pont, jeux de réponses et
   leurs emprunts, un seul Chrome sans tête à profil jetable) ; le cœur est
   champs-coeur.js : la page AU REPOS, puis SOUS CHARGE (chaque saisie reçoit
   la valeur la plus longue qu'elle accepte). Les sortes de défauts sont
   décrites en tête de champs-coeur.js.
   ── USAGE ──────────────────────────────────────────────────────────────────
     node tools/banc-champs.js                  # tout ; échoue sur un défaut hors dette
     node tools/banc-champs.js caisse depenses  # quelques fenêtres
     node tools/banc-champs.js --dette          # réécrit la dette (à la main, sciemment)
   Rapport : tools/champs-rapport.json (non versionné) ; dette : tools/champs-dette.json.
   ============================================================================ */
'use strict';
process.argv.push('--champs');
require('./audit-boutons.js');
