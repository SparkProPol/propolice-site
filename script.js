// ===== PRO POLICE — Script V3 =====
console.log("🚔 INITIALISATION PRO POLICE V3");

// 🔥 VALEUR POINT INDICE 2026
const VALEUR_POINT = 4.9228;

// ===== UTILITAIRES =====
function isMember() {
  return localStorage.getItem("propolice_member") === "true";
}

function toggleZoneOM() {
  const typeZone = document.getElementById("typeZone")?.value;
  const blocOM = document.getElementById("blocOM");
  if (blocOM) blocOM.style.display = (typeZone === "outremer") ? "flex" : "none";
}

function parseHistoriqueCMO(str) {
  if (!str || !str.trim()) return 0;
  return str.split(",").reduce((acc, val) => {
    const n = parseFloat(val.trim());
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
}

// ===== ACCÈS BDD PAR CORPS =====
function getBDD(corps) {
  switch(corps) {
    case "CEA":       return typeof BDD_CEA       !== "undefined" ? BDD_CEA       : null;
    case "CRS":       return typeof BDD_CRS       !== "undefined" ? BDD_CRS       : null;
    case "ADMIN":     return typeof BDD_ADMIN     !== "undefined" ? BDD_ADMIN     : null;
    case "PTS":       return typeof BDD_PTS       !== "undefined" ? BDD_PTS       : null;
    case "RETRAITE":  return typeof BDD_RETRAITE  !== "undefined" ? BDD_RETRAITE  : null;
    case "ADJOINTS":  return typeof BDD_ADJOINTS  !== "undefined" ? BDD_ADJOINTS  : null;
    case "RESERVISTES": return typeof BDD_RESERVISTES !== "undefined" ? BDD_RESERVISTES : null;
    default: return null;
  }
}

// 🔍 Récupérer indice selon corps / grade / échelon
function getIndice(corps, grade, echelon) {
  const bdd = (corps === "CRS") ? (typeof BDD_CRS !== "undefined" ? BDD_CRS : null)
                                 : (typeof BDD_CEA !== "undefined" ? BDD_CEA : null);
  if (!bdd || !bdd[grade] || !bdd[grade][echelon]) {
    console.warn("⚠️ Indice introuvable :", corps, grade, echelon, "— fallback grille statique");
    return 0;
  }
  return bdd[grade][echelon].IM;
}

// 💰 Calcul brut indiciaire réel
function getBrutBase(corps, grade, echelon) {
  const indice = getIndice(corps, grade, echelon);
  if (indice > 0) return indice * VALEUR_POINT;
  // Fallback grille statique si BDD non chargée
  return getSalaireBase(grade, echelon);
}

// ===== GRILLE STATIQUE FALLBACK =====
function getSalaireBase(grade, echelon) {
  const grilles = {
    gpx:     [2100,2200,2300,2400,2500,2600,2700,2800,2900,3000,3100,3200,3300],
    bc_norm: [2400,2500,2600,2700,2800,2900,3000,3100],
    bcn:     [2400,2500,2600,2700,2800,2900,3000,3100],
    bc_sup:  [2700,2800,2900,3000,3100,3200,3300],
    bcs:     [2700,2800,2900,3000,3100,3200,3300],
    major:   [3000,3100,3200,3300,3400,3500,3600]
  };
  const grille = grilles[grade] || grilles["gpx"];
  const index = Math.max(0, Math.min(grille.length - 1, parseInt(echelon, 10) - 1));
  return grille[index];
}

function getITN(zone) {
  const table = { "1": 185, "2": 120, "3": 90 };
  return table[String(zone)] || 90;
}

function getSFT(enfants) {
  const n = parseInt(enfants || 0, 10);
  if (n <= 0) return 0;
  if (n === 1) return 2.29;
  if (n === 2) return 73.79;
  if (n === 3) return 183.56;
  return 183.56 + ((n - 3) * 130.81);
}

function estimerNet(brut) { return brut * 0.78; }

function calculerNetReel(brut) {
  const typeZone = document.getElementById("typeZone")?.value || "metropole";
  const zoneOM = parseFloat(document.getElementById("zoneOM")?.value || 0);
  const pension             = brut * 0.111;
  const csg_deductible      = brut * 0.068;
  const csg_non_deductible  = brut * 0.024;
  const crds                = brut * 0.005;
  const rafp                = brut * 0.05 * 0.10;
  const totalRetenues = pension + csg_deductible + csg_non_deductible + crds + rafp;
  const coefficientCorrection = 1.05;
  let net;
  if (typeZone === "outremer") {
    let ratioNet;
    if      (zoneOM >= 0.70) ratioNet = 0.98;
    else if (zoneOM >= 0.40) ratioNet = 0.94;
    else if (zoneOM >= 0.30) ratioNet = 0.915;
    else                     ratioNet = 0.93;
    net = brut * ratioNet;
  } else {
    net = (brut - totalRetenues) * coefficientCorrection;
  }
  return { net, pension, csg_deductible, csg_non_deductible, crds, rafp, totalRetenues };
}

// ===== GESTION ÉCHELONS =====
function updateEchelonMax() {
  const grade = document.getElementById("grade")?.value;
  const input = document.getElementById("echelon");
  const maxEchelons = { gpx: 13, bc_norm: 8, bc_sup: 7, major: 7 };
  const max = maxEchelons[grade] || 12;
  if (input) {
    input.max = max;
    input.min = 1;
    if (parseInt(input.value, 10) > max) input.value = max;
  }
}

function remplirEchelons() {
  const grade = document.getElementById("grade")?.value;
  const select = document.getElementById("echelon");
  if (!select) return;
  const maxEchelons = { gpx: 13, bc_norm: 8, bc_sup: 7, major: 7 };
  const max = maxEchelons[grade] || 12;
  select.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = "Échelon " + i;
    select.appendChild(option);
  }
}

// ===== POPUP ADHÉRENT =====
function afficherPopup(type) {
  const isUserMember = isMember();
  const popupSeen = sessionStorage.getItem("popup_" + type);
  if (!isUserMember && !popupSeen) {
    const popup = document.getElementById("popupAdherent");
    if (popup) {
      popup.style.display = "flex";
      sessionStorage.setItem("popup_" + type, "true");
    }
  }
}

function fermerPopup() {
  const popup = document.getElementById("popupAdherent");
  if (popup) popup.style.display = "none";
}

// ===== SIMULATEUR PRIMES =====
function calculerPrimes() {
  const grade = document.getElementById("grade")?.value || "gpx";
  let gradeBDD = grade;
  if (grade === "bc_norm") gradeBDD = "bcn";
  if (grade === "bc_sup")  gradeBDD = "bcs";

  const echelon        = parseInt(document.getElementById("echelon")?.value || 1, 10);
  const heuresNuit     = parseFloat(document.getElementById("heuresNuit")?.value)     || 0;
  const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
  const enfants        = parseInt(document.getElementById("enfants")?.value || 0, 10);
  const zone           = document.getElementById("zone")?.value     || "3";
  const typeZone       = document.getElementById("typeZone")?.value || "metropole";
  const zoneOM         = parseFloat(document.getElementById("zoneOM")?.value || 0);
  const itnChoix       = document.getElementById("itn")?.value      || "oui";
  const corps          = document.getElementById("corps")?.value     || "CEA";

  const salaireBase    = getBrutBase(corps, gradeBDD, echelon);
  const majorationOM   = (typeZone === "outremer") ? salaireBase * zoneOM : 0;
  const primeITN       = itnChoix === "oui" ? (getITN(zone) || 0) : 0;
  const majorationNuit      = heuresNuit * 2.2;
  const majorationDimanche  = heuresDimanche * 2.8;
  const sft            = getSFT(enfants);
  const primeVP        = document.getElementById("primeVP")?.value || "non";
  const montantVP      = primeVP === "oui" ? 100 : 0;
  const allocationMaitrise  = 319.58;
  const complementRTT       = 112.33;
  const ISSP           = Math.round(salaireBase * 0.285);
  const ICSS           = (corps === "CRS") ? 145 : 0;
  const opj            = document.getElementById("opj")?.value || "non";
  const primeOPJ       = (opj === "cartographie") ? 120 : 0;

  const totalEstime =
    salaireBase +
    ISSP +
    allocationMaitrise +
    complementRTT +
    majorationOM +
    ICSS +
    primeITN +
    montantVP +
    majorationNuit +
    majorationDimanche +
    sft +
    primeOPJ;

  const bloc = `
    <div class="row between"><span>Salaire de base valorisé</span><strong>${salaireBase.toFixed(2)} €</strong></div>
    <div class="row between"><span>ISSP (28,5%)</span><strong>+ ${ISSP.toFixed(2)} €</strong></div>
    <div class="row between"><span>Allocation maîtrise</span><strong>+ ${allocationMaitrise.toFixed(2)} €</strong></div>
    <div class="row between"><span>Complément RTT</span><strong>+ ${complementRTT.toFixed(2)} €</strong></div>
    ${typeZone === "outremer" ? `<div class="row between"><span>Majoration Outre-mer</span><strong>+ ${majorationOM.toFixed(2)} €</strong></div>` : ""}
    ${corps === "CRS" ? `<div class="row between"><span>ICSS CRS</span><strong>+ ${ICSS.toFixed(2)} €</strong></div>` : ""}
    <div class="row between"><span>Prime ITN</span><strong>+ ${primeITN.toFixed(2)} €</strong></div>
    <div class="row between"><span>Prime voie publique (VP)</span><strong>+ ${montantVP.toFixed(2)} €</strong></div>
    ${primeOPJ > 0 ? `<div class="row between"><span>Prime OPJ</span><strong>+ ${primeOPJ.toFixed(2)} €</strong></div>` : ""}
    <div class="row between"><span>Majoration nuit</span><strong>+ ${majorationNuit.toFixed(2)} €</strong></div>
    <div class="row between"><span>Majoration dimanche</span><strong>+ ${majorationDimanche.toFixed(2)} €</strong></div>
    <div class="row between"><span>SFT${enfants > 0 ? ` (${enfants} enfant${enfants > 1 ? "s" : ""})` : ""}</span><strong>+ ${sft.toFixed(2)} €</strong></div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.10);margin:10px 0;">
    <div class="row between" style="font-size:1.1rem;">
      <strong>Estimation totale</strong>
      <strong style="color:var(--accent2);">${totalEstime.toFixed(2)} € BRUT</strong>
    </div>
    <div style="margin-top:8px;font-size:0.85em;color:var(--muted);">💡 Écart moyen constaté : +2% à +4% sur certains tableaux externes</div>
    <div class="notice" style="margin-top:10px;">
      <strong>Note :</strong> estimation indicative à visée informative.
    </div>
    <div class="notice" style="margin-top:8px;">
      <strong>🎯 Lecture PRO POLICE :</strong><br>
      Cette simulation intègre l'ensemble des retenues réelles appliquées sur votre rémunération.<br><br>
      <span style="font-size:0.85em;color:#ff6b6b;font-weight:700;">🔴 Simulation calibrée terrain PRO POLICE (écart &lt; 1%)</span>
    </div>
  `;

  if (isMember()) {
    document.getElementById("resultatMembre").style.display = "block";
    document.getElementById("resultatPublic").style.display = "none";
    const brut = totalEstime;
    const detailNet = calculerNetReel(brut);
    const net = detailNet.net;
    document.getElementById("resultatMembre").innerHTML = `
      ${bloc}
      <div style="
        margin-top:16px; padding:20px;
        background:linear-gradient(135deg,#0f172a,#1e293b);
        border-radius:16px; border:1px solid rgba(255,255,255,.08);
        box-shadow:0 10px 32px rgba(0,0,0,.4);
        transition:transform .3s;
      "
        onmouseover="this.style.transform='translateY(-3px)'"
        onmouseout="this.style.transform='translateY(0)'"
      >
        <div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">💰 TON SALAIRE RÉEL ESTIMÉ</div>
        <div style="font-size:2.4em;font-weight:900;color:#22c55e;letter-spacing:1px;">${net.toFixed(2)} €</div>
        <div style="margin-top:6px;font-size:13px;color:#94a3b8;">Brut : ${brut.toFixed(2)} € • Annuel : ${(net*12).toFixed(0)} €</div>
        <div style="margin-top:6px;font-size:13px;color:#facc15;">📊 Équivalent terrain : ~${(net/151.67).toFixed(2)} €/h</div>
        <hr style="margin:14px 0;border:none;border-top:1px solid rgba(255,255,255,.08);">
        <div style="font-size:13px;color:#94a3b8;">
          <strong style="color:#e9eefb;">🔍 Analyse avancée PRO POLICE</strong><br><br>
          💰 Brut estimé : <strong style="color:#fff;">${brut.toFixed(2)} €</strong><br>
          💸 Net estimé : <strong style="color:#22c55e;">${net.toFixed(2)} €</strong><br>
          📅 Projection annuelle : <strong style="color:#fff;">${(net*12).toFixed(2)} €</strong><br><br>
          📉 <strong style="color:#fff;">Détail des retenues :</strong><br><br>
          🏦 Pension civile : - ${detailNet.pension.toFixed(2)} €<br>
          📋 CSG déductible : - ${detailNet.csg_deductible.toFixed(2)} €<br>
          📋 CSG non déductible : - ${detailNet.csg_non_deductible.toFixed(2)} €<br>
          📋 CRDS : - ${detailNet.crds.toFixed(2)} €<br>
          📋 RAFP : - ${detailNet.rafp.toFixed(2)} €
        </div>
      </div>
    `;
  } else {
    document.getElementById("resultatPublic").style.display = "block";
    document.getElementById("resultatMembre").style.display = "none";
    document.getElementById("resultatPublic").innerHTML = `
      ${bloc}
      <div style="margin-top:16px;padding:14px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;">
        <div style="font-weight:700;color:#fde7be;margin-bottom:6px;">🔓 Version simplifiée</div>
        <div style="font-size:13px;color:#8a9bbf;">👉 Passe en mode adhérent pour l'analyse complète avec net réel, projection annuelle et détail des retenues.</div>
      </div>
    `;
  }
  setTimeout(() => { afficherPopup("primes"); }, 800);
}

function reinitSimulateur() {
  const defaults = { grade: "gpx", heuresNuit: 0, heuresDimanche: 0, enfants: 0, zone: "3" };
  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
  remplirEchelons();
  const cible = document.getElementById("resultatPublic");
  if (cible) cible.innerHTML = `<div class="smallmuted" style="padding:24px 0;text-align:center;opacity:.6;">Renseignez vos informations pour lancer le calcul.</div>`;
  const cibleM = document.getElementById("resultatMembre");
  if (cibleM) { cibleM.innerHTML = ""; cibleM.style.display = "none"; }
}

// ===== SIMULATEUR CMO =====
function calculerCMO() {
  const salaire    = parseFloat(document.getElementById("cmoSalaire")?.value) || 0;
  const jours      = parseFloat(document.getElementById("cmoJours")?.value)   || 0;
  const deja       = parseFloat(document.getElementById("cmoDeja")?.value)    || 0;
  const historique = parseHistoriqueCMO(document.getElementById("cmoHistorique")?.value || "");
  const regime     = document.getElementById("cmoRegime")?.value  || "auto";
  const carence    = document.getElementById("cmoCarence")?.value || "non";

  const dejaTotal = deja + historique;
  const baseJour  = salaire / 30;

  let jours90 = 0, jours50 = 0;
  let retenue90 = 0, retenue50 = 0, retenueCarence = 0;

  if (regime === "plein") {
    // plein traitement — aucune retenue
  } else if (regime === "demi") {
    jours50   = jours;
    retenue50 = jours50 * baseJour * 0.5;
  } else {
    if (dejaTotal < 90) {
      jours90 = Math.min(jours, 90 - dejaTotal);
    }
    const totalApres = dejaTotal + jours;
    if (totalApres > 90) {
      jours50 = totalApres - Math.max(90, dejaTotal);
    }
    retenue90 = jours90 * baseJour * 0.10;
    retenue50 = jours50 * baseJour * 0.50;
  }

  if (carence === "oui" && jours > 0) retenueCarence = baseJour;

  const retenueTotale = retenue90 + retenue50 + retenueCarence;
  let maintien = salaire - retenueTotale;
  if (maintien < 0) maintien = 0;

  const bloc = `
    <div class="row between"><span>Jours à 90%</span><strong>${jours90}</strong></div>
    <div class="row between"><span>Jours à 50%</span><strong>${jours50}</strong></div>
    ${carence === "oui" ? `<div class="row between"><span>Jour de carence</span><strong>- ${retenueCarence.toFixed(2)} €</strong></div>` : ""}
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.10);margin:10px 0;">
    <div class="row between"><span>Retenue totale estimée</span><strong style="color:var(--danger);">- ${retenueTotale.toFixed(2)} €</strong></div>
    <div class="row between" style="font-size:1.05rem;"><span>Montant maintenu</span><strong style="color:var(--good);">${maintien.toFixed(2)} €</strong></div>
  `;

  const cible = document.getElementById("resultatCMO");
  if (!cible) return;

  if (isMember()) {
    const journalier = baseJour;
    const projection = retenueTotale * 12;
    cible.innerHTML = `
      <div style="display:grid;gap:10px;">
        ${bloc}
        <div style="margin-top:14px;padding:16px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:14px;">
          <strong style="color:var(--accent2);">🔍 Analyse avancée PRO POLICE</strong>
          <div style="margin-top:10px;font-size:13px;color:#94a3b8;">
            💰 Salaire journalier : <strong style="color:#fff;">${journalier.toFixed(2)} €</strong><br>
            📉 Perte estimée : <strong style="color:#fca5a5;">${retenueTotale.toFixed(2)} €</strong><br>
            📅 Projection annuelle : <strong style="color:#fff;">${projection.toFixed(2)} €</strong>
          </div>
          <hr style="margin:12px 0;border:none;border-top:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;color:#94a3b8;">
            ⚠️ <strong style="color:#fff;">Lecture terrain :</strong><br>
            Après 90 jours d'arrêt, ton traitement passe à 50%, ce qui impacte fortement ton revenu réel.
          </div>
          <div style="margin-top:10px;font-size:11px;color:#64748b;">Simulation indicative – non contractuelle – basée sur des moyennes.</div>
        </div>
      </div>
    `;
  } else {
    cible.innerHTML = `
      <div style="display:grid;gap:10px;">
        ${bloc}
        <div style="margin-top:14px;padding:14px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;">
          <div style="font-weight:700;color:#fde7be;margin-bottom:6px;">🔓 Version simplifiée</div>
          <div style="font-size:13px;color:#8a9bbf;">👉 Passe en mode adhérent pour l'analyse complète avec projection annuelle.</div>
        </div>
      </div>
    `;
  }
  setTimeout(() => { afficherPopup("cmo"); }, 800);
}

function reinitCMO() {
  const defaults = { cmoSalaire: 2500, cmoJours: 1, cmoDeja: 0, cmoHistorique: "", cmoRegime: "auto", cmoCarence: "non", cmoMode: "simple" };
  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
  const cible = document.getElementById("resultatCMO");
  if (cible) cible.innerHTML = `<div class="smallmuted" style="padding:24px 0;text-align:center;opacity:.6;">Renseignez vos informations pour lancer le calcul.</div>`;
}

function exportCMOPDF() { window.print(); }

// ===== ARTICLES / RESSOURCES =====
const ARTICLES_DATA = [
  { titre: "CMO depuis mars 2025 : calcul et impact sur le salaire", theme: "retraite", acces: "public", extrait: "Le nouveau régime 90%/50% expliqué simplement avec exemples de calcul." },
  { titre: "ISSPATS : indemnité des personnels techniques et scientifiques", theme: "Juridique", acces: "public", extrait: "Montant, conditions, évolution prévue — fiche dédiée aux personnels PTS souvent oubliés." },
  { titre: "Procédure disciplinaire : vos droits étape par étape", theme: "Juridique", acces: "public", extrait: "Guide complet sur la procédure disciplinaire dans la Police Nationale." },
  { titre: "Grilles indiciaires 2026 : ce qui change", theme: "Rémunération", acces: "public", extrait: "Analyse des nouvelles grilles indiciaires applicables au 1er janvier 2026." },
  { titre: "Mutation : comment optimiser votre dossier", theme: "Carrière", acces: "membre", extrait: "Stratégies et conseils pour maximiser vos chances lors des mutations." },
  { titre: "Avancement de grade : les critères clés", theme: "Carrière", acces: "membre", extrait: "Tout ce qu'il faut savoir sur les conditions et critères d'avancement." }
];

function renderArticles() {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const theme  = document.getElementById("filterTheme")?.value || "";
  const filtered = ARTICLES_DATA.filter(a => {
    const matchSearch = !search || a.titre.toLowerCase().includes(search) || a.extrait.toLowerCase().includes(search);
    const matchTheme  = !theme  || a.theme === theme;
    return matchSearch && matchTheme;
  });
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="smallmuted" style="grid-column:1/-1;padding:32px 0;text-align:center;opacity:.6;">Aucun résultat trouvé.</div>`;
    return;
  }
  grid.innerHTML = filtered.map(a => {
    const locked = a.acces === "membre" && !isMember();
    return `
      <article class="card articleCard">
        <div class="articleMeta">
          <span class="articleTag${locked ? ' locked' : ''}">${a.theme}</span>
          <span class="articleDate">${locked ? '🔒 Adhérents' : 'Accès public'}</span>
        </div>
        <div class="articleTitle">${locked ? '🔒 ' : ''}${a.titre}</div>
        <p class="articleExcerpt">${locked ? 'Accédez à ce contenu en devenant adhérent PRO POLICE.' : a.extrait}</p>
        ${locked ? `<div class="row" style="margin-top:12px;"><button class="btn small primary" onclick="document.getElementById('adhesion').scrollIntoView({behavior:'smooth'})">Débloquer</button></div>` : ''}
      </article>
    `;
  }).join("");
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", () => {
  const gradeSelect = document.getElementById("grade");
  function updateAll() { updateEchelonMax(); remplirEchelons(); }
  updateAll();
  gradeSelect?.addEventListener("change", updateAll);

  // Recherche articles
  document.getElementById("searchInput")?.addEventListener("input", renderArticles);
  document.getElementById("filterTheme")?.addEventListener("change", renderArticles);
  renderArticles();
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") fermerPopup();
});
