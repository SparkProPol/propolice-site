console.log("🤝 Module Adhérer chargé");

/* ==========================
   BARÈME PRO POLICE
========================== */

const cotisations = {
  "Cadet": 10,
  "Policier Adjoint": 10,
  "Élève GPX": 20,
  "GPX": 30,
  "Brigadier-Chef": 50,
  "Major": 60,

  "Catégorie C": 30,
  "Catégorie B": 40,
  "Catégorie A": 50,

  "Retraité": 20
};

/* ==========================
   CHARGEMENT PAGE
========================== */

document.addEventListener("DOMContentLoaded", () => {

  remplirGrades();
  activerCouple();
  calculerMontant();
  activerCopieIBAN();

});

/* ==========================
   LISTE DES GRADES
========================== */

function remplirGrades() {

  const gradePrincipal =
    document.getElementById("gradePrincipal");

  const gradeConjoint =
    document.getElementById("gradeConjoint");

  if (!gradePrincipal) return;

  Object.keys(cotisations).forEach(grade => {

    const option1 =
      document.createElement("option");

    option1.value = grade;
    option1.textContent = grade;

    gradePrincipal.appendChild(option1);

    if (gradeConjoint) {

      const option2 =
        document.createElement("option");

      option2.value = grade;
      option2.textContent = grade;

      gradeConjoint.appendChild(option2);

    }

  });

  gradePrincipal.addEventListener(
    "change",
    calculerMontant
  );

  if (gradeConjoint) {

    gradeConjoint.addEventListener(
      "change",
      calculerMontant
    );

  }

}

/* ==========================
   MODE COUPLE
========================== */

function activerCouple() {

  const checkbox =
    document.getElementById("coupleCheck");

  const bloc =
    document.getElementById("blocCouple");

  if (!checkbox || !bloc) return;

  checkbox.addEventListener("change", () => {

    bloc.style.display =
      checkbox.checked
        ? "block"
        : "none";

    calculerMontant();

  });

}

/* ==========================
   CALCUL COTISATION
========================== */

function calculerMontant() {

  const gradePrincipal =
    document.getElementById("gradePrincipal");

  const gradeConjoint =
    document.getElementById("gradeConjoint");

  const couple =
    document.getElementById("coupleCheck");

  const resultat =
    document.getElementById("montantCotisation");

  if (!gradePrincipal || !resultat) return;

  const montantPrincipal =
    cotisations[gradePrincipal.value] || 0;

  let total =
    montantPrincipal;

  if (
    couple &&
    couple.checked &&
    gradeConjoint
  ) {

    const montantConjoint =
      cotisations[gradeConjoint.value] || 0;

    const reduction =
      Math.min(
        montantPrincipal,
        montantConjoint
      ) * 0.5;

    total =
      montantPrincipal +
      montantConjoint -
      reduction;

  }

  resultat.textContent =
    total.toFixed(2) + " €";

}

/* ==========================
   COPIE IBAN
========================== */

function activerCopieIBAN() {

  const btn =
    document.getElementById("copyIban");

  if (!btn) return;

  btn.addEventListener("click", () => {

    const iban =
      document.getElementById("iban")
      .textContent
      .trim();

    navigator.clipboard.writeText(iban);

    btn.textContent =
      "✅ IBAN copié";

    setTimeout(() => {

      btn.textContent =
        "📋 Copier l'IBAN";

    }, 2500);

  });

}
