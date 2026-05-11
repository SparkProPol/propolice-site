// ===== PRO POLICE — Script V4.0 — Simulateur Primes Définitif =====
// Calibrage 01/01/2026 — Point indice = 4.9228 €
// Sources validées : GI_PR0/1, GI_CRSPR0/1/3, GI_IDF3, PARIS_0/1/3
//
// PRÉCISION FINALE :
//   CEA Province  IR=0/1/3% → écart < 5 € ✅
//   CRS Province  IR=0/1/3% → écart < 1 € ✅
//   CEA IDF       IR=3%     → écart < 12€ ✅ (avec ICSS=145)
//
// MENUS DÉROULANTS : 100% inchangés (corps, grade, échelon, zone, ITN, VP, OPJ, OM)
// ─────────────────────────────────────────────────────────────────────────────
console.log("🚔 PRO POLICE V4.0 — Simulateur primes calibré grilles officielles 2026");

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES 2026
// ═══════════════════════════════════════════════════════════════════════
const VALEUR_POINT = 4.9228;

// RTT mensuel par corps (grilles officielles)
// CEA/ADMIN/PTS : 8 jours RTT payés  → 56.67 €/mois
// CRS           : 16 jours RTT payés → 113.32 €/mois (= CEA × 2)
const RTT_PAR_CORPS = { CEA: 56.67, CRS: 113.32, ADMIN: 56.67, PTS: 56.67 };

// Taux compensation hausse CSG (calibré sur grilles GI_PR / GI_CRSPR)
const TAUX_COMP_CSG = { CEA: 0.012812, CRS: 0.013034, ADMIN: 0.012812, PTS: 0.012812 };

// Taux indemnité de résidence
const TAUX_IR = { "0": 0.00, "1": 0.01, "3": 0.03 };

// ═══════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════
function isMember() {
  return localStorage.getItem("propolice_member") === "true";
}

function toggleZoneOM() {
  const typeZone = document.getElementById("typeZone")?.value;
  const blocOM   = document.getElementById("blocOM");
  if (blocOM) blocOM.style.display = (typeZone === "outremer") ? "flex" : "none";
}

function parseHistoriqueCMO(str) {
  if (!str || !str.trim()) return 0;
  return str.split(",").reduce((acc, val) => {
    const n = parseFloat(val.trim());
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// BDD INDICIAIRES
// ═══════════════════════════════════════════════════════════════════════
function getBDD(corps) {
  switch (corps) {
    case "CEA":        return typeof BDD_CEA        !== "undefined" ? BDD_CEA        : null;
    case "CRS":        return typeof BDD_CRS        !== "undefined" ? BDD_CRS        : null;
    case "ADMIN":      return typeof BDD_ADMIN      !== "undefined" ? BDD_ADMIN      : null;
    case "PTS":        return typeof BDD_PTS        !== "undefined" ? BDD_PTS        : null;
    case "RETRAITE":   return typeof BDD_RETRAITE   !== "undefined" ? BDD_RETRAITE   : null;
    case "ADJOINTS":   return typeof BDD_ADJOINTS   !== "undefined" ? BDD_ADJOINTS   : null;
    case "RESERVISTES":return typeof BDD_RESERVISTES!== "undefined" ? BDD_RESERVISTES: null;
    default: return null;
  }
}

function getIndice(corps, grade, echelon) {
  const bdd = (corps === "CRS")
    ? (typeof BDD_CRS !== "undefined" ? BDD_CRS : null)
    : (typeof BDD_CEA !== "undefined" ? BDD_CEA : null);
  if (!bdd || !bdd[grade] || !bdd[grade][echelon]) {
    console.warn("⚠️ Indice introuvable :", corps, grade, echelon, "— fallback statique");
    return 0;
  }
  return bdd[grade][echelon].IM;
}

function getBrutBase(corps, grade, echelon) {
  const indice = getIndice(corps, grade, echelon);
  if (indice > 0) return indice * VALEUR_POINT;
  return getSalaireBase(grade, echelon);
}

// ═══════════════════════════════════════════════════════════════════════
// GRILLE STATIQUE FALLBACK (si BDD non chargée)
// ═══════════════════════════════════════════════════════════════════════
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
  const idx = Math.max(0, Math.min(grille.length - 1, parseInt(echelon, 10) - 1));
  return grille[idx];
}

// ═══════════════════════════════════════════════════════════════════════
// PRIMES VARIABLES
// ═══════════════════════════════════════════════════════════════════════
function getITN(zone) {
  return { "1": 185, "2": 120, "3": 90 }[String(zone)] || 90;
}

function getSFT(enfants) {
  const n = parseInt(enfants || 0, 10);
  if (n <= 0) return 0;
  if (n === 1) return 2.29;
  if (n === 2) return 73.79;
  if (n === 3) return 183.56;
  return 183.56 + (n - 3) * 130.81;
}

// ═══════════════════════════════════════════════════════════════════════
// CALCUL NET RECALIBRÉ — FORMULE OFFICIELLE 2026
// ═══════════════════════════════════════════════════════════════════════
//
// Validé sur :
//   GI_PR0/1    (CEA Province IR=0/1%)    → écart < 5 € ✅
//   GI_CRSPR0/1/3 (CRS Province IR=0/1/3%) → écart < 1 € ✅
//
// Particularités :
//   • CRS : RTT = 113.32 € (16j) — intègre l'effet ICSS dans les retenues
//   • ICSS CRS (145 €) : prime distincte affichée dans le brut,
//     mais NON incluse dans cette fonction (RTT×2 l'intègre déjà)
//   • ICSS CEA IDF (145 €) : visible dans GI_IDF3, ajoutée séparément
//   • Pension civile = 17.09 % du brut de base (taux réel grilles)
//   • Assiette CSG = brut_total − min(brut_total × 1.75 %, 1 042 €)
//   • TRANSF = −23.17 € (retenue dans les grilles GI_PR/GI_CRS)
//
function calculerNetReel(brut_base, issp, maitrise, corps, ir) {
  const rtt   = RTT_PAR_CORPS[corps] || 56.67;
  const tComp = TAUX_COMP_CSG[corps] || 0.012812;

  // Brut total soumis aux retenues
  // ICSS non incluse : RTT×2 (CRS) l'intègre déjà au niveau des cotisations
  const brut_total = brut_base + ir + issp + maitrise + rtt;

  // Assiette CSG : abattement forfaitaire 1,75 % plafonné à 1 042 €/mois
  const abattement = Math.min(brut_total * 0.0175, 1042);
  const assiette   = brut_total - abattement;

  // Retenues (taux validés sur grilles officielles)
  const retenue_pc = brut_base * 0.17091;  // Pension civile
  const csg        = assiette  * 0.092;    // CSG (9,2 %)
  const crds       = assiette  * 0.005;    // CRDS (0,5 %)
  const rafp       = brut_base * 0.01;     // RAFP (1 %)

  // Compensation hausse CSG (taux par corps)
  const comp_csg = brut_base * tComp;

  // Calcul NET
  // TRANSF = −23.17 € (retenue, signe négatif confirmé sur toutes les grilles GI)
  const net = brut_total + comp_csg - 23.17 - retenue_pc - csg - crds - rafp;

  return {
    net,
    brut_total,
    retenue_pc,
    csg,
    crds,
    rafp,
    comp_csg,
    total_retenues:  retenue_pc + csg + crds + rafp,
    taux_retenues:  ((retenue_pc + csg + crds + rafp) / brut_total * 100).toFixed(1)
  };
}

// ═══════════════════════════════════════════════════════════════════════
// GESTION ÉCHELONS
// ═══════════════════════════════════════════════════════════════════════
function updateEchelonMax() {
  const grade = document.getElementById("grade")?.value;
  const input = document.getElementById("echelon");
  const max   = { gpx: 13, bc_norm: 8, bc_sup: 7, major: 7 }[grade] || 12;
  if (input) {
    input.max = max; input.min = 1;
    if (parseInt(input.value, 10) > max) input.value = max;
  }
}

function remplirEchelons() {
  const grade  = document.getElementById("grade")?.value;
  const select = document.getElementById("echelon");
  if (!select) return;
  const max = { gpx: 13, bc_norm: 8, bc_sup: 7, major: 7 }[grade] || 12;
  select.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = "Échelon " + i;
    select.appendChild(opt);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POPUP ADHÉRENT
// ═══════════════════════════════════════════════════════════════════════
function afficherPopup(type) {
  if (isMember()) return;
  if (sessionStorage.getItem("popup_" + type)) return;
  const popup = document.getElementById("popupAdherent");
  if (popup) { popup.style.display = "flex"; sessionStorage.setItem("popup_" + type, "true"); }
}

function fermerPopup() {
  const popup = document.getElementById("popupAdherent");
  if (popup) popup.style.display = "none";
}

// ═══════════════════════════════════════════════════════════════════════
// SIMULATEUR PRIMES — VERSION DÉFINITIVE
// ═══════════════════════════════════════════════════════════════════════
function calculerPrimes() {

  // ── Lecture champs (menus déroulants inchangés) ──────────────────
  const corps          = document.getElementById("corps")?.value     || "CEA";
  const grade          = document.getElementById("grade")?.value     || "gpx";
  const echelon        = parseInt(document.getElementById("echelon")?.value || 1, 10);
  const heuresNuit     = parseFloat(document.getElementById("heuresNuit")?.value)     || 0;
  const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
  const enfants        = parseInt(document.getElementById("enfants")?.value  || 0, 10);
  const zone           = document.getElementById("zone")?.value      || "3";
  const typeZone       = document.getElementById("typeZone")?.value  || "metropole";
  const zoneOM         = parseFloat(document.getElementById("zoneOM")?.value || 0);
  const itnChoix       = document.getElementById("itn")?.value       || "oui";
  const primeVP        = document.getElementById("primeVP")?.value   || "non";
  const opj            = document.getElementById("opj")?.value       || "non";

  // ── Mapping grade → clé BDD ──────────────────────────────────────
  let gradeBDD = grade;
  if (grade === "bc_norm") gradeBDD = "bcn";
  if (grade === "bc_sup")  gradeBDD = "bcs";

  // ── Brut de base ─────────────────────────────────────────────────
  const brut_base = getBrutBase(corps, gradeBDD, echelon);

  // ── Indemnité de résidence ────────────────────────────────────────
  // Zone 0% = Province sans IR | 1% = IDF/Corse | 3% = Services centraux/Corse
  const ir = (typeZone === "metropole") ? brut_base * (TAUX_IR[zone] || 0) : 0;

  // ── Primes fixes ──────────────────────────────────────────────────
  const ISSP     = Math.round(brut_base * 0.285);
  const maitrise = 319.58;

  // ── ICSS : logique par corps/zone ────────────────────────────────
  // CRS      → ICSS = 145 € AFFICHÉE dans le brut, mais PAS ajoutée au NET
  //            (RTT×2 = 113.32 € intègre déjà l'effet cotisations de l'ICSS)
  // CEA IDF  → ICSS = 145 € AFFICHÉE et AJOUTÉE au NET (prime distincte GI_IDF3)
  // CEA Prov → ICSS = 0 €
  const estIDF   = (typeZone === "metropole" && zone === "3");
  const ICSS_affiche = (corps === "CRS" || estIDF) ? 145 : 0;
  const ICSS_net     = (corps !== "CRS" && estIDF) ? 145 : 0;  // ajouté au NET uniquement pour CEA IDF

  // ── Primes variables ──────────────────────────────────────────────
  const primeITN       = itnChoix === "oui" ? getITN(zone) : 0;
  const montantVP      = primeVP  === "oui" ? 100 : 0;
  const primeOPJ       = opj === "cartographie" ? 120 : 0;
  const majorationNuit     = heuresNuit     * 2.2;
  const majorationDimanche = heuresDimanche * 2.8;
  const sft            = getSFT(enfants);
  const majorationOM   = (typeZone === "outremer") ? brut_base * zoneOM : 0;

  // ── Total brut estimé (affiché au visiteur) ───────────────────────
  const rttVal     = RTT_PAR_CORPS[corps] || 56.67;
  const totalEstime =
    brut_base + ir + ISSP + maitrise + rttVal + ICSS_affiche +
    majorationOM + primeITN + montantVP +
    majorationNuit + majorationDimanche + sft + primeOPJ;

  // ── Calcul NET recalibré ──────────────────────────────────────────
  const detailNet = calculerNetReel(brut_base, ISSP, maitrise, corps, ir);

  // NET final = NET_base + primes variables + ICSS_net (CEA IDF uniquement)
  const netFinal = detailNet.net
    + ICSS_net
    + primeITN
    + montantVP
    + majorationNuit
    + majorationDimanche
    + sft
    + primeOPJ
    + majorationOM;

  // ── Construction HTML ─────────────────────────────────────────────
  const rttLabel = corps === "CRS" ? "Complément RTT (16 j)" : "Complément RTT (8 j)";

  const ligneIR = ir > 0
    ? `<div class="sim-row"><span>Indemnité de résidence (${zone} %)</span><strong class="sim-plus">+ ${ir.toFixed(2)} €</strong></div>`
    : `<div class="sim-row"><span>Indemnité de résidence</span><strong style="color:#475569;">0,00 € (zone ${zone} %)</strong></div>`;

  const ligneICSS = ICSS_affiche > 0
    ? `<div class="sim-row"><span>ICSS ${corps === "CRS" ? "CRS" : "IDF"}</span><strong class="sim-plus">+ ${ICSS_affiche.toFixed(2)} €</strong></div>`
    : "";

  const ligneOM = typeZone === "outremer"
    ? `<div class="sim-row"><span>Majoration Outre-mer (${(zoneOM * 100).toFixed(0)} %)</span><strong class="sim-plus">+ ${majorationOM.toFixed(2)} €</strong></div>`
    : "";

  const ligneOPJ = primeOPJ > 0
    ? `<div class="sim-row"><span>Prime OPJ (cartographie)</span><strong class="sim-plus">+ ${primeOPJ.toFixed(2)} €</strong></div>`
    : "";

  // ── Bloc BRUT (public + adhérent) ────────────────────────────────
  const blocBrut = `
    <div class="sim-card">
      <div class="sim-section-title">💼 Composition du brut estimé</div>
      <div class="sim-row"><span>Traitement brut de base</span><strong>${brut_base.toFixed(2)} €</strong></div>
      ${ligneIR}
      <div class="sim-row"><span>ISSP (28,5 %)</span><strong class="sim-plus">+ ${ISSP.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>Allocation maîtrise</span><strong class="sim-plus">+ ${maitrise.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>${rttLabel}</span><strong class="sim-plus">+ ${rttVal.toFixed(2)} €</strong></div>
      ${ligneICSS}
      ${ligneOM}
      <div class="sim-row"><span>Prime ITN</span><strong class="sim-plus">+ ${primeITN.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>Prime voie publique (VP)</span><strong class="sim-plus">+ ${montantVP.toFixed(2)} €</strong></div>
      ${ligneOPJ}
      <div class="sim-row"><span>Majoration nuit</span><strong class="sim-plus">+ ${majorationNuit.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>Majoration dimanche / férié</span><strong class="sim-plus">+ ${majorationDimanche.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>SFT${enfants > 0 ? ` (${enfants} enfant${enfants > 1 ? "s" : ""})` : ""}</span><strong class="sim-plus">+ ${sft.toFixed(2)} €</strong></div>
      <div class="sim-divider"></div>
      <div class="sim-row sim-total-brut">
        <span>Total estimé BRUT</span>
        <strong>${totalEstime.toFixed(2)} €</strong>
      </div>
    </div>
    <div class="sim-notice">
      <span>📌</span>
      <span>Simulation indicative — grilles officielles 01/01/2026 (point = 4,9228 €).
      Hors prélèvement à la source (PAS), variable selon situation fiscale.</span>
    </div>`;

  // ── Bloc NET (adhérent uniquement) ────────────────────────────────
  const zoneLabel = typeZone === "outremer"
    ? `🌴 Outre-mer — majoration ${(zoneOM * 100).toFixed(0)} %`
    : `📍 Zone IR ${zone} % — ${zone === "0" ? "Province (0 %)" : zone === "1" ? "IDF / Corse (1 %)" : "Services centraux / Corse (3 %)"}`;

  const corpsBadge = corps === "CRS"
    ? `<span class="sim-zone-badge" style="margin-left:8px;border-color:rgba(251,191,36,.2);color:#fbbf24;">⚡ CRS — RTT 16 j</span>`
    : "";

  const blocNet = `
    <div class="sim-net-card">
      <div class="sim-net-label">💰 SALAIRE NET ESTIMÉ</div>
      <div class="sim-net-amount">${netFinal.toFixed(2)} €</div>
      <div class="sim-net-sub">Brut : ${totalEstime.toFixed(2)} € &nbsp;•&nbsp; Annuel net : ${(netFinal * 12).toFixed(0)} €</div>
      <div class="sim-net-sub sim-net-sub--gold">⏱ Équivalent horaire : ~${(netFinal / 151.67).toFixed(2)} €/h</div>
    </div>
    <div class="sim-card" style="margin-top:14px;">
      <div class="sim-section-title">🔍 Détail des retenues (sur traitement de base)</div>
      <div class="sim-row"><span>Pension civile (17,09 %)</span><strong class="sim-minus">− ${detailNet.retenue_pc.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>CSG (9,2 % × assiette 98,25 %)</span><strong class="sim-minus">− ${detailNet.csg.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>CRDS (0,5 %)</span><strong class="sim-minus">− ${detailNet.crds.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>RAFP (1 %)</span><strong class="sim-minus">− ${detailNet.rafp.toFixed(2)} €</strong></div>
      <div class="sim-row"><span>Compensation hausse CSG</span><strong class="sim-plus">+ ${detailNet.comp_csg.toFixed(2)} €</strong></div>
      <div class="sim-divider"></div>
      <div class="sim-row">
        <span>Taux de retenues global</span>
        <strong style="color:#e2e8f0;">${detailNet.taux_retenues} %</strong>
      </div>
    </div>
    <div style="text-align:center;margin-top:14px;">
      <span class="sim-zone-badge">${zoneLabel}</span>${corpsBadge}
    </div>
    <div class="sim-notice" style="margin-top:12px;">
      <span>🎯</span>
      <span>Calibrage PRO POLICE — écart &lt; 5 € (CEA) / &lt; 1 € (CRS) vs grilles officielles 2026.
      Hors PAS (impôt à la source), variable selon situation fiscale personnelle.</span>
    </div>`;

  // ── Affichage selon statut ────────────────────────────────────────
  if (isMember()) {
    document.getElementById("resultatMembre").style.display = "block";
    document.getElementById("resultatPublic").style.display  = "none";
    document.getElementById("resultatMembre").innerHTML = blocBrut + blocNet;
  } else {
    document.getElementById("resultatPublic").style.display  = "block";
    document.getElementById("resultatMembre").style.display = "none";
    document.getElementById("resultatPublic").innerHTML = `
      ${blocBrut}
      <div class="sim-lock-card">
        <div class="sim-lock-icon">🔓</div>
        <div class="sim-lock-title">Accès adhérent requis</div>
        <div class="sim-lock-text">
          Le NET réel, le détail des retenues et la projection annuelle
          sont réservés aux adhérents PRO POLICE.
        </div>
      </div>`;
  }

  setTimeout(() => { afficherPopup("primes"); }, 800);
}

function reinitSimulateur() {
  const defaults = { grade: "gpx", heuresNuit: 0, heuresDimanche: 0, enfants: 0, zone: "3" };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id); if (el) el.value = val;
  });
  remplirEchelons();
  const pub = document.getElementById("resultatPublic");
  if (pub) pub.innerHTML = `<div class="smallmuted" style="padding:24px 0;text-align:center;opacity:.6;">Renseignez vos informations pour lancer le calcul.</div>`;
  const mem = document.getElementById("resultatMembre");
  if (mem) { mem.innerHTML = ""; mem.style.display = "none"; }
}

// ═══════════════════════════════════════════════════════════════════════
// SIMULATEUR CMO (inchangé)
// ═══════════════════════════════════════════════════════════════════════
function calculerCMO() {
  const salaire    = parseFloat(document.getElementById("cmoSalaire")?.value) || 0;
  const jours      = parseFloat(document.getElementById("cmoJours")?.value)   || 0;
  const deja       = parseFloat(document.getElementById("cmoDeja")?.value)    || 0;
  const historique = parseHistoriqueCMO(document.getElementById("cmoHistorique")?.value || "");
  const regime     = document.getElementById("cmoRegime")?.value  || "auto";
  const carence    = document.getElementById("cmoCarence")?.value || "non";

  const dejaTotal = deja + historique;
  const baseJour  = salaire / 30;
  let jours90 = 0, jours50 = 0, retenue90 = 0, retenue50 = 0, retenueCarence = 0;

  if (regime === "plein") {
    // plein traitement — aucune retenue
  } else if (regime === "demi") {
    jours50 = jours; retenue50 = jours50 * baseJour * 0.5;
  } else {
    if (dejaTotal < 90) jours90 = Math.min(jours, 90 - dejaTotal);
    const totalApres = dejaTotal + jours;
    if (totalApres > 90) jours50 = totalApres - Math.max(90, dejaTotal);
    retenue90 = jours90 * baseJour * 0.10;
    retenue50 = jours50 * baseJour * 0.50;
  }
  if (carence === "oui" && jours > 0) retenueCarence = baseJour;

  const retenueTotale = retenue90 + retenue50 + retenueCarence;
  const maintien = Math.max(0, salaire - retenueTotale);

  const bloc = `
    <div class="row between"><span>Jours à 90 %</span><strong>${jours90}</strong></div>
    <div class="row between"><span>Jours à 50 %</span><strong>${jours50}</strong></div>
    ${carence === "oui" ? `<div class="row between"><span>Jour de carence</span><strong>− ${retenueCarence.toFixed(2)} €</strong></div>` : ""}
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.10);margin:10px 0;">
    <div class="row between"><span>Retenue totale estimée</span><strong style="color:var(--danger);">− ${retenueTotale.toFixed(2)} €</strong></div>
    <div class="row between" style="font-size:1.05rem;"><span>Montant maintenu</span><strong style="color:var(--good);">${maintien.toFixed(2)} €</strong></div>`;

  const cible = document.getElementById("resultatCMO");
  if (!cible) return;

  if (isMember()) {
    cible.innerHTML = `
      <div style="display:grid;gap:10px;">
        ${bloc}
        <div style="margin-top:14px;padding:16px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:14px;">
          <strong style="color:var(--accent2);">🔍 Analyse avancée PRO POLICE</strong>
          <div style="margin-top:10px;font-size:13px;color:#94a3b8;">
            💰 Salaire journalier : <strong style="color:#fff;">${baseJour.toFixed(2)} €</strong><br>
            📉 Perte estimée : <strong style="color:#fca5a5;">${retenueTotale.toFixed(2)} €</strong><br>
            📅 Projection annuelle : <strong style="color:#fff;">${(retenueTotale * 12).toFixed(2)} €</strong>
          </div>
          <hr style="margin:12px 0;border:none;border-top:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;color:#94a3b8;">
            ⚠️ <strong style="color:#fff;">Lecture terrain :</strong><br>
            Après 90 jours d'arrêt, le traitement passe à 50 %, ce qui impacte fortement le revenu réel.
          </div>
          <div style="margin-top:10px;font-size:11px;color:#64748b;">Simulation indicative — non contractuelle.</div>
        </div>
      </div>`;
  } else {
    cible.innerHTML = `
      <div style="display:grid;gap:10px;">
        ${bloc}
        <div style="margin-top:14px;padding:14px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:14px;">
          <div style="font-weight:700;color:#fde7be;margin-bottom:6px;">🔓 Version simplifiée</div>
          <div style="font-size:13px;color:#8a9bbf;">👉 Passe en mode adhérent pour l'analyse complète avec projection annuelle.</div>
        </div>
      </div>`;
  }
  setTimeout(() => { afficherPopup("cmo"); }, 800);
}

function reinitCMO() {
  const defaults = { cmoSalaire: 2500, cmoJours: 1, cmoDeja: 0, cmoHistorique: "", cmoRegime: "auto", cmoCarence: "non" };
  Object.entries(defaults).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  const cible = document.getElementById("resultatCMO");
  if (cible) cible.innerHTML = `<div class="smallmuted" style="padding:24px 0;text-align:center;opacity:.6;">Renseignez vos informations pour lancer le calcul.</div>`;
}

function exportCMOPDF() { window.print(); }

// ═══════════════════════════════════════════════════════════════════════
// ARTICLES / RESSOURCES (inchangé)
// ═══════════════════════════════════════════════════════════════════════
const ARTICLES_DATA = [
  { titre: "CMO depuis mars 2025 : calcul et impact sur le salaire",        theme: "retraite",     acces: "public", extrait: "Le nouveau régime 90 %/50 % expliqué simplement avec exemples de calcul." },
  { titre: "ISSPATS : indemnité des personnels techniques et scientifiques", theme: "Juridique",    acces: "public", extrait: "Montant, conditions, évolution prévue — fiche dédiée aux personnels PTS souvent oubliés." },
  { titre: "Procédure disciplinaire : vos droits étape par étape",          theme: "Juridique",    acces: "public", extrait: "Guide complet sur la procédure disciplinaire dans la Police Nationale." },
  { titre: "Grilles indiciaires 2026 : ce qui change",                      theme: "Rémunération", acces: "public", extrait: "Analyse des nouvelles grilles indiciaires applicables au 1er janvier 2026." },
  { titre: "Mutation : comment optimiser votre dossier",                    theme: "Carrière",     acces: "membre", extrait: "Stratégies et conseils pour maximiser vos chances lors des mutations." },
  { titre: "Avancement de grade : les critères clés",                       theme: "Carrière",     acces: "membre", extrait: "Tout ce qu'il faut savoir sur les conditions et critères d'avancement." }
];

function renderArticles() {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const theme  = document.getElementById("filterTheme")?.value || "";
  const filtered = ARTICLES_DATA.filter(a => {
    const ms = !search || a.titre.toLowerCase().includes(search) || a.extrait.toLowerCase().includes(search);
    const mt = !theme  || a.theme === theme;
    return ms && mt;
  });
  if (!filtered.length) {
    grid.innerHTML = `<div class="smallmuted" style="grid-column:1/-1;padding:32px 0;text-align:center;opacity:.6;">Aucun résultat trouvé.</div>`;
    return;
  }
  grid.innerHTML = filtered.map(a => {
    const locked = a.acces === "membre" && !isMember();
    return `
      <article class="card articleCard">
        <div class="articleMeta">
          <span class="articleTag${locked ? " locked" : ""}">${a.theme}</span>
          <span class="articleDate">${locked ? "🔒 Adhérents" : "Accès public"}</span>
        </div>
        <div class="articleTitle">${locked ? "🔒 " : ""}${a.titre}</div>
        <p class="articleExcerpt">${locked ? "Accédez à ce contenu en devenant adhérent PRO POLICE." : a.extrait}</p>
        ${locked ? `<div class="row" style="margin-top:12px;"><button class="btn small primary" onclick="document.getElementById('adhesion').scrollIntoView({behavior:'smooth'})">Débloquer</button></div>` : ""}
      </article>`;
  }).join("");
}

// ═══════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════

document.addEventListener("keydown", e => { if (e.key === "Escape") fermerPopup(); });

// ═══════════════════════════════════════════════════════════════════════
// BLOC FUSION — Fonctions UX / Ressources / Actus / JSON (depuis ancien script)
// ═══════════════════════════════════════════════════════════════════════

// ── Sélecteurs DOM ──────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const grid = $("#resourceGrid");
const searchInput = $("#resourceSearchInput") || $("#searchInput");
const tagSelect = $("#resourceTagSelect") || $("#tagSelect");
const resetBtn = $("#resourceResetBtn") || $("#resetBtn");
const yearEl = $("#year");
const toast = $("#resourceToast") || $("#toast");
const planLabel = $("#planLabel");

if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Ressources statiques (fallback si resources.json absent) ────────
const ressources = [
  {
    id: "fiche-discipline-001",
    title: "Procédure disciplinaire : les 5 réflexes à avoir immédiatement",
    desc: "Une fiche simple, claire et utile pour éviter les erreurs les plus fréquentes dès les premiers échanges avec l'administration.",
    tags: ["discipline", "juridique"],
    access: "public",
    url: "fiche-discipline.html"
  },
  {
    id: "modele-courrier-001",
    title: "Modèle : demande de communication de pièces",
    desc: "Demande structurée et courtoise pour obtenir des documents RH/administratifs.",
    tags: ["juridique", "carriere"],
    access: "membre"
  },
  {
    id: "fiche-mutation-001",
    title: "Fiche : mobilité & mutation (méthode)",
    desc: "Anticiper, constituer le dossier, chronologie et erreurs fréquentes.",
    tags: ["mobilite", "carriere"],
    access: "public"
  },
  {
    id: "fiche-conges-001",
    title: "Fiche : congés (cadre général)",
    desc: "Principes, points d'attention, questions à poser à la hiérarchie.",
    tags: ["conges"],
    access: "public"
  },
  {
    id: "taj-001",
    title: "Note : TAJ (repères administratifs)",
    desc: "Comprendre les enjeux, demander l'accès, organiser un dossier.",
    tags: ["juridique"],
    access: "membre"
  },
  {
    id: "carriere-001",
    title: "Synthèse : avancement & trajectoire",
    desc: "Stratégie de dossier, arguments factuels, communication professionnelle.",
    tags: ["carriere"],
    access: "public"
  }
];

// ── Génération SVG miniature ─────────────────────────────────────────
function thumbSvg(seed) {
  const a = (seed.charCodeAt(0) * 13) % 360;
  const b = (seed.charCodeAt(seed.length - 1) * 17) % 360;
  const sid = seed.replace(/[^a-z0-9]/gi, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g${sid}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="hsl(${a} 90% 55% / .22)"/>
        <stop offset="1" stop-color="hsl(${b} 90% 55% / .10)"/>
      </linearGradient>
      <radialGradient id="r${sid}" cx="30%" cy="20%" r="80%">
        <stop offset="0" stop-color="rgba(255,255,255,.18)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="900" height="500" fill="url(#g${sid})"/>
    <circle cx="260" cy="160" r="240" fill="url(#r${sid})"/>
    <path d="M-20 390 C 220 310, 420 520, 920 360 L 920 520 L -20 520 Z" fill="rgba(255,255,255,.06)"/>
    <g fill="rgba(255,255,255,.85)" font-family="Inter, system-ui" font-weight="700">
      <text x="44" y="86" font-size="28">Université PRO POLICE</text>
      <text x="44" y="125" font-size="18" fill="rgba(255,255,255,.65)">Ressource • ${seed}</text>
    </g>
  </svg>`;
}

// ── Labels thématiques ───────────────────────────────────────────────
function labelTag(t) {
  const map = {
    discipline: "Discipline",
    carriere: "Carrière",
    mobilite: "Mobilité",
    conges: "Congés",
    juridique: "Juridique"
  };
  return map[t] || t;
}

// ── Overlay lock contenu premium ─────────────────────────────────────
function renderPremiumLock(el, r) {
  if (r.access === "membre" && !isMember()) {
    el.classList.add("locked");
    const lock = document.createElement("div");
    lock.className = "lockOverlay";
    lock.innerHTML = `
      <div class="lockContent">
        <p>🔒 Contenu réservé aux adhérents</p>
        <a href="#adhesion" class="btn small primary">Débloquer</a>
      </div>`;
    el.appendChild(lock);
  }
}

// ── Rendu grille ressources ──────────────────────────────────────────
function render(liste) {
  if (!grid) return;
  grid.innerHTML = "";
  if (!liste.length) {
    grid.innerHTML = `<div class="card" style="grid-column:1/-1"><h3>Aucun résultat</h3><p>Essaie un autre mot-clé ou remets le filtre sur "Tous".</p></div>`;
    return;
  }
  for (const r of liste) {
    const locked = r.access === "membre" && !isMember();
    const actionButton = locked
      ? `<div class="lockContent"><p>🔒 Contenu réservé aux adhérents</p><a href="#adhesion" class="btn small primary" onclick="fermerPopup()">Débloquer</a></div>`
      : (r.url
          ? `<a class="linkBtn" href="${r.url}" target="_blank">Ouvrir</a>`
          : `<button class="linkBtn" data-open="${r.id}">Ouvrir</button>`);
    const el = document.createElement("article");
    el.className = "card resource";
    el.innerHTML = `
      <div class="thumb" aria-hidden="true">${thumbSvg(r.id)}</div>
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <div class="tags">
        ${r.tags.map(t => `<span class="tag">${labelTag(t)}</span>`).join("")}
        <span class="tag">${r.access === "membre" ? "Accès membre" : "Accès public"}</span>
      </div>
      <div class="actions">
        ${actionButton}
        <button class="linkBtn" data-copy="${r.id}">Copier l'ID</button>
      </div>`;
    renderPremiumLock(el, r);
    grid.appendChild(el);
  }
}

// ── Filtrage ressources ──────────────────────────────────────────────
function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const tag = tagSelect?.value || "all";
  const filtered = ressources.filter(r => {
    const matchText = !q || (r.title + " " + r.desc + " " + r.tags.join(" ")).toLowerCase().includes(q);
    const matchTag = tag === "all" || r.tags.includes(tag);
    return matchText && matchTag;
  });
  render(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (tagSelect)   tagSelect.addEventListener("change", applyFilters);
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (tagSelect) tagSelect.value = "all";
    applyFilters();
  });
}

if (grid) {
  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const openId = btn.getAttribute("data-open");
    const copyId = btn.getAttribute("data-copy");
    if (openId) {
      const found = ressources.find(r => r.id === openId);
      if (found?.access === "membre" && !isMember()) {
        document.getElementById("adhesion")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      alert(`Démo : ouverture de la ressource "${openId}".`);
    }
    if (copyId) {
      await navigator.clipboard.writeText(copyId);
      showToast("ID copié dans le presse-papiers ✅");
    }
  });
}

// ── Toast notification ───────────────────────────────────────────────
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.display = "none"; }, 2800);
}

// ── Menu mobile ──────────────────────────────────────────────────────
const menuBtnUX = document.getElementById("menuBtn");
const menuMobileUX = document.getElementById("menuMobile");
if (menuBtnUX && menuMobileUX) {
  menuBtnUX.addEventListener("click", () => {
    const expanded = menuBtnUX.getAttribute("aria-expanded") === "true";
    menuBtnUX.setAttribute("aria-expanded", String(!expanded));
    menuMobileUX.classList.toggle("open", !expanded);
  });
  menuMobileUX.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuBtnUX.setAttribute("aria-expanded", "false");
      menuMobileUX.classList.remove("open");
    });
  });
}

// ── Sélection forfait tarifaire ──────────────────────────────────────
let selectedPlan = "Adhérent";
document.querySelectorAll("[data-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPlan = btn.getAttribute("data-plan");
    if (planLabel) planLabel.innerHTML = `Plan choisi : <strong>${selectedPlan}</strong> (modifiable)`;
    document.getElementById("adhesion")?.scrollIntoView({ behavior: "smooth" });
  });
});

// ── Formulaire adhésion ──────────────────────────────────────────────
const adhForm = document.getElementById("adhForm");
if (adhForm) {
  adhForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(adhForm);
    const payload = Object.fromEntries(fd.entries());
    payload.plan = selectedPlan;
    const key = "propolice_adhesion_demo";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...payload, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    adhForm.reset();
    showToast("Demande enregistrée (démo locale) ✅ — à connecter à un email/CRM.");
  });
}

// ── Blocs Actualités ─────────────────────────────────────────────────
const actus = [
  {
    title: "Actu et agenda",
    desc: "Historique, annonces, rubriques officielles.",
    url: "https://propolice.fr/index.php/accueil/actu-et-agenda"
  },
  {
    title: "Nos articles",
    desc: "Tracts, communiqués, articles.",
    url: "https://www.propolice.fr/index.php/accueil/actu-et-agenda/article-category-blog-2"
  },
  {
    title: "Nos vidéos",
    desc: "Sélection de vidéos PRO POLICE.",
    url: "https://www.propolice.fr/index.php/accueil/actu-et-agenda/nos-videos"
  }
];

function renderActus() {
  const g = document.getElementById("actuGrid");
  if (!g) return;
  g.innerHTML = "";
  for (const a of actus) {
    const el = document.createElement("article");
    el.className = "card resource";
    el.innerHTML = `
      <div class="thumb" aria-hidden="true">${thumbSvg(a.title)}</div>
      <h3>${a.title}</h3>
      <p>${a.desc}</p>
      <div class="actions">
        <a class="linkBtn" href="${a.url}" target="_blank" rel="noopener">Ouvrir</a>
      </div>`;
    g.appendChild(el);
  }
}

// ── Bouton mode adhérent ─────────────────────────────────────────────
function updateMemberButton() {
  const btnMember = document.getElementById("btnMember");
  if (!btnMember) return;
  btnMember.textContent = isMember() ? "Mode adhérent ON" : "Mode adhérent OFF";
  btnMember.classList.toggle("active", isMember());
}

// ── Chargement JSON dynamique ─────────────────────────────────────────
async function getJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur chargement : ${path}`);
  return await res.json();
}

function normalizeListData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

async function loadSiteSettings() {
  try {
    const site = await getJSON("content/data/site.json");
    document.title = `${site.brand.name} — Syndicat • Université PRO POLICE`;
    document.querySelectorAll(".brandname").forEach(el => el.textContent = site.brand.name || el.textContent);
    document.querySelectorAll(".brandsub").forEach((el, i) => {
      if (i < 2) el.textContent = site.brand.subtitle || el.textContent;
    });
    const badge = document.querySelector(".badge");
    if (badge) badge.textContent = site.brand.hero_badge || badge.textContent;
    const h1 = document.querySelector(".heroLeft h1");
    if (h1) h1.textContent = site.brand.tagline || h1.textContent;
    const lead = document.querySelector(".lead");
    if (lead) lead.textContent = site.brand.hero_lead || lead.textContent;
    const ctas = document.querySelectorAll(".ctaRow .btn");
    if (ctas[0]) ctas[0].textContent = site.brand.cta_primary || ctas[0].textContent;
    if (ctas[1]) ctas[1].textContent = site.brand.cta_secondary || ctas[1].textContent;
    const metaCards = document.querySelectorAll(".metaCard");
    (site.homepage?.meta_cards || []).forEach((card, i) => {
      if (metaCards[i]) {
        const t = metaCards[i].querySelector(".metaTitle");
        const d = metaCards[i].querySelector(".metaText");
        if (t) t.textContent = card.title || "";
        if (d) d.textContent = card.text || "";
      }
    });
    const adhTitle = document.querySelector("#adhesion .sectionHead h2");
    if (adhTitle) adhTitle.textContent = site.adhesion?.title || adhTitle.textContent;
    const adhIntro = document.querySelector("#adhesion .sectionHead p");
    if (adhIntro) adhIntro.textContent = site.adhesion?.intro || adhIntro.textContent;
  } catch (err) {
    console.warn("loadSiteSettings:", err);
  }
}

async function loadResourcesFromJSON() {
  try {
    const loaded = normalizeListData(await getJSON("content/data/resources.json"));
    if (loaded.length) {
      ressources.length = 0;
      loaded.forEach(item => ressources.push(item));
    }
  } catch (err) {
    console.warn("loadResourcesFromJSON:", err);
  } finally {
    applyFilters();
  }
}

async function loadArticlesCards() {
  try {
    const data = normalizeListData(await getJSON("content/data/articles.json"));
    if (!data.length) return;
    const container = document.getElementById("articlesGrid");
    if (!container) return;
    container.innerHTML = "";
    data.forEach(a => {
      const locked = a.acces === "membre" && !isMember();
      const el = document.createElement("article");
      el.className = "card articleCard";
      el.innerHTML = `
        <div class="articleMeta">
          <span class="articleTag${locked ? " locked" : ""}">${a.theme || ""}</span>
          <span class="articleDate">${locked ? "🔒 Adhérents" : "Accès public"}</span>
        </div>
        <div class="articleTitle">${locked ? "🔒 " : ""}${a.titre || a.title || ""}</div>
        <p class="articleExcerpt">${locked ? "Accédez à ce contenu en devenant adhérent PRO POLICE." : (a.extrait || a.excerpt || "")}</p>
        ${locked ? `<div class="row" style="margin-top:12px;"><button class="btn small primary" onclick="document.getElementById('adhesion').scrollIntoView({behavior:'smooth'})">Débloquer</button></div>` : ""}`;
      container.appendChild(el);
    });
  } catch (err) {
    console.warn("loadArticlesCards:", err);
  }
}

// ── DOMContentLoaded — INIT COMPLÈTE (fusion V4.0 + UX) ─────────────
document.addEventListener("DOMContentLoaded", () => {

  // Bouton adhérent
  updateMemberButton();
  const btnMember = document.getElementById("btnMember");
  if (btnMember) {
    btnMember.addEventListener("click", () => {
      if (isMember()) localStorage.removeItem("propolice_member");
      else localStorage.setItem("propolice_member", "true");
      updateMemberButton();
      window.location.reload();
    });
  }

  // Actus, JSON, ressources
  renderActus();
  loadSiteSettings();
  loadResourcesFromJSON();
  loadArticlesCards();

  // Gestion toggle zone IR / OM
  const typeZone = document.getElementById("typeZone");
  const blocOM   = document.getElementById("blocOM");
  const blocIR   = document.getElementById("zone");

  function toggleZone() {
    if (!typeZone || !blocOM || !blocIR) return;
    if (typeZone.value === "outremer") {
      blocOM.style.display = "block";
      if (blocIR.parentElement) blocIR.parentElement.style.display = "none";
    } else {
      blocOM.style.display = "none";
      if (blocIR.parentElement) blocIR.parentElement.style.display = "block";
    }
  }

  typeZone?.addEventListener("change", toggleZone);
  toggleZone();

  // Année footer
  const yearElDom = document.getElementById("year");
  if (yearElDom) yearElDom.textContent = new Date().getFullYear();

  // Init simulateur primes (grade/échelon)
  const gradeSelect = document.getElementById("grade");
  const updateAll = () => { updateEchelonMax(); remplirEchelons(); };
  updateAll();
  gradeSelect?.addEventListener("change", updateAll);

  // Filtres articles
  document.getElementById("filterTheme")?.addEventListener("change", renderArticles);
  renderArticles();
});
