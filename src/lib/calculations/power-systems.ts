/**
 * Power Systems Calculations
 * Three-phase systems, power factor correction, and power analysis
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 (18th Edition) - Requirements for Electrical Installations
 * - BS EN 50160 - Voltage characteristics of electricity supplied by public distribution networks
 * - BS EN 61000 - Electromagnetic compatibility standards
 * - IET Guidance Note 1 - Selection & Erection of Equipment
 * - IEEE 519 - Harmonic Control in Electrical Power Systems
 * 
 * UK Three-Phase System Standards:
 * - Standard three-phase voltage: 400V (BS EN 50160)
 * - Standard single-phase voltage: 230V (BS EN 50160)
 * - Frequency: 50Hz ±1% (BS EN 50160)
 * - Voltage tolerance: ±10% (BS EN 50160)
 * - Power factor requirements for commercial installations
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Power system calculations must be verified by qualified electrical engineers
 * - Consider harmonics and power quality in commercial installations
 * - Professional indemnity insurance recommended for all electrical work
 */

import type { ThreePhaseResult, PowerFactorResult } from './types';

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
    
    try {
      // Validate inputs
      this.validateInputs(inputs);
      
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
    } catch (error) {
      throw new Error(`Three-phase calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { powerFactor, connectionType } = inputs;
    
    if (powerFactor < 0 || powerFactor > 1) {
      throw new Error('Power factor must be between 0 and 1');
    }
    
    if (!['star', 'delta'].includes(connectionType)) {
      throw new Error('Connection type must be "star" or "delta"');
    }
  }

  /**
   * Calculate three-phase motor characteristics
   */
  static calculateMotorCharacteristics(inputs: {
    motorPower: number; // kW
    voltage: number; // Line voltage
    efficiency: number; // Motor efficiency (0.8-0.95)
    powerFactor: number; // Motor power factor
    startingMethod: 'direct' | 'star_delta' | 'soft_start';
  }) {
    const { motorPower, voltage, efficiency, powerFactor, startingMethod } = inputs;
    
    // Full load current calculation
    const inputPower = (motorPower * 1000) / efficiency; // Convert to W and account for efficiency
    const fullLoadCurrent = inputPower / (Math.sqrt(3) * voltage * powerFactor);
    
    // Starting current multipliers based on starting method
    const startingMultipliers = {
      direct: 6.5, // Direct on line starting
      star_delta: 2.2, // Star-delta starting
      soft_start: 3.0 // Soft start
    };
    
    const startingCurrent = fullLoadCurrent * startingMultipliers[startingMethod];
    
    // Cable sizing factor (125% of full load current per BS 7671)
    const cableSizingCurrent = fullLoadCurrent * 1.25;
    
    return {
      fullLoadCurrent,
      startingCurrent,
      cableSizingCurrent,
      inputPower,
      recommendations: [
        `Full load current: ${fullLoadCurrent.toFixed(1)}A`,
        `Starting current: ${startingCurrent.toFixed(1)}A`,
        `Cable sizing current: ${cableSizingCurrent.toFixed(1)}A`,
        'Motor protection required per BS 7671 Section 552',
        'Consider motor starter and overload protection'
      ]
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

    try {
      // Validate inputs
      this.validateInputs(inputs);

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
    } catch (error) {
      throw new Error(`Power factor calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { voltage, targetPowerFactor } = inputs;
    
    if (voltage <= 0) throw new Error('Voltage must be positive');
    if (targetPowerFactor && (targetPowerFactor < 0 || targetPowerFactor > 1)) {
      throw new Error('Target power factor must be between 0 and 1');
    }
  }

  /**
   * Calculate capacitor bank sizing for power factor correction
   */
  static calculateCapacitorBank(inputs: {
    systemVoltage: number; // Line voltage (V)
    requiredKVAr: number; // Reactive power to be corrected
    frequency: number; // System frequency (Hz) - typically 50Hz in UK
    connectionType: 'star' | 'delta';
  }) {
    const { systemVoltage, requiredKVAr, frequency, connectionType } = inputs;
    
    // Calculate capacitance required
    const omega = 2 * Math.PI * frequency;
    let voltage = systemVoltage;
    
    if (connectionType === 'star') {
      voltage = systemVoltage / Math.sqrt(3); // Phase voltage for star connection
    }
    
    // Capacitance per phase (microfarads)
    const capacitancePerPhase = (requiredKVAr * 1000) / (3 * omega * Math.pow(voltage, 2)) * 1000000;
    
    // Total capacitance for three-phase
    const totalCapacitance = connectionType === 'star' ? capacitancePerPhase : capacitancePerPhase / 3;
    
    return {
      capacitancePerPhase: Math.round(capacitancePerPhase),
      totalCapacitance: Math.round(totalCapacitance),
      connectionType,
      voltage,
      recommendations: [
        `Capacitance per phase: ${Math.round(capacitancePerPhase)}μF`,
        `Connection: ${connectionType.toUpperCase()}`,
        `Operating voltage: ${voltage.toFixed(0)}V`,
        'Use HV capacitors rated for continuous operation',
        'Include protection and switching equipment',
        'Consider harmonic filters if non-linear loads present',
        'Comply with BS EN 60831 for power capacitors'
      ]
    };
  }

  /**
   * Analyze power quality issues
   */
  static analyzePowerQuality(inputs: {
    powerFactor: number;
    voltageDistortion: number; // THD-V percentage
    currentDistortion: number; // THD-I percentage
    unbalance: number; // Voltage unbalance percentage
  }) {
    const { powerFactor, voltageDistortion, currentDistortion, unbalance } = inputs;
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Power factor assessment
    if (powerFactor < 0.85) {
      issues.push('Poor power factor - significant reactive power penalty');
      recommendations.push('Install power factor correction capacitors');
    } else if (powerFactor < 0.95) {
      issues.push('Low power factor - consider correction for efficiency');
      recommendations.push('Consider power factor correction for cost savings');
    }
    
    // Harmonic distortion assessment
    if (voltageDistortion > 8) {
      issues.push('High voltage harmonic distortion');
      recommendations.push('Install harmonic filters or active power filters');
    } else if (voltageDistortion > 5) {
      issues.push('Moderate voltage harmonic distortion');
      recommendations.push('Monitor harmonic levels and consider mitigation');
    }
    
    if (currentDistortion > 15) {
      issues.push('High current harmonic distortion');
      recommendations.push('Install line reactors or harmonic filters');
    } else if (currentDistortion > 8) {
      issues.push('Moderate current harmonic distortion');
      recommendations.push('Consider harmonic mitigation measures');
    }
    
    // Voltage unbalance assessment
    if (unbalance > 3) {
      issues.push('Excessive voltage unbalance');
      recommendations.push('Balance loads across phases');
      recommendations.push('Check for loose connections or phase faults');
    } else if (unbalance > 1) {
      issues.push('Moderate voltage unbalance');
      recommendations.push('Consider load balancing improvements');
    }
    
    // Overall assessment
    let overallRating = 'Good';
    if (issues.length > 3) {
      overallRating = 'Poor';
    } else if (issues.length > 1) {
      overallRating = 'Fair';
    }
    
    return {
      overallRating,
      issues,
      recommendations,
      complianceNotes: [
        'Monitor power quality per BS EN 50160',
        'Consider power quality standards for sensitive equipment',
        'Document power quality measurements for compliance'
      ]
    };
  }
}
