console.log("📱 SIMULATEUR MOBILE MULTI-GRILLES CHARGÉ");

// 🔥 Calcul mobile
function calculerMobile() {

  const grade = document.getElementById("grade")?.value || "gpx";
  const corps = document.getElementById("corps")?.value || "CEA";
  const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
  const affectation = document.getElementById("affectation")?.value || "province";
  const zone = document.getElementById("zone")?.value || "0";
console.log("CORPS =", corps);
console.log("AFFECTATION =", affectation);
console.log("ZONE =", zone);
  let salaireBase;

if (corps === "CRS") {

  const gradeBDD =
    grade === "bc_norm" ? "bcn" :
    grade === "bc_sup" ? "bcs" :
    grade;

  const data = BDD_CRS[gradeBDD] || BDD_CRS["gpx"];
const IM = data?.[echelon]?.IM || 0;

  salaireBase = IM * BDD_CRS.valeur_point;
  if (!salaireBase || salaireBase === 0) {
  console.error("❌ Salaire base invalide");
  return;
}

} else {

  // CEA → utiliser même logique que simulateur principal
  salaireBase = getBrutBase(corps, grade, echelon);

}

let tauxISSP;

if (corps === "CRS") {
  tauxISSP = 0.285;
} else {
  if (affectation === "paris") {
    tauxISSP = 0.31;
  } else {
    tauxISSP = 0.255;
  }
}

// 🔥 charges réalistes police
let tauxCharges;

if (corps === "CRS") {
  tauxCharges = 0.158; // calibré fin CRS
} else {
  tauxCharges = 0.15;
}

const ISSP = salaireBase * tauxISSP;
  const tauxIR = parseFloat(zone) / 100;
const indemniteResidence = salaireBase * tauxIR;

let ICSS = 0;

if (corps?.trim().toUpperCase() === "CRS") {

  const aff = affectation?.trim().toLowerCase();

  if (aff === "paris") {
    ICSS = 145;
  } else {
    ICSS = 113.32;
  }
}

const brut = salaireBase + ISSP + indemniteResidence + ICSS;
  
const net = brut * (1 - tauxCharges);
  document.getElementById("resultatMobile").innerHTML = `
  <div>
    💰 Base : ${salaireBase.toFixed(2)} €<br>
    📈 ISSP : ${ISSP.toFixed(2)} €<br>
    🏠 IR : ${indemniteResidence.toFixed(2)} €<br>
    🚓 ICSS : ${ICSS.toFixed(2)} €<br>
    <strong>➡️ Net estimé : ${net.toFixed(2)} €</strong><br>
    💸 Brut : ${brut.toFixed(2)} €
  </div>
`;
}
