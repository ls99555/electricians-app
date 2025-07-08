/**
 * Cable and Protection Calculations
 * Cable derating, conduit fill, and protective device selection
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 (18th Edition) - Requirements for Electrical Installations
 * - BS 7671 Appendix 4 - Current-carrying capacity and voltage drop
 * - IET Guidance Note 1 - Selection & Erection of Equipment
 * - IET Guidance Note 6 - Protection Against Overcurrent
 * - BS EN 60898 - Circuit breakers for over-current protection
 * - BS EN 61009 - Residual current operated circuit breakers
 * 
 * Cable Installation Methods (BS 7671 Table 4A2):
 * - Method A: Enclosed in conduit in thermally insulating wall
 * - Method B: Enclosed in conduit on a wall or in trunking
 * - Method C: Clipped direct to non-metallic surface
 * - Method D: In conduit in masonry wall
 * - Method E: In free air
 * - Method F: Underground in ducts
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Cable selections must be verified by qualified electrical engineers
 * - Always use manufacturer's data for final cable selection
 * - Professional indemnity insurance recommended for all electrical work
 */

import type { 
  CableDeratingResult, 
  ProtectiveDeviceResult, 
  ConduitFillResult,
  EarthingSystem,
  CircuitType
} from './types';
import { ELECTRICAL_CONSTANTS } from './types';

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
    circuitType: CircuitType;
    faultLevel: number; // Prospective fault current (kA)
    earthing: EarthingSystem;
    rcdRequired: boolean;
    specialRequirements?: string[];
  }): ProtectiveDeviceResult {
    const { circuitCurrent, cableRating, circuitType, faultLevel, earthing, rcdRequired, specialRequirements = [] } = inputs;

    // Select device rating (next standard rating above design current)
    const deviceRating = ELECTRICAL_CONSTANTS.STANDARD_MCB_RATINGS.find(rating => 
      rating >= circuitCurrent && rating <= cableRating
    ) || ELECTRICAL_CONSTANTS.STANDARD_MCB_RATINGS[ELECTRICAL_CONSTANTS.STANDARD_MCB_RATINGS.length - 1];

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

  private static selectDeviceCurve(circuitType: CircuitType, specialRequirements: string[]): string {
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

  private static getRecommendations(circuitType: CircuitType, deviceRating: number, circuitCurrent: number, cableRating: number): string[] {
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

  private static getComplianceRequirements(deviceType: string, earthing: EarthingSystem, rcdRequired: boolean): string[] {
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
