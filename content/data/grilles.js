const BDD = {

  valeur_point: 4.92278,

  zones: {
    0: 0,
    1: 0.03,
    2: 0.01
  },

  corps: {

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

    crs: {
      gardien: {
        label: "Gardien CRS",
        issp: 0.285,
        echelons: {1:366,2:376,3:388,4:401,5:415,6:431,7:448,8:466}
      },
      bc_cn: {
  label: "Brigadier-chef CRS (classe normale)",
  issp: 0.285,
  echelons: {...}
},

bc_cs: {
  label: "Brigadier-chef CRS (classe supérieure)",
  issp: 0.285,
  echelons: {...}
},
      major: {
        label: "Major CRS",
        issp: 0.285,
        echelons: {1:478,2:489,3:508,4:518,5:528,6:548,7:565}
      }
    },

    administratif: {
      adjoint: {
        label: "Adjoint administratif",
        echelons: {1:366,2:375,3:385}
      },
      secretaire: {
        label: "Secrétaire administratif",
        echelons: {1:390,2:410,3:430}
      }
    },

    pts: {
      technicien: {
        label: "Technicien PTS",
        echelons: {1:400,2:420,3:440}
      }
    },

    retraite: {
      taux: 0.75
    }

  }
};
