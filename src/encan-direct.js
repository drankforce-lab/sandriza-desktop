'use strict';

/*
 * ENCAN EN DIRECT — LES VRAIS COMMENTAIRES DU DIRECT (2026-10-23, lot 3)
 * =============================================================================
 * Branche la console sur un direct TikTok PUBLIC et remet chaque commentaire au moteur (src/encan.js),
 * comme s il avait été tapé — le moteur seul décide si c est une offre.
 *
 * ⚠⚠ AUCUNE API OFFICIELLE. La lecture passe par `tiktok-live-connector` (bibliothèque non officielle,
 *    2.5.0) et son service de signature Euler Stream (gratuit, 2 500 requêtes par jour sans clé). Elle
 *    peut casser du jour au lendemain quand TikTok change son site : c est pour cela que la console
 *    garde la SAISIE MANUELLE en secours, et que ce module DIT son état au lieu de se taire.
 *    Aucun compte TikTok, aucun mot de passe : on lit un direct public, on n écrit rien dedans.
 * ⚠ Le module est ESM seulement : il est chargé par `import()` (la fonction `charger` est injectée —
 *    le banc tools/banc-encan.js passe une imitation, sans réseau).
 *
 * ÉTATS : eteint · connexion · branche · hors_ligne (le compte n est pas en direct : on réessaie toutes les
 *         30 s, pour se brancher dès qu il commence) · coupe (connexion perdue : reconnexion 2, 5, 10, 20,
 *         30 s…) · fin (le direct est terminé) · erreur (bibliothèque absente, limite du service…).
 */

const ATTENTES_COUPE = [2000, 5000, 10000, 20000, 30000];
const ATTENTE_HORS_LIGNE = 30000;
const ATTENTE_LIMITE = 60000;

function normaliserCompte(c) {
  let s = String(c == null ? '' : c).trim();
  const m = /tiktok\.com\/@([A-Za-z0-9._]+)/i.exec(s);
  if (m) s = m[1];
  s = s.replace(/^@+/, '');
  return /^[A-Za-z0-9._]{2,24}$/.test(s) ? s : '';
}

class DirectTikTok {
  constructor(opts) {
    this.charger = opts.charger;                       // async () => module tiktok-live-connector
    this.surCommentaire = opts.surCommentaire || (() => {});
    this.surEtat = opts.surEtat || (() => {});
    this.maintenant = opts.maintenant || (() => Date.now());
    this.planifier = opts.planifier || ((f, ms) => setTimeout(f, ms));
    this.annulerPlan = opts.annulerPlan || ((t) => clearTimeout(t));
    this.statut = 'eteint';
    this.compte = '';
    this.detail = '';
    this.roomId = '';
    this.nb = 0;
    this.dernier = 0;
    this.depuis = 0;
    this.essais = 0;
    this._recents = [];      // heures des commentaires de la dernière minute
    this._conn = null;
    this._plan = null;
    this._tour = 0;          // chaque (re)connexion a son numéro : un rappel d une ancienne est ignoré
  }

  etat() {
    const t = this.maintenant();
    this._recents = this._recents.filter((x) => t - x < 60000);
    return { statut: this.statut, compte: this.compte, detail: this.detail, roomId: this.roomId, nb: this.nb,
      dernier: this.dernier, depuis: this.depuis, parMinute: this._recents.length, essais: this.essais,
      prochainEssai: this._prochain || 0 };
  }

  _changer(statut, detail) {
    this.statut = statut;
    this.detail = detail || '';
    try { this.surEtat(this.etat()); } catch (e) {}
  }

  brancher(compteBrut) {
    const compte = normaliserCompte(compteBrut);
    if (!compte) return { ok: false, motif: 'compte_invalide' };
    this.debrancher(true);
    this.compte = compte;
    this.nb = 0; this.dernier = 0; this.essais = 0; this._recents = [];
    this._connecter();
    return { ok: true, compte };
  }

  debrancher(silencieux) {
    this._tour++;
    if (this._plan) { this.annulerPlan(this._plan); this._plan = null; }
    this._prochain = 0;
    const c = this._conn; this._conn = null;
    if (c) { try { c.removeAllListeners && c.removeAllListeners(); } catch (e) {} try { const p = c.disconnect(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
    if (!silencieux) this._changer('eteint');
    return { ok: true };
  }

  _replanifier(ms) {
    if (this._plan) this.annulerPlan(this._plan);
    const tour = this._tour;
    this._prochain = this.maintenant() + ms;
    this._plan = this.planifier(() => { this._plan = null; if (tour === this._tour) this._connecter(); }, ms);
  }

  async _connecter() {
    const tour = ++this._tour;
    this.essais++;
    this._prochain = 0;
    this._changer('connexion');
    let m;
    try { m = await this.charger(); }
    catch (e) { if (tour === this._tour) this._changer('erreur', 'bibliotheque:' + String((e && e.message) || e).slice(0, 160)); return; }
    if (tour !== this._tour) return;
    let c;
    try { c = new m.TikTokLiveConnection(this.compte, {}); }
    catch (e) { this._changer('erreur', String((e && e.message) || e).slice(0, 160)); return; }
    this._conn = c;
    const ev = m.WebcastEvent || {}, ce = m.ControlEvent || {};
    c.on(ev.CHAT || 'chat', (d) => {
      if (tour !== this._tour) return;
      const u = (d && d.user) || {};
      const pseudo = String(u.uniqueId || u.nickname || '').trim();
      const texte = String((d && d.comment) || '');
      if (!pseudo) return;
      const t = this.maintenant();
      this.nb++; this.dernier = t; this._recents.push(t);
      try { this.surCommentaire(pseudo, texte); } catch (e) {}
    });
    c.on(ce.DISCONNECTED || 'disconnected', (e) => {
      if (tour !== this._tour || this.statut === 'fin') return;
      this._conn = null;
      this._couper('connexion perdue' + (e && e.code ? ' (' + e.code + ')' : ''));
    });
    c.on(ev.STREAM_END || 'streamEnd', () => {
      if (tour !== this._tour) return;
      this._tour++;
      this._conn = null;
      try { const p = c.disconnect(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
      this._changer('fin', 'le direct est terminé');
    });
    c.on(ce.ERROR || 'error', (e) => { if (tour === this._tour) this.detail = String((e && (e.message || e.info)) || e).slice(0, 160); });
    try {
      const s = await c.connect();
      if (tour !== this._tour) { try { c.disconnect(); } catch (e) {} return; }
      this.roomId = String((s && s.roomId) || '');
      this.depuis = this.maintenant();
      this._ordreCoupe = 0;
      this._changer('branche');
    } catch (e) {
      if (tour !== this._tour) return;
      this._conn = null;
      const nom = (e && e.constructor && e.constructor.name) || '';
      if (nom === 'UserOfflineError') { this._changer('hors_ligne', 'pas en direct pour l’instant'); this._replanifier(ATTENTE_HORS_LIGNE); return; }
      if (nom === 'SignatureRateLimitError') { this._changer('erreur', 'limite du service de signature atteinte'); this._replanifier(ATTENTE_LIMITE); return; }
      if (nom === 'InvalidUniqueIdError' || nom === 'InvalidResponseCompositeError') { this._changer('erreur', 'compte introuvable ou direct illisible'); this._replanifier(ATTENTE_HORS_LIGNE); return; }
      this._couper(String((e && e.message) || e).slice(0, 160));
    }
  }

  _couper(detail) {
    const i = Math.min(this._ordreCoupe || 0, ATTENTES_COUPE.length - 1);
    this._ordreCoupe = (this._ordreCoupe || 0) + 1;
    this._changer('coupe', detail);
    this._replanifier(ATTENTES_COUPE[i]);
  }
}

module.exports = { DirectTikTok, normaliserCompte };
