/**
 * Safety and Testing Calculation Types
 * SparkyTools - UK Electrical Regulations Compliant
 */

import type { BaseCalculationResult } from './common';

// Enums for safety testing
export type EarthingSystem = 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
export type ElectrodeType = 'rod' | 'plate' | 'tape' | 'structural';

// Safety testing results
export interface RCDTestResult extends BaseCalculationResult {
  operatingTime: number; // milliseconds
  operatingCurrent: number; // A
  isWithinLimits: boolean;
  testType: 'half_rated' | 'rated' | 'five_times_rated';
  polarityTested: 'positive' | 'negative' | 'both';
  standardLimits: {
    maxOperatingTime: number;
    maxOperatingCurrent: number;
  };
}

export interface InsulationResistanceResult extends BaseCalculationResult {
  resistance: number; // MΩ
  testVoltage: number; // V
  isAcceptable: boolean;
  minimumRequired: number; // MΩ
  temperatureCorrection: number;
  testDuration: number; // seconds
  circuitType: string;
}

export interface LoopImpedanceResult extends BaseCalculationResult {
  impedance: number; // Ω
  maxPermitted: number; // Ω
  isAcceptable: boolean;
  testMethod: 'direct' | 'calculated';
  temperatureCorrection: number;
  earthFaultLoopType: 'Ze' | 'Zs' | 'R1_R2';
}

export interface ContinuityTestResult extends BaseCalculationResult {
  resistance: number; // Ω
  maxPermitted: number; // Ω
  isAcceptable: boolean;
  conductorType: 'protective' | 'bonding' | 'ring_final';
  testCurrent: number; // A
  temperatureCorrection: number;
}

export interface PolarityTestResult extends BaseCalculationResult {
  allConnectionsCorrect: boolean;
  incorrectConnections: string[];
  testMethod: 'continuity' | 'voltage';
  circuitsTested: string[];
}

export interface PhaseSequenceResult extends BaseCalculationResult {
  sequence: 'correct' | 'incorrect';
  phases: ['L1', 'L2', 'L3'];
  rotation: 'clockwise' | 'anticlockwise';
  voltages: {
    L1_L2: number;
    L2_L3: number;
    L3_L1: number;
  };
}

export interface AppliedVoltageTestResult extends BaseCalculationResult {
  testVoltage: number; // V
  duration: number; // seconds
  leakageCurrent: number; // mA
  isWithinLimits: boolean;
  testType: 'routine' | 'type' | 'special';
  insulationClass: 'I' | 'II' | 'III';
}

export interface FunctionalTestResult extends BaseCalculationResult {
  testsPerformed: string[];
  allTestsPassed: boolean;
  failedTests: string[];
  automaticDevicesTested: string[];
  manualDevicesTested: string[];
}

export interface EarthElectrodeResistanceResult extends BaseCalculationResult {
  resistance: number; // Ω
  maxPermitted: number; // Ω
  isAcceptable: boolean;
  electrodeType: 'rod' | 'plate' | 'tape' | 'structural';
  soilConditions: string;
  seasonalVariation: number;
}

export interface FaultCurrentResult extends BaseCalculationResult {
  prospectiveFaultCurrent: number; // kA
  maxBreakingCapacity: number; // kA
  isAdequate: boolean;
  faultType: 'three_phase' | 'phase_to_neutral' | 'phase_to_earth';
  impedance: number; // Ω
  voltage: number; // V
}

export interface RCDSelectionResult extends BaseCalculationResult {
  recommendedRating: number; // mA
  operatingTime: number; // ms
  selectivity: boolean;
  protectionClass: 'AC' | 'A' | 'B';
  installationRequirements: string[];
}

export interface EarthElectrodeResult extends BaseCalculationResult {
  resistance: number; // Ω
  maxPermitted: number; // Ω
  isAcceptable: boolean;
  electrodeType: ElectrodeType;
  recommendedDepth: number; // m
  soilResistivity: number; // Ω⋅m
}

// Test input types
export interface RCDTestInput {
  nominalCurrent: number; // A
  ratedResidualCurrent: number; // mA
  testType: 'half_rated' | 'rated' | 'five_times_rated';
  polarity: 'positive' | 'negative' | 'both';
  phaseAngle?: number; // degrees
}

export interface InsulationTestInput {
  circuitVoltage: number; // V
  testVoltage: number; // V
  circuitType: 'basic' | 'separation' | 'reinforced';
  ambientTemperature: number; // °C
}

export interface LoopImpedanceInput {
  systemVoltage: number; // V
  protectiveDeviceType: 'mcb' | 'fuse' | 'rcbo';
  protectiveDeviceRating: number; // A
  earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  cableLength: number; // m
  cableCsa: number; // mm²
}

export interface InsulationResistanceInputs {
  testVoltage: number; // V
  circuitType: 'lighting' | 'power' | 'heating' | 'motor' | 'special';
  expectedResistance?: number; // MΩ
  temperature: number; // °C
  humidity: number; // %
  testDuration?: number; // seconds
}

export interface ContinuityTestInputs {
  conductorType: 'protective' | 'bonding' | 'ring_final';
  conductorLength: number; // m
  conductorCSA: number; // mm²
  conductorMaterial: 'copper' | 'aluminium';
  testCurrent: number; // A
  ambientTemperature: number; // °C
}

export interface PolarityTestInputs {
  circuitType: 'lighting' | 'socket' | 'fixed_appliance';
  circuitsTested: string[];
  testMethod: 'continuity' | 'voltage';
  expectedPolarity: 'correct';
}

export interface PhaseSequenceInputs {
  systemType: 'three_phase';
  nominalVoltage: number; // V
  testLocation: string;
  expectedSequence: 'L1-L2-L3';
}

export interface AppliedVoltageTestInputs {
  testVoltage: number; // V
  duration: number; // seconds
  testType: 'routine' | 'type' | 'special';
  insulationClass: 'I' | 'II' | 'III';
  equipmentRating: number; // V
  ambientConditions: {
    temperature: number; // °C
    humidity: number; // %
  };
}

export interface FunctionalTestInputs {
  testsRequired: string[];
  automaticDevices: string[];
  manualDevices: string[];
  safetyFunctions: string[];
  emergencyStops: string[];
  interlocks: string[];
}
