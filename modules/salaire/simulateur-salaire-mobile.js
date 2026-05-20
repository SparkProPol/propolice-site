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
    // 🔵 BRUT
    // ========================
    const brut = salaireBase + ISSP + IR + ICSS;
    
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

  <h2 style="margin-bottom:15px;color:#38bdf8">
    📊 Simulation détaillée
  </h2>

  <div style="margin-bottom:10px">
    💰 <strong>Base indiciaire :</strong> ${salaireBase.toFixed(2)} €
  </div>

  <div style="margin-bottom:10px">
    📈 <strong>ISSP :</strong> ${ISSP.toFixed(2)} €
  </div>

  <div style="margin-bottom:10px">
    🏠 <strong>Indemnité de résidence :</strong> ${IR.toFixed(2)} €
  </div>

  <div style="margin-bottom:10px">
    🚓 <strong>ICSS :</strong> ${ICSS.toFixed(2)} €
  </div>

  <hr style="margin:15px 0;border:1px solid #374151">

  <div style="margin-bottom:10px">
    💸 <strong>Brut total :</strong> ${brut.toFixed(2)} €
  </div>

  <div style="margin-bottom:10px">
    📉 <strong>Taux de charges :</strong> ${(tauxCharges * 100).toFixed(1)} %
  </div>

  <hr style="margin:15px 0;border:1px solid #374151">

  <div style="font-size:22px;color:#22c55e">
    ➡️ <strong>Net estimé : ${net.toFixed(2)} €</strong>
  </div>

  <hr style="margin:20px 0;border:1px solid #374151">

  <div style="font-size:12px;color:#9ca3af">
    ⚠️ Simulation indicative à caractère informatif (non contractuelle)
  </div>

</div>

`;

  } catch (e) {
    console.error("❌ ERREUR JS :", e);
    alert("Erreur JS - voir console");
  }
}
