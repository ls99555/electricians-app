/**
 * Common Types and Interfaces for Electrical Calculations
 * SparkyTools - UK Electrical Regulations Compliant
 */

// Basic calculation results
export interface OhmLawResult {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}

export interface VoltageDropResult {
  voltageDrop: number;
  voltageDropPercentage: number;
  voltageAtLoad: number;
  isWithinLimits: boolean;
  regulation: string;
}

export interface CableSizingResult {
  recommendedSize: number;
  currentCarryingCapacity: number;
  voltageDropCheck: boolean;
  thermlaCheck: boolean;
  protectionRequired: string;
}

// Load and demand calculation results
export interface MaximumDemandResult {
  totalConnectedLoad: number;
  maximumDemand: number;
  diversityFactor: number;
  loadBreakdown: Array<{
    appliance: string;
    connectedLoad: number;
    demand: number;
    diversity: number;
  }>;
  recommendations: string[];
  regulation: string;
}

export interface DiversityFactorResult {
  lightingDemand: number;
  heatingDemand: number;
  socketDemand: number;
  cookerDemand: number;
  waterHeatingDemand: number;
  airConditioningDemand: number;
  motorDemand: number;
  totalDemand: number;
  diversityApplied: number;
  loadBreakdown: Array<{ load: string; connected: number; demand: number; diversity: number }>;
}

// Lighting calculation results
export interface IlluminanceResult {
  requiredLumens: number;
  numberOfLuminaires: number;
  luminaireSpacing: number;
  uniformityRatio: number;
  averageIlluminance: number;
  energyConsumption: number;
  costAnalysis: {
    installationCost: number;
    annualEnergyCost: number;
    maintenanceCost: number;
  };
  recommendations: string[];
}

export interface EmergencyLightingResult {
  requiredIlluminance: number;
  uniformityRatio: number;
  minimumDuration: number;
  numberOfLuminaires: number;
  luminaireSpacing: number;
  testingSchedule: string[];
  complianceRequirements: string[];
  recommendations: string[];
}

// Cable and protection results
export interface CableDeratingResult {
  groupingFactor: number;
  ambientTempFactor: number;
  thermalInsulationFactor: number;
  buriedFactor: number;
  overallDerating: number;
  deratedCurrent: number;
  originalRating: number;
}

export interface ProtectiveDeviceResult {
  deviceType: string;
  deviceRating: number;
  deviceCurve: string;
  breakingCapacity: number;
  rcdRating?: number;
  recommendations: string[];
  compliance: string[];
}

export interface ConduitFillResult {
  conduitSize: string;
  fillPercentage: number;
  maxCables: number;
  isCompliant: boolean;
  nextSizeUp?: string;
  regulation: string;
}

// Safety and testing results
export interface LoopImpedanceResult {
  ze: number;
  zs: number;
  r1PlusR2: number;
  maxZsAllowed: number;
  isCompliant: boolean;
  disconnectionTime: number;
  protectionType: string;
  regulation: string;
}

export interface RCDSelectionResult {
  recommendedRating: number;
  rcdType: string;
  testCurrent: number;
  operatingTime: number;
  isGRCDRequired: boolean;
  applications: string[];
  regulation: string;
}

export interface EarthElectrodeResult {
  resistance: number;
  isCompliant: boolean;
  maxResistanceAllowed: number;
  electrodeType: string;
  improvementSuggestions: string[];
  seasonalVariation: string;
  testConditions: string;
}

export interface FaultCurrentResult {
  prospectiveFaultCurrent: number;
  faultCurrentRMS: number;
  peakFaultCurrent: number;
  faultImpedance: number;
  arcingFaultCurrent?: number;
  protectionRequirements: {
    minimumBreakingCapacity: number;
    maximumDisconnectionTime: number;
    earthFaultLoopImpedance: number;
  };
  safetyConsiderations: string[];
}

// Power and energy results
export interface ThreePhaseResult {
  lineCurrent: number;
  phaseCurrent: number;
  lineVoltage: number;
  phaseVoltage: number;
  totalPower: number;
  powerPerPhase: number;
  isBalanced: boolean;
  neutralCurrent: number;
  powerFactor: number;
}

export interface PowerFactorResult {
  powerFactor: number;
  apparentPower: number;
  activePower: number;
  reactivePower: number;
  phaseAngle: number;
  correctionRequired: boolean;
  capacitorSize?: number;
  improvedPowerFactor?: number;
}

// EV and renewable energy results
export interface EVChargingResult {
  chargerCurrent: number;
  cableSize: string;
  protectionRequired: string;
  earthingRequirements: string[];
  loadImpact: {
    additionalLoad: number;
    gridCapacityCheck: boolean;
    additionalGridCapacity?: number;
    loadBalancingRecommended: boolean;
  };
  costAnalysis: {
    installationCost: number;
    annualEnergyCost: number;
    carbonSavings: number;
  };
  recommendations: string[];
}

export interface SolarPVResult {
  systemCapacity: number; // Wp
  dcCurrent: number; // A
  dcPowerOutput: number; // W
  acPowerOutput: number; // W
  annualYield: number; // kWh
  tempDerating: number;
  irradianceFactor: number;
  inverterEfficiency: number;
  isG98Compliant: boolean;
  connectionType: string;
  stringsRequired: number;
  maxStringLength: number;
  regulation: string;
}

export interface BatteryStorageResult {
  capacity: number; // kWh
  usableCapacity: number; // kWh
  voltage: number; // V
  maxChargeCurrent: number; // A
  maxDischargeCurrent: number; // A
  chargeRate: number; // C-rate
  dischargeRate: number; // C-rate
  chargeDuration: number; // hours
  dischargeDuration: number; // hours
  efficiency: number;
  dod: number; // Depth of discharge
  annualThroughput: number; // kWh/year
  requiresBMS: boolean;
  requiresFireSuppression: boolean;
  requiresVentilation: boolean;
  requiresG98: boolean;
  connectionType: string;
  regulation: string;
}

// Common input types
export interface EVChargingInputs {
  chargerRating: number;
  numberOfChargers: number;
  installationType: 'domestic' | 'commercial' | 'public';
  existingLoad: number;
  gridConnection: number;
  cableLength: number;
  installationMethod: string;
}

export interface LoadCalculatorInputs {
  lighting: number;
  heating: number;
  cooking: number;
  sockets: number;
  otherLoads: number;
  installationType: 'domestic' | 'commercial' | 'industrial';
}

// Installation and environment types
export type InstallationType = 'domestic' | 'commercial' | 'industrial';
export type EarthingSystem = 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
export type CircuitType = 'lighting' | 'power' | 'motor' | 'heating' | 'special';
export type BatteryType = 'lead_acid' | 'lithium_ion' | 'lithium_phosphate';
export type ElectrodeType = 'rod' | 'plate' | 'strip' | 'foundation';

// Common constants
export const ELECTRICAL_CONSTANTS = {
  STANDARD_VOLTAGE_SINGLE_PHASE: 230,
  STANDARD_VOLTAGE_THREE_PHASE: 400,
  FREQUENCY: 50,
  POWER_FACTOR_TARGET: 0.95,
  MAX_VOLTAGE_DROP_LIGHTING: 3,
  MAX_VOLTAGE_DROP_POWER: 5,
  STANDARD_CABLE_SIZES: [1.0, 1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0, 150.0, 185.0, 240.0, 300.0],
  STANDARD_MCB_RATINGS: [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125]
} as const;
