console.log("📱 SIMULATEUR MOBILE MULTI-GRILLES OK");

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

  // 🔥 Normalisation (TRÈS IMPORTANT)
  const corpsClean = corps?.trim().toUpperCase();
  const aff = affectation?.trim().toLowerCase();

  let salaireBase = 0;

  // ========================
  // 🔵 CALCUL BASE
  // ========================
  if (corpsClean === "CRS") {

    const gradeBDD =
      grade === "bc_norm" ? "bcn" :
      grade === "bc_sup" ? "bcs" :
      grade;

    const data = BDD_CRS[gradeBDD] || BDD_CRS["gpx"];
    const IM = data?.[echelon]?.IM || 0;

    salaireBase = IM * BDD_CRS.valeur_point;

  } else {

    // CEA
    salaireBase = getBrutBase(corps, grade, echelon);
  }

  // 🔒 Sécurité
  if (!salaireBase || salaireBase === 0) {
    console.error("❌ Salaire base invalide");
    return;
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
  // 🔵 INDEMNITÉ RÉSIDENCE
  // ========================
  const tauxIR = parseFloat(zone) / 100;
  const IR = salaireBase * tauxIR;

  // ========================
  // 🔵 ICSS (CRS uniquement)
  // ========================
  let ICSS = 0;

  if (corpsClean === "CRS") {
    ICSS = (aff === "paris") ? 145 : 113.32;
  }

  // ========================
  // 🔵 BRUT
  // ========================
  const brut = salaireBase + ISSP + IR + ICSS;

  // ========================
  // 🔵 CHARGES
  // ========================
  let tauxCharges;

  if (corpsClean === "CRS") {
    tauxCharges = 0.158; // calibré fin CRS
  } else {
    tauxCharges = 0.15;
  }

  const net = brut * (1 - tauxCharges);

  // ========================
  // 🔵 AFFICHAGE
  // ========================
  document.getElementById("resultatMobile").innerHTML = `
    <div>
      💰 Base : ${salaireBase.toFixed(2)} €<br>
      📈 ISSP : ${ISSP.toFixed(2)} €<br>
      🏠 IR : ${IR.toFixed(2)} €<br>
      🚓 ICSS : ${ICSS.toFixed(2)} €<br>
      <strong>➡️ Net estimé : ${net.toFixed(2)} €</strong><br>
      💸 Brut : ${brut.toFixed(2)} €
    </div>
  `;
}
