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
  CableRouteLengthResult,
  FuseSelectionResult,
  CableScreenArmourResult,
  EarthingSystem,
  CircuitType
} from '../../types';
import { ELECTRICAL_CONSTANTS } from '../../constants';

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
      originalRating,
      isCompliant: deratedCurrent > originalRating * 0.8, // 80% minimum threshold
      recommendations: deratedCurrent < originalRating * 0.8 ? 
        ['Consider cable upgrade', 'Review installation method', 'Improve ventilation'] : 
        ['Cable derating acceptable'],
      regulation: 'BS 7671 Appendix 4 - Current-carrying capacity and voltage drop for cables'
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
      compliance,
      isCompliant: deviceRating >= circuitCurrent * 1.1 && breakingCapacity > faultLevel,
      regulation: 'BS 7671 Chapter 43 - Protection against overcurrent'
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
      recommendations: isCompliant ? 
        ['Conduit fill within acceptable limits'] : 
        ['Use larger conduit size', 'Reduce number of cables', 'Use cable tray instead'],
      regulation: 'BS EN 61386 & IET Guidance Note 1'
    };
  }
}

/**
 * Cable Route Length Calculator
 * Calculate cable route lengths including bends and deviations
 * Based on IET Guidance Note 1 and practical installation methods
 */
export class CableRouteLengthCalculator {
  /**
   * Calculate total cable route length
   */
  static calculate(inputs: {
    directDistance: number; // Direct point-to-point distance (m)
    routeType: string; // surface, conduit, tray, underground
    numberOfBends: number; // Number of 90-degree bends
    numberOfChanges: number; // Number of direction changes < 90 degrees
    heightDifference: number; // Vertical height difference (m)
    safetyMargin: number; // Additional margin percentage (%)
    routeObstacles: string[]; // obstacles requiring deviations
  }): {
    directDistance: number;
    adjustedDistance: number;
    bendsAllowance: number;
    heightAllowance: number;
    obstacleAllowance: number;
    safetyAllowance: number;
    totalRouteLength: number;
    costImplications: {
      additionalCableCost: number;
      voltageDrop: number;
    };
    recommendations: string[];
  } {
    const {
      directDistance,
      routeType,
      numberOfBends,
      numberOfChanges,
      heightDifference,
      safetyMargin,
      routeObstacles
    } = inputs;

    // Validate inputs
    if (directDistance <= 0) {
      throw new Error('Direct distance must be positive');
    }

    // Calculate allowances based on route type
    const bendAllowancePerBend = this.getBendAllowance(routeType);
    const changeAllowancePerChange = bendAllowancePerBend * 0.5;

    // Calculate individual allowances
    const bendsAllowance = numberOfBends * bendAllowancePerBend;
    const changesAllowance = numberOfChanges * changeAllowancePerChange;
    const heightAllowance = Math.abs(heightDifference) * 1.1; // 10% extra for height changes
    
    // Obstacle allowances
    let obstacleAllowance = 0;
    routeObstacles.forEach(obstacle => {
      obstacleAllowance += this.getObstacleAllowance(obstacle, directDistance);
    });

    // Calculate adjusted distance
    const adjustedDistance = directDistance + bendsAllowance + changesAllowance + heightAllowance + obstacleAllowance;
    
    // Apply safety margin
    const safetyAllowance = adjustedDistance * (safetyMargin / 100);
    const totalRouteLength = adjustedDistance + safetyAllowance;

    // Cost implications (estimated)
    const additionalLength = totalRouteLength - directDistance;
    const additionalCableCost = additionalLength * 15; // £15 per meter estimate
    const voltageDrop = this.estimateVoltageDrop(totalRouteLength, routeType);

    const recommendations = this.generateRouteRecommendations(
      totalRouteLength,
      directDistance,
      routeType,
      numberOfBends
    );

    return {
      directDistance,
      adjustedDistance,
      bendsAllowance: bendsAllowance + changesAllowance,
      heightAllowance,
      obstacleAllowance,
      safetyAllowance,
      totalRouteLength: Math.round(totalRouteLength * 10) / 10,
      costImplications: {
        additionalCableCost: Math.round(additionalCableCost),
        voltageDrop: Math.round(voltageDrop * 100) / 100
      },
      recommendations
    };
  }

  private static getBendAllowance(routeType: string): number {
    // Additional length per 90-degree bend (meters)
    switch (routeType.toLowerCase()) {
      case 'rigid_conduit':
        return 0.5; // Rigid conduit requires generous bends
      case 'flexible_conduit':
        return 0.3;
      case 'cable_tray':
        return 0.2;
      case 'surface_clipped':
        return 0.1;
      case 'underground':
        return 0.8; // Underground requires very generous bends
      default:
        return 0.3;
    }
  }

  private static getObstacleAllowance(obstacle: string, baseDistance: number): number {
    // Additional allowance for obstacles as percentage of base distance
    switch (obstacle.toLowerCase()) {
      case 'beam':
        return baseDistance * 0.05; // 5% additional
      case 'pipe_cluster':
        return baseDistance * 0.08; // 8% additional
      case 'structural_member':
        return baseDistance * 0.06;
      case 'equipment':
        return baseDistance * 0.10;
      case 'tight_space':
        return baseDistance * 0.15;
      default:
        return baseDistance * 0.05;
    }
  }

  private static estimateVoltageDrop(length: number, routeType: string): number {
    // Estimated voltage drop per 100m for typical 2.5mm² copper cable
    const baseVoltageDropPer100m = routeType === 'underground' ? 1.5 : 1.8;
    return (length / 100) * baseVoltageDropPer100m;
  }

  private static generateRouteRecommendations(
    totalLength: number,
    directDistance: number,
    routeType: string,
    numberOfBends: number
  ): string[] {
    const recommendations: string[] = [];
    
    const lengthIncrease = ((totalLength - directDistance) / directDistance) * 100;
    
    recommendations.push(`Total route length: ${totalLength.toFixed(1)}m`);
    recommendations.push(`Length increase: ${lengthIncrease.toFixed(1)}% over direct route`);

    if (lengthIncrease > 50) {
      recommendations.push('Consider alternative routing to reduce cable length');
    }

    if (numberOfBends > 4) {
      recommendations.push('High number of bends - consider junction boxes');
    }

    if (routeType === 'underground') {
      recommendations.push('Underground route - consider cable protection and drainage');
    }

    recommendations.push('Allow additional length for terminations at each end');
    recommendations.push('Consider voltage drop implications for final cable selection');

    return recommendations;
  }
}

/**
 * Fuse Selection Calculator
 * Select appropriate fuses based on BS 88 and IET Guidance
 * Based on BS 88-3, BS 1361, and IET Guidance Note 6
 */
export class FuseSelectionCalculator {
  /**
   * Calculate fuse selection requirements
   */
  static calculate(inputs: {
    loadCurrent: number; // Load current (A)
    cableCurrent: number; // Cable current carrying capacity (A)
    fuseType: string; // BS88, BS1361, HRC, etc.
    applicationCategory: string; // motor, lighting, general, etc.
    ambientTemperature: number; // Operating temperature (°C)
    shortCircuitCurrent: number; // Prospective short circuit current (kA)
    discriminationRequired: boolean; // Discrimination with upstream protection
    upstreamProtection?: number; // Upstream protection rating (A)
  }): {
    recommendedFuseRating: number;
    fuseType: string;
    fuseCategory: string;
    breakingCapacity: number;
    discriminationMargin: number;
    complianceChecks: {
      overloadProtection: boolean;
      shortCircuitProtection: boolean;
      cableProtection: boolean;
      discrimination: boolean;
    };
    temperatureDerating: number;
    recommendations: string[];
  } {
    const {
      loadCurrent,
      cableCurrent,
      fuseType,
      applicationCategory,
      ambientTemperature,
      shortCircuitCurrent,
      discriminationRequired,
      upstreamProtection
    } = inputs;

    // Validate inputs
    if (loadCurrent <= 0 || cableCurrent <= 0) {
      throw new Error('Load current and cable current must be positive');
    }

    // Apply temperature derating if required
    const temperatureDerating = this.getTemperatureDerating(ambientTemperature, fuseType);
    const deratedFuseCurrent = cableCurrent / temperatureDerating;

    // Select fuse rating based on application
    let recommendedFuseRating = this.selectFuseRating(
      loadCurrent,
      deratedFuseCurrent,
      applicationCategory
    );

    // Get fuse characteristics
    const fuseCharacteristics = this.getFuseCharacteristics(fuseType, recommendedFuseRating);
    const breakingCapacity = fuseCharacteristics.breakingCapacity;

    // Check discrimination requirements
    let discriminationMargin = 0;
    if (discriminationRequired && upstreamProtection) {
      discriminationMargin = this.calculateDiscriminationMargin(
        recommendedFuseRating,
        upstreamProtection,
        fuseType
      );
      
      if (discriminationMargin < 2) {
        // Increase fuse rating to achieve discrimination
        recommendedFuseRating = this.getNextSmallerRating(upstreamProtection, fuseType);
      }
    }

    // Compliance checks
    const complianceChecks = {
      overloadProtection: recommendedFuseRating >= loadCurrent * 1.1, // Allow 10% margin
      shortCircuitProtection: breakingCapacity >= shortCircuitCurrent,
      cableProtection: recommendedFuseRating <= deratedFuseCurrent,
      discrimination: !discriminationRequired || discriminationMargin >= 2
    };

    const recommendations = this.generateFuseRecommendations(
      recommendedFuseRating,
      fuseType,
      complianceChecks,
      applicationCategory
    );

    return {
      recommendedFuseRating,
      fuseType,
      fuseCategory: fuseCharacteristics.category,
      breakingCapacity,
      discriminationMargin,
      complianceChecks,
      temperatureDerating,
      recommendations
    };
  }

  private static getTemperatureDerating(temperature: number, fuseType: string): number {
    // Temperature derating factors for fuses
    if (temperature <= 30) return 1.0;
    if (temperature <= 40) return 0.95;
    if (temperature <= 50) return 0.9;
    if (temperature <= 60) return 0.85;
    return 0.8; // Above 60°C
  }

  private static selectFuseRating(
    loadCurrent: number,
    cableCurrent: number,
    applicationCategory: string
  ): number {
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800];
    
    let minimumRating = loadCurrent;
    
    // Application-specific adjustments
    switch (applicationCategory.toLowerCase()) {
      case 'motor':
        minimumRating = loadCurrent * 1.25; // Motor starting current consideration
        break;
      case 'lighting':
        minimumRating = loadCurrent * 1.1; // Inrush current consideration
        break;
      case 'heating':
        minimumRating = loadCurrent * 1.25; // Thermal lag consideration
        break;
      default:
        minimumRating = loadCurrent * 1.1; // General 10% margin
    }

    // Find suitable rating that protects cable
    const suitableRating = standardRatings.find(rating => 
      rating >= minimumRating && rating <= cableCurrent
    );

    if (!suitableRating) {
      throw new Error('No suitable fuse rating found - cable may be undersized');
    }

    return suitableRating;
  }

  private static getFuseCharacteristics(fuseType: string, rating: number): {
    category: string;
    breakingCapacity: number;
  } {
    switch (fuseType.toLowerCase()) {
      case 'bs88':
        return {
          category: 'High Rupturing Capacity',
          breakingCapacity: rating <= 100 ? 80 : 120 // kA
        };
      case 'bs1361':
        return {
          category: 'Cartridge Fuse',
          breakingCapacity: rating <= 100 ? 16.5 : 33 // kA
        };
      case 'hrc':
        return {
          category: 'High Rupturing Capacity',
          breakingCapacity: 100 // kA
        };
      default:
        return {
          category: 'General Purpose',
          breakingCapacity: 35 // kA
        };
    }
  }

  private static calculateDiscriminationMargin(
    fuseRating: number,
    upstreamRating: number,
    fuseType: string
  ): number {
    // Discrimination ratio for fuses
    return upstreamRating / fuseRating;
  }

  private static getNextSmallerRating(upstreamRating: number, fuseType: string): number {
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800];
    
    // For discrimination, downstream should be at least 2 times smaller
    const maxDownstream = upstreamRating / 2;
    
    const suitableRatings = standardRatings.filter(rating => rating <= maxDownstream);
    return suitableRatings[suitableRatings.length - 1] || 6;
  }

  private static generateFuseRecommendations(
    fuseRating: number,
    fuseType: string,
    complianceChecks: any,
    applicationCategory: string
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Recommended fuse: ${fuseRating}A ${fuseType}`);

    if (!complianceChecks.cableProtection) {
      recommendations.push('WARNING: Fuse rating exceeds cable capacity - increase cable size');
    }

    if (!complianceChecks.shortCircuitProtection) {
      recommendations.push('WARNING: Fuse breaking capacity insufficient for fault current');
    }

    if (!complianceChecks.discrimination) {
      recommendations.push('Discrimination not achieved - consider different protection coordination');
    }

    if (applicationCategory === 'motor') {
      recommendations.push('Consider motor protection relay for comprehensive motor protection');
    }

    recommendations.push('Verify fuse time-current characteristics for specific application');
    recommendations.push('Ensure fuse base/holder is rated for fault current');

    return recommendations;
  }
}

/**
 * Cable Screen/Armour Sizing Calculator
 * Calculate cable screen and armour requirements
 * Based on BS 7671, IET Guidance Note 1, and cable manufacturer data
 */
export class CableScreenArmourCalculator {
  /**
   * Calculate cable screen and armour sizing
   */
  static calculate(inputs: {
    cableCores: number; // Number of cores
    coreCSA: number; // Core cross-sectional area (mm²)
    systemVoltage: number; // System voltage (V)
    installationEnvironment: string; // indoor, outdoor, underground, marine
    mechanicalProtection: string; // light, medium, heavy
    faultCurrent: number; // Earth fault current (A)
    faultDuration: number; // Fault clearance time (s)
    screenType: string; // foil, braid, tape, wire
    armourRequired: boolean; // Armour requirement
  }): {
    screenCSA: number;
    armourType: string;
    armourThickness: number;
    earthingRequirements: {
      screenEarthing: string;
      armourEarthing: string;
      earthConductor: number;
    };
    mechanicalProtection: {
      bendRadius: number;
      tensileStrength: number;
      compressionResistance: number;
    };
    environmentalProtection: {
      moistureResistance: string;
      corrosionProtection: string;
      uvResistance: string;
    };
    recommendations: string[];
  } {
    const {
      cableCores,
      coreCSA,
      systemVoltage,
      installationEnvironment,
      mechanicalProtection,
      faultCurrent,
      faultDuration,
      screenType,
      armourRequired
    } = inputs;

    // Calculate screen CSA based on fault current
    const screenCSA = this.calculateScreenCSA(
      faultCurrent,
      faultDuration,
      screenType,
      coreCSA
    );

    // Determine armour requirements
    const armourType = this.selectArmourType(
      mechanicalProtection,
      installationEnvironment,
      armourRequired
    );

    const armourThickness = this.calculateArmourThickness(
      coreCSA,
      cableCores,
      mechanicalProtection,
      armourType
    );

    // Earthing requirements
    const earthingRequirements = this.getEarthingRequirements(
      screenCSA,
      armourType,
      faultCurrent,
      systemVoltage
    );

    // Mechanical protection properties
    const mechanicalProtection_props = this.getMechanicalProperties(
      armourType,
      armourThickness,
      coreCSA,
      mechanicalProtection
    );

    // Environmental protection
    const environmentalProtection = this.getEnvironmentalProtection(
      installationEnvironment,
      armourType
    );

    const recommendations = this.generateScreenArmourRecommendations(
      screenCSA,
      armourType,
      installationEnvironment,
      systemVoltage
    );

    return {
      screenCSA: Math.round(screenCSA * 10) / 10,
      armourType,
      armourThickness: Math.round(armourThickness * 10) / 10,
      earthingRequirements,
      mechanicalProtection: mechanicalProtection_props,
      environmentalProtection,
      recommendations
    };
  }

  private static calculateScreenCSA(
    faultCurrent: number,
    faultDuration: number,
    screenType: string,
    coreCSA: number
  ): number {
    // Screen conductor sizing based on adiabatic equation
    // I²t = k²S² where k = material constant
    
    let k_factor = 143; // Copper screen
    if (screenType.includes('aluminium')) {
      k_factor = 95; // Aluminium screen
    }

    // Minimum screen area from adiabatic equation
    const I2t = Math.pow(faultCurrent, 2) * faultDuration;
    const screenCSA_adiabatic = Math.sqrt(I2t) / k_factor;

    // Minimum screen area as percentage of core area
    let minimumPercentage = 0.5; // 50% of core area minimum
    if (screenType === 'foil') {
      minimumPercentage = 0.2; // 20% for foil screens
    }

    const screenCSA_percentage = coreCSA * minimumPercentage;

    // Return the larger of the two calculations
    return Math.max(screenCSA_adiabatic, screenCSA_percentage);
  }

  private static selectArmourType(
    mechanicalProtection: string,
    environment: string,
    armourRequired: boolean
  ): string {
    if (!armourRequired) return 'None';

    switch (mechanicalProtection.toLowerCase()) {
      case 'heavy':
        return environment === 'marine' ? 'Galvanized Steel Wire' : 'Steel Wire Armour';
      case 'medium':
        return 'Steel Tape Armour';
      case 'light':
        return 'Aluminium Wire Armour';
      default:
        return environment.includes('underground') ? 'Steel Wire Armour' : 'Steel Tape Armour';
    }
  }

  private static calculateArmourThickness(
    coreCSA: number,
    cableCores: number,
    mechanicalProtection: string,
    armourType: string
  ): number {
    // Base thickness calculation
    const cableDiameter = this.estimateCableDiameter(coreCSA, cableCores);
    
    let baseThickness = 0.8; // mm

    if (armourType.includes('Wire')) {
      // Wire armour thickness based on cable diameter
      if (cableDiameter < 20) baseThickness = 1.6;
      else if (cableDiameter < 40) baseThickness = 2.5;
      else baseThickness = 3.15;
    } else if (armourType.includes('Tape')) {
      // Tape armour - typically thinner
      baseThickness = cableDiameter * 0.04; // 4% of cable diameter
    }

    // Adjustment for mechanical protection level
    switch (mechanicalProtection.toLowerCase()) {
      case 'heavy':
        return baseThickness * 1.5;
      case 'medium':
        return baseThickness;
      case 'light':
        return baseThickness * 0.7;
      default:
        return baseThickness;
    }
  }

  private static estimateCableDiameter(coreCSA: number, cableCores: number): number {
    // Rough estimation of cable diameter based on core area and number
    const coreRadius = Math.sqrt(coreCSA / Math.PI);
    const coreDiameter = coreRadius * 2;
    
    // Add insulation and sheath thickness
    const insulationThickness = 0.7 + (coreCSA / 50); // Variable with core size
    const sheathThickness = 1.5;
    
    const overallDiameter = (coreDiameter + 2 * insulationThickness) * Math.sqrt(cableCores) + 2 * sheathThickness;
    
    return overallDiameter;
  }

  private static getEarthingRequirements(
    screenCSA: number,
    armourType: string,
    faultCurrent: number,
    systemVoltage: number
  ): {
    screenEarthing: string;
    armourEarthing: string;
    earthConductor: number;
  } {
    let earthConductor = 0;
    
    // Earth conductor sizing based on adiabatic equation
    if (faultCurrent > 0) {
      const k_factor = 143; // Copper
      earthConductor = Math.max(1.5, faultCurrent / k_factor);
    }

    return {
      screenEarthing: screenCSA > 0 ? 'Required at both ends' : 'Not applicable',
      armourEarthing: armourType !== 'None' ? 'Required at both ends' : 'Not applicable',
      earthConductor: Math.round(earthConductor * 10) / 10
    };
  }

  private static getMechanicalProperties(
    armourType: string,
    armourThickness: number,
    coreCSA: number,
    mechanicalProtection: string
  ): {
    bendRadius: number;
    tensileStrength: number;
    compressionResistance: number;
  } {
    const cableDiameter = this.estimateCableDiameter(coreCSA, 3); // Assume 3-core for calculation
    
    let bendRadiusMultiplier = 12; // times cable diameter
    let tensileStrength = 500; // N/mm of cable circumference
    let compressionResistance = 250; // N/cm

    if (armourType.includes('Wire')) {
      bendRadiusMultiplier = 15;
      tensileStrength = 750;
      compressionResistance = 400;
    } else if (armourType.includes('Tape')) {
      bendRadiusMultiplier = 12;
      tensileStrength = 500;
      compressionResistance = 300;
    }

    // Adjust for mechanical protection level
    switch (mechanicalProtection.toLowerCase()) {
      case 'heavy':
        tensileStrength *= 1.5;
        compressionResistance *= 1.3;
        break;
      case 'medium':
        // base values
        break;
      case 'light':
        tensileStrength *= 0.8;
        compressionResistance *= 0.9;
        break;
    }

    return {
      bendRadius: Math.round(cableDiameter * bendRadiusMultiplier),
      tensileStrength: Math.round(tensileStrength),
      compressionResistance: Math.round(compressionResistance)
    };
  }

  private static getEnvironmentalProtection(
    environment: string,
    armourType: string
  ): {
    moistureResistance: string;
    corrosionProtection: string;
    uvResistance: string;
  } {
    let moistureResistance = 'Standard';
    let corrosionProtection = 'Basic';
    let uvResistance = 'Limited';

    switch (environment.toLowerCase()) {
      case 'marine':
        moistureResistance = 'Excellent';
        corrosionProtection = 'Marine Grade';
        uvResistance = 'High';
        break;
      case 'underground':
        moistureResistance = 'Excellent';
        corrosionProtection = 'Enhanced';
        uvResistance = 'Not applicable';
        break;
      case 'outdoor':
        moistureResistance = 'Good';
        corrosionProtection = 'Standard';
        uvResistance = 'High';
        break;
      case 'indoor':
        moistureResistance = 'Standard';
        corrosionProtection = 'Basic';
        uvResistance = 'Limited';
        break;
    }

    if (armourType.includes('Galvanized') && environment.toLowerCase() !== 'marine') {
      corrosionProtection = 'Enhanced';
    }

    return {
      moistureResistance,
      corrosionProtection,
      uvResistance
    };
  }

  private static generateScreenArmourRecommendations(
    screenCSA: number,
    armourType: string,
    environment: string,
    systemVoltage: number
  ): string[] {
    const recommendations: string[] = [];

    if (screenCSA > 0) {
      recommendations.push(`Screen CSA: ${screenCSA.toFixed(1)}mm² required for fault protection`);
      recommendations.push('Screen must be earthed at both ends for effective fault protection');
    }

    if (armourType !== 'None') {
      recommendations.push(`${armourType} provides mechanical protection for ${environment} environment`);
      recommendations.push('Armour earthing provides additional fault protection path');
    }

    if (environment === 'underground') {
      recommendations.push('Consider cable markers and warning tape for underground installation');
    }

    if (systemVoltage > 1000) {
      recommendations.push('High voltage application - ensure screen continuity and earthing');
    }

    recommendations.push('Verify manufacturer specifications for specific cable construction');
    recommendations.push('Consider installation method and termination requirements');

    return recommendations;
  }
}
