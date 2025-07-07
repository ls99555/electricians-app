/**
 * Basic Electrical Calculations
 * Ohm's Law, Voltage Drop, and fundamental electrical calculations
 */

import type { OhmLawResult, VoltageDropResult, CableSizingResult } from './types';
import { ELECTRICAL_CONSTANTS } from './types';

/**
 * Ohm's Law Calculations
 * V = I × R, P = V × I, P = I² × R, P = V² / R
 */
export class OhmLawCalculator {
  /**
   * Calculate missing electrical values using Ohm's law
   * @param values - Object containing known electrical values
   * @returns Complete electrical values
   */
  static calculate(values: Partial<OhmLawResult>): OhmLawResult {
    const { voltage: V, current: I, resistance: R, power: P } = values;
    let result: OhmLawResult = { ...values };

    try {
      // Calculate Voltage (V = I × R or V = √(P × R) or V = P / I)
      if (!V) {
        if (I && R) {
          result.voltage = I * R;
        } else if (P && R) {
          result.voltage = Math.sqrt(P * R);
        } else if (P && I) {
          result.voltage = P / I;
        }
      }

      // Calculate Current (I = V / R or I = P / V or I = √(P / R))
      if (!I) {
        if (V && R) {
          result.current = V / R;
        } else if (P && V) {
          result.current = P / V;
        } else if (P && R) {
          result.current = Math.sqrt(P / R);
        }
      }

      // Calculate Resistance (R = V / I or R = V² / P or R = P / I²)
      if (!R) {
        if (V && I) {
          result.resistance = V / I;
        } else if (V && P) {
          result.resistance = (V * V) / P;
        } else if (P && I) {
          result.resistance = P / (I * I);
        }
      }

      // Calculate Power (P = V × I or P = I² × R or P = V² / R)
      if (!P) {
        if (V && I) {
          result.power = V * I;
        } else if (I && R) {
          result.power = I * I * R;
        } else if (V && R) {
          result.power = (V * V) / R;
        }
      }

      // Validate results
      this.validateResults(result);
      
      return result;
    } catch (error) {
      throw new Error(`Ohm's Law calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateResults(result: OhmLawResult): void {
    const { voltage, current, resistance, power } = result;
    
    if (voltage !== undefined && voltage < 0) {
      throw new Error('Voltage cannot be negative');
    }
    if (current !== undefined && current < 0) {
      throw new Error('Current cannot be negative');
    }
    if (resistance !== undefined && resistance < 0) {
      throw new Error('Resistance cannot be negative');
    }
    if (power !== undefined && power < 0) {
      throw new Error('Power cannot be negative');
    }
  }
}

/**
 * Voltage Drop Calculator
 * Calculate voltage drop in cables based on BS 7671 requirements
 */
export class VoltageDropCalculator {
  /**
   * Calculate voltage drop for a cable run
   */
  static calculate(inputs: {
    current: number; // Load current (A)
    length: number; // Cable length (m)
    cableSize: number; // Cable CSA (mm²)
    phases: 1 | 3; // Single or three-phase
    powerFactor: number; // Power factor (0.8-1.0)
    cableType: 'copper' | 'aluminium';
    temperature: number; // Conductor temperature (°C)
  }): VoltageDropResult {
    const { current, length, cableSize, phases, powerFactor, cableType, temperature } = inputs;

    try {
      // Validate inputs
      this.validateInputs(inputs);

      // Get cable resistance and reactance
      const { resistance, reactance } = this.getCableParameters(cableSize, cableType, temperature);

      // Calculate voltage drop
      let voltageDrop: number;
      
      if (phases === 1) {
        // Single phase: Vd = 2 × I × L × (R × cos φ + X × sin φ)
        const cosPhase = powerFactor;
        const sinPhase = Math.sqrt(1 - powerFactor * powerFactor);
        voltageDrop = 2 * current * (length / 1000) * (resistance * cosPhase + reactance * sinPhase);
      } else {
        // Three phase: Vd = √3 × I × L × (R × cos φ + X × sin φ)
        const cosPhase = powerFactor;
        const sinPhase = Math.sqrt(1 - powerFactor * powerFactor);
        voltageDrop = Math.sqrt(3) * current * (length / 1000) * (resistance * cosPhase + reactance * sinPhase);
      }

      // Calculate voltage drop percentage
      const supplyVoltage = phases === 1 ? ELECTRICAL_CONSTANTS.STANDARD_VOLTAGE_SINGLE_PHASE : ELECTRICAL_CONSTANTS.STANDARD_VOLTAGE_THREE_PHASE;
      const voltageDropPercentage = (voltageDrop / supplyVoltage) * 100;
      const voltageAtLoad = supplyVoltage - voltageDrop;

      // Check against BS 7671 limits
      const maxVoltageDropPercent = 5; // 5% for power circuits, 3% for lighting
      const isWithinLimits = voltageDropPercentage <= maxVoltageDropPercent;

      return {
        voltageDrop: Math.round(voltageDrop * 100) / 100,
        voltageDropPercentage: Math.round(voltageDropPercentage * 100) / 100,
        voltageAtLoad: Math.round(voltageAtLoad * 100) / 100,
        isWithinLimits,
        regulation: 'BS 7671 Section 525 - Voltage drop in consumers\' installations'
      };
    } catch (error) {
      throw new Error(`Voltage drop calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { current, length, cableSize, phases, powerFactor } = inputs;
    
    if (current <= 0) throw new Error('Current must be positive');
    if (length <= 0) throw new Error('Length must be positive');
    if (length > 1000) throw new Error('Cable length exceeds practical limits');
    if (cableSize <= 0) throw new Error('Cable size must be positive');
    if (cableSize < 1.0) throw new Error('Invalid cable size - minimum 1.0mm²');
    if (![1, 3].includes(phases)) throw new Error('Phases must be 1 or 3');
    if (powerFactor < 0.1 || powerFactor > 1.0) throw new Error('Power factor must be between 0.1 and 1.0');
  }

  private static getCableParameters(cableSize: number, cableType: 'copper' | 'aluminium', temperature: number) {
    // Simplified cable parameters - in practice, use manufacturer data
    const baseResistance = cableType === 'copper' ? 
      this.getCopperResistance(cableSize) : 
      this.getAluminiumResistance(cableSize);
    
    // Temperature correction factor
    const tempFactor = 1 + 0.004 * (temperature - 20); // 0.4% per °C
    const resistance = baseResistance * tempFactor;
    
    // Reactance (simplified - typically much lower than resistance)
    const reactance = baseResistance * 0.1;

    return { resistance, reactance };
  }

  private static getCopperResistance(cableSize: number): number {
    // Resistance values in mΩ/m at 20°C (simplified table)
    const resistanceTable: { [size: number]: number } = {
      1.0: 18.1,
      1.5: 12.1,
      2.5: 7.41,
      4.0: 4.61,
      6.0: 3.08,
      10.0: 1.83,
      16.0: 1.15,
      25.0: 0.727,
      35.0: 0.524,
      50.0: 0.387,
      70.0: 0.268,
      95.0: 0.193,
      120.0: 0.153,
      150.0: 0.124,
      185.0: 0.0991,
      240.0: 0.0754
    };

    return resistanceTable[cableSize] || 18.1; // Default to 1.0mm² if not found
  }

  private static getAluminiumResistance(cableSize: number): number {
    // Aluminium has approximately 1.6x the resistance of copper
    return this.getCopperResistance(cableSize) * 1.6;
  }
}

/**
 * Cable Sizing Calculator
 * Select appropriate cable size based on current carrying capacity and voltage drop
 */
export class CableSizingCalculator {
  /**
   * Calculate required cable size
   */
  static calculate(inputs: {
    designCurrent: number; // Circuit design current (A)
    length: number; // Cable length (m)
    installationMethod: string; // Reference method A-F
    phases: 1 | 3;
    powerFactor: number;
    groupingFactor: number; // Derating for grouping
    ambientTempFactor: number; // Derating for temperature
    thermalInsulationFactor: number; // Derating for thermal insulation
    voltageDropLimit: number; // Maximum voltage drop % allowed
  }): CableSizingResult {
    try {
      const {
        designCurrent,
        length,
        installationMethod,
        phases,
        powerFactor,
        groupingFactor,
        ambientTempFactor,
        thermalInsulationFactor,
        voltageDropLimit
      } = inputs;

      // Calculate required current carrying capacity
      const overallDerating = groupingFactor * ambientTempFactor * thermalInsulationFactor;
      const requiredCapacity = designCurrent / overallDerating;

      // Find minimum cable size for current carrying capacity
      const capacitySize = this.findCableSizeForCapacity(requiredCapacity, installationMethod);

      // Check voltage drop for this size
      const voltageDropCheck = this.checkVoltageDropCompliance(
        designCurrent,
        length,
        capacitySize,
        phases,
        powerFactor,
        voltageDropLimit
      );

      // If voltage drop fails, find larger cable
      let recommendedSize = capacitySize;
      if (!voltageDropCheck.compliant) {
        recommendedSize = this.findCableSizeForVoltageDrop(
          designCurrent,
          length,
          phases,
          powerFactor,
          voltageDropLimit
        );
      }

      const finalCapacity = this.getCableCapacity(recommendedSize, installationMethod);
      const protectionRequired = this.getProtectionRequirements(designCurrent, finalCapacity);

      return {
        recommendedSize,
        currentCarryingCapacity: finalCapacity,
        voltageDropCheck: voltageDropCheck.compliant,
        thermlaCheck: finalCapacity >= requiredCapacity,
        protectionRequired
      };
    } catch (error) {
      throw new Error(`Cable sizing calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static findCableSizeForCapacity(requiredCapacity: number, installationMethod: string): number {
    // Simplified current carrying capacity table for reference method C (clipped direct)
    const capacityTable: { [size: number]: number } = {
      1.0: 13.5,
      1.5: 17.5,
      2.5: 24,
      4.0: 32,
      6.0: 41,
      10.0: 57,
      16.0: 76,
      25.0: 101,
      35.0: 125,
      50.0: 151,
      70.0: 192,
      95.0: 232,
      120.0: 269,
      150.0: 309,
      185.0: 353,
      240.0: 415
    };

    for (const [size, capacity] of Object.entries(capacityTable)) {
      if (capacity >= requiredCapacity) {
        return parseFloat(size);
      }
    }

    return 240; // Largest standard size
  }

  private static checkVoltageDropCompliance(
    current: number,
    length: number,
    cableSize: number,
    phases: 1 | 3,
    powerFactor: number,
    voltageDropLimit: number
  ): { compliant: boolean; actualDrop: number } {
    const voltageDropResult = VoltageDropCalculator.calculate({
      current,
      length,
      cableSize,
      phases,
      powerFactor,
      cableType: 'copper',
      temperature: 70
    });

    return {
      compliant: voltageDropResult.voltageDropPercentage <= voltageDropLimit,
      actualDrop: voltageDropResult.voltageDropPercentage
    };
  }

  private static findCableSizeForVoltageDrop(
    current: number,
    length: number,
    phases: 1 | 3,
    powerFactor: number,
    voltageDropLimit: number
  ): number {
    for (const size of ELECTRICAL_CONSTANTS.STANDARD_CABLE_SIZES) {
      const check = this.checkVoltageDropCompliance(current, length, size, phases, powerFactor, voltageDropLimit);
      if (check.compliant) {
        return size;
      }
    }

    return 240; // Largest available if none comply
  }

  private static getCableCapacity(cableSize: number, installationMethod: string): number {
    // Simplified - return capacity for reference method C
    const capacityTable: { [size: number]: number } = {
      1.0: 13.5,
      1.5: 17.5,
      2.5: 24,
      4.0: 32,
      6.0: 41,
      10.0: 57,
      16.0: 76,
      25.0: 101,
      35.0: 125,
      50.0: 151,
      70.0: 192,
      95.0: 232,
      120.0: 269,
      150.0: 309,
      185.0: 353,
      240.0: 415
    };

    return capacityTable[cableSize] || 13.5;
  }

  private static getProtectionRequirements(designCurrent: number, cableCapacity: number): string {
    // Find appropriate MCB rating
    const mcbRating = ELECTRICAL_CONSTANTS.STANDARD_MCB_RATINGS.find(rating => 
      rating >= designCurrent && rating <= cableCapacity
    );

    return mcbRating ? `${mcbRating}A MCB or RCBO` : 'Custom protection required';
  }
}
