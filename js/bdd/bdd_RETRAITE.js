const BDD_RETRAITE = {
  taux: 0.75,
  decote: 0.0125,
  surcote: 0.0125,
  minimum: 1200,
  age_depart: { actif: 57, sedentaire: 62 },
  categories: {
    actif: { bonification: 0.2, label: "Corps actif (CEA, CRS)" },
    administratif: { bonification: 0, label: "Personnel administratif" },
    pts: { bonification: 0, label: "Personnel technique & scientifique" }
  }
};
