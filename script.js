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

  const coefficientCorrection = 1.05;

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
    if (corpsClean === "CRS") tauxISSP = 0.285;
    else if (aff === "paris") tauxISSP = 0.31;

    const ISSP = salaireBase * tauxISSP;

    // 🔵 IR
    const IR = salaireBase * (parseFloat(zone) / 100);

    // 🔵 ICSS CRS
    let ICSS = 0;
    if (corpsClean === "CRS") {
      ICSS = (zone === "0") ? 113.32 : 145;
    }

    // 🔵 BRUT
    const brut = salaireBase + ISSP + IR + ICSS;

    // 🔵 NET RÉEL
    const netData = calculerNetReel(brut);
    const net = netData.net;

    // 🔵 AFFICHAGE
    const cible = document.getElementById("resultatPublic");

    cible.innerHTML = `
      <div style="padding:15px;background:#111827;color:white;border-radius:10px">

        <h3>📊 Simulation PRO POLICE</h3>

        💰 Base : ${salaireBase.toFixed(2)} €<br>
        📈 ISSP : ${ISSP.toFixed(2)} €<br>
        🏠 IR : ${IR.toFixed(2)} €<br>
        🚓 ICSS : ${ICSS.toFixed(2)} €<br>

        <hr>

        💸 Brut : ${brut.toFixed(2)} €<br>
        ➡️ <strong>Net estimé : ${net.toFixed(2)} €</strong>

      </div>
    `;

  } catch (e) {
    console.error("❌ ERREUR CALCUL :", e);
    alert("Erreur JS - voir console");
  }
}

// ========================
// 🔵 INIT
// ========================
window.addEventListener("DOMContentLoaded", () => {

  remplirEchelons();

  document.getElementById("grade")?.addEventListener("change", remplirEchelons);

});
