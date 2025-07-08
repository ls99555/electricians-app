/**
 * Motor Load and Control Calculations
 * Motor starting current, full load current, protection, and VFD calculations
 * Based on BS 7671 and IEC motor standards
 */

import type { 
  MotorLoadResult,
  MotorStartingResult,
  MotorProtectionResult,
  VFDSizingResult,
  MotorEfficiencyResult
} from './types';

/**
 * Motor Load Calculator
 * Calculates motor full load current, starting current, and cable requirements
 * Based on BS 7671 Section 552 - Motors and IEC 60034
 */
export class MotorLoadCalculator {
  /**
   * Calculate motor load and electrical requirements
   */
  static calculate(inputs: {
    motorPower: number; // Motor power in kW
    voltage: number; // Supply voltage (V)
    phases: 1 | 3; // Number of phases
    efficiency: number; // Motor efficiency (0-1)
    powerFactor: number; // Power factor (0-1)
    startingMethod: 'direct' | 'star_delta' | 'soft_start' | 'vfd';
    loadType: 'constant' | 'variable' | 'high_inertia';
    ambientTemp: number; // Ambient temperature (°C)
  }): MotorLoadResult {
    const { 
      motorPower, 
      voltage, 
      phases, 
      efficiency, 
      powerFactor, 
      startingMethod,
      loadType,
      ambientTemp 
    } = inputs;

    try {
      // Validate inputs
      this.validateInputs(inputs);

      // Calculate full load current (IEC 60034-1)
      const apparentPower = (motorPower * 1000) / (efficiency * powerFactor); // VA
      const fullLoadCurrent = phases === 3 
        ? apparentPower / (Math.sqrt(3) * voltage)
        : apparentPower / voltage;

      // Calculate starting current based on method
      const startingCurrent = this.calculateStartingCurrent(
        fullLoadCurrent, 
        startingMethod, 
        loadType
      );

      // Calculate cable sizing (BS 7671 Table 4D5A)
      const cableRating = this.calculateCableRating(fullLoadCurrent, ambientTemp);
      
      // Calculate protection requirements
      const protectionRating = this.calculateProtectionRating(
        fullLoadCurrent, 
        startingMethod,
        startingCurrent
      );

      // Calculate starting time and energy
      const startingTime = this.estimateStartingTime(startingMethod, motorPower, loadType);
      const startingEnergy = this.calculateStartingEnergy(startingCurrent, voltage, startingTime, phases);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        motorPower, 
        startingMethod, 
        fullLoadCurrent,
        ambientTemp
      );

      return {
        motorPower,
        fullLoadCurrent: Math.round(fullLoadCurrent * 100) / 100,
        startingCurrent: Math.round(startingCurrent * 100) / 100,
        apparentPower: Math.round(apparentPower),
        activePower: Math.round(motorPower * 1000),
        reactivePower: Math.round(apparentPower * Math.sin(Math.acos(powerFactor))),
        cableRating,
        protectionRating,
        startingTime,
        startingEnergy: Math.round(startingEnergy * 100) / 100,
        recommendations,
        regulation: 'BS 7671 Section 552 - Motors, IEC 60034 Motor standards'
      };
    } catch (error) {
      throw new Error(`Motor load calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: {
    motorPower: number;
    voltage: number;
    phases: number;
    efficiency: number;
    powerFactor: number;
    ambientTemp: number;
  }): void {
    const { motorPower, voltage, phases, efficiency, powerFactor, ambientTemp } = inputs;

    if (motorPower <= 0) throw new Error('Motor power must be positive');
    if (voltage <= 0) throw new Error('Voltage must be positive');
    if (phases !== 1 && phases !== 3) throw new Error('Phases must be 1 or 3');
    if (efficiency <= 0 || efficiency > 1) throw new Error('Efficiency must be between 0 and 1');
    if (powerFactor <= 0 || powerFactor > 1) throw new Error('Power factor must be between 0 and 1');
    if (ambientTemp < -40 || ambientTemp > 60) throw new Error('Ambient temperature out of range');
  }

  private static calculateStartingCurrent(
    fullLoadCurrent: number,
    startingMethod: string,
    loadType: string
  ): number {
    let startingMultiplier = 6; // Direct-on-line default

    switch (startingMethod) {
      case 'direct':
        startingMultiplier = loadType === 'high_inertia' ? 8 : 6;
        break;
      case 'star_delta':
        startingMultiplier = (loadType === 'high_inertia' ? 8 : 6) / 3;
        break;
      case 'soft_start':
        startingMultiplier = 3; // Typical for soft starters
        break;
      case 'vfd':
        startingMultiplier = 1.5; // VFD provides controlled starting
        break;
    }

    return fullLoadCurrent * startingMultiplier;
  }

  private static calculateCableRating(fullLoadCurrent: number, ambientTemp: number): number {
    // Apply temperature derating factor (BS 7671 Table 4B1)
    let tempFactor = 1.0;
    if (ambientTemp > 30) {
      tempFactor = 0.87; // 40°C derating
    }
    if (ambientTemp > 40) {
      tempFactor = 0.82; // 45°C derating
    }
    if (ambientTemp > 45) {
      tempFactor = 0.71; // 55°C derating
    }

    // Motor cables must be rated at 125% of full load current (BS 7671)
    const requiredRating = (fullLoadCurrent * 1.25) / tempFactor;

    // Round up to next standard cable size
    const standardSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
    return standardSizes.find(size => size >= requiredRating) || 300;
  }

  private static calculateProtectionRating(
    fullLoadCurrent: number, 
    startingMethod: string,
    startingCurrent: number
  ): number {
    // Motor protection must allow starting current but protect against overload
    // BS 7671 Section 552.1.3
    
    let protectionRating: number;

    if (startingMethod === 'vfd') {
      // VFD provides overload protection
      protectionRating = fullLoadCurrent * 1.15;
    } else {
      // Must be rated for starting current and provide overload protection
      protectionRating = Math.max(
        fullLoadCurrent * 1.25, // Overload protection
        startingCurrent * 0.8    // Allow starting current
      );
    }

    // Round up to next standard MCB rating
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    return standardRatings.find(rating => rating >= protectionRating) || 125;
  }

  private static estimateStartingTime(
    startingMethod: string, 
    motorPower: number, 
    loadType: string
  ): number {
    let baseTime = 2; // seconds for typical motor

    // Adjust for motor size
    if (motorPower > 50) baseTime *= 2;
    if (motorPower > 100) baseTime *= 1.5;

    // Adjust for load type
    if (loadType === 'high_inertia') baseTime *= 3;
    if (loadType === 'variable') baseTime *= 0.8;

    // Adjust for starting method
    switch (startingMethod) {
      case 'star_delta':
        baseTime *= 1.5; // Longer due to transfer
        break;
      case 'soft_start':
        baseTime = 10; // Controlled ramp
        break;
      case 'vfd':
        baseTime = 5; // Controlled acceleration
        break;
    }

    return Math.round(baseTime * 10) / 10;
  }

  private static calculateStartingEnergy(
    startingCurrent: number,
    voltage: number,
    startingTime: number,
    phases: number
  ): number {
    // Energy = V × I × t × phases × √3 (for 3-phase) / 1000 (kWh)
    const factor = phases === 3 ? Math.sqrt(3) : 1;
    return (voltage * startingCurrent * startingTime * factor) / (1000 * 3600);
  }

  private static generateRecommendations(
    motorPower: number,
    startingMethod: string,
    fullLoadCurrent: number,
    ambientTemp: number
  ): string[] {
    const recommendations: string[] = [];

    if (motorPower >= 5.5 && startingMethod === 'direct') {
      recommendations.push('Consider soft start or VFD for motors ≥5.5kW to reduce grid impact');
    }

    if (fullLoadCurrent > 32) {
      recommendations.push('Motor requires dedicated circuit and isolation switch');
    }

    if (ambientTemp > 40) {
      recommendations.push('High ambient temperature - ensure adequate ventilation');
    }

    if (startingMethod === 'vfd') {
      recommendations.push('VFD provides energy savings through speed control');
      recommendations.push('Consider harmonic filters for VFD installations');
    }

    recommendations.push('Install motor protection relay for motors >0.37kW');
    recommendations.push('Ensure proper earthing and RCD protection per BS 7671');
    recommendations.push('Regular maintenance and thermal monitoring recommended');

    return recommendations;
  }
}

/**
 * VFD Sizing Calculator
 * Calculate Variable Frequency Drive requirements
 */
export class VFDSizingCalculator {
  static calculate(inputs: {
    motorPower: number; // Motor power in kW
    motorVoltage: number; // Motor voltage
    motorCurrent: number; // Motor full load current
    operatingProfile: 'constant_torque' | 'variable_torque' | 'constant_power';
    overloadRequirement: number; // Percentage overload required
    ambientTemp: number; // VFD ambient temperature
    harmonicsMitigation: boolean; // Require harmonic filters
  }): VFDSizingResult {
    const {
      motorPower,
      motorVoltage,
      motorCurrent,
      operatingProfile,
      overloadRequirement,
      ambientTemp,
      harmonicsMitigation
    } = inputs;

    try {
      this.validateVFDInputs(inputs);

      // Calculate VFD power rating
      let vfdPowerRating = motorPower;
      
      // Apply derating factors
      if (operatingProfile === 'constant_torque') {
        vfdPowerRating *= 1.1; // 10% oversizing for constant torque
      }
      
      if (overloadRequirement > 110) {
        vfdPowerRating *= (overloadRequirement / 100);
      }

      // Temperature derating
      if (ambientTemp > 40) {
        vfdPowerRating *= 1.1;
      }

      // Calculate harmonic mitigation requirements
      const harmonicDistortion = harmonicsMitigation ? 5 : 35; // THD percentage
      
      // Efficiency estimate
      const efficiency = this.calculateVFDEfficiency(vfdPowerRating);
      
      // Calculate input power
      const inputPower = motorPower / efficiency;

      const recommendations = [
        'Install VFD in well-ventilated enclosure',
        'Use motor-rated cables between VFD and motor',
        'Install line and load reactors for optimal performance',
        'Consider harmonic analysis for multiple VFD installations'
      ];

      if (harmonicsMitigation) {
        recommendations.push('Harmonic filter reduces grid harmonic distortion');
      }

      return {
        recommendedVFDPower: Math.ceil(vfdPowerRating * 10) / 10,
        vfdCurrent: Math.round((vfdPowerRating * 1000) / (Math.sqrt(3) * motorVoltage) * 100) / 100,
        inputPower: Math.round(inputPower * 100) / 100,
        efficiency: Math.round(efficiency * 1000) / 10,
        harmonicDistortion,
        operatingProfile,
        recommendations,
        regulation: 'IEC 61800 Variable Speed Drives, BS 7671 Section 552'
      };
    } catch (error) {
      throw new Error(`VFD sizing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateVFDInputs(inputs: {
    motorPower: number;
    motorVoltage: number;
    motorCurrent: number;
    overloadRequirement: number;
    ambientTemp: number;
  }): void {
    const { motorPower, motorVoltage, motorCurrent, overloadRequirement, ambientTemp } = inputs;

    if (motorPower <= 0) throw new Error('Motor power must be positive');
    if (motorVoltage <= 0) throw new Error('Motor voltage must be positive');
    if (motorCurrent <= 0) throw new Error('Motor current must be positive');
    if (overloadRequirement < 100) throw new Error('Overload requirement must be at least 100%');
    if (ambientTemp < 0 || ambientTemp > 60) throw new Error('Ambient temperature out of range');
  }

  private static calculateVFDEfficiency(power: number): number {
    // VFD efficiency typically increases with size
    if (power < 1) return 0.85;
    if (power < 5) return 0.90;
    if (power < 20) return 0.94;
    if (power < 100) return 0.96;
    return 0.97;
  }
}

/**
 * Motor Efficiency Calculator
 * Calculate motor efficiency and energy consumption
 */
export class MotorEfficiencyCalculator {
  static calculate(inputs: {
    motorPower: number; // Rated power in kW
    loadFactor: number; // Operating load as fraction of rated (0-1)
    operatingHours: number; // Hours per year
    energyCost: number; // Cost per kWh
    motorClass: 'IE1' | 'IE2' | 'IE3' | 'IE4'; // Efficiency class
    powerFactor: number; // Operating power factor
  }): MotorEfficiencyResult {
    const { motorPower, loadFactor, operatingHours, energyCost, motorClass, powerFactor } = inputs;

    try {
      this.validateEfficiencyInputs(inputs);

      // Get efficiency based on motor class and load
      const efficiency = this.getMotorEfficiency(motorPower, loadFactor, motorClass);
      
      // Calculate power consumption
      const actualPower = motorPower * loadFactor;
      const inputPower = actualPower / efficiency;
      
      // Calculate annual energy consumption
      const annualEnergyConsumption = inputPower * operatingHours;
      const annualEnergyCost = annualEnergyConsumption * energyCost;
      
      // Calculate losses
      const losses = inputPower - actualPower;
      const lossPercentage = (losses / inputPower) * 100;

      // Calculate potential savings with higher efficiency motor
      const nextClassEfficiency = this.getNextClassEfficiency(motorClass, motorPower, loadFactor);
      const potentialSavings = nextClassEfficiency ? 
        this.calculateSavings(actualPower, efficiency, nextClassEfficiency, operatingHours, energyCost) :
        null;

      const recommendations = [
        `Motor operating at ${Math.round(loadFactor * 100)}% load`,
        'Consider VFD for variable load applications',
        'Regular maintenance improves efficiency',
        'Monitor power factor - poor PF reduces efficiency'
      ];

      if (loadFactor < 0.5) {
        recommendations.push('Motor is oversized - consider smaller motor for better efficiency');
      }

      if (efficiency < 0.85) {
        recommendations.push('Consider upgrading to higher efficiency motor class');
      }

      return {
        efficiency: Math.round(efficiency * 1000) / 10,
        inputPower: Math.round(inputPower * 100) / 100,
        actualPower: Math.round(actualPower * 100) / 100,
        losses: Math.round(losses * 100) / 100,
        lossPercentage: Math.round(lossPercentage * 10) / 10,
        annualEnergyConsumption: Math.round(annualEnergyConsumption),
        annualEnergyCost: Math.round(annualEnergyCost),
        potentialSavings,
        recommendations,
        regulation: 'IEC 60034-30 Motor efficiency classes'
      };
    } catch (error) {
      throw new Error(`Motor efficiency calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateEfficiencyInputs(inputs: {
    motorPower: number;
    loadFactor: number;
    operatingHours: number;
    energyCost: number;
    powerFactor: number;
  }): void {
    const { motorPower, loadFactor, operatingHours, energyCost, powerFactor } = inputs;

    if (motorPower <= 0) throw new Error('Motor power must be positive');
    if (loadFactor <= 0 || loadFactor > 1) throw new Error('Load factor must be between 0 and 1');
    if (operatingHours < 0 || operatingHours > 8760) throw new Error('Operating hours must be between 0 and 8760');
    if (energyCost < 0) throw new Error('Energy cost cannot be negative');
    if (powerFactor <= 0 || powerFactor > 1) throw new Error('Power factor must be between 0 and 1');
  }

  private static getMotorEfficiency(power: number, loadFactor: number, motorClass: string): number {
    // Efficiency values based on IEC 60034-30
    const efficiencyTable: { [key: string]: { [key: number]: number } } = {
      'IE1': {
        0.75: 0.775, 1.1: 0.825, 1.5: 0.845, 2.2: 0.865, 3: 0.875, 4: 0.885, 5.5: 0.895,
        7.5: 0.905, 11: 0.915, 15: 0.920, 18.5: 0.925, 22: 0.930, 30: 0.935, 37: 0.940
      },
      'IE2': {
        0.75: 0.825, 1.1: 0.865, 1.5: 0.875, 2.2: 0.895, 3: 0.905, 4: 0.915, 5.5: 0.925,
        7.5: 0.935, 11: 0.945, 15: 0.950, 18.5: 0.955, 22: 0.960, 30: 0.965, 37: 0.970
      },
      'IE3': {
        0.75: 0.865, 1.1: 0.895, 1.5: 0.905, 2.2: 0.925, 3: 0.935, 4: 0.945, 5.5: 0.955,
        7.5: 0.965, 11: 0.975, 15: 0.980, 18.5: 0.985, 22: 0.985, 30: 0.990, 37: 0.990
      },
      'IE4': {
        0.75: 0.895, 1.1: 0.915, 1.5: 0.925, 2.2: 0.945, 3: 0.955, 4: 0.965, 5.5: 0.975,
        7.5: 0.985, 11: 0.990, 15: 0.995, 18.5: 0.995, 22: 0.995, 30: 0.995, 37: 0.995
      }
    };

    // Find closest power rating
    const powers = Object.keys(efficiencyTable[motorClass]).map(Number).sort((a, b) => a - b);
    const closestPower = powers.reduce((prev, curr) => 
      Math.abs(curr - power) < Math.abs(prev - power) ? curr : prev
    );

    let baseEfficiency = efficiencyTable[motorClass][closestPower];

    // Adjust efficiency based on load factor
    if (loadFactor < 0.75) {
      baseEfficiency *= (0.85 + 0.15 * (loadFactor / 0.75));
    } else if (loadFactor > 1.0) {
      baseEfficiency *= 0.98; // Slight reduction for overload
    }

    return baseEfficiency;
  }

  private static getNextClassEfficiency(
    currentClass: string, 
    power: number, 
    loadFactor: number
  ): number | null {
    const classOrder = ['IE1', 'IE2', 'IE3', 'IE4'];
    const currentIndex = classOrder.indexOf(currentClass);
    
    if (currentIndex === -1 || currentIndex === classOrder.length - 1) {
      return null;
    }

    const nextClass = classOrder[currentIndex + 1];
    return this.getMotorEfficiency(power, loadFactor, nextClass);
  }

  private static calculateSavings(
    actualPower: number,
    currentEfficiency: number,
    newEfficiency: number,
    operatingHours: number,
    energyCost: number
  ): { annualSavings: number; paybackYears: number } {
    const currentInput = actualPower / currentEfficiency;
    const newInput = actualPower / newEfficiency;
    const energySavings = (currentInput - newInput) * operatingHours;
    const annualSavings = energySavings * energyCost;
    
    // Estimate additional cost for higher efficiency motor (rough estimate)
    const additionalCost = actualPower * 150; // £150 per kW additional cost
    const paybackYears = additionalCost / annualSavings;

    return {
      annualSavings: Math.round(annualSavings),
      paybackYears: Math.round(paybackYears * 10) / 10
    };
  }
}
