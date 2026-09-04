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

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

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
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:1rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v11);border-radius:8px}
/* ⚠ LES CARTES D UNE MEME RANGEE SE TERMINENT A LA MEME HAUTEUR (2026-08-10) :
   pas d align-items:start, sinon la rangee finit en escalier. */
.rangee{display:grid;grid-template-columns:repeat(auto-fit,minmax(28rem,1fr));gap:1rem}
.carte{background:var(--f-carte);border:1px solid var(--v08);border-radius:11px;
  padding:1rem 1.1rem;min-width:0;display:flex;flex-direction:column}
.carte .tt{display:flex;align-items:center;gap:.5rem;margin:0 0 .2rem}
.carte h2{margin:0;font:700 .82rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.05em;color:var(--tx-bleute)}
.carte .lien{margin-left:auto;font-size:.72rem;color:var(--tx2);text-decoration:none;
  border:1px solid var(--v16);border-radius:7px;padding:.14rem .5rem}
.carte .lien:hover{color:var(--tx);border-color:var(--v30)}
.carte .sous{margin:0 0 .9rem;font-size:.78rem;color:var(--tx3)}
.ch{margin:0 0 .8rem}
.ch:last-child{margin-bottom:0}
.ch label{display:block;margin-bottom:.25rem;font-size:.78rem;color:var(--tx2)}
.ch .aide{font-size:.72rem;color:var(--tx3);margin-top:.2rem}
.ch input{width:100%;font:inherit;font-family:ui-monospace,Consolas,monospace;font-size:.84rem;
  color:var(--tx);background:var(--f-champ);border:1px solid #2b3444;border-radius:8px;padding:.42rem .55rem}
.ch input:focus{outline:none;border-color:#c9a97e}
.ch input:disabled{opacity:.55}
.ch input.solde{font-family:inherit;max-width:12rem}
.etat{display:flex;align-items:center;gap:.6rem;margin-top:.28rem;flex-wrap:wrap}
.etat .txt{font-size:.76rem;color:var(--tx2)}
.etat .txt b{color:var(--tx-ok)}
.etat.non .txt b{color:var(--tx-jaune)}
.etat button{font:inherit;font-size:.74rem;color:var(--tx-err2);background:rgba(248,113,113,.08);
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
button:hover:not(:disabled){background:var(--v11)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
.vide{padding:1rem .6rem;text-align:center;color:var(--tx2);font-size:.82rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageClesConfig() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Clés API — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.cles}</span><h1>Clés API</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : vous pouvez consulter les clés, pas les modifier.</div>
<div class="corps" id="corps"><div class="carte"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button class="prim" id="b-save" disabled>Enregistrer les clés</button></div>
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
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bsave = document.getElementById('b-save');
  var D = null, RO = false, OCCUPE = false;
  var ARME = {}; // champs dont le retrait est ARME (premier clic), en attente de confirmation

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la configuration.',
    lecture_seule:      'Votre rôle est en lecture seule : les clés ne peuvent pas être modifiées.',
    cle_inconnue:       'Cette clé est inconnue.',
    rien_a_ecrire:      'Aucun changement à enregistrer.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    nuage:              'L’enregistrement dans le nuage a échoué. Réessayez.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
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
    { titre: 'Fal.ai — Génération photo IA',
      sous: 'Habillage mannequin virtuel (IDM-VTON) sur les vues produit.',
      lien: ['fal.ai', 'https://fal.ai'],
      champs: [{ k: 'fal', label: 'Clé API', place: 'xxxxxxxx:xxxx…',
        aide: 'Gratuit à l’inscription — Dashboard puis API Keys sur fal.ai.' }],
      solde: true },
    { titre: 'Photoroom — Retrait du mannequin',
      sous: 'Le « mannequin fantôme ». Sans clé, la photothèque se rabat sur un détourage par masque.',
      lien: ['photoroom.com', 'https://www.photoroom.com/api'],
      champs: [
        { k: 'photoroom', label: 'Clé de PRODUCTION', place: 'clé de production (sans préfixe)',
          aide: 'Vrais traitements, pleine qualité, sans filigrane. Exige le plan Plus.' },
        { k: 'photoroomSandbox', label: 'Clé SANDBOX (aperçus)', place: 'sandbox_… (facultatif)',
          aide: 'Aperçus gratuits (filigranés, aucun crédit). Vide : dérivée de la clé de production.' }] },
    { titre: 'Groq — Description IA',
      sous: 'Génération de descriptions de produits à partir de la photo.',
      lien: ['console.groq.com', 'https://console.groq.com/keys'],
      champs: [{ k: 'groq', label: 'Clé API', place: 'gsk_…',
        aide: 'Gratuit — modèle llama-3.3-70b-versatile.' }] },
    { titre: 'Resend — Courriel transactionnel',
      sous: 'Infolettres, confirmations de commande, cartes-cadeaux.',
      lien: ['resend.com', 'https://resend.com/api-keys'],
      champs: [{ k: 'resend', label: 'Clé API', place: 're_…',
        aide: 'Les paramètres d’expéditeur se règlent dans Newsletter puis Configuration.' }] },
    { titre: 'Hugging Face — Segmentation vêtement',
      sous: 'Isole le vêtement avant correction de couleur (exclut peau, visage, cheveux).',
      lien: ['huggingface.co', 'https://huggingface.co/settings/tokens'],
      champs: [{ k: 'hf', label: 'Token d’accès', place: 'hf_…',
        aide: 'Gratuit — Settings, Access Tokens, New token (Read). Modèle segformer_b2_clothes.' }] },
    { titre: 'Stripe Tax — Taxes internationales',
      sous: 'Calcul auto de la TVA/TPS à l’international (le Canada garde la table manuelle). ⚠ Stripe ne perçoit que dans les pays où vous êtes inscrit ; ailleurs 0 (le client paie à la frontière). Ne couvre pas les droits de douane.',
      lien: ['dashboard.stripe.com', 'https://dashboard.stripe.com/tax'],
      champs: [{ k: 'stripeTax', label: 'Clé secrète Stripe', place: 'rk_… (clé restreinte Tax) ou sk_…',
        aide: 'Recommandé : une clé RESTREINTE (rk_) limitée à la permission Tax. La clé reste au serveur.' }],
      test: true }
  ];

  function champHtml(c){
    var e = (D && D[c.k]) || { defini: false, fin: '' };
    return '<div class="ch"><label>' + esc(c.label) + '</label>'
      + '<input id="f-' + c.k + '" type="password" value="" placeholder="'
      + (e.defini ? 'inchangé' : esc(c.place)) + '" autocomplete="off"'
      + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">' + esc(c.aide) + '</div>'
      + '<div class="etat' + (e.defini ? '' : ' non') + '" id="etat-' + c.k + '">'
      + etatInterne(c.k, e) + '</div></div>';
  }
  function soldeHtml(){
    var sv = (D && D.falSolde) || '';
    var maj = (D && D.falSoldeMaj) ? (' — saisi le ' + esc(String(D.falSoldeMaj).slice(0, 10))) : '';
    return '<div class="ch"><label>Solde du compte (saisi à la main)</label>'
      + '<input id="f-falSolde" class="solde" type="number" step="0.01" min="0" value="' + esc(sv) + '"'
      + ' placeholder="ex. 25.00"' + (RO ? ' disabled' : '') + '>'
      + '<div class="aide">fal.ai n’expose aucun solde par API. La fenêtre Traitements d’image affiche '
      + 'ce montant et la consommation mesurée depuis' + maj + '. À tenir à jour.</div></div>';
  }
  function etatInterne(k, e){
    if (!e.defini) return '<span class="txt">Aucune clé <b>enregistrée</b>.</span>';
    if (ARME[k]) {
      return '<span class="txt">Retirer la clé enregistrée ?</span>'
        + '<button class="conf" data-conf="' + k + '"' + (RO ? ' disabled' : '') + '>Confirmer le retrait</button>'
        + '<button class="annu" data-annu="' + k + '">Annuler</button>';
    }
    return '<span class="txt">Clé <b>enregistrée</b> (se termine par ' + esc(e.fin)
      + '). Laissez le champ vide pour la conserver.</span>'
      + '<button data-retirer="' + k + '"' + (RO ? ' disabled' : '') + '>Retirer</button>';
  }

  function dessiner(){
    var av = document.getElementById('ro');
    if (av) av.hidden = !RO;
    var h = ['<div class="rangee">'];
    SERVICES.forEach(function(s){
      h.push('<div class="carte"><div class="tt"><h2>' + esc(s.titre) + '</h2>'
        + '<a class="lien" href="' + esc(s.lien[1]) + '" target="_blank" rel="noopener">' + esc(s.lien[0]) + ' &rarr;</a></div>');
      h.push('<p class="sous">' + esc(s.sous) + '</p>');
      s.champs.forEach(function(c){ h.push(champHtml(c)); });
      if (s.solde) h.push(soldeHtml()); // le solde fal.ai, sous sa cle, dans la meme carte
      if (s.test) h.push('<div class="ch"><button id="b-teststripe"' + (RO ? ' disabled' : '')
        + '>Tester la clé &amp; voir mes inscriptions</button>'
        + '<div class="etat" id="stripe-res" style="margin-top:.4rem"></div></div>');
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
    var bt = document.getElementById('b-teststripe');
    if (bt) bt.onclick = testerStripe;
  }

  // Test de la clé Stripe Tax : valide + montre les inscriptions. ⚠ Enregistrer
  // la clé D'ABORD (le relais lit la clé enregistrée, pas le champ).
  function testerStripe(){
    if (OCCUPE) return;
    var res = document.getElementById('stripe-res');
    if (res) { res.className = 'etat'; res.innerHTML = '<span class="txt">Test en cours…</span>'; }
    occuper(true);
    appeler('config:cles:teststripe').then(function(r){
      occuper(false);
      if (!res) return;
      if (r && r.ok) {
        /* ⚠ ON AFFICHAIT le champ pays, D'OÙ LE FAMEUX << US, US >>. Deux
           inscriptions dans le meme pays donnaient deux fois le meme mot, et l on
           ne pouvait pas savoir DE QUEL ETAT il s agissait — or c est tout ce qui
           compte : etre inscrit a New York n autorise pas le Texas. Le relais rend
           deja le territoire (US-NY) et le statut ; on montre ca.
           ⚠ ET ON NE REFAIT PAS LE TABLEAU ICI. Il vit dans Configuration ▸
           Livraison, ou il sert a decider ou l on livre — le dupliquer ferait deux
           ecrans a tenir d accord, et c est deja ce genre de doublon qui a coute
           une journee. On renvoie donc vers lui. */
        var lst = (r.inscriptions || []);
        var actives = lst.filter(function(i){ return i.statut === 'active'; });
        var noms = actives.map(function(i){ return i.territoire || i.pays; });
        var enPlus = lst.length - actives.length;
        var txt;
        if (!lst.length) {
          txt = '✓ Clé valide (' + esc(r.mode) + '). <b>Aucune inscription</b> — '
              + 'aucune destination hors Canada ne peut être ouverte.';
        } else {
          txt = '✓ Clé valide (' + esc(r.mode) + '). Inscrit dans : <b>' + esc(noms.join(', ')) + '</b>'
              + (enPlus > 0 ? ' <span style="opacity:.7">(+ ' + enPlus + ' non active'
                              + (enPlus > 1 ? 's' : '') + ')</span>' : '')
              + '. <span style="opacity:.75">Les pays desservis se règlent dans '
              + '<b>Configuration ▸ Livraison</b>.</span>';
        }
        res.className = 'etat';
        res.innerHTML = '<span class="txt">' + txt + '</span>';
      } else {
        res.className = 'etat non';
        res.innerHTML = '<span class="txt">✗ ' + esc((r && (r.error || r.detail)) || 'Échec du test.')
          + (r && r.motif === 'non_configure' ? ' (enregistrez la clé d’abord)' : '') + '</span>';
      }
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
    var saisie = { falSolde: v('f-falSolde') };
    SERVICES.forEach(function(s){ s.champs.forEach(function(c){ saisie[c.k] = v('f-' + c.k); }); });
    occuper(true); dire('Enregistrement…');
    appeler('config:cles:ecrire', [saisie]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        D = r; RO = !r.peutModifier; ARME = {}; dessiner();
        dire(r.rien ? 'Aucun changement.' : 'Clés enregistrées.', r.rien ? 'att' : 'bon');
      } else dire(expliquer(r), 'err');
    });
  }
  bsave.onclick = enregistrer;

  function retirer(k){
    if (RO || OCCUPE) return;
    occuper(true); dire('Retrait…');
    appeler('config:cles:retirer', [k]).then(function(r){
      occuper(false);
      if (r && r.ok) { D = r; RO = !r.peutModifier; ARME = {}; dessiner(); dire('Clé retirée.', 'bon'); }
      else dire(expliquer(r), 'err');
    });
  }

  function charger(){
    dire('Lecture…');
    appeler('config:cles:donnees').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
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
