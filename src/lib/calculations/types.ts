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

export interface LuminousFluxResult {
  totalLumens: number;
  lumensPerLuminaire: number;
  averageLumensPerSquareMeter: number;
  lightingEfficiency: number;
  energyConsumption: number;
  recommendations: string[];
}

export interface RoomIndexResult {
  roomIndex: number;
  roomCategory: string;
  utilizationFactorRange: { min: number; max: number };
  recommendedUtilizationFactor: number;
  recommendations: string[];
}

export interface UtilisationFactorResult {
  utilisationFactor: number;
  lightUtilisationCoefficient: number;
  roomSurfaceReflectances: {
    ceiling: number;
    walls: number;
    floor: number;
  };
  recommendations: string[];
}

export interface MaintenanceFactorResult {
  maintenanceFactor: number;
  lampLumenDepreciation: number;
  luminaireDirtDepreciation: number;
  lampSurvivalFactor: number;
  roomSurfaceDepreciation: number;
  cleaningSchedule: string;
  recommendations: string[];
}

export interface LEDReplacementResult {
  originalWattage: number;
  ledWattage: number;
  energySavings: {
    percentageSaving: number;
    annualKwhSaving: number;
    annualCostSaving: number;
  };
  lightOutput: {
    originalLumens: number;
    ledLumens: number;
    lumensImprovement: number;
  };
  paybackPeriod: number;
  lifetimeSavings: number;
  environmentalBenefit: {
    co2Reduction: number; // kg CO2 per year
    reducedMaintenance: number; // lamp changes per year
  };
  recommendations: string[];
}

export interface EnergyEfficiencyResult {
  lumensPerWatt: number;
  efficacyRating: string; // Poor/Fair/Good/Excellent
  energyClass: string; // A++ to G
  annualEnergyConsumption: number; // kWh
  annualCost: number; // £
  complianceStatus: {
    buildingRegsPartL: boolean;
    minEfficacy: number;
    achieved: number;
  };
  recommendations: string[];
}

export interface UniformityRatioResult {
  averageIlluminance: number;
  minimumIlluminance: number;
  uniformityRatio: number;
  complianceStatus: {
    standard: string;
    requiredRatio: number;
    isCompliant: boolean;
  };
  gridMeasurements: Array<{
    x: number;
    y: number;
    illuminance: number;
  }>;
  recommendations: string[];
}

export interface GlareIndexResult {
  unifiedGlareRating: number; // UGR
  glareCategory: string; // Imperceptible/Perceptible/Disturbing/Intolerable
  complianceStatus: {
    maxUgrAllowed: number;
    isCompliant: boolean;
    standard: string;
  };
  luminairePositions: Array<{
    x: number;
    y: number;
    height: number;
    glareContribution: number;
  }>;
  recommendations: string[];
}

export interface DomesticLightingResult {
  roomType: string;
  recommendedIlluminance: number;
  numberOfLuminaires: number;
  luminaireType: string;
  totalWattage: number;
  switchingArrangement: string[];
  dimmingRecommendation: boolean;
  energyEfficiencyRating: string;
  complianceChecks: {
    buildingRegs: boolean;
    bs7671: boolean;
    partP: boolean;
  };
  annualCost: number;
  recommendations: string[];
}

export interface CommercialLightingResult {
  premiseType: string;
  workingArea: string;
  requiredIlluminance: number;
  designIlluminance: number;
  numberOfLuminaires: number;
  luminaireSpecification: {
    type: string;
    wattage: number;
    lumens: number;
    cri: number; // Color Rendering Index
    colorTemperature: number; // Kelvin
  };
  controlSystems: string[];
  emergencyLighting: {
    required: boolean;
    type: string;
    coverage: string;
  };
  energyConsumption: {
    dailyKwh: number;
    annualKwh: number;
    annualCost: number;
  };
  complianceChecks: {
    bsEn12464: boolean;
    cibseCode: boolean;
    buildingRegsPartL: boolean;
    workplaceRegs: boolean;
  };
  maintenanceSchedule: string[];
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

export interface CableRouteLengthResult {
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
  recommendations: string[];
}

export interface FuseSelectionResult {
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
  recommendations: string[];
}

export interface CableScreenArmourResult {
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
  recommendations: string[];
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
  regulation: string;
}

export interface FaultCurrentResult {
  prospectiveFaultCurrent: number;
  faultCurrentRMS: number;
  peakFaultCurrent: number;
  faultImpedance: number;
  arcingFaultCurrent?: number;
  breakingCapacity?: number;
  isWithinLimits?: boolean;
  faultType?: string;
  regulation?: string;
  recommendations?: string[];
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

// Motor and drive calculation results
export interface MotorLoadResult {
  motorPower: number;
  fullLoadCurrent: number;
  startingCurrent: number;
  apparentPower: number;
  activePower: number;
  reactivePower: number;
  cableRating: number;
  protectionRating: number;
  startingTime: number;
  startingEnergy: number;
  recommendations: string[];
  regulation: string;
}

export interface MotorStartingResult {
  startingMethod: string;
  startingCurrent: number;
  startingTorque: number;
  startingTime: number;
  voltageReduction: number;
  recommendations: string[];
  regulation: string;
}

export interface MotorProtectionResult {
  overloadProtection: number;
  shortCircuitProtection: number;
  thermalProtection: boolean;
  earthFaultProtection: boolean;
  recommendations: string[];
  regulation: string;
}

export interface VFDSizingResult {
  recommendedVFDPower: number;
  vfdCurrent: number;
  inputPower: number;
  efficiency: number;
  harmonicDistortion: number;
  operatingProfile: string;
  recommendations: string[];
  regulation: string;
}

export interface MotorEfficiencyResult {
  efficiency: number;
  inputPower: number;
  actualPower: number;
  losses: number;
  lossPercentage: number;
  annualEnergyConsumption: number;
  annualEnergyCost: number;
  potentialSavings: { annualSavings: number; paybackYears: number } | null;
  recommendations: string[];
  regulation: string;
}

// Specialized applications calculation results
export interface FireAlarmResult {
  numberOfDevices: number;
  standbyCurrentAmps: number;
  alarmCurrentAmps: number;
  batteryCapacityAh: number;
  powerSupplyRating: number;
  minCableCSA: number;
  maxVoltageDrop: number;
  recommendations: string[];
  regulation: string;
}

export interface CCTVResult {
  totalCameras: number;
  totalPowerConsumption: number;
  totalCurrent: number;
  minCableCSA: number;
  upsRating: number;
  batteryBackupTime: number;
  dailyEnergyConsumption: number;
  recommendations: string[];
  regulation: string;
}

export interface DataCenterResult {
  itLoad: number;
  totalFacilityPower: number;
  upsCapacity: number;
  generatorCapacity: number;
  coolingLoad: number;
  totalCurrent: number;
  mainBreakerRating: number;
  batteryCapacity: number;
  pue: number;
  redundancyLevel: string;
  recommendations: string[];
  regulation: string;
}

// Swimming Pool & Spa Calculations Types (BS 7671 Section 702)
export interface SwimmingPoolInputs {
  poolData: {
    poolType: 'outdoor' | 'indoor' | 'natural';
    volume: number; // m³
    fillType: 'freshwater' | 'saltwater';
    treatmentType: 'chlorine' | 'salt' | 'uv' | 'ozone';
    heatingRequired: boolean;
    lightingRequired: boolean;
  };
  equipment: {
    pumps: Array<{
      power: number; // kW
      type: 'circulation' | 'filtration' | 'cleaning';
      operatingHours: number; // hours/day
    }>;
    heaters: Array<{
      power: number; // kW
      type: 'electric' | 'heat_pump';
      efficiency: number; // %
    }>;
    lighting: Array<{
      voltage: 12 | 24; // V (extra-low voltage only)
      power: number; // W per light
      quantity: number;
      location: 'underwater' | 'poolside' | 'surrounding';
    }>;
    accessories: Array<{
      name: string;
      power: number; // W
      location: 'zone0' | 'zone1' | 'zone2' | 'outside_zones';
    }>;
  };
  installation: {
    zone0Distance: number; // m (inside pool)
    zone1Distance: number; // m (2m horizontal from pool edge)
    zone2Distance: number; // m (1.5m beyond zone 1)
    earthingRequired: boolean;
    equipotentialBonding: boolean;
    rcdProtection: '10mA' | '30mA';
  };
}

export interface SwimmingPoolResult {
  zoneClassification: {
    zone0: { description: string; ipRating: string; maxVoltage: number };
    zone1: { description: string; ipRating: string; maxVoltage: number };
    zone2: { description: string; ipRating: string; maxVoltage: string };
  };
  powerCalculations: {
    pumpLoad: number; // kW
    heatingLoad: number; // kW
    lightingLoad: number; // kW
    auxiliaryLoad: number; // kW
    totalLoad: number; // kW
    diversityFactor: number;
    maximumDemand: number; // kW
  };
  protectionRequirements: {
    rcdType: string;
    rcdRating: string;
    mcbRating: number; // A
    cableType: string;
    equipotentialBonding: string[];
    earthingArrangement: string;
  };
  safetyRequirements: {
    isolationRequired: boolean;
    emergencyStop: boolean;
    warningNotices: string[];
    accessRestrictions: string[];
    maintenanceRequirements: string[];
  };
  compliance: {
    bs7671Section702: boolean;
    buildingRegulations: boolean;
    healthSafetyCompliance: boolean;
    planningPermissionNote: string;
  };
  recommendations: string[];
  regulation: string;
}

// Caravan & Marina Supply Types (BS 7671 Section 708/709)
export interface CaravanMarinaInputs {
  facilityType: 'caravan_park' | 'marina' | 'motorhome_site' | 'boat_yard';
  numberOfPitches: number;
  supplyData: {
    voltage: 230 | 400; // V
    phases: 1 | 3;
    frequency: 50; // Hz
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT';
  };
  pitchRequirements: {
    standard16A: number; // number of 16A CEE outlets
    higherRated32A: number; // number of 32A CEE outlets  
    waterSupply: boolean;
    wasteConnection: boolean;
    tvAerial: boolean;
    internetConnection: boolean;
  };
  marineSpecific?: {
    shoreConnections: number;
    boatSizes: Array<{
      length: number; // m
      maxPower: number; // kW
      quantity: number;
    }>;
    fuelPumps: number;
    craneFacilities: boolean;
    workShops: boolean;
  };
  environmentalFactors: {
    weatherExposure: 'sheltered' | 'exposed' | 'severe';
    saltWaterExposure: boolean;
    floodRisk: boolean;
    corrosiveEnvironment: boolean;
  };
}

export interface CaravanMarinaResult {
  loadCalculations: {
    diversityFactors: {
      lighting: number; // %
      heating: number; // %
      powerOutlets: number; // %
      overall: number; // %
    };
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    coincidenceFactor: number;
    futureExpansion: number; // %
  };
  distributionDesign: {
    mainSupplyRating: number; // A
    distributionMethod: string;
    pillarLocations: number;
    cableRequirements: {
      mainCable: string;
      distributionCables: string;
      dropCables: string;
    };
  };
  protectionRequirements: {
    incomingProtection: string;
    rcdProtection: '30mA' | '100mA' | '300mA';
    surgeProtection: boolean;
    isolationRequirements: string[];
    emergencyIsolation: boolean;
  };
  outletSpecification: {
    ceeOutlets: {
      '16A': { type: string; ipRating: string; mounting: string };
      '32A': { type: string; ipRating: string; mounting: string };
    };
    additionalOutlets: string[];
    meteringRequirements: boolean;
  };
  environmentalConsiderations: {
    ipRating: string;
    cableProtection: string;
    corrosionProtection: string[];
    earthingSpecial: boolean;
    lightningProtection: boolean;
  };
  compliance: {
    bs7671Section708: boolean; // Caravan parks
    bs7671Section709: boolean; // Marinas
    marineSafetyCode: boolean;
    environmentalRegulations: boolean;
  };
  recommendations: string[];
  regulation: string;
}

// Agricultural Installation Types (BS 7671 Section 705)
export interface AgriculturalInputs {
  farmType: 'dairy' | 'livestock' | 'arable' | 'mixed' | 'poultry' | 'pig' | 'equestrian';
  buildings: Array<{
    buildingType: 'barn' | 'stable' | 'milking_parlour' | 'grain_store' | 'workshop' | 'farmhouse';
    area: number; // m²
    animalAccess: boolean;
    washdownRequired: boolean;
    climateControl: boolean;
    specialRequirements: string[];
  }>;
  electricalLoads: {
    lighting: {
      generalLighting: number; // W/m²
      taskLighting: number; // W
      emergencyLighting: boolean;
      securityLighting: boolean;
    };
    machinery: Array<{
      name: string;
      power: number; // kW
      startingMethod: 'direct' | 'star_delta' | 'soft_start' | 'vfd';
      usage: 'continuous' | 'intermittent' | 'seasonal';
      location: 'indoor' | 'outdoor' | 'mobile';
    }>;
    ventilation: {
      fans: number; // quantity
      fanPower: number; // W each
      climateControl: boolean;
      heatingLoad: number; // kW
    };
    milkingEquipment?: {
      milkingMachines: number;
      coolingTanks: number; // kW
      washingSystems: number; // kW
      feedingSystems: boolean;
    };
  };
  environmentalConditions: {
    dampness: 'low' | 'medium' | 'high';
    dustLevel: 'low' | 'medium' | 'high';
    corrosiveSubstances: boolean;
    animalContact: boolean;
    mechanicalDamage: 'low' | 'medium' | 'high';
    temperatureRange: { min: number; max: number }; // °C
  };
}

export interface AgriculturalResult {
  loadAssessment: {
    lightingLoad: number; // kW
    machineryLoad: number; // kW
    ventilationLoad: number; // kW
    specialistLoad: number; // kW (milking etc.)
    totalConnectedLoad: number; // kW
    diversityFactors: {
      lighting: number; // %
      machinery: number; // %
      ventilation: number; // %
      overall: number; // %
    };
    maximumDemand: number; // kW
  };
  protectionRequirements: {
    ipRatings: {
      generalAreas: string;
      animalAreas: string;
      washdownAreas: string;
      outdoorAreas: string;
    };
    rcdProtection: {
      socketOutlets: '30mA';
      fixed_equipment: '100mA' | '300mA';
      fireProtection: boolean;
    };
    additionalProtection: {
      surgeProtection: boolean;
      isolationSwitches: string[];
      emergencyStop: boolean;
    };
  };
  installationMethods: {
    cableTypes: {
      underground: string[];
      overhead: string[];
      indoorFixed: string[];
      flexible: string[];
    };
    cabingMethods: {
      underground: string;
      overhead: string;
      indoorRoutes: string[];
      protection: string[];
    };
  };
  specialConsiderations: {
    animalSafety: string[];
    firePrevention: string[];
    operationalRequirements: string[];
    maintenanceAccess: string[];
  };
  earthingBonding: {
    earthingMethod: string;
    bondingRequirements: string[];
    specialEarthing: boolean;
    lightningProtection: boolean;
  };
  compliance: {
    bs7671Section705: boolean;
    animalWelfareRegs: boolean;
    healthSafetyRegs: boolean;
    environmentalRegs: boolean;
    fireRegulations: boolean;
  };
  recommendations: string[];
  regulation: string;
}

// Temporary Supply Types (BS 7671 Section 717)
export interface TemporarySupplyInputs {
  supplyType: 'construction_site' | 'exhibition' | 'market' | 'fair' | 'event' | 'maintenance';
  duration: 'less_than_3_months' | '3_to_12_months' | 'over_12_months';
  supplyRequirements: {
    voltage: 110 | 230 | 400; // V
    phases: 1 | 3;
    maxDemand: number; // kW
    continuousOperation: boolean;
  };
  constructionSite?: {
    siteArea: number; // m²
    buildingHeight: number; // m (for crane consideration)
    machinery: Array<{
      name: string;
      power: number; // kW
      quantity: number;
      mobile: boolean;
    }>;
    accommodation: {
      offices: number;
      welfare: number;
      storage: number;
    };
    lighting: {
      siteArea: number; // W/m²
      roadways: number; // W/m
      workAreas: number; // W/m²
      security: boolean;
    };
  };
  environmentalConditions: {
    outdoor: boolean;
    weatherExposed: boolean;
    mechanicalDamage: 'low' | 'medium' | 'high';
    publicAccess: boolean;
    specialHazards: string[];
  };
  distribution: {
    assemblies: number; // number of distribution assemblies
    outlets: {
      '16A_sockets': number;
      '32A_sockets': number;
      '63A_sockets': number;
      specialOutlets: number;
    };
    cableRoutes: {
      overhead: boolean;
      underground: boolean;
      surfaceCables: boolean;
      temporaryStructures: boolean;
    };
  };
}

export interface TemporarySupplyResult {
  supplyDesign: {
    incomingSupply: {
      voltage: number; // V
      rating: number; // A
      phases: number;
      earthing: string;
      isolationMethod: string;
    };
    loadCalculation: {
      connectedLoad: number; // kW
      diversityFactor: number; // %
      maximumDemand: number; // kW
      futureExpansion: number; // %
    };
  };
  distributionSystem: {
    assemblies: Array<{
      assemblyType: string;
      rating: number; // A
      outlets: { [type: string]: number };
      protection: string[];
      ipRating: string;
    }>;
    cableRequirements: {
      mainCables: string[];
      distributionCables: string[];
      flexibleCables: string[];
    };
  };
  protectionMeasures: {
    rcdProtection: {
      incomingRCD: string;
      socketRCDs: '30mA';
      additionalRCDs: string[];
    };
    additionalProtection: {
      surgeProtection: boolean;
      isolationPoints: number;
      emergencyIsolation: boolean;
      mechanicalProtection: string[];
    };
  };
  safetyRequirements: {
    inspectionTesting: {
      initialVerification: boolean;
      periodicInspection: string;
      portableAppliances: string;
      records: string[];
    };
    operationalSafety: {
      competentPersons: boolean;
      userInstructions: string[];
      maintenanceSchedule: string[];
      hazardIdentification: string[];
    };
  };
  installationGuidance: {
    cableInstallation: string[];
    earthingArrangements: string[];
    equipmentMounting: string[];
    signageRequirements: string[];
  };
  compliance: {
    bs7671Section717: boolean;
    constructionRegs: boolean;
    healthSafetyRegs: boolean;
    publicSafetyReqs: boolean;
  };
  recommendations: string[];
  regulation: string;
}

// Hazardous Area Types (BS EN 60079 series)
export interface HazardousAreaInputs {
  areaClassification: {
    zone: '0' | '1' | '2' | '20' | '21' | '22'; // Gas/Dust zones
    substanceType: 'gas_vapour' | 'combustible_dust';
    temperatureClass: 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
    gasGroup: 'IIA' | 'IIB' | 'IIC' | 'IIIA' | 'IIIB' | 'IIIC';
    ignitionTemperature: number; // °C
  };
  installationDetails: {
    equipmentRequired: Array<{
      type: 'lighting' | 'power' | 'control' | 'instrumentation';
      power: number; // W
      voltage: number; // V
      operatingTemp: number; // °C
      quantity: number;
    }>;
    cableRequirements: {
      totalLength: number; // m
      routes: 'direct_buried' | 'cable_tray' | 'conduit' | 'armoured';
      terminationMethod: string;
    };
    earthingRequirements: {
      earthingRequired: boolean;
      bondingRequired: boolean;
      antistaticRequirements: boolean;
    };
  };
  environmentalFactors: {
    ambientTemperature: { min: number; max: number }; // °C
    humidity: number; // %
    corrosiveEnvironment: boolean;
    mechanicalStresses: boolean;
    ventilationType: 'natural' | 'forced' | 'pressurized';
  };
}

export interface HazardousAreaResult {
  equipmentSpecification: {
    protectionConcept: string; // Ex d, Ex e, Ex i, etc.
    certificationRequired: string[];
    equipmentCategories: {
      category: string;
      suitableFor: string[];
      markingRequired: string;
    };
    installationRequirements: string[];
  };
  cableAndWiring: {
    cableTypes: {
      powerCables: string[];
      controlCables: string[];
      instrumentationCables: string[];
    };
    installationMethods: {
      acceptableMethods: string[];
      prohibitedMethods: string[];
      sealingRequirements: string[];
    };
    terminationRequirements: {
      glanding: string[];
      barriers: string[];
      isolators: string[];
    };
  };
  earthingAndBonding: {
    earthingSystem: string;
    bondingRequirements: string[];
    resistanceRequirements: {
      earthing: number; // Ω
      bonding: number; // Ω
      antistatic: number; // MΩ
    };
    testingRequirements: string[];
  };
  inspectionTesting: {
    initialVerification: {
      visualInspection: string[];
      testingRequired: string[];
      documentation: string[];
    };
    periodicInspection: {
      frequency: string;
      testsProcedures: string[];
      maintenanceRequirements: string[];
    };
    competencyRequirements: string[];
  };
  complianceStandards: {
    bsEn60079Series: boolean;
    atexDirectives: boolean;
    dsearCompliance: boolean;
    iecExStandards: boolean;
  };
  safetyConsiderations: {
    riskAssessment: string[];
    emergencyProcedures: string[];
    personnelTraining: string[];
    documentationRequired: string[];
  };
  recommendations: string[];
  regulation: string;
}

// =====================================
// Maximum Capacity Calculation Types
// =====================================
export interface SwitchgearRatingInputs {
  systemVoltage: number; // V
  totalLoad: number; // kW
  prospectiveFaultCurrent: number; // kA
  switchgearType: 'air_insulated' | 'gas_insulated' | 'vacuum' | 'sf6';
  operatingConditions: {
    indoor: boolean;
    ambientTemperature: number; // °C
    altitude: number; // m
    pollution: 'light' | 'medium' | 'heavy' | 'very_heavy';
  };
  protectionRequirements: string[];
  automationLevel: 'manual' | 'semi_automatic' | 'fully_automatic';
}

export interface SwitchgearRatingResult {
  nominalVoltage: number; // kV
  nominalCurrent: number; // A
  shortCircuitRating: {
    breakingCurrent: number; // kA
    makingCurrent: number; // kA peak
    shortTimeRating: number; // kA for 1s
  };
  busbarRating: {
    continuousCurrent: number; // A
    shortTimeCurrent: number; // kA
    peakCurrent: number; // kA
  };
  insulationLevel: {
    powerFrequencyVoltage: number; // kV
    lightningImpulseVoltage: number; // kV
    switchingImpulseVoltage: number; // kV
  };
  mechanicalSpecification: {
    operatingMechanism: string;
    numberOfOperations: number;
    operatingTime: number; // ms
  };
  protectionCoordination: string[];
  installationRequirements: string[];
  maintenanceRequirements: string[];
  economics: {
    equipmentCost: number; // £
    installationCost: number; // £
    maintenanceCost: number; // £/year
  };
  recommendations: string[];
  regulation: string;
}

export interface BusbarCurrentInputs {
  busbarType: 'rectangular' | 'circular' | 'tubular' | 'multistrip';
  material: 'copper' | 'aluminium' | 'silver_plated';
  dimensions: {
    width?: number; // mm (rectangular)
    thickness?: number; // mm (rectangular)
    diameter?: number; // mm (circular)
    numberOfStrips?: number; // (multistrip)
  };
  installationMethod: 'enclosed' | 'open_air' | 'duct' | 'cable_tray';
  ambientTemperature: number; // °C
  temperatureRise: number; // K (allowable)
  ventilation: 'natural' | 'forced' | 'none';
  spacing: number; // mm between phases
  length: number; // m
}

export interface BusbarCurrentResult {
  continuousCurrentRating: number; // A
  shortTimeCurrentRating: number; // kA for 1s
  peakCurrentRating: number; // kA
  thermalCalculation: {
    steadyStateTemperature: number; // °C
    temperatureRise: number; // K
    thermalResistance: number; // K/W
    powerloss: number; // W/m
  };
  mechanicalStresses: {
    electromagneticForce: number; // N/m
    mechanicalResonance: number; // Hz
    supportSpacing: number; // m
  };
  voltageDrop: {
    resistiveComponent: number; // mV/A/m
    reactiveComponent: number; // mV/A/m
    totalVoltageDrop: number; // mV/A/m
  };
  shortCircuitEffects: {
    maxTemperature: number; // °C
    thermalStress: string;
    expansionForces: number; // N
  };
  insulationRequirements: {
    clearanceDistance: number; // mm
    creepageDistance: number; // mm
    insulationLevel: string;
  };
  economics: {
    materialCost: number; // £/m
    installationCost: number; // £/m
    lossesCost: number; // £/year
  };
  recommendations: string[];
  regulation: string;
}

// Safety & Testing Calculation Types

export interface InsulationResistanceInputs {
  testVoltage: number; // V (250V, 500V, 1000V)
  circuitType: 'lv_circuit' | 'extra_low_voltage' | 'fire_alarm' | 'telecom' | 'ring_circuit' | 'radial_circuit';
  installationType: 'new_installation' | 'existing_installation' | 'after_alteration' | 'periodic_inspection';
  environmentalConditions: {
    temperature: number; // °C
    humidity: number; // %
    contamination: 'clean' | 'dusty' | 'damp' | 'corrosive';
  };
  cableLength: number; // m
  numberOfCores: number;
  cableType: 'pvc' | 'xlpe' | 'epr' | 'lsf' | 'mineral';
  connectedEquipment: boolean;
  surgeSuppressors: boolean;
}

export interface InsulationResistanceResult {
  minimumResistance: number; // MΩ
  measuredResistance: number; // MΩ
  testResult: 'pass' | 'fail' | 'investigate';
  temperatureCorrectionFactor: number;
  correctedResistance: number; // MΩ
  complianceAssessment: {
    bs7671Compliant: boolean;
    ieeStandard: string;
    acceptableRange: string;
  };
  recommendations: string[];
  remedialActions: string[];
  retestRequired: boolean;
  regulation: string;
}

export interface ContinuityTestInputs {
  testType: 'protective_conductor' | 'ring_circuit' | 'bonding_conductor' | 'cpc_continuity';
  conductorCsa: number; // mm²
  conductorLength: number; // m
  conductorMaterial: 'copper' | 'aluminium';
  testCurrent: number; // A (typical 10A or 200mA)
  ambientTemperature: number; // °C
  expectedResistance?: number; // mΩ (for comparison)
  ringCircuitDetails?: {
    liveConductorCsa: number; // mm²
    cpcCsa: number; // mm²
    totalLength: number; // m
  };
}

export interface ContinuityTestResult {
  expectedResistance: number; // mΩ
  measuredResistance: number; // mΩ
  testResult: 'pass' | 'fail' | 'investigate';
  temperatureCorrectedResistance: number; // mΩ
  deviationFromExpected: number; // %
  complianceAssessment: {
    bs7671Compliant: boolean;
    acceptableTolerance: string;
    limitValues: string;
  };
  ringCircuitAnalysis?: {
    r1: number; // mΩ
    r2: number; // mΩ
    rn: number; // mΩ
    ringIntegrity: 'good' | 'poor' | 'broken';
  };
  recommendations: string[];
  remedialActions: string[];
  regulation: string;
}

export interface PolarityTestInputs {
  installationType: 'new_installation' | 'addition' | 'alteration' | 'periodic_inspection';
  circuitType: 'lighting' | 'socket_outlet' | 'fixed_equipment' | 'control_circuit' | 'three_phase';
  supplySystem: 'single_phase' | 'three_phase_3wire' | 'three_phase_4wire';
  testMethod: 'continuity' | 'low_voltage' | 'approved_voltage_indicator';
  circuitsToTest: string[];
  switchgearType: 'consumer_unit' | 'distribution_board' | 'motor_control_center';
  earthingArrangement: 'tn_s' | 'tn_c_s' | 'tt' | 'it';
}

export interface PolarityTestResult {
  overallResult: 'pass' | 'fail' | 'not_applicable';
  circuitResults: Array<{
    circuitId: string;
    result: 'correct' | 'reversed' | 'not_tested';
    description: string;
  }>;
  criticalFindings: string[];
  complianceAssessment: {
    bs7671Compliant: boolean;
    safetyRequirements: string[];
    regulationReferences: string[];
  };
  recommendations: string[];
  remedialActions: string[];
  retestRequired: boolean;
  regulation: string;
}

export interface PhaseSequenceInputs {
  supplyType: 'three_phase_3wire' | 'three_phase_4wire';
  nominalVoltage: number; // V
  frequency: number; // Hz
  loadType: 'motor' | 'transformer' | 'general_load' | 'ups' | 'inverter';
  rotationDirection: 'clockwise' | 'anticlockwise' | 'not_specified';
  testMethod: 'phase_sequence_indicator' | 'motor_rotation' | 'oscilloscope';
  installationType: 'new_installation' | 'maintenance' | 'fault_finding';
}

export interface PhaseSequenceResult {
  phaseSequence: 'l1_l2_l3' | 'l1_l3_l2' | 'incorrect' | 'unable_to_determine';
  rotationDirection: 'clockwise' | 'anticlockwise';
  testResult: 'correct' | 'incorrect' | 'requires_correction';
  voltageReadings: {
    l1_l2: number; // V
    l2_l3: number; // V
    l3_l1: number; // V
    l1_n?: number; // V
    l2_n?: number; // V
    l3_n?: number; // V
  };
  complianceAssessment: {
    bs7671Compliant: boolean;
    motorCompatible: boolean;
    loadCompatible: boolean;
  };
  recommendations: string[];
  correctionRequired: boolean;
  correctionMethod: string;
  regulation: string;
}

export interface AppliedVoltageTestInputs {
  testVoltage: number; // V (typically 2×Un + 1000V or 1.5×Un + 2000V)
  equipmentType: 'switchgear' | 'motor' | 'transformer' | 'cable' | 'panel' | 'busbar';
  ratedVoltage: number; // V
  testDuration: number; // seconds
  testStandard: 'bs_en_60439' | 'bs_en_61439' | 'bs_en_60076' | 'bs_7671' | 'bs_en_50522';
  insulationClass: 'class_0' | 'class_1' | 'class_2' | 'class_3';
  environmentalConditions: {
    temperature: number; // °C
    humidity: number; // %
    altitude: number; // m
  };
  equipmentCondition: 'new' | 'existing' | 'after_repair' | 'periodic_test';
}

export interface AppliedVoltageTestResult {
  testVoltageApplied: number; // V
  testDuration: number; // seconds
  leakageCurrent: number; // mA
  testResult: 'pass' | 'fail' | 'breakdown';
  breakdownVoltage?: number; // V
  complianceAssessment: {
    standardCompliant: boolean;
    safetyMargin: number; // %
    acceptanceCriteria: string;
  };
  insulationQuality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'failed';
  recommendations: string[];
  remedialActions: string[];
  retestSchedule: string;
  safetyConsiderations: string[];
  regulation: string;
}

export interface FunctionalTestInputs {
  systemType: 'rcd' | 'rcbo' | 'afdd' | 'spd' | 'emergency_lighting' | 'fire_alarm' | 'security_system';
  testType: 'commissioning' | 'periodic' | 'maintenance' | 'fault_investigation';
  equipmentDetails: {
    manufacturer: string;
    model: string;
    ratingDetails: string;
    installationDate: string;
  };
  testParameters: {
    nominalCurrent?: number; // A
    tripCurrent?: number; // mA
    tripTime?: number; // ms
    testVoltage?: number; // V
    frequency?: number; // Hz
  };
  environmentalConditions: {
    temperature: number; // °C
    humidity: number; // %
  };
  loadConditions: 'no_load' | 'partial_load' | 'full_load';
}

export interface FunctionalTestResult {
  overallResult: 'pass' | 'fail' | 'partial_pass';
  individualTests: Array<{
    testName: string;
    result: 'pass' | 'fail' | 'not_applicable';
    measuredValue?: number;
    expectedValue?: number;
    tolerance?: string;
    notes?: string;
  }>;
  performanceAssessment: {
    withinSpecification: boolean;
    performanceDegradation: number; // %
    operationalReliability: 'excellent' | 'good' | 'acceptable' | 'poor';
  };
  complianceAssessment: {
    standardCompliant: boolean;
    regulationReferences: string[];
    certificateValid: boolean;
  };
  recommendations: string[];
  maintenanceSchedule: string;
  replacementRecommended: boolean;
  nextTestDate: string;
  regulation: string;
}

// Advanced Calculations - Short Circuit Analysis
export interface ShortCircuitAnalysisInputs {
  systemConfiguration: {
    systemType: 'radial' | 'ring' | 'mesh' | 'interconnected';
    voltageLevel: number; // kV
    frequency: number; // Hz
    faultType: 'three_phase' | 'line_to_line' | 'line_to_ground' | 'line_to_line_to_ground';
    faultLocation: string;
  };
  sourceData: {
    sourceImpedance: number; // Ω
    sourceVoltage: number; // V
    sourceType: 'generator' | 'transformer' | 'utility_supply' | 'motor_contribution';
    sourceCapacity: number; // MVA
    xOverRRatio: number; // X/R ratio
  };
  networkData: {
    conductors: Array<{
      type: 'cable' | 'overhead_line' | 'busbar';
      length: number; // m
      resistance: number; // Ω/km
      reactance: number; // Ω/km
      current_rating: number; // A
    }>;
    transformers?: Array<{
      rating: number; // kVA
      impedance: number; // %
      xOverRRatio: number;
      tapPosition: number;
    }>;
    motors?: Array<{
      rating: number; // HP/kW
      efficiency: number; // %
      powerFactor: number;
      startingCurrent: number; // multiple of FLC
    }>;
  };
  protectionSettings: {
    timeDelay: number; // seconds
    currentSetting: number; // A
    protectionType: 'instantaneous' | 'definite_time' | 'inverse_time' | 'directional';
  };
}

export interface ShortCircuitAnalysisResult {
  faultCurrents: {
    initialSymmetricalRMS: number; // A
    peakAsymmetrical: number; // A
    momentaryRMS: number; // A (first cycle)
    interruptingRMS: number; // A (after few cycles)
    steadyStateRMS: number; // A (final value)
  };
  voltageProfile: {
    prefaultVoltage: number; // V
    faultVoltage: number; // V
    voltageDepressionPercent: number; // %
    recoveryTime: number; // s
  };
  protectionAnalysis: {
    operatingTime: number; // s
    clearingTime: number; // s
    arcEnergyLevel: number; // cal/cm²
    protectionCoordination: 'adequate' | 'marginal' | 'inadequate';
  };
  equipmentStress: {
    thermalStress: number; // I²t
    mechanicalStress: number; // peak force
    arcFlashBoundary: number; // inches/mm
    arcEnergyLevel: number; // cal/cm²
    personalProtectiveEquipment: string;
  };
  systemStability: {
    voltageStability: 'stable' | 'marginal' | 'unstable';
    frequencyDeviation: number; // Hz
    transientStability: 'stable' | 'critical' | 'unstable';
  };
  recommendations: string[];
  complianceAssessment: {
    bs7671Compliant: boolean;
    ieeStandards: string[];
    arcFlashCompliant: boolean;
  };
  regulation: string;
}

// Advanced Calculations - Voltage Regulation Calculator
export interface VoltageRegulationInputs {
  systemConfiguration: {
    systemType: 'single_phase' | 'three_phase_3wire' | 'three_phase_4wire';
    nominalVoltage: number; // V
    frequency: number; // Hz
    supplierTolerance: number; // % (typically ±6% UK)
  };
  loadData: {
    activePower: number; // W
    reactivePower: number; // VAR
    powerFactor: number;
    loadType: 'resistive' | 'inductive' | 'capacitive' | 'mixed' | 'motor' | 'led_lighting';
    loadCurve: 'constant' | 'variable' | 'intermittent';
  };
  conductorData: {
    conductorType: 'copper' | 'aluminium';
    cableLength: number; // m
    conductorCSA: number; // mm²
    resistance: number; // Ω/km
    reactance: number; // Ω/km
    installationMethod: string;
    groupingFactor: number;
    ambientTemperature: number; // °C
  };
  regulationRequirements: {
    maxVoltageVariation: number; // % (typically 3% final circuits, 6% distribution)
    regulationStandard: 'bs_en_50160' | 'bs_7671' | 'g59' | 'custom';
    criticalLoad: boolean;
    regulationPoint: 'origin' | 'load_end' | 'most_onerous_point';
  };
  compensationOptions?: {
    voltageRegulator: boolean;
    powerFactorCorrection: boolean;
    distributedGeneration: boolean;
    energyStorage: boolean;
  };
}

export interface VoltageRegulationResult {
  voltageProfile: {
    sourceVoltage: number; // V
    noLoadVoltage: number; // V
    fullLoadVoltage: number; // V
    voltageRegulation: number; // %
    voltageVariation: number; // %
  };
  complianceAssessment: {
    withinLimits: boolean;
    bs7671Compliant: boolean;
    en50160Compliant: boolean;
    maxPermissibleDrop: number; // %
    actualDrop: number; // %
    safetyMargin: number; // %
  };
  loadAnalysis: {
    currentAtLoad: number; // A
    powerAtLoad: number; // W
    energyLosses: number; // W
    efficiencyPercent: number; // %
    powerFactorAtLoad: number;
  };
  improvementSuggestions: {
    conductorUpgrade?: {
      recommendedCSA: number; // mm²
      improvementPercent: number; // %
      costBenefit: 'high' | 'medium' | 'low';
    };
    powerFactorCorrection?: {
      requiredCapacitance: number; // μF
      improvementPercent: number; // %
      paybackPeriod: number; // months
    };
    voltageRegulator?: {
      recommended: boolean;
      tapRange: string;
      improvementPercent: number; // %
    };
    loadManagement?: {
      recommended: boolean;
      loadShifting: boolean;
      demandReduction: number; // %
    };
  };
  economicAnalysis: {
    energyLossCost: number; // £/year
    upgradeCost: number; // £
    paybackPeriod: number; // years
    netPresentValue: number; // £
  };
  recommendations: string[];
  regulation: string;
}

// Advanced Calculations - Harmonics Analysis
export interface HarmonicsAnalysisInputs {
  systemData: {
    systemVoltage: number; // V
    frequency: number; // Hz
    systemType: 'single_phase' | 'three_phase';
    neutralSize: number; // mm² (for three-phase systems)
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  };
  loadData: {
    nonLinearLoads: Array<{
      loadType: 'led_lighting' | 'cfl_lighting' | 'computer_equipment' | 'ups_systems' | 'vfd_drives' | 'welding_equipment' | 'rectifiers';
      power: number; // W
      quantity: number;
      harmonicSpectrum: { [harmonic: number]: number }; // Harmonic order: magnitude %
      thdi: number; // Total Harmonic Distortion Current %
    }>;
    linearLoads: {
      totalPower: number; // W
      powerFactor: number;
    };
  };
  systemImpedance: {
    sourceImpedance: number; // Ω
    lineImpedance: number; // Ω
    neutralImpedance?: number; // Ω
  };
  complianceStandards: {
    standard: 'bs_en_61000_3_2' | 'bs_en_61000_3_4' | 'bs_en_61000_3_12' | 'ieee_519' | 'g5_4';
    voltageClass: 'lv' | 'mv' | 'hv';
    locationClass: 'domestic' | 'commercial' | 'industrial';
  };
}

export interface HarmonicsAnalysisResult {
  harmonicSpectrum: {
    fundamentalCurrent: number; // A
    harmonicCurrents: { [order: number]: number }; // A
    harmonicVoltages: { [order: number]: number }; // V
    phaseAngles: { [order: number]: number }; // degrees
  };
  distortionFactors: {
    thdv: number; // Total Harmonic Distortion Voltage %
    thdi: number; // Total Harmonic Distortion Current %
    tdd: number; // Total Demand Distortion %
    kFactor: number; // K-factor for transformers
    crestFactor: number; // Peak to RMS ratio
  };
  systemEffects: {
    neutralCurrent: number; // A
    powerLosses: number; // W
    heatingEffects: number; // % increase
    powerFactorDistortion: number;
    trueRMSCurrent: number; // A
  };
  complianceAssessment: {
    withinLimits: boolean;
    standardCompliant: boolean;
    exceedanceLevels: { [harmonic: number]: number }; // % above limit
    remedialActionRequired: boolean;
  };
  mitigationSuggestions: {
    filtering: {
      required: boolean;
      filterType: 'passive' | 'active' | 'hybrid';
      resonanceRisk: 'low' | 'medium' | 'high';
    };
    neutralUpgrading: {
      required: boolean;
      recommendedSize: number; // mm²
      currentReduction: number; // %
    };
    loadManagement: {
      phaseBalancing: boolean;
      loadScheduling: boolean;
      diversityImprovement: number; // %
    };
    systemModifications: {
      transformerKRating: number;
      conductorDerating: number; // %
      protectionAdjustment: boolean;
    };
  };
  economicImpact: {
    additionalLosses: number; // £/year
    equipmentLifeReduction: number; // %
    mitigationCost: number; // £
    paybackPeriod: number; // years
  };
  recommendations: string[];
  regulation: string;
}

// Arc Fault Analysis Types
export interface ArcFaultAnalysisInputs {
  systemData: {
    systemVoltage: number; // V
    systemType: 'single_phase' | 'three_phase';
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
    frequency: number; // Hz
    systemCapacity: number; // kVA
  };
  faultData: {
    faultLocation: 'busbar' | 'cable_termination' | 'switchgear' | 'motor_terminal' | 'panel_connection';
    gapDistance: number; // mm
    electrodeConfig: 'copper_copper' | 'copper_steel' | 'aluminum_copper' | 'carbon_copper';
    ambientConditions: {
      temperature: number; // °C
      humidity: number; // %
      pressure: number; // kPa
      airflow: 'still' | 'natural' | 'forced';
    };
  };
  protectionData: {
    arcFaultDevices: Array<{
      type: 'afci_breaker' | 'afdd_device' | 'arc_detection_relay';
      responseTime: number; // ms
      sensitivity: number; // A (arc current threshold)
      installed: boolean;
    }>;
    conventionalProtection: {
      deviceType: 'mcb' | 'mccb' | 'fuse' | 'contactor';
      rating: number; // A
      breakingCapacity: number; // kA
      responseTime: number; // ms
    };
  };
  installationData: {
    cableType: string;
    conductorMaterial: 'copper' | 'aluminum';
    insulationType: 'pvc' | 'xlpe' | 'epr' | 'mi';
    installationMethod: string;
    enclosureType: 'open' | 'enclosed' | 'sealed';
  };
}

export interface ArcFaultAnalysisResult {
  arcCharacteristics: {
    arcVoltage: number; // V
    arcCurrent: number; // A
    arcResistance: number; // Ω
    arcPower: number; // W
    arcEnergy: number; // J (until protection operates)
  };
  thermalEffects: {
    arcTemperature: number; // °C
    heatGenerated: number; // J
    thermalDamageRadius: number; // mm
    materialIgnitionRisk: 'low' | 'medium' | 'high' | 'critical';
    gasExpansionPressure: number; // kPa
  };
  protectionAnalysis: {
    arcFaultDetected: boolean;
    detectionTime: number; // ms
    clearanceTime: number; // ms
    totalFaultDuration: number; // ms
    energyLetThrough: number; // J
    adequateProtection: boolean;
  };
  riskAssessment: {
    personalSafetyRisk: 'low' | 'medium' | 'high' | 'critical';
    equipmentDamageRisk: 'low' | 'medium' | 'high' | 'critical';
    fireCauseRisk: 'low' | 'medium' | 'high' | 'critical';
    structuralDamageRisk: 'low' | 'medium' | 'high' | 'critical';
    overallRiskLevel: 'acceptable' | 'tolerable' | 'unacceptable';
  };
  mitigationMeasures: {
    arcFaultProtection: {
      required: boolean;
      recommendedDevices: string[];
      retrofitFeasible: boolean;
    };
    physicalMitigation: {
      enclosureUpgrade: boolean;
      conductorSpacing: number; // mm
      barriersRequired: boolean;
      ventilationNeeded: boolean;
    };
    maintenanceMeasures: {
      inspectionFrequency: number; // months
      thermalSurveysRequired: boolean;
      connectionRetorquing: boolean;
      cleaningRequired: boolean;
    };
  };
  complianceIssues: {
    bs7671Compliance: boolean;
    bs7909Compliance: boolean; // Arc flash standard
    hsaRequirements: boolean;
    insuranceImpact: string;
  };
  economicAnalysis: {
    protectionCost: number; // £
    riskMitigationCost: number; // £
    potentialDamageCost: number; // £
    costBenefitRatio: number;
    recommendedInvestment: number; // £
  };
  recommendations: string[];
  regulation: string;
}

// Power Quality Assessment Types
export interface PowerQualityInputs {
  measurementData: {
    duration: number; // hours
    samplingInterval: number; // seconds
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
    systemType: 'single_phase' | 'three_phase';
    neutralPresent: boolean;
  };
  loadCharacteristics: {
    loadTypes: Array<{
      type: 'resistive' | 'inductive' | 'capacitive' | 'non_linear' | 'motor' | 'lighting';
      percentage: number; // % of total load
      variability: 'constant' | 'varying' | 'intermittent';
    }>;
    totalLoad: number; // kW
    peakDemand: number; // kW
  };
  environmentalFactors: {
    temperatureVariation: number; // °C
    externalInterference: boolean;
    switchingOperations: number; // per day
    motorStarting: number; // per day
  };
  complianceStandards: {
    standard: 'bs_en_50160' | 'ieee_1159' | 'iec_61000_4_30';
    voltageClass: 'lv' | 'mv' | 'hv';
    locationClass: 'domestic' | 'commercial' | 'industrial';
  };
}

export interface PowerQualityResult {
  voltageQuality: {
    steadyStateDeviations: {
      underVoltage: { events: number; severity: number; duration: number }; // %, minutes
      overVoltage: { events: number; severity: number; duration: number }; // %, minutes
      unbalance: { maximum: number; average: number }; // %
      compliance: boolean;
    };
    transientDisturbances: {
      sags: { count: number; averageDepth: number; averageDuration: number }; // %, ms
      swells: { count: number; averageMagnitude: number; averageDuration: number }; // %, ms
      interruptions: { count: number; totalDuration: number }; // minutes
      impulsiveTransients: { count: number; maxMagnitude: number }; // V
    };
    harmonicDistortion: {
      thdv: number; // %
      individualHarmonics: { [order: number]: number }; // %
      interharmonics: number; // %
      compliance: boolean;
    };
  };
  frequencyStability: {
    deviations: {
      maximum: number; // Hz
      average: number; // Hz
      excursions: number; // count
    };
    rateOfChange: {
      maximum: number; // Hz/s
      average: number; // Hz/s
    };
    compliance: boolean;
  };
  powerQualityIndices: {
    powerFactorVariation: { minimum: number; average: number; maximum: number };
    flickerSeverity: { pst: number; plt: number }; // Short-term/Long-term flicker
    signallingVoltage: number; // V
    rapidVoltageChanges: number; // count
  };
  impactAssessment: {
    equipmentStress: 'low' | 'medium' | 'high' | 'critical';
    efficiencyLoss: number; // %
    equipmentLifeImpact: number; // % reduction
    sensitiveLoadCompatibility: boolean;
    productionImpact: 'none' | 'minor' | 'moderate' | 'significant';
  };
  sourceIdentification: {
    internalSources: string[];
    externalSources: string[];
    dominantSource: 'internal' | 'external' | 'mixed';
    contributionFactors: { [source: string]: number }; // %
  };
  mitigationRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    costs: { [measure: string]: number }; // £
  };
  monitoringRequirements: {
    continuousMonitoring: boolean;
    monitoringPoints: string[];
    measurementClass: 'A' | 'S' | 'B';
    reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  };
  complianceStatus: {
    overallCompliance: boolean;
    standardsViolated: string[];
    actionRequired: boolean;
    reportingObligation: boolean;
  };
  economicImpact: {
    qualityRelatedLosses: number; // £/year
    mitigationInvestment: number; // £
    paybackPeriod: number; // years
    riskReduction: number; // %
  };
  recommendations: string[];
  regulation: string;
}

// Load Flow Analysis Types
export interface LoadFlowInputs {
  systemData: {
    systemVoltage: number; // V
    frequency: number; // Hz
    systemType: 'radial' | 'ring' | 'mesh' | 'parallel';
    baseKVA: number; // System base MVA
  };
  buses: Array<{
    busId: string;
    voltage: number; // V (actual or specified)
    angle: number; // degrees
    busType: 'slack' | 'PV' | 'PQ';
    powerGeneration?: { P: number; Q: number }; // MW, MVAr
    powerLoad?: { P: number; Q: number }; // MW, MVAr
  }>;
  branches: Array<{
    branchId: string;
    fromBus: string;
    toBus: string;
    resistance: number; // Ω
    reactance: number; // Ω
    susceptance: number; // S
    tapRatio?: number;
    phaseShift?: number; // degrees
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

export interface LoadFlowResult {
  converged: boolean;
  iterations: number;
  busResults: Array<{
    busId: string;
    voltage: { magnitude: number; angle: number };
    power: { P: number; Q: number };
    voltageDropFromNominal: number; // %
    compliance: boolean;
  }>;
  branchResults: Array<{
    branchId: string;
    powerFlow: {
      fromBus: { P: number; Q: number; S: number };
      toBus: { P: number; Q: number; S: number };
    };
    current: number; // A
    loading: number; // % of rating
    losses: { P: number; Q: number }; // MW, MVAr
    voltageRegulation: number; // %
  }>;
  systemSummary: {
    totalGeneration: { P: number; Q: number };
    totalLoad: { P: number; Q: number };
    totalLosses: { P: number; Q: number };
    minVoltage: { bus: string; magnitude: number };
    maxVoltage: { bus: string; magnitude: number };
    overloadedBranches: string[];
    voltageLimitViolations: string[];
  };
  contingencyAnalysis?: {
    criticalOutages: string[];
    loadabilityMargin: number; // %
    voltageStabilityMargin: number; // %
  };
  recommendations: string[];
  regulation: string;
}

// Economic Analysis Types (Cable Sizing Optimization)
export interface EconomicAnalysisInputs {
  project: {
    projectLife: number; // years
    discountRate: number; // %
    inflationRate: number; // %
    electricityTariff: number; // £/kWh
    carbonPrice: number; // £/tonne CO2
  };
  cableOptions: Array<{
    csa: number; // mm²
    coreCount: number;
    cableType: 'XLPE' | 'PVC' | 'EPR' | 'PILC';
    installationMethod: string;
    length: number; // m
    currentRating: number; // A
    resistance: number; // Ω/km
    reactance?: number; // Ω/km
    unitCost: number; // £/m
    installationCost: number; // £/m
  }>;
  loadProfile: {
    peakLoad: number; // A
    averageLoad: number; // A
    loadFactor: number; // %
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
    thermalResistivity: number; // K⋅m/W
  };
}

export interface EconomicAnalysisResult {
  optimalSolution: {
    csa: number; // mm²
    cableType: string;
    totalCost: number; // £
    npv: number; // £ Net Present Value
    paybackPeriod: number; // years
    roi: number; // %
  };
  comparison: Array<{
    csa: number;
    capitalCost: number; // £
    annualLossCost: number; // £/year
    maintenanceCost: number; // £/year
    totalLifecycleCost: number; // £
    npv: number; // £
    carbonFootprint: number; // tonnes CO2
    compliance: boolean;
  }>;
  sensitivity: {
    electricityPriceChange: { change: number; npvImpact: number }[];
    loadGrowthImpact: { change: number; npvImpact: number }[];
    discountRateImpact: { change: number; npvImpact: number }[];
  };
  riskAssessment: {
    loadUncertainty: number; // %
    priceVolatility: number; // %
    riskAdjustedNPV: number; // £
    probabilityOfSuccess: number; // %
  };
  recommendations: string[];
  regulation: string;
}

// Energy Loss Calculator Types
export interface EnergyLossInputs {
  systemConfiguration: {
    systemVoltage: number; // V
    frequency: number; // Hz
    phases: 1 | 3;
    systemType: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  };
  conductors: Array<{
    conductorId: string;
    csa: number; // mm²
    material: 'copper' | 'aluminium';
    length: number; // m
    current: number; // A
    powerFactor: number;
    loadType: 'continuous' | 'intermittent' | 'variable';
    temperature: number; // °C
  }>;
  transformers: Array<{
    transformerId: string;
    ratingKVA: number;
    noLoadLoss: number; // W
    loadLoss: number; // W at rated load
    loadingFactor: number; // %
    operatingHours: number; // hours/year
  }>;
  operatingConditions: {
    annualOperatingHours: number;
    loadProfile: Array<{
      timeOfDay: string;
      loadFactor: number; // %
      duration: number; // hours
    }>;
    seasonalVariations?: Array<{
      season: string;
      averageLoad: number; // %
      duration: number; // months
    }>;
  };
  economicFactors: {
    electricityTariff: number; // £/kWh
    demandCharge?: number; // £/kW/month
    timeOfUseRates?: Array<{
      period: string;
      rate: number; // £/kWh
    }>;
    carbonPrice: number; // £/tonne CO2
    carbonIntensity: number; // kg CO2/kWh
  };
}

export interface EnergyLossResult {
  conductorLosses: Array<{
    conductorId: string;
    i2rLosses: number; // kWh/year
    lossCost: number; // £/year
    temperatureDerating: number; // %
    efficiencyImpact: number; // %
  }>;
  transformerLosses: Array<{
    transformerId: string;
    noLoadLosses: number; // kWh/year
    loadLosses: number; // kWh/year
    totalLosses: number; // kWh/year
    lossCost: number; // £/year
    efficiency: number; // %
  }>;
  systemSummary: {
    totalEnergyLosses: number; // kWh/year
    totalLossCost: number; // £/year
    systemEfficiency: number; // %
    carbonEmissions: number; // tonnes CO2/year
    peakLossDemand: number; // kW
  };
  optimization: {
    potentialSavings: number; // £/year
    upgradeRecommendations: Array<{
      component: string;
      action: string;
      investment: number; // £
      savings: number; // £/year
      payback: number; // years
    }>;
    efficiencyImprovement: number; // %
  };
  benchmarking: {
    industryAverage: number; // % losses
    bestPractice: number; // % losses
    improvementPotential: number; // %
    ranking: 'excellent' | 'good' | 'average' | 'poor';
  };
  recommendations: string[];
  regulation: string;
}

// Building Regulations & Standards Types
export interface PartPComplianceResult {
  notificationRequired: boolean;
  workCategory: 'notifiable' | 'non_notifiable' | 'minor_works';
  competentPersonEligible: boolean;
  buildingControlApproval: boolean;
  specialLocationRequirements: string[];
  safetyRequirements: string[];
  testingRequired: string[];
  certificationRequired: string[];
  complianceCost?: {
    min: number;
    max: number;
    description: string;
  };
  recommendations: string[];
  compliance: {
    partP: boolean;
    bs7671: boolean;
    buildingRegs: boolean;
  };
  regulation: string;
}

export interface BuildingRegulationResult {
  buildingType?: string;
  floorArea?: number;
  totalConnectedLoad: number; // kW
  maximumDemand: number; // kW
  diversityApplied?: number; // %
  supplyRequired?: number; // kVA
  serviceCapacity?: number; // kVA
  loadBreakdown?: {
    cooking?: number;
    evCharging?: number;
    heating?: number;
    hotWater?: number;
    baseLoad?: number;
  };
  minimumCircuits?: number;
  loadAssessment: {
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    diversityApplied: number; // %
    supplyRequired: number; // kVA
  };
  circuitRequirements: {
    minimumCircuits: number;
    lightingCircuits: number;
    socketCircuits: number;
    dedicatedCircuits: string[];
    protectionDevices: string[];
  };
  safetyRequirements: {
    rcdProtection: boolean;
    afddRequired: boolean;
    surgeProtection: boolean;
    earthingSystem: string;
    bondingRequired: string[];
  };
  specialLocationCompliance: {
    applicableLocations: string[];
    additionalRequirements: string[];
    ipRatings: string[];
    testingFrequency: string;
  };
  energyEfficiency: {
    minimumEfficacy: number; // lm/W
    controls: string[];
    zoning: boolean;
    daylight: boolean;
  };
  certification: {
    electricalCertificate: string;
    buildingControlCompletion: boolean;
    warrantyRequired: boolean;
  };
  compliance: {
    partP: boolean;
    partL: boolean;
    bs7671: boolean;
    accessibilityRegs: boolean;
  };
  recommendations: string[];
  regulation: string;
}

export interface EnergyPerformanceResult {
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  energyUseIntensity?: number; // kWh/m²/year
  netEnergyConsumption?: number; // kWh/year
  renewableContribution?: number; // %
  carbonEmissions?: number; // kg CO2/year
  costSavings?: {
    annualSavings: number; // £/year
    investmentRequired: number; // £
    paybackYears: number;
  };
  co2Emissions?: number; // kg/m²/year
  primaryEnergyUse?: number; // kWh/m²/year
  lightingEnergyUse?: number; // kWh/m²/year
  heatingEnergyUse?: number; // kWh/m²/year
  coolingEnergyUse?: number; // kWh/m²/year
  ventilationEnergyUse?: number; // kWh/m²/year
  hotWaterEnergyUse?: number; // kWh/m²/year
  fabricEfficiency?: {
    thermalTransmittance: number; // W/m²K
    airTightness: number; // m³/h/m² @ 50Pa
    thermalBridging: number; // W/m²K
  };
  buildingServicesEfficiency?: {
    heatingEfficiency: number; // %
    coolingEfficiency: number; // %
    ventilationEfficiency: number; // %
    lightingEfficiency: number; // lm/W
    controlsEfficiency: number; // %
  };
  compliance?: {
    partL: boolean;
    targetEmissionRate: number; // kg/m²/year
    actualEmissionRate: number; // kg/m²/year
    improvementRequired: boolean;
  };
  recommendations?: string[];
  regulation?: string;
}

// Special Location Calculation Types
export interface SpecialLocationResult {
  locationType: 'bathroom' | 'swimming_pool' | 'sauna' | 'medical' | 'agricultural' | 'construction' | 'caravan' | 'marina' | 'exhibition' | 'solar_pv' | 'temporary';
  zones: Array<{
    zone: string;
    description: string;
    ipRating: string;
    voltageRestriction: number; // V
    protectionMeasures: string[];
    bonding: boolean;
    additionalProtection: string[];
  }>;
  equipmentRequirements: {
    ipRating: string;
    voltageClass: 'SELV' | 'PELV' | 'Class_I' | 'Class_II' | 'Class_III';
    maxVoltage: number; // V
    isolationRequired: boolean;
    localSwitching: boolean;
  };
  protectionMeasures: {
    rcdRating: number; // mA
    rcdType: 'AC' | 'A' | 'B' | 'F';
    additionalProtection: boolean;
    earthingArrangements: string[];
    bondingConductors: Array<{
      type: string;
      minSize: number; // mm²
      material: string;
    }>;
  };
  testingRequirements: {
    initialTesting: string[];
    periodicTesting: string[];
    frequency: string;
    specialTests: string[];
  };
  compliance: {
    bs7671Part: string;
    additionalStandards: string[];
    localRegulations: string[];
  };
  recommendations: string[];
  regulation: string;
}

// Medical Location Calculation Types
export interface MedicalLocationResult {
  group: '0' | '1' | '2';
  groupDescription: string;
  classification: {
    appliedPart: 'none' | 'BF' | 'CF';
    lifeSupport: boolean;
    surgicalApplications: boolean;
    intracardiacProcedures: boolean;
  };
  supplySystem: {
    normalSupply: string;
    emergencySupply: boolean;
    supplyTime: number; // seconds
    changeover: 'automatic' | 'manual';
    isolationTransformer: boolean;
    medicicalITSystem: boolean;
  };
  protectionMeasures: {
    equipotentialBonding: boolean;
    additionalEquipotential: boolean;
    functionalEarthing: boolean;
    earthFaultCurrent: number; // mA max
    touchVoltage: number; // V max
    earthingResistance: number; // Ω max
  };
  monitoring: {
    isolationMonitoring: boolean;
    earthFaultAlarm: boolean;
    temperatureMonitoring: boolean;
    emergencyLighting: boolean;
    batteryBackup: number; // hours
  };
  testingRequirements: {
    initialTesting: string[];
    periodicTesting: string[];
    frequency: string;
    specialTests: string[];
    documentation: string[];
  };
  safetyRequirements: {
    maximumEarthFaultCurrent: number; // mA
    maximumTouchVoltage: number; // V
    minimumInsulationResistance: number; // MΩ
    residualCurrentDevices: boolean;
  };
  compliance: {
    bs7671Section710: boolean;
    htmGuidance: boolean;
    medicalDeviceDirective: boolean;
    localHealthAuthority: boolean;
  };
  recommendations: string[];
  regulation: string;
}

// Educational Facility Calculation Types
export interface EducationalFacilityResult {
  facilityType: 'primary_school' | 'secondary_school' | 'college' | 'university' | 'nursery' | 'special_needs';
  loadAnalysis: {
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    teachingAreas: number; // kW
    administration: number; // kW
    catering: number; // kW
    sportsFacilities: number; // kW
    ictEquipment: number; // kW
    emergencySystems: number; // kW
  };
  circuitDesign: {
    lightingCircuits: Array<{
      area: string;
      illuminance: number; // lux
      circuits: number;
      controls: string[];
      emergencyLighting: boolean;
    }>;
    powerCircuits: Array<{
      area: string;
      socketOutlets: number;
      protection: number; // A
      rcdProtection: boolean;
      usb: boolean;
    }>;
    specialCircuits: Array<{
      purpose: string;
      load: number; // kW
      protection: string;
      isolation: boolean;
    }>;
  };
  safetyConsiderations: {
    childSafety: boolean;
    accessibleSockets: number; // mm height
    rcdProtection: boolean;
    afddRequired: boolean;
    tamperResistant: boolean;
    emergencyShutOff: boolean;
  };
  accessibilityCompliance: {
    socketHeight: { min: number; max: number }; // mm
    switchHeight: { min: number; max: number }; // mm
    contrastRequirements: boolean;
    audioVisualAlarms: boolean;
    accessibleRoutes: boolean;
  };
  energyEfficiency: {
    led: boolean;
    occupancyDetection: boolean;
    daylightSensors: boolean;
    timeControls: boolean;
    efficacy: number; // lm/W
    controls: string[];
  };
  emergencyProvision: {
    emergencyLighting: boolean;
    duration: number; // hours
    fireAlarm: boolean;
    evacuation: boolean;
    accessibleAlarm: boolean;
  };
  compliance: {
    buildingBulletin: string;
    accessibility: boolean;
    energyPerformance: boolean;
    fireRegulations: boolean;
  };
  recommendations: string[];
  regulation: string;
}

// Care Home Calculation Types  
export interface CareHomeResult {
  careLevel: 'residential' | 'nursing' | 'dementia' | 'learning_disability' | 'mental_health';
  capacityAnalysis: {
    residents: number;
    staff: number;
    visitors: number;
    totalOccupancy: number;
  };
  loadCalculation: {
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    accommodation: number; // kW
    commonAreas: number; // kW
    catering: number; // kW
    laundry: number; // kW
    heating: number; // kW
    hotWater: number; // kW
    medicalEquipment: number; // kW
    liftSystems: number; // kW
    emergencySystems: number; // kW
  };
  circuitRequirements: {
    bedroomCircuits: Array<{
      roomType: string;
      outlets: number;
      protection: number; // A
      nurseCall: boolean;
      emergencyLighting: boolean;
    }>;
    commonAreaCircuits: Array<{
      area: string;
      circuits: number;
      protection: string;
      controls: string[];
    }>;
    kitchenCircuits: Array<{
      equipment: string;
      load: number; // kW
      protection: string;
      isolation: boolean;
    }>;
  };
  safetyFeatures: {
    wanderManagement: boolean;
    autoLocking: boolean;
    rcdProtection: boolean;
    afddRequired: boolean;
    emergencyCallSystem: boolean;
    fireAlarmIntegration: boolean;
    accessControl: boolean;
  };
  accessibilityFeatures: {
    socketHeight: number; // mm
    switchHeight: number; // mm
    contrastSwitches: boolean;
    audioVisualAlarms: boolean;
    accessibleMains: boolean;
    mobilityAids: boolean;
  };
  emergencyProvision: {
    emergencyLighting: {
      duration: number; // hours
      batteryBackup: boolean;
      testingFrequency: string;
    };
    fireAlarmSystem: boolean;
    nurseCallSystem: boolean;
    emergencyGenerator: boolean;
    generatorCapacity: number; // kW
    automaticTransfer: boolean;
    emergencyShutdown: boolean;
  };
  specialConsiderations: {
    dementiaFriendly: boolean;
    behavioralTriggers: string[];
    ligatureResistant: boolean;
    tamperProof: boolean;
    antimicrobialFinish: boolean;
  };
  compliance: {
    careQualityCommission: boolean;
    healthTechnicalMemorandum: string[];
    buildingRegulations: boolean;
    equalityAct: boolean;
    careStandardsAct: boolean;
  };
  inspection: {
    initialTesting: string[];
    periodicTesting: string[];
    portableApplianceTesting: boolean;
    emergencySystemTesting: string[];
    frequency: string;
  };
  recommendations: string[];
  regulation: string;
}

// =====================================
// ELECTRICAL CONSTANTS
// =====================================

/**
 * UK Electrical Constants and Standards
 * Based on BS 7671:2018+A2:2022 and BS EN 50160
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
    6: 7.27,   // 6A Type B MCB
    10: 4.36,  // 10A Type B MCB
    16: 2.73,  // 16A Type B MCB
    20: 2.18,  // 20A Type B MCB
    25: 1.75,  // 25A Type B MCB
    32: 1.37,  // 32A Type B MCB
    40: 1.09,  // 40A Type B MCB
    50: 0.87,  // 50A Type B MCB
    63: 0.69   // 63A Type B MCB
  },
  
  ZS_LIMITS_MCB_C: {
    6: 3.64,   // 6A Type C MCB
    10: 2.18,  // 10A Type C MCB
    16: 1.37,  // 16A Type C MCB
    20: 1.09,  // 20A Type C MCB
    25: 0.87,  // 25A Type C MCB
    32: 0.68,  // 32A Type C MCB
    40: 0.55,  // 40A Type C MCB
    50: 0.44,  // 50A Type C MCB
    63: 0.35   // 63A Type C MCB
  },
  
  // RCD test parameters
  RCD_TEST_MULTIPLIERS: [0.5, 1, 5], // Test at 50%, 100%, and 500% of rated current
  RCD_MAX_OPERATING_TIMES: {
    30: 300,   // 30mA RCD - 300ms at 1×In
    100: 300,  // 100mA RCD - 300ms at 1×In
    300: 500   // 300mA RCD - 500ms at 1×In
  },
  
  // Diversity factors (BS 7671 Appendix 1)
  DIVERSITY_FACTORS: {
    LIGHTING: 0.9,              // 90% for lighting
    HEATING_COOKING: 0.75,      // 75% for heating and cooking
    SOCKET_OUTLETS: 0.4,        // 40% for socket outlets
    MOTORS: 0.8,                // 80% for motors
    WATER_HEATING: 0.9,         // 90% for water heating
    AIR_CONDITIONING: 0.9       // 90% for air conditioning
  },
  
  // UK carbon intensity (kg CO₂/kWh) - approximate grid average
  UK_CARBON_INTENSITY: 0.233,
  
  // Standard UK electricity tariff (£/kWh) - approximate domestic rate
  UK_ELECTRICITY_TARIFF: 0.30
} as const;
