const BDD = {
  valeur_point: 4.92278,

  zones: {
    "0": 0,
    "1": 0.01,
    "3": 0.03
  },

  charges: {
    csg: 0.092,
    crds: 0.005
  },

  corps: {
    actif: {
      gpx: {
        label: "Gardien de la paix",
        issp: 0.285,
        irm: 0.01,
        echelons: {1:410,2:421,3:436,4:453,5:470,6:478,7:489,8:508}
      },

      bc_cn: {
        label: "Brigadier-chef classe normale",
        issp: 0.285,
        irm: 0.01,
        echelons: {1:515,2:535,3:549,4:567}
      },

      bc_cs: {
        label: "Brigadier-chef classe supérieure",
        issp: 0.285,
        irm: 0.01,
        echelons: {1:579,2:615,3:640,4:660}
      },

      major: {
        label: "Major",
        issp: 0.285,
        irm: 0.40,
        echelons: {1:478,2:489,3:508,4:518,5:528,6:548,7:565}
      }
    },

   crs: JSON.parse(JSON.stringify({
  gardien: {
    label: "Gardien de la paix",
    issp: 0.285,
    echelons: {1:366,2:376,3:388,4:401,5:415,6:431,7:448,8:466}
  },
  brigadier_chef: {
    label: "Brigadier-chef",
    issp: 0.285,
    echelons: {1:483,2:499,3:515,4:532,5:548,6:565}
  },
  major: {
    label: "Major",
    issp: 0.285,
    echelons: {1:478,2:489,3:508,4:518,5:528,6:548,7:565}
  }
}))

    administratif: {},

    pts: {},

    retraite: {
      taux: 0.75
    }
  }
};
