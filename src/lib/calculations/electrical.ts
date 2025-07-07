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

export interface LoopImpedanceResult {
  ze: number; // External earth fault loop impedance
  zs: number; // Earth fault loop impedance at furthest point
  r1PlusR2: number; // Line and protective conductor resistance
  maxZsAllowed: number; // Maximum Zs for protection device
  isCompliant: boolean;
  disconnectionTime: number; // Actual disconnection time
  protectionType: string;
  regulation: string;
}

export interface RCDSelectionResult {
  recommendedRating: number; // 30mA, 100mA, 300mA, 500mA
  rcdType: string; // Type AC, A, B, F
  testCurrent: number;
  operatingTime: number;
  isGRCDRequired: boolean;
  applications: string[];
  regulation: string;
}

export interface CableDeratingResult {
  groupingFactor: number;
  ambientTempFactor: number;
  thermalInsulationFactor: number;
  buriedFactor: number;
  overallDerating: number;
  deratedCurrent: number;
  originalRating: number;
}

export interface ThreePhaseResult {
  lineCurrent: number;
  phaseCurrent: number;
  lineVoltage: number;
  phaseVoltage: number;
  totalPower: number;
  powerPerPhase: number;
  isBalanced: boolean;
  neutralCurrent: number;
  powerFactor: number;
}

export interface PowerFactorResult {
  powerFactor: number;
  apparentPower: number; // kVA
  activePower: number; // kW
  reactivePower: number; // kVAr
  phaseAngle: number;
  correctionRequired: boolean;
  capacitorSize?: number; // If correction needed
  improvedPowerFactor?: number;
}

export interface ConduitFillResult {
  conduitSize: string;
  fillPercentage: number;
  maxCables: number;
  isCompliant: boolean;
  nextSizeUp?: string;
  regulation: string;
}

export interface EarthElectrodeResult {
  resistance: number; // Ohms
  isCompliant: boolean;
  maxResistanceAllowed: number;
  electrodeType: string;
  improvementSuggestions: string[];
  seasonalVariation: string;
  testConditions: string;
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

/**
 * Maximum Demand Calculator for Domestic Installations
 * Based on BS 7671 Appendix A and IET Guidance Notes
 */
export interface MaximumDemandInputs {
  lighting: number;           // Lighting load in W
  socketOutlets13A: number;   // Number of 13A socket outlets
  socketOutlets5A: number;    // Number of 5A socket outlets
  cookingAppliances: number;  // Total cooking appliance rating in W
  waterHeating: number;       // Water heating load in W
  spaceHeating: number;       // Space heating load in W
  motorLoads: number;         // Motor loads in W
  evCharging: number;         // EV charging load in W
  otherLoads: number;         // Other fixed loads in W
}

export interface MaximumDemandResult {
  totalConnectedLoad: number;
  diversifiedLoad: number;
  maximumDemand: number;
  recommendedSupplyCapacity: number;
  diversityFactorsUsed: Record<string, number>;
  breakdown: Record<string, { connected: number; diversified: number; }>;
}

export class MaximumDemandCalculator {
  // Diversity factors as per BS 7671 Appendix A
  private static readonly DIVERSITY_FACTORS = {
    lighting: 0.9,              // 90% for lighting
    socketOutlets: 0.4,         // 40% for socket outlets (after first 10A)
    cooking: 0.8,               // Variable based on rating
    waterHeating: 1.0,          // 100% for water heating
    spaceHeating: 1.0,          // 100% for space heating
    motors: 1.0,                // 100% for motors
    evCharging: 0.8,            // 80% for EV charging (smart charging)
    other: 1.0                  // 100% for other loads
  };

  static calculate(inputs: MaximumDemandInputs): MaximumDemandResult {
    const breakdown: Record<string, { connected: number; diversified: number; }> = {};

    // Lighting load with diversity
    const lightingDiversified = inputs.lighting * this.DIVERSITY_FACTORS.lighting;
    breakdown.lighting = { connected: inputs.lighting, diversified: lightingDiversified };

    // Socket outlet load with diversity (first 10A at 100%, remainder at 40%)
    const socketLoad13A = inputs.socketOutlets13A * 13 * 230 / 1000; // Convert to W
    const socketLoad5A = inputs.socketOutlets5A * 5 * 230 / 1000;
    const totalSocketLoad = socketLoad13A + socketLoad5A;
    const socketFirstPortion = Math.min(totalSocketLoad, 10 * 230); // First 10A
    const socketRemainder = Math.max(0, totalSocketLoad - 10 * 230);
    const socketDiversified = socketFirstPortion + (socketRemainder * this.DIVERSITY_FACTORS.socketOutlets);
    breakdown.socketOutlets = { connected: totalSocketLoad, diversified: socketDiversified };

    // Cooking appliance diversity (varies by rating)
    const cookingDiversityFactor = this.getCookingDiversityFactor(inputs.cookingAppliances);
    const cookingDiversified = inputs.cookingAppliances * cookingDiversityFactor;
    breakdown.cooking = { connected: inputs.cookingAppliances, diversified: cookingDiversified };

    // Water heating (100% diversity)
    breakdown.waterHeating = { 
      connected: inputs.waterHeating, 
      diversified: inputs.waterHeating * this.DIVERSITY_FACTORS.waterHeating 
    };

    // Space heating (100% diversity)
    breakdown.spaceHeating = { 
      connected: inputs.spaceHeating, 
      diversified: inputs.spaceHeating * this.DIVERSITY_FACTORS.spaceHeating 
    };

    // Motor loads (100% diversity)
    breakdown.motors = { 
      connected: inputs.motorLoads, 
      diversified: inputs.motorLoads * this.DIVERSITY_FACTORS.motors 
    };

    // EV charging with smart charging diversity
    const evDiversified = inputs.evCharging * this.DIVERSITY_FACTORS.evCharging;
    breakdown.evCharging = { connected: inputs.evCharging, diversified: evDiversified };

    // Other loads (100% diversity)
    breakdown.other = { 
      connected: inputs.otherLoads, 
      diversified: inputs.otherLoads * this.DIVERSITY_FACTORS.other 
    };

    // Calculate totals
    const totalConnectedLoad = Object.values(breakdown).reduce((sum, item) => sum + item.connected, 0);
    const diversifiedLoad = Object.values(breakdown).reduce((sum, item) => sum + item.diversified, 0);

    // Maximum demand is the diversified load
    const maximumDemand = diversifiedLoad;

    // Recommended supply capacity (add 20% margin for future expansion)
    const recommendedSupplyCapacity = Math.ceil(maximumDemand * 1.2 / 1000) * 1000; // Round up to nearest kW

    const diversityFactorsUsed = {
      lighting: this.DIVERSITY_FACTORS.lighting,
      socketOutlets: this.DIVERSITY_FACTORS.socketOutlets,
      cooking: cookingDiversityFactor,
      waterHeating: this.DIVERSITY_FACTORS.waterHeating,
      spaceHeating: this.DIVERSITY_FACTORS.spaceHeating,
      motors: this.DIVERSITY_FACTORS.motors,
      evCharging: this.DIVERSITY_FACTORS.evCharging,
      other: this.DIVERSITY_FACTORS.other
    };

    return {
      totalConnectedLoad: Math.round(totalConnectedLoad),
      diversifiedLoad: Math.round(diversifiedLoad),
      maximumDemand: Math.round(maximumDemand),
      recommendedSupplyCapacity,
      diversityFactorsUsed,
      breakdown
    };
  }

  private static getCookingDiversityFactor(rating: number): number {
    // Cooking appliance diversity factors based on rating (W)
    if (rating <= 3000) return 1.0;        // 100% for ≤3kW
    if (rating <= 6000) return 0.8;        // 80% for 3-6kW
    if (rating <= 12000) return 0.7;       // 70% for 6-12kW
    return 0.6;                             // 60% for >12kW
  }
}

/**
 * Illuminance Calculator for Lighting Design
 * Based on BS EN 12464 and CIBSE guidance
 */
export interface IlluminanceInputs {
  roomLength: number;         // Room length in meters
  roomWidth: number;          // Room width in meters
  roomHeight: number;         // Room height in meters
  workingPlaneHeight: number; // Working plane height in meters
  requiredIlluminance: number; // Required illuminance in lux
  luminaireOutput: number;    // Luminous flux per luminaire in lumens
  maintenanceFactor: number;  // Maintenance factor (0.7-0.9)
  utilizationFactor: number;  // Utilization factor (0.3-0.7)
}

export interface IlluminanceResult {
  roomIndex: number;
  numberOfLuminaires: number;
  totalLumens: number;
  averageIlluminance: number;
  lightingPowerDensity: number; // W/m²
  energyEfficiency: number;     // lumens per watt
  uniformityRatio: number;
}

export class IlluminanceCalculator {
  static calculate(inputs: IlluminanceInputs, luminairePower: number = 50): IlluminanceResult {
    const { roomLength, roomWidth, roomHeight, workingPlaneHeight, 
            requiredIlluminance, luminaireOutput, maintenanceFactor, 
            utilizationFactor } = inputs;

    // Calculate room index
    const mountingHeight = roomHeight - workingPlaneHeight;
    const roomIndex = (roomLength * roomWidth) / (mountingHeight * (roomLength + roomWidth));

    // Calculate floor area
    const floorArea = roomLength * roomWidth;

    // Calculate total lumens required
    const totalLumensRequired = (requiredIlluminance * floorArea) / (utilizationFactor * maintenanceFactor);

    // Calculate number of luminaires
    const numberOfLuminaires = Math.ceil(totalLumensRequired / luminaireOutput);

    // Calculate actual total lumens
    const totalLumens = numberOfLuminaires * luminaireOutput;

    // Calculate average illuminance achieved
    const averageIlluminance = (totalLumens * utilizationFactor * maintenanceFactor) / floorArea;

    // Calculate lighting power density
    const totalPower = numberOfLuminaires * luminairePower;
    const lightingPowerDensity = totalPower / floorArea;

    // Calculate energy efficiency
    const energyEfficiency = totalLumens / totalPower;

    // Estimate uniformity ratio (simplified calculation)
    const spacing = Math.sqrt(floorArea / numberOfLuminaires);
    const uniformityRatio = Math.max(0.6, Math.min(0.9, mountingHeight / spacing));

    return {
      roomIndex: Math.round(roomIndex * 100) / 100,
      numberOfLuminaires,
      totalLumens: Math.round(totalLumens),
      averageIlluminance: Math.round(averageIlluminance),
      lightingPowerDensity: Math.round(lightingPowerDensity * 10) / 10,
      energyEfficiency: Math.round(energyEfficiency * 10) / 10,
      uniformityRatio: Math.round(uniformityRatio * 100) / 100
    };
  }

  static getRecommendedIlluminance(spaceType: string): number {
    const recommendations: Record<string, number> = {
      'office': 500,
      'classroom': 300,
      'kitchen': 500,
      'living_room': 200,
      'bedroom': 150,
      'bathroom': 200,
      'corridor': 100,
      'stairs': 150,
      'workshop': 500,
      'retail': 300,
      'warehouse': 200,
      'car_park': 75,
      'sports_hall': 300,
      'laboratory': 500
    };

    return recommendations[spaceType] || 300;
  }
}

/**
 * EV Charging Load Calculator
 * Based on IET Code of Practice for EV Charging
 */
export interface EVChargingInputs {
  numberOfChargers: number;
  chargerRating: number;        // Rating per charger in kW
  chargingType: 'slow' | 'fast' | 'rapid';
  simultaneityFactor: number;   // Probability of simultaneous use
  diversityFactor: number;      // Load diversity factor
  installationType: 'domestic' | 'workplace' | 'public';
  gridConnectionCapacity: number; // Existing grid connection in kW
}

export interface EVChargingResult {
  totalChargerCapacity: number;
  diversifiedLoad: number;
  peakDemand: number;
  additionalGridCapacity: number;
  cableSizeRequired: string;
  protectionRequired: string;
  loadBalancingRecommended: boolean;
  recommendations: string[];
}

export class EVChargingCalculator {
  private static readonly DIVERSITY_FACTORS = {
    domestic: { slow: 0.8, fast: 0.7, rapid: 0.9 },
    workplace: { slow: 0.6, fast: 0.5, rapid: 0.8 },
    public: { slow: 0.9, fast: 0.8, rapid: 1.0 }
  };

  static calculate(inputs: EVChargingInputs): EVChargingResult {
    const { numberOfChargers, chargerRating, chargingType, installationType, 
            gridConnectionCapacity } = inputs;

    // Get appropriate diversity factor
    const diversityFactor = this.DIVERSITY_FACTORS[installationType][chargingType];

    // Calculate total charger capacity
    const totalChargerCapacity = numberOfChargers * chargerRating;

    // Calculate diversified load
    const diversifiedLoad = totalChargerCapacity * diversityFactor;

    // Calculate peak demand (assuming some simultaneity)
    const simultaneityFactor = inputs.simultaneityFactor || this.getDefaultSimultaneity(installationType, numberOfChargers);
    const peakDemand = diversifiedLoad * simultaneityFactor;

    // Calculate additional grid capacity required
    const additionalGridCapacity = Math.max(0, peakDemand - gridConnectionCapacity);

    // Recommend cable size (simplified calculation)
    const currentPerCharger = (chargerRating * 1000) / 230; // Assuming single phase
    const totalCurrent = currentPerCharger * numberOfChargers * diversityFactor;
    const cableSizeRequired = this.recommendCableSize(totalCurrent);

    // Protection requirements
    const protectionRequired = this.getProtectionRequirements(chargerRating, numberOfChargers);

    // Load balancing recommendation
    const loadBalancingRecommended = numberOfChargers > 2 && totalChargerCapacity > gridConnectionCapacity * 0.8;

    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, {
      totalChargerCapacity,
      diversifiedLoad,
      peakDemand,
      additionalGridCapacity,
      loadBalancingRecommended
    });

    return {
      totalChargerCapacity: Math.round(totalChargerCapacity * 10) / 10,
      diversifiedLoad: Math.round(diversifiedLoad * 10) / 10,
      peakDemand: Math.round(peakDemand * 10) / 10,
      additionalGridCapacity: Math.round(additionalGridCapacity * 10) / 10,
      cableSizeRequired,
      protectionRequired,
      loadBalancingRecommended,
      recommendations
    };
  }

  private static getDefaultSimultaneity(installationType: string, numberOfChargers: number): number {
    if (installationType === 'domestic') return numberOfChargers === 1 ? 1.0 : 0.8;
    if (installationType === 'workplace') return Math.max(0.4, 0.8 - (numberOfChargers * 0.05));
    return 0.9; // public
  }

  private static recommendCableSize(current: number): string {
    if (current <= 13) return '2.5mm²';
    if (current <= 20) return '4.0mm²';
    if (current <= 27) return '6.0mm²';
    if (current <= 37) return '10.0mm²';
    if (current <= 50) return '16.0mm²';
    return '25.0mm² or larger - consult tables';
  }

  private static getProtectionRequirements(chargerRating: number, numberOfChargers: number): string {
    const current = (chargerRating * 1000) / 230;
    const mcbRating = current <= 13 ? '16A' : current <= 20 ? '25A' : current <= 27 ? '32A' : '40A';
    
    return `${mcbRating} Type B MCB with 30mA RCD protection. ${
      numberOfChargers > 1 ? 'Individual protection per charger recommended.' : ''
    }`;
  }

  private static generateRecommendations(
    inputs: EVChargingInputs, 
    results: Partial<EVChargingResult>
  ): string[] {
    const recommendations: string[] = [];

    if (results.additionalGridCapacity && results.additionalGridCapacity > 0) {
      recommendations.push(`Grid connection upgrade required: additional ${results.additionalGridCapacity}kW capacity needed`);
    }

    if (results.loadBalancingRecommended) {
      recommendations.push('Load balancing system recommended to optimize grid connection usage');
    }

    if (inputs.numberOfChargers > 1) {
      recommendations.push('Consider smart charging system for optimal load management');
    }

    if (inputs.installationType === 'domestic' && inputs.chargerRating > 7) {
      recommendations.push('Three-phase supply may be beneficial for fast charging');
    }

    recommendations.push('All EV charging points must be RCD protected (BS 7671)');
    recommendations.push('Consider future expansion when sizing infrastructure');

    return recommendations;
  }
}

/**
 * Loop Impedance Calculator
 * Calculates Ze, Zs, and R1+R2 values for protective device verification (BS 7671 Chapter 41)
 */
export class LoopImpedanceCalculator {
  /**
   * Calculate earth fault loop impedance
   */
  static calculate(inputs: {
    ze: number; // External earth fault loop impedance (Ω)
    r1: number; // Line conductor resistance (Ω)
    r2: number; // Protective conductor resistance (Ω)
    protectionDevice: string; // MCB type (B6, B10, B16, etc.)
    voltage: number; // Supply voltage (230V or 400V)
  }): LoopImpedanceResult {
    const { ze, r1, r2, protectionDevice, voltage } = inputs;
    
    const r1PlusR2 = r1 + r2;
    const zs = ze + r1PlusR2;
    
    // Get maximum Zs values for different protection devices (BS 7671 Appendix 3)
    const maxZsAllowed = this.getMaxZs(protectionDevice, voltage);
    const isCompliant = zs <= maxZsAllowed;
    
    // Calculate actual disconnection time
    const faultCurrent = voltage / zs;
    const disconnectionTime = this.getDisconnectionTime(protectionDevice, faultCurrent);
    
    return {
      ze,
      zs,
      r1PlusR2,
      maxZsAllowed,
      isCompliant,
      disconnectionTime,
      protectionType: protectionDevice,
      regulation: 'BS 7671 Section 411 & Appendix 3'
    };
  }

  private static getMaxZs(protectionDevice: string, voltage: number): number {
    // Maximum Zs values from BS 7671 for 0.4s disconnection (final circuits)
    const maxZsTable: { [key: string]: { [voltage: number]: number } } = {
      'B6': { 230: 7.67, 400: 13.28 },
      'B10': { 230: 4.60, 400: 7.97 },
      'B16': { 230: 2.87, 400: 4.98 },
      'B20': { 230: 2.30, 400: 3.98 },
      'B25': { 230: 1.84, 400: 3.19 },
      'B32': { 230: 1.44, 400: 2.49 },
      'B40': { 230: 1.15, 400: 1.99 },
      'B50': { 230: 0.92, 400: 1.59 },
      'C6': { 230: 3.83, 400: 6.64 },
      'C10': { 230: 2.30, 400: 3.98 },
      'C16': { 230: 1.44, 400: 2.49 },
      'C20': { 230: 1.15, 400: 1.99 },
      'C25': { 230: 0.92, 400: 1.59 },
      'C32': { 230: 0.72, 400: 1.25 },
      'C40': { 230: 0.57, 400: 0.99 },
      'C50': { 230: 0.46, 400: 0.80 }
    };

    return maxZsTable[protectionDevice]?.[voltage] || 0;
  }

  private static getDisconnectionTime(protectionDevice: string, faultCurrent: number): number {
    // Simplified calculation - in practice, use manufacturer's time/current curves
    const deviceRating = parseInt(protectionDevice.substring(1));
    const multiplier = faultCurrent / deviceRating;
    
    if (multiplier >= 5) return 0.1; // Magnetic operation
    if (multiplier >= 3) return 0.4; // Thermal operation
    return 5.0; // May not disconnect in required time
  }
}

/**
 * RCD Selection Calculator
 * Helps select appropriate RCD rating and type (BS 7671 Chapter 53)
 */
export class RCDSelectionCalculator {
  /**
   * Calculate appropriate RCD selection
   */
  static calculate(inputs: {
    installationType: 'domestic' | 'commercial' | 'industrial';
    circuitType: 'general' | 'bathroom' | 'outdoor' | 'socket' | 'lighting' | 'ev_charging';
    loadCurrent: number; // Maximum expected load current (A)
    earthLeakage: number; // Expected earth leakage current (mA)
    specialRequirements?: string[];
  }): RCDSelectionResult {
    const { installationType, circuitType, loadCurrent, earthLeakage, specialRequirements = [] } = inputs;
    
    // Determine RCD rating based on circuit type and requirements
    let recommendedRating = 30; // Default 30mA for most applications
    let rcdType = 'Type AC';
    
    // Special cases requiring different ratings
    if (circuitType === 'ev_charging' || specialRequirements.includes('fire_protection')) {
      recommendedRating = 30; // Always 30mA for additional protection
    } else if (installationType === 'industrial' && earthLeakage > 15) {
      recommendedRating = 100; // May use 100mA in industrial if no additional protection required
    }

    // Determine RCD type based on load characteristics
    if (specialRequirements.includes('electronic_loads') || specialRequirements.includes('variable_frequency_drives')) {
      rcdType = 'Type A';
    }
    if (specialRequirements.includes('solar_inverters') || specialRequirements.includes('ev_charging')) {
      rcdType = 'Type B';
    }

    const testCurrent = recommendedRating; // Test current equals rated residual current
    const operatingTime = recommendedRating === 30 ? 0.04 : 0.3; // 40ms for 30mA, 300ms for others
    
    // Check if general RCD protection required
    const isGRCDRequired = installationType === 'domestic' || 
                          circuitType === 'socket' || 
                          circuitType === 'outdoor';

    const applications = this.getApplications(circuitType, installationType);

    return {
      recommendedRating,
      rcdType,
      testCurrent,
      operatingTime,
      isGRCDRequired,
      applications,
      regulation: 'BS 7671 Section 411.3.3 & Chapter 53'
    };
  }

  private static getApplications(circuitType: string, installationType: string): string[] {
    const applications: string[] = [];
    
    switch (circuitType) {
      case 'bathroom':
        applications.push('Additional protection in zones 1 & 2');
        applications.push('All circuits serving bathroom (except lighting outside zones)');
        break;
      case 'outdoor':
        applications.push('All outdoor socket outlets');
        applications.push('Garden lighting and equipment');
        break;
      case 'socket':
        applications.push('Socket outlets ≤32A in domestic installations');
        applications.push('Mobile equipment up to 32A');
        break;
      case 'ev_charging':
        applications.push('All EV charging points');
        applications.push('Mode 3 charging stations');
        break;
      default:
        applications.push('General additional protection');
    }

    return applications;
  }
}

/**
 * Cable Derating Calculator
 * Calculates derating factors for cables (BS 7671 Appendix 4)
 */
export class CableDeratingCalculator {
  /**
   * Calculate overall cable derating
   */
  static calculate(inputs: {
    installationMethod: string; // Reference method A, B, C, D, E, F
    ambientTemperature: number; // °C
    numberOfCircuits: number; // For grouping
    thermalInsulationLength: number; // Length in thermal insulation (m)
    totalLength: number; // Total cable length (m)
    isBuried: boolean;
    soilThermalResistivity?: number; // K.m/W for buried cables
    originalRating: number; // Cable rating before derating (A)
  }): CableDeratingResult {
    const {
      installationMethod,
      ambientTemperature,
      numberOfCircuits,
      thermalInsulationLength,
      totalLength,
      isBuried,
      soilThermalResistivity = 2.5,
      originalRating
    } = inputs;

    // Grouping factor (Table 4C1-4C5)
    const groupingFactor = this.getGroupingFactor(numberOfCircuits, installationMethod);
    
    // Ambient temperature factor (Table 4B1-4B3)
    const ambientTempFactor = this.getAmbientTempFactor(ambientTemperature);
    
    // Thermal insulation factor (Section 523.9)
    const thermalInsulationFactor = this.getThermalInsulationFactor(
      thermalInsulationLength, 
      totalLength
    );
    
    // Buried cable factor
    const buriedFactor = isBuried ? 
      this.getBuriedCableFactor(soilThermalResistivity) : 1.0;

    // Overall derating factor
    const overallDerating = groupingFactor * ambientTempFactor * thermalInsulationFactor * buriedFactor;
    const deratedCurrent = originalRating * overallDerating;

    return {
      groupingFactor,
      ambientTempFactor,
      thermalInsulationFactor,
      buriedFactor,
      overallDerating,
      deratedCurrent,
      originalRating
    };
  }

  private static getGroupingFactor(numberOfCircuits: number, installationMethod: string): number {
    // Simplified grouping factors - actual values depend on specific installation method
    const groupingTable: { [circuits: number]: number } = {
      1: 1.00,
      2: 0.80,
      3: 0.70,
      4: 0.65,
      5: 0.60,
      6: 0.57,
      7: 0.54,
      8: 0.52,
      9: 0.50,
      10: 0.48
    };

    return groupingTable[Math.min(numberOfCircuits, 10)] || 0.45;
  }

  private static getAmbientTempFactor(ambientTemp: number): number {
    // For 70°C thermoplastic insulation, 30°C reference
    if (ambientTemp <= 30) return 1.00;
    if (ambientTemp <= 35) return 0.94;
    if (ambientTemp <= 40) return 0.87;
    if (ambientTemp <= 45) return 0.79;
    if (ambientTemp <= 50) return 0.71;
    if (ambientTemp <= 55) return 0.61;
    if (ambientTemp <= 60) return 0.50;
    return 0.35; // Above 60°C
  }

  private static getThermalInsulationFactor(insulationLength: number, totalLength: number): number {
    if (insulationLength === 0) return 1.00;
    
    const ratio = insulationLength / totalLength;
    
    if (ratio >= 1.0) return 0.50; // Completely in insulation
    if (ratio >= 0.5) return 0.55;
    if (ratio >= 0.2) return 0.75;
    if (ratio >= 0.1) return 0.85;
    return 0.90; // Less than 10%
  }

  private static getBuriedCableFactor(soilResistivity: number): number {
    // Simplified calculation - actual values depend on depth, spacing, etc.
    if (soilResistivity <= 1.0) return 1.18; // Wet soil
    if (soilResistivity <= 2.5) return 1.00; // Standard soil
    if (soilResistivity <= 3.0) return 0.90; // Dry soil
    return 0.80; // Very dry soil
  }
}

/**
 * Three Phase Calculator
 * Calculations for balanced and unbalanced three-phase systems
 */
export class ThreePhaseCalculator {
  /**
   * Calculate three-phase electrical values
   */
  static calculate(inputs: {
    voltage?: number; // Line voltage (V)
    current?: number; // Line current (A)
    power?: number; // Total power (W)
    powerFactor: number;
    connectionType: 'star' | 'delta';
    phaseCurrents?: [number, number, number]; // For unbalanced loads
  }): ThreePhaseResult {
    const { voltage, current, power, powerFactor, connectionType, phaseCurrents } = inputs;
    
    let lineCurrent = current || 0;
    let lineVoltage = voltage || 0;
    let totalPower = power || 0;

    // Calculate missing values
    if (power && voltage && !current) {
      totalPower = power;
      lineVoltage = voltage;
      lineCurrent = power / (Math.sqrt(3) * voltage * powerFactor);
    } else if (voltage && current && !power) {
      lineVoltage = voltage;
      lineCurrent = current;
      totalPower = Math.sqrt(3) * voltage * current * powerFactor;
    }

    // Phase values depend on connection type
    let phaseVoltage: number;
    let phaseCurrent: number;

    if (connectionType === 'star') {
      phaseVoltage = lineVoltage / Math.sqrt(3);
      phaseCurrent = lineCurrent;
    } else { // delta
      phaseVoltage = lineVoltage;
      phaseCurrent = lineCurrent / Math.sqrt(3);
    }

    const powerPerPhase = totalPower / 3;

    // Check if balanced (if phase currents provided)
    let isBalanced = true;
    let neutralCurrent = 0;

    if (phaseCurrents) {
      const [i1, i2, i3] = phaseCurrents;
      const average = (i1 + i2 + i3) / 3;
      const maxDeviation = Math.max(
        Math.abs(i1 - average),
        Math.abs(i2 - average),
        Math.abs(i3 - average)
      );
      isBalanced = maxDeviation / average < 0.05; // Within 5%
      
      // Simplified neutral current calculation (assumes 120° phase separation)
      if (!isBalanced) {
        neutralCurrent = Math.sqrt(
          Math.pow(i1, 2) + Math.pow(i2, 2) + Math.pow(i3, 2) - 
          i1*i2 - i2*i3 - i3*i1
        );
      }
    }

    return {
      lineCurrent,
      phaseCurrent,
      lineVoltage,
      phaseVoltage,
      totalPower,
      powerPerPhase,
      isBalanced,
      neutralCurrent,
      powerFactor
    };
  }
}

/**
 * Power Factor Calculator
 * Calculate power factor and correction requirements
 */
export class PowerFactorCalculator {
  /**
   * Calculate power factor and correction requirements
   */
  static calculate(inputs: {
    activePower?: number; // kW
    reactivePower?: number; // kVAr
    apparentPower?: number; // kVA
    powerFactor?: number;
    voltage: number; // V
    current?: number; // A
    targetPowerFactor?: number; // Desired power factor (default 0.95)
  }): PowerFactorResult {
    const { voltage, current, targetPowerFactor = 0.95 } = inputs;
    let { activePower, reactivePower, apparentPower, powerFactor } = inputs;

    // Calculate missing values using power triangle relationships
    if (current && voltage && !apparentPower) {
      apparentPower = (voltage * current) / 1000; // kVA
    }

    if (apparentPower && powerFactor && !activePower) {
      activePower = apparentPower * powerFactor;
    }

    if (activePower && apparentPower && !powerFactor) {
      powerFactor = activePower / apparentPower;
    }

    if (activePower && powerFactor && !apparentPower) {
      apparentPower = activePower / powerFactor;
    }

    if (activePower && apparentPower && !reactivePower) {
      reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(activePower, 2));
    }

    // Calculate phase angle
    const phaseAngle = Math.acos(powerFactor || 0) * (180 / Math.PI);

    // Determine if correction is required
    const correctionRequired = (powerFactor || 0) < targetPowerFactor;

    let capacitorSize: number | undefined;
    let improvedPowerFactor: number | undefined;

    if (correctionRequired && activePower && powerFactor) {
      // Calculate capacitor size for power factor correction
      const currentAngle = Math.acos(powerFactor);
      const targetAngle = Math.acos(targetPowerFactor);
      
      const kVArToRemove = activePower * (Math.tan(currentAngle) - Math.tan(targetAngle));
      capacitorSize = kVArToRemove;
      improvedPowerFactor = targetPowerFactor;
    }

    return {
      powerFactor: powerFactor || 0,
      apparentPower: apparentPower || 0,
      activePower: activePower || 0,
      reactivePower: reactivePower || 0,
      phaseAngle,
      correctionRequired,
      capacitorSize,
      improvedPowerFactor
    };
  }
}

/**
 * Conduit Fill Calculator
 * Calculate conduit fill percentage and compliance (BS EN 61386)
 */
export class ConduitFillCalculator {
  /**
   * Calculate conduit fill
   */
  static calculate(inputs: {
    conduitSize: number; // Internal diameter (mm)
    cableDetails: Array<{
      diameter: number; // Cable overall diameter (mm)
      quantity: number;
    }>;
  }): ConduitFillResult {
    const { conduitSize, cableDetails } = inputs;
    
    // Calculate conduit internal area
    const conduitArea = Math.PI * Math.pow(conduitSize / 2, 2);
    
    // Calculate total cable area
    let totalCableArea = 0;
    let totalCables = 0;
    
    cableDetails.forEach(cable => {
      const cableArea = Math.PI * Math.pow(cable.diameter / 2, 2);
      totalCableArea += cableArea * cable.quantity;
      totalCables += cable.quantity;
    });
    
    const fillPercentage = (totalCableArea / conduitArea) * 100;
    
    // Maximum fill percentages (BS EN 61386)
    let maxFillAllowed: number;
    if (totalCables === 1) {
      maxFillAllowed = 53; // Single cable
    } else if (totalCables === 2) {
      maxFillAllowed = 31; // Two cables
    } else {
      maxFillAllowed = 40; // Three or more cables
    }
    
    const isCompliant = fillPercentage <= maxFillAllowed;
    
    // Suggest next size up if not compliant
    let nextSizeUp: string | undefined;
    if (!isCompliant) {
      const standardSizes = [16, 20, 25, 32, 40, 50, 63, 75, 90, 110];
      const nextSize = standardSizes.find(size => size > conduitSize);
      nextSizeUp = nextSize ? `${nextSize}mm` : 'Larger than 110mm required';
    }
    
    return {
      conduitSize: `${conduitSize}mm`,
      fillPercentage: Math.round(fillPercentage * 10) / 10,
      maxCables: totalCables,
      isCompliant,
      nextSizeUp,
      regulation: 'BS EN 61386 & IET Guidance Note 1'
    };
  }
}

/**
 * Earth Electrode Resistance Calculator
 * Calculate earth electrode resistance and compliance (BS 7671 Section 542)
 */
export class EarthElectrodeResistanceCalculator {
  /**
   * Calculate earth electrode resistance
   */
  static calculate(inputs: {
    electrodeType: 'rod' | 'plate' | 'strip' | 'foundation';
    installationType: 'TT' | 'TN-S' | 'TN-C-S';
    measuredResistance?: number; // If known from measurement
    soilResistivity?: number; // Ω⋅m
    electrodeLength?: number; // For rods (m)
    electrodeArea?: number; // For plates (m²)
    rcdRating?: number; // mA, if RCD protection used
  }): EarthElectrodeResult {
    const { 
      electrodeType, 
      installationType, 
      measuredResistance,
      soilResistivity = 100, // Default average soil resistivity
      electrodeLength = 1.2,
      electrodeArea = 0.5,
      rcdRating = 30
    } = inputs;

    let calculatedResistance = measuredResistance;
    
    // Calculate theoretical resistance if not measured
    if (!measuredResistance) {
      calculatedResistance = this.calculateTheoreticalResistance(
        electrodeType,
        soilResistivity,
        electrodeLength,
        electrodeArea
      );
    }

    // Determine maximum allowed resistance
    let maxResistanceAllowed: number;
    
    if (installationType === 'TT') {
      // For TT systems: RA × IΔn ≤ 50V (where IΔn is RCD rating)
      maxResistanceAllowed = 50 / (rcdRating / 1000); // Convert mA to A
    } else {
      // For TN systems, typically aim for ≤ 1Ω for good earthing
      maxResistanceAllowed = 1.0;
    }

    const resistance = calculatedResistance || 0;
    const isCompliant = resistance <= maxResistanceAllowed;

    const improvementSuggestions = this.getImprovementSuggestions(
      resistance,
      maxResistanceAllowed,
      electrodeType,
      soilResistivity
    );

    return {
      resistance,
      isCompliant,
      maxResistanceAllowed,
      electrodeType,
      improvementSuggestions,
      seasonalVariation: 'Resistance may vary ±50% with soil moisture content',
      testConditions: 'Test during dry conditions for worst-case measurement',
    };
  }

  private static calculateTheoreticalResistance(
    electrodeType: string,
    soilResistivity: number,
    length: number,
    area: number
  ): number {
    switch (electrodeType) {
      case 'rod':
        // Approximate formula for driven rod
        return (soilResistivity / (2 * Math.PI * length)) * 
               (Math.log(4 * length / 0.016) - 1); // 16mm diameter assumed
      
      case 'plate':
        // Approximate formula for buried plate
        return (soilResistivity / (4 * Math.sqrt(area / Math.PI)));
      
      case 'strip':
        // Simplified calculation for buried strip
        return soilResistivity / (2 * Math.PI * length);
      
      case 'foundation':
        // Very approximate - foundation earth electrodes are complex
        return soilResistivity / (20 * Math.sqrt(area));
      
      default:
        return 100; // Default high value
    }
  }

  private static getImprovementSuggestions(
    resistance: number,
    maxAllowed: number,
    electrodeType: string,
    soilResistivity: number
  ): string[] {
    const suggestions: string[] = [];

    if (resistance > maxAllowed) {
      suggestions.push('Current resistance exceeds maximum allowed value');
      
      if (soilResistivity > 200) {
        suggestions.push('High soil resistivity - consider chemical treatment');
      }
      
      switch (electrodeType) {
        case 'rod':
          suggestions.push('Consider longer earth rod or multiple rods in parallel');
          suggestions.push('Ensure good contact between rod and surrounding soil');
          break;
        case 'plate':
          suggestions.push('Consider larger plate area or multiple plates');
          break;
        default:
          suggestions.push('Consider alternative electrode type or additional electrodes');
      }
      
      suggestions.push('Improve soil conditions around electrode (moisture, conductivity)');
      suggestions.push('Consider using earthing enhancement material');
    } else {
      suggestions.push('Resistance is within acceptable limits');
      suggestions.push('Regular testing recommended to monitor condition');
    }

    return suggestions;
  }
}

/**
 * Solar PV System Calculator
 * Calculate solar panel array sizing and requirements
 */
export class SolarPVCalculator {
  /**
   * Calculate solar PV system requirements
   */
  static calculate(inputs: {
    dailyEnergyRequirement: number; // kWh per day
    peakSunHours: number; // Hours per day (UK average ~3.5)
    systemEfficiency: number; // Overall system efficiency (0.8-0.85 typical)
    panelWattage: number; // Individual panel rating (W)
    availableRoofArea?: number; // m²
    shadingFactor?: number; // 0.0-1.0 (1.0 = no shading)
    orientation?: number; // Degrees from south (0 = south)
    tilt?: number; // Degrees from horizontal
  }): {
    requiredArraySize: number; // kW
    numberOfPanels: number;
    roofAreaRequired: number; // m²
    estimatedAnnualGeneration: number; // kWh
    inverterSizing: number; // kW
    dcCableSizing: string;
    earthingRequirements: string[];
    regulations: string[];
  } {
    const {
      dailyEnergyRequirement,
      peakSunHours,
      systemEfficiency,
      panelWattage,
      availableRoofArea,
      shadingFactor = 1.0,
      orientation = 0,
      tilt = 35
    } = inputs;

    // Calculate required array size
    const requiredArraySize = (dailyEnergyRequirement / (peakSunHours * systemEfficiency * shadingFactor));
    
    // Calculate number of panels
    const numberOfPanels = Math.ceil((requiredArraySize * 1000) / panelWattage);
    
    // Estimate roof area (assuming 6-8 panels per 10m²)
    const roofAreaRequired = (numberOfPanels / 7) * 10;
    
    // Calculate annual generation (accounting for UK conditions)
    const orientationFactor = Math.cos((Math.abs(orientation) * Math.PI) / 180);
    const tiltFactor = 0.85 + (0.15 * Math.cos(((tilt - 35) * Math.PI) / 180));
    const estimatedAnnualGeneration = requiredArraySize * peakSunHours * 365 * orientationFactor * tiltFactor * shadingFactor;
    
    // Inverter sizing (typically 0.8-1.2 times array size)
    const inverterSizing = requiredArraySize * 1.1;
    
    // DC cable sizing (simplified)
    const dcCurrent = (requiredArraySize * 1000) / 600; // Assuming 600V DC
    const dcCableSizing = dcCurrent <= 15 ? '4.0mm²' : dcCurrent <= 25 ? '6.0mm²' : '10.0mm²';

    return {
      requiredArraySize,
      numberOfPanels,
      roofAreaRequired,
      estimatedAnnualGeneration,
      inverterSizing,
      dcCableSizing,
      earthingRequirements: [
        'All metallic components must be earthed',
        'Equipotential bonding of array frame',
        'Separate earth electrode may be required',
        'Earth continuity throughout DC system'
      ],
      regulations: [
        'BS 7671 Section 712 - Solar photovoltaic systems',
        'MCS 012 - Solar PV installation standard',
        'Building Regulations Part P compliance',
        'DNO G83/G99 grid connection approval'
      ]
    };
  }
}

/**
 * Battery Storage Calculator
 * Calculate battery storage system requirements
 */
export class BatteryStorageCalculator {
  /**
   * Calculate battery storage requirements
   */
  static calculate(inputs: {
    dailyEnergyUsage: number; // kWh
    backupDuration: number; // Hours of backup required
    batteryType: 'lead_acid' | 'lithium_ion' | 'lithium_phosphate';
    systemVoltage: number; // 12V, 24V, 48V etc.
    depthOfDischarge: number; // 0.5 for lead acid, 0.8-0.9 for lithium
    efficiency: number; // Round-trip efficiency
    peakLoadPower: number; // kW peak power requirement
    solarGeneration?: number; // kWh daily from solar
  }): {
    requiredCapacity: number; // kWh
    batteryAmpHours: number; // Ah at system voltage
    numberOfBatteries: number;
    inverterSize: number; // kW
    chargingCurrent: number; // A
    cableSizing: string;
    ventilationRequirements: string[];
    safetyRequirements: string[];
    economicAnalysis: {
      cycleLife: number;
      costPerCycle: number;
      paybackEstimate: string;
    };
  } {
    const {
      dailyEnergyUsage,
      backupDuration,
      batteryType,
      systemVoltage,
      depthOfDischarge,
      efficiency,
      peakLoadPower,
      solarGeneration = 0
    } = inputs;

    // Calculate required capacity
    const backupEnergy = (dailyEnergyUsage * backupDuration) / 24;
    const usableCapacity = backupEnergy / depthOfDischarge;
    const requiredCapacity = usableCapacity / efficiency;

    // Convert to Ah at system voltage
    const batteryAmpHours = (requiredCapacity * 1000) / systemVoltage;

    // Estimate number of batteries (assuming typical battery sizes)
    const typicalBatteryAh = batteryType === 'lead_acid' ? 100 : 
                            batteryType === 'lithium_ion' ? 50 : 
                            100; // lithium_phosphate
    const numberOfBatteries = Math.ceil(batteryAmpHours / typicalBatteryAh);

    // Inverter sizing
    const inverterSize = Math.max(peakLoadPower * 1.2, requiredCapacity * 0.5);

    // Charging current (C/10 for lead acid, C/2 for lithium)
    const chargeRate = batteryType === 'lead_acid' ? 0.1 : 0.5;
    const chargingCurrent = batteryAmpHours * chargeRate;

    // Cable sizing for battery bank
    const batteryCurrent = (peakLoadPower * 1000) / systemVoltage;
    const cableSizing = this.getBatteryCableSize(batteryCurrent);

    // Get type-specific requirements
    const { ventilation, safety, economic } = this.getBatteryTypeRequirements(batteryType);

    return {
      requiredCapacity,
      batteryAmpHours,
      numberOfBatteries,
      inverterSize,
      chargingCurrent,
      cableSizing,
      ventilationRequirements: ventilation,
      safetyRequirements: safety,
      economicAnalysis: economic
    };
  }

  private static getBatteryCableSize(current: number): string {
    if (current <= 50) return '16mm²';
    if (current <= 75) return '25mm²';
    if (current <= 100) return '35mm²';
    if (current <= 150) return '50mm²';
    return '70mm² or larger';
  }

  private static getBatteryTypeRequirements(batteryType: string) {
    switch (batteryType) {
      case 'lead_acid':
        return {
          ventilation: [
            'Adequate ventilation required for hydrogen gas',
            'No ignition sources within 2m',
            'Ventilation rate: 0.05m³/h per Ah of battery capacity'
          ],
          safety: [
            'Eye wash station required',
            'Acid-resistant flooring',
            'Personal protective equipment mandatory',
            'Emergency procedures for acid spills'
          ],
          economic: {
            cycleLife: 1000,
            costPerCycle: 0.15,
            paybackEstimate: '8-12 years'
          }
        };
      
      case 'lithium_ion':
        return {
          ventilation: [
            'Thermal management system required',
            'Fire suppression system recommended',
            'Temperature monitoring essential'
          ],
          safety: [
            'BMS (Battery Management System) mandatory',
            'Thermal runaway protection',
            'Individual cell monitoring',
            'Emergency isolation switch'
          ],
          economic: {
            cycleLife: 5000,
            costPerCycle: 0.08,
            paybackEstimate: '10-15 years'
          }
        };
      
      default: // lithium_phosphate
        return {
          ventilation: [
            'Basic ventilation adequate',
            'Temperature monitoring recommended'
          ],
          safety: [
            'BMS required',
            'Thermal protection',
            'Overcharge/discharge protection'
          ],
          economic: {
            cycleLife: 8000,
            costPerCycle: 0.06,
            paybackEstimate: '12-18 years'
          }
        };
    }
  }
}

/**
 * Emergency Lighting Calculator
 * Calculate emergency lighting requirements (BS 5266)
 */
export class EmergencyLightingCalculator {
  /**
   * Calculate emergency lighting requirements
   */
  static calculate(inputs: {
    roomArea: number; // m²
    roomType: 'open_area' | 'escape_route' | 'high_risk' | 'toilet' | 'lift_car';
    ceilingHeight: number; // m
    escapeRouteWidth?: number; // m
    occupancy: number; // Number of people
    existingLights?: Array<{
      lumens: number;
      position: { x: number; y: number };
    }>;
  }): {
    requiredIlluminance: number; // lux
    uniformityRatio: number;
    minimumDuration: number; // hours
    numberOfLuminaires: number;
    luminaireSpacing: number; // m
    testingSchedule: string[];
    complianceRequirements: string[];
    recommendations: string[];
  } {
    const { roomArea, roomType, ceilingHeight, escapeRouteWidth, occupancy } = inputs;

    // Get requirements based on room type (BS 5266)
    const requirements = this.getEmergencyLightingRequirements(roomType);
    
    // Calculate number of luminaires needed
    const lumensPerLuminaire = 200; // Typical emergency luminaire output
    const totalLumensRequired = roomArea * requirements.illuminance;
    const numberOfLuminaires = Math.ceil(totalLumensRequired / lumensPerLuminaire);
    
    // Calculate spacing
    const luminaireSpacing = Math.sqrt(roomArea / numberOfLuminaires);
    
    // Ensure spacing doesn't exceed maximum for ceiling height
    const maxSpacing = ceilingHeight * 4; // Rule of thumb
    const adjustedSpacing = Math.min(luminaireSpacing, maxSpacing);
    
    return {
      requiredIlluminance: requirements.illuminance,
      uniformityRatio: requirements.uniformity,
      minimumDuration: requirements.duration,
      numberOfLuminaires: Math.ceil(roomArea / Math.pow(adjustedSpacing, 2)),
      luminaireSpacing: adjustedSpacing,
      testingSchedule: [
        'Daily: Visual check of indicators',
        'Monthly: Brief functional test',
        'Annual: Full 3-hour duration test',
        'Annual: Professional inspection and certification'
      ],
      complianceRequirements: [
        'BS 5266-1: Code of practice for emergency lighting',
        'BS EN 1838: Lighting applications - Emergency lighting',
        'Fire Risk Assessment requirements',
        'Building Regulations Part B compliance'
      ],
      recommendations: this.getRecommendations(roomType, occupancy, ceilingHeight)
    };
  }

  private static getEmergencyLightingRequirements(roomType: string) {
    switch (roomType) {
      case 'escape_route':
        return { illuminance: 1.0, uniformity: 40, duration: 3 }; // 1 lux, 40:1 ratio, 3 hours
      case 'open_area':
        return { illuminance: 0.5, uniformity: 40, duration: 3 }; // 0.5 lux for areas >60m²
      case 'high_risk':
        return { illuminance: 15.0, uniformity: 10, duration: 3 }; // High risk areas
      case 'toilet':
        return { illuminance: 0.5, uniformity: 40, duration: 1 }; // 1 hour minimum
      case 'lift_car':
        return { illuminance: 5.0, uniformity: 40, duration: 1 }; // 5 lux in lift cars
      default:
        return { illuminance: 0.5, uniformity: 40, duration: 3 };
    }
  }

  private static getRecommendations(roomType: string, occupancy: number, ceilingHeight: number): string[] {
    const recommendations: string[] = [];
    
    if (occupancy > 50) {
      recommendations.push('Consider addressable emergency lighting system for large occupancy');
    }
    
    if (ceilingHeight > 4) {
      recommendations.push('High mounting height - ensure adequate light distribution');
    }
    
    if (roomType === 'escape_route') {
      recommendations.push('Ensure continuous lighting along entire escape route');
      recommendations.push('Light exit signs and directional signs clearly');
    }
    
    recommendations.push('Use LED emergency luminaires for longer life and lower maintenance');
    recommendations.push('Consider self-testing systems to reduce maintenance burden');
    
    return recommendations;
  }
}

/**
 * Diversity Factor Calculator
 * Calculate diversity factors for different types of loads (BS 7671 Appendix A)
 */
export class DiversityFactorCalculator {
  /**
   * Calculate diversity factors for mixed loads
   */
  static calculate(inputs: {
    lighting: number; // Total lighting load (W)
    heating: number; // Total heating load (W)
    socketOutlets: number; // Number of socket outlets
    cookers: Array<{ rating: number; quantity: number }>; // Cooker ratings and quantities
    waterHeating: number; // Water heating load (W)
    airConditioning: number; // A/C load (W)
    motorLoads: number; // Motor loads (W)
    installationType: 'domestic' | 'commercial' | 'industrial';
  }): {
    lightingDemand: number;
    heatingDemand: number;
    socketDemand: number;
    cookerDemand: number;
    waterHeatingDemand: number;
    airConditioningDemand: number;
    motorDemand: number;
    totalDemand: number;
    diversityApplied: number; // Total diversity factor applied
    loadBreakdown: Array<{ load: string; connected: number; demand: number; diversity: number }>;
  } {
    const { lighting, heating, socketOutlets, cookers, waterHeating, airConditioning, motorLoads, installationType } = inputs;

    // Get diversity factors based on installation type
    const factors = this.getDiversityFactors(installationType);

    // Calculate demand for each load type
    const lightingDemand = lighting * factors.lighting;
    const heatingDemand = heating * factors.heating;
    const socketDemand = this.calculateSocketDemand(socketOutlets, installationType);
    const cookerDemand = this.calculateCookerDemand(cookers);
    const waterHeatingDemand = waterHeating * factors.waterHeating;
    const airConditioningDemand = airConditioning * factors.airConditioning;
    const motorDemand = motorLoads * factors.motors;

    const totalConnected = lighting + heating + (socketOutlets * 100) + 
                          cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0) +
                          waterHeating + airConditioning + motorLoads;

    const totalDemand = lightingDemand + heatingDemand + socketDemand + 
                       cookerDemand + waterHeatingDemand + airConditioningDemand + motorDemand;

    const diversityApplied = totalConnected > 0 ? totalDemand / totalConnected : 0;

    const loadBreakdown = [
      { load: 'Lighting', connected: lighting, demand: lightingDemand, diversity: factors.lighting },
      { load: 'Heating', connected: heating, demand: heatingDemand, diversity: factors.heating },
      { load: 'Socket Outlets', connected: socketOutlets * 100, demand: socketDemand, diversity: socketDemand / (socketOutlets * 100) },
      { load: 'Cookers', connected: cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0), demand: cookerDemand, diversity: cookerDemand / Math.max(cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0), 1) },
      { load: 'Water Heating', connected: waterHeating, demand: waterHeatingDemand, diversity: factors.waterHeating },
      { load: 'Air Conditioning', connected: airConditioning, demand: airConditioningDemand, diversity: factors.airConditioning },
      { load: 'Motors', connected: motorLoads, demand: motorDemand, diversity: factors.motors }
    ];

    return {
      lightingDemand,
      heatingDemand,
      socketDemand,
      cookerDemand,
      waterHeatingDemand,
      airConditioningDemand,
      motorDemand,
      totalDemand,
      diversityApplied,
      loadBreakdown
    };
  }

  private static getDiversityFactors(installationType: string) {
    switch (installationType) {
      case 'domestic':
        return {
          lighting: 0.9, // 90% for lighting
          heating: 1.0, // 100% for heating
          waterHeating: 1.0, // 100% for water heating
          airConditioning: 0.8, // 80% for A/C
          motors: 1.0 // 100% for motors
        };
      case 'commercial':
        return {
          lighting: 0.8,
          heating: 0.9,
          waterHeating: 0.8,
          airConditioning: 0.9,
          motors: 0.9
        };
      default: // industrial
        return {
          lighting: 0.9,
          heating: 1.0,
          waterHeating: 1.0,
          airConditioning: 1.0,
          motors: 1.0
        };
    }
  }

  private static calculateSocketDemand(socketOutlets: number, installationType: string): number {
    // Socket outlet diversity (BS 7671 Appendix A, Table A1)
    if (installationType === 'domestic') {
      if (socketOutlets <= 10) return socketOutlets * 100; // 100W per socket for first 10
      if (socketOutlets <= 20) return 1000 + ((socketOutlets - 10) * 50); // 50W for next 10
      return  1500 + ((socketOutlets - 20) * 25); // 25W for remaining
    } else {
      // Commercial/industrial - higher diversity
      return socketOutlets * 80; // 80W per socket average
    }
  }

  private static calculateCookerDemand(cookers: Array<{ rating: number; quantity: number }>): number {
    let totalRating = 0;
    
    cookers.forEach(cooker => {
      totalRating += cooker.rating * cooker.quantity;
    });

    // Cooker diversity (BS 7671 Appendix A)
    if (totalRating <= 10000) return totalRating * 1.0; // 100% for first 10kW
    if (totalRating <= 60000) return 10000 + ((totalRating - 10000) * 0.5); // 50% for next 50kW
    return 35000 + ((totalRating - 60000) * 0.25); // 25% for remainder
  }
}

/**
 * Protective Device Selection Calculator
 * Select appropriate MCB, RCBO, or fuse for circuit protection
 */
export class ProtectiveDeviceCalculator {
  /**
   * Select appropriate protective device
   */
  static calculate(inputs: {
    circuitCurrent: number; // Design current (A)
    cableRating: number; // Cable current carrying capacity (A)
    circuitType: 'lighting' | 'power' | 'motor' | 'heating' | 'special';
    faultLevel: number; // Prospective fault current (kA)
    earthing: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
    rcdRequired: boolean;
    specialRequirements?: string[];
  }): {
    deviceType: string; // MCB, RCBO, Fuse
    deviceRating: number; // Rated current (A)
    deviceCurve: string; // B, C, D curve for MCBs
    breakingCapacity: number; // kA
    rcdRating?: number; // mA if RCD/RCBO
    recommendations: string[];
    compliance: string[];
  } {
    const { circuitCurrent, cableRating, circuitType, faultLevel, earthing, rcdRequired, specialRequirements = [] } = inputs;

    // Select device rating (next standard rating above design current)
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const deviceRating = standardRatings.find(rating => 
      rating >= circuitCurrent && rating <= cableRating
    ) || standardRatings[standardRatings.length - 1];

    // Select device curve based on circuit type
    const deviceCurve = this.selectDeviceCurve(circuitType, specialRequirements);

    // Select device type
    let deviceType = rcdRequired ? 'RCBO' : 'MCB';
    if (specialRequirements.includes('high_breaking_capacity')) {
      deviceType = 'HBC Fuse';
    }

    // Select breaking capacity based on fault level
    const breakingCapacity = this.selectBreakingCapacity(faultLevel);

    // RCD rating if required
    let rcdRating: number | undefined;
    if (rcdRequired) {
      rcdRating = earthing === 'TT' ? 100 : 30; // 30mA for additional protection, 100mA for fault protection
    }

    const recommendations = this.getRecommendations(circuitType, deviceRating, circuitCurrent, cableRating);
    const compliance = this.getComplianceRequirements(deviceType, earthing, rcdRequired);

    return {
      deviceType,
      deviceRating,
      deviceCurve,
      breakingCapacity,
      rcdRating,
      recommendations,
      compliance
    };
  }

  private static selectDeviceCurve(circuitType: string, specialRequirements: string[]): string {
    if (specialRequirements.includes('high_inrush')) return 'D';
    if (circuitType === 'motor') return 'D';
    if (circuitType === 'heating' && specialRequirements.includes('resistive_load')) return 'B';
    if (circuitType === 'lighting') return 'B';
    return 'C'; // Default for general purposes
  }

  private static selectBreakingCapacity(faultLevel: number): number {
    if (faultLevel <= 6) return 6; // 6kA
    if (faultLevel <= 10) return 10; // 10kA
    if (faultLevel <= 16) return 16; // 16kA
    return 25; // 25kA for high fault levels
  }

  private static getRecommendations(circuitType: string, deviceRating: number, circuitCurrent: number, cableRating: number): string[] {
    const recommendations: string[] = [];

    if (deviceRating > circuitCurrent * 1.45) {
      recommendations.push('Consider lower rated device for better overload protection');
    }

    if (deviceRating === cableRating) {
      recommendations.push('Device rating equals cable rating - acceptable but consider cable derating factors');
    }

    if (circuitType === 'motor') {
      recommendations.push('Consider motor protection switch in addition to MCB');
    }

    recommendations.push('Ensure proper discrimination with upstream devices');
    recommendations.push('Verify fault current at point of installation');

    return recommendations;
  }

  private static getComplianceRequirements(deviceType: string, earthing: string, rcdRequired: boolean): string[] {
    const compliance: string[] = [
      'BS EN 60898 (MCBs) or BS EN 61009 (RCBOs)',
      'BS 7671 Chapter 53 - Protection, isolation, switching',
      'Suitable for AC 230V/400V operation'
    ];

    if (rcdRequired) {
      compliance.push('BS EN 61008 (RCDs) compliance');
      compliance.push('Type AC, A, or B as appropriate for load');
    }

    if (earthing === 'TT') {
      compliance.push('RCD protection mandatory for fault protection');
    }

    return compliance;
  }
}

/**
 * Fault Current Calculator
 * Calculate prospective fault current and short circuit analysis
 */
export class FaultCurrentCalculator {
  /**
   * Calculate fault current and short circuit analysis
   */
  static calculate(inputs: {
    sourceVoltage: number; // Supply voltage (V)
    sourceImpedance: number; // Source impedance (Ω)
    cableData: {
      length: number; // Cable length (m)
      resistance: number; // Resistance per km (Ω/km)
      reactance: number; // Reactance per km (Ω/km)
    };
    loadImpedance?: number; // Load impedance if relevant (Ω)
    systemType: 'single_phase' | 'three_phase';
    faultType: 'line_earth' | 'line_line' | 'three_phase';
  }): {
    prospectiveFaultCurrent: number; // kA
    faultCurrentRMS: number; // kA RMS
    peakFaultCurrent: number; // kA peak (asymmetrical)
    faultImpedance: number; // Total fault impedance (Ω)
    arcingFaultCurrent?: number; // Reduced fault current due to arcing
    protectionRequirements: {
      minimumBreakingCapacity: number; // kA
      maximumDisconnectionTime: number; // s
      earthFaultLoopImpedance: number; // Ω
    };
    safetyConsiderations: string[];
  } {
    const { sourceVoltage, sourceImpedance, cableData, loadImpedance = 0, systemType, faultType } = inputs;

    // Calculate cable impedance
    const cableLength = cableData.length / 1000; // Convert to km
    const cableResistance = cableData.resistance * cableLength;
    const cableReactance = cableData.reactance * cableLength;
    const cableImpedance = Math.sqrt(Math.pow(cableResistance, 2) + Math.pow(cableReactance, 2));

    // Calculate total fault impedance
    let faultImpedance = sourceImpedance + cableImpedance;

    // Adjust for fault type and system
    if (faultType === 'line_earth') {
      faultImpedance += cableResistance; // Add protective conductor resistance
    }
    
    if (systemType === 'three_phase' && faultType === 'three_phase') {
      // Three-phase fault typically has lower impedance
      faultImpedance *= 0.87; // Approximate factor
    }

    // Calculate fault currents
    let faultVoltage = sourceVoltage;
    if (systemType === 'three_phase') {
      faultVoltage = faultType === 'line_line' ? sourceVoltage : sourceVoltage / Math.sqrt(3);
    }

    const prospectiveFaultCurrent = faultVoltage / faultImpedance / 1000; // kA
    const faultCurrentRMS = prospectiveFaultCurrent;
    
    // Peak fault current (considering DC component)
    const peakFaultCurrent = faultCurrentRMS * Math.sqrt(2) * 1.8; // Asymmetrical factor

    // Arcing fault current (typically 12-38% of bolted fault current)
    const arcingFaultCurrent = prospectiveFaultCurrent * 0.25;

    // Protection requirements
    const minimumBreakingCapacity = Math.ceil(prospectiveFaultCurrent * 1.2); // 20% safety margin
    const maximumDisconnectionTime = faultType === 'line_earth' ? 0.4 : 5.0; // seconds
    const earthFaultLoopImpedance = faultImpedance;

    const safetyConsiderations = [
      `Prospective fault current: ${prospectiveFaultCurrent.toFixed(2)}kA`,
      'Ensure protective devices have adequate breaking capacity',
      'Consider arc flash hazard during maintenance',
      'Verify discrimination between protective devices',
      'Regular testing of fault current levels recommended'
    ];

    if (prospectiveFaultCurrent > 10) {
      safetyConsiderations.push('HIGH FAULT CURRENT - Special safety precautions required');
    }

    return {
      prospectiveFaultCurrent,
      faultCurrentRMS,
      peakFaultCurrent,
      faultImpedance,
      arcingFaultCurrent,
      protectionRequirements: {
        minimumBreakingCapacity,
        maximumDisconnectionTime,
        earthFaultLoopImpedance
      },
      safetyConsiderations
    };
  }
}
