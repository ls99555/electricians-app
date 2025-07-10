/**
 * Core Electrical Calculation Types
 * Basic electrical calculations (Ohm's law, voltage drop, cable sizing)
 */

import type { BaseCalculationResult } from './common';

// Basic calculation results
export interface OhmLawResult {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}

export interface VoltageDropResult extends BaseCalculationResult {
  voltageDrop: number;
  voltageDropPercentage: number;
  voltageAtLoad: number;
  isWithinLimits: boolean;
}

export interface CableSizingResult extends BaseCalculationResult {
  recommendedSize: number;
  currentCarryingCapacity: number;
  voltageDropCheck: boolean;
  thermalCheck: boolean;
  protectionRequired: string;
  deratingFactors: {
    grouping: number;
    ambient: number;
    thermal: number;
    overall: number;
  };
}

// Cable specifications
export interface CableSpecification {
  csa: number; // Cross-sectional area in mm²
  material: 'copper' | 'aluminium';
  insulation: 'pvc' | 'xlpe' | 'epr' | 'mi';
  cores: number;
  armoured: boolean;
  ratedVoltage: number; // V
}

// Installation conditions
export interface InstallationConditions {
  method: string; // BS 7671 reference method
  ambientTemperature: number; // °C
  groundTemperature: number; // °C
  thermalResistivity: number; // K⋅m/W
  groupingFactor: number;
  groupedCables: number;
}

// Cable and protection types
export type CircuitType = 'lighting' | 'socket_outlet' | 'fixed_equipment' | 'control_circuit' | 'three_phase' | 'lv_circuit' | 'extra_low_voltage' | 'fire_alarm' | 'telecom' | 'ring_circuit' | 'radial_circuit' | 'motor' | 'heating';

// Cable and protection results
export interface CableDeratingResult extends BaseCalculationResult {
  groupingFactor: number;
  ambientTempFactor: number;
  thermalInsulationFactor: number;
  buriedFactor: number;
  overallDerating: number;
  deratedCurrent: number;
  originalRating: number;
}

export interface ProtectiveDeviceResult extends BaseCalculationResult {
  deviceType: string;
  deviceRating: number;
  deviceCurve: string;
  breakingCapacity: number;
  rcdRating?: number;
  compliance: string[];
}

export interface ConduitFillResult extends BaseCalculationResult {
  conduitSize: string;
  fillPercentage: number;
  maxCables: number;
  isCompliant: boolean;
  nextSizeUp?: string;
}

export interface CableRouteLengthResult extends BaseCalculationResult {
  directDistance: number;
  adjustedDistance: number;
  bendsAllowance: number;
  heightAllowance: number;
  obstacleAllowance: number;
  safetyAllowance: number;
  totalRouteLength: number;
  costImplications: {
    additionalCableCost: number;
    voltageDrop: number;
  };
}

export interface FuseSelectionResult extends BaseCalculationResult {
  recommendedFuseRating: number;
  fuseType: string;
  fuseCategory: string;
  breakingCapacity: number;
  discriminationMargin: number;
  complianceChecks: {
    overloadProtection: boolean;
    shortCircuitProtection: boolean;
    cableProtection: boolean;
    discrimination: boolean;
  };
  temperatureDerating: number;
}

export interface CableScreenArmourResult extends BaseCalculationResult {
  screenCSA: number;
  armourType: string;
  armourThickness: number;
  earthingRequirements: {
    screenEarthing: string;
    armourEarthing: string;
    earthConductor: number;
  };
  mechanicalProtection: {
    bendRadius: number;
    tensileStrength: number;
    compressionResistance: number;
  };
  environmentalProtection: {
    moistureResistance: string;
    corrosionProtection: string;
    uvResistance: string;
  };
}

export interface SocketOutletResult extends BaseCalculationResult {
  socketRequirements: {
    minimumSockets: number;
    recommendedSockets: number;
    socketType: string;
    circuitProtection: number; // A
  };
  loadAssessment: {
    estimatedLoad: number; // W
    diversityFactor: number;
    simultaneousDemand: number; // W
    circuitCapacity: number; // A
  };
  compliance: {
    bs7671Compliant: boolean;
    accessibilityCompliant: boolean;
    spacingCompliant: boolean;
  };
  positioning: {
    height: number; // mm
    spacing: number; // mm
    accessibility: string;
  };
  circuitDesign: {
    circuitType: 'ring' | 'radial';
    cableSize: number; // mm²
    protectionRating: number; // A
    rcdRequired: boolean;
  };
  // Additional flat properties expected by UI
  totalConnectedLoad: number;
  maximumDemand: number;
  circuitRating: number;
  compliant: boolean;
  socketDensity: number;
  minimumDensity: number;
  loadPerSocket: number;
  diversityFactor: number;
}

// Units Converter Types
export interface UnitsConverterResult extends BaseCalculationResult {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionFactor: number;
  formula: string;
}

export interface PowerConversionResult extends UnitsConverterResult {
  powerType: 'active' | 'reactive' | 'apparent';
}

export interface EnergyConversionResult extends UnitsConverterResult {
  energyType: 'electrical' | 'thermal' | 'mechanical';
}

export interface VoltageConversionResult extends UnitsConverterResult {
  voltageType: 'dc' | 'ac_rms' | 'ac_peak' | 'ac_peak_to_peak';
}

export interface CurrentConversionResult extends UnitsConverterResult {
  currentType: 'dc' | 'ac_rms' | 'ac_peak';
}

export interface ResistanceConversionResult extends UnitsConverterResult {
  resistanceType: 'dc' | 'ac_impedance';
}

export interface CapacitanceConversionResult extends UnitsConverterResult {
  capacitorType: 'fixed' | 'variable' | 'power_factor_correction';
}

export interface InductanceConversionResult extends UnitsConverterResult {
  inductorType: 'air_core' | 'iron_core' | 'transformer';
}

export interface FrequencyConversionResult extends UnitsConverterResult {
  frequencyType: 'power' | 'radio' | 'signal';
}

export interface TemperatureConversionResult extends UnitsConverterResult {
  temperatureScale: 'celsius' | 'fahrenheit' | 'kelvin' | 'rankine';
}

export interface LengthConversionResult extends UnitsConverterResult {
  measurementType: 'metric' | 'imperial' | 'electrical';
}

export interface AreaConversionResult extends UnitsConverterResult {
  areaType: 'surface' | 'cross_sectional' | 'floor';
}

export interface VolumeConversionResult extends UnitsConverterResult {
  volumeType: 'liquid' | 'gas' | 'solid';
}

export interface WeightConversionResult extends UnitsConverterResult {
  weightType: 'mass' | 'force' | 'density';
}
