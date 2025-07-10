/**
 * Renewable Energy Types
 * Types for solar PV, wind, battery storage, and other renewable energy calculations
 */

import type { BaseCalculationResult } from './common';

export interface SolarPVResult extends BaseCalculationResult {
  systemSize: number; // kWp
  systemCapacity: number; // kWp (alternative naming)
  annualGeneration: number; // kWh/year
  panelConfiguration: {
    panels: number;
    stringsInParallel: number;
    panelsPerString: number;
  };
  electricalDesign: {
    dcVoltage: number; // V
    dcCurrent: number; // A
    acVoltage: number; // V
    acCurrent: number; // A
    inverterEfficiency: number; // %
  };
  gridConnection: {
    exportCapacity: number; // kW
    importCapacity: number; // kW
    gGenerationMeterRequired: boolean;
  };
  economicAnalysis: {
    systemCost: number; // £
    annualSavings: number; // £/year
    paybackPeriod: number; // years
    roi: number; // %
  };
  compliance: {
    dnoPproval: boolean;
    mcsCertification: boolean;
    buildingRegs: boolean;
  };
}

export interface BatteryStorageResult extends BaseCalculationResult {
  batteryCapacity: number; // kWh
  capacity: number; // kWh (alternative naming)
  powerRating: number; // kW
  efficiency: number; // %
  cycleLife: number;
  systemConfiguration: {
    batteryType: string;
    numberOfBatteries: number;
    voltageConfiguration: string;
  };
  integrationAnalysis: {
    solarPVCompatibility: boolean;
    gridTieCapability: boolean;
    backupPowerCapability: boolean;
  };
  economicBenefits: {
    energyArbitrage: number; // £/year
    gridStabilityServices: number; // £/year
    backupValue: number; // £/year
  };
  safetyRequirements: {
    ventilation: string[];
    fireProtection: string[];
    electricalSafety: string[];
  };
}

export interface WindTurbineInputs {
  turbineType: 'micro' | 'small' | 'medium' | 'large';
  ratedPower: number; // kW
  turbineRating: number; // kW (alternative naming)
  hubHeight: number; // m
  rotorDiameter: number; // m
  windSpeed: number; // m/s
  airDensity: number; // kg/m³
  powerCurve: Array<{ windSpeed: number; power: number }>;
  terrainRoughness: string;
  windData: {
    averageWindSpeed: number; // m/s
    windResource: 'poor' | 'fair' | 'good' | 'excellent';
    turbulenceIntensity: number; // %
  };
  siteConditions: {
    altitude: number; // m
    temperature: number; // °C
    airDensity: number; // kg/m³
  };
  electricalConnection: {
    gridVoltage: number; // V
    distanceToGrid: number; // m
    powerElectronics: string;
  };
}

export interface WindTurbineResult extends BaseCalculationResult {
  annualEnergyProduction: number; // kWh/year
  capacityFactor: number; // %
  powerCurve: Array<{
    windSpeed: number; // m/s
    power: number; // kW
  }>;
  economicAnalysis: {
    capitalCost: number; // £
    operatingCost: number; // £/year
    energyValue: number; // £/year
    paybackPeriod: number; // years
  };
  gridConnection: {
    type: 'G98' | 'G99';
    transformerRequired: boolean;
    protectionRequirements: string[];
    gridStability: string;
  };
  environmentalImpact: {
    noiseLevel: number; // dB
    shadowFlicker: boolean;
    birdWildlifeImpact: string;
  };
}

export interface GeneratorSizingInputs {
  // Flat properties for implementation compatibility
  loadType: string;
  totalLoad: number; // kW
  startingLoads: Array<{
    name: string;
    runningPower: number; // kW
    startingPower: number; // kW
    priority: 'critical' | 'essential' | 'non_essential';
  }>;
  powerFactor: number;
  altitude: number; // m
  ambientTemperature: number; // °C
  runningHours: number;
  
  loadRequirements: {
    totalLoad: number; // kW
    criticalLoad: number; // kW
    startingLoads: Array<{
      name: string;
      runningPower: number; // kW
      startingPower: number; // kW
      priority: 'critical' | 'essential' | 'non_essential';
    }>;
  };
  operationalRequirements: {
    backupDuration: number; // hours
    startupTime: number; // seconds
    loadSequencing: boolean;
    parallelOperation: boolean;
  };
  environmentalConditions: {
    altitude: number; // m
    temperature: number; // °C
    humidity: number; // %
    dustConditions: string;
  };
  fuelType: 'diesel' | 'gas' | 'lpg' | 'biogas' | 'hybrid';
}

export interface GeneratorSizingResult extends BaseCalculationResult {
  generatorSize: {
    primePower: number; // kW
    standbyPower: number; // kW
    recommended: number; // kW
    oversizingFactor: number;
  };
  fuelConsumption: number | {
    fullLoad: number; // l/h or m³/h
    partLoad: number; // l/h or m³/h
    dailyConsumption: number;
  };
  electricalSpecification: {
    voltage: number; // V
    frequency: number; // Hz
    powerFactor: number;
    efficiency: number; // %
  };
  installation: {
    baseSize: string;
    ventilationRequirements: string[];
    fuelStorageCapacity: number; // litres or m³
    transferSwitchRating: number; // A
  };
  compliance: {
    emissions: string[];
    noise: string[];
    planning: string[];
  };
}

export interface StandbyGeneratorInputs {
  buildingType: 'hospital' | 'data_center' | 'commercial' | 'industrial' | 'residential';
  criticalSystems: Array<{
    system: string;
    power: number; // kW
    priority: number;
    backupRequired: boolean;
  }>;
  transferRequirements: {
    transferTime: number; // seconds
    automaticStart: boolean;
    loadShedding: boolean;
    weeklyTesting: boolean;
  };
  regulatoryRequirements: {
    htmCompliance: boolean; // Healthcare Technical Memorandum
    bs6423: boolean; // Emergency electrical power systems
    en12601: boolean; // Uninterruptible power systems
  };
}

export interface StandbyGeneratorResult extends BaseCalculationResult {
  systemDesign: {
    generatorCapacity: number; // kW
    transferSwitchType: string;
    fuelTankCapacity: number; // litres
    runTime: number; // hours
  };
  loadManagement: {
    prioritySchedule: Array<{
      priority: number;
      systems: string[];
      power: number; // kW
    }>;
    loadSheddingSequence: string[];
    totalManagedLoad: number; // kW
  };
  protectionRequirements: string[];
  complianceChecks: {
    htm: boolean;
    bs6423: boolean;
    planningPermission: boolean;
    emissions: boolean;
  };
  maintenanceSchedule: {
    weekly: string[];
    monthly: string[];
    annual: string[];
  };
}

export interface FeedInTariffInputs {
  generationTechnology: 'solar_pv' | 'wind' | 'hydro' | 'anaerobic_digestion' | 'combined_heat_power';
  systemCapacity: number; // kW
  annualGeneration: number; // kWh/year
  installationDate: string;
  eligibilityLevel: 'domestic' | 'commercial' | 'community';
  exportMetering: boolean;
  mcsCertified: boolean;
}

export interface FeedInTariffResult extends BaseCalculationResult {
  tariffRates: {
    generationTariff: number; // p/kWh
    exportTariff: number; // p/kWh
    degression: number; // %/year
  };
  annualPayments: {
    generation: number; // £/year
    export: number; // £/year
    total: number; // £/year
  };
  lifeTimePayments: {
    generation: number; // £
    export: number; // £
    total: number; // £
  };
  economicAnalysis: {
    paybackPeriod: number; // years
    roi: number; // %
    npv: number; // £
  };
  eligibilityStatus: {
    eligible: boolean;
    reasons: string[];
    requirements: string[];
  };
}

export interface CarbonFootprintInputs {
  energyConsumption: {
    electricity: number; // kWh/year
    gas: number; // kWh/year
    oil: number; // litres/year
    renewableGeneration: number; // kWh/year
  };
  buildingData: {
    floorArea: number; // m²
    buildingType: string;
    occupancy: number;
    heatingSystem: string;
  };
  transportData: {
    businessMiles: number; // miles/year
    commuterMiles: number; // miles/year
    fleetVehicles: number;
  };
  scope: '1' | '1_and_2' | '1_2_and_3';
}

export interface CarbonFootprintResult extends BaseCalculationResult {
  carbonEmissions: {
    scope1: number; // kg CO2e/year
    scope2: number; // kg CO2e/year
    scope3: number; // kg CO2e/year
    total: number; // kg CO2e/year
  };
  breakdown: {
    electricity: number; // kg CO2e/year
    gas: number; // kg CO2e/year
    transport: number; // kg CO2e/year
    other: number; // kg CO2e/year
  };
  benchmarking: {
    perM2: number; // kg CO2e/m²/year
    perOccupant: number; // kg CO2e/person/year
    industryAverage: number; // kg CO2e/year
  };
  reductionPotential: {
    renewableEnergy: number; // kg CO2e/year
    energyEfficiency: number; // kg CO2e/year
    transport: number; // kg CO2e/year
    total: number; // kg CO2e/year
  };
  offsetRequirements: {
    treesRequired: number;
    carbonCredits: number; // tonnes CO2e
    cost: number; // £/year
  };
}
