/* ══════════════════════════════════════════
   CALENDRIER SOCIAL — PRO POLICE
   Lit calendrier.json — éditable sans code
══════════════════════════════════════════ */

(function() {
  const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
  const STATUT_LABEL = {
    ouvert: '🟢 Ouvert',
    en_cours: '🔵 En cours',
    a_venir: '⚪ À venir',
    clos: '🔴 Clôturé'
  };

  let allEvents = [];
  let categories = {};
  let filtreActif = 'all';

  /* ── Chargement du JSON ── */
  function loadCalendrier() {
    fetch('calendrier.json?v=' + Date.now())
      .then(r => r.json())
      .then(data => {
        allEvents = data.evenements.sort((a,b) => new Date(a.date) - new Date(b.date));
        categories = data.categories || {};
        document.getElementById('calSourceMention').textContent =
          '📡 Dernière mise à jour : ' + formatDate(data.lastUpdate) + ' — ' + data.source;
        renderCalendrier();
        bindFiltres();
      })
      .catch(() => {
        document.getElementById('calTimeline').innerHTML =
          '<div class="calVide">⚠️ Impossible de charger le calendrier. Vérifiez que calendrier.json est présent.</div>';
      });
  }

  /* ── Rendu timeline ── */
  function renderCalendrier() {
    const timeline = document.getElementById('calTimeline');
    const today = new Date();
    today.setHours(0,0,0,0);

    const filtered = filtreActif === 'all'
      ? allEvents
      : allEvents.filter(e => e.categorie === filtreActif);

    // Masquer les événements passés depuis plus de 30 jours
    const visible = filtered.filter(e => {
      const d = new Date(e.date);
      const diff = (d - today) / (1000*60*60*24);
      return diff > -30;
    });

    if (visible.length === 0) {
      timeline.innerHTML = '<div class="calVide">Aucune échéance dans cette catégorie pour le moment.</div>';
      return;
    }

    timeline.innerHTML = visible.map((ev, i) => {
      const d = new Date(ev.date);
      const diff = Math.round((d - today) / (1000*60*60*24));
      const cat = categories[ev.categorie] || { emoji: '📌', couleur: '#3b82f6' };

      let countdown = '';
      let countClass = '';
      if (diff < 0) {
        countdown = 'Il y a ' + Math.abs(diff) + 'j';
        countClass = 'clos';
      } else if (diff === 0) {
        countdown = "Aujourd'hui !";
        countClass = 'urgent';
      } else if (diff <= 7) {
        countdown = 'Dans ' + diff + ' jour' + (diff > 1 ? 's' : '');
        countClass = 'urgent';
      } else if (diff <= 30) {
        countdown = 'Dans ' + diff + ' jours';
        countClass = 'soon';
      } else {
        countdown = 'Dans ' + diff + ' jours';
      }

      const corps = (ev.corps || []).map(c =>
        `<span class="calTag calTagCorps">${c}</span>`
      ).join('');

      const lien = ev.lien
        ? `<a href="${ev.lien}" target="_blank" style="font-size:11px;color:var(--accent2);margin-left:8px;text-decoration:none;">→ Voir</a>`
        : '';

      return `
        <div class="calEvent" data-statut="${ev.statut}" data-cat="${ev.categorie}"
             style="animation-delay:${i * 0.06}s; border-left: 3px solid ${cat.couleur};">
          <div class="calDate">
            <div class="calJour">${d.getDate()}</div>
            <div class="calMois">${MOIS[d.getMonth()]}</div>
            <div class="calAnnee">${d.getFullYear()}</div>
          </div>
          <div class="calSep"></div>
          <div class="calBody">
            <div class="calTitre">${cat.emoji} ${ev.titre}</div>
            <div class="calDesc">${ev.description}</div>
            <div class="calMeta">
              <span class="calBadgeStatut ${ev.statut}">${STATUT_LABEL[ev.statut] || ev.statut}</span>
              ${corps}
              ${lien}
              <span class="calCountdown ${countClass}">${countdown}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── Filtres ── */
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

  /* ── Utilitaires ── */
  function formatDate(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCalendrier);
  } else {
    loadCalendrier();
  }
})();
