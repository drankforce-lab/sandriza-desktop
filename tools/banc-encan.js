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

// ── LA VENTE AU SERVEUR (2026-10-23, lot 2) : src/encan-vente.js, avec un faux site ──
(async () => {
console.log('— La vente : adjugé → vente au serveur, GAGNÉ, remise en vente, paiement');
const { VentesEncan } = require(path.join(__dirname, '..', 'src', 'encan-vente.js'));
const monte = (opts) => {
  const appels = [], etat = {};
  let n = 0;
  const site = async (op, ...a) => {
    appels.push([op, ...a]);
    if (op === 'encan:vendre') {
      if (!a[0].article.produitId && !a[0].essai) return { ok: false, motif: 'article_catalogue' };
      const id = 'ev_' + (++n); etat[id] = 'attente';
      return { ok: true, id, url: 'https://www.sandriza.com/encan/' + 'a'.repeat(31) + n, expire: 999, reserve: true, courriel: (opts && opts.courriel) || '' };
    }
    if (op === 'encan:gagne') return { ok: true, expire: 86400 };
    if (op === 'encan:annuler') { if (etat[a[0]] === 'payee') return { ok: false, motif: 'payee' }; etat[a[0]] = 'annulee'; return { ok: true }; }
    if (op === 'encan:etat') { const v = {}; a[0].forEach((id) => { v[id] = { statut: etat[id], commande: etat[id] === 'payee' ? 'CMD-0002-22400' : '' }; }); return { ok: true, ventes: v }; }
    return { ok: false };
  };
  let ve = null;
  const m = new Encan({ maintenant: horloge, reglages: { depart: 10, duree: 30 }, essai: !!(opts && opts.essai),
    surChangement: () => { if (ve) ve.observer(); }, surIssue: (g, i) => ve && ve.surIssue(g, i) });
  ve = new VentesEncan({ moteur: m, appeler: site, maintenant: horloge });
  return { m, ve, appels, etat };
};
const pause = () => new Promise((r) => setImmediate(r));
const adjugeSur = async (x, article) => { x.m.charger(article || { produitId: 'pA', nom: 'Robe', taille: 'M', couleur: 'Noir' }); x.m.demarrer(); x.m.commentaire('@lea', '20'); x.m.adjuger(); await pause(); await pause(); };

let x = monte();
await adjugeSur(x);
verif('adjugé : UNE vente demandée au site, avec article, montant, pseudo', x.appels.filter((a) => a[0] === 'encan:vendre').length === 1
  && x.appels[0][1].montant === 20 && x.appels[0][1].pseudo === '@lea' && x.appels[0][1].article.produitId === 'pA', x.appels);
verif('…le lien est porté par la gagnante (état poussé aux fenêtres)', x.m.etat().gagnant.vente && /\/encan\//.test(x.m.etat().gagnant.vente.url), x.m.etat().gagnant);
x.ve.observer();
verif('un second passage ne crée pas de doublon', x.appels.filter((a) => a[0] === 'encan:vendre').length === 1);
x.m.confirmerGagne(); await pause();
verif('« GAGNÉ » reçu : le délai de paiement est allongé au serveur', x.appels.some((a) => a[0] === 'encan:gagne' && a[1] === 'ev_1'), x.appels);
x.etat.ev_1 = 'payee';
await x.ve.suivre();
verif('payée : le suivi le voit, avec le numéro de commande', x.m.historique[0].gagnant.vente.etat === 'payee' && x.m.historique[0].gagnant.vente.commande === 'CMD-0002-22400', x.m.historique[0]);

x = monte();
await adjugeSur(x);
x.m.remettreEnVente(); await pause();
verif('remis en vente : la vente est annulée au serveur (l article revient en stock)', x.appels.some((a) => a[0] === 'encan:annuler' && a[1] === 'ev_1') && x.etat.ev_1 === 'annulee', x.appels);

x = monte();
await adjugeSur(x);
x.m.garde();
const cleAtt = x.m.attentes[0].cle;
verif('en attente pendant l encan suivant : la vente suit la gagnante', x.m.etat().attentes[0].vente && x.m.etat().attentes[0].vente.id === 'ev_1');
x.etat.ev_1 = 'payee';
await x.ve.suivre();
verif('payée PENDANT l attente : notée vendue sans geste, sortie des attentes', !x.m.attentes.length && x.m.historique[0].issue === 'vendu' && x.m.historique[0].gagnant.vente.etat === 'payee', x.m.historique[0]);
verif('…et rien n est annulé au serveur', !x.appels.some((a) => a[0] === 'encan:annuler'));
void cleAtt;

x = monte();
await adjugeSur(x);
x.m.garde();
avancer(15 * 60000 + 500, x.m); await pause();
verif('15 min sans « GAGNÉ » : remis en file ET la vente annulée au serveur', x.m.file.length === 1 && x.appels.some((a) => a[0] === 'encan:annuler'), x.appels);

x = monte({ courriel: 'm•••@x.test' });
await adjugeSur(x);
verif('pseudo déjà rattaché : lien parti par courriel ⇒ vendu sans attendre « GAGNÉ »', x.m.phase === 'vendu' && x.m.historique[0].gagnant.vente.courriel === 'm•••@x.test', { phase: x.m.phase });

x = monte();
await adjugeSur(x, { nom: 'Article libre' });
verif('article libre hors essai : pas de lien, la raison est dite', x.m.etat().gagnant.vente.etat === 'erreur' && x.m.etat().gagnant.vente.motif === 'article_catalogue', x.m.etat().gagnant.vente);

x = monte();
x.m.charger({ produitId: 'pA', nom: 'Robe' }); x.m.demarrer(); x.m.commentaire('@lea', '20'); x.m.adjuger();
x.m.remettreEnVente();   // AVANT que le site ait répondu
await pause(); await pause(); await pause();
verif('remis en vente PENDANT la création : appliqué dès la réponse (annulée au serveur)', x.etat.ev_1 === 'annulee', x.appels);

// ── LES VRAIS COMMENTAIRES (2026-10-23, lot 3) : src/encan-direct.js, avec une fausse bibliothèque ──
console.log('— Le direct : branchement, commentaires, coupure, reconnexion, hors ligne, fin');
const { DirectTikTok, normaliserCompte } = require(path.join(__dirname, '..', 'src', 'encan-direct.js'));
verif('compte : « @sandriza », « sandriza », le lien tiktok.com/@sandriza/live → sandriza ; « a b » refusé',
  normaliserCompte('@sandriza') === 'sandriza' && normaliserCompte('https://www.tiktok.com/@sandriza/live') === 'sandriza' && normaliserCompte('a b') === '');
const fausseBiblio = (comportement) => {
  const conns = [];
  class UserOfflineError extends Error {}
  class TikTokLiveConnection {
    constructor(u) { this.u = u; this.h = {}; conns.push(this); }
    on(e, f) { this.h[e] = f; }
    removeAllListeners() { this.h = {}; }
    emit(e, d) { if (this.h[e]) this.h[e](d); }
    async connect() { const c = comportement.shift() || 'ok'; if (c === 'hors_ligne') throw new UserOfflineError('offline'); if (c === 'panne') throw new Error('panne'); return { roomId: '42' }; }
    async disconnect() { this.ferme = true; }
  }
  return { conns, m: { TikTokLiveConnection, UserOfflineError, WebcastEvent: { CHAT: 'chat', STREAM_END: 'streamEnd' }, ControlEvent: { DISCONNECTED: 'disconnected', ERROR: 'error' } } };
};
const montageDirect = (comportement) => {
  const fb = fausseBiblio(comportement || []), plans = [], etats = [];
  let ve2 = null;
  const m = new Encan({ maintenant: horloge, reglages: { depart: 10, duree: 30 }, essai: false });
  const d = new DirectTikTok({ charger: async () => fb.m, maintenant: horloge,
    surCommentaire: (p, t) => m.commentaire(p, t, 'direct'),
    surEtat: (e) => { etats.push(e.statut); if ((e.statut === 'coupe' || e.statut === 'fin') && m.phase === 'encours') m.pause(); },
    planifier: (f, ms) => { plans.push({ f, ms }); return plans.length; }, annulerPlan: () => {} });
  void ve2;
  return { fb, plans, etats, m, d };
};
let md = montageDirect();
verif('compte invalide : refusé sans rien lancer', md.d.brancher('a b').motif === 'compte_invalide' && !md.fb.conns.length);
md.d.brancher('@sandriza'); await pause(); await pause();
verif('branché : connexion au bon compte, état « branche »', md.d.statut === 'branche' && md.fb.conns[0].u === 'sandriza', md.etats);
md.m.charger({ nom: 'Robe' }); md.m.demarrer();
md.fb.conns[0].emit('chat', { user: { uniqueId: 'julie.mtl', nickname: 'Julie' }, comment: '25' });
md.fb.conns[0].emit('chat', { user: { uniqueId: 'sophie_b' }, comment: 'trop belle' });
verif('un commentaire « 25 » du direct devient une offre (hors mode essai)', md.m.meneur === '@julie.mtl' && md.m.prix === 25 && md.m.journal[1].source === 'direct', md.m.journal);
verif('un commentaire ordinaire est noté sans être une offre ; compté', md.m.journal[0].verdict === 'pas_offre' && md.d.etat().nb === 2 && md.d.etat().parMinute === 2);
md.fb.conns[0].emit('disconnected', { code: 1006 });
verif('coupure pendant l encan : état « coupe », encan EN PAUSE, reconnexion planifiée à 2 s', md.d.statut === 'coupe' && md.m.phase === 'pause' && md.plans[0].ms === 2000, { st: md.d.statut, ph: md.m.phase, plans: md.plans.map((x) => x.ms) });
md.plans[0].f(); await pause(); await pause();
verif('reconnexion : rebranché sur une NOUVELLE connexion', md.d.statut === 'branche' && md.fb.conns.length === 2);
md.fb.conns[0].emit('chat', { user: { uniqueId: 'fantome' }, comment: '99' });
verif('l ancienne connexion ne parle plus (aucune offre fantôme)', md.m.prix === 25);
md.fb.conns[1].emit('streamEnd', {});
verif('fin du direct : état « fin », plus de reconnexion', md.d.statut === 'fin' && md.plans.length === 1);
md = montageDirect(['hors_ligne', 'ok']);
md.d.brancher('sandriza'); await pause(); await pause();
verif('compte pas en direct : « hors_ligne », nouvel essai dans 30 s', md.d.statut === 'hors_ligne' && md.plans[0].ms === 30000, md.etats);
md.plans[0].f(); await pause(); await pause();
verif('…le direct commence : branché tout seul', md.d.statut === 'branche');
md.d.debrancher();
verif('se débrancher : état « eteint », connexion fermée', md.d.statut === 'eteint' && md.fb.conns[1].ferme === true);
md = montageDirect();
const dd = new DirectTikTok({ charger: async () => { throw new Error('Cannot find package'); }, maintenant: horloge, planifier: () => 0, annulerPlan: () => {} });
dd.brancher('sandriza'); await pause(); await pause();
verif('bibliothèque absente : « erreur » dite, pas de plantage', dd.statut === 'erreur' && /bibliotheque/.test(dd.detail), dd.etat());

console.log('— Sources des commentaires et « GAGNÉ » écrit dans le direct');
let ms = new Encan({ maintenant: horloge, reglages: { depart: 10 }, essai: false });
ms.charger({ nom: 'Robe' }); ms.demarrer();
verif('hors essai : un commentaire SIMULÉ est refusé', ms.commentaire('@x', '20', 'essai').motif === 'essai_coupe');
verif('hors essai : une offre SAISIE à la main (secours) est retenue', ms.commentaire('@lea', '20', 'manuel').verdict === 'retenue' && ms.journal[0].source === 'manuel');
ms.adjuger();
verif('la gagnante écrit « Gagné ! » dans les commentaires : signalé', ms.commentaire('lea', 'Gagné !', 'direct').verdict === 'gagne_ecrit');
verif('quelqu un d autre écrit « gagné » : simple commentaire', ms.commentaire('@autre', 'gagné', 'direct').verdict === 'pas_offre');
verif('« WON » aussi reconnu', ms.commentaire('@lea', 'won', 'direct').verdict === 'gagne_ecrit');

// ── La console : le lecteur de codes-barres et la vignette (2026-10-20, ses deux signalements) ──
const _page = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'fenetres', 'encan.js'), 'utf8');
verif('un code scanné (réponse « sku » du site) met l article à l encan sans passer par la liste', _page.includes('if (r.sku) { scanne(r.sku); return; }'));
verif('Entrée lance la recherche tout de suite (le lecteur tape le code puis Entrée)', _page.includes("if (ev.key === 'Enter') { ev.preventDefault(); chercher(this.value, true); }"));
verif('la vignette est une image, pas un fond (le damier des thèmes Carbone/Lin la répétait en mosaïque)',
  !_page.includes("$('vign').style.background") && _page.includes('<img id="vign"'));

console.log(ok + ' vérifiés, ' + ko + ' en échec');
process.exit(ko ? 1 : 0);
})();
