/**
 * Safety and Testing Calculations
 * Loop impedance, RCD selection, earth electrode, and fault current calculations
 * Based on BS 7671 safety requirements
 */

import type { 
  LoopImpedanceResult, 
  RCDSelectionResult, 
  EarthElectrodeResult, 
  FaultCurrentResult,
  EarthingSystem,
  CircuitType,
  ElectrodeType
} from './types';

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
    
    try {
      // Validate inputs
      this.validateInputs(inputs);
      
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
        regulation: 'BS 7671 Section 411 & Appendix 3 - Protection against electric shock'
      };
    } catch (error) {
      throw new Error(`Loop impedance calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { ze, r1, r2, voltage } = inputs;
    
    if (ze < 0) throw new Error('Ze cannot be negative');
    if (r1 < 0) throw new Error('R1 cannot be negative');
    if (r2 < 0) throw new Error('R2 cannot be negative');
    if (voltage <= 0) throw new Error('Voltage must be positive');
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
    // Simplified calculation based on BS 7671 time/current characteristics
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
    
    try {
      // Validate inputs
      this.validateInputs(inputs);
      
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
        regulation: 'BS 7671 Section 411.3.3 & Chapter 53 - Protection by RCD'
      };
    } catch (error) {
      throw new Error(`RCD selection calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { loadCurrent, earthLeakage } = inputs;
    
    if (loadCurrent <= 0) throw new Error('Load current must be positive');
    if (earthLeakage < 0) throw new Error('Earth leakage cannot be negative');
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
        applications.push('General additional protection per BS 7671');
    }

    return applications;
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
    electrodeType: ElectrodeType;
    installationType: EarthingSystem;
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

    try {
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
    } catch (error) {
      throw new Error(`Earth electrode calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static calculateTheoreticalResistance(
    electrodeType: ElectrodeType,
    soilResistivity: number,
    length: number,
    area: number
  ): number {
    switch (electrodeType) {
      case 'rod':
        // Approximate formula for driven rod (BS 7671)
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
    electrodeType: ElectrodeType,
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

    suggestions.push('Comply with BS 7671 Section 542 earthing requirements');

    return suggestions;
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
  }): FaultCurrentResult {
    const { sourceVoltage, sourceImpedance, cableData, loadImpedance = 0, systemType, faultType } = inputs;

    try {
      // Validate inputs
      this.validateInputs(inputs);

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
        'Regular testing of fault current levels recommended',
        'Comply with BS 7671 fault protection requirements'
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
    } catch (error) {
      throw new Error(`Fault current calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { sourceVoltage, sourceImpedance, cableData } = inputs;
    
    if (sourceVoltage <= 0) throw new Error('Source voltage must be positive');
    if (sourceImpedance < 0) throw new Error('Source impedance cannot be negative');
    if (cableData.length <= 0) throw new Error('Cable length must be positive');
    if (cableData.resistance < 0) throw new Error('Cable resistance cannot be negative');
    if (cableData.reactance < 0) throw new Error('Cable reactance cannot be negative');
  }
}
