console.log("🤝 PRO POLICE - Module Adhérer V3");

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

  "Administratif Catégorie C": 30,
  "Administratif Catégorie B": 40,
  "Administratif Catégorie A": 50,

  "Technique Catégorie C": 30,
  "Technique Catégorie B": 40,
  "Technique Catégorie A": 50,

  "Scientifique Catégorie C": 30,
  "Scientifique Catégorie B": 40,
  "Scientifique Catégorie A": 50,

  "Réserviste": 20,

  "Retraité": 20

};

/* ==========================
   CHARGEMENT
========================== */

document.addEventListener("DOMContentLoaded", () => {

  remplirGrades();

  gererTypeAdhesion();

  gererModeCouple();

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

  const grades = Object.keys(cotisations);

  grades.forEach(grade => {

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
   TYPE ADHÉSION
========================== */

function gererTypeAdhesion() {

  const radios =
    document.querySelectorAll(
      'input[name="typeAdhesion"]'
    );

  const bloc =
    document.getElementById(
      "blocCouple"
    );

  radios.forEach(radio => {

    radio.addEventListener("change", () => {

      const valeur =
        document.querySelector(
          'input[name="typeAdhesion"]:checked'
        ).value;

      bloc.style.display =
        valeur === "couple"
          ? "block"
          : "none";

      calculerMontant();

    });

  });

}

/* ==========================
   MODE COUPLE
========================== */

function gererModeCouple() {

  const radios =
    document.querySelectorAll(
      'input[name="modeCouple"]'
    );

  const formulaireConjoint =
    document.getElementById(
      "formulaireConjoint"
    );

  radios.forEach(radio => {

    radio.addEventListener("change", () => {

      const mode =
        document.querySelector(
          'input[name="modeCouple"]:checked'
        ).value;

      formulaireConjoint.style.display =
        mode === "commun"
          ? "block"
          : "none";

      calculerMontant();

    });

  });

}

/* ==========================
   CALCUL MONTANT
========================== */

function calculerMontant() {

  const resultat =
    document.getElementById(
      "montantCotisation"
    );

  const gradePrincipal =
    document.getElementById(
      "gradePrincipal"
    );

  if (!resultat || !gradePrincipal)
    return;

  const montantPrincipal =
    cotisations[
      gradePrincipal.value
    ] || 0;

  const type =
    document.querySelector(
      'input[name="typeAdhesion"]:checked'
    )?.value;

  let total =
    montantPrincipal;

  if (type === "couple") {

    const mode =
      document.querySelector(
        'input[name="modeCouple"]:checked'
      )?.value;

    if (mode === "individuel") {

      total =
        montantPrincipal / 2;

    }

    if (mode === "commun") {

      const gradeConjoint =
        document.getElementById(
          "gradeConjoint"
        );

      const montantConjoint =
        cotisations[
          gradeConjoint.value
        ] || 0;

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

  }

  resultat.textContent =
    total.toFixed(2) + " €";

}

/* ==========================
   COPIE IBAN
========================== */

function activerCopieIBAN() {

  const btn =
    document.getElementById(
      "copyIban"
    );

  if (!btn) return;

  btn.addEventListener("click", () => {

    const iban =
      document.getElementById(
        "iban"
      )
      .textContent
      .trim();

    navigator.clipboard.writeText(
      iban
    );

    btn.textContent =
      "✅ IBAN copié";

    setTimeout(() => {

      btn.textContent =
        "📋 Copier l'IBAN";

    }, 2500);

  });

}
