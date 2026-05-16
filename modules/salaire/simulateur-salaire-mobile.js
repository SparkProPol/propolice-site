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

  const data = BDD_CRS.actif[gradeBDD] || BDD_CRS.actif["gpx"];
  const index = Math.max(0, Math.min(data.echelons.length - 1, echelon - 1));
  const IM = data.echelons[index];

  salaireBase = IM * BDD_CRS.valeur_point;

} else {

  // CEA → utiliser même logique que simulateur principal
  salaireBase = getBrutBase(corps, grade, echelon);

}

  let tauxISSP;

if (corps === "CRS") {
  tauxISSP = 0.285;
} else {
  if (affectation === "paris") tauxISSP = 0.31;
  else tauxISSP = 0.255;
}

const ISSP = salaireBase * tauxISSP;
  const tauxIR = parseFloat(zone) / 100;
const indemniteResidence = salaireBase * tauxIR;

let ICSS = 0;

if (corps === "CRS") {
  ICSS = 113.33;
}

const total = salaireBase + ISSP + indemniteResidence + ICSS;

  document.getElementById("resultatMobile").innerHTML = `
  <div>
    💰 Base : ${salaireBase.toFixed(2)} €<br>
    📈 ISSP : ${ISSP.toFixed(2)} €<br>
    🏠 IR : ${indemniteResidence.toFixed(2)} €<br>
    🚓 ICSS : ${ICSS.toFixed(2)} €<br>
    <strong>➡️ Total : ${total.toFixed(2)} €</strong>
  </div>
`;
}
