'use strict';

/*
 * FENÊTRE « LIENS D'INSTALLATION » — NATIVE
 * =============================================================================
 * Le registre des liens remis à des gens du dehors : à qui, jusqu'à quand,
 * combien de fois, et ce qu'ils en ont fait. Deux vues — les LIENS et le
 * JOURNAL — parce que ce sont deux questions différentes : « qu'est-ce qui est
 * ouvert en ce moment » et « qui s'en est servi ».
 *
 * ⚠⚠ AUCUNE COPIE DES INSTALLATEURS N'EST FAITE PAR UN LIEN. Un lien, c'est un
 * identifiant et ses règles — quelques dizaines d'octets en base. Les paquets
 * restent l'unique exemplaire déposé dans le dépôt à la publication. Cent liens
 * n'occupent pas un octet de plus, et l'écran le dit, parce que la question se
 * pose et que la réponse rassure.
 *
 * ⚠ CE QUE LA FENÊTRE NE SAIT PAS, ET NE DOIT PAS SAVOIR. Elle ne signe rien,
 * ne décide d'aucun droit, ne garde aucun mot de passe. Elle DEMANDE et AFFICHE.
 * Tout l'état vit au serveur : c'est ce qui rend la révocation immédiate et le
 * compte d'usages honnête. Un registre tenu ici serait un registre qu'un
 * navigateur peut retarder, perdre ou contredire.
 *
 * ⚠ LE MOT DE PASSE N'EST MONTRÉ QU'UNE FOIS, au moment de la fabrication. Il
 * n'existe nulle part ailleurs : la base n'en garde que l'empreinte. Recharger
 * la liste ne le fera pas réapparaître — et l'écran le dit AVANT qu'on ferme la
 * carte, pas après.
 *
 * ⚠ UN LIEN D'INSCRIPTION N'A PAS DE MOT DE PASSE À LUI : il emprunte celui du
 * COMPTE, relu à chaque ouverture. Il suit donc tout seul un changement ou un
 * oubli de mot de passe, pour toute sa durée de vie.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;
  border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:none;border:0;border-bottom:2px solid transparent;color:#8fa1b8;
  font:600 .82rem/1 system-ui;padding:.45rem .7rem;cursor:pointer;border-radius:0}
.onglets button.on{color:#e8edf5;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.85rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.75rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.8rem .9rem}
.carte h2{margin:0 0 .55rem;font:700 .78rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
label{display:block;font-size:.73rem;color:#8fa1b8;margin:.5rem 0 .18rem}
input,select,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.34rem .5rem;width:100%}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.34rem .6rem;cursor:pointer;width:auto}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.mini{font-size:.72rem;padding:.16rem .45rem}
button.dgr{border-color:rgba(248,113,113,.5);color:#fca5a5}
.duo{display:flex;gap:.65rem;flex-wrap:wrap}
.duo>div{flex:1 1 10rem;min-width:0}
.barreoutils{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center}
table{width:100%;border-collapse:collapse;font-size:.79rem}
thead th{text-align:left;padding:.22rem .35rem;font-size:.65rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .35rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:top}
tbody tr:hover td{background:rgba(255,255,255,.03)}
.dt{font-size:.7rem;color:#8fa1b8}
.mono{font-family:ui-monospace,Consolas,monospace;font-size:.74rem}
.pill{display:inline-block;font-size:.64rem;padding:.05rem .45rem;border-radius:99px;white-space:nowrap;font-weight:700}
.pill.actif{background:rgba(34,197,94,.15);color:#4ade80}
.pill.revoque{background:rgba(248,113,113,.15);color:#fca5a5}
.pill.expire{background:rgba(148,163,184,.18);color:#94a3b8}
.pill.epuise{background:rgba(234,179,8,.15);color:#facc15}
.pill.g{background:rgba(148,163,184,.14);color:#94a3b8;font-weight:600}
.vide{padding:1.1rem .6rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* La carte du lien fraichement fabrique : le mot de passe ne reviendra pas. */
.neuf{border:1px solid rgba(201,169,126,.5);background:rgba(201,169,126,.09)}
.neuf input{background:#0b1220;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
.neuf .gros{font-family:ui-monospace,Consolas,monospace;font-size:1.15rem;letter-spacing:.12em;
  color:#f0d6a0;font-weight:700}
.franc{border:1px solid rgba(240,180,80,.35);background:rgba(200,140,40,.1);
  color:#f0d6a0;border-radius:9px;padding:.45rem .65rem;font-size:.74rem}
.aide{font-size:.71rem;color:#8fa1b8;margin:.3rem 0 0}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète.
 * @param {string} ouverture '' (les liens), 'nouveau' (formulaire ouvert), 'journal'
 */
function pageLiens(ouverture) {
  const dep = JSON.stringify(String(ouverture || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Liens d’installation — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🔗</span><h1>Liens d’installation</h1>
  <span class="sous" id="sous"></span></div>
<div class="onglets">
  <button id="o-liens" class="on">Liens</button>
  <button id="o-journal">Journal des accès</button>
</div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='⧉ Détacher'; b.title='Ouvrir cet écran dans sa propre fenêtre'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='⚓ Ancrer'; b.title='Ramener cet écran dans la fenêtre principale'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous  = document.getElementById('sous');
  var DEPART = ${dep};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne permet pas de distribuer l’application.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var base = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    // ⚠ LE DETAIL DU SERVEUR EST RENDU TEL QUEL : << l operation a echoue >> ne
    // dit pas si la base est muette, si le paquet manque ou si le lien n existe
    // plus — et sans cela on cherche au mauvais endroit.
    return base + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  var VUE = (DEPART === 'journal') ? 'journal' : 'liens';
  var ETAT = { version: '', paquets: [], liens: [], comptes: [], journal: [],
               conservation: 365, neuf: null, formulaire: (DEPART === 'nouveau') };

  var ETATS = { actif: 'Actif', revoque: 'Révoqué', expire: 'Expiré', epuise: 'Épuisé' };
  var GENRES = { manuel: 'Manuel', inscription: 'Inscription' };
  var EVENEMENTS = {
    cree: 'Créé', visite: 'Page ouverte', ouvert: 'Mot de passe accepté',
    mdp_refuse: 'Mot de passe refusé', etrangle: 'Trop de tentatives',
    telecharge: 'Téléchargement', revoque: 'Révoqué', expire: 'Expiré automatiquement',
    refuse: 'Refusé', comptable_ouvert: 'Portail comptable ouvert',
    comptable_refuse: 'Portail comptable — mot de passe refusé',
    comptable_classeur: 'Classeur comptable téléchargé',
    relais_refuse: 'Envoi de courriel refusé'
  };
  var CANAUX = { telechargement: 'Installation', comptable: 'Comptable',
                 courriel: 'Courriel' };

  function quand(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function jour(iso){
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso);
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function nomCompte(id){
    if (!id) return '';
    for (var i = 0; i < ETAT.comptes.length; i++) {
      if (ETAT.comptes[i].id === id) return ETAT.comptes[i].nom;
    }
    return id;
  }
  function copier(champ, bouton, motDejaLa){
    champ.select();
    // ⚠ execCommand ET NON navigator.clipboard : une fenetre native est chargee
    // en data:, son origine est nulle, donc elle n est PAS un contexte securise
    // — l API moderne du presse-papiers y est refusee. Mesure sur ce projet.
    var fait = false;
    try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
    bouton.textContent = fait ? '✓ Copié' : 'Ctrl+C pour copier';
    if (!motDejaLa) setTimeout(function(){ bouton.textContent = '📋 Copier'; }, 2500);
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « LIENS »
  // ════════════════════════════════════════════════════════════════════════
  function dessinerLiens(){
    var h = [];

    h.push('<div class="barreoutils"><button class="prim" id="b-nouveau">+ Nouveau lien</button>'
      + '<span class="droite"><button id="b-recharger">Recharger</button></span></div>');

    if (ETAT.neuf) h.push(carteNeuf());
    if (ETAT.formulaire) h.push(formulaire());

    h.push('<div class="carte"><h2>Liens émis</h2>');
    if (!ETAT.liens.length) {
      h.push('<div class="vide">Aucun lien n’a encore été émis.</div>');
    } else {
      h.push('<table><thead><tr><th>État</th><th>Pour</th><th>Compte</th>'
        + '<th>Usages</th><th>Échéance</th><th>Créé</th><th></th></tr></thead><tbody>');
      ETAT.liens.forEach(function(l){
        var u = (l.maxUsages > 0) ? (l.usages + ' / ' + l.maxUsages) : (l.usages + ' / ∞');
        h.push('<tr>'
          + '<td><span class="pill ' + esc(l.etat) + '">' + esc(ETATS[l.etat] || l.etat) + '</span></td>'
          + '<td>' + esc(l.etiquette || l.destinataire || '—')
            + (l.destinataire && l.etiquette ? '<div class="dt">' + esc(l.destinataire) + '</div>' : '')
            + '<div class="dt"><span class="pill g">' + esc(GENRES[l.genre] || l.genre) + '</span></div></td>'
          + '<td>' + esc(nomCompte(l.staffId) || '—') + '</td>'
          + '<td class="mono">' + u + '</td>'
          + '<td>' + jour(l.expireLe) + '</td>'
          + '<td>' + jour(l.creeLe) + '<div class="dt">' + esc(l.creePar || '') + '</div></td>'
          + '<td style="white-space:nowrap">'
            + '<button class="mini" data-copier="' + esc(l.url) + '">📋</button> '
            + (l.etat === 'actif'
                ? '<button class="mini" data-renvoyer="' + esc(l.id) + '">✉ Renvoyer</button> '
                  + '<button class="mini dgr" data-revoquer="' + esc(l.id) + '">'
                  + (ARME === l.id ? 'Confirmer ?' : 'Révoquer') + '</button> '
                : '')
            + '<button class="mini" data-journal="' + esc(l.id) + '">Journal</button>'
          + '</td></tr>');
        if (RENVOI && RENVOI.id === l.id) h.push(ligneRenvoi(l));
        if (l.revoqueLe) {
          h.push('<tr><td></td><td colspan="6" class="dt">Révoqué le ' + quand(l.revoqueLe)
            + ' par ' + esc(l.revoquePar || '?')
            + (l.motif ? ' — ' + esc(l.motif) : '') + '</td></tr>');
        }
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');

    corps.innerHTML = h.join('');
    brancherLiens();
  }

  /* Renvoyer un lien déjà émis.
     ⚠⚠ « RENVOYER LE MOT DE PASSE » N'EXISTE PAS, et ce n'est pas une lacune :
     la base n'en garde que l'empreinte, ce qui est précisément ce qui fait
     qu'une fuite n'ouvre aucun lien. On peut renvoyer le LIEN, ou en POSER UN
     NOUVEAU et l'envoyer — auquel cas l'ancien cesse aussitôt de fonctionner.
     L'écran le dit AVANT le clic, pas après.
     ⚠ Sans objet pour une inscription : ce lien emprunte le mot de passe du
     compte, et lui en poser un le couperait de ce qui le tient à jour. */
  var RENVOI = null;

  function ligneRenvoi(l){
    var inscription = (l.genre === 'inscription');
    return '<tr><td></td><td colspan="6">'
      + '<div class="carte" style="margin:.3rem 0">'
      + '<h2>Renvoyer ce lien</h2>'
      + '<label for="rv-a">Adresse</label>'
      + '<input id="rv-a" type="email" value="' + esc(RENVOI.a || l.destinataire || '') + '" '
      + 'placeholder="personne@exemple.com">'
      + (inscription
          ? '<p class="aide">Ce lien s’ouvre avec <strong>le mot de passe du compte</strong> de la '
            + 'personne. Il n’y a donc pas de mot de passe à joindre&nbsp;: le courriel rappellera '
            + 'd’utiliser celui de son accueil.</p>'
          : '<label style="margin-top:.5rem">Ce que contient le courriel</label>'
            + '<label style="margin:.2rem 0 0;font-size:.78rem;color:#e8edf5">'
            + '<input type="radio" name="rv-quoi" value="lien" style="width:auto;margin-right:.4rem"'
            + (RENVOI.quoi === 'lien' ? ' checked' : '') + '>Le lien seul</label>'
            + '<label style="margin:.15rem 0 0;font-size:.78rem;color:#e8edf5">'
            + '<input type="radio" name="rv-quoi" value="mdp" style="width:auto;margin-right:.4rem"'
            + (RENVOI.quoi === 'lien' ? '' : ' checked') + '>Le lien <strong>et un nouveau mot de passe</strong></label>'
            + '<p class="aide">L’ancien mot de passe ne peut pas être renvoyé&nbsp;: il n’existe nulle '
            + 'part en clair, la base n’en garde que l’empreinte. En poser un nouveau le remplace, '
            + 'et <strong>l’ancien cesse aussitôt de fonctionner</strong>.</p>')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="rv-envoyer">Envoyer</button>'
      + '<span class="droite"><button id="rv-annuler">Annuler</button></span></div>'
      + '</div></td></tr>';
  }

  function renvoyer(l){
    var a = document.getElementById('rv-a');
    var b = document.getElementById('rv-envoyer');
    if (!a || !a.value.trim()) { dire('Indiquez une adresse de courriel.', 'err'); return; }
    var adresse = a.value.trim();
    var coche = corps.querySelector('input[name="rv-quoi"]:checked');
    var avecMdp = !!(coche && coche.value === 'mdp');
    b.disabled = true;

    var neuf = avecMdp
      ? appeler('liens:motdepasse', [l.id])
      : Promise.resolve({ ok: true, mdp: '' });

    dire(avecMdp ? 'Nouveau mot de passe…' : 'Envoi du courriel…');
    neuf.then(function(r){
      if (!r.ok) { b.disabled = false; dire(expliquer(r), 'err'); return; }
      return appeler('liens:courriel', [{
        destinataire: adresse, url: l.url, mdp: r.mdp || '',
        inclureMdp: !!(r.mdp), echeance: jour(l.expireLe)
      }]).then(function(e){
        b.disabled = false;
        if (!e.ok) { dire(expliquer(e), 'err'); return; }
        RENVOI = null;
        dire(avecMdp
          ? ('Courriel envoyé à ' + adresse + ' avec un nouveau mot de passe — l’ancien ne fonctionne plus.')
          : ('Courriel envoyé à ' + adresse + '.'), 'bon');
        charger(false);
      });
    });
  }

  function carteNeuf(){
    var n = ETAT.neuf;
    return '<div class="carte neuf"><h2>Lien fabriqué</h2>'
      + '<label for="n-url">Adresse à remettre</label>'
      + '<input id="n-url" type="text" readonly value="' + esc(n.url) + '">'
      + '<div class="barreoutils" style="margin-top:.4rem"><button id="n-copier">📋 Copier</button>'
      + '<span class="aide">' + (n.maxUsages > 0
            ? (n.maxUsages === 1 ? 'Utilisable une seule fois' : ('Utilisable ' + n.maxUsages + ' fois'))
            : 'Utilisations illimitées')
        + ' · échéance le ' + jour(n.expire) + '</span></div>'
      + (n.mdpCompte
          ? '<p class="aide">Ce lien s’ouvre avec <strong>le mot de passe du compte</strong> de la '
            + 'personne — celui de son courriel d’accueil. S’il change ou s’il est réinitialisé, '
            + 'le lien suit automatiquement, pour toute sa durée de vie.</p>'
          : '<label style="margin-top:.6rem">Mot de passe d’ouverture</label>'
            + '<div class="gros" id="n-mdp-vue">' + esc(n.mdp) + '</div>'
            + '<input id="n-mdp" type="text" readonly value="' + esc(n.mdp) + '" style="position:absolute;left:-9999px">'
            + '<div class="barreoutils" style="margin-top:.4rem">'
            + '<button id="n-copier-mdp">📋 Copier le mot de passe</button></div>'
            + '<p class="aide"><strong>Il ne sera plus jamais affiché</strong> — la base n’en garde '
            + 'que l’empreinte. Notez-le ou envoyez-le maintenant, et de préférence par un autre '
            + 'canal que le lien.</p>')
      + '<div class="duo" style="margin-top:.6rem">'
      + '<div><label for="n-a">Envoyer le lien par courriel à</label>'
      + '<input id="n-a" type="email" value="' + esc(n.destinataire || '') + '" placeholder="personne@exemple.com"></div>'
      + '</div>'
      + (n.mdpCompte ? ''
          : '<label style="margin-top:.5rem"><input type="checkbox" id="n-inclure" style="width:auto;margin-right:.4rem">'
            + 'Inclure le mot de passe dans ce courriel</label>'
            + '<p class="aide">Les deux dans le même message, c’est une seule porte au lieu de deux. '
            + 'À ne cocher que si vous n’avez aucun autre moyen de le transmettre.</p>')
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="n-envoyer">Envoyer</button>'
      + '<span class="droite"><button id="n-fermer">Fermer</button></span></div>'
      + '</div>';
  }

  function formulaire(){
    var opts = ETAT.comptes.map(function(c){
      return '<option value="' + esc(c.id) + '">' + esc(c.nom) + (c.courriel ? ' — ' + esc(c.courriel) : '') + '</option>';
    }).join('');
    return '<div class="carte"><h2>Nouveau lien</h2>'
      + '<div class="duo">'
      + '<div><label for="f-etiquette">Pour qui / pourquoi</label>'
      + '<input id="f-etiquette" type="text" placeholder="ex. Poste de la boutique"></div>'
      + '<div><label for="f-courriel">Courriel du destinataire</label>'
      + '<input id="f-courriel" type="email" placeholder="facultatif"></div>'
      + '</div>'
      + '<div class="duo">'
      + '<div><label for="f-compte">Rattacher à un compte</label>'
      + '<select id="f-compte"><option value="">Aucun</option>' + opts + '</select></div>'
      + '<div><label for="f-duree">Validité</label><select id="f-duree">'
      + '<option value="1">1 heure</option><option value="4">4 heures</option>'
      + '<option value="24" selected>24 heures</option><option value="72">3 jours</option>'
      + '<option value="168">7 jours</option><option value="720">30 jours</option></select></div>'
      + '<div><label for="f-usages">Utilisations</label><select id="f-usages">'
      + '<option value="1" selected>Une seule fois</option><option value="2">2 fois</option>'
      + '<option value="3">3 fois</option><option value="5">5 fois</option>'
      + '<option value="0">Illimitées</option></select></div>'
      + '</div>'
      + '<p class="aide">Un mot de passe d’ouverture est engendré au hasard&nbsp;: il ne sera '
      + 'affiché qu’une seule fois, juste après la création.</p>'
      + '<div class="barreoutils" style="margin-top:.5rem">'
      + '<button class="prim" id="f-creer">Fabriquer</button>'
      + '<span class="droite"><button id="f-annuler">Annuler</button></span></div>'
      + '</div>';
  }

  function brancherLiens(){
    var bn = document.getElementById('b-nouveau');
    if (bn) bn.onclick = function(){ ETAT.formulaire = !ETAT.formulaire; dessinerLiens(); };
    var br = document.getElementById('b-recharger');
    if (br) br.onclick = function(){ charger(true); };

    var fc = document.getElementById('f-creer');
    if (fc) fc.onclick = creer;
    var fa = document.getElementById('f-annuler');
    if (fa) fa.onclick = function(){ ETAT.formulaire = false; dessinerLiens(); };

    var nc = document.getElementById('n-copier');
    if (nc) nc.onclick = function(){ copier(document.getElementById('n-url'), nc); };
    var nm = document.getElementById('n-copier-mdp');
    if (nm) nm.onclick = function(){ copier(document.getElementById('n-mdp'), nm); };
    var nf = document.getElementById('n-fermer');
    if (nf) nf.onclick = function(){ ETAT.neuf = null; dessinerLiens(); };
    var ne = document.getElementById('n-envoyer');
    if (ne) ne.onclick = envoyer;

    Array.prototype.forEach.call(corps.querySelectorAll('[data-copier]'), function(b){
      b.onclick = function(){
        var z = document.createElement('input');
        z.value = b.getAttribute('data-copier');
        document.body.appendChild(z);
        z.select();
        var fait = false;
        try { fait = document.execCommand('copy'); } catch (e) { fait = false; }
        z.remove();
        dire(fait ? 'Adresse copiée.' : 'Copie refusée par le système.', fait ? 'bon' : 'err');
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-renvoyer]'), function(b){
      b.onclick = function(){
        var id = b.getAttribute('data-renvoyer');
        // ⚠ LE MOT DE PASSE NEUF EST LE DEFAUT (demande du 2026-08-09) : on renvoie
        // un lien parce que la personne n arrive pas a entrer, et le mot de passe
        // est justement ce qu elle a le plus de chances d avoir perdu.
        RENVOI = (RENVOI && RENVOI.id === id) ? null : { id: id, quoi: 'mdp', a: '' };
        dessinerLiens();
      };
    });
    var rvE = document.getElementById('rv-envoyer');
    if (rvE && RENVOI) {
      var cible = null;
      for (var i = 0; i < ETAT.liens.length; i++) {
        if (ETAT.liens[i].id === RENVOI.id) { cible = ETAT.liens[i]; break; }
      }
      if (cible) rvE.onclick = function(){ renvoyer(cible); };
    }
    var rvA = document.getElementById('rv-annuler');
    if (rvA) rvA.onclick = function(){ RENVOI = null; dessinerLiens(); };

    Array.prototype.forEach.call(corps.querySelectorAll('[data-revoquer]'), function(b){
      b.onclick = function(){ revoquer(b.getAttribute('data-revoquer')); };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-journal]'), function(b){
      b.onclick = function(){
        VUE = 'journal';
        marquerOnglets();
        chargerJournal('', b.getAttribute('data-journal'));
      };
    });
  }

  function creer(){
    var e = document.getElementById('f-etiquette');
    var c = document.getElementById('f-courriel');
    var s = document.getElementById('f-compte');
    var d = document.getElementById('f-duree');
    var u = document.getElementById('f-usages');
    var b = document.getElementById('f-creer');
    b.disabled = true;
    dire('Fabrication du lien…');
    appeler('liens:creer', [{
      etiquette: e ? e.value.trim() : '',
      destinataire: c ? c.value.trim() : '',
      staffId: s ? s.value : '',
      heures: d ? d.value : '24',
      usages: u ? u.value : '1'
    }]).then(function(r){
      b.disabled = false;
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      ETAT.neuf = { url: r.url, mdp: r.mdp, mdpCompte: !!r.mdpCompte, expire: r.expire,
                    maxUsages: r.maxUsages, destinataire: c ? c.value.trim() : '' };
      ETAT.formulaire = false;
      dire('Lien fabriqué.', 'bon');
      charger(false);
    });
  }

  function envoyer(){
    var a = document.getElementById('n-a');
    var inc = document.getElementById('n-inclure');
    var b = document.getElementById('n-envoyer');
    if (!a || !a.value.trim()) { dire('Indiquez une adresse de courriel.', 'err'); return; }
    b.disabled = true;
    dire('Envoi du courriel…');
    appeler('liens:courriel', [{
      destinataire: a.value.trim(), url: ETAT.neuf.url, mdp: ETAT.neuf.mdp,
      inclureMdp: !!(inc && inc.checked), echeance: jour(ETAT.neuf.expire)
    }]).then(function(r){
      b.disabled = false;
      dire(r.ok ? ('Courriel envoyé à ' + a.value.trim() + '.') : expliquer(r), r.ok ? 'bon' : 'err');
    });
  }

  /* ⚠ LE BOUTON S ARME, IL NE DEMANDE PAS. C est la convention de ce projet
     (Promotions, Coupons) et surtout la seule qui tienne ici : confirm() bloque
     le processus, et une fenetre native chargee en data: n a pas de boite de
     dialogue du site a sa disposition. Le premier clic arme, le second agit,
     et le bandeau du bas dit ce qui va se passer. */
  var ARME = '';
  function revoquer(id){
    if (ARME !== id) {
      ARME = id;
      dessinerLiens();
      dire('Cliquez « Confirmer ? » pour révoquer — le lien cessera aussitôt de fonctionner, même pour quelqu’un qui l’a déjà ouvert.', 'att');
      return;
    }
    ARME = '';
    dire('Révocation…');
    appeler('liens:revoquer', [id, '']).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Lien révoqué. La révocation est inscrite au journal.', 'bon');
      charger(false);
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // VUE « JOURNAL »
  // ════════════════════════════════════════════════════════════════════════
  function dessinerJournal(filtre, lien){
    var h = [];
    h.push('<div class="barreoutils">'
      + '<label style="margin:0">Canal</label>'
      + '<select id="j-canal" style="width:auto">'
      + '<option value="">Tous</option>'
      + '<option value="telechargement"' + (filtre === 'telechargement' ? ' selected' : '') + '>Installation</option>'
      + '<option value="comptable"' + (filtre === 'comptable' ? ' selected' : '') + '>Comptable</option>'
      + '<option value="courriel"' + (filtre === 'courriel' ? ' selected' : '') + '>Courriel</option>'
      + '</select>'
      + (lien ? '<span class="pill g">Lien ' + esc(lien.slice(0, 8)) + '…</span>'
                + '<button class="mini" id="j-tout">Tout le journal</button>' : '')
      + '<span class="droite"><button id="j-vers-journaux" title="Voir ce journal dans le module Journaux">🔎 Dans Journaux</button>'
      + '<button id="j-recharger">Recharger</button></span></div>');

    h.push('<div class="carte"><h2>Accès aux liens</h2>');
    if (!ETAT.journal.length) {
      h.push('<div class="vide">Aucun événement pour ce filtre.</div>');
    } else {
      h.push('<table><thead><tr><th>Quand</th><th>Canal</th><th>Événement</th>'
        + '<th>Adresse IP</th><th>Lien</th><th>Détail</th></tr></thead><tbody>');
      ETAT.journal.forEach(function(e){
        h.push('<tr>'
          + '<td class="dt" style="white-space:nowrap">' + quand(e.au) + '</td>'
          + '<td>' + esc(CANAUX[e.canal] || e.canal) + '</td>'
          + '<td>' + esc(EVENEMENTS[e.genre] || e.genre) + '</td>'
          + '<td class="mono">' + esc(e.ip || '—') + '</td>'
          + '<td class="mono">' + esc((e.lienId || '').slice(0, 8)) + '</td>'
          + '<td class="dt">' + esc(e.detail || '') + (e.qui ? ' · ' + esc(e.qui) : '') + '</td>'
          + '</tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');

    h.push('<div class="franc"><b>Renseignements personnels.</b> Les adresses IP consignées ici '
      + 'sont conservées ' + ETAT.conservation + ' jours à des fins de sécurité et de traçabilité '
      + 'des accès. Les personnes en sont averties sur la page du lien, avant tout '
      + 'téléchargement, comme l’exige la Loi 25.</div>');

    corps.innerHTML = h.join('');
    var jc = document.getElementById('j-canal');
    if (jc) jc.onchange = function(){ chargerJournal(jc.value, lien); };
    var jr = document.getElementById('j-recharger');
    if (jr) jr.onclick = function(){ chargerJournal(filtre, lien); };
    var jt = document.getElementById('j-tout');
    if (jt) jt.onclick = function(){ chargerJournal(filtre, ''); };
    var jvj = document.getElementById('j-vers-journaux');
    if (jvj) jvj.onclick = function(){ if (P && P.ouvrirJournaux) P.ouvrirJournaux('comptable'); };
  }

  function chargerJournal(canal, lien){
    dire('Lecture du journal…');
    appeler('liens:journal', [{ canal: canal || '', lien: lien || '' }]).then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      ETAT.journal = r.evenements || [];
      if (r.conservation) ETAT.conservation = r.conservation;
      dessinerJournal(canal || '', lien || '');
      dire('');
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  function marquerOnglets(){
    document.getElementById('o-liens').classList.toggle('on', VUE === 'liens');
    document.getElementById('o-journal').classList.toggle('on', VUE === 'journal');
  }
  document.getElementById('o-liens').onclick = function(){
    VUE = 'liens'; marquerOnglets(); dessinerLiens();
  };
  document.getElementById('o-journal').onclick = function(){
    VUE = 'journal'; marquerOnglets(); chargerJournal('', '');
  };

  function charger(dire_le){
    if (dire_le) dire('Lecture…');
    Promise.all([
      appeler('liens:liste'),
      appeler('liens:comptes'),
      appeler('liens:paquets')
    ]).then(function(rs){
      var l = rs[0], c = rs[1], p = rs[2];
      if (!l.ok) {
        corps.innerHTML = '<div class="carte"><div class="vide">' + expliquer(l) + '</div></div>';
        dire(expliquer(l), 'err');
        return;
      }
      ETAT.liens = l.liens || [];
      ETAT.comptes = (c && c.ok) ? (c.comptes || []) : [];
      if (p && p.ok) { ETAT.version = p.version || ''; ETAT.paquets = p.paquets || []; }
      var actifs = ETAT.liens.filter(function(x){ return x.etat === 'actif'; }).length;
      sous.textContent = (ETAT.version ? ('Version publiée : ' + ETAT.version + ' · ') : '')
        + actifs + ' lien' + (actifs > 1 ? 's' : '') + ' actif' + (actifs > 1 ? 's' : '');
      dessinerLiens();
      if (dire_le) dire('');
    });
  }

  marquerOnglets();
  if (VUE === 'journal') chargerJournal('', '');
  else charger(true);
})();
</script></body></html>`;
}

module.exports = { pageLiens };
