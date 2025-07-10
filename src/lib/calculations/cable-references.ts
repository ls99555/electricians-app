/**
 * Cable & Conductor Reference Data
 * Comprehensive UK electrical cable reference information
 * Based on BS 7671:2018+A2:2022 Appendix 4 and cable manufacturer data
 * 
 * IMPORTANT DISCLAIMERS:
 * - Reference data provided for guidance only and does not constitute professional advice
 * - Always verify with current BS 7671 and manufacturer specifications
 * - Professional electrical work must be carried out by competent persons
 * - Regulations and standards change - always check current versions
 * - Cable selection must consider all relevant factors including environmental conditions
 * 
 * LEGAL COMPLIANCE:
 * - All data referenced from BS 7671:2018+A2:2022 Appendix 4
 * - Cable ratings based on standard installation conditions
 * - Derating factors must be applied for specific installations
 * - Professional verification required for all cable selections
 */

// BS 7671 Reference Methods for cable installation
export const CABLE_INSTALLATION_METHODS = {
  'A1': {
    description: 'Insulated conductors in conduit in thermally insulating wall',
    note: 'Single-core or multicore cables in conduit, surrounded by thermal insulation',
    applicationNote: 'Use for insulated wall installations',
    deratingRequired: true,
    thermalResistance: 'High'
  },
  'A2': {
    description: 'Insulated conductors in conduit on wall or spaced from wall',
    note: 'Single-core or multicore cables in conduit, not surrounded by thermal insulation',
    applicationNote: 'Surface mounted conduit installations',
    deratingRequired: false,
    thermalResistance: 'Standard'
  },
  'B1': {
    description: 'Insulated conductors in trunking in thermally insulating wall',
    note: 'Single-core or multicore cables in trunking, surrounded by thermal insulation',
    applicationNote: 'Use for insulated wall trunking installations',
    deratingRequired: true,
    thermalResistance: 'High'
  },
  'B2': {
    description: 'Insulated conductors in trunking on wall or spaced from wall',
    note: 'Single-core or multicore cables in trunking, not surrounded by thermal insulation',
    applicationNote: 'Surface mounted trunking installations',
    deratingRequired: false,
    thermalResistance: 'Standard'
  },
  'C': {
    description: 'Multicore cable direct on wall or spaced from wall',
    note: 'Cable clipped direct to surface or on cable tray',
    applicationNote: 'Standard clipped direct installation',
    deratingRequired: false,
    thermalResistance: 'Good'
  },
  'D1': {
    description: 'Multicore cable in duct in ground',
    note: 'Single cable in duct in ground',
    applicationNote: 'Underground installations in duct',
    deratingRequired: true,
    thermalResistance: 'Variable'
  },
  'D2': {
    description: 'Multicore cable direct in ground',
    note: 'Cable buried directly in ground',
    applicationNote: 'Direct burial installations',
    deratingRequired: true,
    thermalResistance: 'Good'
  },
  'E': {
    description: 'Multicore cable in free air',
    note: 'Cable suspended in free air with adequate ventilation',
    applicationNote: 'Overhead installations with good ventilation',
    deratingRequired: false,
    thermalResistance: 'Excellent'
  },
  'F': {
    description: 'Single-core cables touching (flat formation)',
    note: 'Three single-core cables touching in flat formation',
    applicationNote: 'Three-phase installations with single-core cables',
    deratingRequired: false,
    thermalResistance: 'Good'
  },
  'G': {
    description: 'Single-core cables touching (trefoil formation)',
    note: 'Three single-core cables touching in trefoil formation',
    applicationNote: 'Preferred formation for three-phase single-core cables',
    deratingRequired: false,
    thermalResistance: 'Better'
  }
};

// Cable current carrying capacity tables (BS 7671 Appendix 4)
// Based on 70mm PVC insulated copper conductors at 30°C ambient
export const CABLE_CURRENT_RATINGS = {
  // PVC insulated copper conductors (70°C)
  'PVC_70C': {
    description: 'PVC insulated copper conductors (70°C operating temperature)',
    standard: 'BS 7671 Table 4D1A',
    ambientTemp: 30, // °C
    operatingTemp: 70, // °C
    ratings: {
      '1.0': {
        refMethodA1: 11, refMethodA2: 13, refMethodB1: 11, refMethodB2: 14,
        refMethodC: 16, refMethodD1: 14, refMethodD2: 17, refMethodE: 18,
        refMethodF: 15, refMethodG: 16
      },
      '1.5': {
        refMethodA1: 14.5, refMethodA2: 17.5, refMethodB1: 14.5, refMethodB2: 18.5,
        refMethodC: 21, refMethodD1: 19, refMethodD2: 23, refMethodE: 24,
        refMethodF: 20, refMethodG: 21
      },
      '2.5': {
        refMethodA1: 19.5, refMethodA2: 24, refMethodB1: 19.5, refMethodB2: 25,
        refMethodC: 28, refMethodD1: 26, refMethodD2: 31, refMethodE: 33,
        refMethodF: 27, refMethodG: 28
      },
      '4': {
        refMethodA1: 26, refMethodA2: 32, refMethodB1: 26, refMethodB2: 33,
        refMethodC: 37, refMethodD1: 35, refMethodD2: 42, refMethodE: 44,
        refMethodF: 36, refMethodG: 38
      },
      '6': {
        refMethodA1: 34, refMethodA2: 41, refMethodB1: 34, refMethodB2: 43,
        refMethodC: 47, refMethodD1: 45, refMethodD2: 54, refMethodE: 56,
        refMethodF: 46, refMethodG: 48
      },
      '10': {
        refMethodA1: 46, refMethodA2: 57, refMethodB1: 46, refMethodB2: 59,
        refMethodC: 64, refMethodD1: 61, refMethodD2: 73, refMethodE: 76,
        refMethodF: 63, refMethodG: 65
      },
      '16': {
        refMethodA1: 61, refMethodA2: 76, refMethodB1: 61, refMethodB2: 79,
        refMethodC: 85, refMethodD1: 81, refMethodD2: 97, refMethodE: 101,
        refMethodF: 84, refMethodG: 87
      },
      '25': {
        refMethodA1: 80, refMethodA2: 101, refMethodB1: 80, refMethodB2: 105,
        refMethodC: 112, refMethodD1: 106, refMethodD2: 127, refMethodE: 133,
        refMethodF: 110, refMethodG: 114
      },
      '35': {
        refMethodA1: 99, refMethodA2: 125, refMethodB1: 99, refMethodB2: 130,
        refMethodC: 138, refMethodD1: 131, refMethodD2: 156, refMethodE: 164,
        refMethodF: 135, refMethodG: 141
      },
      '50': {
        refMethodA1: 119, refMethodA2: 151, refMethodB1: 119, refMethodB2: 158,
        refMethodC: 167, refMethodD1: 158, refMethodD2: 189, refMethodE: 198,
        refMethodF: 164, refMethodG: 171
      },
      '70': {
        refMethodA1: 151, refMethodA2: 192, refMethodB1: 151, refMethodB2: 200,
        refMethodC: 213, refMethodD1: 201, refMethodD2: 240, refMethodE: 252,
        refMethodF: 209, refMethodG: 218
      },
      '95': {
        refMethodA1: 182, refMethodA2: 232, refMethodB1: 182, refMethodB2: 242,
        refMethodC: 258, refMethodD1: 244, refMethodD2: 291, refMethodE: 305,
        refMethodF: 253, refMethodG: 264
      },
      '120': {
        refMethodA1: 210, refMethodA2: 269, refMethodB1: 210, refMethodB2: 281,
        refMethodC: 299, refMethodD1: 283, refMethodD2: 337, refMethodE: 354,
        refMethodF: 293, refMethodG: 306
      }
    }
  },
  
  // XLPE insulated copper conductors (90°C)
  'XLPE_90C': {
    description: 'XLPE insulated copper conductors (90°C operating temperature)',
    standard: 'BS 7671 Table 4D1A',
    ambientTemp: 30, // °C
    operatingTemp: 90, // °C
    ratings: {
      '1.0': {
        refMethodA1: 13, refMethodA2: 15, refMethodB1: 13, refMethodB2: 16,
        refMethodC: 18, refMethodD1: 17, refMethodD2: 20, refMethodE: 22,
        refMethodF: 17, refMethodG: 18
      },
      '1.5': {
        refMethodA1: 17, refMethodA2: 20, refMethodB1: 17, refMethodB2: 21,
        refMethodC: 24, refMethodD1: 23, refMethodD2: 27, refMethodE: 29,
        refMethodF: 23, refMethodG: 24
      },
      '2.5': {
        refMethodA1: 23, refMethodA2: 28, refMethodB1: 23, refMethodB2: 29,
        refMethodC: 33, refMethodD1: 31, refMethodD2: 36, refMethodE: 39,
        refMethodF: 31, refMethodG: 33
      },
      '4': {
        refMethodA1: 30, refMethodA2: 37, refMethodB1: 30, refMethodB2: 38,
        refMethodC: 43, refMethodD1: 41, refMethodD2: 49, refMethodE: 52,
        refMethodF: 42, refMethodG: 44
      },
      '6': {
        refMethodA1: 39, refMethodA2: 47, refMethodB1: 39, refMethodB2: 49,
        refMethodC: 54, refMethodD1: 52, refMethodD2: 62, refMethodE: 66,
        refMethodF: 53, refMethodG: 56
      },
      '10': {
        refMethodA1: 53, refMethodA2: 65, refMethodB1: 53, refMethodB2: 68,
        refMethodC: 74, refMethodD1: 71, refMethodD2: 84, refMethodE: 89,
        refMethodF: 73, refMethodG: 76
      }
    }
  }
};

// Cable derating factors
export const DERATING_FACTORS = {
  // Ambient temperature correction factors (BS 7671 Table 4B1)
  ambientTemperature: {
    description: 'Correction factors for ambient temperature other than 30°C',
    standard: 'BS 7671 Table 4B1',
    baseTemperature: 30, // °C
    factors: {
      'PVC_70C': {
        10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
        35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
      },
      'XLPE_90C': {
        10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00,
        35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76,
        60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41
      }
    }
  },
  
  // Grouping factors (BS 7671 Table 4C1)
  grouping: {
    description: 'Reduction factors for groups of cables',
    standard: 'BS 7671 Table 4C1',
    factors: {
      'enclosed': { // In conduit, duct, trunking, etc.
        1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60,
        6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48,
        12: 0.45, 16: 0.41, 20: 0.38
      },
      'surface': { // Clipped to surface or on cable tray
        1: 1.00, 2: 0.85, 3: 0.79, 4: 0.75, 6: 0.73,
        9: 0.72, 12: 0.72, 16: 0.72, 20: 0.72
      },
      'perforatedTray': { // On perforated cable tray
        1: 1.00, 2: 0.88, 3: 0.82, 4: 0.77, 6: 0.75,
        9: 0.73, 12: 0.72, 16: 0.72, 20: 0.72
      }
    }
  },
  
  // Thermal insulation factors (BS 7671 Table 4C2)
  thermalInsulation: {
    description: 'Reduction factors for cables in thermal insulation',
    standard: 'BS 7671 Table 4C2',
    note: 'Apply when cable is completely surrounded by thermal insulation >0.5m',
    factors: {
      'completelyEnclosed': 0.5, // Cable completely surrounded for >0.5m
      'partiallyEnclosed': 0.55, // Cable in insulated wall but not completely enclosed
      'touching': 0.75 // Cable touching thermal insulation
    }
  },
  
  // Buried cable factors (BS 7671 Table 4B4)
  buriedCable: {
    description: 'Correction factors for cables direct in ground',
    standard: 'BS 7671 Table 4B4',
    soilThermalResistivity: {
      description: 'Correction factors for soil thermal resistivity',
      baseValue: 2.5, // K⋅m/W
      factors: {
        1.0: 1.18, 1.5: 1.10, 2.0: 1.05, 2.5: 1.00,
        3.0: 0.96, 3.5: 0.93, 4.0: 0.90, 5.0: 0.85
      }
    },
    depth: {
      description: 'Correction factors for depth of burial',
      baseDepth: 0.7, // metres
      factors: {
        0.5: 1.02, 0.6: 1.01, 0.7: 1.00, 0.8: 0.99,
        1.0: 0.97, 1.25: 0.95, 1.5: 0.93, 1.75: 0.91, 2.0: 0.89
      }
    }
  }
};

// Cable voltage drop values (mV/A/m)
export const VOLTAGE_DROP_VALUES = {
  description: 'Voltage drop per ampere per metre (mV/A/m)',
  standard: 'BS 7671 Table 4D1B',
  note: 'Values for two-core cables or two conductors of three-core cable',
  
  'PVC_70C': {
    twoCore: {
      '1.0': { r: 18.1, x: 0, z: 18.1 },
      '1.5': { r: 12.1, x: 0, z: 12.1 },
      '2.5': { r: 7.3, x: 0, z: 7.3 },
      '4': { r: 4.6, x: 0, z: 4.6 },
      '6': { r: 3.1, x: 0, z: 3.1 },
      '10': { r: 1.83, x: 0, z: 1.83 },
      '16': { r: 1.15, x: 0, z: 1.15 },
      '25': { r: 0.727, x: 0, z: 0.727 },
      '35': { r: 0.524, x: 0, z: 0.524 },
      '50': { r: 0.387, x: 0, z: 0.387 },
      '70': { r: 0.268, x: 0, z: 0.268 },
      '95': { r: 0.193, x: 0, z: 0.193 },
      '120': { r: 0.153, x: 0, z: 0.153 }
    },
    threeCore: {
      '1.0': { r: 18.1, x: 0, z: 18.1 },
      '1.5': { r: 12.1, x: 0, z: 12.1 },
      '2.5': { r: 7.3, x: 0, z: 7.3 },
      '4': { r: 4.6, x: 0, z: 4.6 },
      '6': { r: 3.1, x: 0, z: 3.1 },
      '10': { r: 1.83, x: 0, z: 1.83 },
      '16': { r: 1.15, x: 0, z: 1.15 },
      '25': { r: 0.727, x: 0, z: 0.727 },
      '35': { r: 0.524, x: 0, z: 0.524 },
      '50': { r: 0.387, x: 0, z: 0.387 },
      '70': { r: 0.268, x: 0, z: 0.268 },
      '95': { r: 0.193, x: 0, z: 0.193 },
      '120': { r: 0.153, x: 0, z: 0.153 }
    }
  }
};

// Armoured cable specifications
export const ARMOURED_CABLE_SPECS = {
  description: 'Steel Wire Armoured (SWA) cable specifications',
  standard: 'BS 5467',
  construction: {
    conductor: 'Copper or Aluminium',
    insulation: 'XLPE or PVC',
    armour: 'Galvanised steel wire',
    sheath: 'PVC',
    voltage: '0.6/1kV or 1.9/3.3kV'
  },
  
  currentRatings: {
    'PVC_SWA': {
      description: 'PVC insulated SWA cable current ratings',
      multicore: {
        '1.5': { refMethodD1: 19, refMethodD2: 23, refMethodC: 21 },
        '2.5': { refMethodD1: 26, refMethodD2: 31, refMethodC: 28 },
        '4': { refMethodD1: 35, refMethodD2: 42, refMethodC: 37 },
        '6': { refMethodD1: 45, refMethodD2: 54, refMethodC: 47 },
        '10': { refMethodD1: 61, refMethodD2: 73, refMethodC: 64 },
        '16': { refMethodD1: 81, refMethodD2: 97, refMethodC: 85 },
        '25': { refMethodD1: 106, refMethodD2: 127, refMethodC: 112 },
        '35': { refMethodD1: 131, refMethodD2: 156, refMethodC: 138 },
        '50': { refMethodD1: 158, refMethodD2: 189, refMethodC: 167 },
        '70': { refMethodD1: 201, refMethodD2: 240, refMethodC: 213 },
        '95': { refMethodD1: 244, refMethodD2: 291, refMethodC: 258 },
        '120': { refMethodD1: 283, refMethodD2: 337, refMethodC: 299 }
      }
    }
  },
  
  applications: [
    'Underground distribution',
    'External installations',
    'Industrial environments',
    'Where mechanical protection required',
    'Wet or damp conditions',
    'Direct burial installations'
  ]
};

// Fire performance classifications
export const FIRE_PERFORMANCE_CLASSES = {
  description: 'Cable fire performance classifications',
  standards: ['BS EN 50575', 'CPR (Construction Products Regulation)'],
  
  classes: {
    'Aca': {
      description: 'Highest fire performance',
      flameSpread: 'No contribution to fire',
      smokeProduction: 'Very limited',
      fireDroplets: 'None',
      corrosivity: 'Very low',
      toxicity: 'Very low',
      applications: ['Escape routes', 'Public buildings', 'High-rise buildings']
    },
    'B1ca': {
      description: 'Very limited contribution to fire',
      flameSpread: 'Very limited',
      smokeProduction: 'Limited',
      fireDroplets: 'None',
      corrosivity: 'Low',
      toxicity: 'Low',
      applications: ['Commercial buildings', 'Schools', 'Hospitals']
    },
    'B2ca': {
      description: 'Limited contribution to fire',
      flameSpread: 'Limited',
      smokeProduction: 'Limited',
      fireDroplets: 'None',
      corrosivity: 'Low',
      toxicity: 'Low',
      applications: ['General commercial use', 'Industrial buildings']
    },
    'Cca': {
      description: 'Standard fire performance',
      flameSpread: 'Medium',
      smokeProduction: 'Medium',
      fireDroplets: 'None',
      corrosivity: 'Low',
      toxicity: 'Low',
      applications: ['Domestic installations', 'Small commercial buildings']
    },
    'Dca': {
      description: 'Acceptable fire performance',
      flameSpread: 'Acceptable',
      smokeProduction: 'No requirement',
      fireDroplets: 'None',
      corrosivity: 'Low',
      toxicity: 'Low',
      applications: ['Industrial use', 'Underground installations']
    },
    'Eca': {
      description: 'No fire performance requirements',
      flameSpread: 'No requirement',
      smokeProduction: 'No requirement',
      fireDroplets: 'No requirement',
      corrosivity: 'No requirement',
      toxicity: 'No requirement',
      applications: ['Industrial use where fire performance not critical']
    }
  },
  
  additionalClassifications: {
    's1': 'Limited smoke production',
    's2': 'Medium smoke production',
    's3': 'High smoke production',
    'd0': 'No flaming droplets',
    'd1': 'Flaming droplets extinguish within 10 seconds',
    'd2': 'Flaming droplets persist beyond 10 seconds',
    'a1': 'Low acidity',
    'a2': 'Medium acidity',
    'a3': 'High acidity'
  }
};

// Cable resistance and reactance values
export const CABLE_ELECTRICAL_PROPERTIES = {
  description: 'Cable electrical properties at 20°C',
  standard: 'BS 7671 Appendix 4',
  temperature: 20, // °C
  
  resistance: {
    description: 'DC resistance of copper conductors at 20°C (mΩ/m)',
    copper: {
      '1.0': 18.1, '1.5': 12.1, '2.5': 7.3, '4': 4.6, '6': 3.1,
      '10': 1.83, '16': 1.15, '25': 0.727, '35': 0.524, '50': 0.387,
      '70': 0.268, '95': 0.193, '120': 0.153, '150': 0.124, '185': 0.0991,
      '240': 0.0754, '300': 0.0601, '400': 0.0470, '500': 0.0366
    },
    aluminium: {
      description: 'DC resistance of aluminium conductors at 20°C (mΩ/m)',
      '16': 1.91, '25': 1.20, '35': 0.868, '50': 0.641, '70': 0.443,
      '95': 0.320, '120': 0.253, '150': 0.206, '185': 0.164, '240': 0.125,
      '300': 0.100, '400': 0.0778, '500': 0.0605
    }
  },
  
  reactance: {
    description: 'Reactance values for cables (mΩ/m at 50Hz)',
    note: 'Values depend on cable configuration and spacing',
    singleCore: {
      touching: {
        '10': 0.13, '16': 0.12, '25': 0.11, '35': 0.10, '50': 0.10,
        '70': 0.09, '95': 0.09, '120': 0.08, '150': 0.08, '185': 0.08
      },
      spaced: {
        '10': 0.16, '16': 0.15, '25': 0.14, '35': 0.14, '50': 0.13,
        '70': 0.13, '95': 0.12, '120': 0.12, '150': 0.12, '185': 0.11
      }
    },
    multicore: {
      '1.5': 0.08, '2.5': 0.08, '4': 0.08, '6': 0.08, '10': 0.08,
      '16': 0.08, '25': 0.08, '35': 0.08, '50': 0.08, '70': 0.08
    }
  }
};

// Helper functions for cable reference lookups
export class CableReferenceHelper {
  /**
   * Get current rating for specific cable and installation method
   */
  static getCurrentRating(
    cableType: 'PVC_70C' | 'XLPE_90C',
    csa: string,
    installationMethod: string
  ): number | null {
    const cableData = CABLE_CURRENT_RATINGS[cableType];
    if (!cableData?.ratings) return null;
    
    const ratings = (cableData.ratings as any)[csa];
    if (!ratings) return null;
    
    return ratings[installationMethod] || null;
  }
  
  /**
   * Calculate total derating factor for multiple conditions
   */
  static calculateDeratingFactor(params: {
    ambientTemp?: number;
    cableType?: 'PVC_70C' | 'XLPE_90C';
    groupingMethod?: 'enclosed' | 'surface' | 'perforatedTray';
    numberOfCables?: number;
    thermalInsulation?: 'completelyEnclosed' | 'partiallyEnclosed' | 'touching' | 'none';
    soilThermalResistivity?: number;
    burialDepth?: number;
  }): { factor: number; breakdown: string[] } {
    let totalFactor = 1.0;
    const breakdown: string[] = [];
    
    // Ambient temperature correction
    if (params.ambientTemp && params.cableType) {
      const tempFactors = DERATING_FACTORS.ambientTemperature.factors[params.cableType];
      const tempFactor = this.interpolateTemperatureFactor(tempFactors, params.ambientTemp);
      totalFactor *= tempFactor;
      breakdown.push(`Ambient temp (${params.ambientTemp}°C): ${tempFactor.toFixed(3)}`);
    }
    
    // Grouping factor
    if (params.groupingMethod && params.numberOfCables) {
      const groupingFactors = DERATING_FACTORS.grouping.factors[params.groupingMethod] as any;
      const groupFactor = groupingFactors[params.numberOfCables] || 0.38;
      totalFactor *= groupFactor;
      breakdown.push(`Grouping (${params.numberOfCables} cables, ${params.groupingMethod}): ${groupFactor.toFixed(3)}`);
    }
    
    // Thermal insulation
    if (params.thermalInsulation && params.thermalInsulation !== 'none') {
      const insultationFactor = DERATING_FACTORS.thermalInsulation.factors[params.thermalInsulation];
      totalFactor *= insultationFactor;
      breakdown.push(`Thermal insulation (${params.thermalInsulation}): ${insultationFactor.toFixed(3)}`);
    }
    
    return { factor: Math.round(totalFactor * 1000) / 1000, breakdown };
  }
  
  /**
   * Get voltage drop for cable
   */
  static getVoltageDropValues(cableType: 'PVC_70C', csa: string, cores: 'twoCore' | 'threeCore') {
    const cableData = VOLTAGE_DROP_VALUES[cableType];
    if (!cableData) return null;
    
    const coreData = cableData[cores] as any;
    if (!coreData) return null;
    
    return coreData[csa] || null;
  }
  
  /**
   * Get cable resistance value
   */
  static getCableResistance(material: 'copper' | 'aluminium', csa: string): number | null {
    if (material === 'copper') {
      const copperData = CABLE_ELECTRICAL_PROPERTIES.resistance.copper as any;
      return copperData[csa] || null;
    } else {
      const aluminiumData = CABLE_ELECTRICAL_PROPERTIES.resistance.aluminium as any;
      return aluminiumData[csa] || null;
    }
  }
  
  /**
   * Interpolate temperature factor for non-standard temperatures
   */
  private static interpolateTemperatureFactor(factors: Record<number, number>, temperature: number): number {
    const temps = Object.keys(factors).map(Number).sort((a, b) => a - b);
    
    // If exact match, return that factor
    if (factors[temperature]) {
      return factors[temperature];
    }
    
    // Find surrounding temperatures for interpolation
    let lowerTemp = temps[0];
    let upperTemp = temps[temps.length - 1];
    
    for (let i = 0; i < temps.length - 1; i++) {
      if (temperature >= temps[i] && temperature <= temps[i + 1]) {
        lowerTemp = temps[i];
        upperTemp = temps[i + 1];
        break;
      }
    }
    
    // Linear interpolation
    if (lowerTemp === upperTemp) {
      return factors[lowerTemp];
    }
    
    const ratio = (temperature - lowerTemp) / (upperTemp - lowerTemp);
    return factors[lowerTemp] + ratio * (factors[upperTemp] - factors[lowerTemp]);
  }
}

// Export regulation compliance note
export const REGULATION_COMPLIANCE = {
  note: 'All cable reference data is based on BS 7671:2018+A2:2022 and current UK standards. This data is provided for guidance only and must be verified against current regulations. Professional electrical work must be carried out by competent persons in accordance with Part P of the Building Regulations.',
  standards: [
    'BS 7671:2018+A2:2022 - Requirements for Electrical Installations',
    'BS 5467 - Electric cables. Thermosetting insulated, armoured cables',
    'BS EN 50575 - Power, control and communication cables. Cables for general applications',
    'BS 6004 - Electric cables. PVC insulated and sheathed cables',
    'IET Guidance Note 1: Selection & Erection',
    'IET Guidance Note 6: Protection Against Overcurrent'
  ]
};
