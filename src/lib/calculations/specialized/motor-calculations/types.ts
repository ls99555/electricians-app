/**
 * Motor Calculations Types
 * SparkyTools - UK Electrical Regulations Compliant
 */

import type { BaseCalculationResult } from '../../../types/common';

// Motor Control Types
export interface MotorControlInputs {
  motorRating: number; // kW
  motorVoltage: number; // V
  motorType: 'induction' | 'synchronous' | 'dc' | 'stepper';
  startingMethod: 'DOL' | 'star_delta' | 'soft_start' | 'vfd';
  loadType: 'constant' | 'variable' | 'cyclic';
  operatingDuty: 'continuous' | 'intermittent' | 'short_time';
  ambientTemperature: number; // °C
  enclosureType: 'IP55' | 'IP65' | 'TEFC' | 'open';
  supplySystem: {
    voltage: number; // V
    phases: 1 | 3;
    frequency: number; // Hz
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  };
}

export interface MotorControlResult extends BaseCalculationResult {
  fullLoadCurrent: number; // A
  startingCurrent: number; // A
  startingTorque: number; // Nm
  efficiency: number; // %
  powerFactor: number;
  protectionRequirements: {
    overloadProtection: number; // A
    shortCircuitProtection: number; // A
    earthFaultProtection: number; // mA
  };
  cableRequirements: {
    mainCable: number; // mm²
    controlCable: number; // mm²
    earthCable: number; // mm²
  };
  controllerSpecification: {
    contactor: string;
    overload: string;
    auxiliaries: string[];
  };
}

// Motor Starting Types
export interface MotorStartingInputs {
  motorData: {
    rating: number; // kW
    voltage: number; // V
    fullLoadCurrent: number; // A
    startingTorque: number; // Nm
    loadTorque: number; // Nm
    inertia: number; // kg⋅m²
  };
  supplySystem: {
    capacity: number; // kVA
    impedance: number; // %
    voltage: number; // V
  };
  startingMethod: 'DOL' | 'star_delta' | 'autotransformer' | 'soft_start' | 'vfd';
  loadCharacteristics: {
    type: 'constant_torque' | 'variable_torque' | 'constant_power';
    inertia: number; // kg⋅m²
    startingTime: number; // s
  };
  voltageDropLimits: {
    starting: number; // %
    running: number; // %
  };
}

export interface MotorStartingResult extends BaseCalculationResult {
  startingAnalysis: {
    startingCurrent: number; // A
    startingTime: number; // s
    voltageDropAtStart: number; // %
    torqueMargin: number; // %
  };
  voltageDropAnalysis: {
    atMotorTerminals: number; // %
    atSupplyPoint: number; // %
    withinLimits: boolean;
  };
  startingMethodComparison: Array<{
    method: string;
    startingCurrent: number; // A
    voltageDropWorst: number; // %
    startingTorque: number; // %
    cost: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
  }>;
  recommendations: string[];
}

// Variable Speed Drive Types
export interface VSDInputs {
  motorData: {
    rating: number; // kW
    voltage: number; // V
    frequency: number; // Hz
    fullLoadCurrent: number; // A
    efficiency: number; // %
    powerFactor: number;
  };
  applicationRequirements: {
    speedRange: {
      min: number; // rpm
      max: number; // rpm
    };
    torqueProfile: 'constant' | 'variable' | 'high_starting';
    controlMode: 'scalar' | 'vector' | 'servo';
    accuracy: number; // %
  };
  environmentalConditions: {
    temperature: number; // °C
    humidity: number; // %
    dustLevel: 'clean' | 'moderate' | 'heavy';
    vibration: 'low' | 'medium' | 'high';
  };
  networkConditions: {
    supplyQuality: 'good' | 'moderate' | 'poor';
    harmonicLimits: boolean;
    powerFactorCorrection: boolean;
  };
}

export interface VSDResult extends BaseCalculationResult {
  driveSpecification: {
    rating: number; // kW
    inputVoltage: number; // V
    outputVoltage: number; // V
    inputCurrent: number; // A
    outputCurrent: number; // A
    efficiency: number; // %
  };
  harmonicAnalysis: {
    inputTHDi: number; // %
    inputTHDv: number; // %
    outputTHDv: number; // %
    filteringRequired: boolean;
  };
  cableRequirements: {
    inputCable: number; // mm²
    outputCable: number; // mm²
    dcBusCable?: number; // mm²
    screenedCable: boolean;
  };
  protectionRequirements: {
    inputProtection: string;
    outputProtection: string;
    motorProtection: string;
    earthFaultProtection: string;
  };
  installationRequirements: {
    enclosureRating: string;
    ventilation: string;
    cableSegregation: boolean;
    emcConsiderations: string[];
  };
  energySavings: {
    annualSavings: number; // £
    paybackPeriod: number; // years
    carbonReduction: number; // kg CO₂
  };
}
