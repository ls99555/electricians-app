/**
 * Common Types and Interfaces for Electrical Calculations
 * SparkyTools - UK Electrical Regulations Compliant
 */

// Common measurement units
export type VoltageUnit = 'V' | 'kV' | 'mV';
export type CurrentUnit = 'A' | 'mA' | 'kA';
export type PowerUnit = 'W' | 'kW' | 'MW' | 'VAR' | 'kVAR' | 'VA' | 'kVA';
export type ResistanceUnit = 'Ω' | 'mΩ' | 'kΩ';
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz';

// System types
export type SystemType = 'single_phase' | 'three_phase';
export type EarthingSystem = 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
export type ConductorMaterial = 'copper' | 'aluminum' | 'aluminium';
export type InsulationType = 'pvc' | 'xlpe' | 'epr' | 'mi';

// Installation methods (BS 7671 reference methods)
export type InstallationMethod = 
  | 'A1' | 'A2' // Insulated conductors in conduit in a thermally insulated wall
  | 'B1' | 'B2' // Insulated conductors in conduit on a wall or in trunking
  | 'C' // Single-core cables touching, laid direct in ground
  | 'D1' | 'D2' // Multi-core cable laid direct in ground
  | 'E' | 'F' // In air, horizontal or vertical
  | 'G'; // Bare or insulated conductors on insulators

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Compliance status
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'requires_assessment';

// Common result structure
export interface BaseCalculationResult {
  isCompliant: boolean;
  recommendations: string[];
  regulation: string;
  warnings?: string[];
  errors?: string[];
}
