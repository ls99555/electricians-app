/**
 * Lighting Calculation Types
 * SparkyTools - UK Electrical Regulations Compliant
 */

import type { BaseCalculationResult } from './common';

// Lighting calculation results
export interface IlluminanceResult extends BaseCalculationResult {
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
}

export interface EmergencyLightingResult extends BaseCalculationResult {
  requiredIlluminance: number;
  uniformityRatio: number;
  minimumDuration: number;
  numberOfLuminaires: number;
  luminaireSpacing: number;
  testingSchedule: string[];
  complianceRequirements: string[];
}

export interface LuminousFluxResult extends BaseCalculationResult {
  totalLumens: number;
  lumensPerLuminaire: number;
  averageLumensPerSquareMeter: number;
  lightingEfficiency: number;
  energyConsumption: number;
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

export interface LEDReplacementResult extends BaseCalculationResult {
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
}

export interface EnergyEfficiencyResult extends BaseCalculationResult {
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
}

export interface UniformityRatioResult extends BaseCalculationResult {
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
}

export interface GlareIndexResult extends BaseCalculationResult {
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
}

export interface DomesticLightingResult extends BaseCalculationResult {
  roomType: string;
  recommendedIlluminance: number;
  numberOfLuminaires: number;
  luminaireType: string;
  totalWattage: number;
  switchingArrangement: string[];
  dimmingRecommendation: boolean;
}

// Room type definitions
export type RoomType = 
  | 'living_room' | 'kitchen' | 'bedroom' | 'bathroom' | 'hallway'
  | 'study' | 'dining_room' | 'utility' | 'garage' | 'conservatory';

// Commercial/Industrial lighting types
export type CommercialSpaceType = 
  | 'office' | 'retail' | 'warehouse' | 'factory' | 'hospital'
  | 'school' | 'restaurant' | 'hotel' | 'car_park' | 'sports_hall';

// Luminaire types
export type LuminaireType = 
  | 'downlight' | 'pendant' | 'surface_mounted' | 'track'
  | 'strip_light' | 'panel' | 'high_bay' | 'flood_light';
