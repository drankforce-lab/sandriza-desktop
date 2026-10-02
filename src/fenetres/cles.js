'use strict';

/*
 * FENÊTRE « CLÉS API » — NATIVE (Configuration, palier 5, dernier onglet de
 * « Paiement & taxes »)
 * =============================================================================
 * Les clés des services externes : Fal.ai (génération photo), Photoroom (retrait
 * du mannequin, production + sandbox), Groq (descriptions), Resend (courriel) et
 * Hugging Face (segmentation vêtement).
 *
 * ⚠⚠ AUCUNE CLÉ N'ARRIVE JAMAIS ICI. Le cœur ne rend que l'EXISTENCE de chaque clé
 * et ses quatre derniers caractères. Conséquence directe, et elle est visible à
 * l'écran : un champ laissé VIDE veut dire « garde la clé enregistrée », jamais
 * « efface-la ». Sans cette règle, ouvrir la fenêtre et changer le solde effacerait
 * toutes les clés. Pour RETIRER une clé, il y a un geste explicite en deux temps.
 *
 * ⚠ LE SOLDE FAL.AI N'EST PAS UN SECRET. Saisi à la main (fal.ai n'expose aucun
 * solde par API), il voyage en clair : la fenêtre l'affiche et le laisse modifier.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('cles');

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
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;
  padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.7rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* ⚠ LES CARTES D UNE MEME RANGEE SE TERMINENT A LA MEME HAUTEUR (2026-08-10) :
   pas d align-items:start, sinon la rangee finit en escalier. */
/* Colonnes automatiques d au moins 19,5 rem : quatre a 1400 px au lieu de deux —
   sept cartes sur deux colonnes depassaient la fenetre de 503 px (sonde des
   debordements, 2026-09-26 : « je ne veux pas de scroll bar »). */
.rangee{display:block;columns:19.5rem;column-gap:.8rem}
/* ⚠ EN COLONNES EQUILIBREES (un mur), pas en grille : les cartes ont des
   hauteurs tres inegales, et une grille donne a chaque rangee la hauteur de sa
   plus haute — c est ce qui restait de trop (68 px). */
.rangee > *{break-inside:avoid;margin:0 0 .65rem;display:inline-block;width:100%}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column}
.carte .tt{display:flex;align-items:center;gap:.5rem;margin:0 0 .2rem}
.carte h2{margin:0;font:700 .82rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.05em;color:var(--tx-bleute)}
.carte .lien{margin-left:auto;white-space:nowrap;flex:0 0 auto;font-size:.72rem;color:var(--tx2);text-decoration:none;
  border:1px solid var(--v14);border-radius:7px;padding:.14rem .5rem}
.carte .lien:hover{color:var(--tx);border-color:var(--v30)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.ch{margin:0 0 .8rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch .aide{font-size:.72rem;color:var(--tx3);margin-top:.2rem}
.ch input{width:100%;font:inherit;font-family:ui-monospace,Consolas,monospace;font-size:.84rem;
  color:var(--tx);background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.ch input.solde{font-family:inherit;max-width:12rem}
.etat{display:flex;align-items:center;gap:.6rem;margin-top:.28rem;flex-wrap:wrap}
.etat .txt{font-size:.76rem;color:var(--tx2)}
.etat .txt b{color:var(--tx-ok)}
.etat.non .txt b{color:var(--tx-jaune)}
.etat button{font:inherit;font-size:.74rem;color:var(--tx-f0a0a0);background:rgba(248,113,113,.08);
  border:1px solid rgba(248,113,113,.3);border-radius:7px;padding:.16rem .55rem;cursor:pointer}
.etat button:hover:not(:disabled){background:rgba(248,113,113,.16)}
.etat button.conf{color:var(--tx-err2);border-color:rgba(248,113,113,.55);font-weight:700}
.etat button.annu{color:var(--tx2);background:transparent;border-color:var(--v16)}
.etat button:disabled{opacity:.5;cursor:default}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.55rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageClesConfig() {
  return `${TETE()}
<title>${T("Clés API — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.cles}</span><h1>${T("Clés API")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter les clés, pas les modifier.")}</div>
<div class="corps" id="corps"><div class="carte"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>${T("Enregistrer les clés")}</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false;
  var ARME = {}; // champs dont le retrait est ARME (premier clic), en attente de confirmation

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès à la configuration.")}',
    lecture_seule:      '${T("Votre rôle est en lecture seule : les clés ne peuvent pas être modifiées.")}',
    cle_inconnue:       '${T("Cette clé est inconnue.")}',
    rien_a_ecrire:      '${T("Aucun changement à enregistrer.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    nuage:              '${T("L’enregistrement dans le nuage a échoué. Réessayez.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // Les services, et leurs champs. La clef << k >> est celle attendue par le coeur
  // (Admin._clesDonnees / _clesEcrireCoeur / _clesRetirer).
  var SERVICES = [
    { titre: '${T("Fal.ai — Génération photo IA")}',
      sous: '${T("Habillage mannequin virtuel (IDM-VTON) sur les vues produit.")}',
      lien: ['fal.ai', 'https://fal.ai'],
      champs: [{ k: 'fal', label: '${T("Clé API")}', place: 'xxxxxxxx:xxxx…',
        aide: '${T("Gratuit à l’inscription — Dashboard puis API Keys sur fal.ai.")}' }],
      solde: true },
    { titre: '${T("Photoroom — Retrait du mannequin")}',
      sous: '${T("Le « mannequin fantôme ». Sans clé, la photothèque se rabat sur un détourage par masque.")}',
      lien: ['photoroom.com', 'https://www.photoroom.com/api'],
      champs: [
        { k: 'photoroom', label: '${T("Clé de PRODUCTION")}', place: '${T("clé de production (sans préfixe)")}',
          aide: '${T("Vrais traitements, pleine qualité, sans filigrane. Exige le plan Plus.")}' },
        { k: 'photoroomSandbox', label: '${T("Clé SANDBOX (aperçus)")}', place: '${T("sandbox_… (facultatif)")}',
          aide: '${T("Aperçus gratuits (filigranés, aucun crédit). Vide : dérivée de la clé de production.")}' }] },
    { titre: '${T("Groq — Description IA")}',
      sous: '${T("Génération de descriptions de produits à partir de la photo.")}',
      lien: ['console.groq.com', 'https://console.groq.com/keys'],
      champs: [{ k: 'groq', label: '${T("Clé API")}', place: 'gsk_…',
        aide: '${T("Gratuit — modèle llama-3.3-70b-versatile.")}' }] },
    /* Anthropic : la SEULE cle de la maison qui ne descend jamais dans la page.
       Elle monte au nuage et n en revient pas ; ia-texte-proxy.php la lit au
       serveur. L ecran n en connait que les quatre derniers caracteres, assez
       pour dire << celle-ci est bien la bonne >>, rien pour s en servir. */
    { titre: '${T("Anthropic — Écriture publicitaire IA")}',
      sous: '${T("Rédige les courriels et les publications à partir du contenu du site. Facturé au texte produit : le plafond mensuel ci-dessous est la seule limite de dépense.")}',
      lien: ['console.anthropic.com', 'https://console.anthropic.com/settings/keys'],
      champs: [{ k: 'iaTexte', label: '${T("Clé API")}', place: 'sk-ant-…',
        aide: '${T("Payant à l’usage. La clé reste au serveur : elle n’est jamais recopiée dans l’application.")}' }],
      budget: true },
    { titre: '${T("Resend — Courriel transactionnel")}',
      sous: '${T("Infolettres, confirmations de commande, cartes-cadeaux.")}',
      lien: ['resend.com', 'https://resend.com/api-keys'],
      champs: [{ k: 'resend', label: '${T("Clé API")}', place: 're_…',
        aide: '${T("Les paramètres d’expéditeur se règlent dans Newsletter puis Configuration.")}' }] },
    { titre: '${T("Hugging Face — Segmentation vêtement")}',
      sous: '${T("Isole le vêtement avant correction de couleur (exclut peau, visage, cheveux).")}',
      lien: ['huggingface.co', 'https://huggingface.co/settings/tokens'],
      champs: [{ k: 'hf', label: '${T("Token d’accès")}', place: 'hf_…',
        aide: '${T("Gratuit — Settings, Access Tokens, New token (Read). Modèle segformer_b2_clothes.")}' }] }
  ];

  function champHtml(c){
    var e = (D && D[c.k]) || { defini: false, fin: '' };
    return '<div class="ch"><label for="f-' + c.k + '">' + esc(c.label) + '</label>'
      + '<input id="f-' + c.k + '" type="password" value="" placeholder="'
      + (e.defini ? '${T("inchangé")}' : esc(c.place)) + '" autocomplete="off"'
      + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">' + esc(c.aide) + '</div>'
      + '<div class="etat' + (e.defini ? '' : ' non') + '" id="etat-' + c.k + '">'
      + etatInterne(c.k, e) + '</div></div>';
  }
  function soldeHtml(){
    var sv = (D && D.falSolde) || '';
    var maj = (D && D.falSoldeMaj) ? ('${T(" — saisi le ")}' + esc(szJour(String(D.falSoldeMaj).slice(0, 10)))) : '';
    return '<div class="ch"><label for="f-falSolde">${T("Solde du compte (saisi à la main)")}</label>'
      + '<input id="f-falSolde" class="solde" type="number" step="0.01" min="0" value="' + esc(sv) + '"'
      + ' placeholder="${T("ex. 25.00")}"' + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">${T("fal.ai n’expose aucun solde par API. La fenêtre Traitements d’image affiche ")}'
      + '${T("ce montant et la consommation mesurée depuis")}' + maj + '${T(". À tenir à jour.")}</div></div>';
  }
  /* Le plafond mensuel de l ecriture IA. Ce n est pas un solde a tenir a jour
     comme celui de fal.ai : c est une BORNE, et la passerelle la lit AVANT
     chaque appel. Depassee, elle repond 402 et n appelle rien. Vide = 25 $. */
  function budgetHtml(){
    var bv = (D && D.iaBudget) || '';
    return '<div class="ch"><label for="f-iaBudget">${T("Plafond de dépense par mois ($ US)")}</label>'
      + '<input id="f-iaBudget" class="solde" type="number" step="1" min="0" value="' + esc(bv) + '"'
      + ' placeholder="${T("ex. 25")}"' + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">${T("Vérifié avant chaque appel : une fois le plafond atteint, l’écriture IA s’arrête ")}'
      + '${T("d’elle-même jusqu’au mois suivant. 0 lève la limite.")}</div></div>';
  }
  function etatInterne(k, e){
    /* Refonte fine (2026-09-26) : l etat se DIT en pastille, la fin de la cle
       en code — la meme forme que Telephonie, Paiements et Transporteurs. */
    if (!e.defini) return '<span class="rf-pill ambre">${T("Aucune clé enregistrée")}</span>';
    if (ARME[k]) {
      return '<span class="txt">${T("Retirer la clé enregistrée ?")}</span>'
        + '<button class="conf" data-conf="' + k + '"' + (RO ? ' disabled' : '') + '>${T("Confirmer le retrait")}</button>'
        + '<button class="annu" data-annu="' + k + '">${T("Annuler")}</button>';
    }
    return '<span class="rf-pill vert">${T("Clé enregistrée")}</span>'
      + '<span class="rf-code">…' + esc(e.fin) + '</span>'
      + '<button data-retirer="' + k + '"' + (RO ? ' disabled' : '') + '>${T("Retirer")}</button>';
  }

  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    var h = ['<div class="rangee">'];
    SERVICES.forEach(function(s){
      h.push('<div class="carte"><div class="tt"><h2>' + esc(s.titre) + '</h2>'
        + '<a class="lien" href="' + esc(s.lien[1]) + '" target="_blank" rel="noopener">' + esc(s.lien[0]) + '</a></div>');
      h.push('<p class="sous">' + esc(s.sous) + '</p>');
      s.champs.forEach(function(c){ h.push(champHtml(c)); });
      if (s.solde) h.push(soldeHtml()); // le solde fal.ai, sous sa cle, dans la meme carte
      if (s.budget) h.push(budgetHtml()); // le plafond IA, sous sa cle, meme principe
      h.push('</div>');
    });
    h.push('</div>');
    corps.innerHTML = h.join('');
    brancher();
    bsave.disabled = RO || OCCUPE;
  }

  function brancher(){
    corps.querySelectorAll('[data-retirer]').forEach(function(b){
      b.onclick = function(){ if (RO) return; var k = b.getAttribute('data-retirer');
        ARME[k] = true; rafraichirEtat(k); };
    });
    corps.querySelectorAll('[data-annu]').forEach(function(b){
      b.onclick = function(){ var k = b.getAttribute('data-annu'); ARME[k] = false; rafraichirEtat(k); };
    });
    corps.querySelectorAll('[data-conf]').forEach(function(b){
      b.onclick = function(){ retirer(b.getAttribute('data-conf')); };
    });
  }

  function rafraichirEtat(k){
    var el = document.getElementById('etat-' + k);
    if (!el) return;
    var e = (D && D[k]) || { defini: false, fin: '' };
    el.className = 'etat' + (e.defini ? '' : ' non');
    el.innerHTML = etatInterne(k, e);
    brancher();
  }

  function occuper(o){ OCCUPE = o; bsave.disabled = o || RO;
    corps.querySelectorAll('button').forEach(function(b){ b.disabled = o || RO; }); }

  function enregistrer(){
    if (RO || OCCUPE) return;
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    var saisie = { falSolde: v('f-falSolde'), iaBudget: v('f-iaBudget') };
    SERVICES.forEach(function(s){ s.champs.forEach(function(c){ saisie[c.k] = v('f-' + c.k); }); });
    occuper(true); dire('${T("Enregistrement…")}');
    appeler('config:cles:ecrire', [saisie]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        D = r; RO = !r.peutModifier; ARME = {}; dessiner();
        dire(r.rien ? '${T("Aucun changement.")}' : '${T("Clés enregistrées.")}', r.rien ? 'att' : 'bon');
      } else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;

  function retirer(k){
    if (RO || OCCUPE) return;
    occuper(true); dire('${T("Retrait…")}');
    appeler('config:cles:retirer', [k]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; ARME = {}; dessiner(); dire('${T("Clé retirée.")}', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('${T("Lecture…")}');
    appeler('config:cles:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide m-' + ((r && r.motif) || 'echec') + '">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      D = r; RO = !r.peutModifier; dessiner(); dire('');
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageClesConfig };
