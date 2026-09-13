'use strict';

/*
 * FENÊTRE « INFOLETTRE » — NATIVE (3.15.0, #30)
 * =============================================================================
 * Les TROIS onglets qui n'existaient encore qu'en version web : Tableau de bord,
 * Configuration (Resend + interrupteurs de courriels), Offre de bienvenue. Les
 * quatre autres (Abonnés, Campagnes, Chaînes, Journal) ont DÉJÀ leur fenêtre et
 * leur propre entrée de menu.
 *
 * ⚠ La fenêtre est un pilote : les cœurs `_nl*Coeur` (newsletter.js) font toute
 * la lecture/écriture sur la page (Resend, Turso, R2). La clé Resend n'est
 * envoyée qu'à un rôle qui peut écrire. L'image de l'offre se lit DANS la
 * fenêtre et le SERVEUR la copie dans R2 (data URL → `newsletter:offerImage`).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, commentaires
 * compris : tout ce script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la langue du
   poste. ⚠⚠ Le contenu de l'offre de bienvenue (titre, sous-titre, bouton,
   mention légale) est TAPÉ ici et LU PAR LA VISITEUSE : c'est de la donnée, pas
   de l'interface. Le texte de repli de l'aperçu est déclaré dans `SZ_DONNEES`. */
const T = require('../langue').tr('newsletter');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;border-bottom:1px solid var(--v08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;color:var(--tx2);
  padding:.4rem .7rem;font-weight:600;font-size:.85rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:var(--v05);color:var(--tx)}
.onglets button.actif{color:var(--tx-creme);border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;display:flex;flex-direction:column;gap:.8rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
input,button,select,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.4rem .55rem}
textarea{resize:vertical;min-height:56px;width:100%}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600;padding:.42rem .8rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.ghost{background:transparent}
button.mini{padding:.16rem .5rem;font-size:.76rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.6rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.6rem .8rem}
.tuile .k{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.tuile .v{font-size:1.5rem;font-weight:800;margin-top:.15rem}
.tuile .z{font-size:.68rem;color:var(--tx2);margin-top:.1rem}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:12px;padding:.75rem .85rem}
.carte h2{margin:0 0 .6rem;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);font-weight:700}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}
@media(max-width:720px){.deux{grid-template-columns:1fr}}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.28rem .4rem;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.34rem .4rem;border-top:1px solid var(--v055)}
.champ{margin-bottom:.7rem}
.champ label{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--tx2);margin:0 0 .25rem}
.champ input,.champ textarea{width:100%}
.hint{font-size:.72rem;color:var(--tx2);margin:.25rem 0 0;line-height:1.5}
.sep{border:none;border-top:1px solid var(--v09);margin:.9rem 0}
.badge{display:inline-block;font-size:.66rem;font-weight:700;padding:.06rem .5rem;border-radius:99px}
.badge.ok{background:rgba(22,163,74,.2);color:#86efac}
.badge.draft{background:rgba(148,163,184,.18);color:var(--tx-gris2)}
.badge.warn{background:rgba(217,119,6,.2);color:#fcd34d}
.src{margin-bottom:.6rem}
.src .l{display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.25rem}
.src .bar{height:6px;border-radius:99px;background:var(--v10);overflow:hidden}
.src .bar>div{height:100%;background:#c9a97e}
.ctrl{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid var(--v06)}
.ctrl .t{font-weight:500;font-size:.86rem}
.ctrl .d{font-size:.74rem;color:var(--tx2);margin-top:.1rem}
.bascule{position:relative;width:42px;height:23px;flex:0 0 auto}
.bascule input{opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer;z-index:2;margin:0}
.bascule .piste{position:absolute;inset:0;border-radius:12px;background:#4a5568;transition:background .2s}
/* Piste de bascule eteinte : un gris ardoise disparait sur fond clair. */
html.jour .bascule .piste{background:#cfcabd}
.bascule .pouce{position:absolute;top:2px;left:2px;width:19px;height:19px;border-radius:50%;background:#fff;transition:left .2s}
.bascule input:checked ~ .piste{background:#c9a97e}
.bascule input:checked ~ .pouce{left:21px}
.setup{max-width:34rem;margin:2rem auto;text-align:center;color:var(--tx-bleute)}
.setup .em{font-size:2.6rem;margin-bottom:.8rem}
.apercu-img{max-height:80px;max-width:100%;border-radius:6px;border:1px solid var(--v15);display:block;margin-bottom:.4rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.78);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem}
.pop{background:#fff;color:#222;border-radius:14px;max-width:40rem;width:100%;display:flex;overflow:hidden;min-height:16rem;position:relative}
.pop .g{flex:1 1 45%;background:#e8dcc6 center/cover no-repeat;min-height:16rem}
.pop .d{flex:1 1 55%;padding:1.4rem 1.5rem;display:flex;flex-direction:column;justify-content:center;gap:.6rem}
.pop .titre{font:800 1.5rem/1.15 Georgia,serif;white-space:pre-line;color:#3a2f22}
.pop .st{font-size:.9rem;color:#6b5b45;line-height:1.5}
.pop .cta{background:#8f6f42;color:var(--tx-sur-accent);border:none;border-radius:8px;padding:.6rem;font-weight:700;margin-top:.4rem}
.pop .lg{font-size:.66rem;color:#9a8f7d}
.pop .x{position:absolute;top:.5rem;right:.7rem;background:rgba(0,0,0,.15);color:var(--tx-blanc);border:none;border-radius:50%;width:26px;height:26px}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
.vide{padding:1.4rem;text-align:center;color:var(--tx2);font-size:.84rem}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre « Infolettre ».
 * `ouverture` : '' (Tableau de bord) · 'config' · 'offer' · 'apercu' (offre, avec
 * l'aperçu du popup ouvert — le banc ne clique pas).
 */
function pageNewsletter(ouverture) {
  const ouv = String(ouverture || '');
  const tabDepart = (ouv === 'config' || ouv === 'offer') ? ouv : (ouv === 'apercu' ? 'offer' : 'dashboard');
  const ouvreApercu = (ouv === 'apercu');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${T("Infolettre — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.newsletter}</span><h1>${T("Infolettre")}</h1><span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');
  var ongletsEl = document.getElementById('onglets');

  var TAB = '${tabDepart}';
  var D = null;          // donnees de l onglet courant

  /* ⚠⚠ CE QUI EST UNE DONNEE, PAS DE L INTERFACE. L apercu du popup doit montrer
     ce que la VISITEUSE verra — et elle lit le francais. Ce texte de repli n est
     pas un libelle de l administration : le traduire ferait mentir l apercu.
     Voir la fiche de tools/textes-visibles.js. */
  var SZ_DONNEES = {
    offreBoutonDefaut: 'JE M’INSCRIS'
  };
  var PEUT = { vue:true, edit:false };
  var APERCU = false;    // surcouche apercu du popup

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n === 1 ? '' : 's'; }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function chk(id){ var e = document.getElementById(id); return e ? e.checked : false; }

  var MOTIFS = {
    session:'${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne permet pas cette modification.")}',
    indisponible:'${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    format:'${T("Format d’image invalide.")}', echec:'${T("L’opération a échoué.")}'
  };
  function expliquer(r){ if (!r) return '${T("Aucune réponse de la fenêtre principale.")}'; if (r.detail) return String(r.detail); return MOTIFS[r.motif] || MOTIFS.echec; }
  function appeler(op, arg){ if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' }); return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; }); }

  var OPTAB = { dashboard:'newsletter:dash', config:'newsletter:cfgDonnees', offer:'newsletter:offerDonnees' };
  function charger(){
    return appeler(OPTAB[TAB], {}).then(function(r){
      if (!r || !r.ok) { vide('${T("Infolettre indisponible")}', expliquer(r)); return false; }
      D = r; if (r.peut) PEUT = r.peut; return true;
    });
  }
  function vide(titre, detail){
    ongletsEl.innerHTML = '';
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:var(--tx-creme)">' + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }
  function relire(){ return charger().then(function(ok){ if (ok) dessiner(); return ok; }); }

  function dessinerOnglets(){
    ongletsEl.innerHTML = [['dashboard','${T("Tableau de bord")}'],['config','${T("⚙ Configuration")}'],['offer','${T("Offre bienvenue")}']]
      .map(function(t){ return '<button data-tab="' + t[0] + '" class="' + (TAB === t[0] ? 'actif' : '') + '">' + t[1] + '</button>'; }).join('');
  }

  /* ══ TABLEAU DE BORD ═══════════════════════════════════════════════════════ */
  function vueDash(){
    if (!D.hasKey) {
      return '<div class="setup"><div class="em"><span class="ic">📧</span></div><h2 style="margin:0 0 .5rem">${T("Configurer Resend")}</h2>'
        + '<p style="margin:0 0 1rem">${T("Configurez votre clé API Resend pour commencer à envoyer des infolettres.")}</p>'
        + '<button class="prim" data-tab="config">${T("Configurer maintenant →")}</button></div>';
    }
    var recents = D.recents.length ? D.recents.map(function(c){
      var st = c.status === 'sent' ? '<span class="badge ok">${T("Envoyée")}</span>' : c.status === 'sending' ? '<span class="badge warn">${T("En cours")}</span>' : '<span class="badge draft">${T("Brouillon")}</span>';
      return '<tr><td><strong>' + esc(c.name) + '</strong><div style="font-size:.72rem;color:var(--tx2)">' + esc(c.sentAt || '—') + '</div></td>'
        + '<td>' + c.sent + (c.failed ? ' / <span style="color:var(--tx-err)">' + c.failed + '</span>' : '') + '</td><td>' + st + '</td></tr>';
    }).join('') : '<tr><td colspan="3" class="vide">${T("Aucune campagne")}</td></tr>';
    var srcs = D.sources.length ? D.sources.map(function(s){
      return '<div class="src"><div class="l"><span>' + esc(s.label) + '</span><span style="font-weight:600">' + s.count + '</span></div>'
        + '<div class="bar"><div style="width:' + s.pct + '%"></div></div></div>';
    }).join('') : '<p style="color:var(--tx2);font-size:.85rem">${T("Aucun abonné encore.")}</p>';
    return '<div class="tuiles">'
      + '<div class="tuile"><div class="k"><span class="ic">👥</span> ${T("Abonnés actifs")}</div><div class="v">' + D.active + '</div><div class="z">' + D.unsub + '${T(" désabonné")}' + plur(D.unsub) + '</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">📣</span> ${T("Campagnes envoyées")}</div><div class="v">' + D.sentCamps + '</div><div class="z">' + D.draftCamps + '${T(" en brouillon")}</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">✉</span> ${T("Courriels envoyés")}</div><div class="v">' + D.totalSent + '</div><div class="z">' + D.failedSent + '${T(" échoué")}' + plur(D.failedSent) + '</div></div>'
      + '<div class="tuile"><div class="k"><span class="ic">🔗</span> ${T("Chaînes actives")}</div><div class="v">' + D.activeChains + '</div><div class="z">' + D.pendingSteps + '${T(" étape")}' + plur(D.pendingSteps) + '${T(" en attente</div>")}</div>'
      + '</div>'
      + (PEUT.edit ? '<div><button class="ghost mini" data-act="chains">${T("⚙ Traiter les chaînes (")}' + D.pendingSteps + ')</button></div>' : '')
      + '<div class="deux">'
      +   '<div class="carte"><h2>${T("Campagnes récentes")}</h2><table><thead><tr><th>${T("Campagne")}</th><th>${T("Envoyés")}</th><th>${T("Statut")}</th></tr></thead><tbody>' + recents + '</tbody></table></div>'
      +   '<div class="carte"><h2>${T("Sources d’abonnés")}</h2>' + srcs + '</div>'
      + '</div>';
  }

  /* ══ CONFIGURATION ═════════════════════════════════════════════════════════ */
  var SERVICES = [
    { key:'orderConfirmation', label:'${T("Confirmation de commande")}', desc:'${T("Envoyé au client après chaque commande réussie.")}' },
    { key:'shipping', label:'${T("Expédition / suivi")}', desc:'${T("Envoyé lors du marquage « Expédiée ».")}' },
    { key:'delivery', label:'${T("Confirmation de livraison")}', desc:'${T("Envoyé dès que le transporteur confirme la livraison.")}' },
    { key:'welcomeOffer', label:'${T("Offre de bienvenue")}', desc:'${T("Code de réduction envoyé à l’inscription.")}' },
    { key:'giftCard', label:'${T("Carte-cadeau")}', desc:'${T("Livraison par courriel lors de l’achat.")}' },
    { key:'chatOffline', label:'${T("Message hors-ligne (chat)")}', desc:'${T("Avis admin quand un visiteur écrit hors-ligne.")}' },
    { key:'passwordReset', label:'${T("Réinitialisation de mot de passe")}', desc:'${T("Avis de sécurité après un changement.")}' },
    { key:'chains', label:'${T("Séquences automatisées")}', desc:'${T("Étapes des chaînes d’automation.")}' },
    { key:'supportTicket', label:'${T("Demande de support client")}', desc:'${T("Avis à support@ et réponse au client.")}' },
  ];
  function bascule(id, on){
    return '<label class="bascule"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (PEUT.edit ? '' : ' disabled') + '><span class="piste"></span><span class="pouce"></span></label>';
  }
  function ligneChamp(lbl, id, v, type, hint){
    return '<div class="champ"><label for="' + id + '">' + esc(lbl) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(v || '') + '"' + (PEUT.edit ? '' : ' readonly') + '>' + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>';
  }
  function vueConfig(){
    var c = D.cfg;
    var ctrls = SERVICES.map(function(s){
      return '<div class="ctrl"><div><div class="t">' + esc(s.label) + '</div><div class="d">' + esc(s.desc) + '</div></div>' + bascule('nl-ctrl-' + s.key, D.controls[s.key] !== false) + '</div>';
    }).join('');
    var cleField = PEUT.edit
      ? ligneChamp('${T("Clé API Resend *")}', 'nl-key', c.apiKey, 'password', '${T("Créez votre clé sur ")}<strong>resend.com/api-keys</strong>')
      : '<div class="champ"><label>${T("Clé API Resend")}</label><input aria-label="${T("Clé API Resend")}" value="' + (c.hasKey ? '••••••••••••' : '') + '" readonly></div>';
    return '<div class="deux">'
      + '<div class="carte"><h2><span class="ic">🔑</span> ${T("API Resend")}</h2>'
      +   cleField
      +   ligneChamp('${T("Courriel expéditeur *")}', 'nl-from-e', c.fromEmail, 'email', '${T("Le domaine doit être vérifié dans Resend")}')
      +   ligneChamp('${T("Nom expéditeur")}', 'nl-from-n', c.fromName)
      +   ligneChamp('${T("Répondre à (optionnel)")}', 'nl-reply', c.replyTo, 'email')
      +   '<hr class="sep">'
      +   ligneChamp('${T("Nom de l’entreprise")}', 'nl-co-name', c.companyName)
      +   ligneChamp('${T("Adresse (pied de page)")}', 'nl-co-addr', c.companyAddress)
      +   ligneChamp('${T("Lien site web (pied de page)")}', 'nl-website-url', c.websiteUrl, 'url')
      +   '<hr class="sep">'
      +   ligneChamp('${T("Courriel expéditeur — transactionnel")}', 'nl-trans-from-e', c.fromEmailTransactional, 'email', '${T("Expédition, cartes-cadeaux, alertes. Vide = courriel infolettre.")}')
      +   ligneChamp('${T("Nom expéditeur — transactionnel")}', 'nl-trans-from-n', c.fromNameTransactional)
      +   '<hr class="sep">'
      +   '<div class="ctrl" style="border:none;padding:.2rem 0"><div><div class="t">${T("Mode test")}</div><div class="d">${T("Envoyer uniquement à l’adresse de test.")}</div></div>' + bascule('nl-testmode', c.testMode) + '</div>'
      +   ligneChamp('${T("Courriel de test")}', 'nl-test-e', c.testEmail, 'email')
      +   (PEUT.edit ? '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem"><button class="prim" data-act="cfgsave">${T("Enregistrer")}</button><button class="ghost" data-act="testconn">${T("Envoyer un courriel de test")}</button></div>' : '')
      + '</div>'
      + '<div class="carte"><h2><span class="ic">🔕</span> ${T("Contrôle des envois par courriel")}</h2>'
      +   '<p class="hint" style="margin:0 0 .6rem">${T("Un service désactivé ne consomme pas de quota Resend.")}</p>'
      +   ctrls
      +   (PEUT.edit ? '<div style="margin-top:.7rem"><button class="prim" data-act="ctrlsave">${T("Enregistrer les contrôles")}</button></div>' : '')
      + '</div>'
      + '</div>';
  }

  /* ══ OFFRE DE BIENVENUE ════════════════════════════════════════════════════ */
  function vueOffer(){
    var c = D.cfg;
    var stats = D.stats ? '<div class="tuiles" style="margin-bottom:.8rem">'
      + '<div class="tuile"><div class="k">${T("Codes générés")}</div><div class="v">' + D.stats.total + '</div></div>'
      + '<div class="tuile"><div class="k">${T("Codes utilisés")}</div><div class="v" style="color:var(--tx-ok)">' + D.stats.used + '</div></div>'
      + '<div class="tuile"><div class="k">${T("En attente")}</div><div class="v" style="color:var(--tx-att)">' + D.stats.active + '</div></div>'
      + '</div>' : '';
    var img = c.imageUrl ? '<img class="apercu-img" src="' + esc(c.imageUrl) + '" alt="${T("Aperçu")}">' : '';
    var ro = PEUT.edit ? '' : ' readonly';
    return '<div class="carte">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">'
      +   '<div><h2 style="margin:0 0 .2rem">${T("Widget Offre de bienvenue")}</h2><div class="hint" style="margin:0">${T("Bouton ")}<span class="ic">🎁</span>${T(" flottant + popup — suit le visiteur sur tout le site.")}</div></div>'
      +   '<div style="display:flex;align-items:center;gap:.5rem"><span class="hint" style="margin:0">${T("Actif")}</span>' + bascule('offer-enabled', c.enabled) + '</div>'
      + '</div>'
      + (D.done ? '<div class="hint" style="color:#86efac;margin:0 0 .8rem">${T("✓ Un visiteur a déjà soumis ce widget. Utilisez « Réinitialiser » pour re-tester.")}</div>' : '')
      + stats
      + '<div class="deux">'
      +   '<div class="champ"><label for="offer-title">${T("Titre (saut de ligne = ↵)")}</label><textarea id="offer-title" rows="2"' + ro + '>' + esc(c.title) + '</textarea></div>'
      +   '<div class="champ"><label>${T("Image côté gauche")}</label>' + img
      +     (PEUT.edit ? '<label style="display:inline-block;margin-bottom:.4rem"><span class="ghost mini" style="display:inline-block;padding:.16rem .5rem;border:1px solid var(--v16);border-radius:8px"><span class="ic">📁</span> ${T("Choisir une photo")}</span><input type="file" accept="image/*" id="offer-file" style="display:none"></label>' : '')
      +     '<input id="offer-img" value="' + esc(c.imageUrl) + '" placeholder="${T("https://… ou coller une URL")}"' + ro + '>'
      +     '<div class="hint">${T("700 × 900 px recommandé (portrait). Max 600 Ko.")}</div></div>'
      + '</div>'
      + '<div class="champ"><label for="offer-sub">${T("Sous-titre")}</label><input id="offer-sub" value="' + esc(c.subtitle) + '"' + ro + '></div>'
      + '<div class="deux">'
      +   '<div class="champ"><label for="offer-cta">${T("Texte du bouton")}</label><input id="offer-cta" value="' + esc(c.cta) + '"' + ro + '></div>'
      +   '<div class="champ"><label for="offer-discount">${T("Valeur de réduction (%)")}</label><input id="offer-discount" type="number" min="1" max="100" value="' + (c.discountValue || 10) + '"' + ro + '><div class="hint">${T("Un code unique WB-XXXXXX par client, valide 1 commande, expire 30 j.")}</div></div>'
      + '</div>'
      + '<div class="champ"><label for="offer-legal">${T("Mention légale")}</label><input id="offer-legal" value="' + esc(c.legal) + '"' + ro + '></div>'
      + '<div style="display:flex;gap:.6rem;flex-wrap:wrap">'
      +   (PEUT.edit ? '<button class="prim" data-act="offersave">${T("Enregistrer")}</button>' : '')
      +   '<button class="ghost" data-act="apercu">${T("Aperçu du popup")}</button>'
      +   (PEUT.edit ? '<button class="ghost mini" data-act="offerreset" style="color:var(--tx-or)">${T("↺ Réinitialiser pour re-tester")}</button>' : '')
      + '</div>'
      + '</div>';
  }
  function vueApercu(){
    var c = D.cfg;
    var bg = c.imageUrl ? 'background-image:url(' + esc(c.imageUrl) + ')' : '';
    return '<div class="voile" id="ap-voile"><div class="pop">'
      + '<button class="x" data-act="apclose">×</button>'
      + '<div class="g" style="' + bg + '"></div>'
      + '<div class="d"><div class="titre">' + esc(c.title || '') + '</div>'
      +   '<div class="st">' + esc(c.subtitle || '') + '</div>'
      +   '<button class="cta">' + esc(c.cta || SZ_DONNEES.offreBoutonDefaut) + '</button>'
      +   '<div class="lg">' + esc(c.legal || '') + '</div></div>'
      + '</div></div>';
  }

  /* ══ DESSIN ════════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    dessinerOnglets();
    sous.textContent = PEUT.edit ? '' : '${T("Lecture seule")}';
    var h = TAB === 'config' ? vueConfig() : TAB === 'offer' ? vueOffer() : vueDash();
    if (APERCU && TAB === 'offer') h += vueApercu();
    corps.innerHTML = h;
    var f = document.getElementById('offer-file');
    if (f) f.onchange = function(){ if (f.files && f.files[0]) televerserImage(f.files[0]); };
  }

  /* ══ GESTES ════════════════════════════════════════════════════════════════ */
  function saveCfg(){
    var d = {
      apiKey: PEUT.edit ? val('nl-key') : undefined,
      fromEmail: val('nl-from-e'), fromName: val('nl-from-n'), replyTo: val('nl-reply'),
      companyName: val('nl-co-name'), companyAddress: val('nl-co-addr'), websiteUrl: val('nl-website-url'),
      fromEmailTransactional: val('nl-trans-from-e'), fromNameTransactional: val('nl-trans-from-n'),
      testMode: chk('nl-testmode'), testEmail: val('nl-test-e'),
    };
    dire('${T("Enregistrement…")}');
    appeler('newsletter:cfgEcrire', d).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      relire().then(function(){ dire('${T("Configuration enregistrée.")}', 'bon'); });
    });
  }
  function saveCtrls(){
    var ctrl = {};
    SERVICES.forEach(function(s){ ctrl[s.key] = chk('nl-ctrl-' + s.key); });
    dire('${T("Enregistrement…")}');
    appeler('newsletter:controls', { controls: ctrl }).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('${T("Contrôles d’envoi enregistrés.")}', 'bon');
    });
  }
  function testConn(){
    dire('${T("Envoi du courriel de test…")}');
    appeler('newsletter:testConn', {}).then(function(r){
      if (r && r.ok) dire('${T("Courriel de test envoyé.")}', 'bon');
      else dire(expliquer(r), 'err');
    });
  }
  function saveOffer(){
    var d = {
      enabled: chk('offer-enabled'), title: val('offer-title'), subtitle: val('offer-sub'),
      cta: val('offer-cta'), legal: val('offer-legal'), imageUrl: val('offer-img'), discountValue: val('offer-discount'),
    };
    dire('${T("Enregistrement…")}');
    appeler('newsletter:offerEcrire', d).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      relire().then(function(){ dire('${T("Configuration enregistrée.")}', 'bon'); });
    });
  }
  function televerserImage(file){
    if (file.size > 600000) { dire('${T("Image trop grande (max 600 Ko).")}', 'err'); return; }
    var fr = new FileReader();
    fr.onerror = function(){ dire('${T("Lecture de l’image impossible.")}', 'err'); };
    fr.onload = function(){
      dire('${T("Téléversement…")}');
      appeler('newsletter:offerImage', { dataUrl: fr.result }).then(function(r){
        if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
        var inp = document.getElementById('offer-img'); if (inp) inp.value = r.url;
        var prev = document.querySelector('.apercu-img');
        if (!prev) { var box = inp && inp.parentNode; if (box) box.insertAdjacentHTML('afterbegin', '<img class="apercu-img" src="' + r.url.replace(/"/g, '&quot;') + '" alt="${T("Aperçu")}">'); }
        else prev.src = r.url;
        dire('${T("Photo importée — cliquez Enregistrer.")}', 'bon');
      });
    };
    fr.readAsDataURL(file);
  }
  function resetOffer(){
    appeler('newsletter:offerReset', {}).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      relire().then(function(){ dire('${T("Réinitialisé.")}', 'bon'); });
    });
  }
  function traiterChaines(){
    dire('${T("Traitement des chaînes…")}');
    appeler('newsletter:processChains', {}).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.rien) { dire('${T("Aucune étape en attente.")}', 'att'); return; }
      relire().then(function(){ dire(r.sent + '${T(" envoyé")}' + plur(r.sent) + (r.failed ? ', ' + r.failed + '${T(" échec")}' + plur(r.failed) : '') + '.', 'bon'); });
    });
  }

  /* ══ ÉCOUTEURS ═════════════════════════════════════════════════════════════ */
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); if (!b) return;
    var g = function(n){ return b.getAttribute(n); };
    if (APERCU) { if (g('data-act') === 'apclose') { APERCU = false; dessiner(); return; } if (g('data-act') !== 'apercu') return; }
    if (g('data-tab')) { TAB = g('data-tab'); APERCU = false; charger().then(function(ok){ if (ok) dessiner(); }); return; }
    var act = g('data-act');
    if (act === 'cfgsave') saveCfg();
    else if (act === 'ctrlsave') saveCtrls();
    else if (act === 'testconn') testConn();
    else if (act === 'offersave') saveOffer();
    else if (act === 'offerreset') resetOffer();
    else if (act === 'chains') traiterChaines();
    else if (act === 'apercu') { APERCU = true; dessiner(); }
    else if (act === 'apclose') { APERCU = false; dessiner(); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (APERCU) { APERCU = false; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  window.szModeAncre = function(actif){ document.documentElement.classList.toggle('ancre', !!actif); };

  charger().then(function(ok){
    if (!ok) return;
    dessiner();
    ${ouvreApercu ? 'APERCU = true; dessiner();' : ''}
  });
})();
</script></body></html>`;
}

module.exports = { pageNewsletter };
