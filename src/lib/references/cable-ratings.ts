/**
 * Cable Rating Tables and Reference Data
 * Based on BS 7671:2018+A2:2022 Appendix 4
 * SparkyTools - UK Electrical Regulations Compliant
 */

// Current carrying capacity for copper conductors (A)
// Based on BS 7671 Appendix 4 Tables 4D1A to 4D4A
export const COPPER_CABLE_RATINGS = {
  // Reference Method A (enclosed in conduit in thermally insulated walls)
  method_a: {
    '1.5': { single_core: 16, multicore: 13 },
    '2.5': { single_core: 22, multicore: 18 },
    '4': { single_core: 30, multicore: 25 },
    '6': { single_core: 38, multicore: 32 },
    '10': { single_core: 52, multicore: 44 },
    '16': { single_core: 69, multicore: 59 },
    '25': { single_core: 90, multicore: 78 },
    '35': { single_core: 110, multicore: 96 },
    '50': { single_core: 134, multicore: 119 },
    '70': { single_core: 171, multicore: 151 },
    '95': { single_core: 207, multicore: 184 },
    '120': { single_core: 239, multicore: 213 },
    '150': { single_core: 269, multicore: 240 },
    '185': { single_core: 309, multicore: 275 },
    '240': { single_core: 362, multicore: 321 },
    '300': { single_core: 412, multicore: 367 }
  },

  // Reference Method C (cables laid direct in ground)
  method_c: {
    '1.5': { single_core: 23, multicore: 20 },
    '2.5': { single_core: 31, multicore: 27 },
    '4': { single_core: 41, multicore: 36 },
    '6': { single_core: 51, multicore: 46 },
    '10': { single_core: 70, multicore: 63 },
    '16': { single_core: 94, multicore: 85 },
    '25': { single_core: 123, multicore: 112 },
    '35': { single_core: 148, multicore: 138 },
    '50': { single_core: 180, multicore: 168 },
    '70': { single_core: 228, multicore: 213 },
    '95': { single_core: 275, multicore: 258 },
    '120': { single_core: 318, multicore: 299 },
    '150': { single_core: 356, multicore: 336 },
    '185': { single_core: 407, multicore: 386 },
    '240': { single_core: 473, multicore: 450 },
    '300': { single_core: 530, multicore: 504 }
  },

  // Reference Method E (free air, horizontal)
  method_e: {
    '1.5': { single_core: 22, multicore: 18 },
    '2.5': { single_core: 30, multicore: 25 },
    '4': { single_core: 40, multicore: 34 },
    '6': { single_core: 51, multicore: 43 },
    '10': { single_core: 70, multicore: 60 },
    '16': { single_core: 94, multicore: 80 },
    '25': { single_core: 131, multicore: 112 },
    '35': { single_core: 162, multicore: 138 },
    '50': { single_core: 196, multicore: 168 },
    '70': { single_core: 251, multicore: 213 },
    '95': { single_core: 304, multicore: 258 },
    '120': { single_core: 352, multicore: 299 },
    '150': { single_core: 394, multicore: 336 },
    '185': { single_core: 451, multicore: 386 },
    '240': { single_core: 530, multicore: 450 },
    '300': { single_core: 603, multicore: 504 }
  }
} as const;

// Derating factors for ambient temperature (Table 4B1)
export const AMBIENT_TEMPERATURE_FACTORS = {
  25: 1.03,   // °C
  30: 1.00,   // Reference temperature
  35: 0.94,
  40: 0.87,
  45: 0.79,
  50: 0.71,
  55: 0.61,
  60: 0.50,
  65: 0.35,
  70: 0.00    // Not permitted
} as const;

// Grouping factors for cables in air (Table 4C1)
export const GROUPING_FACTORS = {
  1: 1.00,    // Single circuit
  2: 0.80,    // 2 circuits
  3: 0.70,    // 3 circuits
  4: 0.65,    // 4 circuits
  5: 0.60,    // 5 circuits
  6: 0.57,    // 6 circuits
  7: 0.54,    // 7 circuits
  8: 0.52,    // 8 circuits
  9: 0.50,    // 9 circuits
  10: 0.48,   // 10 circuits
  12: 0.45,   // 12 circuits
  14: 0.43,   // 14 circuits
  16: 0.41,   // 16 circuits
  18: 0.39,   // 18 circuits
  20: 0.38    // 20 circuits
} as const;

// Thermal insulation derating factors (Table 4C2)
export const THERMAL_INSULATION_FACTORS = {
  none: 1.00,           // No thermal insulation
  partial: 0.89,        // Partial surrounded by thermal insulation
  complete: 0.77,       // Completely surrounded by thermal insulation ≤ 100mm
  complete_thick: 0.63  // Completely surrounded by thermal insulation > 100mm
} as const;

// Cable resistance and reactance values (Appendix 4)
export const CABLE_IMPEDANCE_DATA = {
  copper_pvc: {
    // Resistance (mΩ/m) and Reactance (mΩ/m) at 70°C
    '1.5': { r: 12.10, x: 0.14 },
    '2.5': { r: 7.41, x: 0.13 },
    '4': { r: 4.61, x: 0.12 },
    '6': { r: 3.08, x: 0.12 },
    '10': { r: 1.83, x: 0.11 },
    '16': { r: 1.15, x: 0.11 },
    '25': { r: 0.727, x: 0.10 },
    '35': { r: 0.524, x: 0.10 },
    '50': { r: 0.387, x: 0.098 },
    '70': { r: 0.268, x: 0.096 },
    '95': { r: 0.193, x: 0.094 },
    '120': { r: 0.153, x: 0.093 },
    '150': { r: 0.124, x: 0.092 },
    '185': { r: 0.0991, x: 0.091 },
    '240': { r: 0.0754, x: 0.090 },
    '300': { r: 0.0601, x: 0.089 }
  },

  copper_xlpe: {
    // Resistance (mΩ/m) and Reactance (mΩ/m) at 90°C
    '1.5': { r: 12.10, x: 0.14 },
    '2.5': { r: 7.41, x: 0.13 },
    '4': { r: 4.61, x: 0.12 },
    '6': { r: 3.08, x: 0.12 },
    '10': { r: 1.83, x: 0.11 },
    '16': { r: 1.15, x: 0.11 },
    '25': { r: 0.727, x: 0.10 },
    '35': { r: 0.524, x: 0.10 },
    '50': { r: 0.387, x: 0.098 },
    '70': { r: 0.268, x: 0.096 },
    '95': { r: 0.193, x: 0.094 },
    '120': { r: 0.153, x: 0.093 },
    '150': { r: 0.124, x: 0.092 },
    '185': { r: 0.0991, x: 0.091 },
    '240': { r: 0.0754, x: 0.090 },
    '300': { r: 0.0601, x: 0.089 }
  }
} as const;

// Diversity factors from BS 7671 Appendix A
export const DIVERSITY_FACTORS = {
  lighting: {
    domestic: 0.66,      // 66% for domestic lighting
    commercial: 0.9,     // 90% for commercial lighting
    industrial: 0.9      // 90% for industrial lighting
  },
  socket_outlets: {
    domestic: 0.4,       // 40% for domestic socket outlets
    commercial: 0.75,    // 75% for commercial socket outlets
    industrial: 0.8      // 80% for industrial socket outlets
  },
  cookers: {
    domestic_single: 1.0,      // 100% for single domestic cooker
    domestic_multiple: 0.6     // 60% for multiple domestic cookers
  },
  water_heating: {
    domestic: 0.25,      // 25% for domestic water heating
    commercial: 0.8      // 80% for commercial water heating
  },
  space_heating: {
    domestic: 1.0,       // 100% for domestic space heating
    commercial: 0.75     // 75% for commercial space heating
  },
  motors: {
    largest: 1.0,        // 100% for largest motor
    remainder: 0.8       // 80% for remainder of motors
  }
} as const;

// Standard cable cross-sectional areas (mm²)
export const STANDARD_CSA = [
  1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000
] as const;
