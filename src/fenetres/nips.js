'use strict';

/*
 * FENÊTRE « NIP » — CONFIGURATION › SÉCURITÉ › NIP (2026-10-19, sa demande)
 * =============================================================================
 * Ses mots : « une section dédiée NIP dans la Configuration, réservée au super
 * administrateur, où je configure TOUS mes NIP au même endroit ».
 *
 * Ce qu elle porte, une carte par NIP :
 *   1. Prix modifiés et rabais (caisse)        — caisse_nip, rang 1 ;
 *   2. Retrait d une photo d un article         — caisse_nip, rang 2 (nouveau) ;
 *   3. Exemption des frais (remboursements)     — sq_fee_pin_h ;
 *   4. Modèles de l Atelier                      — un NIP PAR MODÈLE (empreinte
 *      dans le modèle) : le compte des modèles protégés, et le lien vers l Atelier
 *      où chaque modèle se protège ou se libère ;
 *   5. NIP d urgence du mode usage exclusif      — posé À L ACTIVATION du mode :
 *      son état, et le lien vers la fenêtre du mode.
 * Pour 1 à 3 : l état (posé / non posé — JAMAIS la valeur), « Définir » ou
 * « Changer » (nouveau NIP + confirmation), « Retirer » (avec confirmation).
 *
 * ⚠ AUCUN NOUVEAU RANGEMENT : les NIP déjà posés restent valides sans ressaisie.
 * ⚠ SUPER-ADMINISTRATEUR SEULEMENT — vérifié dans le cœur (pont.js, nip:*) ET au
 *   serveur (nip_etat / nip_ecrire : require_superadmin). Cette fenêtre ne fait
 *   que dire le refus.
 * ⚠ La fenêtre ne voit jamais un NIP : ce qu on tape part au serveur, qui n en
 *   garde que l empreinte (et, pour la caisse et les photos, une copie chiffrée).
 * ⚠ ANCRABLE, section hôte « nips » côté site (_DOCKABLES dans admin.js).
 *
 * ⚠ AUCUN CARACTÈRE accent grave dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE } = require('./socle.js');
const T = require('../langue').tr('nips');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete h1{margin:0;font:700 1.05rem/1.2 Georgia,serif}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.intro{font-size:.82rem;color:var(--tx2);margin:0 0 1rem;line-height:1.55;max-width:60rem}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(19rem,1fr));gap:1rem}
.carte{background:var(--v03);border:1px solid var(--v08);border-radius:12px;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.55rem}
.carte h3{margin:0;font:700 .98rem/1.3 Georgia,serif}
.carte p{margin:0;font-size:.8rem;line-height:1.55;color:var(--tx2)}
.etat{display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;font-weight:700;padding:.18rem .6rem;border-radius:99px;align-self:flex-start}
/* Jetons du theme seulement (jour comme nuit) : un fond a peine teinte de la couleur du texte, qui garde 4,5:1. */
.etat.oui{background:color-mix(in srgb,var(--tx-ok) 8%,transparent);color:color-mix(in srgb,var(--tx-ok) 78%,var(--tx))}
.etat.non{background:color-mix(in srgb,var(--tx-att) 8%,transparent);color:var(--tx-att)}
.aide{font-size:.75rem;color:var(--tx-gris)}
.gestes{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:auto;padding-top:.35rem}
.prim{font:inherit;font-size:.82rem;font-weight:700;border:0;border-radius:8px;padding:.45rem .9rem;background:var(--or);color:#1a1408;cursor:pointer}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover{background:var(--v09)}
.b.danger{color:var(--tx-err)}
.prim:disabled,.b:disabled{opacity:.5;cursor:default}
.refus{padding:2rem 1rem;text-align:center;color:var(--tx2);font-size:.88rem}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageNips() {
  return `${TETE()}
<title>${T("NIP — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.securite}</span><h1>${T("NIP")}</h1></div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var D = null, OCCUPE = false;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    superadmin_requis:'${T("Réservé au super-administrateur.")}',
    role_perime:'${T("Votre rôle a changé : reconnectez-vous.")}',
    nip_invalide:'${T("Le NIP doit compter uniquement des chiffres, dans la longueur permise.")}',
    nip_inconnu:'${T("NIP inconnu.")}',
    reseau:'${T("Le serveur n’a pas répondu.")}',
    indisponible:'${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:'${T("La fenêtre principale ne répond pas.")}',
    delai:'${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:'${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m=r&&r.motif; return MOTIFS[m]||('${T("Erreur inattendue (")}'+esc(m||'?')+').'); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec'}; });
  }
  function quand(iso){ if (!iso) return ''; try { return (typeof szQuand === 'function') ? szQuand(iso) : String(iso).slice(0, 10); } catch (e) { return String(iso).slice(0, 10); } }

  /* Les trois NIP qui se reglent ici. ⚠ La cle (caisse, photos, frais) est celle que le serveur attend. */
  var NIPS = [
    { cle: 'caisse', titre: '${T("Prix modifiés et rabais (caisse)")}',
      texte: '${T("Demandé à la caisse pour modifier un prix ou accorder un rabais. Les super-administrateurs en sont dispensés.")}',
      sans: '${T("Aucun NIP : prix modifiés et rabais sont refusés à la caisse (sauf aux super-administrateurs).")}' },
    { cle: 'photos', titre: '${T("Retrait d’une photo d’un article")}',
      texte: '${T("Demandé pour retirer une photo d’un article : la détacher de la fiche, ou supprimer de la photothèque une photo attachée à un produit. Les super-administrateurs en sont dispensés ; le remplacement automatique d’un rendu 3D ne le demande pas.")}',
      sans: '${T("Aucun NIP : seuls les super-administrateurs peuvent retirer une photo d’un article.")}' },
    { cle: 'frais', titre: '${T("Exemption des frais (remboursements)")}',
      texte: '${T("Demandé pour renoncer aux frais d’un remboursement, ou pour vendre sous le coût d’acquisition.")}',
      sans: '${T("Aucun code : l’exemption est libre.")}' }
  ];

  function carteNip(n){
    var e = (D && D[n.cle]) || {};
    var h = '<div class="carte" data-nip="' + n.cle + '"><h3>' + n.titre + '</h3><p>' + n.texte + '</p>';
    if (e.defini) {
      h += '<span class="etat oui">✓ ${T("Posé")}</span>';
      var qui = (e.pose ? quand(e.pose) : '') + (e.par ? ' — ' + esc(e.par) : '');
      if (qui) h += '<span class="aide">${T("Défini")} ' + qui + '</span>';
      if (e.bloqueMinutes > 0) h += '<span class="aide" style="color:var(--tx-jaune)">${T("Trop d’essais faux — bloqué encore (minutes) :")} ' + e.bloqueMinutes + '</span>';
    } else {
      h += '<span class="etat non">${T("Non posé")}</span><span class="aide">' + n.sans + '</span>';
    }
    h += '<div class="gestes"><button type="button" class="prim" data-definir="' + n.cle + '">' + (e.defini ? '${T("Changer")}' : '${T("Définir")}') + '</button>'
      + (e.defini ? '<button type="button" class="b danger" data-retirer="' + n.cle + '">${T("Retirer")}</button>' : '') + '</div></div>';
    return h;
  }

  function dessiner(){
    var a = (D && D.atelier) || {}, u = (D && D.urgence) || {};
    var h = '<p class="intro">${T("Tous les NIP de l’entreprise, au même endroit. Un NIP ne s’affiche jamais : on le pose, on le change ou on le retire. Le serveur n’en garde que l’empreinte, et cinq essais faux le bloquent pour un moment.")}</p>'
      + '<div class="grille">' + NIPS.map(carteNip).join('')
      + '<div class="carte"><h3>${T("Modèles de l’Atelier")}</h3>'
      + '<p>${T("Chaque modèle de l’Atelier peut avoir son propre NIP, posé ou retiré dans la fiche du modèle. Le super-administrateur peut y retirer un NIP oublié.")}</p>'
      + '<span class="etat ' + (a.proteges ? 'oui' : 'non') + '">' + a.proteges + ' / ' + a.modeles + ' ${T("modèles protégés")}</span>'
      + '<div class="gestes"><button type="button" class="b" data-ouvrir="atelier">${T("Ouvrir l’Atelier")}</button></div></div>'
      + '<div class="carte"><h3>${T("NIP d’urgence du mode usage exclusif")}</h3>'
      + '<p>${T("Posé à chaque activation du mode usage exclusif ; il le lève depuis l’écran de connexion. Il n’existe que pendant le mode.")}</p>'
      + '<span class="etat ' + (u.actif ? 'oui' : 'non') + '">' + (u.actif ? '${T("Mode actif — NIP posé")}' : '${T("Mode inactif")}') + '</span>'
      + '<div class="gestes"><button type="button" class="b" data-ouvrir="maintenance">${T("Ouvrir le mode usage exclusif")}</button></div></div>'
      + '</div>';
    corps.innerHTML = h;
  }

  /* La saisie d un NOUVEAU NIP : deux champs (le NIP, sa confirmation), la boite commune du socle. */
  function demanderNouveau(n, min, max){
    return new Promise(function(fin){
      var v = document.createElement('div'); v.className = 'szc-voile';
      v.innerHTML = '<div class="szc-boite" role="dialog" aria-modal="true" aria-labelledby="nn-t"><h3 id="nn-t">' + n.titre + '</h3>'
        + '<p>${T("Un NIP de")} ' + min + ' ${T("à")} ' + max + ' ${T("chiffres. Notez-le : il ne s’affiche plus ensuite.")}</p>'
        + '<label class="szc-nip"><span>${T("Nouveau NIP")}</span><input type="password" inputmode="numeric" autocomplete="off" maxlength="' + max + '" data-n="1"></label>'
        + '<label class="szc-nip"><span>${T("Confirmer le NIP")}</span><input type="password" inputmode="numeric" autocomplete="off" maxlength="' + max + '" data-n="2"></label>'
        + '<div class="szc-nip-err" role="alert"></div>'
        + '<div class="szc-pied"><button type="button" class="szc-non">${T("Annuler")}</button><button type="button" class="szc-oui">${T("Enregistrer le NIP")}</button></div></div>';
      document.body.appendChild(v);
      var c1 = v.querySelector('[data-n="1"]'), c2 = v.querySelector('[data-n="2"]'), err = v.querySelector('.szc-nip-err');
      [c1, c2].forEach(function(c){ c.oninput = function(){ var d = this.value.replace(/[^0-9]/g, '').slice(0, max); if (d !== this.value) this.value = d; }; });
      var fini = function(r){ if (v.parentNode) v.parentNode.removeChild(v); document.removeEventListener('keydown', clavier, true); fin(r); };
      var valider = function(){
        var a = c1.value, b = c2.value;
        if (!/^[0-9]+$/.test(a) || a.length < min || a.length > max) { err.textContent = '${T("Un NIP de")} ' + min + ' ${T("à")} ' + max + ' ${T("chiffres.")}'; c1.focus(); return; }
        if (a !== b) { err.textContent = '${T("Les deux NIP ne concordent pas.")}'; c2.focus(); return; }
        fini(a);
      };
      var clavier = function(ev){
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fini(null); }
        else if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); valider(); }
      };
      document.addEventListener('keydown', clavier, true);
      v.addEventListener('mousedown', function(ev){ if (ev.target === v) fini(null); });
      v.querySelector('.szc-non').onclick = function(){ fini(null); };
      v.querySelector('.szc-oui').onclick = valider;
      try { c1.focus(); } catch (e) {}
    });
  }
  function nipDe(cle){ for (var i = 0; i < NIPS.length; i++) if (NIPS[i].cle === cle) return NIPS[i]; return null; }

  corps.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!t || OCCUPE) return;
    var cle;
    if ((cle = t.getAttribute('data-ouvrir'))) { if (P && P.ouvrirModule) P.ouvrirModule(cle); return; }
    if ((cle = t.getAttribute('data-definir'))) {
      var n = nipDe(cle), e = (D && D[cle]) || {};
      if (!n) return;
      demanderNouveau(n, e.min || 4, e.max || 8).then(function(nip){
        if (!nip) return;
        OCCUPE = true; dire('${T("Enregistrement…")}');
        appeler('nip:ecrire', [cle, nip]).then(function(r){
          OCCUPE = false;
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          D = r; dessiner(); dire('${T("NIP enregistré.")}', 'bon');
        });
      });
      return;
    }
    if ((cle = t.getAttribute('data-retirer'))) {
      var n2 = nipDe(cle); if (!n2) return;
      szConfirmer({ danger: true, titre: '${T("Retirer le NIP")}', texte: n2.titre + ' — ' + n2.sans, oui: '${T("Retirer le NIP")}' }).then(function(ok){
        if (!ok) return;
        OCCUPE = true; dire('${T("Enregistrement…")}');
        appeler('nip:retirer', [cle]).then(function(r){
          OCCUPE = false;
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          D = r; dessiner(); dire('${T("NIP retiré.")}', 'bon');
        });
      });
    }
  });

  function charger(){
    appeler('nip:etat').then(function(r){
      if (!r.ok) {
        corps.innerHTML = '<div class="refus">' + esc(expliquer(r)) + '</div>';
        return;
      }
      D = r; dessiner();
    });
  }
  window.szRevenir = charger;
  charger();
})();
</script></body></html>`;
}

module.exports = { pageNips };
