'use strict';

/*
 * FENÊTRE « SAUVEGARDE & RESTAURATION » — NATIVE (#27)
 * =============================================================================
 * Dernière entrée web du menu Sécurité. Chaque sauvegarde capture toute la base
 * Turso, un inventaire des objets Cloudflare R2 et la version du code déployé,
 * compressés puis chiffrés (AES-256-GCM) et gardés douze mois dans R2.
 *
 * Les cœurs vivent dans backup.js (contexte origine-plein) : backup.php est
 * appelé en POST same-origin avec le jeton de session. Rien n'est réécrit ici.
 *
 * ⚠ AUCUN SECRET NE TRAVERSE, ET IL N'Y EN A JAMAIS EU À FAIRE TRAVERSER.
 * `BACKUP_ENC_KEY` est une variable d'environnement du serveur : c'est
 * backup.php qui chiffre et déchiffre. Le champ `encKey` d'une sauvegarde N'EST
 * PAS une clé malgré son nom — c'est le CHEMIN de l'objet dans R2, que le
 * serveur revalide à chaque appel.
 *
 * ⚠⚠ CRÉER / RESTAURER / SUPPRIMER / PURGER = SUPER-ADMINISTRATEUR, et c'est le
 * SERVEUR qui le vérifie depuis le 2026-08-13 (backup.php). Ça ne l'était pas :
 * l'écran l'annonçait, le serveur ne regardait que « session du personnel ».
 * Les boutons masqués ci-dessous sont un confort, pas une protection.
 *
 * ⚠ Le TÉLÉCHARGEMENT se fait dans la PAGE (patron « fenêtre pilote », comme les
 * exports des Journaux) : c'est là que vivent les accroches du panneau
 * « Fichiers téléchargés ».
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun caractère accent grave dans la portion script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1.1rem 1.2rem;margin:0 0 1.1rem}
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.quoi{font-size:.79rem;color:var(--tx2);line-height:1.6;margin:0;max-width:62rem}
.quoi b{color:var(--tx)}
.outils{display:flex;gap:.5rem;flex-wrap:wrap}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:0 0 1.2rem}
@media(max-width:760px){.stat-grid{grid-template-columns:1fr}}
.stat{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem}
.stat .l{font-size:.74rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}
.stat .v{font:700 1.5rem/1.15 Georgia,serif;margin-top:.25rem}
.stat .s{font-size:.72rem;color:var(--tx-gris);margin-top:.2rem}
table.tb{width:100%;border-collapse:collapse}
table.tb th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);padding:.5rem .7rem;border-bottom:1px solid var(--v10);white-space:nowrap}
table.tb td{padding:.6rem .7rem;border-bottom:1px solid var(--v06);font-size:.85rem;vertical-align:middle}
.mono{font-family:Consolas,monospace;font-size:.7rem;color:var(--tx-gris)}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover:not(:disabled){background:var(--v09)}
.b:disabled{opacity:.45;cursor:default}
.b.dgr{color:var(--tx-f6a6a6);border-color:rgba(248,113,113,.35)}
.b.dgr:hover:not(:disabled){background:rgba(248,113,113,.16)}
.b.att{color:var(--tx-or2);border-color:rgba(240,180,80,.35)}
.b.att:hover:not(:disabled){background:rgba(240,180,80,.14)}
.acts{white-space:nowrap;text-align:right}
.acts .b{margin-left:.3rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
.vide{padding:2.4rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
/* ── Surcouches ─────────────────────────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:var(--f-131c2b);border:1px solid var(--v12);border-radius:14px;max-width:620px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid var(--v08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
label.champ{display:block;margin:0 0 .9rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
input.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.t:focus{outline:none;border-color:#c9a97e}
input.t.manque{border-color:#f87171;background:rgba(248,113,113,.08)}
.garde{border-radius:9px;padding:.85rem 1rem;font-size:.83rem;line-height:1.6;margin:0 0 1rem}
.garde.jaune{background:rgba(234,179,8,.12);border:1px solid rgba(234,179,8,.4);color:var(--tx-or2)}
.garde.rouge{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);color:var(--tx-err2)}
.garde b{color:var(--tx)}
.nav{display:flex;justify-content:flex-end;align-items:center;gap:.6rem;width:100%}
/* ⚠ LE MESSAGE D'UNE SURCOUCHE VIT DANS LA SURCOUCHE — le pied de la fenêtre est
   derrière le voile, un avertissement s'y perdrait hors du champ de vision
   (défaut signalé le 2026-08-13 sur l'assistant des incidents). */
.msgsur{flex:1 1 auto;min-width:0;font-size:.79rem;color:var(--tx2);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msgsur.err{color:var(--tx-err)}.msgsur.bon{color:var(--tx-ok)}.msgsur.att{color:var(--tx-jaune)}
/* ══ L AVANCEMENT DE LA SAUVEGARDE (2026-09-09, sa demande) ═══════════════════
   ⚠ LE POURCENTAGE EST GRAND, ET C EST UNE LECON DEJA APPRISE : le 2026-09-06,
   sur l ecran de mise a jour, le chiffre etait deja la — noye dans une phrase, a
   la taille du texte. On ne REGARDE pas un ecran d attente, on le CONSULTE du
   coin de l oeil en faisant autre chose ; un chiffre noye n existe pas. La
   correction n avait pas ete d ajouter une donnee mais de lui donner sa place.
   Meme regle ici (voir porte-progression.js).
   ⚠ ET L ETAPE EST NOMMEE AU-DESSUS DE LA BARRE, pas en dessous : c est ce qu il
   a demande en premier (<< exemple Sauvegarde la base de donnee… >>). Le nom
   repond a << que fait-il ? >>, le pourcentage a << combien de temps encore ? >>.
   Deux questions, deux lignes, dans cet ordre.
   ⚠ AUCUNE TRANSITION SUR LA LARGEUR AU-DELA DE .3 s : une barre qui glisse
   longtemps continue d avancer apres l arret de l operation, donc elle MENT
   quelques instants — et c est precisement ce que ce chantier evite. */
.prog:empty{display:none}
.prog{margin:.9rem 0 0;padding:.6rem .7rem;border-radius:10px;
  background:var(--v03);border:1px solid var(--v10)}
.prog .pg-t{font-size:.82rem;color:var(--tx);margin-bottom:.4rem}
.prog .pg-b{height:.42rem;border-radius:99px;background:var(--v12);overflow:hidden}
.prog .pg-b i{display:block;height:100%;background:#c9a97e;transition:width .3s}
.prog .pg-p{display:flex;align-items:baseline;gap:.6rem;margin-top:.35rem;
  font:700 1.25rem/1.1 system-ui;color:var(--tx-or);font-variant-numeric:tabular-nums}
.prog .pg-e{font:400 .72rem/1.2 system-ui;color:var(--tx2);margin-left:auto}
html.jour .prog{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.12)}
html.jour .prog .pg-b{background:rgba(0,0,0,.1)}
@media (prefers-reduced-motion:reduce){.prog .pg-b i{transition:none}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ Identifiant d'ouverture pour le banc (son DOM est factice, un clic n'y
   navigue nulle part) : 'creer', 'restaurer-<id>', 'supprimer-<id>'. */
function pageSauvegarde(ouverture) {
  var brut = String(ouverture || '');
  var CREER0 = brut === 'creer' ? '1' : '';
  var REST0 = '', SUPP0 = '';
  if (brut.indexOf('restaurer-') === 0) REST0 = brut.slice(10).replace(/[^A-Za-z0-9_.:/-]/g, '');
  else if (brut.indexOf('supprimer-') === 0) SUPP0 = brut.slice(10).replace(/[^A-Za-z0-9_.:/-]/g, '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Sauvegarde &amp; Restauration — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.sauvegarde}</span><h1>Sauvegarde &amp; Restauration</h1></div>
<div class="ro" id="ro" hidden>Lecture seule : créer, restaurer, supprimer et purger sont réservés au super-administrateur.</div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div></div>
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
  var D = null, RO = true, OCCUPE = false, FIGE = false;
  var CREER = '${CREER0}', REST = '${REST0}', SUPP = '${SUPP0}';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  // Le message va DANS la surcouche quand il y en a une d'ouverte.
  function dire(t, cl){
    var loc = document.getElementById('s-msg');
    if (loc){ loc.textContent = (t==null?'':String(t)); loc.className = 'msgsur' + (cl?' '+cl:''); }
    szDire(t, cl);
  }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne donne pas accès aux sauvegardes.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:'La fenêtre principale ne répond pas.',
    delai:"La fenêtre principale n'a pas répondu à temps.",
    operation_inconnue:'Cette version de l’application ne connaît pas cette opération.',
    echec:'L’opération a échoué.'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('Erreur inattendue ('+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  // ── Liste ────────────────────────────────────────────────────────
  function vueListe(){
    var l = D.sauvegardes || [];
    var octets = 0; for (var k=0;k<l.length;k++) octets += (+l[k].blobBytes || 0);
    var h = '<div class="entete">'
      + ''
      + '<div class="outils">'
      + (D.peutEcrire ? '<button class="prim" id="s-nouveau">＋ Créer une sauvegarde</button>' : '')
      + '<button class="b" id="s-refresh">↻ Actualiser</button>'
      + (D.peutEcrire ? '<button class="b dgr" id="s-purger"><span class="ic">🗑</span> Purger (&gt; '+(D.retentionMois||12)+' mois)</button>' : '')
      + '</div></div>';

    h += '<div class="stat-grid">'
      + '<div class="stat"><div class="l">Sauvegardes</div><div class="v">'+l.length+'</div><div class="s">rétention '+(D.retentionMois||12)+' mois</div></div>'
      + '<div class="stat"><div class="l">La plus récente</div><div class="v" style="font-size:1.05rem;color:'+(l.length?'var(--tx-ok2)':'var(--tx-att)')+'">'+(l.length?esc(l[0].quand):'aucune')+'</div><div class="s">'+(l.length?esc(l[0].taille):'le registre est vide')+'</div></div>'
      + '<div class="stat"><div class="l">Espace occupé</div><div class="v" style="font-size:1.3rem">'+fmtO(octets)+'</div><div class="s">dans Cloudflare R2</div></div>'
      + '</div>';

    if (!l.length){
      h += '<div class="carte"><div class="vide">Aucune sauvegarde.<br>'
        + (D.peutEcrire ? 'Cliquez « Créer une sauvegarde » pour en générer une.' : 'Seul le super-administrateur peut en créer une.')
        + '</div></div>';
      corps.innerHTML = h; lier(); return;
    }

    h += '<div class="carte" style="padding:0;overflow-x:auto"><table class="tb"><thead><tr>'
      + '<th>Date</th><th>Contenu</th><th>Application</th><th style="text-align:center">Objets R2</th><th>Taille</th><th>Note</th><th></th>'
      + '</tr></thead><tbody>';
    for (var i=0;i<l.length;i++){ var b=l[i];
      h += '<tr><td style="white-space:nowrap;font-weight:600">'+esc(b.quand)
        + (b.commit?'<div class="mono">'+esc(b.commit)+'</div>':'')+'</td>'
        + '<td>'+b.total+' enreg.<div style="font-size:.72rem;color:var(--tx-gris)">'+b.produits+' produits · '+b.commandes+' cmd · '+b.factures+' fact.</div></td>'
        /* ⚠ L APPLICATION CONSERVEE AVEC CETTE SAUVEGARDE (2026-09-08, sur sa
           demande). Trois etats, et les trois doivent se distinguer d un coup
           d oeil :
           • une version et N installateurs → la sauvegarde peut tout remonter ;
           • un ECHEC d epinglage → il est ECRIT, en ambre. Une sauvegarde qui se
             croit complete alors qu elle ne l est pas serait pire que rien ;
           • rien du tout → sauvegarde d AVANT cette version, et on le dit
             (<< non conservee >>) plutot que d afficher un tiret muet qui
             laisserait croire a une lecture ratee. */
        + '<td style="white-space:nowrap">'
        /* ⚠ AUCUN PICTOGRAMME DANS CE QUI S AFFICHE : sa decision du 2026-09-05
           (<< les 269 pictogrammes, retire les >>), plafond a ZERO, et
           banc-pictogrammes.js a refuse la construction quand j y ai mis deux
           << attention >>. La couleur ambre et le mot << non conservee >>
           disent la meme chose sans dessin. */
        +   (b.appVersion
              ? '<b>' + esc(b.appVersion) + '</b>'
                + '<div style="font-size:.72rem;color:var(--tx-gris)">'
                + (b.appFichiers || 0) + ' installateur' + ((b.appFichiers || 0) > 1 ? 's' : '')
                + ' conservé' + ((b.appFichiers || 0) > 1 ? 's' : '') + '</div>'
                + (b.appErreur ? '<div style="font-size:.7rem;color:var(--tx-att)">' + esc(b.appErreur) + '</div>' : '')
              : '<span style="color:var(--tx-gris);font-size:.78rem">non conservée</span>'
                + (b.appErreur ? '<div style="font-size:.7rem;color:var(--tx-att)">' + esc(b.appErreur) + '</div>' : ''))
        + '</td>'
        + '<td style="text-align:center">'+(b.r2Objects==null?'—':b.r2Objects)+'</td>'
        /* ⚠⚠ LE TOTAL, ET SA DECOMPOSITION SOUS LUI — son signalement du
           2026-09-09 : << verifier ton calcul de poids car ses impossible que
           sa prenne que cette espace pour un exe inclus dans la sauvegarde >>.
           Il avait raison, et le chiffre n etait pas faux : il disait le dump
           chiffre de la base SEUL (107 Ko), sur la meme ligne que << 5
           installateurs conserves >> (~430 Mo). Une partie qui se lit comme le
           tout — et surtout, une purge INDECIDABLE : on ne peut pas juger de ce
           qu occupe une sauvegarde quand la seule taille montree est mille fois
           plus petite que la realite.
           ⚠ LA DECOMPOSITION RESTE VISIBLE : un total nu ferait chercher ou sont
           passes les 430 Mo. Deux lignes, la reponse est complete.
           ⚠⚠ ET LES ANCIENNES SAUVEGARDES DISENT CE QU ELLES NE SAVENT PAS. Leur
           meta ne porte pas le poids des installateurs : on affiche le dump et
           << base seule >> en ambre, plutot que d estimer. Un chiffre invente
           pour de vieilles sauvegardes dont on ne sait rien serait pire qu une
           mention honnete — c est la lecon du 2026-09-08, la meme semaine. */
        + '<td style="white-space:nowrap">'
        +   (b.tailleAuMoins ? 'au moins ' : '') + esc(b.taille)
        +   (b.tailleIncomplete
              ? '<div style="font-size:.7rem;color:var(--tx-att)">base seule — installateurs non comptés</div>'
              : (b.tailleApp
                  ? '<div style="font-size:.7rem;color:var(--tx-gris)">'
                    + esc(b.tailleBase) + ' de base + ' + esc(b.tailleApp) + ' d’application</div>'
                  : ''))
        + '</td>'
        + '<td style="color:var(--tx2)">'+esc(b.note||'—')+'</td>'
        + '<td class="acts">'
        + '<button class="b" data-dl="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Télécharger le fichier chiffré">⬇ Télécharger</button>'
        + (D.peutEcrire ? '<button class="b att" data-rest="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Réécrire la base à partir de cette sauvegarde">↩ Restaurer</button>' : '')
        + (D.peutEcrire ? '<button class="b dgr" data-del="'+esc(b.encKey)+'" data-id="'+esc(b.id)+'" title="Supprimer définitivement cette sauvegarde"><span class="ic">🗑</span> Supprimer</button>' : '')
        + '</td></tr>';
    }
    h += '</tbody></table></div>';
    corps.innerHTML = h;
    lier();
  }

  function fmtO(n){
    if (!n) return '0 o';
    if (n < 1024) return n + ' o';
    var u=['Ko','Mo','Go'], i=-1;
    do { n/=1024; i++; } while (n>=1024 && i<u.length-1);
    return (n<10 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  }

  function lier(){
    var b;
    b=document.getElementById('s-nouveau'); if (b) b.onclick=ouvrirCreer;
    b=document.getElementById('s-refresh'); if (b) b.onclick=function(){ recharger('Liste actualisée.', 'bon'); };
    b=document.getElementById('s-purger');  if (b) b.onclick=ouvrirPurge;
    var ds=corps.querySelectorAll('[data-dl]');
    for (var i=0;i<ds.length;i++) ds[i].onclick=function(){ telecharger(this.getAttribute('data-dl'), this.getAttribute('data-id')); };
    var rs=corps.querySelectorAll('[data-rest]');
    for (var j=0;j<rs.length;j++) rs[j].onclick=function(){ ouvrirRestaurer(this.getAttribute('data-rest'), this.getAttribute('data-id')); };
    var ss=corps.querySelectorAll('[data-del]');
    for (var k2=0;k2<ss.length;k2++) ss[k2].onclick=function(){ ouvrirSupprimer(this.getAttribute('data-del'), this.getAttribute('data-id')); };
  }

  // ── Surcouche générique ──────────────────────────────────────────
  function fermerSur(){ szPleinReinit(); var s=document.getElementById('sur-s'); if (s) s.remove(); }
  /* ══ VERROUILLER LES SORTIES PENDANT UNE OPERATION — sa demande du 2026-09-09
     ══════════════════════════════════════════════════════════════════════════
     Ses mots : << desactive le bouton fermer pendant la sauvegarde au lieu de
     l ecrire >>.
     ⚠⚠ IL A RAISON, ET LA FORMULATION DIT EXACTEMENT LE DEFAUT. La fenetre
     ECRIVAIT << Sauvegarde en cours, ne fermez pas cette fenetre… >> et laissait
     << Fermer >> et << Annuler >> parfaitement cliquables. Une consigne ecrite a
     la place d un garde, c est un garde qui n existe pas : elle demande de se
     souvenir, au moment precis ou l on attend et ou l on clique distraitement.
     ⚠ ET LE MOT PARTAIT AVEC LE RESTE : il occupait la ligne d etat, donc il
     remplacait ce que cette ligne sert a dire — ou en est l operation.

     ⚠⚠ ON REPOND DE L ETAT LAISSE DERRIERE. Chaque appelant DOIT deverrouiller
     sur echec, sinon la surcouche devient incondamnable — et ce depot considere
     qu une fenetre qu on ne peut plus fermer est pire que la perte qu on evite
     (c est la regle du bouton X, ecrite dans main.js). Les quatre appelants le
     font dans leur branche d erreur.
     ⚠ << Annuler >> EST VERROUILLE AUSSI, et il le faut : il appelle la meme
     fonction de fermeture que le X, donc c est la meme porte sous un autre nom.
     Un garde pose sur une seule des deux issues ne garde rien.
     ⚠⚠ ET C EST LE BANC DE L ACCENT GRAVE QUI A TROUVE MA FAUTE ICI : j avais
     ecrit le nom de la fonction entre accents graves, DANS un gabarit. Le
     controle de syntaxe de Node etait passe — le compte etait PAIR. Douzieme
     fois dans ce depot, et la troisieme fois silencieuse. */
  function verrouSur(on){
    ['s-x', 's-annuler'].forEach(function(id){
      var b = document.getElementById(id);
      if (!b) return;
      b.disabled = !!on;
      /* Le titre DIT pourquoi le bouton ne repond pas. Un bouton grise sans
         explication se clique deux fois, puis on cherche la panne ailleurs. */
      if (on) b.title = 'Indisponible pendant l’opération en cours';
      else b.removeAttribute('title');
    });
  }
  function ouvrirSur(titre, corpsH, piedH, largeur){
    fermerSur();
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-s';
    sur.innerHTML = '<div class="boite"'+(largeur?' style="max-width:'+largeur+'"':'')+'>'
      + '<div class="tt"><h3>'+titre+'</h3>'
      + '<div><button class="sz-btnplein" id="s-plein" title="Occuper toute la fenêtre">⛶ Plein écran</button>'
      + '<button class="mini" id="s-x">Fermer</button></div></div>'
      + '<div class="liste">'+corpsH+'</div>'
      + '<div class="tt" style="border-bottom:0;border-top:1px solid var(--v08)">'
      + '<div class="nav"><span class="msgsur" id="s-msg"></span>'+piedH+'</div></div></div>';
    document.body.appendChild(sur);
    document.getElementById('s-x').onclick=fermerSur;
    var bp=document.getElementById('s-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };
    return sur;
  }

  // ── Créer ────────────────────────────────────────────────────────
  function ouvrirCreer(){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('Nouvelle sauvegarde',
      '<p class="quoi" style="margin:0 0 1rem">Ajoutez une <b>note</b> pour reconnaître cette sauvegarde plus tard — c’est facultatif. L’opération dompe toute la base, elle peut prendre un moment.</p>'
      + '<label class="champ"><span class="lbl">Note (facultatif)</span>'
      + '<input class="t" id="s-note" maxlength="200" placeholder="Ex. : avant mise à jour">'
      + '<span class="sub">200 caractères au plus.</span></label>'
      /* La zone d avancement, VIDE au depart : elle n a rien a dire avant qu on
         clique. Une barre a 0 % affichee d avance ferait croire qu une operation
         est deja commencee — et sur un ecran de sauvegarde, c est exactement le
         doute qu il ne faut pas semer. */
      + '<div class="prog" id="s-prog"></div>',
      '<button class="b" id="s-annuler">Annuler</button><button class="prim" id="s-go"><span class="ic">💾</span> Créer la sauvegarde</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=creer;
    var n=document.getElementById('s-note'); if (n) try { n.focus(); } catch(e){}
  }
  /* ══ OU EN EST LA SAUVEGARDE — sa demande du 2026-09-09 ════════════════════
     Ses mots : << un pourcentage et un avancement de la sauvegarde, exemple
     Sauvegarde la base de donnee… etc. >>. La fenetre n affichait qu un bouton
     << Sauvegarde en cours… >> : on ne savait ni ou on en etait, ni si ca
     avancait encore. Sur une operation qui dure, ces deux questions sont la
     meme, et c est la seconde qui inquiete.

     ⚠⚠ LE CHIFFRE EST MESURE, PAS ANIME. C est backup.php qui ecrit son etape
     APRES l avoir franchie ; cette fenetre ne fait que la relire. Une barre qui
     monterait au chronometre aurait l air juste et annoncerait 90 % pendant
     qu un envoi est refuse — ce depot a deja paye un chiffre faux quatre fois de
     suite. Ici, rien n est devine.
     ⚠ LE POURCENTAGE PLAFONNE A 99 % cote serveur : les 100 % appartiennent a la
     REPONSE de la creation, la seule chose qui prouve que tout a reussi.
     ⚠ LE JETON EST FABRIQUE ICI et voyage avec les deux appels : deux postes qui
     sauvegardent en meme temps ne lisent donc pas l etat l un de l autre. */
  var PROG_T = null;
  function jetonProgres(){
    var s = '';
    var abc = '0123456789abcdef';
    for (var i = 0; i < 24; i++) s += abc.charAt(Math.floor(Math.random() * 16));
    return s;
  }
  function peindreProgres(p){
    var z = document.getElementById('s-prog');
    if (!z) return;
    if (!p) { z.innerHTML = ''; return; }
    var pct = Math.max(0, Math.min(99, parseInt(p.pct, 10) || 0));
    /* Le detail d une etape divisible — les installateurs. C est la plus longue,
       et sans son compte la barre resterait immobile a 33 % pendant l essentiel
       de l attente, donc indiscernable d une operation bloquee. */
    var sur = (p.sur && p.de) ? (' — ' + p.de + ' sur ' + p.sur) : '';
    z.innerHTML = '<div class="pg-t">' + esc(p.libelle || '') + esc(sur) + '</div>'
      + '<div class="pg-b"><i style="width:' + pct + '%"></i></div>'
      + '<div class="pg-p">' + pct + ' %'
      + '<span class="pg-e">etape ' + (parseInt(p.rang, 10) || 1)
      + ' sur ' + (parseInt(p.total, 10) || 6) + '</span></div>';
  }
  function suivreProgres(jeton){
    arreterProgres();
    /* 1,2 s : assez vif pour qu une etape courte se voie passer, assez lent pour
       ne peser sur rien. Le sondage s arrete DES que la creation repond. */
    PROG_T = setInterval(function(){
      appeler('sauvegarde:progres',[jeton]).then(function(r){
        /* ⚠ ON NE REPEINT QUE SUR UNE REPONSE UTILE. Un refus reseau ou un etat
           pas encore ecrit rendrait un etat vide : effacer ce qu on affiche
           ferait clignoter l ecran entre << etape 3 >> et rien du tout, ce qui
           donne l impression que ca a plante. On garde le dernier etat connu. */
        if (r && r.ok && r.progres) peindreProgres(r.progres);
      });
    }, 1200);
  }
  function arreterProgres(){ if (PROG_T) { clearInterval(PROG_T); PROG_T = null; } }

  function creer(){
    if (OCCUPE) return; OCCUPE=true;
    /* ⚠ LES SORTIES SONT VERROUILLEES, PAS SEULEMENT DECONSEILLEES — sa demande
       du 2026-09-09 : << desactive le bouton fermer pendant la sauvegarde au
       lieu de l ecrire >>. Voir la fonction de verrouillage plus haut. */
    verrouSur(true);
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='Sauvegarde en cours…'; }
    var jeton = jetonProgres();
    /* La zone d avancement remplace la phrase << ne fermez pas cette fenetre >>,
       qui occupait la ligne d etat — donc qui prenait la place de ce que cette
       ligne sert a dire : ou en est l operation. */
    var z = document.getElementById('s-prog');
    if (z) z.innerHTML = '<div class="pg-t">Preparation…</div>'
      + '<div class="pg-b"><i style="width:0%"></i></div>';
    dire('');
    suivreProgres(jeton);
    appeler('sauvegarde:creer',[txv('s-note'), jeton]).then(function(r){ OCCUPE=false;
      arreterProgres();
      if (r&&r.ok){
        fermerSur(); D=r; RO=!r.peutEcrire; vueListe();
        /* ⚠ LA SAUVEGARDE A REUSSI MEME SI L EPINGLAGE A ECHOUE — la base est
           sauvee, et c est l essentiel. Mais on ne l annonce pas << bon >> tout
           court : le message dit AMBRE ce qui manque, ICI, au seul moment ou
           quelqu un regarde. Le decouvrir le jour d une restauration serait le
           pire des deux. */
        if (r.appErreur) {
          dire('Sauvegarde créée ('+(r.taille||'')+') — mais l’application n’a pas été conservée : '+r.appErreur, 'att');
        } else if (r.appVersion) {
          dire('Sauvegarde créée ('+(r.taille||'')+') — application '+r.appVersion
            + ' conservée ('+(r.appFichiers||0)+' installateur'+((r.appFichiers||0)>1?'s':'')+').', 'bon');
        } else {
          dire('Sauvegarde créée ('+(r.taille||'')+').', 'bon');
        }
      }
      else {
        /* ⚠⚠ ON REPOND DE L ETAT LAISSE DERRIERE. Sans verrouSur(false) ici,
           un echec laisserait la surcouche INCONDAMNABLE : ni << Fermer >>, ni
           << Annuler >>, et il n y a pas de touche Echap dans cette fenetre. Ce
           depot considere qu une fenetre qu on ne peut plus fermer est pire que
           la perte qu on evite — c est la regle du bouton X, ecrite dans main.js.
           ⚠ ET LA ZONE D AVANCEMENT SE VIDE : laisser << Envoi, 66 % >> sous un
           message d echec, c est afficher deux affirmations contradictoires, et
           c est la rassurante qu on croit. */
        verrouSur(false);
        var zp = document.getElementById('s-prog'); if (zp) zp.innerHTML = '';
        if (go){ go.disabled=false; go.textContent='Créer la sauvegarde'; }
        dire('Échec : '+expliquer(r), 'err');
      }
    });
  }

  // ── Télécharger ──────────────────────────────────────────────────
  function telecharger(encKey, id){
    if (OCCUPE) return; OCCUPE=true; dire('Préparation du fichier…');
    appeler('sauvegarde:telecharger',[encKey, id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('Fichier chiffré téléchargé — gardez-le en lieu sûr. Il est illisible sans la clé du serveur.', 'bon');
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  // ── Restaurer (confirmation écrite) ──────────────────────────────
  function ouvrirRestaurer(encKey, id){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('↩ Restaurer la base de données',
      '<div class="garde jaune"><span class="ic">⚠</span> Cette opération <b>réécrit</b> les données actuelles de Turso avec le contenu de la sauvegarde <b>'+esc(id)+'</b>. Les enregistrements portant le même identifiant seront écrasés. Elle ne supprime pas ce qui a été créé après la sauvegarde.</div>'
      + '<label class="champ"><span class="lbl">Pour confirmer, tapez RESTAURER</span>'
      + '<input class="t" id="s-conf" autocomplete="off" placeholder="RESTAURER"></label>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Restaurer maintenant</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=function(){ restaurer(encKey); };
    var c=document.getElementById('s-conf'); if (c) c.oninput=function(){ c.classList.remove('manque'); };
  }
  function restaurer(encKey){
    if (OCCUPE) return;
    var c=document.getElementById('s-conf');
    if (!c || c.value.trim().toUpperCase() !== 'RESTAURER'){
      if (c) c.classList.add('manque');
      dire('Tapez RESTAURER pour confirmer.', 'att'); return;
    }
    OCCUPE=true;
    /* ⚠ MEME VERROU QUE LA SAUVEGARDE, ET ICI IL COMPTE ENCORE PLUS : une
       restauration REECRIT la base. La fenetre ecrivait << ne fermez pas cette
       fenetre >> en laissant << Fermer >> et << Annuler >> cliquables — une
       consigne a la place d un garde, sur l operation la plus destructrice de
       tout l ecran. Sa demande du 2026-09-09 portait sur la sauvegarde ; laisser
       la restauration en arriere aurait ete garder le defaut a l endroit ou il
       coute le plus cher. */
    verrouSur(true);
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='Restauration…'; }
    dire('Restauration en cours…');
    appeler('sauvegarde:restaurer',[encKey]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerSur();
        // ⚠ ON FIGE L'ÉCRAN. La fenêtre principale se recharge pour relire une
        // base qui vient de changer sous elle ; pendant ces quelques secondes le
        // pont ne répond pas. Laisser les boutons vivants inviterait à cliquer
        // dans le vide et à conclure que la restauration a échoué.
        FIGE = true;
        corps.innerHTML = '<div class="carte"><div class="vide"><span class="ic">✅</span> Restauration terminée — <b>'+(r.total||0)+'</b> enregistrements rétablis.<br><br>La fenêtre principale se recharge pour relire la base. Patientez quelques secondes, puis cliquez « ↻ Actualiser ».<br><br><button class="b" id="s-reprendre">↻ Actualiser</button></div></div>';
        var rb=document.getElementById('s-reprendre');
        if (rb) rb.onclick=function(){ FIGE=false; recharger('Liste actualisée.', 'bon'); };
        dire('Restauration terminée ('+(r.total||0)+' enregistrements).', 'bon');
      } else {
        // ⚠ On rend les sorties : sinon la surcouche reste incondamnable sur un
        // echec, et cette fenetre n a pas de touche Echap pour s en sortir.
        verrouSur(false);
        if (go){ go.disabled=false; go.textContent='Restaurer maintenant'; }
        dire('Échec : '+expliquer(r), 'err');
      }
    });
  }

  // ── Supprimer (confirmation écrite) ──────────────────────────────
  function ouvrirSupprimer(encKey, id){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('Supprimer la sauvegarde',
      '<div class="garde rouge"><span class="ic">⚠</span> Cette action supprime <b>définitivement</b> la sauvegarde <b>'+esc(id)+'</b> de Cloudflare R2. Elle sera <b>irrécupérable</b>.</div>'
      + '<label class="champ"><span class="lbl">Pour confirmer, tapez DÉTRUIRE</span>'
      + '<input class="t" id="s-conf" autocomplete="off" placeholder="DÉTRUIRE"></label>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Supprimer définitivement</button>');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=function(){ supprimer(encKey); };
    var c=document.getElementById('s-conf'); if (c) c.oninput=function(){ c.classList.remove('manque'); };
  }
  function supprimer(encKey){
    if (OCCUPE) return;
    var c=document.getElementById('s-conf');
    // On accepte la saisie sans accent : refuser DETRUIRE parce qu'il manque un
    // accent serait un piège, pas un garde-fou.
    var v = c ? c.value.trim().toUpperCase() : '';
    if (v !== 'DÉTRUIRE' && v !== 'DETRUIRE'){
      if (c) c.classList.add('manque');
      dire('Tapez DÉTRUIRE pour confirmer.', 'att'); return;
    }
    OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Suppression…'; }
    appeler('sauvegarde:supprimer',[encKey]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerSur(); D=r; RO=!r.peutEcrire; vueListe(); dire('Sauvegarde supprimée.', 'bon'); }
      else { if (go){ go.disabled=false; go.textContent='Supprimer définitivement'; } dire('Échec : '+expliquer(r), 'err'); }
    });
  }

  // ── Purge (rétention) ────────────────────────────────────────────
  function ouvrirPurge(){
    if (!D.peutEcrire) { dire(MOTIFS.droit, 'err'); return; }
    ouvrirSur('Purger les vieilles sauvegardes',
      '<div class="garde rouge"><span class="ic">⚠</span> Toutes les sauvegardes de plus de <b>'+(D.retentionMois||12)+' mois</b> sont détruites de Cloudflare R2. <b>Irréversible.</b></div>'
      + '<p class="quoi" style="margin:0">Les sauvegardes plus récentes ne sont pas touchées.</p>',
      '<button class="b" id="s-annuler">Annuler</button><button class="b dgr" id="s-go">Purger</button>', '520px');
    document.getElementById('s-annuler').onclick=fermerSur;
    document.getElementById('s-go').onclick=purger;
  }
  function purger(){
    if (OCCUPE) return; OCCUPE=true;
    var go=document.getElementById('s-go'); if (go){ go.disabled=true; go.textContent='⏳ Purge…'; }
    appeler('sauvegarde:purger',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerSur(); D=r; RO=!r.peutEcrire; vueListe();
        dire(r.retirees ? (r.retirees+' sauvegarde(s) supprimée(s).') : 'Aucune sauvegarde à purger.', 'bon'); }
      else { if (go){ go.disabled=false; go.textContent='Purger'; } dire('Échec : '+expliquer(r), 'err'); }
    });
  }

  function recharger(msg, cl){
    if (OCCUPE) return; OCCUPE=true; dire('Lecture…');
    appeler('sauvegarde:donnees',[]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ D=r; RO=!r.peutEcrire; rendre(); if (msg) dire(msg, cl); }
      else dire('Échec : '+expliquer(r), 'err'); });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    if (!FIGE) vueListe();
  }

  function charger(){
    dire('Chargement…');
    appeler('sauvegarde:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutEcrire; rendre(); dire('');
      if (CREER){ CREER=''; ouvrirCreer(); }
      else if (REST){ var e=REST; REST=''; ouvrirRestaurer(e, e); }
      else if (SUPP){ var s=SUPP; SUPP=''; ouvrirSupprimer(s, s); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageSauvegarde };
