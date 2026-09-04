'use strict';

/*
 * FENÊTRE « FICHE CLIENT » — NATIVE, DEUX MODES (fiche / édition)
 * =============================================================================
 * ⚠ CE QUI N'EN SORT JAMAIS : le mot de passe. Il part vers le site par le
 * canal séparé (client:ecrire → DB.changeUserPassword, haché bcrypt au
 * serveur), n'est jamais relu, jamais affiché ailleurs que dans le champ où on
 * vient de le taper. Et le résultat est ATTENDU avant d'être annoncé.
 *
 * ⚠ LES GESTES D'ÉTAT ONT CHACUN LEUR POIDS : désactiver est réversible d'un
 * clic ; la corbeille conserve tout ; la PURGE est irréversible et refusée dès
 * qu'il existe une commande (6 ans d'obligation fiscale) — et on le dit AVANT
 * le clic, le bouton n'apparaît pas sur un dossier non purgeable.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS — onzième rappel du projet.
 */

const { JS_ACTIVITE, JS_DIRE, JS_BROUILLON, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .av{width:36px;height:36px;border-radius:50%;flex:0 0 auto;
  display:flex;align-items:center;justify-content:center;font-weight:700;
  background:linear-gradient(135deg,#c9a97e,#8a6f4d);color:#17202c}
.tete .mail{font-size:.72rem;color:var(--tx2)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.tete .pill{font-size:.68rem;padding:.12rem .55rem;border-radius:99px;
  border:1px solid var(--v22);margin-left:.5rem}
.pill.vert{border-color:rgba(74,222,128,.5);color:var(--tx-ok)}
.pill.gris{color:var(--tx2)}
.pill.rouge{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
.corps{flex:1 1 auto;min-height:0;padding:.75rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.55rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:.6rem .75rem;flex:0 0 auto}
.carte h2{margin:0 0 .45rem;font-size:.71rem;text-transform:uppercase;
  letter-spacing:.09em;color:var(--tx2);font-weight:700}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:.5rem}
.tuile{background:var(--v03);border:1px solid var(--v08);
  border-radius:9px;padding:.5rem .65rem}
.tuile .k{font-size:.64rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.tuile .v{font:700 1.15rem/1.3 Georgia,serif;color:var(--tx-creme)}
.ligne{display:flex;justify-content:space-between;gap:1rem;padding:.32rem 0;
  border-bottom:1px solid var(--v05);font-size:.85rem}
.ligne .k{color:var(--tx2)}
.cmd{display:flex;align-items:center;gap:.6rem;padding:.32rem .4rem;border-radius:7px;
  border-top:1px solid var(--v05);font-size:.85rem}
.cmd .num{font-family:ui-monospace,monospace;font-size:.78rem;color:var(--tx-or)}
.cmd .d{flex:1 1 auto;min-width:0}
.cmd .fin{color:var(--tx2);font-size:.78rem;white-space:nowrap}
input,select{font:inherit;color:var(--tx);background:var(--f-champ);
  border:1px solid var(--v16);border-radius:8px;padding:.32rem .5rem;
  width:100%;min-width:0}
input:focus,select:focus{outline:none;border-color:#c9a97e}
input[type=checkbox]{width:auto}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem}
.ch{display:flex;flex-direction:column;gap:.18rem;min-width:0}
.ch label{font-size:.7rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.04em}
.ch.large{grid-column:1/-1}
button{font:inherit;cursor:pointer;border-radius:8px;padding:.32rem .7rem;
  border:1px solid var(--v16);background:var(--v05);
  color:var(--tx);transition:background .13s,border-color .13s}
button:hover:not(:disabled){background:var(--v11);border-color:var(--v30)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#17202c;font-weight:600}
button.danger{border-color:rgba(248,113,113,.5);color:var(--tx-err2)}
button.danger:hover:not(:disabled){background:rgba(248,113,113,.12)}
button.mini{padding:.14rem .5rem;font-size:.75rem}
.aide{font-size:.73rem;color:var(--tx2);line-height:1.45}
.pied{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;
  gap:.6rem;padding:.55rem 1.05rem;border-top:1px solid var(--v08);
  background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.actions{flex:0 0 auto;display:flex;gap:.4rem;flex-wrap:wrap}
.vide{padding:1.6rem 1rem;text-align:center;color:var(--tx2);font-size:.86rem}
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.5rem;z-index:50}
.voile .boite{background:var(--f-carte);border:1px solid var(--v11);
  border-radius:13px;padding:1.1rem 1.25rem;max-width:30rem;width:100%}
.voile h3{margin:0 0 .55rem;font:700 1.05rem/1.25 Georgia,serif}
.voile p{margin:.35rem 0;font-size:.86rem}
.voile .fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Fiche client ». `id` = client. */
function pageClient(id) {
  const depart = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Fiche client — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="av" id="t-av">?</span>
  <div><h1 id="titre">Fiche client</h1><div class="mail" id="t-mail"></div></div>
  <span class="pill gris" id="pill" style="display:none"></span>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions" id="actions"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}${JS_BROUILLON}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var actions = document.getElementById('actions');
  var sous = document.getElementById('sous');

  var ID = ${depart};
  var R = null;
  var EDITION = false;
  var enCours = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function argent(n){
    var v = (Math.round((parseFloat(n) || 0) * 100) / 100).toFixed(2);
    return v.replace('.', ',') + ' $';
  }
  function dateFr(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  var MOTIFS = {
    session: 'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit: 'Votre rôle ne donne pas accès aux clients.',
    indisponible: 'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible: 'La fenêtre principale ne répond pas.',
    delai: 'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    introuvable: 'Ce client n’existe plus.',
    verrou: 'Fiche ouverte par quelqu’un d’autre.',
    nom_requis: 'Prénom et nom requis.',
    courriel_invalide: 'Adresse courriel invalide.',
    courriel_pris: 'Cette adresse courriel est déjà utilisée par un autre compte.',
    tel_invalide: 'Numéro de téléphone invalide.',
    mdp_court: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
    mdp_echec: 'Mot de passe NON changé — réessayez.',
    pas_en_corbeille: 'Le compte doit d’abord être mis à la corbeille.',
    refus_serveur: 'Suppression refusée par le serveur — le compte est intact.',
    echec: 'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    if (m === 'verrou') return MOTIFS.verrou + (r.parQui ? ' (' + r.parQui + ')' : '');
    if (m === 'commandes_presentes') return 'Suppression définitive impossible : ' + (r.nb || '?')
      + ' commande(s) — conservation fiscale de 6 ans. Le compte reste en corbeille.';
    if (r && r.detail) return r.detail;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="carte"><div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div></div>';
    actions.innerHTML = '';
  }
  function val(id2){ var e = document.getElementById(id2); return e ? e.value : ''; }
  function coche(id2){ var e = document.getElementById(id2); return !!(e && e.checked); }

  // ══ DESSIN ════════════════════════════════════════════════════════════════
  function dessiner(){
    var c = R.client;
    document.getElementById('t-av').textContent =
      ((c.prenom[0] || '') + (c.nom[0] || '')).toUpperCase() || '?';
    document.getElementById('titre').textContent = (c.prenom + ' ' + c.nom).trim() || 'Client';
    document.getElementById('t-mail').textContent = c.courriel;
    var pill = document.getElementById('pill');
    pill.style.display = '';
    pill.className = 'pill ' + (c.supprime ? 'rouge' : (c.actif ? 'vert' : 'gris'));
    pill.textContent = c.supprime ? '🗑 Supprimé' : (c.actif ? 'Actif' : 'Inactif');
    if (EDITION) dessinerEdition(); else dessinerFiche();
  }

  function dessinerFiche(){
    var c = R.client, a = c.adresse;
    var h = '<div class="carte"><div class="tuiles">'
      + '<div class="tuile"><div class="k">Commandes</div><div class="v">' + R.stats.commandes + '</div></div>'
      + '<div class="tuile"><div class="k">Retours</div><div class="v"' + (R.stats.retours ? ' style="color:var(--tx-err2)"' : '') + '>' + R.stats.retours + '</div></div>'
      + '<div class="tuile"><div class="k">Total dépensé</div><div class="v">' + argent(R.stats.totalDepense) + '</div></div>'
      + '<div class="tuile"><div class="k">Inscrit le</div><div class="v" style="font-size:.92rem">' + esc(dateFr(c.inscritLe)) + '</div></div>'
      + '</div></div>';
    h += '<div class="carte"><h2>Coordonnées</h2>'
      + (c.tel ? '<div class="ligne"><span class="k">Téléphone</span><span>' + esc(c.tel) + '</span></div>' : '')
      + '<div class="ligne"><span class="k">Adresse</span><span style="text-align:right">'
      + esc([a.rue, a.ville, a.province, a.codePostal, a.pays].filter(Boolean).join(', ') || '—') + '</span></div>'
      + '<div class="ligne"><span class="k">Langue des courriels</span><span>' + (c.langue === 'en' ? 'English' : 'Français') + '</span></div>'
      + (c.supprime && c.supprimeLe ? '<div class="ligne"><span class="k">Supprimé le</span><span>' + esc(dateFr(c.supprimeLe)) + '</span></div>' : '')
      + '</div>';
    h += '<div class="carte"><h2>Commandes récentes <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx3)">— '
      + R.stats.commandes + ' au total</span></h2>'
      + (R.dernieres.length
        ? R.dernieres.map(function(o){
            return '<div class="cmd"><span class="num">' + esc(o.numero) + '</span>'
              + '<div class="d"></div><span class="fin">' + esc(dateFr(o.date)) + ' · ' + argent(o.total) + '</span></div>'; }).join('')
          + (R.stats.commandes > 6 ? '<div class="aide" style="text-align:center;padding-top:.35rem">+ '
            + (R.stats.commandes - 6) + ' autre' + (R.stats.commandes - 6 > 1 ? 's' : '')
            + ' — voir la fenêtre Commandes</div>' : '')
        : '<div class="aide">Aucune commande.</div>')
      + '</div>';
    corps.innerHTML = h;

    var c2 = R.client;
    var b = '';
    if (c2.supprime) {
      if (R.peutEcrire) b += '<button class="prim" id="btn-restaurer">↩ Restaurer</button>';
      b += '<button id="btn-releve"><span class="ic">📄</span> État de compte</button>';
      /* ⚠ Le bouton de purge N APPARAIT PAS sur un dossier non purgeable : une
         commande impose 6 ans de conservation, et un bouton qui refuse toujours
         fait chercher la panne ailleurs. La fiche le DIT a la place. */
      if (R.peutSupprimer && R.purgeable) b += '<button class="danger" id="btn-purger"><span class="ic">🗑</span> Supprimer définitivement</button>';
    } else {
      if (R.peutEcrire) b += '<button class="prim" id="btn-modifier">✎ Modifier</button>';
      b += '<button id="btn-releve"><span class="ic">📄</span> État de compte</button>';
      if (R.peutEcrire) b += '<button id="btn-etat">' + (c2.actif ? '⏸ Désactiver' : '▶ Activer') + '</button>';
      if (R.peutSupprimer) b += '<button class="danger" id="btn-corbeille"><span class="ic">🗑</span> Supprimer</button>';
    }
    actions.innerHTML = b;
    if (c2.supprime && !R.purgeable && R.peutSupprimer) {
      dire('Suppression définitive impossible : ' + R.stats.commandes + ' commande(s) — conservation fiscale de 6 ans.', 'att');
    }
    brancherFiche();
  }

  function dessinerEdition(){
    var c = R.client, a = c.adresse;
    var h = '<div class="carte"><h2>Identité</h2><div class="r2">'
      + '<div class="ch"><label for="e-prenom">Prénom</label><input id="e-prenom" value="' + esc(c.prenom) + '"></div>'
      + '<div class="ch"><label for="e-nom">Nom</label><input id="e-nom" value="' + esc(c.nom) + '"></div>'
      + '<div class="ch"><label for="e-courriel">Adresse courriel</label><input id="e-courriel" inputmode="email" value="' + esc(c.courriel) + '"></div>'
      + '<div class="ch"><label for="e-tel">Téléphone</label><input id="e-tel" inputmode="tel" value="' + esc(c.tel) + '"></div>'
      + '</div></div>';
    h += '<div class="carte"><h2>Adresse de livraison</h2><div class="r2">'
      + '<div class="ch large"><label for="e-rue">Rue</label><input id="e-rue" value="' + esc(a.rue) + '"></div>'
      + '<div class="ch"><label for="e-ville">Ville</label><input id="e-ville" value="' + esc(a.ville) + '"></div>'
      + '<div class="ch"><label for="e-prov">Province</label><select id="e-prov">'
      + R.provinces.map(function(p){ return '<option value="' + p + '"' + (p === a.province ? ' selected' : '') + '>' + p + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="e-postal">Code postal</label><input id="e-postal" value="' + esc(a.codePostal) + '"></div>'
      + '<div class="ch"><label for="e-pays">Pays</label><input id="e-pays" value="' + esc(a.pays) + '"></div>'
      + '<div class="ch large"><label for="e-langue">Langue des courriels</label><select id="e-langue">'
      + '<option value="fr"' + (c.langue !== 'en' ? ' selected' : '') + '><span class="ic">🇫🇷</span> Français (par défaut)</option>'
      + '<option value="en"' + (c.langue === 'en' ? ' selected' : '') + '><span class="ic">🇬🇧</span> English</option>'
      + '</select></div>'
      + '</div></div>';
    h += '<div class="carte"><h2>Mot de passe</h2>'
      + '<div style="display:flex;gap:.45rem;align-items:flex-end">'
      + '<div class="ch" style="flex:1"><label for="e-mdp">Nouveau (laisser vide = inchangé)</label>'
      + '<input id="e-mdp" type="password" placeholder="Min. 6 caractères" autocomplete="new-password"></div>'
      + '<button class="mini" id="btn-voir" title="Afficher / masquer"><span class="ic">👁</span></button>'
      + '<button class="mini" id="btn-gen"><span class="ic">🎲</span> Générer</button>'
      + '</div>'
      + '<label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;color:var(--tx2);margin-top:.5rem;cursor:pointer">'
      + '<input type="checkbox" id="e-aviser" checked> Aviser le client par courriel de ce changement</label>'
      + '<div class="aide" style="margin-top:.3rem">Le mot de passe part par un canal séparé et le serveur le hache — '
      + 'il n’est jamais gardé en clair, ni ici ni ailleurs.</div>'
      + '</div>';
    corps.innerHTML = h;
    actions.innerHTML = '<button id="btn-annuler">← Fiche</button>'
      + '<button class="prim" id="btn-enr">Enregistrer</button>';
    brancherEdition();
  }

  // ══ ECOUTEURS ═════════════════════════════════════════════════════════════
  function brancherFiche(){
    var m = document.getElementById('btn-modifier');
    /* Le dessin D ABORD : la boite de reprise remplit des champs qui n existent
       qu apres lui. */
    if (m) m.onclick = function(){ EDITION = true; dessiner(); szBrouillonProposer(); };
    var rl = document.getElementById('btn-releve');
    if (rl) rl.onclick = function(){
      dire('Impression de l’état de compte…');
      appeler('client:etatCompte', [ID]).then(function(r){
        dire(r.ok ? 'État de compte envoyé à l’impression.' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var et = document.getElementById('btn-etat');
    if (et) et.onclick = function(){
      var versActif = !R.client.actif;
      appeler('client:etat', [ID, versActif]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(versActif ? 'Compte activé.' : 'Compte désactivé.', 'bon');
        recharger();
      });
    };
    var cb = document.getElementById('btn-corbeille');
    if (cb) cb.onclick = function(){
      voile('<h3><span class="ic">🗑</span> Supprimer le client ?</h3>'
        + '<p><strong>' + esc(R.client.prenom + ' ' + R.client.nom) + '</strong> (' + esc(R.client.courriel) + ')</p>'
        + '<p class="aide"><span class="ic">🛡</span> Le compte part dans la corbeille et reste restaurable à tout moment. '
        + (R.stats.commandes ? 'L’historique de ' + R.stats.commandes + ' commande(s) est conservé intégralement.' : '') + '</p>'
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="danger" id="v-oui">Supprimer</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            fermer();
            appeler('client:corbeille', [ID]).then(function(r){
              if (!r.ok) { dire(expliquer(r), 'err'); return; }
              dire('Client mis à la corbeille.', 'bon');
              recharger();
            });
          };
        });
    };
    var rs = document.getElementById('btn-restaurer');
    if (rs) rs.onclick = function(){
      appeler('client:restaurer', [ID]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Client restauré.', 'bon');
        recharger();
      });
    };
    var pg = document.getElementById('btn-purger');
    if (pg) pg.onclick = function(){
      voile('<h3>⚠ Supprimer définitivement ?</h3>'
        + '<p>Effacer <strong>' + esc(R.client.prenom + ' ' + R.client.nom) + '</strong> (' + esc(R.client.courriel) + ') de la base ?</p>'
        + '<p style="color:var(--tx-err2)">Cette action est IRRÉVERSIBLE : le dossier disparaît du nuage, il ne sera plus restaurable.</p>'
        + '<p class="aide">✅ Ce compte n’a aucune commande — rien de comptable n’est perdu.</p>'
        + '<div class="fin2"><button id="v-non">Annuler</button>'
        + '<button class="danger" id="v-oui"><span class="ic">🗑</span> Supprimer définitivement</button></div>',
        function(fermer){
          document.getElementById('v-non').onclick = fermer;
          document.getElementById('v-oui').onclick = function(){
            fermer();
            appeler('client:purger', [ID]).then(function(r){
              if (!r.ok) { dire(expliquer(r), 'err'); return; }
              dire('Compte supprimé définitivement.', 'bon');
              vide('Compte supprimé', 'Le dossier a été effacé de la base.');
            });
          };
        });
    };
  }
  function brancherEdition(){
    /* ⚠ IMMEDIAT, ET LES VALEURS SONT PRISES MAINTENANT : deux lignes plus bas le
       formulaire n existe plus. C est le defaut n°1 des Depenses, qui ne gardait
       que la categorie. */
    var an = document.getElementById('btn-annuler');
    if (an) an.onclick = function(){ szBrouillonMaintenant(); EDITION = false; dessiner(); };
    var bv = document.getElementById('btn-voir');
    if (bv) bv.onclick = function(){
      var i = document.getElementById('e-mdp');
      if (i) i.type = i.type === 'password' ? 'text' : 'password';
    };
    /* Generation LOCALE (l aleatoire du navigateur suffit pour un mot de passe
       temporaire que le client changera) — memes familles que l ecran du site :
       pas de caracteres ambigus (O/0, l/1). */
    var bg = document.getElementById('btn-gen');
    if (bg) bg.onclick = function(){
      var U = 'ABCDEFGHJKLMNPQRSTUVWXYZ', L = 'abcdefghjkmnpqrstuvwxyz', D = '23456789';
      var T = U + L + D;
      function p(s){ return s[Math.floor(Math.random() * s.length)]; }
      var mdp = p(U) + p(L) + p(D);
      for (var i = 0; i < 7; i++) mdp += p(T);
      mdp = mdp.split('').sort(function(){ return Math.random() - 0.5; }).join('');
      var champ = document.getElementById('e-mdp');
      if (champ) { champ.value = mdp; champ.type = 'text'; }
    };
    var enr = document.getElementById('btn-enr');
    if (enr) enr.onclick = enregistrer;
  }

  /* ══ LE BROUILLON DE LA FICHE CLIENT ══════════════════════════
     ⚠⚠ LE MOT DE PASSE N EN FAIT PAS PARTIE, ET C EST LA DECISION LA PLUS
     IMPORTANTE DE CE BLOC. Le brouillon vit dans le stockage du navigateur : y
     deposer un mot de passe en clair serait creer une fuite pour eviter une
     contrariete. << e-mdp >> et << e-aviser >> sont donc absents des listes ci-
     dessous, exprès. Si l on reprend un brouillon, le champ du mot de passe est
     vide — ce qui est aussi son comportement normal (vide = inchange).
     ⚠ UNE CLE PAR FICHE. Sans elle, une saisie laissee sur la fiche de madame
     Tremblay serait proposee sur celle de madame Gagnon : un formulaire qui a
     l air simplement rempli, et l on enregistrerait les coordonnees de l une
     chez l autre.
     ⚠ ET SEULEMENT CE QUI DIFFERE. On modifie une fiche EXISTANTE : proposer de
     << reprendre >> un formulaire identique a ce qui est en base n apprendrait
     rien et ferait douter. */
  var BR_CHAMPS = ['e-prenom', 'e-nom', 'e-courriel', 'e-tel', 'e-rue', 'e-ville',
    'e-prov', 'e-postal', 'e-pays', 'e-langue'];
  function brDeLaFiche(){
    var c = (R && R.client) || {}, a = c.adresse || {};
    return { 'e-prenom': c.prenom || '', 'e-nom': c.nom || '', 'e-courriel': c.courriel || '',
      'e-tel': c.tel || '', 'e-rue': a.rue || '', 'e-ville': a.ville || '',
      'e-prov': a.province || '', 'e-postal': a.codePostal || '', 'e-pays': a.pays || '',
      'e-langue': c.langue === 'en' ? 'en' : 'fr' };
  }
  szBrouillonBrancher({
    portee: 'client',
    libelle: 'Une modification de cette fiche',
    ttlMin: 720,
    cle: function(){ return 'c:' + ID; },
    actif: function(){ return !!(EDITION && R && R.client); },
    valeurs: function(){ return szBrouillonDuDom(BR_CHAMPS, []); },
    rempli: function(){
      var v = szBrouillonDuDom(BR_CHAMPS, []); if (!v) return false;
      var ref = brDeLaFiche();
      for (var i = 0; i < BR_CHAMPS.length; i++) {
        var k = BR_CHAMPS[i];
        if (String(v[k] == null ? '' : v[k]) !== String(ref[k])) return true;
      }
      return false;
    },
    remplir: function(v){ szBrouillonAuDom(v); },
  });
  szBrouillonEcouter();

  function enregistrer(){
    if (enCours) return;
    enCours = true; dire('Enregistrement…', 'att');
    appeler('client:ecrire', [ID, {
      prenom: val('e-prenom'), nom: val('e-nom'), courriel: val('e-courriel'),
      tel: val('e-tel'), langue: val('e-langue'),
      adresse: { rue: val('e-rue'), ville: val('e-ville'), province: val('e-prov'),
        codePostal: val('e-postal'), pays: val('e-pays') },
      nouveauMdp: val('e-mdp'), aviserMdp: coche('e-aviser'),
    }]).then(function(r){
      enCours = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire(r.mdpChange
        ? ('Fiche et mot de passe mis à jour.' + (r.avisEnvoye ? ' Client avisé par courriel.' : ''))
        : 'Fiche client mise à jour.', 'bon');
      /* ⚠ LE BROUILLON MEURT ICI, et seulement ici : le garder ferait concurrence
         a la fiche enregistree sans qu on sache laquelle fait foi. */
      szBrouillonJeter();
      EDITION = false;
      recharger();
    });
  }

  // ══ CHARGEMENT ════════════════════════════════════════════════════════════
  function recharger(){
    return appeler('client:lire', [ID]).then(function(r){
      if (!r.ok) { vide('Fiche indisponible', expliquer(r)); return; }
      R = r;
      if (!r.peutEcrire) sous.textContent = '👁 Lecture seule';
      dessiner();
    });
  }

  var VERROU_PRIS = false;
  function prendreVerrou(){
    appeler('verrou:prendre', ['users', ID]).then(function(v){
      if (!v || !v.ok) return;
      VERROU_PRIS = !!v.obtenu;
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ ouverte par ' + (v.parQui || 'quelqu’un d’autre');
      dire('Cette fiche est ouverte ailleurs — modifications bloquées.', 'att');
      R.peutEcrire = false;
      dessiner();
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    try { P.appeler('verrou:rendre'); } catch (e) {}
  }
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });
  window.szRevenir = function(){ EDITION = false; recharger(); };

  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    if (apres) apres(fermer);
    return fermer;
  }

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !document.querySelector('.voile')) { ev.preventDefault(); rendreVerrou(); P.fermer(); }
  });

  recharger().then(function(){ if (R) prendreVerrou(); });
})();
</script>
</body></html>`;
}

module.exports = { pageClient };
