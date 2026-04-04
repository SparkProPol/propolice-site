const BDD = {

  valeur_point: 4.92278,

  zones: {
    0: 0,
    1: 0.03,
    2: 0.01
  },

  corps: {

    // ===================== ACTIF =====================
    actif: {

      gardien: {
        label: "Gardien de la paix",
        issp: 0.20,
        echelons: {1:366,2:376,3:388,4:401,5:415,6:431,7:448,8:466}
      },

      bc_cn: {
        label: "Brigadier-chef (classe normale)",
        issp: 0.22,
        echelons: {1:483,2:499,3:515,4:532,5:548}
      },

      bc_cs: {
        label: "Brigadier-chef (classe supérieure)",
        issp: 0.22,
        echelons: {1:565,2:585,3:605}
      },

      major: {
        label: "Major",
        issp: 0.24,
        echelons: {1:478,2:489,3:508,4:518,5:528,6:548,7:565}
      }

    },

    // ===================== CRS =====================
    crs: {

      gardien: {
        label: "Gardien CRS",
        issp: 0.285,
        echelons: {1:366,2:376,3:388,4:401,5:415,6:431,7:448,8:466}
      },

      bc_cn: {
        label: "Brigadier-chef CRS (classe normale)",
        issp: 0.285,
        echelons: {1:483,2:499,3:515,4:532,5:548}
      },

      bc_cs: {
        label: "Brigadier-chef CRS (classe supérieure)",
        issp: 0.285,
        echelons: {1:565,2:585,3:605}
      },

      major: {
        label: "Major CRS",
        issp: 0.285,
        echelons: {1:478,2:489,3:508,4:518,5:528,6:548,7:565}
      }

    },

    // ===================== ADMINISTRATIF =====================
    administratif: {

      adjoint: {
        label: "Adjoint administratif",
        echelons: {1:366,2:375,3:385,4:395,5:405}
      },

      adjoint_principal_2: {
        label: "Adjoint administratif principal 2e classe",
        echelons: {1:385,2:395,3:405,4:415,5:425}
      },

      adjoint_principal_1: {
        label: "Adjoint administratif principal 1re classe",
        echelons: {1:405,2:415,3:425,4:435,5:445}
      },

      secretaire_cn: {
        label: "Secrétaire administratif (classe normale)",
        echelons: {1:390,2:410,3:430,4:450,5:470}
      },

      secretaire_cs: {
        label: "Secrétaire administratif (classe supérieure)",
        echelons: {1:470,2:490,3:510,4:530,5:550}
      },

      secretaire_exceptionnel: {
        label: "Secrétaire administratif (classe exceptionnelle)",
        echelons: {1:550,2:570,3:590}
      },

      attache: {
        label: "Attaché",
        echelons: {1:444,2:470,3:500,4:530,5:560}
      },

      attache_principal: {
        label: "Attaché principal",
        echelons: {1:600,2:640,3:680}
      },

      attache_hors_classe: {
        label: "Attaché hors classe",
        echelons: {1:700,2:750,3:800}
      },

      caiom: {
        label: "CAIOM",
        echelons: {1:830,2:890,3:950}
      }

    },

    // ===================== PTS =====================
    pts: {

      adjoint_technique: {
        label: "Adjoint technique",
        echelons: {1:366,2:375,3:385,4:395}
      },

      adjoint_technique_principal: {
        label: "Adjoint technique principal",
        echelons: {1:385,2:395,3:405,4:415}
      },

      controleur: {
        label: "Contrôleur technique",
        echelons: {1:410,2:430,3:450,4:470}
      },

      ingenieur_technique: {
        label: "Ingénieur technique",
        echelons: {1:500,2:550,3:600}
      },

      agent_pts: {
        label: "Agent spécialisé PTS",
        echelons: {1:366,2:375,3:385}
      },

      technicien_pts: {
        label: "Technicien PTS",
        echelons: {1:400,2:420,3:440,4:460}
      },

      technicien_principal_pts: {
        label: "Technicien principal PTS",
        echelons: {1:460,2:480,3:500}
      },

      ingenieur_pts: {
        label: "Ingénieur PTS",
        echelons: {1:500,2:550,3:600}
      },

      ingenieur_principal_pts: {
        label: "Ingénieur principal PTS",
        echelons: {1:600,2:650,3:700}
      }

    }

  },

  // ===================== RETRAITE (HORS CORPS) =====================
  retraite: {
    taux: 0.75,
    decote: 0.0125,
    surcote: 0.0125,
    minimum: 1200,
    categories: {
      actif: { bonification: 0.2 },
      administratif: { bonification: 0 },
      pts: { bonification: 0 }
    }
  }

};
