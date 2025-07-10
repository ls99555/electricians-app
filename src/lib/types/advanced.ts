/**
 * Advanced Electrical Calculation Types
 * SparkyTools - UK Electrical Regulations Compliant
 */

import type { BaseCalculationResult } from './common';

// Advanced calculation results
export interface ShortCircuitAnalysisResult extends BaseCalculationResult {
  initialSymmetricalCurrent: number; // kA rms
  peakCurrent: number; // kA peak
  breakingCurrent: number; // kA rms
  thermalStressCurrent: number; // kA rms
  impedance: {
    positive: number; // Ω
    negative: number; // Ω
    zero: number; // Ω
  };
  faultLocation: string;
  faultType: 'three_phase' | 'phase_to_phase' | 'phase_to_earth';
}

export interface VoltageRegulationResult extends BaseCalculationResult {
  voltageRegulation: number; // %
  voltageAtLoad: number; // V
  voltageDrop: number; // V
  isWithinLimits: boolean;
  loadPowerFactor: number;
  standardLimits: {
    steadyState: number; // %
    rapid: number; // %
  };
}

export interface HarmonicsAnalysisResult extends BaseCalculationResult {
  totalHarmonicDistortion: {
    voltage: number; // %
    current: number; // %
  };
  individualHarmonics: Array<{
    order: number;
    voltage: number; // %
    current: number; // %
    phase: number; // degrees
  }>;
  complianceStatus: {
    voltageCompliant: boolean;
    currentCompliant: boolean;
    standard: string;
  };
  mitigationRequired: boolean;
  mitigationOptions: string[];
}

export interface ArcFaultAnalysisResult extends BaseCalculationResult {
  arcFaultRisk: 'low' | 'medium' | 'high' | 'critical';
  arcEnergyIncident: number; // cal/cm²
  protectiveDeviceResponse: number; // ms
  arcFaultCurrentLevel: number; // kA
  protectionRequired: boolean;
  arcFaultDetectionRecommendation: string;
  personalProtectiveEquipment: string[];
}

export interface PowerQualityAssessmentResult extends BaseCalculationResult {
  voltageQuality: {
    steadyStateDeviation: number; // %
    rapidVoltageChanges: number; // %
    flicker: number; // Plt
    unbalance: number; // %
  };
  frequencyQuality: {
    deviation: number; // Hz
    isWithinLimits: boolean;
  };
  harmonicDistortion: {
    voltage: number; // %
    current: number; // %
  };
  powerFactorAnalysis: {
    displacement: number;
    distortion: number;
    true: number;
  };
  issuesIdentified: string[];
  improvementRecommendations: string[];
}

export interface LoadFlowAnalysisResult extends BaseCalculationResult {
  busVoltages: Array<{
    busNumber: number;
    voltage: number; // pu or V
    angle: number; // degrees
  }>;
  branchFlows: Array<{
    fromBus: number;
    toBus: number;
    realPower: number; // MW or kW
    reactivePower: number; // MVAr or kVAr
    loading: number; // %
  }>;
  totalLosses: {
    real: number; // MW or kW
    reactive: number; // MVAr or kVAr
  };
  convergence: {
    iterations: number;
    converged: boolean;
    error: number;
  };
}

export interface EconomicAnalysisResult extends BaseCalculationResult {
  comparison: Array<{
    csa: number;
    capitalCost: number;
    energyLossCost: number;
    annualLossCost: number;
    maintenanceCost: number;
    totalCost: number;
    totalLifecycleCost: number;
    npv: number;
    compliance: boolean;
  }>;
  optimalSolution: {
    csa: number;
    capitalCost: number;
    energyLossCost: number;
    maintenanceCost: number;
    totalCost: number;
    npv: number;
    compliance: boolean;
    paybackPeriod: number; // years
    roi: number; // %
  };
  sensitivity: {
    electricityPriceChange: Array<{
      change: number;
      npvImpact: number;
      optimalCsa: number;
    }>;
    loadGrowthImpact: Array<{
      growth: number;
      optimalCsa: number;
      costImpact: number;
    }>;
    discountRateImpact: Array<{
      rate: number;
      npvImpact: number;
      optimalCsa: number;
    }>;
  };
  riskAssessment: {
    sensitivityLevel: string;
    keyRisks: string[];
    mitigationStrategies: string[];
  };
  capitalCost: number; // £
  operatingCost: number; // £/year
  netPresentValue: number; // £
  internalRateOfReturn: number; // %
  paybackPeriod: number; // years
  lifeCycleCost: number; // £
  energyLossCost: number; // £/year
  maintenanceCost: number; // £/year
  carbonFootprint: number; // kg CO2/year
}

export interface EnergyLossCalculatorResult extends BaseCalculationResult {
  conductorLosses: Array<{
    conductorId: string;
    resistance: number;
    dailyLosses: number;
    annualLosses: number;
    lossPercentage: number;
    i2rLosses: number;
    lossCost: number;
    efficiencyImpact: number;
  }>;
  transformerLosses: Array<{
    transformerId: string;
    noLoadLosses: number;
    loadLosses: number;
    totalLosses: number;
    efficiency: number;
  }>;
  systemSummary: {
    totalEnergyLosses: number;
    totalLossCost: number;
    systemEfficiency: number;
    carbonEmissions: number;
  };
  optimization: {
    potentialSavings: number;
    upgradeRecommendations: Array<{
      component: string;
      recommendation: string;
      savings: number;
      cost: number;
      payback: number;
    }>;
  };
  benchmarking: {
    ranking: string;
    industryAverage: number;
    bestPractice: number;
  };
  reactivePowerLosses: {
    hourlyLosses: number;
    annualLosses: number;
    recommendations: string[];
  };
  totalLosses: {
    conductors: number;
    transformers: number;
    annual: number;
    daily: number;
  };
  annualEnergyCost: number;
  efficiency: number;
}

export interface PowerFactorCorrectionResult extends BaseCalculationResult {
  existingPowerFactor: number;
  targetPowerFactor: number;
  capacitorRating: number; // kVAr
  energySavings: number; // £/year
  demandChargeSavings: number; // £/year
  paybackPeriod: number; // years
  harmonicConsiderations: string[];
  switchingRecommendations: string[];
}

export interface ThreePhaseResult extends BaseCalculationResult {
  phasePowers: {
    phaseA: number; // W
    phaseB: number; // W
    phaseC: number; // W
  };
  phaseCurrents: {
    phaseA: number; // A
    phaseB: number; // A
    phaseC: number; // A
  };
  phaseVoltages: {
    phaseA: number; // V
    phaseB: number; // V
    phaseC: number; // V
  };
  lineVoltages: {
    AB: number; // V
    BC: number; // V
    CA: number; // V
  };
  neutralCurrent: number; // A
  totalPower: number; // W
  totalApparentPower: number; // VA
  totalReactivePower: number; // VAr
  powerFactor: number;
  unbalance: {
    voltage: number; // %
    current: number; // %
  };
  efficiency: number; // %
}

export interface PowerFactorResult extends BaseCalculationResult {
  existingPowerFactor: number;
  targetPowerFactor: number;
  capacitorRating: number; // kVAr
  capacitorCurrent: number; // A
  energySavings: number; // £/year
  demandReduction: number; // kW
  paybackPeriod: number; // years
  installationCost: number; // £
  annualSavings: number; // £
  netPresentValue: number; // £
  harmonicConsiderations: string[];
  switchingRecommendations: string[];
}

// Input types for advanced calculations
export interface ShortCircuitAnalysisInputs {
  systemVoltage: number; // kV
  transformerRating: number; // MVA
  transformerImpedance: number; // %
  cableImpedance: {
    resistance: number; // Ω/km
    reactance: number; // Ω/km
    length: number; // km
  };
  faultLocation: string;
  faultType: 'three_phase' | 'phase_to_phase' | 'phase_to_earth';
}

export interface VoltageRegulationInputs {
  systemVoltage: number; // V
  loadCurrent: number; // A
  powerFactor: number;
  cableLength: number; // m
  cableResistance: number; // Ω/km
  cableReactance: number; // Ω/km
  loadType: 'resistive' | 'inductive' | 'capacitive' | 'mixed';
}

export interface HarmonicsAnalysisInputs {
  fundamentalVoltage: number; // V
  fundamentalCurrent: number; // A
  harmonicSpectrum: Array<{
    order: number;
    magnitude: number; // % of fundamental
    phase: number; // degrees
  }>;
  loadType: 'linear' | 'non_linear';
  systemImpedance: number; // Ω
  loadData: {
    nonLinearLoads: Array<{
      type: string;
      rating: number; // kW
      quantity: number;
      harmonicProfile: Array<{
        order: number;
        magnitude: number; // % of fundamental
      }>;
    }>;
  };
}

export interface ArcFaultAnalysisInputs {
  systemData: {
    systemVoltage: number; // V
    systemType: 'single_phase' | 'three_phase';
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
    frequency: number; // Hz
    systemCapacity: number; // kVA
  };
  faultData: {
    faultLocation: string;
    gapDistance: number; // mm
    electrodeConfig: string;
    ambientConditions: {
      temperature: number; // °C
      humidity: number; // %
      pressure: number; // kPa
      airflow: string;
    };
  };
  protectionData: {
    arcFaultDevices: Array<{
      type: string;
      responseTime: number; // ms
      sensitivity: number; // A
      installed: boolean;
    }>;
    conventionalProtection: {
      deviceType: string;
      rating: number; // A
      breakingCapacity: number; // kA
      responseTime: number; // ms
    };
  };
  installationData: {
    cableType: string;
    conductorMaterial: string;
    insulationType: string;
    installationMethod: string;
    enclosureType: string;
  };
}

export interface PowerQualityInputs {
  measurementData: {
    duration: number; // hours
    samplingInterval: number; // minutes
    measurements: Array<{
      timestamp: number;
      voltage: { [phase: string]: number }; // V
      current: { [phase: string]: number }; // A
      frequency: number; // Hz
      powerFactor: number;
    }>;
  };
  systemData: {
    nominalVoltage: number; // V
    nominalFrequency: number; // Hz
    systemType: string;
    neutralPresent: boolean;
  };
  loadCharacteristics: {
    loadTypes: Array<{
      type: string;
      percentage: number;
      variability: string;
    }>;
    totalLoad: number; // kW
    peakDemand: number; // kW
  };
  environmentalFactors: {
    temperatureVariation: number;
    externalInterference: boolean;
    switchingOperations: number;
    motorStarting: number;
  };
  complianceStandards: {
    standard: string;
    voltageClass: string;
    locationClass: string;
  };
}

export interface LoadFlowInputs {
  systemData: {
    systemVoltage: number; // V
    frequency: number; // Hz
    systemType: string;
    baseKVA: number;
  };
  buses: Array<{
    busId: string;
    voltage: number; // V
    angle: number; // degrees
    busType: 'slack' | 'PQ' | 'PV';
    powerGeneration?: { P: number; Q: number }; // MW, MVAr
    powerLoad?: { P: number; Q: number }; // MW, MVAr
  }>;
  branches: Array<{
    branchId: string;
    fromBus: string;
    toBus: string;
    resistance: number; // pu
    reactance: number; // pu
    susceptance?: number; // pu
    ratingMVA?: number;
  }>;
  loadModels: {
    constantPower: number; // %
    constantCurrent: number; // %
    constantImpedance: number; // %
  };
  convergenceCriteria: {
    maxIterations: number;
    tolerance: number;
  };
}

export interface EconomicAnalysisInputs {
  project: {
    projectLife: number; // years
    discountRate: number; // %
    inflationRate: number; // %
    electricityTariff: number; // £/kWh
    carbonPrice: number; // £/tCO2
  };
  cableOptions: Array<{
    csa: number; // mm²
    coreCount?: number;
    cableType?: string;
    installationMethod?: string;
    length?: number; // m
    currentRating: number; // A
    resistance: number; // Ω/km
    reactance?: number; // Ω/km
    unitCost?: number; // £/m
    installationCost?: number; // £/m
    costPerMeter: number; // £/m (for backward compatibility)
  }>;
  loadProfile: {
    peakLoad: number; // kW
    averageLoad: number; // kW
    loadFactor: number;
    operatingHours: number; // hours/year
    powerFactor: number;
  };
  constraints: {
    maxVoltageDropPercent: number;
    maxTemperatureRise: number; // °C
    installationRestrictions?: string[];
  };
  environmentalFactors: {
    ambientTemperature: number; // °C
    groupingFactor: number;
    thermalResistivity: number; // K·m/W
  };
  // Additional properties that implementation expects
  cableLength?: number; // m
  installationMethod?: string;
  loadCurrent?: number; // A
  loadFactorHours?: number; // hours/year
  energyCostRate?: number; // £/kWh
  analysisPeriod?: number; // years
  discountRate?: number; // %
  systemVoltage?: number; // V
}

export interface EnergyLossInputs {
  systemConfiguration?: {
    systemVoltage: number; // V
    frequency: number; // Hz
    phases: number;
    systemType: string;
  };
  conductors: Array<{
    conductorId: string;
    csa: number; // mm²
    material: string;
    length: number; // m
    current: number; // A
    powerFactor: number;
    loadType: string;
    temperature: number; // °C
    resistance?: number; // Ω/km
    reactance?: number; // Ω/km
    voltage?: number; // V
    id?: string; // for backward compatibility
  }>;
  transformers?: Array<{
    transformerId: string;
    ratingKVA: number;
    noLoadLoss: number; // W
    loadLoss: number; // W
    noLoadLosses?: number; // W (for backward compatibility)
    loadLosses?: number; // W (for backward compatibility)
    loadingFactor: number; // %
    operatingHours: number;
    rating?: number; // for backward compatibility
    id?: string; // for backward compatibility
  }>;
  operatingConditions: {
    annualOperatingHours: number;
    loadProfile: Array<{
      timeOfDay: string;
      loadFactor: number;
      duration: number; // hours
    }>;
  };
  economicFactors: {
    electricityTariff: number; // £/kWh
    carbonPrice: number; // £/tCO2
    carbonIntensity: number; // tCO2/MWh
  };
  // Additional properties for backward compatibility with implementation
  loadProfile?: Array<number>; // array of load factors
  energyCostRate?: number; // £/kWh
}

// Extended result types with additional properties
export interface LoadFlowResult extends BaseCalculationResult {
  converged: boolean;
  iterations: number;
  busResults: Array<{
    busNumber: number;
    busId?: string;
    voltage: {
      magnitude: number; // pu or V
      angle: number; // degrees
    };
    type: string;
    activePower: number;
    reactivePower: number;
    voltageDropFromNominal?: number;
  }>;
  branchResults: Array<{
    branchId: string;
    fromBus: number;
    toBus: number;
    realPower: number; // MW or kW
    reactivePower: number; // MVAr or kVAr
    current: number; // A
    loading: number; // %
  }>;
  systemSummary: {
    totalGeneration: { P: number; Q: number }; // MW, MVAr
    totalLoad: { P: number; Q: number }; // MW, MVAr
    totalLosses: { P: number; Q: number }; // MW, MVAr
    voltageLimitViolations: Array<{
      busId: string;
      voltage: number;
      limit: number;
    }>;
  };
  contingencyAnalysis?: {
    criticalOutages: string[];
    voltageLimitViolations: Array<{
      outage: string;
      violations: Array<{ busId: string; voltage: number }>;
    }>;
  };
}

// EV Charging Types
export interface CommercialEVChargingInputs {
  facilityType: 'office' | 'retail' | 'hotel' | 'industrial' | 'public';
  numberOfChargers: number;
  chargerTypes: Array<{
    type: string; // e.g., 'AC_7kW', 'DC_50kW', etc.
    power: number; // kW
    quantity: number;
    rating: string;
  }>;
  siteDemand: number; // kW - existing site electrical demand
  siteCapacity: number; // kW - current site electrical capacity
  loadProfile: 'light' | 'medium' | 'heavy' | 'variable';
  futureExpansion: number; // % growth allowance
  gridConnection: {
    capacity: number; // kVA
    voltage: number; // V
    phases: number;
    maxDemand: number; // kW
  };
  transformerCapacity: number; // kVA
  chargingPoints: Array<{
    chargerId: string;
    type: 'AC_7kW' | 'AC_11kW' | 'AC_22kW' | 'DC_50kW' | 'DC_150kW' | 'DC_350kW';
    power: number; // kW
    quantity: number;
    utilization: number; // %
    priority: 'high' | 'medium' | 'low';
  }>;
  loadManagement: {
    strategy: 'static' | 'dynamic' | 'intelligent';
    maxSimultaneousCharging: number;
    peakShaving: boolean;
    timeOfUse: boolean;
  };
  operatingSchedule: {
    businessHours: { start: number; end: number }; // 24h format
    peakUsageHours: number[]; // array of hours
    expectedVehicles: number;
  };
}

export interface CommercialEVChargingResult extends BaseCalculationResult {
  loadAnalysis: {
    peakDemand: number; // kW
    averageDemand: number; // kW
    loadFactor: number;
    simultaneityFactor: number;
    demandProfile: Array<{
      hour: number;
      demand: number; // kW
      utilization: number; // %
    }>;
  };
  gridImpact: {
    maxDemandIncrease: number; // kW
    transformerLoading: number; // %
    voltageImpact: number; // %
    harmonicAnalysis: {
      thdi: number; // %
      thdv: number; // %
    };
    powerQualityMitigation: Array<{
      issue: string;
      solution: string;
      cost: number; // £
    }>;
  };
  economicAnalysis: {
    installationCost: number; // £
    operatingCost: number; // £/year
    revenueProjection: number; // £/year
    paybackPeriod: number; // years
    roi: number; // %
  };
  compliance: {
    bs7671: boolean;
    iet: boolean;
    buildingRegs: boolean;
    requirements: string[];
  };
  recommendations: string[];
}

export interface EVChargingDiversityInputs {
  location: 'residential' | 'workplace' | 'public' | 'highway';
  siteType: 'residential' | 'workplace' | 'public' | 'highway';
  timeProfile: 'constant' | 'business_hours' | 'variable' | 'peak_evening';
  smartCharging: boolean;
  vehicleTypes: Array<{
    type: string;
    proportion: number; // %
    averageBatterySize: number; // kWh
  }>;
  chargingPoints: Array<{
    type: string;
    power: number; // kW
    quantity: number;
    rating: string;
  }>;
  usagePattern: {
    arrivalProfile: number[]; // 24 hour array (%)
    departureProfile: number[]; // 24 hour array (%)
    sessionDuration: number; // hours
    energyRequired: number; // kWh per session
  };
  vehicleData: {
    totalVehicles: number;
    simultaneousCharging: number; // max vehicles charging
    batteryCapacity: number; // kWh average
    chargingEfficiency: number; // %
  };
  seasonalVariation: {
    summer: number; // multiplier
    winter: number; // multiplier
    weekday: number; // multiplier
    weekend: number; // multiplier
  };
}

export interface EVChargingDiversityResult extends BaseCalculationResult {
  diversityFactors: {
    after15min: number;
    after30min: number;
    after1hour: number;
    after2hour: number;
    maximumDemand: number;
  };
  demandProfile: Array<{
    hour: number;
    demand: number; // kW
    chargersActive: number;
    utilizationRate: number; // %
  }>;
  peakDemand: {
    time: string;
    demand: number; // kW
    diversity: number;
    coincidenceFactor: number;
  };
  loadCharacteristics: {
    averageDemand: number; // kW
    loadFactor: number;
    energyConsumption: number; // kWh/day
  };
  gridRequirements: {
    minimumCapacity: number; // kVA
    recommendedCapacity: number; // kVA
    transformerSize: number; // kVA
    cableSize: number; // mm²
  };
}

export interface FastChargingInputs {
  chargerRating: number; // kW
  voltageLevel: number; // kV
  chargingStandard: 'CHAdeMO' | 'CCS' | 'Tesla_Supercharger' | 'Combined';
  coolingMethod: 'air' | 'liquid' | 'immersion';
  cableLength: number; // meters
  ambientTemperature: number; // °C
  utilizationFactor: number; // %
  powerQuality: {
    harmonicLimits: boolean;
    powerFactorCorrection: boolean;
    voltageRegulation: boolean;
  };
  chargingStation: {
    location: 'highway' | 'urban' | 'destination';
    numberOfChargers: number;
    chargerPower: number; // kW (typically 50-350kW)
    technology: 'CHAdeMO' | 'CCS' | 'Tesla_Supercharger' | 'Combined';
  };
  gridConnection: {
    voltage: number; // kV
    capacity: number; // MVA
    impedance: number; // %
    connectionType: 'radial' | 'ring' | 'meshed';
  };
  operationalData: {
    expectedUtilization: number; // %
    averageSessionTime: number; // minutes
    peakHours: number[]; // hours of day
    seasonalVariation: number; // %
  };
  powerElectronics: {
    efficiency: number; // %
    harmonicFiltering: boolean;
    powerFactorCorrection: boolean;
    gridCodeCompliance: string[];
  };
}

export interface FastChargingResult extends BaseCalculationResult {
  powerRequirements: {
    maxDemand: number; // kW
    averageDemand: number; // kW
    reactiveRequirements: number; // kVAr
    apparentPower: number; // kVA
  };
  gridImpact: {
    voltageFlicker: number; // %
    harmonicDistortion: {
      voltage: number; // %
      current: number; // %
    };
    systemStability: {
      impact: 'low' | 'medium' | 'high';
      mitigationRequired: boolean;
    };
  };
  protectionRequirements: {
    faultLevel: number; // kA
    protectionSettings: Array<{
      device: string;
      setting: number;
      purpose: string;
    }>;
    arcFlashCategory: number;
  };
  compliance: {
    gridCode: boolean;
    safety: boolean;
    emc: boolean;
    requirements: string[];
  };
  economicAnalysis: {
    capitalCost: number; // £
    gridConnectionCost: number; // £
    operatingCost: number; // £/year
    revenueProjection: number; // £/year
  };
}

export interface LoadBalancingInputs {
  totalCapacity: number; // kW
  reserveCapacity: number; // kW
  balancingStrategy: 'equal_share' | 'priority_based' | 'time_optimized' | 'cost_optimized';
  timeOfUse: boolean;
  renewableIntegration: boolean;
  batteryStorage: boolean;
  chargingPoints: Array<{
    chargerId: string;
    maxPower: number; // kW
    currentDemand: number; // kW
    priority: 'high' | 'medium' | 'low';
    vehicleConnected: boolean;
    chargeRequired: number; // kWh
    timeConstraint: number; // minutes until departure
    isActive: boolean;
  }>;
  gridConstraints: {
    maxCapacity: number; // kW
    currentLoad: number; // kW
    availableCapacity: number; // kW
    voltageConstraints: {
      min: number; // V
      max: number; // V
    };
  };
  algorithmSettings: {
    balancingStrategy: 'equal_share' | 'priority_based' | 'time_optimized' | 'cost_optimized';
    updateInterval: number; // seconds
    hysteresis: number; // % to prevent oscillation
  };
  renewableGeneration?: {
    currentOutput: number; // kW
    forecastOutput: number[]; // hourly forecast
    storageAvailable: number; // kWh
  };
  tariffStructure?: {
    peakRate: number; // £/kWh
    offPeakRate: number; // £/kWh
    peakHours: number[];
  };
}

export interface LoadBalancingResult extends BaseCalculationResult {
  allocatedPower: Array<{
    chargerId: string;
    allocatedPower: number; // kW
    reductionFactor: number; // %
    priority: string;
    estimatedChargeTime: number; // minutes
  }>;
  systemStatus: {
    totalAllocated: number; // kW
    gridUtilization: number; // %
    efficiencyGain: number; // %
    costSavings: number; // £/session
  };
  controlStrategy: {
    algorithm: string;
    objectives: string[];
    priorityRules: Array<{
      rule: string;
      weight: number;
    }>;
  };
  performanceMetrics: {
    balanceAchieved: boolean;
    responseTime: number; // ms
    stabilityMargin: number; // %
  };
  recommendations: string[];
}
