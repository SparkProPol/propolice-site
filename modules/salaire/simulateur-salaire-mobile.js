console.log("📱 SIMULATEUR MOBILE SAFE");

function calculerMobile() {

  try {

    const grade = document.getElementById("grade")?.value || "gpx";
    const corps = document.getElementById("corps")?.value || "CEA";
    const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
    const affectation = document.getElementById("affectation")?.value || "province";
    const zone = document.getElementById("zone")?.value || "0";

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
// 🔵 CHARGES
// ========================
let tauxCharges;

const isMajor = (grade === "major");
const isCRS = (corpsClean === "CRS");
const isParis = (aff === "paris");
const isZero = (zone === "0");

if (isCRS) {

  if (isZero) {

    // 🔥 CRS 0%
    if (isMajor) {
      tauxCharges = 0.107; // 🔧 affiné
    } else {
      tauxCharges = 0.135;
    }

  } else {

    if (isMajor) {

      // 🔥 CRS MAJOR
      tauxCharges = isParis ? 0.123 : 0.148; // 🔧 affiné

    } else if (grade === "bc_sup") {

      tauxCharges = isParis ? 0.11 : 0.14;

    } else if (grade === "bc_norm") {

      tauxCharges = isParis ? 0.105 : 0.135;

    } else {

      // 🔥 GPX
      tauxCharges = isParis ? 0.093 : 0.128;

    }

  }

} else {

  // 🔵 CEA
  tauxCharges = isMajor ? 0.118 : 0.105; // 🔧 affiné

}

const net = brut * (1 - tauxCharges);
    // ========================
    // 🔵 AFFICHAGE
    // ========================
    document.getElementById("resultatMobile").innerHTML =
      "<div>" +
      "💰 Base : " + salaireBase.toFixed(2) + " €<br>" +
      "📈 ISSP : " + ISSP.toFixed(2) + " €<br>" +
      "🏠 IR : " + IR.toFixed(2) + " €<br>" +
      "🚓 ICSS : " + ICSS.toFixed(2) + " €<br>" +
      "<strong>➡️ Net estimé : " + net.toFixed(2) + " €</strong><br>" +
      "💸 Brut : " + brut.toFixed(2) + " €</div>";

  } catch (e) {
    console.error("❌ ERREUR JS :", e);
    alert("Erreur JS - voir console");
  }
}
