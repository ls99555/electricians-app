/**
 * Building Regulations Types
 * Types for Part P compliance, energy performance, and building regulation calculations
 */

import type { BaseCalculationResult } from './common';

export interface PartPComplianceResult extends BaseCalculationResult {
  notificationRequired: boolean;
  workCategory: 'notifiable' | 'non_notifiable' | 'controlled' | 'minor_works';
  complianceRoute: 'building_control' | 'competent_person' | 'self_certification';
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
  compliancePathway?: Array<{
    step: string;
    description: string;
    responsibility: string;
    cost?: number;
  }>;
  compliance: {
    partP: boolean;
    bs7671: boolean;
    buildingRegs: boolean;
  };
  timeframes: {
    notification: string;
    completion: string;
    certification: string;
  };
}

export interface BuildingRegulationResult extends BaseCalculationResult {
  buildingType: string;
  floorArea: number;
  applicationRequired: boolean;
  regulationType: 'full_application' | 'building_notice' | 'approved_inspector';
  estimatedCost: number;
  timeframe: string;
  serviceCapacity?: number; // W
  loadBreakdown?: {
    base?: number; // W (UI compatibility)
    baseLoad?: number; // W
    cooking?: number; // W
    evCharging?: number; // W
    heating?: number; // W
    hotWater?: number; // W
  };
  minimumCircuits?: number;
  totalConnectedLoad: number;
  maximumDemand: number;
  diversityFactors: {
    cooking: number;
    heating: number;
    hotWater: number;
    lighting: number;
    socketOutlets: number;
  };
  totalDemand: number; // W
  loadAssessment: {
    totalConnectedLoad: number;
    maximumDemand: number;
    diversityApplied: number;
    supplyRequired: number;
  };
  circuitRequirements: {
    minimumCircuits: number;
    lightingCircuits: number;
    socketCircuits: number;
    dedicatedCircuits: string[];
    protectionDevices: string[];
  } | string[];
  safetyRequirements?: {
    rcdProtection: boolean;
    afddRequired: boolean;
    surgeProtection: boolean;
    earthingSystem: string;
    mainEarthTerminal?: boolean;
    equipotentialBonding?: boolean;
    bondingRequired?: string[];
  };
  specialLocationCompliance: {
    applicableLocations: string[];
    additionalRequirements: string[];
    ipRatings: string[];
    testingFrequency: string;
  };
  energyEfficiency: {
    minimumEfficacy: number;
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
  protectionRequirements: string[];
}

export interface EnergyPerformanceResult extends BaseCalculationResult {
  currentRating: string; // A-G rating
  energyRating: string; // A-G rating (UI compatibility)
  potentialRating?: string; // A-G potential rating
  energyUseIndex: number; // kWh/m²/year
  energyUseIntensity?: number; // Alternative naming
  carbonEmissions?: number; // kg CO2/year
  netEnergyConsumption?: number; // kWh/year
  renewableContribution?: number; // % renewable contribution
  costSavings?: {
    annualSavings: number; // £/year
    investmentRequired: number; // £
    paybackYears: number;
  };
  improvementMeasures: Array<{
    measure: string;
    rating: string;
    energySaving: number; // kWh/year
    carbonSaving: number; // kg CO2/year
    cost: number; // £
    payback: number; // years
  }>;
  recommendations: string[];
  complianceIssues: string[];
}

export interface SpecialLocationResult extends BaseCalculationResult {
  locationType: 'bathroom' | 'kitchen' | 'swimming_pool' | 'sauna' | 'medical' | 'agricultural' | 'solar_pv' | 'construction' | 'caravan' | 'marina' | 'exhibition' | 'temporary';
  zoneClassification: string;
  ipRating: string;
  protectionMeasures: string[];
  additionalRequirements: string[];
  equipmentRestrictions: string[];
  earthingRequirements: string[];
  rcdRequirements: {
    required: boolean;
    rating: number; // mA
    type: string;
  };
}

export interface MedicalLocationResult extends BaseCalculationResult {
  medicalGroup: '0' | '1' | '2';
  lifeSupportEquipment: boolean;
  isolationTransformer: boolean;
  uninterruptedPowerSupply: boolean;
  emergencyLighting: boolean;
  fireAlarmIntegration: boolean;
  specialEarthing: boolean;
  equipotentialBonding: string[];
  testingRequirements: {
    initialTesting: string[];
    periodicTesting: string[];
    frequency: string;
    specialTests: string[];
    documentation: string[];
  };
  maintenanceSchedule: string;
}

export interface EducationalFacilityResult extends BaseCalculationResult {
  facilityType: 'primary' | 'secondary' | 'university' | 'nursery' | 'primary_school' | 'secondary_school' | 'college' | 'special_needs';
  accessibilityCompliance: {
    socketHeight: { min: number; max: number; };
    switchHeight: { min: number; max: number; };
    contrastRequirements: boolean;
    audioVisualAlarms: boolean;
    accessibleRoutes: boolean;
  };
  emergencyLighting: boolean;
  fireAlarmSystem: boolean;
  paSystemIntegration: boolean;
  itInfrastructure: {
    powerRequirement: number; // W
    dataPoints: number;
    wirelessCoverage: boolean;
  };
  sportsFacilities: {
    floodlighting: boolean;
    scoreboards: boolean;
    soundSystem: boolean;
  };
  specialClassrooms: string[];
}

export interface CareHomeResult extends BaseCalculationResult {
  careLevel: 'residential' | 'nursing' | 'dementia' | 'specialist' | 'learning_disability' | 'mental_health';
  residentCapacity: number;
  accessibilityFeatures: {
    socketHeight: number;
    switchHeight: number;
    contrastSwitches: boolean;
    audioVisualAlarms: boolean;
    accessibleMains: boolean;
    mobilityAids: boolean;
  };
  nursCallSystem: boolean;
  emergencyLighting: boolean;
  fireAlarmSystem: boolean;
  securitySystem: boolean;
  medicalEquipment: {
    oxygenSupply: boolean;
    lifts: boolean;
    hoists: boolean;
    emergencyPower: boolean;
  };
  kitchenFacilities: {
    commercialKitchen: boolean;
    teaPoints: number;
    microwavePoints: number;
  };
}
