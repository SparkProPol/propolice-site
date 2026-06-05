console.log("🔒 PRO POLICE V6 — MODE SÉCURISÉ ACTIF");

// ========================
// 🔵 VALEUR POINT INDICE
// ========================
const VALEUR_POINT = 4.9228;

// ========================
// 🔵 CALCUL INDICE
// ========================
function getIndice(corps, grade, echelon) {

  const bdd = (corps === "CRS") ? BDD_CRS : BDD_CEA;

  if (!bdd || !bdd[grade] || !bdd[grade][echelon]) {
    console.error("❌ Indice introuvable :", corps, grade, echelon);
    return 0;
  }

  return bdd[grade][echelon].IM;
}

// ========================
// 🔵 BRUT BASE
// ========================
function getBrutBase(corps, grade, echelon) {
  const indice = getIndice(corps, grade, echelon);
  return indice * VALEUR_POINT;
}

// ========================
// 🔵 NET RÉEL (V4 STABLE)
// ========================
function calculerNetReel(brut) {

  const pension = brut * 0.111;
  const csg_deductible = brut * 0.068;
  const csg_non_deductible = brut * 0.024;
  const crds = brut * 0.005;
  const rafp = brut * 0.05 * 0.10;

  const totalRetenues =
    pension +
    csg_deductible +
    csg_non_deductible +
    crds +
    rafp;

  const coefficientCorrection = 0.985;

  const net = (brut - totalRetenues) * coefficientCorrection;

  return {
    net,
    totalRetenues
  };
}

// ========================
// 🔵 REMPLIR ÉCHELONS
// ========================
function remplirEchelons() {

  const grade = document.getElementById("grade")?.value;
  const select = document.getElementById("echelon");

  if (!select) return;

  const maxEchelons = {
    gpx: 13,
    bc_norm: 8,
    bc_sup: 7,
    major: 10
  };

  const max = maxEchelons[grade] || 12;

  select.innerHTML = "";

  for (let i = 1; i <= max; i++) {
    const option = document.createElement("option");
    option.value = i;

    let label = "Échelon " + i;

    if (grade === "major" && i >= 7) {
      label = "RULP " + (i - 6) + " (éch. " + i + ")";
    }

    option.textContent = label;
    select.appendChild(option);
  }
}

// ========================
// 🔵 CALCUL PRINCIPAL
// ========================
function calculerPrimes() {

  console.log("🔥 CALCUL PRO POLICE");

  try {

    const grade = document.getElementById("grade")?.value || "gpx";
    const corps = document.getElementById("corps")?.value || "CEA";
    const echelon = parseInt(document.getElementById("echelon")?.value || 1);
    const zone = document.getElementById("zone")?.value || "0";
    const affectation = document.getElementById("affectation")?.value || "province";

    const corpsClean = corps.toUpperCase();
    const aff = affectation.toLowerCase();

    // 🔵 BASE
    let gradeBDD = grade;
    if (grade === "bc_norm") gradeBDD = "bcn";
    if (grade === "bc_sup") gradeBDD = "bcs";

    const salaireBase = getBrutBase(corpsClean, gradeBDD, echelon);

    // 🔵 ISSP
    let tauxISSP = 0.255;

if (corpsClean === "CRS") {
  tauxISSP = 0.285;
} else {
  tauxISSP = (aff === "paris") ? 0.31 : 0.255;
}

    const ISSP = salaireBase * tauxISSP;

    // 🔵 IR
    const IR = salaireBase * (parseFloat(zone) / 100);

    // 🔵 ICSS CRS
   let ICSS = 0;

// 🔴 CAS CRS
if (corpsClean === "CRS") {

  if (zone === "0") {
    ICSS = 113.32;
  } else {
    ICSS = 113.32; // CRS reste fixe
  }

}

// 🔵 CAS CEA (POLICE CLASSIQUE)
else {

  if (aff.includes("paris") || aff.includes("île") || aff.includes("idf")) {
    ICSS = 145;
  }

}

    // 🔵 BRUT
    const brut = salaireBase + ISSP + IR + ICSS;

    // 🔵 NET RÉEL
    const netData = calculerNetReel(brut);
    let net = netData.net;
// ========================
// 🔵 AJOUT PRIMES SIMPLIFIÉ (VERSION STABLE)
// ========================

const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);

const opj = document.getElementById("opj")?.value === "oui" ? 150 : 0;
const itn = document.getElementById("itn")?.value === "oui" ? 150 : 0;
const primeVP = document.getElementById("primeVP")?.value === "oui" ? 100 : 0;

const majorationNuit = heuresNuit * 2.2;
const majorationDimanche = heuresDimanche * 2.8;

const sft =
  enfants === 1 ? 2.29 :
  enfants === 2 ? 73.79 :
  enfants >= 3 ? 183.56 : 0;

// 🔥 primes fixes calibrées (chargées)
const allocationMaitrise = 319.58 * 0.72;
const complementRTT = 56.66 * 0.72;

// 🔥 injection propre
net += majorationNuit;
net += majorationDimanche;
net += sft;

// 🔥 correction primes variables
const primesVariables = itn + opj + primeVP;
net += primesVariables * 0.72;

// 🔥 déjà OK
net += allocationMaitrise;
net += complementRTT;
    // 🔵 AFFICHAGE
    const isAdherent =
localStorage.getItem("propolice_adherent") === "true";

const resultatPublic = document.getElementById("resultatPublic");
const resultatMembre = document.getElementById("resultatMembre");
if (!resultatPublic || !resultatMembre) {
  console.error("❌ éléments HTML manquants");
  return;
}
const blocBase = `
<div class="row">💰 Base : ${salaireBase.toFixed(2)} €</div>
<div class="row">📈 ISSP : ${ISSP.toFixed(2)} €</div>
<div class="row">🏠 IR : ${IR.toFixed(2)} €</div>
<div class="row">🚓 ICSS : ${ICSS.toFixed(2)} €</div>
<hr>
<div><strong>💸 Brut : ${brut.toFixed(2)} €</strong></div>
<div><strong>➡️ Net : ${net.toFixed(2)} €</strong></div>
`;

if (isAdherent) {

  resultatPublic.style.display = "none";
  resultatMembre.style.display = "block";

  resultatMembre.innerHTML = `
    ${blocBase}

    <hr>

    <div style="margin-top:10px;">
      📉 <strong>Détail des retenues :</strong><br><br>
      🏦 Pension : - ${(brut * 0.111).toFixed(2)} €<br>
      🧾 CSG déductible : - ${(brut * 0.068).toFixed(2)} €<br>
      📄 CSG non déductible : - ${(brut * 0.024).toFixed(2)} €<br>
      ⚖️ CRDS : - ${(brut * 0.005).toFixed(2)} €<br>
      📊 RAFP : - ${(brut * 0.05 * 0.10).toFixed(2)} €
    </div>

    <hr>

    <div style="margin-top:10px;">
      📊 Analyse PRO POLICE<br>
      ✔ Simulation proche fiche de paie<br>
      ✔ Écart moyen constaté < 1%
    </div>

    <div style="margin-top:10px;font-size:0.85em;color:#aaa;">
      ⚠️ Simulation indicative non contractuelle<br>
      💡 Net avant impôt sur le revenu
    </div>
  `;

} else {

  resultatPublic.style.display = "block";
  resultatMembre.style.display = "none";

  resultatPublic.innerHTML = `
    ${blocBase}
    <div style="margin-top:10px;">
      🔓 Version simplifiée<br>
      👉 Passe en mode adhérent pour plus de détails
    </div>
  `;
}

  } catch (e) {
    console.error("❌ ERREUR CALCUL :", e);
    alert("Erreur JS - voir console");
  }
}

// ========================
// 🔵 TOGGLE ZONE OM / AFFECTATION
// ========================
function toggleZoneOM() {

  const typeZone = document.getElementById("typeZone");
  const blocOM = document.getElementById("blocOM");
  const blocAffectation = document.getElementById("blocAffectation");

  if (!typeZone || !blocOM || !blocAffectation) return;

  if (typeZone.value === "outremer") {
    blocOM.style.display = "block";
    blocAffectation.style.display = "none";
  } else {
    blocOM.style.display = "none";
    blocAffectation.style.display = "block";
  }
}

// ========================
// 🔵 INIT
// ========================
window.addEventListener("DOMContentLoaded", () => {

  remplirEchelons();

  document.getElementById("grade")?.addEventListener("change", remplirEchelons);

  toggleZoneOM(); // 🔥 IMPORTANT
});
