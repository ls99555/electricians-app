/**
 * Maximum Capacity Calculations
 * Service head, distribution board, transformer, and circuit capacity calculations
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 Section 311 - Assessment of general characteristics
 * - BS 7671 Appendix A - Current-carrying capacity and voltage drop for cables
 * - IET Guidance Note 1 - Selection & Erection of Equipment
 * - G81 - Connection of generation equipment in parallel with DNO networks
 * - Engineering Recommendation P2/6 - Security of Supply
 * - BS EN 61936-1 - Power installations exceeding 1 kV a.c.
 * 
 * UK Electrical Supply Standards:
 * - Single-phase domestic supply: typically 60-100A per phase
 * - Three-phase domestic supply: typically 100A per phase
 * - Commercial supplies: variable based on load assessment
 * - Industrial supplies: designed per specific requirements
 * - DNO approval required for supplies >100A per phase
 * 
 * Service Capacity Considerations:
 * - After diversity maximum demand (ADMD) calculations
 * - Future load expansion requirements
 * - Grid connection capacity limitations
 * - Power quality and harmonic considerations
 * - Load balancing across phases
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Service capacity must be agreed with Distribution Network Operator
 * - Load assessments must be verified by qualified electrical engineers
 * - Professional indemnity insurance recommended for all electrical work
 */

import type {
  ServiceHeadResult,
  DistributionBoardResult,
  TransformerResult,
  CircuitCapacityResult,
  SwitchgearRatingInputs,
  SwitchgearRatingResult,
  BusbarCurrentInputs,
  BusbarCurrentResult
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
    circuits: Array<{
      type: string;
      load: number;
      diversity: number;
      protection: number;
    }>;
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

/**
 * Switchgear Rating Calculator
 * Calculate switchgear ratings based on BS EN 61936-1 and BS 7671
 * Considers load requirements, fault levels, and environmental conditions
 */
export class SwitchgearRatingCalculator {
  static calculate(inputs: SwitchgearRatingInputs): SwitchgearRatingResult {
    this.validateInputs(inputs);

    const {
      systemVoltage,
      totalLoad,
      prospectiveFaultCurrent,
      switchgearType,
      operatingConditions,
      protectionRequirements,
      automationLevel
    } = inputs;

    // Calculate normal operating current
    const operatingCurrent = (totalLoad * 1000) / (Math.sqrt(3) * systemVoltage);
    
    // Apply safety margin and diversity factors
    const designCurrent = operatingCurrent * 1.25; // 25% safety margin
    
    // Determine nominal voltage class
    const nominalVoltage = this.getNominalVoltageClass(systemVoltage);
    
    // Calculate nominal current rating
    const nominalCurrent = this.getNominalCurrentRating(designCurrent);
    
    // Calculate short-circuit ratings
    const shortCircuitRating = this.calculateShortCircuitRating(
      prospectiveFaultCurrent,
      systemVoltage,
      switchgearType
    );
    
    // Calculate busbar rating
    const busbarRating = this.calculateBusbarRating(
      nominalCurrent,
      prospectiveFaultCurrent,
      operatingConditions.ambientTemperature
    );
    
    // Determine insulation levels
    const insulationLevel = this.getInsulationLevel(nominalVoltage, operatingConditions);
    
    // Mechanical specifications
    const mechanicalSpecification = this.getMechanicalSpecification(
      switchgearType,
      automationLevel,
      nominalVoltage
    );
    
    // Protection coordination
    const protectionCoordination = this.getProtectionCoordination(
      protectionRequirements,
      nominalCurrent,
      prospectiveFaultCurrent
    );
    
    // Installation and maintenance requirements
    const { installationRequirements, maintenanceRequirements } = 
      this.getMaintenanceRequirements(switchgearType, operatingConditions);
    
    // Economic analysis
    const economics = this.calculateEconomics(
      switchgearType,
      nominalVoltage,
      nominalCurrent,
      operatingConditions
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      inputs,
      nominalCurrent,
      shortCircuitRating
    );

    return {
      nominalVoltage,
      nominalCurrent,
      shortCircuitRating,
      busbarRating,
      insulationLevel,
      mechanicalSpecification,
      protectionCoordination,
      installationRequirements,
      maintenanceRequirements,
      economics,
      recommendations,
      regulation: 'Based on BS EN 61936-1:2010, BS 7671:2018+A2:2022, and IET Guidance Note 7'
    };
  }

  private static validateInputs(inputs: SwitchgearRatingInputs): void {
    if (inputs.systemVoltage <= 0) {
      throw new Error('System voltage must be positive');
    }
    if (inputs.totalLoad <= 0) {
      throw new Error('Total load must be positive');
    }
    if (inputs.prospectiveFaultCurrent <= 0) {
      throw new Error('Prospective fault current must be positive');
    }
    if (inputs.operatingConditions.ambientTemperature < -40 || inputs.operatingConditions.ambientTemperature > 60) {
      throw new Error('Ambient temperature must be between -40°C and 60°C');
    }
    if (inputs.operatingConditions.altitude < 0 || inputs.operatingConditions.altitude > 5000) {
      throw new Error('Altitude must be between 0 and 5000 meters');
    }
  }

  private static getNominalVoltageClass(systemVoltage: number): number {
    const voltageClasses = [0.4, 1, 3.3, 6.6, 11, 20, 33, 66, 132, 275, 400];
    return voltageClasses.find(v => v >= systemVoltage / 1000) || 400;
  }

  private static getNominalCurrentRating(designCurrent: number): number {
    const standardRatings = [16, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000];
    return standardRatings.find(rating => rating >= designCurrent) || 4000;
  }

  private static calculateShortCircuitRating(
    prospectiveFaultCurrent: number,
    systemVoltage: number,
    switchgearType: string
  ) {
    // Calculate breaking current with safety factor
    const breakingCurrent = prospectiveFaultCurrent * 1.1; // 10% safety margin
    
    // Making current (peak) = 2.5 × breaking current
    const makingCurrent = breakingCurrent * 2.5;
    
    // Short-time current rating typically equals breaking current
    const shortTimeRating = breakingCurrent;

    return {
      breakingCurrent: Math.round(breakingCurrent * 100) / 100,
      makingCurrent: Math.round(makingCurrent * 100) / 100,
      shortTimeRating: Math.round(shortTimeRating * 100) / 100
    };
  }

  private static calculateBusbarRating(
    nominalCurrent: number,
    prospectiveFaultCurrent: number,
    ambientTemperature: number
  ) {
    // Continuous current rating with temperature derating
    const tempDerating = ambientTemperature > 40 ? 0.98 : 1.0;
    const continuousCurrent = Math.round(nominalCurrent / tempDerating);
    
    // Short-time current rating
    const shortTimeCurrent = prospectiveFaultCurrent;
    
    // Peak current rating
    const peakCurrent = prospectiveFaultCurrent * 2.5;

    return {
      continuousCurrent,
      shortTimeCurrent: Math.round(shortTimeCurrent * 100) / 100,
      peakCurrent: Math.round(peakCurrent * 100) / 100
    };
  }

  private static getInsulationLevel(nominalVoltage: number, operatingConditions: any) {
    const baseInsulation = {
      0.4: { powerFrequency: 3, lightningImpulse: 1.5, switchingImpulse: 1.5 },
      1: { powerFrequency: 3, lightningImpulse: 20, switchingImpulse: 20 },
      11: { powerFrequency: 28, lightningImpulse: 75, switchingImpulse: 75 },
      33: { powerFrequency: 70, lightningImpulse: 170, switchingImpulse: 170 }
    };

    const insulation = baseInsulation[nominalVoltage as keyof typeof baseInsulation] || 
                     baseInsulation[33];

    // Apply altitude correction
    const altitudeCorrection = operatingConditions.altitude > 1000 ? 
      1 + (operatingConditions.altitude - 1000) * 0.00012 : 1;

    return {
      powerFrequencyVoltage: Math.round(insulation.powerFrequency * altitudeCorrection * 10) / 10,
      lightningImpulseVoltage: Math.round(insulation.lightningImpulse * altitudeCorrection * 10) / 10,
      switchingImpulseVoltage: Math.round(insulation.switchingImpulse * altitudeCorrection * 10) / 10
    };
  }

  private static getMechanicalSpecification(
    switchgearType: string,
    automationLevel: string,
    nominalVoltage: number
  ) {
    const operatingMechanisms = {
      'air_insulated': 'Spring operating mechanism',
      'gas_insulated': 'Stored energy mechanism',
      'vacuum': 'Magnetic actuator',
      'sf6': 'Hydraulic mechanism'
    };

    const operatingTimes = {
      'manual': 200,
      'semi_automatic': 100,
      'fully_automatic': 50
    };

    return {
      operatingMechanism: operatingMechanisms[switchgearType as keyof typeof operatingMechanisms] || 
                         'Spring operating mechanism',
      numberOfOperations: nominalVoltage >= 11 ? 10000 : 25000,
      operatingTime: operatingTimes[automationLevel as keyof typeof operatingTimes] || 100
    };
  }

  private static getProtectionCoordination(
    protectionRequirements: string[],
    nominalCurrent: number,
    prospectiveFaultCurrent: number
  ): string[] {
    const coordination = [
      `Overcurrent protection set at ${Math.round(nominalCurrent * 1.25)}A`,
      `Earth fault protection set at ${Math.round(nominalCurrent * 0.3)}A`,
      `Short-circuit protection: ${prospectiveFaultCurrent}kA breaking capacity required`
    ];

    protectionRequirements.forEach(req => {
      if (req.includes('differential')) {
        coordination.push('Differential protection recommended for transformer circuits');
      }
      if (req.includes('directional')) {
        coordination.push('Directional overcurrent protection for parallel feeders');
      }
      if (req.includes('distance')) {
        coordination.push('Distance protection for long transmission lines');
      }
    });

    return coordination;
  }

  private static getMaintenanceRequirements(
    switchgearType: string,
    operatingConditions: any
  ) {
    const maintenanceSchedules = {
      'air_insulated': ['Annual visual inspection', 'Triennial electrical testing', 'Quinquennial major overhaul'],
      'gas_insulated': ['Annual gas monitoring', 'Biennial electrical testing', 'Decennial major overhaul'],
      'vacuum': ['Annual visual inspection', 'Quinquennial contact assessment', 'Decennial replacement'],
      'sf6': ['Annual gas analysis', 'Triennial electrical testing', 'Quinquennial gas top-up']
    };

    const installationReqs = [
      'Minimum 1m clearance around switchgear',
      'Environmental sealing to IP54 minimum',
      'Emergency operating procedures posted',
      'Arc flash calculation and PPE requirements documented'
    ];

    if (operatingConditions.pollution !== 'light') {
      installationReqs.push('Enhanced cleaning schedule required');
    }

    return {
      installationRequirements: installationReqs,
      maintenanceRequirements: maintenanceSchedules[switchgearType as keyof typeof maintenanceSchedules] || 
                              maintenanceSchedules['air_insulated']
    };
  }

  private static calculateEconomics(
    switchgearType: string,
    nominalVoltage: number,
    nominalCurrent: number,
    operatingConditions: any
  ) {
    // Base costs per kV and A rating
    const baseCosts = {
      'air_insulated': { perKV: 2000, perA: 10 },
      'gas_insulated': { perKV: 5000, perA: 15 },
      'vacuum': { perKV: 3000, perA: 12 },
      'sf6': { perKV: 4000, perA: 14 }
    };

    const costs = baseCosts[switchgearType as keyof typeof baseCosts] || baseCosts['air_insulated'];
    
    const equipmentCost = Math.round(costs.perKV * nominalVoltage + costs.perA * nominalCurrent);
    const installationCost = Math.round(equipmentCost * 0.3); // 30% of equipment cost
    const maintenanceCost = Math.round(equipmentCost * 0.02); // 2% per year

    return {
      equipmentCost,
      installationCost,
      maintenanceCost
    };
  }

  private static generateRecommendations(
    inputs: SwitchgearRatingInputs,
    nominalCurrent: number,
    shortCircuitRating: any
  ): string[] {
    const recommendations = [
      'Ensure switchgear rating exceeds maximum demand current by at least 25%',
      'Verify short-circuit breaking capacity meets or exceeds prospective fault current',
      'Consider future load growth in switchgear selection',
      'Ensure adequate protection coordination with upstream and downstream devices'
    ];

    if (inputs.operatingConditions.indoor) {
      recommendations.push('Indoor installation - ensure adequate ventilation and space heating if required');
    } else {
      recommendations.push('Outdoor installation - specify appropriate IP rating and UV protection');
    }

    if (inputs.operatingConditions.pollution !== 'light') {
      recommendations.push('Enhanced insulation and cleaning schedule required for polluted environment');
    }

    if (inputs.operatingConditions.altitude > 1000) {
      recommendations.push('Altitude derating applied - verify with manufacturer specifications');
    }

    return recommendations;
  }
}

/**
 * Busbar Current Rating Calculator
 * Calculate busbar current ratings based on BS EN 60439 and BS 7671
 * Considers thermal, mechanical and electrical characteristics
 */
export class BusbarCurrentRatingCalculator {
  static calculate(inputs: BusbarCurrentInputs): BusbarCurrentResult {
    this.validateInputs(inputs);

    const {
      busbarType,
      material,
      dimensions,
      installationMethod,
      ambientTemperature,
      temperatureRise,
      ventilation,
      spacing,
      length
    } = inputs;

    // Calculate cross-sectional area
    const crossSectionalArea = this.calculateCrossSectionalArea(busbarType, dimensions);
    
    // Calculate continuous current rating
    const continuousCurrentRating = this.calculateContinuousCurrentRating(
      material,
      crossSectionalArea,
      installationMethod,
      ambientTemperature,
      temperatureRise,
      ventilation
    );
    
    // Calculate short-time current rating
    const shortTimeCurrentRating = this.calculateShortTimeCurrentRating(
      material,
      crossSectionalArea,
      ambientTemperature
    );
    
    // Calculate peak current rating
    const peakCurrentRating = shortTimeCurrentRating * 2.5;
    
    // Calculate thermal characteristics
    const thermalCalculation = this.calculateThermalCharacteristics(
      continuousCurrentRating,
      crossSectionalArea,
      material,
      installationMethod
    );
    
    // Calculate mechanical stresses
    const mechanicalStresses = this.calculateMechanicalStresses(
      continuousCurrentRating,
      spacing,
      busbarType,
      dimensions
    );
    
    // Calculate voltage drop
    const voltageDrop = this.calculateVoltageDrop(
      material,
      crossSectionalArea,
      spacing,
      busbarType
    );
    
    // Calculate short-circuit effects
    const shortCircuitEffects = this.calculateShortCircuitEffects(
      shortTimeCurrentRating,
      material,
      crossSectionalArea
    );
    
    // Calculate insulation requirements
    const insulationRequirements = this.calculateInsulationRequirements(
      continuousCurrentRating,
      spacing,
      installationMethod
    );
    
    // Calculate economics
    const economics = this.calculateEconomics(
      material,
      crossSectionalArea,
      length,
      continuousCurrentRating
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      inputs,
      continuousCurrentRating,
      thermalCalculation
    );

    return {
      continuousCurrentRating: Math.round(continuousCurrentRating),
      shortTimeCurrentRating: Math.round(shortTimeCurrentRating * 100) / 100,
      peakCurrentRating: Math.round(peakCurrentRating * 100) / 100,
      thermalCalculation,
      mechanicalStresses,
      voltageDrop,
      shortCircuitEffects,
      insulationRequirements,
      economics,
      recommendations,
      regulation: 'Based on BS EN 60439-1:2011, BS 7671:2018+A2:2022, and IET Guidance Note 1'
    };
  }

  private static validateInputs(inputs: BusbarCurrentInputs): void {
    if (inputs.ambientTemperature < -40 || inputs.ambientTemperature > 60) {
      throw new Error('Ambient temperature must be between -40°C and 60°C');
    }
    if (inputs.temperatureRise <= 0 || inputs.temperatureRise > 100) {
      throw new Error('Temperature rise must be between 0K and 100K');
    }
    if (inputs.spacing <= 0) {
      throw new Error('Phase spacing must be positive');
    }
    if (inputs.length <= 0) {
      throw new Error('Busbar length must be positive');
    }
    
    // Validate dimensions based on busbar type
    if (inputs.busbarType === 'rectangular' && (!inputs.dimensions.width || !inputs.dimensions.thickness)) {
      throw new Error('Width and thickness required for rectangular busbars');
    }
    if (inputs.busbarType === 'circular' && !inputs.dimensions.diameter) {
      throw new Error('Diameter required for circular busbars');
    }
  }

  private static calculateCrossSectionalArea(busbarType: string, dimensions: any): number {
    switch (busbarType) {
      case 'rectangular':
        return (dimensions.width || 0) * (dimensions.thickness || 0);
      case 'circular':
        return Math.PI * Math.pow((dimensions.diameter || 0) / 2, 2);
      case 'tubular':
        const outerRadius = (dimensions.diameter || 0) / 2;
        const innerRadius = outerRadius * 0.8; // Assume 80% inner diameter
        return Math.PI * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2));
      case 'multistrip':
        const stripArea = (dimensions.width || 0) * (dimensions.thickness || 0);
        return stripArea * (dimensions.numberOfStrips || 1);
      default:
        return 0;
    }
  }

  private static calculateContinuousCurrentRating(
    material: string,
    crossSectionalArea: number,
    installationMethod: string,
    ambientTemperature: number,
    temperatureRise: number,
    ventilation: string
  ): number {
    // Current density based on material and installation method
    const currentDensities = {
      copper: {
        enclosed: 2.5,
        open_air: 3.5,
        duct: 2.0,
        cable_tray: 3.0
      },
      aluminium: {
        enclosed: 1.8,
        open_air: 2.5,
        duct: 1.5,
        cable_tray: 2.2
      },
      silver_plated: {
        enclosed: 3.0,
        open_air: 4.0,
        duct: 2.5,
        cable_tray: 3.5
      }
    };

    const densityTable = currentDensities[material as keyof typeof currentDensities];
    if (!densityTable) throw new Error('Invalid material specified');

    const baseDensity = densityTable[installationMethod as keyof typeof densityTable] || 2.0;
    
    // Apply temperature correction
    const tempCorrection = (85 - ambientTemperature) / (85 - 40); // Assume 85°C max operating temp
    
    // Apply ventilation factor
    const ventilationFactor = {
      natural: 1.0,
      forced: 1.2,
      none: 0.8
    }[ventilation] || 1.0;

    return crossSectionalArea * baseDensity * tempCorrection * ventilationFactor;
  }

  private static calculateShortTimeCurrentRating(
    material: string,
    crossSectionalArea: number,
    ambientTemperature: number
  ): number {
    // Short-time current density (1 second rating)
    const shortTimeFactors = {
      copper: 143, // A/mm² for 1 second
      aluminium: 94,
      silver_plated: 160
    };

    const factor = shortTimeFactors[material as keyof typeof shortTimeFactors] || 143;
    return (crossSectionalArea * factor) / 1000; // Convert to kA
  }

  private static calculateThermalCharacteristics(
    current: number,
    crossSectionalArea: number,
    material: string,
    installationMethod: string
  ) {
    // Material resistivity at 20°C (μΩ·m)
    const resistivity = {
      copper: 17.2,
      aluminium: 28.2,
      silver_plated: 15.9
    }[material] || 17.2;

    // Calculate resistance per meter (mΩ/m)
    const resistance = (resistivity / crossSectionalArea);
    
    // Power loss per meter (W/m) - corrected formula
    const powerloss = Math.pow(current, 2) * resistance / 1000000; // I²R losses in W/m
    
    // Thermal resistance depends on installation method (K·m/W) - corrected values
    const thermalResistance = {
      enclosed: 1.0,
      open_air: 0.5,
      duct: 0.8,
      cable_tray: 0.6
    }[installationMethod] || 0.8;

    // Temperature rise (K)
    const temperatureRise = powerloss * thermalResistance;
    
    // Steady state temperature (assuming 40°C ambient)
    const steadyStateTemperature = 40 + temperatureRise;

    return {
      steadyStateTemperature: Math.round(steadyStateTemperature * 10) / 10,
      temperatureRise: Math.round(temperatureRise * 10) / 10,
      thermalResistance: Math.round(thermalResistance * 100) / 100,
      powerloss: Math.round(powerloss * 100) / 100
    };
  }

  private static calculateMechanicalStresses(
    current: number,
    spacing: number,
    busbarType: string,
    dimensions: any
  ) {
    // Electromagnetic force between parallel conductors (N/m)
    // F = (2 × 10^-7 × I^2) / d
    const electromagneticForce = (2e-7 * Math.pow(current, 2)) / (spacing / 1000);
    
    // Simplified moment of inertia calculation
    let momentOfInertia = 0;
    if (busbarType === 'rectangular') {
      const width = dimensions.width || 0;
      const thickness = dimensions.thickness || 0;
      momentOfInertia = (width * Math.pow(thickness, 3)) / 12; // mm⁴
    } else if (busbarType === 'circular') {
      const diameter = dimensions.diameter || 0;
      momentOfInertia = Math.PI * Math.pow(diameter, 4) / 64; // mm⁴
    }
    
    // Convert to m⁴ for calculations
    momentOfInertia = momentOfInertia / 1e12;
    
    // Approximate natural frequency (Hz) - simplified beam calculation
    const elasticModulus = 200e9; // Pa for copper/aluminium
    const density = 8960; // kg/m³ for copper
    const length = spacing / 1000; // Convert to meters
    
    let mechanicalResonance = 0;
    if (momentOfInertia > 0 && length > 0) {
      mechanicalResonance = (1/(2*Math.PI)) * Math.sqrt((elasticModulus * momentOfInertia) / (density * Math.pow(length, 4)));
    }
    
    // Support spacing based on electromagnetic force and allowable deflection
    // Maximum deflection = L⁴ × F / (384 × E × I) for distributed load
    const maxDeflection = 0.005; // 5mm maximum deflection
    let supportSpacing = 1.0; // Default 1m
    
    if (momentOfInertia > 0 && electromagneticForce > 0) {
      supportSpacing = Math.pow((384 * elasticModulus * momentOfInertia * maxDeflection) / electromagneticForce, 0.25);
      supportSpacing = Math.min(Math.max(supportSpacing, 0.5), 3.0); // Limit between 0.5m and 3m
    }

    return {
      electromagneticForce: Math.round(electromagneticForce * 100) / 100,
      mechanicalResonance: Math.round(mechanicalResonance * 10) / 10,
      supportSpacing: Math.round(supportSpacing * 100) / 100
    };
  }

  private static calculateVoltageDrop(
    material: string,
    crossSectionalArea: number,
    spacing: number,
    busbarType: string
  ) {
    // Resistive component (mΩ/m)
    const resistivity = {
      copper: 17.2,
      aluminium: 28.2,
      silver_plated: 15.9
    }[material] || 17.2;

    const resistiveComponent = resistivity / crossSectionalArea;
    
    // Reactive component depends on geometry
    let reactiveComponent = 0;
    if (busbarType === 'rectangular') {
      // Simplified inductance calculation for rectangular busbars
      reactiveComponent = 0.2 + 0.1 * Math.log(spacing / Math.sqrt(crossSectionalArea));
    } else {
      // For circular busbars
      reactiveComponent = 0.1 + 0.05 * Math.log(spacing / Math.sqrt(crossSectionalArea));
    }
    
    const totalVoltageDrop = Math.sqrt(Math.pow(resistiveComponent, 2) + Math.pow(reactiveComponent, 2));

    return {
      resistiveComponent: Math.round(resistiveComponent * 1000) / 1000,
      reactiveComponent: Math.round(reactiveComponent * 1000) / 1000,
      totalVoltageDrop: Math.round(totalVoltageDrop * 1000) / 1000
    };
  }

  private static calculateShortCircuitEffects(
    shortTimeCurrentKA: number,
    material: string,
    crossSectionalArea: number
  ) {
    // Maximum temperature during short circuit
    const heatCapacity = {
      copper: 385, // J/kg·K
      aluminium: 900,
      silver_plated: 385
    }[material] || 385;

    const density = {
      copper: 8960, // kg/m³
      aluminium: 2700,
      silver_plated: 10490
    }[material] || 8960;

    // Energy per unit volume during 1s short circuit
    const energy = Math.pow(shortTimeCurrentKA * 1000, 2) * 1; // J/m³ for 1 second
    const maxTemperature = 40 + (energy / (density * heatCapacity)); // °C
    
    // Thermal stress
    const thermalStress = maxTemperature > 200 ? 'High thermal stress - check conductor integrity' :
                         maxTemperature > 150 ? 'Moderate thermal stress - acceptable for short duration' :
                         'Low thermal stress - within acceptable limits';
    
    // Expansion forces (simplified)
    const expansionCoeff = {
      copper: 16.5e-6,
      aluminium: 23e-6,
      silver_plated: 18.9e-6
    }[material] || 16.5e-6;

    const expansionForces = expansionCoeff * (maxTemperature - 40) * 200e9 * crossSectionalArea; // N

    return {
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      thermalStress,
      expansionForces: Math.round(expansionForces)
    };
  }

  private static calculateInsulationRequirements(
    current: number,
    spacing: number,
    installationMethod: string
  ) {
    // Basic insulation requirements based on current and voltage level
    let clearanceDistance = Math.max(spacing * 0.1, 10); // Minimum 10mm
    let creepageDistance = clearanceDistance * 1.5;
    
    if (installationMethod === 'open_air') {
      clearanceDistance *= 1.2;
      creepageDistance *= 1.3;
    }
    
    const insulationLevel = current > 1000 ? 'High voltage insulation required' :
                           current > 400 ? 'Medium voltage insulation adequate' :
                           'Standard low voltage insulation';

    return {
      clearanceDistance: Math.round(clearanceDistance * 10) / 10,
      creepageDistance: Math.round(creepageDistance * 10) / 10,
      insulationLevel
    };
  }

  private static calculateEconomics(
    material: string,
    crossSectionalArea: number,
    length: number,
    current: number
  ) {
    // Material costs per kg
    const materialCosts = {
      copper: 7, // £/kg
      aluminium: 2,
      silver_plated: 15
    };

    const density = {
      copper: 8.96, // g/cm³
      aluminium: 2.70,
      silver_plated: 10.49
    }[material] || 8.96;

    const costPerKg = materialCosts[material as keyof typeof materialCosts] || 7;
    
    // Material cost per meter
    const weight = (crossSectionalArea / 1000000) * density * 1000; // kg/m
    const materialCost = weight * costPerKg;
    
    // Installation cost (estimated)
    const installationCost = materialCost * 0.5 + 20; // 50% of material cost plus fixed cost
    
    // Annual losses cost (assuming 8760 hours/year, £0.15/kWh)
    // Use material-specific resistivity
    const resistivity = {
      copper: 17.2,
      aluminium: 28.2,
      silver_plated: 15.9
    }[material] || 17.2;
    
    const resistance = resistivity / crossSectionalArea; // μΩ/m
    const annualLosses = Math.pow(current, 2) * resistance * 8760 * 0.15 / 1000000000; // £/year/m

    return {
      materialCost: Math.round(materialCost * 100) / 100,
      installationCost: Math.round(installationCost * 100) / 100,
      lossesCost: Math.round(annualLosses * 100) / 100
    };
  }

  private static generateRecommendations(
    inputs: BusbarCurrentInputs,
    currentRating: number,
    thermalCalc: any
  ): string[] {
    const recommendations = [
      'Ensure busbar current rating exceeds maximum demand current',
      'Verify thermal calculations under worst-case conditions',
      'Install appropriate support systems based on electromagnetic forces',
      'Ensure adequate phase-to-phase and phase-to-earth clearances'
    ];

    if (thermalCalc.steadyStateTemperature > 70) {
      recommendations.push('High operating temperature - consider enhanced cooling or larger conductor');
    }

    if (inputs.installationMethod === 'enclosed') {
      recommendations.push('Enclosed installation - ensure adequate ventilation for heat dissipation');
    }

    if (inputs.ventilation === 'none') {
      recommendations.push('No ventilation - consider forced cooling for high current applications');
    }

    if (inputs.material === 'aluminium') {
      recommendations.push('Aluminium busbars - use appropriate connection techniques to prevent corrosion');
    }

    return recommendations;
  }
}
