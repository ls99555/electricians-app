/**
 * Electrical Calculations Library for SparkyTools
 * Based on UK Electrical Regulations (BS 7671)
 * 
 * DISCLAIMER: These calculations are for guidance only.
 * All electrical work must be carried out by qualified electricians
 * in accordance with current UK regulations.
 */

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

      // Round all values to reasonable precision
      Object.keys(result).forEach(key => {
        const value = result[key as keyof OhmLawResult];
        if (typeof value === 'number') {
          result[key as keyof OhmLawResult] = Math.round(value * 1000) / 1000;
        }
      });

      return result;
    } catch (error) {
      throw new Error('Invalid input values for Ohm\'s law calculation');
    }
  }

  /**
   * Validate that calculated values are consistent
   */
  static validate(values: OhmLawResult): boolean {
    const { voltage: V, current: I, resistance: R, power: P } = values;
    
    if (!V || !I || !R || !P) return false;

    const tolerance = 0.01; // 1% tolerance for rounding errors
    
    // Check V = I × R
    const calculatedV = I * R;
    if (Math.abs(V - calculatedV) / V > tolerance) return false;

    // Check P = V × I
    const calculatedP = V * I;
    if (Math.abs(P - calculatedP) / P > tolerance) return false;

    return true;
  }
}

/**
 * Voltage Drop Calculations
 * Based on BS 7671 requirements
 */
export class VoltageDropCalculator {
  // Standard voltage drop limits per BS 7671
  private static readonly VOLTAGE_DROP_LIMITS = {
    lighting: 3, // 3% for lighting circuits
    power: 5,   // 5% for power circuits
  };

  // Cable resistance values (mΩ/m) for common cable sizes
  private static readonly CABLE_RESISTANCE = {
    '1.0': { r1: 18.1, x1: 0 },
    '1.5': { r1: 12.1, x1: 0 },
    '2.5': { r1: 7.41, x1: 0 },
    '4.0': { r1: 4.61, x1: 0 },
    '6.0': { r1: 3.08, x1: 0 },
    '10.0': { r1: 1.83, x1: 0 },
    '16.0': { r1: 1.15, x1: 0 },
    '25.0': { r1: 0.727, x1: 0 },
    '35.0': { r1: 0.524, x1: 0 },
    '50.0': { r1: 0.387, x1: 0 },
  };

  /**
   * Calculate voltage drop for a circuit
   * @param current - Load current in Amps
   * @param length - Cable length in meters
   * @param cableSize - Cable CSA in mm²
   * @param supplyVoltage - Supply voltage (default 230V)
   * @param circuitType - 'lighting' or 'power'
   * @param powerFactor - Power factor (default 1.0 for resistive loads)
   * @returns Voltage drop calculation results
   */
  static calculate(
    current: number,
    length: number,
    cableSize: string,
    supplyVoltage: number = 230,
    circuitType: 'lighting' | 'power' = 'power',
    powerFactor: number = 1.0
  ): VoltageDropResult {
    if (current <= 0 || length <= 0) {
      throw new Error('Current and length must be positive values');
    }

    const cableData = this.CABLE_RESISTANCE[cableSize as keyof typeof this.CABLE_RESISTANCE];
    if (!cableData) {
      throw new Error(`Cable size ${cableSize}mm² not found in database`);
    }

    // Calculate voltage drop per meter (mV/A/m)
    // For AC: Vd = I × (R × cos(φ) + X × sin(φ)) × L
    // For DC or resistive AC: Vd = I × R × L
    const reactance = cableData.x1 || 0;
    const resistance = cableData.r1;
    
    const cosφ = powerFactor;
    const sinφ = Math.sqrt(1 - cosφ * cosφ);
    
    // Voltage drop in mV
    const voltageDropMv = current * (resistance * cosφ + reactance * sinφ) * length;
    
    // Convert to volts
    const voltageDrop = voltageDropMv / 1000;
    
    // Calculate percentage
    const voltageDropPercentage = (voltageDrop / supplyVoltage) * 100;
    
    // Voltage at load
    const voltageAtLoad = supplyVoltage - voltageDrop;
    
    // Check against limits
    const limit = this.VOLTAGE_DROP_LIMITS[circuitType];
    const isWithinLimits = voltageDropPercentage <= limit;
    
    return {
      voltageDrop: Math.round(voltageDrop * 100) / 100,
      voltageDropPercentage: Math.round(voltageDropPercentage * 100) / 100,
      voltageAtLoad: Math.round(voltageAtLoad * 100) / 100,
      isWithinLimits,
      regulation: `BS 7671 requires ≤${limit}% for ${circuitType} circuits`
    };
  }

  /**
   * Calculate maximum cable length for given voltage drop limit
   */
  static maxLength(
    current: number,
    cableSize: string,
    supplyVoltage: number = 230,
    circuitType: 'lighting' | 'power' = 'power',
    powerFactor: number = 1.0
  ): number {
    const cableData = this.CABLE_RESISTANCE[cableSize as keyof typeof this.CABLE_RESISTANCE];
    if (!cableData) {
      throw new Error(`Cable size ${cableSize}mm² not found in database`);
    }

    const limit = this.VOLTAGE_DROP_LIMITS[circuitType];
    const maxVoltageDropV = (limit / 100) * supplyVoltage;
    const maxVoltageDropMv = maxVoltageDropV * 1000;

    const cosφ = powerFactor;
    const sinφ = Math.sqrt(1 - cosφ * cosφ);
    const impedance = cableData.r1 * cosφ + (cableData.x1 || 0) * sinφ;

    return Math.floor(maxVoltageDropMv / (current * impedance));
  }
}

/**
 * Cable Sizing Calculator
 * Based on BS 7671 requirements for current carrying capacity and voltage drop
 */
export class CableSizingCalculator {
  // Current carrying capacities for different installation methods (Amps)
  // Reference Method C (clipped direct) - 70°C thermoplastic, 90°C thermosetting
  private static readonly CURRENT_CAPACITY = {
    '1.0': { thermoplastic: 13.5, thermosetting: 16 },
    '1.5': { thermoplastic: 17.5, thermosetting: 21 },
    '2.5': { thermoplastic: 24, thermosetting: 28 },
    '4.0': { thermoplastic: 32, thermosetting: 37 },
    '6.0': { thermoplastic: 41, thermosetting: 47 },
    '10.0': { thermoplastic: 57, thermosetting: 65 },
    '16.0': { thermoplastic: 76, thermosetting: 87 },
    '25.0': { thermoplastic: 101, thermosetting: 114 },
    '35.0': { thermoplastic: 125, thermosetting: 141 },
    '50.0': { thermoplastic: 151, thermosetting: 162 },
  };

  /**
   * Calculate minimum cable size for given load
   * @param designCurrent - Design current in Amps
   * @param cableLength - Cable length in meters
   * @param installationMethod - Installation method affecting current capacity
   * @param circuitType - 'lighting' or 'power' for voltage drop limits
   * @param cableType - 'thermoplastic' or 'thermosetting'
   * @returns Cable sizing recommendations
   */
  static calculate(
    designCurrent: number,
    cableLength: number,
    installationMethod: string = 'clipped_direct',
    circuitType: 'lighting' | 'power' = 'power',
    cableType: 'thermoplastic' | 'thermosetting' = 'thermoplastic'
  ): CableSizingResult {
    if (designCurrent <= 0 || cableLength <= 0) {
      throw new Error('Design current and cable length must be positive values');
    }

    const cableSizes = Object.keys(this.CURRENT_CAPACITY);
    let recommendedSize = 0;
    let currentCarryingCapacity = 0;
    let voltageDropCheck = false;
    let thermlaCheck = false;

    // Find minimum cable size for current carrying capacity
    for (const size of cableSizes) {
      const capacity = this.CURRENT_CAPACITY[size as keyof typeof this.CURRENT_CAPACITY][cableType];
      
      if (capacity >= designCurrent) {
        // Check voltage drop
        try {
          const voltageDropResult = VoltageDropCalculator.calculate(
            designCurrent,
            cableLength,
            size,
            230,
            circuitType
          );

          if (voltageDropResult.isWithinLimits) {
            recommendedSize = parseFloat(size);
            currentCarryingCapacity = capacity;
            voltageDropCheck = true;
            thermlaCheck = true;
            break;
          }
        } catch (error) {
          // Continue to next cable size if calculation fails
          continue;
        }
      }
    }

    if (recommendedSize === 0) {
      throw new Error('No suitable cable size found for the given parameters');
    }

    // Determine protection requirements
    const protectionRequired = this.getProtectionRequirements(designCurrent, recommendedSize);

    return {
      recommendedSize,
      currentCarryingCapacity,
      voltageDropCheck,
      thermlaCheck,
      protectionRequired
    };
  }

  /**
   * Get protection device requirements
   */
  private static getProtectionRequirements(current: number, cableSize: number): string {
    // Standard protective device ratings
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
    
    // Find appropriate protection rating
    const protectionRating = standardRatings.find(rating => rating >= current) || standardRatings[standardRatings.length - 1];
    
    return `${protectionRating}A MCB or ${protectionRating}A Fuse (BS 7671 compliance required)`;
  }
}

/**
 * Load Calculation Utilities
 */
export class LoadCalculator {
  /**
   * Calculate total load for multiple appliances
   */
  static calculateTotalLoad(loads: Array<{ power: number; quantity: number; diversityFactor?: number }>): number {
    return loads.reduce((total, load) => {
      const diversityFactor = load.diversityFactor || 1.0;
      return total + (load.power * load.quantity * diversityFactor);
    }, 0);
  }

  /**
   * Convert power to current
   */
  static powerToCurrent(power: number, voltage: number = 230, powerFactor: number = 1.0): number {
    return power / (voltage * powerFactor);
  }

  /**
   * Apply diversity factors according to BS 7671
   */
  static applyDiversity(loads: { lighting: number; socket: number; cooking: number; heating: number }): number {
    // Simplified diversity factors - actual calculation should consider specific circumstances
    const diversityFactors = {
      lighting: 0.9,
      socket: 0.4,
      cooking: 0.8,
      heating: 1.0
    };

    return (
      loads.lighting * diversityFactors.lighting +
      loads.socket * diversityFactors.socket +
      loads.cooking * diversityFactors.cooking +
      loads.heating * diversityFactors.heating
    );
  }
}
