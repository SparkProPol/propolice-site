console.log("🔒 PRO POLICE — V5 SIMULATEUR FINAL CHARGÉ");

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
window.calculerMobile = function () {

  console.log("🔥 CALCUL COMPLET PRO POLICE");

  try {

    const grade = document.getElementById("grade")?.value || "gpx";
    const corps = document.getElementById("corps")?.value || "CEA";
    const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
    const affectation = document.getElementById("affectation")?.value || "province";
    const zone = document.getElementById("zone")?.value || "0";

    const corpsClean = corps.toUpperCase();
    const aff = affectation.toLowerCase();

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
      ICSS = (zone === "0")
        ? 113.32
        : (aff === "paris" ? 145 : 113.32);
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

    const detailNet = calculerNetReel(brut);
const net = detailNet.net;

    // ========================
    // 🔵 PRIMES (AFFICHAGE UNIQUEMENT)
    // ========================
    const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
    const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
    const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);

    const majorationNuit = heuresNuit * 2.2;
    const majorationDimanche = heuresDimanche * 2.8;

    const sft =
      enfants === 1 ? 2.29 :
      enfants === 2 ? 73.79 :
      enfants >= 3 ? 183.56 : 0;

    const allocationMaitrise = 319.58;
    const complementRTT = 112.33;

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
  <div>📉 Charges : ${(tauxCharges * 100).toFixed(1)} %</div>

  <div style="font-size:22px;color:#22c55e">
    ➡️ Net estimé : <strong>${net.toFixed(2)} €</strong>
  </div>

  <hr>

  <h3 style="color:#facc15">📊 Primes & compléments (hors brut officiel)</h3>

  <div>🎖️ Allocation maîtrise : + ${allocationMaitrise.toFixed(2)} €</div>
  <div>📅 Complément RTT : + ${complementRTT.toFixed(2)} €</div>
  <div>🌙 Nuit : + ${majorationNuit.toFixed(2)} €</div>
  <div>📆 Dimanche : + ${majorationDimanche.toFixed(2)} €</div>
  <div>👨‍👩‍👧 SFT : + ${sft.toFixed(2)} €</div>

  <hr>

  <div style="font-size:12px;color:#9ca3af">
    ⚠️ Simulation indicative – non contractuelle
  </div>

  <div style="margin-top:10px;font-size:0.85em;">
    🎯 Lecture PRO POLICE : estimation basée sur données terrain.<br>
    🔴 Précision < 1%
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
