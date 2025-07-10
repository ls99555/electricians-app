/**
 * Electrical Constants
 * UK Standards and Regulations Compliant Values
 * SparkyTools - UK Electrical Regulations Compliant
 */

export const ELECTRICAL_CONSTANTS = {
  // UK Standard Voltages (BS EN 50160)
  STANDARD_VOLTAGE_SINGLE_PHASE: 230, // V
  STANDARD_VOLTAGE_THREE_PHASE: 400, // V
  NOMINAL_FREQUENCY: 50, // Hz
  
  // Voltage tolerances (BS EN 50160)
  VOLTAGE_TOLERANCE_PLUS: 10, // %
  VOLTAGE_TOLERANCE_MINUS: 6, // %
  
  // Maximum voltage drop limits (BS 7671 Regulation 525.201)
  MAX_VOLTAGE_DROP_LIGHTING: 3, // % for lighting circuits
  MAX_VOLTAGE_DROP_POWER: 5, // % for power circuits
  MAX_VOLTAGE_DROP_MOTOR: 5, // % for motor circuits
  
  // Standard cable sizes (mm²)
  STANDARD_CABLE_SIZES: [
    1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630
  ],
  
  // Standard MCB ratings (A)
  STANDARD_MCB_RATINGS: [
    6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125
  ],
  
  // Standard RCD ratings (mA)
  STANDARD_RCD_RATINGS: [10, 30, 100, 300, 500],
  
  // Conductor resistivity at 20°C (Ω⋅mm²/m)
  CONDUCTOR_RESISTIVITY_COPPER: 0.01724,
  CONDUCTOR_RESISTIVITY_ALUMINIUM: 0.02826,
  
  // Temperature coefficients (per °C)
  TEMP_COEFFICIENT_COPPER: 0.004,
  TEMP_COEFFICIENT_ALUMINIUM: 0.004,
  
  // Standard ambient temperatures (°C)
  STANDARD_AMBIENT_TEMP: 20,
  CABLE_RATING_TEMP: 30,
  
  // Power factors
  UNITY_POWER_FACTOR: 1.0,
  TYPICAL_POWER_FACTOR_LIGHTING: 0.9,
  TYPICAL_POWER_FACTOR_MOTOR: 0.8,
  
  // Installation factors
  STANDARD_GROUPING_FACTOR: 1.0,
  STANDARD_THERMAL_INSULATION_FACTOR: 1.0,
  
  // Earth fault loop impedance limits (Ω) for different protective devices
  // BS 7671 Table 41.2 and 41.3
  ZS_LIMITS_MCB_B: {
    6: 7.67,
    10: 4.60,
    16: 2.87,
    20: 2.30,
    25: 1.84,
    32: 1.44,
    40: 1.15,
    50: 0.92,
    63: 0.73
  },
  
  ZS_LIMITS_MCB_C: {
    6: 3.83,
    10: 2.30,
    16: 1.44,
    20: 1.15,
    25: 0.92,
    32: 0.72,
    40: 0.58,
    50: 0.46,
    63: 0.37
  },
  
  ZS_LIMITS_MCB_D: {
    6: 1.92,
    10: 1.15,
    16: 0.72,
    20: 0.58,
    25: 0.46,
    32: 0.36,
    40: 0.29,
    50: 0.23,
    63: 0.18
  },
  
  // Disconnection times (s) - BS 7671 Table 41.1
  DISCONNECTION_TIME_TN_FINAL: 0.4,
  DISCONNECTION_TIME_TN_DISTRIBUTION: 5.0,
  DISCONNECTION_TIME_TT_FINAL: 0.2,
  DISCONNECTION_TIME_TT_DISTRIBUTION: 1.0,
  
  // Diversity factors (BS 7671 Appendix A)
  DIVERSITY_LIGHTING_DOMESTIC: 0.66,
  DIVERSITY_SOCKET_DOMESTIC: 0.4,
  DIVERSITY_COOKER_SINGLE: 1.0,
  DIVERSITY_COOKER_MULTIPLE: 0.6,
  DIVERSITY_WATER_HEATING: 0.25,
  DIVERSITY_SPACE_HEATING: 1.0
} as const;
