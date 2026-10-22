'use strict';
/* Banc du moteur de l'encan (src/encan.js) — le temps est simulé, rien n'attend.
   Chaque cas est une de ses règles du 2026-10-20. */
const path = require('path');
const { Encan, lireOffre } = require(path.join(__dirname, '..', 'src', 'encan.js'));

let ok = 0, ko = 0;
const verif = (nom, cond, detail) => {
  if (cond) { ok++; console.log('  ✓ ' + nom); }
  else { ko++; console.log('  ✗ ' + nom + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); }
};

let T = 1000000;
const horloge = () => T;
const avancer = (ms, e) => { const fin = T + ms; while (T < fin) { T = Math.min(fin, T + 100); e.battre(); } };
const neuf = (r) => { const e = new Encan({ maintenant: horloge, reglages: Object.assign({ depart: 15, duree: 30, ajout: 15, hausse: 1 }, r || {}) }); e.charger({ nom: 'Bottes chelsea', variante: 'Crème · 39' }); return e; };

console.log('— Lecture des offres');
verif('« 45 », « 45 $ », « 45$ », « $45 », « 45,50 » sont des offres',
  lireOffre('45') === 45 && lireOffre('45 $') === 45 && lireOffre('45$') === 45 && lireOffre('$45') === 45 && lireOffre('45,50') === 45.5);
verif('« 2 robes svp », « trop beau », « j ai 30 ans » n en sont pas',
  lireOffre('2 robes svp') === null && lireOffre('trop beau') === null && lireOffre('j ai 30 ans') === null && lireOffre('') === null);

console.log('— Sans offre : relance à 15 s quand il reste 2 s, en boucle');
let e = neuf();
e.demarrer();
avancer(27900, e);
verif('à 2,1 s restantes, pas encore relancé', e.relances === 0 && e.etat().restantMs > 2000, e.etat().restantMs);
avancer(200, e);
verif('à 2 s : le minuteur repart à 15 s', e.relances === 1 && Math.abs(e.etat().restantMs - 15000) <= 100, e.etat().restantMs);
avancer(60000, e);
verif('il ne finit jamais sans offre (toujours en cours après une minute, plusieurs relances)', e.phase === 'encours' && e.relances >= 4, { phase: e.phase, r: e.relances });

console.log('— Les offres');
e = neuf(); e.demarrer();
let r = e.commentaire('@marie', '10');
verif('sous le prix de départ (15 $) : refusée', r.verdict === 'sous_depart' && e.nbOffres === undefined && e.offres.length === 0);
avancer(20000, e);   // 10 s restantes : l ajout entier tient sous le plafond
const avant = e.etat().restantMs;
r = e.commentaire('julie.mtl', '15');
verif('première offre au prix de départ : retenue, +15 s, meneuse affichée', r.verdict === 'retenue' && e.meneur === '@julie.mtl' && e.etat().restantMs - avant >= 14900, e.etat().restantMs - avant);
// SA RÈGLE (2026-10-21) : +15 s par offre, mais jamais plus de 30 s restantes ; un temps plus long n est pas raccourci
{ const e1 = neuf(); e1.demarrer(); avancer(5000, e1);   // ~25 s restantes
  let r1 = e1.commentaire('@ana', '15');
  verif('plafond : à ~25 s restantes, une offre ramène à 30 s, pas 40', r1.verdict === 'retenue' && Math.abs(e1.etat().restantMs - 30000) <= 100, e1.etat().restantMs);
  r1 = e1.commentaire('@bea', '16');
  verif('plafond : à 30 s, une offre n ajoute rien', r1.verdict === 'retenue' && Math.abs(e1.etat().restantMs - 30000) <= 100, e1.etat().restantMs); }
{ const e2 = neuf({ duree: 60 }); e2.demarrer(); const r0 = e2.etat().restantMs; e2.commentaire('@cleo', '15');
  verif('plafond : un temps de départ de 60 s n est pas raccourci par une offre', Math.abs(e2.etat().restantMs - r0) <= 100, e2.etat().restantMs); }
r = e.commentaire('@sophie_b', '15,50');
verif('hausse minimale de 1 $ : 15,50 refusée', r.verdict === 'trop_basse' && e.prix === 15);
r = e.commentaire('@sophie_b', '16');
verif('16 $ : retenue, nouvelle meneuse', r.verdict === 'retenue' && e.meneur === '@sophie_b' && e.prix === 16);
r = e.commentaire('@marie', 'trop beau');
verif('un commentaire qui n est pas un montant : noté « pas une offre », rien ne bouge', r.verdict === 'pas_offre' && e.prix === 16);

console.log('— Pause, +15 s, remise à zéro');
const rAvant = e.etat().restantMs;
e.pause(); avancer(10000, e);
verif('en pause, le temps ne coule pas', e.phase === 'pause' && e.etat().restantMs === rAvant);
r = e.commentaire('@karine', '30');
verif('une offre pendant la pause ne compte pas', r.verdict === 'pause' && e.prix === 16);
e.ajouterTemps(15);
verif('+15 s en pause : ajouté', e.etat().restantMs === rAvant + 15000);
e.reprendre();
verif('la reprise repart du temps figé', e.phase === 'encours' && Math.abs(e.etat().restantMs - (rAvant + 15000)) <= 100);

console.log('— À zéro : la gagnante, puis 15 minutes pour « GAGNÉ »');
avancer(e.etat().restantMs + 200, e);
verif('à zéro avec des offres : adjugé à la meneuse', e.phase === 'adjuge' && e.gagnant && e.gagnant.pseudo === '@sophie_b' && e.gagnant.montant === 16, e.etat().gagnant);
verif('le délai du message « GAGNÉ » est de 15 minutes', Math.abs(e.etat().gagnant.restantMs - 15 * 60000) <= 300, e.etat().gagnant.restantMs);
r = e.commentaire('@tard', '50');
verif('une offre après l adjudication ne compte pas', r.verdict === 'fermee' && e.gagnant.montant === 16);
avancer(15 * 60000, e);
verif('remis en vente TOUT SEUL après 15 minutes sans « GAGNÉ » : même article, prix de départ, aucune offre', e.phase === 'pret' && e.article.nom === 'Bottes chelsea' && e.prix === 15 && e.offres.length === 0 && e.historique[0].issue === 'remis');

console.log('— Gestes refusés quand ils n ont pas de sens');
e = neuf();
verif('adjuger sans offre : refusé', e.demarrer().ok && e.adjuger().motif === 'aucune_offre');
verif('changer d article pendant un encan : refusé', e.charger({ nom: 'Autre' }).motif === 'encan_en_cours');
e.commentaire('@a', '20'); e.adjuger();
verif('« GAGNÉ » reçu : vendu, à l historique', e.confirmerGagne().ok && e.phase === 'vendu' && e.historique[0].issue === 'vendu');
verif('le mode essai coupé refuse les faux commentaires', (() => { const x = neuf(); x.modeEssai(false); x.demarrer(); return x.commentaire('@a', '20', 'essai').motif === 'essai_coupe'; })());

console.log('— On enchaîne : la gagnante attend « GAGNÉ » pendant l encan suivant');
e = neuf(); e.demarrer(); e.commentaire('@ana', '20'); e.adjuger();
e.charger({ nom: 'Gilet bleu', variante: 'L' });
verif('passer à l article suivant garde la gagnante EN ATTENTE (rien ne se perd)', e.attentes.length === 1 && e.attentes[0].gagnant.pseudo === '@ana' && e.article.nom === 'Gilet bleu');
e.demarrer();
avancer(10 * 60000, e);
verif('son délai court pendant l encan suivant', e.etat().attentes.length === 1 && e.etat().attentes[0].restantMs <= 5 * 60000 + 300);
verif('« GAGNÉ » reçu pour une attente : vendu', (() => { const x = neuf(); x.demarrer(); x.commentaire('@b', '20'); x.adjuger(); x.garde(); const k = x.attentes[0].cle; return x.confirmerAttente(k).ok && !x.attentes.length && x.historique[0].issue === 'vendu'; })());
avancer(5 * 60000 + 500, e);
verif('au terme des 15 minutes : l article revient EN TÊTE de file, tout seul', e.attentes.length === 0 && e.file.length >= 1 && e.file[0].nom === 'Bottes chelsea' && e.historique[0].issue === 'remis');

console.log('— La modération de l encan');
e = neuf(); e.demarrer(); e.commentaire('@a', '20'); e.commentaire('@troll', '999'); 
verif('une offre farfelue (999 $) mène…', e.meneur === '@troll' && e.prix === 999);
e.annulerOffre(e.offres[0].id);
verif('« Annuler l offre » : le prix et la meneuse reviennent à l offre précédente', e.meneur === '@a' && e.prix === 20 && e.journal[0].verdict === 'annulee');
e.commentaire('@troll', '1000'); e.bloquer('@troll');
verif('« Bloquer » retire ses offres en cours', e.meneur === '@a' && e.prix === 20);
verif('…et les suivantes ne comptent plus', e.commentaire('troll', '2000').verdict === 'bloque' && e.prix === 20);
e.debloquer('@troll');
verif('« Débloquer » : de nouveau admis', e.commentaire('@troll', '25').verdict === 'retenue');

// ── La console : le lecteur de codes-barres et la vignette (2026-10-20, ses deux signalements) ──
const _page = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'fenetres', 'encan.js'), 'utf8');
verif('un code scanné (réponse « sku » du site) met l article à l encan sans passer par la liste', _page.includes('if (r.sku) { scanne(r.sku); return; }'));
verif('Entrée lance la recherche tout de suite (le lecteur tape le code puis Entrée)', _page.includes("if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); }"));
verif('la vignette est une image, pas un fond (le damier des thèmes Carbone/Lin la répétait en mosaïque)',
  !_page.includes("$('vign').style.background") && _page.includes('<img id="vign"'));

console.log(ok + ' vérifiés, ' + ko + ' en échec');
process.exit(ko ? 1 : 0);
