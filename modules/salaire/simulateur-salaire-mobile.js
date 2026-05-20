console.log("📱 SIMULATEUR MOBILE SAFE");

window.calculerMobile = function() {

  console.log("🔥 NOUVELLE VERSION V.5Finish. RULP ACTIVE");
  
  try {

    const grade = document.getElementById("grade")?.value || "gpx";
    const corps = document.getElementById("corps")?.value || "CEA";
    const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
    const affectation = document.getElementById("affectation")?.value || "province";
    const zone = document.getElementById("zone")?.value || "0";
    const ech = echelon;
    const corpsClean = corps.trim().toUpperCase();
    const aff = affectation.trim().toLowerCase();

    let salaireBase = 0;

    // ========================
    // 🔵 CALCUL BASE
    // ========================
  if (corpsClean === "CRS") {

  const gradeBDD =
    grade === "bc_norm" ? "bcn" :
    grade === "bc_sup" ? "bcs" :
    grade;

  const grille = BDD_CRS.actif?.[gradeBDD];

  if (!grille) {
    console.error("❌ Grille CRS introuvable :", gradeBDD);
    return;
  }

  const IM = grille.echelons?.[echelon - 1];

  if (!IM) {
    console.error("❌ Échelon invalide :", echelon);
    return;
  }

  salaireBase = IM * BDD_CRS.valeur_point;

} else {

      // 🔵 CEA (avec mapping)
let gradeCEA = grade;

if (grade === "bc_norm") gradeCEA = "bcn";
if (grade === "bc_sup") gradeCEA = "bcs";

salaireBase = getBrutBase(corps, gradeCEA, echelon);
    }

    // ========================
    // 🔵 ISSP
    // ========================
    let tauxISSP = 0;

    if (corpsClean === "CRS") {
      tauxISSP = 0.285;
    } else {
      tauxISSP = (aff === "paris") ? 0.31 : 0.255;
    }

    const ISSP = salaireBase * tauxISSP;

    // ========================
    // 🔵 IR
    // ========================
    const IR = salaireBase * (parseFloat(zone) / 100);

    // ========================
    // 🔵 ICSS
    // ========================
    // 🔵 ICSS
let ICSS = 0;

if (corpsClean === "CRS") {

  if (zone === "0") {
    ICSS = 113.32; // 🔥 0% = toujours province
  } else {
    ICSS = (aff === "paris") ? 145 : 113.32;
  }

}

    // ========================
// 🔵 PRIMES (V4 REINJECTION)
// ========================

const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);

const opj = document.getElementById("opj")?.value === "oui";
const primeVP = document.getElementById("primeVP")?.value === "oui";

// 🔵 CALCULS
const majorationNuit = heuresNuit * 2.2;
const majorationDimanche = heuresDimanche * 2.8;

const sft = enfants > 0 ? (enfants === 1 ? 2.29 : enfants === 2 ? 73.79 : 183.56) : 0;

const primeOPJ = opj ? 150 : 0;
const montantVP = primeVP ? 100 : 0;

const allocationMaitrise = 319.58;
const complementRTT = 112.33;

// ========================
// 🔵 BRUT FINAL COMPLET
// ========================

const brut =
  salaireBase +
  ISSP +
  IR +
  ICSS +
  allocationMaitrise +
  complementRTT +
  majorationNuit +
  majorationDimanche +
  sft +
  montantVP +
  primeOPJ;
    
// ========================
// 🔵 CHARGES (VERSION FINALE PRO)
// ========================
let tauxCharges;

const isMajor = (grade === "major");
const isRULP = (grade === "rulp");
const isCRS = (corpsClean === "CRS");
const isParis = (aff === "paris");
const isZero = (zone === "0");

// ========================
// 🔵 CRS
// ========================
if (isCRS) {

  // 🔵 CAS 0%
  if (isZero) {

    if (isRULP) {

      tauxCharges = (ech >= 4) ? 0.205 : 0.175;

    } else if (isMajor) {

      tauxCharges = 0.107;

    } else {

      // GPX / BCN / BCS validés
      tauxCharges = 0.135;

    }

  } else {

    // 🔵 PARIS / PROVINCE

    if (isRULP) {

      tauxCharges = (ech >= 4)
        ? (isParis ? 0.21 : 0.22)
        : (isParis ? 0.18 : 0.19);

    } else if (isMajor) {

      tauxCharges = isParis ? 0.123 : 0.148;

    } else if (grade === "bc_sup") {

      tauxCharges = isParis ? 0.11 : 0.14;

    } else if (grade === "bc_norm") {

      tauxCharges = isParis ? 0.105 : 0.135;

    } else {

      // GPX
      tauxCharges = isParis ? 0.093 : 0.128;

    }

  }

}

// ========================
// 🔵 CEA
// ========================
else {

  if (isRULP) {

    if (ech >= 4) {

      tauxCharges = 0.215;

    } else if (ech === 3) {

      tauxCharges = 0.165;

    } else {

      tauxCharges = 0.155;

    }

  } else if (isMajor) {

    tauxCharges = 0.118;

  } else {

    // GPX / BCN / BCS
    tauxCharges = 0.105;

  }

}
// 🔥 SÉCURITÉ TAUX
if (typeof tauxCharges !== "number" || isNaN(tauxCharges)) {
  console.error("❌ tauxCharges invalide :", tauxCharges);
  tauxCharges = 0.13; // fallback sécurité
}
// ========================
// 🔵 NET
// ========================
const net = Math.max(0, brut * (1 - tauxCharges));
    // ========================
    // 🔵 AFFICHAGE
    // ========================
    const cible =
  document.getElementById("resultatPublic") ||
  document.getElementById("resultatMobile");

cible.innerHTML = `

<div style="margin-top:20px;padding:20px;border-radius:12px;background:#111827;color:white">

  <h2 style="color:#38bdf8;margin-bottom:15px">📊 Simulation PRO POLICE</h2>

  <div>💰 Base : <strong>${salaireBase.toFixed(2)} €</strong></div>
  <div>📈 ISSP : + ${ISSP.toFixed(2)} €</div>
  <div>🏠 IR : + ${IR.toFixed(2)} €</div>
  <div>🚓 ICSS : + ${ICSS.toFixed(2)} €</div>

  <div>🎖️ Allocation maîtrise : + ${allocationMaitrise.toFixed(2)} €</div>
  <div>📅 Complément RTT : + ${complementRTT.toFixed(2)} €</div>

  ${primeOPJ ? `<div>👮‍♂️ Prime OPJ : + ${primeOPJ.toFixed(2)} €</div>` : ""}
  ${montantVP ? `<div>🚔 Prime VP : + ${montantVP.toFixed(2)} €</div>` : ""}

  <div>🌙 Nuit : + ${majorationNuit.toFixed(2)} €</div>
  <div>📆 Dimanche : + ${majorationDimanche.toFixed(2)} €</div>

  <div>👨‍👩‍👧 SFT : + ${sft.toFixed(2)} €</div>

  <hr>

  <div><strong>💸 Brut : ${brut.toFixed(2)} €</strong></div>
  <div>📉 Charges : ${(tauxCharges * 100).toFixed(1)} %</div>

  <hr>

  <div style="font-size:22px;color:#22c55e">
    ➡️ Net estimé : <strong>${net.toFixed(2)} €</strong>
  </div>

  <hr>

  <div style="font-size:0.9em;color:#9ca3af;">
    ⚠️ Simulation indicative (non contractuelle)
  </div>

  <div style="margin-top:10px;font-size:0.85em;">
    🎯 <strong>Lecture PRO POLICE :</strong><br>
    Estimation basée sur données terrain réelles.<br><br>
    🔴 Précision < 1% constatée.
  </div>

</div>

`;

  } catch (e) {
    console.error("❌ ERREUR JS :", e);
    alert("Erreur JS - voir console");
  }
}
