'use strict';

/*
 * ENCAN EN DIRECT — LE MOTEUR (2026-10-20, lot 1)
 * =============================================================================
 * Sa demande : des encans pendant un direct TikTok, un minuteur à l écran, les
 * offres écrites en COMMENTAIRE. Ce module ne connaît ni TikTok, ni les fenêtres,
 * ni le site : il reçoit des gestes (démarrer, pause, +15 s…) et des commentaires
 * (pseudo, texte), et il rend un ÉTAT. Le processus principal l envoie à la
 * console et à l écran ; le lot 3 lui donnera les vrais commentaires du direct.
 *
 * ⚠ SES RÈGLES, MOT POUR MOT (2026-10-20) :
 *   · SANS offre : arrivé à 2 s, le minuteur repart à 15 s — en boucle, jusqu à
 *     la première offre. Un article ne finit donc jamais sans acheteuse.
 *   · AVEC offre : chaque offre plus haute AJOUTE 15 s au temps restant — mais jamais au-delà de 30 s
 *     (2026-10-21, sa règle : « tu ajoutes 15 s, mais jamais plus de 30 »). Un temps déjà plus long (durée de
 *     départ de 60 s, par exemple) n est pas raccourci : l offre n y ajoute simplement rien.
 *   · À zéro : la gagnante est déclarée ; elle a 15 MINUTES (d abord 5, corrigé
 *     le jour même) pour écrire « GAGNÉ » en message privé, sinon l article est
 *     remis en vente.
 * ⚠ L heure vient de `maintenant()` (injectée) : le banc fait avancer le temps
 *   sans attendre, et deux postes ne se disputent rien — l encan vit sur UN poste.
 */

const REGLAGES_DEFAUT = {
  depart: 10,          // prix de départ, en dollars
  duree: 30,           // secondes au démarrage
  ajout: 15,           // secondes ajoutées par offre retenue
  plafond: 30,         // …sans que le temps restant dépasse ce nombre de secondes
  hausse: 1,           // hausse minimale sur l enchère courante, en dollars
  relanceSous: 2,      // sans offre : quand il reste ce nombre de secondes…
  relanceA: 15,        // …le minuteur repart à ce nombre de secondes
  delaiGagne: 15 * 60, // secondes pour le message « GAGNÉ »
};

const BORNES = {
  depart: [0, 100000], duree: [5, 600], ajout: [1, 120], plafond: [5, 600], hausse: [0.01, 10000],
  relanceSous: [1, 30], relanceA: [5, 120], delaiGagne: [60, 3600],
};

function _borner(r) {
  const out = { ...REGLAGES_DEFAUT };
  for (const k of Object.keys(REGLAGES_DEFAUT)) {
    const v = Number(r && r[k]);
    if (Number.isFinite(v)) out[k] = Math.min(BORNES[k][1], Math.max(BORNES[k][0], v));
  }
  out.depart = Math.round(out.depart * 100) / 100;
  out.hausse = Math.round(out.hausse * 100) / 100;
  if (out.relanceA <= out.relanceSous) out.relanceA = out.relanceSous + 5;
  return out;
}

/* UNE OFFRE = un commentaire qui n est QU UN montant : « 45 », « 45 $ », « 45$ »,
   « $45 », « 45,50 », « 45.50 ». ⚠ Volontairement strict : « 2 robes svp » ou
   « j ai 30 ans » ne sont pas des offres — une offre fantôme ajoute 15 s et met un
   faux nom sous le prix, devant tout le direct. */
const RE_OFFRE = /^\s*\$?\s*(\d{1,6})(?:[.,](\d{1,2}))?\s*(?:\$|dollars?|piasses?)?\s*$/i;
const RE_GAGNE = /^\s*(gagn[ée]e?|won)\s*[!.]*\s*$/i;
function lireOffre(texte) {
  const m = RE_OFFRE.exec(String(texte == null ? '' : texte));
  if (!m) return null;
  const cents = m[2] ? Number((m[2] + '0').slice(0, 2)) : 0;
  return Number(m[1]) + cents / 100;
}

function _pseudo(p) {
  const s = String(p == null ? '' : p).trim().replace(/^@+/, '').slice(0, 40);
  return s ? '@' + s : '';
}

class Encan {
  constructor(opts = {}) {
    this.maintenant = opts.maintenant || (() => Date.now());
    this.surChangement = opts.surChangement || (() => {});
    /* (2026-10-23, lot 2) Le SORT d'une gagnante, pour la vente au serveur (src/encan-vente.js) :
       surIssue(gagnant, 'gagne' | 'remis' | 'annule'). */
    this.surIssue = opts.surIssue || (() => {});
    this.reglages = _borner(opts.reglages);
    this.essai = opts.essai !== false;
    this.file = [];          // articles à suivre : { id, nom, variante, ... }
    this.historique = [];    // encans terminés de la séance
    /* (2026-10-20, sa remarque : « on va enchaîner sur le prochain article ») Les gagnantes qui n'ont pas encore
       écrit « GAGNÉ » : leur délai continue pendant l'encan suivant ; à son terme, l'article revient en FILE. */
    this.attentes = [];      // { cle, article, gagnant }
    /* (2026-10-20) LA MODÉRATION DE L'ENCAN : un pseudo bloqué n'enchérit plus de la séance. ⚠ Ce n'est pas la
       modération de TikTok (supprimer un commentaire, bloquer dans le direct) : celle-là se fait dans TikTok. */
    this.bloques = new Set();
    /* (2026-10-25, lot 4) LA SÉANCE — un direct, du premier encan lancé jusqu'à « Nouvelle séance » (ou 3 h
       sans encan). Elle compte ce que seule la console voit (articles présentés, offres, commentaires, remises
       en vente, pseudos) ; l'ARGENT, lui, se lit au serveur (les ventes portent l'identifiant de la séance et
       la clé de leur encan), parce qu'un paiement arrive souvent après la fin du direct.
       `seanceSale` dit au processus principal qu'il y a du neuf à enregistrer (src/main.js). */
    this.seance = this._nouvelleSeance();
    this.seanceSale = false;
    this._remettreAZero(null);
    this.phase = 'garde';
  }

  _nouvelleSeance() {
    const t = this.maintenant();
    return { id: 'se_' + t.toString(36) + Math.random().toString(36).slice(2, 6), debut: 0, fin: 0, essai: null,
      commentaires: 0, parSource: { direct: 0, manuel: 0, essai: 0 }, offresRetenues: 0, offresRefusees: 0,
      gagneEcrits: 0, pseudos: [], bloques: [], encans: [] };
  }
  /* « Nouvelle séance » (la console) : la séance en cours est close telle quelle — déjà enregistrée — et une
     neuve commence au prochain encan lancé. Refusé pendant un encan : on ne coupe pas un direct en deux. */
  nouvelleSeance() {
    if (this.phase === 'encours' || this.phase === 'pause') return { ok: false, motif: 'encan_en_cours' };
    if (this.seance.debut) { this.seance.fin = this.seance.fin || this.maintenant(); this.seanceSale = true; }
    this._seanceClose = this.seance;
    this.seance = this._nouvelleSeance();
    this._avertir();
    return { ok: true };
  }
  // La séance À ENREGISTRER : la courante, et une séance tout juste close qui n'est pas encore partie.
  seancesAEcrire() {
    const L = [];
    if (this._seanceClose) { L.push(this.instantaneSeance(this._seanceClose)); }
    if (this.seance.debut) L.push(this.instantaneSeance(this.seance));
    return L;
  }
  seancesEcrites() { this._seanceClose = null; this.seanceSale = false; }
  instantaneSeance(s) {
    const x = s || this.seance;
    return { id: x.id, debut: x.debut, fin: x.fin, essai: !!x.essai, commentaires: x.commentaires, parSource: { ...x.parSource },
      offresRetenues: x.offresRetenues, offresRefusees: x.offresRefusees, gagneEcrits: x.gagneEcrits,
      pseudos: x.pseudos.length, bloques: x.bloques.slice(0, 100),
      encans: x.encans.slice(-300).map((e) => ({ ...e })) };
  }
  _seanceToucher() { const t = this.maintenant(); if (this.seance.debut) this.seance.fin = t; this.seanceSale = true; }
  // L'encan de la séance qu'un gagnant concerne (sa clé voyage sur l'objet gagnant : `ec`).
  _seanceEncan(cle) {
    if (!cle) return null;
    for (const s of [this.seance, this._seanceClose]) {
      if (!s) continue;
      for (let i = s.encans.length - 1; i >= 0; i--) if (s.encans[i].cle === cle) return s.encans[i];
    }
    return null;
  }
  _seanceIssue(g, issue) {
    const e = this._seanceEncan(g && g.ec);
    if (e) { e.issue = issue; e.issueLe = this.maintenant(); this._seanceToucher(); }
  }

  _remettreAZero(article) {
    this.article = article;
    this.phase = article ? 'pret' : 'garde';
    this.finA = 0;           // heure (ms) où le minuteur tombe à zéro
    this.restantFige = 0;    // ms restantes, quand l encan est en pause
    this.dureeTotale = 0;    // pour la barre de progression
    this.prix = this.reglages.depart;
    this.meneur = '';
    this.offres = [];        // { pseudo, montant, t, id }
    this.journal = [];       // { pseudo, texte, verdict, t } — les 50 derniers
    this.gagnant = null;     // { pseudo, montant, le, limite }
    this.relances = 0;
  }

  _avertir() { try { this.surChangement(this.etat()); } catch (e) {} }
  _issue(g, issue) { try { this.surIssue(g, issue); } catch (e) {} }
  _noter(pseudo, texte, verdict, offre, source) {
    this.journal.unshift({ pseudo, texte: String(texte || '').slice(0, 140), verdict, t: this.maintenant(), offre: offre || '', source: source || '' });
    if (this.journal.length > 50) this.journal.length = 50;
  }

  // ── Les gestes de la console ─────────────────────────────────────────────
  regler(r) {
    if (this.phase === 'encours' || this.phase === 'pause') return { ok: false, motif: 'encan_en_cours' };
    this.reglages = _borner({ ...this.reglages, ...(r || {}) });
    if (this.phase === 'pret' || this.phase === 'garde') this.prix = this.reglages.depart;
    this._avertir();
    return { ok: true };
  }
  modeEssai(oui) { this.essai = !!oui; this._avertir(); return { ok: true }; }

  /* L'adjugé en cours part en ATTENTE avant qu'on passe à autre chose : rien ne se perd. */
  _garderAttente() {
    if (this.phase === 'adjuge' && this.gagnant && this.article) {
      this.attentes.push({ cle: 'a' + this.maintenant().toString(36) + Math.random().toString(36).slice(2, 6), article: this.article, gagnant: this.gagnant });
      if (this.attentes.length > 100) this.attentes.shift();
    }
  }
  charger(article) {
    if (this.phase === 'encours' || this.phase === 'pause') return { ok: false, motif: 'encan_en_cours' };
    if (!article || !article.nom) return { ok: false, motif: 'article_requis' };
    this._garderAttente();
    this._remettreAZero({ id: String(article.id || ''), nom: String(article.nom).slice(0, 80),
      variante: String(article.variante || '').slice(0, 80), produitId: String(article.produitId || ''),
      taille: String(article.taille || ''), couleur: String(article.couleur || ''), image: String(article.image || '') });
    if (Number.isFinite(Number(article.depart))) this.prix = this.reglages.depart = _borner({ ...this.reglages, depart: article.depart }).depart;
    this._avertir();
    return { ok: true };
  }
  enFile(article) {
    if (!article || !article.nom) return { ok: false, motif: 'article_requis' };
    if (this.file.length >= 200) return { ok: false, motif: 'file_pleine' };
    this.file.push({ ...article, cle: 'f' + this.maintenant().toString(36) + Math.random().toString(36).slice(2, 6) });
    this._avertir();
    return { ok: true };
  }
  retirerDeFile(cle) { this.file = this.file.filter((a) => a.cle !== cle); this._avertir(); return { ok: true }; }
  suivant() {
    if (this.phase === 'encours' || this.phase === 'pause') return { ok: false, motif: 'encan_en_cours' };
    const a = this.file.shift();
    if (!a) return { ok: false, motif: 'file_vide' };
    return this.charger(a);
  }

  demarrer() {
    if (this.phase !== 'pret') return { ok: false, motif: this.article ? 'deja_lance' : 'article_requis' };
    const t = this.maintenant();
    // 3 h sans encan : c'est un autre direct — la séance précédente se clôt d'elle-même.
    if (this.seance.debut && t - (this.seance.fin || this.seance.debut) > 3 * 3600 * 1000) {
      this._seanceClose = this.seance; this.seance = this._nouvelleSeance();
    }
    if (!this.seance.debut) this.seance.debut = t;
    this.seance.essai = (this.seance.essai === null) ? this.essai : (this.seance.essai && this.essai);
    const a = this.article || {};
    this._ec = 'ec' + t.toString(36) + Math.random().toString(36).slice(2, 5);
    this.seance.encans.push({ cle: this._ec, nom: String(a.nom || ''), variante: String(a.variante || ''), produitId: String(a.produitId || ''),
      depart: this.prix, debut: t, fin: 0, offres: 0, relances: 0, adjuge: 0, pseudo: '', issue: 'en_cours', essai: !!this.essai });
    if (this.seance.encans.length > 300) this.seance.encans.shift();
    this._seanceToucher();
    this.phase = 'encours';
    this.dureeTotale = this.reglages.duree * 1000;
    this.finA = t + this.dureeTotale;
    this._avertir();
    return { ok: true };
  }
  pause() {
    if (this.phase !== 'encours') return { ok: false, motif: 'pas_en_cours' };
    this.restantFige = Math.max(0, this.finA - this.maintenant());
    this.phase = 'pause';
    this._avertir();
    return { ok: true };
  }
  reprendre() {
    if (this.phase !== 'pause') return { ok: false, motif: 'pas_en_pause' };
    this.finA = this.maintenant() + this.restantFige;
    this.phase = 'encours';
    this._avertir();
    return { ok: true };
  }
  ajouterTemps(s) {
    const ms = Math.max(1, Math.min(600, Number(s) || this.reglages.ajout)) * 1000;
    if (this.phase === 'encours') this.finA += ms;
    else if (this.phase === 'pause') this.restantFige += ms;
    else return { ok: false, motif: 'pas_en_cours' };
    this._allonger();
    this._avertir();
    return { ok: true };
  }
  /* « Remettre à zéro » : le même article, au prix de départ, prêt à relancer. */
  remettre() {
    if (!this.article) return { ok: false, motif: 'article_requis' };
    const a = this.article;
    if (this.phase === 'adjuge' && this.gagnant) { this._issue(this.gagnant, 'annule'); this._seanceIssue(this.gagnant, 'annule'); }
    else if (this.phase === 'encours' || this.phase === 'pause') {
      const e = this._seanceEncan(this._ec);
      if (e && e.issue === 'en_cours') { e.fin = this.maintenant(); e.offres = this.offres.length; e.relances = this.relances; e.issue = 'annule'; this._seanceToucher(); }
    }
    this._remettreAZero(a);
    this._avertir();
    return { ok: true };
  }
  adjuger() {
    if (this.phase !== 'encours' && this.phase !== 'pause') return { ok: false, motif: 'pas_en_cours' };
    if (!this.offres.length) return { ok: false, motif: 'aucune_offre' };
    this._declarer();
    return { ok: true };
  }
  annuler() {
    if (!this.article) return { ok: false, motif: 'article_requis' };
    if ((this.phase === 'adjuge' || this.phase === 'expire') && this.gagnant) this._issue(this.gagnant, 'annule');
    this._fin('annule');
    return { ok: true };
  }
  /* Le message « GAGNÉ » est arrivé (lot 1 : la console le dit ; lot 2 : la vente s en charge). */
  confirmerGagne() {
    if (this.phase !== 'adjuge') return { ok: false, motif: 'pas_adjuge' };
    this.gagnant.confirmeLe = this.maintenant();
    this._issue(this.gagnant, 'gagne');
    this._fin('vendu');
    return { ok: true };
  }
  /* Passé le délai : remis en vente — même article, au prix de départ. */
  remettreEnVente() {
    if (this.phase !== 'adjuge' && this.phase !== 'expire') return { ok: false, motif: 'pas_adjuge' };
    const a = this.article;
    if (this.gagnant) { this._issue(this.gagnant, 'remis'); this._seanceIssue(this.gagnant, 'remis'); }
    this.historique.unshift({ article: a, gagnant: this.gagnant, issue: 'remis', le: this.maintenant() });
    this._remettreAZero(a);
    this._avertir();
    return { ok: true };
  }
  garde() {
    if (this.phase === 'encours' || this.phase === 'pause') return { ok: false, motif: 'encan_en_cours' };
    this._garderAttente();
    this._remettreAZero(null);
    this._avertir();
    return { ok: true };
  }

  /* Une gagnante EN ATTENTE a écrit « GAGNÉ » : vendu. */
  confirmerAttente(cle) {
    const i = this.attentes.findIndex((x) => x.cle === cle);
    if (i < 0) return { ok: false, motif: 'introuvable' };
    const a = this.attentes.splice(i, 1)[0];
    a.gagnant.confirmeLe = this.maintenant();
    this._issue(a.gagnant, 'gagne');
    this._seanceIssue(a.gagnant, 'vendu');
    this.historique.unshift({ article: a.article, gagnant: a.gagnant, issue: 'vendu', le: this.maintenant() });
    this._avertir();
    return { ok: true };
  }
  /* Remise en vente d'un article en attente (à la main, ou au terme du délai) : en TÊTE de file. */
  remettreAttente(cle) {
    const i = this.attentes.findIndex((x) => x.cle === cle);
    if (i < 0) return { ok: false, motif: 'introuvable' };
    this._remettreEnFile(this.attentes.splice(i, 1)[0]);
    this._avertir();
    return { ok: true };
  }
  _remettreEnFile(a) {
    this._issue(a.gagnant, 'remis');
    this._seanceIssue(a.gagnant, 'remis');
    this.historique.unshift({ article: a.article, gagnant: a.gagnant, issue: 'remis', le: this.maintenant() });
    this.file.unshift({ ...a.article, cle: 'f' + this.maintenant().toString(36) + Math.random().toString(36).slice(2, 6) });
  }

  /* ── Un commentaire. source : 'direct' (le vrai direct, lot 3), 'manuel' (lu dans TikTok et tapé à la
     console, en secours), 'essai' (simulé — refusé hors du mode essai). ── */
  commentaire(pseudoBrut, texte, source) {
    const pseudo = _pseudo(pseudoBrut);
    if (!pseudo) return { ok: false, motif: 'pseudo_requis' };
    if (source === 'essai' && !this.essai) return { ok: false, motif: 'essai_coupe' };
    const montant = lireOffre(texte);
    let verdict;
    /* (2026-10-23, lot 3) Une gagnante qui écrit « GAGNÉ » (GAGNE, WON) dans les COMMENTAIRES au lieu du message
       privé : signalé à la console — le lien, lui, ne part qu en privé (sa règle : personne d autre ne doit le voir). */
    if (montant === null && RE_GAGNE.test(String(texte || '')) && this._gagnanteEnAttente(pseudo)) verdict = 'gagne_ecrit';
    else if (montant !== null && this.bloques.has(pseudo.toLowerCase())) verdict = 'bloque';
    else if (montant === null) verdict = 'pas_offre';
    else if (this.phase === 'pause') verdict = 'pause';
    else if (this.phase !== 'encours') verdict = 'fermee';
    else {
      const premier = !this.offres.length;
      const mini = premier ? this.reglages.depart : Math.round((this.prix + this.reglages.hausse) * 100) / 100;
      if (montant < mini) verdict = premier ? 'sous_depart' : 'trop_basse';
      else {
        verdict = 'retenue';
        this.prix = montant;
        this.meneur = pseudo;
        this.offres.unshift({ pseudo, montant, t: this.maintenant(), id: 'o' + this.maintenant().toString(36) + Math.random().toString(36).slice(2, 6) });
        if (this.offres.length > 200) this.offres.length = 200;
        const maintenant = this.maintenant();
        this.finA = Math.max(this.finA, Math.min(this.finA + this.reglages.ajout * 1000, maintenant + this.reglages.plafond * 1000));
        this._allonger();
      }
    }
    this._noter(pseudo, texte, verdict, verdict === 'retenue' ? this.offres[0].id : '', source);
    // La séance compte les commentaires de son direct (pas ceux d'avant le premier encan).
    if (this.seance.debut) {
      const s = this.seance;
      s.commentaires++;
      const src = source === 'direct' || source === 'manuel' || source === 'essai' ? source : 'manuel';
      s.parSource[src] = (s.parSource[src] || 0) + 1;
      if (verdict === 'retenue') s.offresRetenues++;
      else if (verdict === 'trop_basse' || verdict === 'sous_depart' || verdict === 'bloque' || verdict === 'fermee' || verdict === 'pause') s.offresRefusees++;
      else if (verdict === 'gagne_ecrit') s.gagneEcrits++;
      const p = pseudo.toLowerCase();
      if (s.pseudos.length < 5000 && s.pseudos.indexOf(p) < 0) s.pseudos.push(p);
      const e = this._seanceEncan(this._ec);
      if (e && verdict === 'retenue') e.offres = this.offres.length;
      this._seanceToucher();
    }
    this._avertir();
    return { ok: true, verdict, montant };
  }
  _gagnanteEnAttente(pseudo) {
    const p = pseudo.toLowerCase();
    if (this.phase === 'adjuge' && this.gagnant && String(this.gagnant.pseudo).toLowerCase() === p) return true;
    return this.attentes.some((a) => String(a.gagnant.pseudo).toLowerCase() === p);
  }

  /* Annuler UNE offre (farfelue, en double, d'une personne qui s'est trompée) : le prix et la meneuse reviennent à
     la meilleure offre qui reste. Le temps n'est pas retiré — ce serait couper la parole aux autres. */
  annulerOffre(id) {
    if (this.phase !== 'encours' && this.phase !== 'pause') return { ok: false, motif: 'pas_en_cours' };
    const i = this.offres.findIndex((o) => o.id === id);
    if (i < 0) return { ok: false, motif: 'introuvable' };
    this.offres.splice(i, 1);
    this._recalculer();
    this.journal.forEach((j) => { if (j.offre === id) j.verdict = 'annulee'; });
    this._avertir();
    return { ok: true };
  }
  /* Bloquer un pseudo pour la séance : ses offres EN COURS sont retirées, les suivantes ne comptent plus. */
  bloquer(pseudoBrut) {
    const p = _pseudo(pseudoBrut);
    if (!p) return { ok: false, motif: 'pseudo_requis' };
    this.bloques.add(p.toLowerCase());
    if (this.seance.bloques.indexOf(p) < 0 && this.seance.bloques.length < 100) { this.seance.bloques.push(p); this._seanceToucher(); }
    if (this.phase === 'encours' || this.phase === 'pause') {
      const avant = this.offres.length;
      this.offres = this.offres.filter((o) => o.pseudo.toLowerCase() !== p.toLowerCase());
      if (this.offres.length !== avant) this._recalculer();
    }
    this._avertir();
    return { ok: true };
  }
  debloquer(pseudoBrut) {
    const p = _pseudo(pseudoBrut);
    this.bloques.delete(p.toLowerCase());
    this._avertir();
    return { ok: true };
  }
  _recalculer() {
    const top = this.offres.reduce((m, o) => (!m || o.montant > m.montant ? o : m), null);
    this.prix = top ? top.montant : this.reglages.depart;
    this.meneur = top ? top.pseudo : '';
  }

  // La barre de progression suit le plus long temps restant vu : elle ne « recule » pas d un coup.
  _allonger() {
    const r = this.phase === 'pause' ? this.restantFige : this.finA - this.maintenant();
    if (r > this.dureeTotale) this.dureeTotale = r;
  }

  _declarer() {
    const t = this.maintenant();
    this.gagnant = { pseudo: this.meneur, montant: this.prix, le: t, limite: t + this.reglages.delaiGagne * 1000, ec: this._ec || '' };
    const e = this._seanceEncan(this._ec);
    if (e) { e.fin = t; e.adjuge = this.prix; e.pseudo = this.meneur; e.offres = this.offres.length; e.relances = this.relances; e.issue = 'adjuge'; this._seanceToucher(); }
    this.phase = 'adjuge';
    this._avertir();
  }
  _fin(issue) {
    if (this.gagnant) this._seanceIssue(this.gagnant, issue);
    else {
      // Annulé avant toute adjudication (ou sans offre) : l'encan de la séance le dit.
      const e = this._seanceEncan(this._ec);
      if (e && e.issue === 'en_cours') { e.fin = this.maintenant(); e.offres = this.offres.length; e.relances = this.relances; e.issue = 'annule'; this._seanceToucher(); }
    }
    this.historique.unshift({ article: this.article, gagnant: this.gagnant, issue, le: this.maintenant() });
    if (this.historique.length > 200) this.historique.length = 200;
    this.phase = issue === 'vendu' ? 'vendu' : 'annule';
    this._avertir();
  }

  /* Le battement : à appeler souvent (le processus principal le fait toutes les 100 ms). */
  battre() {
    const t = this.maintenant();
    if (this.phase === 'encours') {
      const r = this.finA - t;
      if (!this.offres.length && r <= this.reglages.relanceSous * 1000) {
        this.finA = t + this.reglages.relanceA * 1000;
        this.dureeTotale = Math.max(this.dureeTotale, this.reglages.relanceA * 1000);
        this.relances++;
        const e = this._seanceEncan(this._ec); if (e) e.relances = this.relances;
        this._avertir();
      } else if (this.offres.length && r <= 0) {
        this._declarer();
      }
    } else if (this.phase === 'adjuge' && this.gagnant && t >= this.gagnant.limite) {
      this.remettreEnVente();   // passé le délai : remis en vente, même article, au prix de départ
    }
    // Les attentes échues : l'article revient en tête de file, tout seul (sa règle : « passé ce délai, nous le remettons en vente »).
    const echues = this.attentes.filter((a) => t >= a.gagnant.limite);
    if (echues.length) {
      this.attentes = this.attentes.filter((a) => t < a.gagnant.limite);
      echues.forEach((a) => this._remettreEnFile(a));
      this._avertir();
    }
  }

  etat() {
    const t = this.maintenant();
    const restant = this.phase === 'encours' ? Math.max(0, this.finA - t)
      : this.phase === 'pause' ? this.restantFige
        : this.phase === 'pret' ? this.reglages.duree * 1000 : 0;
    const premier = !this.offres.length;
    return {
      phase: this.phase, essai: this.essai, reglages: { ...this.reglages },
      article: this.article, prix: this.prix, meneur: this.meneur,
      prochaine: premier ? this.reglages.depart : Math.round((this.prix + this.reglages.hausse) * 100) / 100,
      restantMs: restant, dureeMs: this.dureeTotale || this.reglages.duree * 1000,
      offres: this.offres.slice(0, 5), nbOffres: this.offres.length, relances: this.relances,
      journal: this.journal.slice(0, 50), bloques: [...this.bloques],
      gagnant: this.gagnant ? { ...this.gagnant, restantMs: Math.max(0, this.gagnant.limite - t) } : null,
      file: this.file.slice(0, 50), nbFile: this.file.length,
      attentes: this.attentes.map((a) => ({ cle: a.cle, article: a.article, pseudo: a.gagnant.pseudo, montant: a.gagnant.montant, restantMs: Math.max(0, a.gagnant.limite - t),
        vente: a.gagnant.vente || null })),
      historique: this.historique.slice(0, 20),
      seance: { id: this.seance.id, debut: this.seance.debut, fin: this.seance.fin, encans: this.seance.encans.length,
        adjuges: this.seance.encans.filter((e) => e.adjuge > 0).length, commentaires: this.seance.commentaires },
    };
  }
}

module.exports = { Encan, lireOffre, REGLAGES_DEFAUT };
