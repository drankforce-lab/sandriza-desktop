'use strict';
/*
 * CAPTURE D'UNE FENÊTRE NATIVE, À L'ÉTAPE VOULUE (2026-10-20)
 * =============================================================================
 * Les bancs mesurent (débordement, contraste, champs) ; aucun ne MONTRE. Une carte
 * dont le tableau sort de son cadre, une liste de cases qui pousse « Repassage »
 * hors de l'écran : tout cela passait les bancs, et c'est elle qui l'a vu. Ce
 * fichier rend la fenêtre avec le même faux pont que les bancs (reponses-fenetres.js),
 * va à l'étape demandée, et en prend une capture PNG — pour REGARDER avant de livrer.
 *
 *   node tools/capture-fenetre.js <fenetre> [--etape N] [--jeu N] [--jour] [--l 1400] [--h 900]
 *                                 [--js "code à jouer avant la capture"] [--sortie f.png]
 *
 * Un seul Chrome sans tête, lancé une fois, qui se ferme tout seul.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const nom = args[0];
if (!nom || nom.startsWith('--')) { console.error('usage : node tools/capture-fenetre.js <fenetre> [--etape N] [--jour]'); process.exit(2); }

const GABARIT = fs.readFileSync(path.join(__dirname, 'banc-contraste-rendu-page.html'), 'utf8');
const PROLOGUE = GABARIT.split('<!-- ==== PROLOGUE ==== -->')[1].split('<!-- ==== ')[0].trim();
const REPONSES = require('./reponses-fenetres.js');
const mod = require(path.join(__dirname, '..', 'src', 'fenetres', nom + '.js'));
const fabrique = Object.values(mod).find((v) => typeof v === 'function');
const brut = REPONSES[nom + '.js'];
const nJeu = Number(opt('--jeu', 0));
const jeu = Array.isArray(brut) ? brut[Math.min(nJeu, brut.length - 1)] : { id: '', reponses: brut || {} };
const ops = Object.assign({ 'session:activite': { ok: true }, 'lots:etat': { ok: true, lots: [] } }, jeu.reponses || {});

let page = String(fabrique(jeu.id || ''));
// L'assistant vit dans la fermeture de la page : on le rend joignable pour aller à l'étape voulue
// sans remplir les étapes précédentes (leur garde refuserait le passage).
page = page.replace('var Assist = {', 'var Assist = window.Assist = {');
page = page.replace(/<head([^>]*)>/i, (m) => m + '\n' + PROLOGUE.replace('__REPONSES__', () => JSON.stringify(ops)));
const etape = opt('--etape', null);
const jour = args.includes('--jour');
const js = opt('--js', '');
const pilote = '<script>window.addEventListener("load",function(){setTimeout(function(){try{'
  + (jour ? 'document.documentElement.classList.add("jour");' : 'document.documentElement.classList.remove("jour");')
  + js
  + (etape != null ? 'if(window.Assist&&Assist.aller)Assist.aller(' + Number(etape) + ');' : '')
  + '}catch(e){document.title="ERREUR "+e.message;}},700);});</script>';
const fin = page.toLowerCase().lastIndexOf('</body>');
page = fin >= 0 ? page.slice(0, fin) + pilote + page.slice(fin) : page + pilote;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-cap-'));
const f = path.join(tmp, nom + '.html');
fs.writeFileSync(f, page, 'utf8');
const sortie = path.resolve(opt('--sortie', path.join(tmp, nom + (etape != null ? '-e' + etape : '') + (jour ? '-jour' : '') + '.png')));
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find((c) => fs.existsSync(c));
if (!chrome) { console.error('✗ Chrome introuvable.'); process.exit(1); }
const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--hide-scrollbars',
  '--no-first-run', '--disable-extensions', '--window-size=' + opt('--l', 1400) + ',' + opt('--h', 900),
  '--virtual-time-budget=5000', '--user-data-dir=' + path.join(tmp, 'profil'),
  '--screenshot=' + sortie, 'file:///' + f.split(path.sep).join('/')], { timeout: 90000 });
try { fs.rmSync(path.join(tmp, 'profil'), { recursive: true, force: true }); } catch (e) {}
if (!fs.existsSync(sortie)) { console.error('✗ aucune capture (statut ' + r.status + ')'); process.exit(1); }
console.log(sortie);
