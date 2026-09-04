#!/usr/bin/env node
'use strict';

/*
 * VOIR UNE FENETRE NATIVE POUR DE VRAI — image et mesures.
 * =============================================================================
 * POURQUOI CET OUTIL EXISTE. Le 2026-09-04, quatre corrections de suite ont rate
 * la meme panne — une bande d en-tete invisible en mode sombre — parce que je
 * RAISONNAIS sur le CSS au lieu de le faire calculer. La reponse est venue en
 * une seconde le jour ou un vrai moteur de rendu a dit que le jeton valait VIDE.
 *
 * ⚠ CE N EST PAS UN BANC, ET IL NE TOURNE PAS DANS LA CONSTRUCTION. Il demande
 * un moteur de rendu de 180 Mo, qu on ne met pas dans les dependances d une
 * application Electron. Il s installe A COTE, une fois :
 *
 *     mkdir rendu && cd rendu && npm init -y && npm i puppeteer
 *     npx puppeteer browsers install chrome-headless-shell
 *     node <chemin>/tools/voir-fenetre.js accueil nuit
 *
 * ⚠ DEUX PIEGES, TROUVES A L USAGE, QUI FONT CONCLURE A TORT :
 *
 * 1. Le moteur sans tete annonce `prefers-reduced-motion: reduce` PAR DEFAUT. On
 *    mesure alors la variante SANS animation en croyant regarder la normale, et
 *    on conclut que les degrades ne s appliquent pas. D ou emulateMediaFeatures.
 * 2. Le script de la fenetre efface le squelette de chargement avant meme la fin
 *    du chargement, faute de pont. Pour juger le CSS d attente, il faut rendre la
 *    page SANS ses scripts (--sansjs).
 *
 *   node tools/voir-fenetre.js <fenetre> [jour|nuit] [ms] [--sansjs] [--table] [--calme]
 */

const fs = require('fs');
const path = require('path');

/* ⚠ On cherche le moteur AUSSI depuis le dossier courant. `require` resout
   depuis le dossier de CE fichier en remontant : une installation faite a cote,
   dans un dossier de travail, lui reste invisible — et c'est justement la ou on
   l'installe, pour ne pas alourdir les dependances de l'application. */
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e0) {
  try { puppeteer = require(path.join(process.cwd(), 'node_modules', 'puppeteer')); } catch (e1) {}
}
try {
  if (!puppeteer) throw new Error('absent');
} catch (e) {
  console.log('Le moteur de rendu n est pas installe ici. Voir l en-tete de ce fichier :');
  console.log('  mkdir rendu && cd rendu && npm init -y && npm i puppeteer');
  console.log('  npx puppeteer browsers install chrome-headless-shell');
  process.exit(2);
}

const FEN = process.argv[2] || 'accueil';
const MODE = process.argv[3] === 'jour' ? 'jour' : 'nuit';
const ATTENTE = parseInt(process.argv[4], 10) || 700;
const a = (n) => process.argv.indexOf(n) >= 0;

const DOS = path.join(__dirname, '..', 'src', 'fenetres');
const mod = require(path.join(DOS, FEN + '.js'));
const fabrique = Object.values(mod).find((v) => typeof v === 'function');
if (!fabrique) { console.log(FEN + '.js n expose aucune fabrique de page.'); process.exit(1); }

let page = String(fabrique(''));
if (MODE === 'jour') page = page.replace(/<html/i, '<html class="jour"');
if (a('--sansjs')) page = page.replace(/<script[\s\S]*?<\/script>/gi, '');

const sortie = process.env.SZ_SORTIE || process.cwd();
const fichier = path.join(sortie, 'page-' + FEN + '-' + MODE + '.html');
fs.writeFileSync(fichier, page);

(async () => {
  const nav = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox', '--disable-gpu'] });
  const p = await nav.newPage();
  await p.setViewport({ width: 1100, height: 720, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: a('--calme') ? 'reduce' : 'no-preference' },
  ]);
  const bruits = [];
  p.on('pageerror', (e) => bruits.push('ERREUR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') bruits.push('CONSOLE ' + m.text().slice(0, 140)); });

  await p.goto('file:///' + fichier.split(path.sep).join('/'), { waitUntil: 'load' });

  if (a('--table')) {
    await p.evaluate(() => {
      const d = document.createElement('div');
      d.style.padding = '14px';
      d.innerHTML = '<table style="width:100%;border-collapse:collapse">'
        + '<thead><tr><th>Commande</th><th>Client</th><th>Total</th><th>Etat</th></tr></thead>'
        + '<tbody><tr><td>SZ-1042</td><td>Marie Tremblay</td><td>184,50 $</td>'
        + '<td><span class="pill bon">Payee</span></td></tr>'
        + '<tr><td>SZ-1043</td><td>Julie Gagnon</td><td>92,00 $</td>'
        + '<td><span class="pill att">A traiter</span></td></tr></tbody></table>'
        + '<div class="vide m-droit">Votre role ne donne pas acces a cette operation.</div>';
      const c = document.getElementById('corps') || document.body;
      c.innerHTML = '';
      c.appendChild(d);
    });
  }
  await new Promise((r) => setTimeout(r, ATTENTE));

  const png = path.join(sortie, FEN + '-' + MODE + '.png');
  await p.screenshot({ path: png });

  const mesures = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const th = document.querySelector('thead th');
    const sq = document.querySelector('.sz-squel');
    const barre = sq && sq.querySelector('i');
    return {
      fondPage: getComputedStyle(document.body).backgroundColor,
      texte: getComputedStyle(document.body).color,
      accent: cs.getPropertyValue('--sz-accent').trim(),
      fEntete: cs.getPropertyValue('--f-entete').trim(),
      bandeEntete: th ? getComputedStyle(th).backgroundColor : '(aucun th — essayer --table)',
      squelette: sq ? sq.className + ' / ' + sq.children.length + ' barres' : '(absent — essayer --sansjs)',
      lueur: barre ? getComputedStyle(barre).animationName : '-',
    };
  });
  await nav.close();

  console.log(JSON.stringify(mesures, null, 2));
  if (bruits.length) console.log('--- ' + bruits.length + ' bruit(s) de page ---\n' + bruits.slice(0, 5).join('\n'));
  console.log('image : ' + png);
})();
