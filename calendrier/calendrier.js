// ============================================================
//  PRO POLICE — calendrier.js
//  Widget Calendrier Social — standalone
//  Lit : calendrier.json (même dossier racine)
//  Mis à jour : 26 mai 2026
//  Usage : <script src="calendrier.js"></script>
//          après le DOM calendrier dans index.html
// ============================================================

/* ══════════════════════════════════════════════════════════════
   CALENDRIER SOCIAL — PRO POLICE
   Lit calendrier.json — éditable sans toucher au code
   Deux onglets : "Agenda en cours & à venir" / "Archivés"
   Filtres par catégorie disponibles sur les deux onglets
══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
  const STATUT_LABEL = {
    ouvert:   '🟢 Ouvert',
    en_cours: '🔵 En cours',
    a_venir:  '⚪ À venir',
    clos:     '🔴 Clôturé'
  };

  let allEvents  = [];
  let categories = {};
  let filtreActif = 'all';
  let ongletActif = 'actif'; // 'actif' | 'clos'

   const isAdherent =
  localStorage.getItem("propolice_adherent") === "true";

  /* ──────────────────────────────────────────
     CHARGEMENT JSON
  ────────────────────────────────────────── */
  function loadCalendrier() {
    fetch('calendrier.json?v=' + Date.now())
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        allEvents  = data.evenements || [];
        categories = data.categories || {};
        const src = document.getElementById('calSourceMention');
        if (src) src.textContent =
          '📡 Dernière mise à jour : ' + formatDate(data.lastUpdate) + ' — ' + data.source;
        renderCalendrier();
        bindOnglets();
        bindFiltres();
      })
      .catch(err => {
        console.error('Calendrier :', err);
        const tl = document.getElementById('calTimeline');
        if (tl) tl.innerHTML =
          '<div class="calVide">⚠️ Impossible de charger le calendrier. Vérifiez que calendrier.json est présent à la racine du site.</div>';
      });
  }

  /* ──────────────────────────────────────────
     RENDU TIMELINE
  ────────────────────────────────────────── */
  function renderCalendrier() {
    const timeline = document.getElementById('calTimeline');
    if (!timeline) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Filtrer par catégorie
    const filtered = filtreActif === 'all'
      ? allEvents
      : allEvents.filter(e => e.categorie === filtreActif);

    // Séparer actifs et clôturés
    const actifs = filtered
      .filter(e => {
        const d = new Date(e.date);
        return d >= today || e.statut === 'en_cours';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const clos = filtered
      .filter(e => {
        const d = new Date(e.date);
        return d < today && e.statut !== 'en_cours';
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // plus récent en premier

    // Mettre à jour le compteur badge onglet clôturés
    const countEl = document.getElementById('countClos');
    if (countEl) countEl.textContent = clos.length > 0 ? clos.length : '';

    // Choisir le groupe à afficher
    let visible = ongletActif === 'actif'
      ? actifs
      : clos;

if (!isAdherent) {
  visible = visible.slice(0, 5);
}

    if (visible.length === 0) {
      const msg = ongletActif === 'actif'
        ? '✅ Aucune échéance à venir dans cette catégorie.'
        : '📭 Aucun événement archivé dans cette catégorie pour ' + currentYear + '.';
      timeline.innerHTML = '<div class="calVide">' + msg + '</div>';
      return;
    }

    // Titre groupe
    const groupTitle = ongletActif === 'actif'
      ? '<div class="calGroupTitle">📅 Prochaines échéances (' + actifs.length + ')</div>'
      : '<div class="calGroupTitle calGroupPast">🗂️ Archivés ' + currentYear + ' (' + clos.length + ')</div>';

    const isPast = (ongletActif === 'clos');
   timeline.innerHTML =
  groupTitle +
  visible.map((ev, i) => buildCard(ev, i, isPast)).join('');
     if (!isAdherent && filtered.length > 5) {

  timeline.innerHTML += `
    <div class="card" style="margin-top:20px;text-align:center;">

      <h3>🔒 Contenu réservé aux adhérents</h3>

      <p>
        ${filtered.length - 5}
        événement(s) supplémentaire(s)
        sont accessibles aux adhérents PRO POLICE.
      </p>

      <a class="btn primary" href="adherer.html">
        🤝 Adhérer à PRO POLICE
      </a>

    </div>
  `;

}
  }

  /* ──────────────────────────────────────────
     CONSTRUCTION D'UNE CARTE ÉVÉNEMENT
  ────────────────────────────────────────── */
  function buildCard(ev, i, isPast) {
    const d    = new Date(ev.date);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff  = Math.round((d - today) / (1000 * 60 * 60 * 24));
    const cat   = categories[ev.categorie] || { emoji: '📌', couleur: '#3b82f6' };

    // Countdown
    let countdown = '', countClass = '';
    if (diff < 0) {
      const j = Math.abs(diff);
      countdown  = j < 30 ? 'Il y a ' + j + 'j' : 'Il y a ' + Math.round(j / 30) + ' mois';
      countClass = 'clos';
    } else if (diff === 0) {
      countdown  = "Aujourd'hui !";
      countClass = 'urgent';
    } else if (diff <= 7) {
      countdown  = 'Dans ' + diff + ' jour' + (diff > 1 ? 's' : '');
      countClass = 'urgent';
    } else if (diff <= 30) {
      countdown  = 'Dans ' + diff + ' jours';
      countClass = 'soon';
    } else {
      countdown  = 'Dans ' + diff + ' jours';
    }

    // Tags corps
    const corps = (ev.corps || [])
      .map(c => '<span class="calTag calTagCorps">' + c + '</span>')
      .join('');

    // Lien optionnel
    const lien = ev.lien
      ? '<a href="' + ev.lien + '" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent2);margin-left:8px;text-decoration:none;">→ Voir</a>'
      : '';

    const pastStyle = isPast ? 'opacity:.6;' : '';

    return (
      '<div class="calEvent" data-statut="' + ev.statut + '" data-cat="' + ev.categorie + '"' +
      ' style="animation-delay:' + (i * 0.05) + 's;border-left:3px solid ' + cat.couleur + ';' + pastStyle + '">' +
        '<div class="calDate">' +
          '<div class="calJour">'  + d.getDate()             + '</div>' +
          '<div class="calMois">'  + MOIS[d.getMonth()]      + '</div>' +
          '<div class="calAnnee">' + d.getFullYear()          + '</div>' +
        '</div>' +
        '<div class="calSep"></div>' +
        '<div class="calBody">' +
          '<div class="calTitre">' + cat.emoji + ' ' + ev.titre + '</div>' +
          '<div class="calDesc">'  + ev.description            + '</div>' +
          '<div class="calMeta">' +
            '<span class="calBadgeStatut ' + ev.statut + '">' + (STATUT_LABEL[ev.statut] || ev.statut) + '</span>' +
            corps + lien +
            '<span class="calCountdown ' + countClass + '">' + countdown + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ──────────────────────────────────────────
     BINDING ONGLETS (actif / clos)
  ────────────────────────────────────────── */
  function bindOnglets() {
    document.querySelectorAll('.calOngletBtn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.calOngletBtn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        ongletActif = this.dataset.onglet; // 'actif' ou 'clos'
        renderCalendrier();
      });
    });
  }

  /* ──────────────────────────────────────────
     BINDING FILTRES CATÉGORIES
  ────────────────────────────────────────── */
  function bindFiltres() {
    document.querySelectorAll('.calFiltreBtn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.calFiltreBtn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filtreActif = this.dataset.cat;
        renderCalendrier();
      });
    });
  }

  /* ──────────────────────────────────────────
     UTILITAIRES
  ────────────────────────────────────────── */
  function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ──────────────────────────────────────────
     INIT
  ────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCalendrier);
  } else {
    loadCalendrier();
  }

})();
