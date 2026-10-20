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
const avant = e.etat().restantMs;
r = e.commentaire('julie.mtl', '15');
verif('première offre au prix de départ : retenue, +15 s, meneuse affichée', r.verdict === 'retenue' && e.meneur === '@julie.mtl' && e.etat().restantMs - avant >= 14900, e.etat().restantMs - avant);
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
verif('passé 15 minutes sans « GAGNÉ » : délai expiré', e.phase === 'expire');
e.remettreEnVente();
verif('remis en vente : même article, prix de départ, aucune offre', e.phase === 'pret' && e.article.nom === 'Bottes chelsea' && e.prix === 15 && e.offres.length === 0 && e.historique[0].issue === 'remis');

console.log('— Gestes refusés quand ils n ont pas de sens');
e = neuf();
verif('adjuger sans offre : refusé', e.demarrer().ok && e.adjuger().motif === 'aucune_offre');
verif('changer d article pendant un encan : refusé', e.charger({ nom: 'Autre' }).motif === 'encan_en_cours');
e.commentaire('@a', '20'); e.adjuger();
verif('« GAGNÉ » reçu : vendu, à l historique', e.confirmerGagne().ok && e.phase === 'vendu' && e.historique[0].issue === 'vendu');
verif('le mode essai coupé refuse les faux commentaires', (() => { const x = neuf(); x.modeEssai(false); x.demarrer(); return x.commentaire('@a', '20', 'essai').motif === 'essai_coupe'; })());

console.log(ok + ' vérifiés, ' + ko + ' en échec');
process.exit(ko ? 1 : 0);
