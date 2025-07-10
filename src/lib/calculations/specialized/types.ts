/**
 * Specialized Applications Types
 * SparkyTools - UK Electrical Regulations Compliant
 */

import type { BaseCalculationResult } from '../../types/common';

// Swimming Pool Types
export interface SwimmingPoolInputs {
  poolData: {
    poolType: 'indoor' | 'outdoor';
    volume: number; // m³
    fillType: 'freshwater' | 'saltwater';
    treatmentType: 'chlorine' | 'bromine' | 'saltwater' | 'uv';
    heatingRequired: boolean;
    lightingRequired: boolean;
  };
  equipment: {
    pumps: Array<{
      power: number; // kW
      type: 'circulation' | 'filtration' | 'jet';
      operatingHours: number;
    }>;
    heaters: Array<{
      power: number; // kW
      type: 'electric' | 'heat_pump' | 'gas';
      efficiency: number; // %
    }>;
    lighting: Array<{
      voltage: number; // V
      power: number; // W
      quantity: number;
      location: 'underwater' | 'poolside' | 'zone1' | 'zone2';
    }>;
    accessories: Array<{
      name: string;
      power: number; // W
      location: 'zone0' | 'zone1' | 'zone2' | 'outside_zones';
    }>;
  };
  installation: {
    zone0Distance: number; // m
    zone1Distance: number; // m
    zone2Distance: number; // m
    earthingRequired: boolean;
    equipotentialBonding: boolean;
    rcdProtection: '10mA' | '30mA';
  };
}

export interface SwimmingPoolResult extends BaseCalculationResult {
  powerCalculations: {
    pumpLoad: number; // kW
    heatingLoad: number; // kW
    lightingLoad: number; // kW
    auxiliaryLoad: number; // kW
    totalLoad: number; // kW
    diversityFactor: number;
    maximumDemand: number; // kW
  };
  zoneClassification: {
    zone0: {
      maxVoltage: number; // V
      ipRating: string;
      equipmentRestrictions: string[];
    };
    zone1: {
      maxVoltage: number; // V
      ipRating: string;
      equipmentRestrictions: string[];
    };
    zone2: {
      maxVoltage: number; // V
      ipRating: string;
      equipmentRestrictions: string[];
    };
  };
  protectionRequirements: {
    rcdRating: string;
    equipotentialBonding: string[];
    earthingRequirements: string[];
    additionalProtection: string[];
  };
  compliance: {
    bs7671Section702: boolean;
    ieeStandards: boolean;
    localRegulations: boolean;
  };
}

// Caravan/Marina Types
export interface CaravanMarinaInputs {
  facilityType: 'caravan_park' | 'marina' | 'motorhome_site';
  numberOfPitches: number;
  supplyData: {
    voltage: number; // V
    phases: 1 | 3;
    frequency: number; // Hz
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT';
  };
  pitchRequirements: {
    standard16A: number;
    higherRated32A: number;
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

export interface CaravanMarinaResult extends BaseCalculationResult {
  loadCalculations: {
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    diversityFactors: {
      powerOutlets: number; // %
      overall: number; // %
    };
    coincidenceFactor: number;
  };
  distributionDesign: {
    distributionMethod: string;
    pillarLocations: number;
    cableRequirements: {
      mainCable: string;
      distributionCables: string;
      dropCables: string;
    };
  };
  protectionRequirements: {
    rcdProtection: string;
    surgeProtection: boolean;
    isolationPoints: number;
  };
  outletSpecification: {
    ceeOutlets: {
      [key: string]: {
        ipRating: string;
        specification: string;
      };
    };
  };
  environmentalConsiderations: {
    ipRating: string;
    corrosionProtection: string[];
    earthingSpecial: boolean;
    lightningProtection: boolean;
  };
  compliance: {
    bs7671Section708: boolean;
    bs7671Section709: boolean;
    marineSafetyCode: boolean;
  };
}

// Agricultural Types
export interface AgriculturalInputs {
  farmType: 'dairy' | 'arable' | 'livestock' | 'poultry' | 'mixed';
  buildings: Array<{
    buildingType: string;
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
    heating: number; // kW
    ventilation: {
      fans: number;
      fanPower: number; // W each
      climateControl: boolean;
      heatingLoad: number; // kW
    };
    machinery: Array<{
      name: string;
      power: number; // kW
      startingMethod: string;
      usage: string;
      location: string;
    }>;
    milking: number; // kW
    feedSystems: number; // kW
    waterSystems: number; // kW
    milkingEquipment?: {
      milkingMachines: number;
      coolingTanks: number; // kW
      washingSystems: number; // kW
      feedingSystems: boolean;
    };
  };
  environmentalFactors: {
    dampness: 'low' | 'medium' | 'high';
    dustLevel: 'low' | 'medium' | 'high';
    corrosiveSubstances: boolean;
    animalContact: boolean;
    mechanicalDamage: 'low' | 'medium' | 'high';
    temperatureRange: {
      min: number; // °C
      max: number; // °C
    };
  };
}

export interface AgriculturalResult extends BaseCalculationResult {
  loadAssessment: {
    lightingLoad: number; // kW
    machineryLoad: number; // kW
    ventilationLoad: number; // kW
    specialistLoad: number; // kW
    totalConnectedLoad: number; // kW
    maximumDemand: number; // kW
    diversityFactors: {
      lighting: number; // %
      machinery: number; // %
      ventilation: number; // %
      overall: number; // %
    };
  };
  protectionRequirements: {
    ipRatings: {
      generalAreas: string;
      animalAreas: string;
      washdownAreas: string;
      outdoorAreas: string;
    };
    rcdProtection: {
      socketOutlets: string;
      fixed_equipment: string;
      fireProtection: boolean;
    };
    additionalProtection: {
      animalSafety: string[];
      mechanicalProtection: string[];
    };
  };
  earthingBonding: {
    specialEarthing: boolean;
    lightningProtection: boolean;
    animalSafety: string[];
    testingRequirements: string[];
  };
  specialConsiderations: {
    animalSafety: string[];
    firePrevention: string[];
    operationalRequirements: string[];
    maintenanceAccess: string[];
  };
  compliance: {
    animalWelfareRegs: boolean;
    fireRegulations: boolean;
    environmentalRegs: boolean;
    healthSafety: boolean;
  };
}

// Temporary Supply Types
export interface TemporarySupplyInputs {
  supplyType: 'construction' | 'event' | 'emergency' | 'agricultural';
  duration: 'short_term' | 'medium_term' | 'long_term'; // <6 months, 6-24 months, >24 months
  supplyRequirements: {
    voltage: number; // V
    phases: 1 | 3;
    maxDemand: number; // kW
  };
  constructionSite?: {
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
    assemblies: number;
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

export interface TemporarySupplyResult extends BaseCalculationResult {
  supplyRating: number; // A
  supplyConfiguration: string;
  distributionMethod: string;
  protectionRequirements: {
    mainProtection: string;
    rcdProtection: string;
    additionalProtection: string[];
  };
  installationRequirements: {
    earthingMethod: string;
    cableTypes: string[];
    supportMethods: string[];
    weatherProtection: string[];
  };
  testingRequirements: {
    initialTesting: string[];
    periodicTesting: string[];
    testFrequency: string;
  };
  costEstimate: {
    materialsCost: number;
    installationCost: number;
    periodicCosts: number;
    totalCost: number;
  };
}

// Hazardous Area Types
export interface HazardousAreaInputs {
  areaClassification: {
    zone: '0' | '1' | '2' | '20' | '21' | '22';
    gasGroup: 'IIA' | 'IIB' | 'IIC';
    temperatureClass: 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
    dustGroup?: 'IIIA' | 'IIIB' | 'IIIC';
  };
  equipmentRequirements: Array<{
    equipment: string;
    power: number; // W
    protectionMethod: 'Ex d' | 'Ex e' | 'Ex i' | 'Ex n' | 'Ex p' | 'Ex q';
    certificationRequired: boolean;
  }>;
  installationMethod: {
    cableType: 'armoured' | 'mineral_insulated' | 'conduit';
    routingMethod: 'underground' | 'overhead' | 'cable_tray';
    enclosureType: string;
  };
  ventilationSystem: {
    natural: boolean;
    mechanical: boolean;
    pressurisation: boolean;
  };
  emergencyProcedures: {
    emergencyStop: boolean;
    gasDetection: boolean;
    emergencyLighting: boolean;
    communicationSystems: boolean;
  };
}

export interface HazardousAreaResult extends BaseCalculationResult {
  equipmentSelection: Array<{
    equipment: string;
    certificationRequired: string;
    protectionLevel: string;
    installationNotes: string[];
  }>;
  installationRequirements: {
    cableSpecification: string;
    enclosureRating: string;
    earthingRequirements: string;
    bondingRequirements: string;
  };
  testingRequirements: {
    initialTesting: string[];
    periodicInspection: string[];
    testFrequency: string;
    specialTests: string[];
  };
  complianceStandards: {
    primaryStandards: string[];
    supportingStandards: string[];
    certificationBodies: string[];
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    mitigationMeasures: string[];
    emergencyProcedures: string[];
  };
  costImplications: {
    equipmentPremium: number; // % increase
    installationComplexity: string;
    maintenanceRequirements: string[];
    trainingRequirements: string[];
  };
}
