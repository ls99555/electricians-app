/**
 * Main exports for all electrical calculations
 * Organized modular structure for better maintainability
 */

// Export all types
export * from './types';

// Export basic calculations
export {
  OhmLawCalculator,
  VoltageDropCalculator,
  CableSizingCalculator
} from './basic';

// Export load and demand calculations
export {
  LoadCalculator,
  MaximumDemandCalculator,
  DiversityFactorCalculator
} from './load-demand';

// Export cable and protection calculations
export {
  CableDeratingCalculator,
  ProtectiveDeviceCalculator,
  ConduitFillCalculator
} from './cable-protection';

// Export renewable energy calculations
export {
  SolarPVCalculator,
  BatteryStorageCalculator,
  EVChargingCalculator
} from './renewable-energy';

// Export lighting calculations
export {
  IlluminanceCalculator,
  EmergencyLightingCalculator
} from './lighting';

// Export safety and testing calculations
export {
  LoopImpedanceCalculator,
  RCDSelectionCalculator,
  EarthElectrodeResistanceCalculator,
  FaultCurrentCalculator
} from './safety-testing';

// Export power systems calculations
export {
  ThreePhaseCalculator,
  PowerFactorCalculator
} from './power-systems';

// Utility functions
export const ElectricalUtils = {
  /**
   * Convert power factor to phase angle
   */
  powerFactorToPhaseAngle: (powerFactor: number): number => {
    return Math.acos(Math.max(0, Math.min(1, powerFactor))) * (180 / Math.PI);
  },

  /**
   * Convert phase angle to power factor
   */
  phaseAngleToPowerFactor: (phaseAngle: number): number => {
    return Math.cos(phaseAngle * (Math.PI / 180));
  },

  /**
   * Calculate three-phase power from single-phase values
   */
  singleToThreePhase: (singlePhaseValue: number): number => {
    return singlePhaseValue * 3;
  },

  /**
   * Calculate single-phase power from three-phase values
   */
  threeToSinglePhase: (threePhaseValue: number): number => {
    return threePhaseValue / 3;
  },

  /**
   * Validate electrical input values
   */
  validateElectricalInputs: (inputs: { [key: string]: number }): string[] => {
    const errors: string[] = [];
    
    for (const [key, value] of Object.entries(inputs)) {
      if (value < 0) {
        errors.push(`${key} cannot be negative`);
      }
      if (!isFinite(value)) {
        errors.push(`${key} must be a finite number`);
      }
    }
    
    return errors;
  },

  /**
   * Round to specified decimal places
   */
  roundTo: (value: number, decimals: number): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Format current value with appropriate units
   */
  formatCurrent: (current: number): string => {
    if (current >= 1000) {
      return `${(current / 1000).toFixed(2)}kA`;
    }
    return `${current.toFixed(2)}A`;
  },

  /**
   * Format power value with appropriate units
   */
  formatPower: (power: number): string => {
    if (power >= 1000000) {
      return `${(power / 1000000).toFixed(2)}MW`;
    }
    if (power >= 1000) {
      return `${(power / 1000).toFixed(2)}kW`;
    }
    return `${power.toFixed(0)}W`;
  },

  /**
   * Format voltage value
   */
  formatVoltage: (voltage: number): string => {
    if (voltage >= 1000) {
      return `${(voltage / 1000).toFixed(2)}kV`;
    }
    return `${voltage.toFixed(0)}V`;
  }
};
