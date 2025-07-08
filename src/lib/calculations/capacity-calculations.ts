/**
 * Maximum Capacity Calculations
 * Service head, distribution board, transformer, and circuit capacity calculations
 * Based on BS 7671 and UK electrical installation practices
 */

import type {
  ServiceHeadResult,
  DistributionBoardResult,
  TransformerResult,
  CircuitCapacityResult
} from './types';

/**
 * Service Head Maximum Demand Calculator
 * Calculate maximum demand for service head capacity
 * Based on BS 7671 and DNO requirements
 */
export class ServiceHeadCalculator {
  static calculate(inputs: {
    installationType: 'domestic' | 'commercial' | 'industrial';
    totalConnectedLoad: number; // Total connected load in kW
    diversityFactors: {
      lighting: number;
      heating: number;
      power: number;
      motors: number;
      specialLoads: number;
    };
    simultaneityFactor: number; // Overall simultaneity factor
    futureExpansion: number; // Future expansion allowance (%)
    phases: 1 | 3;
    voltage: number;
  }): ServiceHeadResult {
    const { 
      installationType, 
      totalConnectedLoad, 
      diversityFactors, 
      simultaneityFactor, 
      futureExpansion, 
      phases,
      voltage 
    } = inputs;

    try {
      this.validateServiceHeadInputs(inputs);

      // Apply diversity factors to calculate actual maximum demand
      const diversityAppliedLoad = totalConnectedLoad * 
        (diversityFactors.lighting + diversityFactors.heating + 
         diversityFactors.power + diversityFactors.motors + 
         diversityFactors.specialLoads) / 5;

      // Apply simultaneity factor
      const maximumDemand = diversityAppliedLoad * simultaneityFactor;

      // Add future expansion allowance
      const designMaximumDemand = maximumDemand * (1 + futureExpansion / 100);

      // Calculate current requirement
      const designCurrent = phases === 3 
        ? (designMaximumDemand * 1000) / (Math.sqrt(3) * voltage)
        : (designMaximumDemand * 1000) / voltage;

      // Determine service head capacity based on installation type
      const serviceHeadCapacity = this.determineServiceHeadCapacity(
        installationType, 
        designCurrent
      );

      // Calculate utilization factor
      const utilizationFactor = (designCurrent / serviceHeadCapacity) * 100;

      const recommendations = [
        'Confirm service head capacity with DNO before installation',
        'Consider load growth and future expansion requirements',
        'Install appropriate main switch and protection'
      ];

      if (utilizationFactor > 80) {
        recommendations.push('Service head utilization is high - consider larger capacity');
      }

      if (installationType === 'commercial' || installationType === 'industrial') {
        recommendations.push('Consider installing sub-meters for load monitoring');
      }

      return {
        totalConnectedLoad,
        maximumDemand: Math.round(maximumDemand * 100) / 100,
        designMaximumDemand: Math.round(designMaximumDemand * 100) / 100,
        designCurrent: Math.round(designCurrent * 100) / 100,
        serviceHeadCapacity,
        utilizationFactor: Math.round(utilizationFactor * 10) / 10,
        recommendations,
        regulation: 'BS 7671 Section 311, DNO Engineering Recommendations'
      };
    } catch (error) {
      throw new Error(`Service head calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateServiceHeadInputs(inputs: {
    totalConnectedLoad: number;
    simultaneityFactor: number;
    futureExpansion: number;
    phases: number;
    voltage: number;
  }): void {
    const { totalConnectedLoad, simultaneityFactor, futureExpansion, phases, voltage } = inputs;

    if (totalConnectedLoad <= 0) throw new Error('Total connected load must be positive');
    if (simultaneityFactor <= 0 || simultaneityFactor > 1) throw new Error('Simultaneity factor must be between 0 and 1');
    if (futureExpansion < 0 || futureExpansion > 100) throw new Error('Future expansion must be between 0 and 100%');
    if (phases !== 1 && phases !== 3) throw new Error('Phases must be 1 or 3');
    if (voltage <= 0) throw new Error('Voltage must be positive');
  }

  private static determineServiceHeadCapacity(
    installationType: string, 
    designCurrent: number
  ): number {
    // Standard service head capacities based on UK practice
    const domesticCapacities = [60, 80, 100];
    const commercialCapacities = [100, 125, 160, 200, 250, 315, 400];
    const industrialCapacities = [200, 250, 315, 400, 500, 630, 800, 1000];

    let availableCapacities: number[];
    switch (installationType) {
      case 'domestic':
        availableCapacities = domesticCapacities;
        break;
      case 'commercial':
        availableCapacities = commercialCapacities;
        break;
      case 'industrial':
        availableCapacities = industrialCapacities;
        break;
      default:
        availableCapacities = commercialCapacities;
    }

    // Select capacity with 125% margin as per BS 7671
    const requiredCapacity = designCurrent * 1.25;
    return availableCapacities.find(capacity => capacity >= requiredCapacity) || 
           availableCapacities[availableCapacities.length - 1];
  }
}

/**
 * Distribution Board Load Calculator
 * Calculate distribution board capacity and circuit allocation
 */
export class DistributionBoardCalculator {
  static calculate(inputs: {
    circuits: Array<{
      type: 'lighting' | 'power' | 'heating' | 'motor' | 'special';
      load: number; // Load in watts
      diversity: number; // Diversity factor (0-1)
      protection: number; // MCB rating
    }>;
    phases: 1 | 3;
    voltage: number;
    boardType: 'RCBO' | 'MCB_RCD' | 'MCB_only';
    spareWays: number; // Number of spare ways required
  }): DistributionBoardResult {
    const { circuits, phases, voltage, boardType, spareWays } = inputs;

    try {
      this.validateDistributionBoardInputs(inputs);

      // Calculate total connected load and demand
      let totalConnectedLoad = 0;
      let totalDemand = 0;
      let maxCircuitRating = 0;

      circuits.forEach(circuit => {
        totalConnectedLoad += circuit.load;
        totalDemand += circuit.load * circuit.diversity;
        maxCircuitRating = Math.max(maxCircuitRating, circuit.protection);
      });

      // Calculate total current demand
      const totalCurrent = phases === 3 
        ? (totalDemand) / (Math.sqrt(3) * voltage)
        : (totalDemand) / voltage;

      // Determine main switch rating
      const mainSwitchRating = this.calculateMainSwitchRating(totalCurrent);

      // Calculate number of ways required
      const usedWays = circuits.length;
      const totalWaysRequired = usedWays + spareWays;

      // Determine standard board size
      const standardBoardSizes = [6, 8, 12, 16, 18, 24, 36, 42];
      const recommendedBoardSize = standardBoardSizes.find(size => size >= totalWaysRequired) || 42;

      // Calculate utilization
      const boardUtilization = (usedWays / recommendedBoardSize) * 100;

      const recommendations = [
        'Install appropriate surge protection device (SPD)',
        'Label all circuits clearly according to BS 7671',
        'Ensure adequate IP rating for installation environment'
      ];

      if (boardType === 'MCB_only') {
        recommendations.push('Consider RCD protection for enhanced safety');
      }

      if (boardUtilization > 75) {
        recommendations.push('Consider larger board for future expansion');
      }

      return {
        totalConnectedLoad: Math.round(totalConnectedLoad),
        totalDemand: Math.round(totalDemand),
        totalCurrent: Math.round(totalCurrent * 100) / 100,
        mainSwitchRating,
        usedWays,
        spareWays,
        recommendedBoardSize,
        boardUtilization: Math.round(boardUtilization * 10) / 10,
        recommendations,
        regulation: 'BS 7671 Section 536 Distribution Boards'
      };
    } catch (error) {
      throw new Error(`Distribution board calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateDistributionBoardInputs(inputs: {
    circuits: Array<any>;
    phases: number;
    voltage: number;
    spareWays: number;
  }): void {
    const { circuits, phases, voltage, spareWays } = inputs;

    if (!Array.isArray(circuits) || circuits.length === 0) throw new Error('Circuits array cannot be empty');
    if (phases !== 1 && phases !== 3) throw new Error('Phases must be 1 or 3');
    if (voltage <= 0) throw new Error('Voltage must be positive');
    if (spareWays < 0) throw new Error('Spare ways cannot be negative');

    circuits.forEach((circuit, index) => {
      if (circuit.load <= 0) throw new Error(`Circuit ${index + 1} load must be positive`);
      if (circuit.diversity <= 0 || circuit.diversity > 1) throw new Error(`Circuit ${index + 1} diversity must be between 0 and 1`);
      if (circuit.protection <= 0) throw new Error(`Circuit ${index + 1} protection rating must be positive`);
    });
  }

  private static calculateMainSwitchRating(totalCurrent: number): number {
    const standardRatings = [63, 80, 100, 125, 160, 200, 250, 315, 400];
    return standardRatings.find(rating => rating >= totalCurrent * 1.25) || 400;
  }
}

/**
 * Transformer Capacity Calculator
 * Calculate transformer sizing for electrical installations
 */
export class TransformerCalculator {
  static calculate(inputs: {
    primaryVoltage: number; // Primary voltage (V)
    secondaryVoltage: number; // Secondary voltage (V)
    loadPower: number; // Connected load (kVA)
    loadPowerFactor: number; // Load power factor
    efficiency: number; // Transformer efficiency
    diversityFactor: number; // Load diversity factor
    ambientTemp: number; // Ambient temperature (°C)
    loadGrowth: number; // Expected load growth (%)
    redundancyRequired: boolean; // N+1 redundancy
  }): TransformerResult {
    const { 
      primaryVoltage, 
      secondaryVoltage, 
      loadPower, 
      loadPowerFactor, 
      efficiency, 
      diversityFactor,
      ambientTemp,
      loadGrowth,
      redundancyRequired 
    } = inputs;

    try {
      this.validateTransformerInputs(inputs);

      // Calculate actual load demand
      const actualLoad = loadPower * diversityFactor;

      // Apply load growth factor
      const futureLoad = actualLoad * (1 + loadGrowth / 100);

      // Calculate losses
      const losses = futureLoad * (1 - efficiency) / efficiency;

      // Calculate required transformer capacity
      let requiredCapacity = futureLoad + losses;

      // Apply temperature derating
      const tempDerating = this.calculateTemperatureDerating(ambientTemp);
      requiredCapacity = requiredCapacity / tempDerating;

      // Apply safety margin
      requiredCapacity *= 1.25; // 25% safety margin

      // Handle redundancy
      if (redundancyRequired) {
        requiredCapacity *= 2; // N+1 requires double capacity
      }

      // Select standard transformer rating
      const standardRatings = [50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500];
      const selectedRating = standardRatings.find(rating => rating >= requiredCapacity) || 2500;

      // Calculate utilization
      const utilization = (futureLoad / selectedRating) * 100;

      // Calculate primary and secondary currents
      const primaryCurrent = (selectedRating * 1000) / (Math.sqrt(3) * primaryVoltage);
      const secondaryCurrent = (selectedRating * 1000) / (Math.sqrt(3) * secondaryVoltage);

      const recommendations = [
        'Install appropriate protection on both primary and secondary sides',
        'Ensure adequate ventilation for transformer cooling',
        'Install temperature monitoring and alarms',
        'Provide earthing system as per BS 7671'
      ];

      if (utilization > 80) {
        recommendations.push('Transformer utilization is high - monitor loading carefully');
      }

      if (redundancyRequired) {
        recommendations.push('Implement automatic changeover system for redundancy');
      }

      return {
        loadPower,
        requiredCapacity: Math.round(requiredCapacity),
        selectedRating,
        utilization: Math.round(utilization * 10) / 10,
        efficiency: Math.round(efficiency * 1000) / 10,
        losses: Math.round(losses * 100) / 100,
        primaryCurrent: Math.round(primaryCurrent * 100) / 100,
        secondaryCurrent: Math.round(secondaryCurrent * 100) / 100,
        tempDerating: Math.round(tempDerating * 1000) / 1000,
        recommendations,
        regulation: 'BS 7671 Section 551 Transformers, BS EN 60076 Transformer Standards'
      };
    } catch (error) {
      throw new Error(`Transformer calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateTransformerInputs(inputs: {
    primaryVoltage: number;
    secondaryVoltage: number;
    loadPower: number;
    loadPowerFactor: number;
    efficiency: number;
    diversityFactor: number;
    ambientTemp: number;
    loadGrowth: number;
  }): void {
    const { 
      primaryVoltage, 
      secondaryVoltage, 
      loadPower, 
      loadPowerFactor, 
      efficiency, 
      diversityFactor,
      ambientTemp,
      loadGrowth 
    } = inputs;

    if (primaryVoltage <= 0) throw new Error('Primary voltage must be positive');
    if (secondaryVoltage <= 0) throw new Error('Secondary voltage must be positive');
    if (loadPower <= 0) throw new Error('Load power must be positive');
    if (loadPowerFactor <= 0 || loadPowerFactor > 1) throw new Error('Load power factor must be between 0 and 1');
    if (efficiency <= 0 || efficiency > 1) throw new Error('Efficiency must be between 0 and 1');
    if (diversityFactor <= 0 || diversityFactor > 1) throw new Error('Diversity factor must be between 0 and 1');
    if (ambientTemp < -40 || ambientTemp > 60) throw new Error('Ambient temperature out of range');
    if (loadGrowth < 0 || loadGrowth > 200) throw new Error('Load growth must be between 0 and 200%');
  }

  private static calculateTemperatureDerating(ambientTemp: number): number {
    // Standard temperature derating for transformers
    // Based on 40°C reference temperature
    if (ambientTemp <= 40) return 1.0;
    if (ambientTemp <= 45) return 0.96;
    if (ambientTemp <= 50) return 0.92;
    return 0.87; // >50°C
  }
}

/**
 * Circuit Capacity Calculator
 * Calculate ring and radial circuit maximum capacity
 */
export class CircuitCapacityCalculator {
  static calculate(inputs: {
    circuitType: 'ring' | 'radial';
    cableSize: number; // Cable CSA in mm²
    installationMethod: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; // Reference methods
    circuitLength: number; // Circuit length in meters
    voltage: number; // Circuit voltage
    maxVoltageDrop: number; // Maximum voltage drop percentage
    ambientTemp: number; // Ambient temperature
    groupingFactor: number; // Cable grouping factor
    thermalInsulation: boolean; // Surrounded by thermal insulation
  }): CircuitCapacityResult {
    const { 
      circuitType, 
      cableSize, 
      installationMethod, 
      circuitLength, 
      voltage, 
      maxVoltageDrop,
      ambientTemp,
      groupingFactor,
      thermalInsulation 
    } = inputs;

    try {
      this.validateCircuitInputs(inputs);

      // Get base current carrying capacity
      const baseCurrentCarryingCapacity = this.getBaseCurrentCarryingCapacity(
        cableSize, 
        installationMethod
      );

      // Apply derating factors
      const tempFactor = this.getTemperatureDerating(ambientTemp);
      const insulationFactor = thermalInsulation ? 0.5 : 1.0;

      const deratedCapacity = baseCurrentCarryingCapacity * 
                             tempFactor * 
                             groupingFactor * 
                             insulationFactor;

      // Calculate voltage drop constraint
      const voltageDropConstraint = this.calculateVoltageDropConstraint(
        cableSize,
        circuitLength,
        voltage,
        maxVoltageDrop
      );

      // Determine circuit capacity (limited by thermal or voltage drop)
      const circuitCapacity = Math.min(deratedCapacity, voltageDropConstraint);

      // Calculate maximum load for circuit type
      let maxLoad: number;
      if (circuitType === 'ring') {
        // Ring circuits can typically handle higher loads
        maxLoad = circuitCapacity * voltage * 0.8; // 80% utilization
      } else {
        // Radial circuits
        maxLoad = circuitCapacity * voltage * 0.7; // 70% utilization
      }

      // Recommendations based on circuit type and capacity
      const recommendations = [
        'Install appropriate protective device rated not exceeding circuit capacity',
        'Ensure all connections are properly made and tested',
        'Consider RCD protection for enhanced safety'
      ];

      if (circuitType === 'ring') {
        recommendations.push('Test ring circuit continuity at both ends');
        recommendations.push('Maximum 100m cable length for 2.5mm² ring circuits');
      }

      if (circuitCapacity === voltageDropConstraint) {
        recommendations.push('Circuit capacity limited by voltage drop - consider larger cable');
      }

      return {
        circuitType,
        cableSize,
        baseCurrentCarryingCapacity,
        deratedCapacity: Math.round(deratedCapacity * 100) / 100,
        voltageDropConstraint: Math.round(voltageDropConstraint * 100) / 100,
        circuitCapacity: Math.round(circuitCapacity * 100) / 100,
        maxLoad: Math.round(maxLoad),
        utilizationFactor: circuitType === 'ring' ? 80 : 70,
        recommendations,
        regulation: 'BS 7671 Appendix 4 Current Carrying Capacity, Section 433 Protection'
      };
    } catch (error) {
      throw new Error(`Circuit capacity calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateCircuitInputs(inputs: {
    cableSize: number;
    circuitLength: number;
    voltage: number;
    maxVoltageDrop: number;
    ambientTemp: number;
    groupingFactor: number;
  }): void {
    const { cableSize, circuitLength, voltage, maxVoltageDrop, ambientTemp, groupingFactor } = inputs;

    if (cableSize <= 0) throw new Error('Cable size must be positive');
    if (circuitLength <= 0) throw new Error('Circuit length must be positive');
    if (voltage <= 0) throw new Error('Voltage must be positive');
    if (maxVoltageDrop <= 0 || maxVoltageDrop > 10) throw new Error('Max voltage drop must be between 0 and 10%');
    if (ambientTemp < -20 || ambientTemp > 70) throw new Error('Ambient temperature out of range');
    if (groupingFactor <= 0 || groupingFactor > 1) throw new Error('Grouping factor must be between 0 and 1');
  }

  private static getBaseCurrentCarryingCapacity(cableSize: number, installationMethod: string): number {
    // Simplified current carrying capacity table (BS 7671 Appendix 4)
    const capacityTable: { [key: string]: { [key: number]: number } } = {
      'A': { 1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101 },
      'B': { 1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 25: 89 },
      'C': { 1.5: 20, 2.5: 27, 4: 37, 6: 47, 10: 64, 16: 85, 25: 112 },
      'D': { 1.5: 18, 2.5: 25, 4: 33, 6: 42, 10: 58, 16: 77, 25: 101 },
      'E': { 1.5: 16, 2.5: 22, 4: 29, 6: 38, 10: 52, 16: 69, 25: 90 },
      'F': { 1.5: 14, 2.5: 19, 4: 25, 6: 32, 10: 44, 16: 58, 25: 76 }
    };

    return capacityTable[installationMethod]?.[cableSize] || 0;
  }

  private static getTemperatureDerating(ambientTemp: number): number {
    // Temperature derating factors (BS 7671 Table 4B1)
    if (ambientTemp <= 30) return 1.00;
    if (ambientTemp <= 35) return 0.94;
    if (ambientTemp <= 40) return 0.87;
    if (ambientTemp <= 45) return 0.79;
    if (ambientTemp <= 50) return 0.71;
    return 0.61;
  }

  private static calculateVoltageDropConstraint(
    cableSize: number, 
    length: number, 
    voltage: number, 
    maxVoltageDrop: number
  ): number {
    // Simplified voltage drop calculation
    // Using typical resistance values for copper cables
    const resistanceTable: { [key: number]: number } = {
      1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83, 16: 1.15, 25: 0.727
    };

    const resistance = resistanceTable[cableSize] || 1; // mΩ/m
    const maxVoltageDropValue = (voltage * maxVoltageDrop) / 100;
    
    // I = V / (R × L × 2) for voltage drop constraint
    return maxVoltageDropValue / (resistance * length * 2 / 1000);
  }
}
