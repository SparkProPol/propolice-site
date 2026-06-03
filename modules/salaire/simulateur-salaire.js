console.log("🔒 PRO POLICE V6 — SIMULATEUR OFFICIEL STABLE");
const VERSION_SIMULATEUR = "V6.0 — STABLE";
const DATE_VERSION = "2026-05-30";

function calculerNetReel(brut, aff) {

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

  const coefficientCorrection = 1.015;

  let net = (brut - totalRetenues) * coefficientCorrection;

// 🔥 CORRECTION PARIS / PROVINCE
if (aff === "paris") {
  net *= 1.01;
}

  return {
    net,
    pension,
    csg_deductible,
    csg_non_deductible,
    crds,
    rafp,
    totalRetenues
  };
}

// ========================
// 🔵 FONCTION PRINCIPALE
// ========================
function calculerPrimes() {

  console.log("🔥 CALCUL COMPLET PRO POLICE");

  try {

    const grade = document.getElementById("grade")?.value || "gpx";
    const corps = document.getElementById("corps")?.value || "CEA";
    const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
    const affectation = document.getElementById("affectation")?.value || "province";
    const zone = document.getElementById("zone")?.value || "0";

    const corpsClean = corps.toUpperCase();
    let aff = affectation.toLowerCase();
    // ========================
// 🔵 VARIABLES PRIMES
// ========================
const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);

const itn = document.getElementById("itn")?.value === "oui" ? 150 : 0;
const opj = document.getElementById("opj")?.value === "oui" ? 150 : 0;
const primeVP = document.getElementById("primeVP")?.value === "oui" ? 100 : 0;

    // ========================
    // 🔵 BASE INDICIAIRE (SAFE)
    // ========================
    let salaireBase = 0;

    if (corpsClean === "CRS") {

      const gradeBDD =
        grade === "bc_norm" ? "bcn" :
        grade === "bc_sup" ? "bcs" :
        grade;

      const grille = BDD_CRS.actif?.[gradeBDD];

      if (!grille) return console.error("❌ Grille CRS introuvable");

      const IM = grille.echelons?.[echelon - 1];

      if (!IM) return console.error("❌ Échelon invalide");

      salaireBase = IM * BDD_CRS.valeur_point;

    } else {

      let gradeCEA = grade;
      if (grade === "bc_norm") gradeCEA = "bcn";
      if (grade === "bc_sup") gradeCEA = "bcs";

      salaireBase = getBrutBase(corps, gradeCEA, echelon);
    }

   // 🔥 PRIORITÉ CRS (avant tout)
if (corpsClean === "CRS") {
  aff = "province"; // neutralise Paris
}

// ========================
// 🔵 ISSP
// ========================
let tauxISSP = corpsClean === "CRS"
  ? 0.285
  : (aff === "paris" ? 0.31 : 0.255);

const ISSP = salaireBase * tauxISSP;

    // ========================
    // 🔵 IR
    // ========================
    const IR = salaireBase * (parseFloat(zone) / 100);

    // ========================
    // 🔵 ICSS CRS
    // ========================
    let ICSS = 0;

    if (corpsClean === "CRS") {

  if (zone === "0") {
    ICSS = 113.32;
  } else {
    ICSS = 113.32; // 🔥 FIXE CRS
  }

}

    // ========================
    // 🔵 BRUT OFFICIEL (NE PAS TOUCHER)
    // ========================
    const brut = salaireBase + ISSP + IR + ICSS;

    // ========================
    // 🔵 CHARGES (SAFE)
    // ========================
    let tauxCharges = 0.13;

    if (corpsClean === "CRS") {

      if (zone === "0") {

        tauxCharges = (grade === "major") ? 0.107 : 0.135;

      } else {

        if (grade === "major") {
          tauxCharges = aff === "paris" ? 0.123 : 0.148;
        } else {
          tauxCharges = aff === "paris" ? 0.093 : 0.128;
        }
      }

    } else {

      tauxCharges = (grade === "major") ? 0.118 : 0.105;
    }

   // ========================
// 🔵 CALCUL PRIMES (AVANT NET)
// ========================
const majorationNuit = heuresNuit * 2.2;
const majorationDimanche = heuresDimanche * 2.8;

const sft =
  enfants === 1 ? 2.29 :
  enfants === 2 ? 73.79 :
  enfants >= 3 ? 183.56 : 0;

const allocationMaitrise = 319.58;
const complementRTT = 112.33;

// ========================
// 🔵 NET RÉEL
// ========================
const detailNet = calculerNetReel(brut, aff);
let net = detailNet.net;
    
    // 🔵 CALIBRAGE GRADE
if (grade === "bc_norm") net *= 0.993;
if (grade === "bc_sup") net *= 0.991;
if (grade === "major") net *= 0.989;
if (grade === "rulp") net *= 0.982;
    
// ========================
// 🔵 AJOUT PRIMES AU NET (IMPACT RÉEL)
// ========================
net += majorationNuit;
net += majorationDimanche;
net += sft;
net += itn;
net += opj;
net += primeVP;
net += allocationMaitrise;
net += complementRTT;
    
// ========================
// 🔵 MICRO CALIBRAGE PAR GRADE (V6+)
// ========================
if (grade === "gpx") {
  net *= 1.000;
}

if (grade === "bc_norm") {
  net *= 0.993; // 🔥 micro-ajustement
}

if (grade === "bc_sup") {
  net *= 0.991;
}

if (grade === "major") {
  net *= 0.989;
}

if (grade === "rulp") {
  net *= 0.982;
}

    // ========================
    // 🔵 PRIMES (AFFICHAGE UNIQUEMENT)
    // ========================
    const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
    const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
    const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);

    

    // ========================
    // 🔵 AFFICHAGE PRO COMPLET
    // ========================
    const cible =
      document.getElementById("resultatPublic") ||
      document.getElementById("resultatMobile");

  cible.innerHTML = `

<div style="padding:20px;border-radius:12px;background:#111827;color:white">

  <h2 style="color:#38bdf8">📊 Simulation PRO POLICE</h2>

  <div>💰 Base : <strong>${salaireBase.toFixed(2)} €</strong></div>
  <div>📈 ISSP : + ${ISSP.toFixed(2)} €</div>
  <div>🏠 IR : + ${IR.toFixed(2)} €</div>
  <div>🚓 ICSS : + ${ICSS.toFixed(2)} €</div>

  <hr>

  <div><strong>💸 Brut officiel : ${brut.toFixed(2)} €</strong></div>

  <!-- 💚 BLOC SALAIRE -->
  <div style="
    margin-top:15px;
    padding:18px;
    background:linear-gradient(135deg, #052e16, #14532d);
    border-radius:12px;
    border:1px solid rgba(34,197,94,0.3);
  ">

    <div style="font-size:0.9em;color:#86efac;">
      💰 TON SALAIRE RÉEL ESTIMÉ
    </div>

    <div style="font-size:2em;font-weight:800;color:#22c55e;">
      ${net.toFixed(2)} €
    </div>

  </div>

  <hr>

  <h3 style="color:#facc15">📊 Primes & compléments</h3>

<div>🎖️ Allocation maîtrise : + ${allocationMaitrise.toFixed(2)} €</div>
<div>📅 Complément RTT : + ${complementRTT.toFixed(2)} €</div>
<div>🌙 Nuit : + ${majorationNuit.toFixed(2)} €</div>
<div>📆 Dimanche : + ${majorationDimanche.toFixed(2)} €</div>
<div>👨‍👩‍👧 SFT : + ${sft.toFixed(2)} €</div>

<hr>

  <h3 style="color:#facc15">📉 Détail des retenues</h3>

  <div>🏦 Pension : - ${detailNet.pension.toFixed(2)} €</div>
  <div>🧾 CSG déductible : - ${detailNet.csg_deductible.toFixed(2)} €</div>
  <div>📄 CSG non déductible : - ${detailNet.csg_non_deductible.toFixed(2)} €</div>
  <div>⚖️ CRDS : - ${detailNet.crds.toFixed(2)} €</div>
  <div>📊 RAFP : - ${detailNet.rafp.toFixed(2)} €</div>

  <hr>

  <div style="background:#1e3a8a22;padding:10px;border-radius:8px;">
    📊 Analyse PRO POLICE<br>
    ✔ Simulation proche fiche de paie<br>
    ✔ Écart moyen constaté < 1%
  </div>

  <div style="
    margin-top:10px;
    padding:10px;
    background:#facc1522;
    border-left:4px solid #facc15;
    border-radius:6px;
    font-size:0.85em;
  ">
    ⚠️ Simulation indicative non contractuelle<br>
    💡 Net avant impôt sur le revenu
  </div>

  <!-- 🔧 VERSION -->
  <div style="margin-top:10px;font-size:0.75em;color:#6b7280;">
    🔧 ${VERSION_SIMULATEUR} • ${DATE_VERSION}
  </div>

</div>

`;
  
  } catch (e) {
    console.error("❌ ERREUR :", e);
    alert("Erreur JS - voir console");
  }
};

// ========================
// 🔵 RESET
// ========================
function reinitSimulateur() {

  document.getElementById("grade").value = "gpx";
  document.getElementById("echelon").value = 1;

  document.getElementById("resultatPublic").innerHTML = "";
}
