/**
 * EV Charging Types
 * Types for electric vehicle charging calculations
 */

import type { BaseCalculationResult } from './common';

export interface EVChargingResult extends BaseCalculationResult {
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

export interface CommercialEVChargingInputs {
  numberOfChargers: number;
  chargerType: 'slow' | 'fast' | 'rapid' | 'ultra_rapid';
  powerRating: number; // kW per charger
  simultaneityFactor: number;
  operatingHours: number;
  gridConnection: {
    supplyVoltage: number; // V
    availableCapacity: number; // kW
    connectionType: 'single_phase' | 'three_phase';
  };
  siteRequirements: {
    numberOfParkingSpaces: number;
    accessibilityCompliance: boolean;
    weatherProtection: boolean;
  };
}

export interface CommercialEVChargingResult extends BaseCalculationResult {
  totalInstallation: {
    totalPower: number; // kW
    maximumDemand: number; // kW
    simultaneousDemand: number; // kW
    diversityFactor: number;
  };
  electricalDesign: {
    supplyRequired: number; // A
    cableSize: number; // mm²
    protectionRating: number; // A
    earthingSystem: string;
  };
  gridConnection: {
    transformerRequired: boolean;
    gridUpgradeRequired: boolean;
    connectionApplication: 'G98' | 'G99';
    estimatedConnectionCost: number; // £
  };
  costAnalysis: {
    equipmentCost: number; // £
    installationCost: number; // £
    annualOperatingCost: number; // £
    revenueProjection: number; // £/year
  };
}

export interface EVChargingDiversityInputs {
  chargerConfiguration: Array<{
    type: 'slow' | 'fast' | 'rapid' | 'ultra_rapid';
    quantity: number;
    powerRating: number; // kW
    simultaneityFactor: number;
  }>;
  usagePatterns: {
    peakHours: string;
    averageSessionDuration: number; // minutes
    turnoverRate: number; // vehicles per hour
  };
  loadManagement: {
    smartChargingEnabled: boolean;
    loadBalancing: boolean;
    timeOfUseScheduling: boolean;
  };
}

export interface EVChargingDiversityResult extends BaseCalculationResult {
  diversityAnalysis: {
    peakDemand: number; // kW
    averageDemand: number; // kW
    loadFactor: number;
    diversityFactor: number;
  };
  timeProfile: Array<{
    hour: number;
    demand: number; // kW
    utilization: number; // %
  }>;
  systemOptimization: {
    recommendedLoadManagement: string[];
    potentialSavings: number; // £/year
    gridStabilityImpact: string;
  };
}

export interface FastChargingInputs {
  chargerSpecification: {
    powerRating: number; // kW
    dcOutput: boolean;
    coolingRequired: boolean;
    powerElectronics: string;
  };
  gridRequirements: {
    voltage: number; // V
    frequency: number; // Hz
    powerQuality: string;
    harmonicDistortion: number; // %
  };
  installation: {
    cableLength: number; // m
    environmentalConditions: string;
    accessRequirements: string;
  };
}

export interface FastChargingResult extends BaseCalculationResult {
  powerSystemDesign: {
    transformerRating: number; // kVA
    cableSize: number; // mm²
    protectionSystem: string[];
    powerFactorCorrection: boolean;
  };
  gridImpact: {
    harmonicAnalysis: string;
    voltageRegulation: string;
    gridStability: string;
    mitigationMeasures: string[];
  };
  coolingRequirements: {
    ventilationRequired: boolean;
    chillerCapacity: number; // kW
    energyConsumption: number; // kW
  };
}

export interface LoadBalancingInputs {
  chargerConfiguration: Array<{
    id: string;
    maxPower: number; // kW
    currentLoad: number; // kW
    priority: 'high' | 'medium' | 'low';
  }>;
  gridConstraints: {
    totalAvailablePower: number; // kW
    voltageConstraints: {
      min: number; // V
      max: number; // V
    };
    currentConstraints: {
      max: number; // A
    };
  };
  optimizationStrategy: 'equal_sharing' | 'priority_based' | 'time_based' | 'cost_optimized';
}

export interface LoadBalancingResult extends BaseCalculationResult {
  allocationStrategy: Array<{
    chargerId: string;
    allocatedPower: number; // kW
    adjustmentReason: string;
    expectedChargingTime: number; // minutes
  }>;
  systemPerformance: {
    totalPowerUsed: number; // kW
    efficiency: number; // %
    gridUtilization: number; // %
    costOptimization: number; // £/session
  };
  realTimeControl: {
    controlAlgorithm: string;
    updateFrequency: number; // seconds
    communicationProtocol: string;
  };
}
