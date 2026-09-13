'use strict';

/*
 * FENÊTRE « ÉTAT DE COMPTE » — NATIVE (1.62.0)
 * =============================================================================
 * Le relevé du compte d'un client, MONTRÉ avant d'être imprimé, et qu'on peut
 * envoyer au client par courriel (demandé le 2026-08-09 : « je dois pouvoir le
 * voir avant de l'imprimer et me donner la possibilité de l'envoyer au client
 * par courriel »).
 *
 * ⚠ LE DOCUMENT VIENT DU SITE, TEL QUEL (etat:lire → Billing._statementCorps).
 * L'aperçu, l'impression et le courriel partent du MÊME gabarit : trois copies
 * finiraient par ne plus se ressembler, et c'est le genre d'écart qu'on ne voit
 * qu'une fois le document chez le client.
 *
 * ⚠ LE DOCUMENT EST UN IMPRIMÉ : fond blanc, texte noir, dans les DEUX modes.
 * Il ne suit pas le thème de la fenêtre — une facture grise sur fond sombre
 * n'est pas ce qui sortira de l'imprimante, et l'aperçu doit montrer la feuille.
 * Seul le décor (en-tête, pied, boutons) suit le mode jour/nuit.
 *
 * ⚠ ENVOYER N'EST PAS « ENVOYÉ ». Le verdict dit l'adresse réelle, ou pourquoi
 * le courriel n'est pas parti — jamais un succès de politesse.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');

/* La langue du poste, resolue A LA GENERATION : la page naît dans la bonne
   langue. ⚠⚠⚠ On ne traduit QUE le CADRE — le document lui-meme arrive en HTML
   tout fait du site, et cette fenetre ne peut pas l atteindre (voir
   src/langue/etatcompte.js). */
const T = require('../langue').tr('etatcompte');

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
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.9rem;overflow-y:auto;display:flex;
  flex-direction:column;align-items:center}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
/* ⚠ LA FEUILLE. Blanche dans les deux modes : c'est un imprimé, pas un écran. */
.feuille{background:#fff;color:#111;width:100%;max-width:52rem;border-radius:8px;
  padding:1.6rem 1.8rem;box-shadow:0 8px 30px rgba(0,0,0,.35);
  font-family:'Inter',system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.feuille table{width:100%;border-collapse:collapse}
.feuille img{max-width:100%}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.5rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
button{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .7rem;cursor:pointer}
button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « État de compte ».
 * @param {string} userId identifiant du client
 */
function pageEtatCompte(userId) {
  const id = JSON.stringify(String(userId || ''));
  return `${TETE()}
<title>${T("État de compte — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.billing}</span><h1>${T("État de compte")}</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied">
  <span class="msg" id="msg"></span>
  <button id="b-courriel" disabled><span class="ic">✉</span> ${T("Envoyer au client")}</button>
  <button id="b-imprimer" class="prim" disabled><span class="ic">🖨</span> ${T("Imprimer")}</button>
</div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var ID = ${id};
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');
  var bCourriel = document.getElementById('b-courriel');
  var bImprimer = document.getElementById('b-imprimer');
  var D = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
  function fmt(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux états de compte.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    introuvable:        '${T("Ce client n’existe plus.")}',
    impression:         '${T("L’impression a échoué.")}',
    courriel:           '${T("Le courriel n’est pas parti.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 180)) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }

  function charger(){
    appeler('etat:lire', [ID]).then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="vide"><strong>${T("État de compte indisponible")}</strong>'
          + '<div style="margin-top:.4rem">' + esc(expliquer(r)) + '</div></div>';
        return;
      }
      D = r;
      // ⚠ Le document arrive DEJA echappe par le site (c est du HTML construit
      // par Billing) : on le pose tel quel, sinon on afficherait des balises.
      corps.innerHTML = '<div class="feuille">' + r.html + '</div>';
      if (sous) {
        sous.innerHTML = esc(r.nom)
          + (r.solde > 0
              ? ' <span class="pill att">${T("solde ")}' + fmt(r.solde) + '</span>'
              : ' <span class="pill bon">${T("compte à jour")}</span>');
      }
      bImprimer.disabled = false;
      // Sans adresse au dossier, le bouton d envoi reste eteint et le DIT.
      if (r.courriel) {
        bCourriel.disabled = false;
        bCourriel.title = '${T("Envoyer cet état de compte à ")}' + r.courriel;
        bCourriel.textContent = '${T("Envoyer à ")}' + r.courriel;
      } else {
        bCourriel.disabled = true;
        bCourriel.title = '${T("Aucune adresse courriel au dossier de ce client")}';
        bCourriel.textContent = '${T("Aucune adresse au dossier")}';
      }
      dire('');
    });
  }

  bImprimer.onclick = function(){
    bImprimer.disabled = true;
    dire('${T("Impression…")}', 'att');
    appeler('etat:imprimer', [ID]).then(function(r){
      bImprimer.disabled = false;
      dire(r.ok ? '${T("État de compte envoyé à l’impression.")}' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };

  /* ENVOI ARME EN DEUX CLICS : un courriel part chez le client et ne se
     rattrape pas. Le premier clic demande confirmation, le second envoie. */
  var ARME = false;
  bCourriel.onclick = function(){
    if (!D || !D.courriel) return;
    if (!ARME) {
      ARME = true;
      bCourriel.textContent = '${T("Confirmer l’envoi ?")}';
      dire('${T("Cliquez de nouveau pour envoyer l’état de compte à ")}' + D.courriel + '.', 'att');
      return;
    }
    ARME = false;
    bCourriel.disabled = true;
    bCourriel.textContent = '${T("Envoi…")}';
    dire('${T("Envoi du courriel…")}', 'att');
    appeler('etat:courriel', [ID, '']).then(function(r){
      bCourriel.disabled = false;
      bCourriel.textContent = '${T("Envoyer à ")}' + D.courriel;
      dire(r.ok ? '${T("État de compte envoyé à ")}' + r.adresse + '.' : expliquer(r), r.ok ? 'bon' : 'err');
    });
  };


  // Un clic ailleurs desarme l envoi : on ne laisse pas un bouton arme trainer.
  document.addEventListener('click', function(ev){
    if (ARME && ev.target !== bCourriel) {
      ARME = false;
      if (D && D.courriel) bCourriel.textContent = '${T("Envoyer à ")}' + D.courriel;
      dire('');
    }
  }, true);

  window.szActualiser = function(){ charger(); };
  window.szRevenir = function(){ charger(); };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageEtatCompte };
