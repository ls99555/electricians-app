/**
 * Protection & Safety Reference Data
 * Comprehensive UK electrical protection and safety reference information
 * Based on BS 7671:2018+A2:2022 and related British Standards
 * 
 * CRITICAL: This file contains reference data only
 * Always reference specific BS 7671 regulation sections
 * Never copy official regulation text - always paraphrase
 * All data must comply with current 18th Edition BS 7671
 */

// BS 7671 Chapter 43 - Overcurrent Protection
export const OVERCURRENT_PROTECTION_DEVICES = {
  description: 'Overcurrent protection device specifications and characteristics',
  standards: ['BS 7671 Chapter 43', 'BS EN 60898', 'BS EN 61009', 'BS 88'],
  
  // Miniature Circuit Breakers (MCBs) - BS EN 60898
  mcb: {
    description: 'Miniature Circuit Breakers for final circuit protection',
    standard: 'BS EN 60898',
    
    characteristics: {
      'B': {
        description: 'General purpose, lighting circuits, domestic installations',
        magneticTrip: '3-5 × In',
        applicationNote: 'Low inrush current applications',
        typicalUse: ['Lighting circuits', 'Domestic socket outlets', 'General purpose circuits']
      },
      'C': {
        description: 'Commercial and industrial installations with moderate inrush',
        magneticTrip: '5-10 × In',
        applicationNote: 'Standard commercial applications',
        typicalUse: ['Motor circuits', 'Transformer supplies', 'Commercial installations']
      },
      'D': {
        description: 'High inrush current applications',
        magneticTrip: '10-20 × In',
        applicationNote: 'High inrush current motors and transformers',
        typicalUse: ['Large motors', 'Welding equipment', 'High inrush transformers']
      }
    },
    
    standardRatings: [6, 10, 16, 20, 25, 32, 40, 50, 63], // Amperes
    breakingCapacity: {
      '6kA': 'Standard domestic applications',
      '10kA': 'Commercial applications',
      '16kA': 'Industrial applications'
    }
  },
  
  // Residual Current Circuit Breakers with Overcurrent (RCBOs)
  rcbo: {
    description: 'Combined RCD and MCB protection',
    standard: 'BS EN 61009',
    
    types: {
      'AC': {
        description: 'Standard AC residual current protection',
        detects: 'AC sinusoidal residual currents',
        applicationNote: 'General purpose applications'
      },
      'A': {
        description: 'Type A with pulsating DC detection',
        detects: 'AC and pulsating DC residual currents',
        applicationNote: 'Equipment with electronic components'
      },
      'F': {
        description: 'Enhanced protection for modern electronics',
        detects: 'AC, pulsating DC, and composite waveforms',
        applicationNote: 'IT equipment, variable speed drives'
      },
      'B': {
        description: 'All current types including smooth DC',
        detects: 'All residual current types',
        applicationNote: 'Medical locations, critical applications'
      }
    },
    
    sensitivityRatings: [10, 30, 100, 300], // mA
    standardCurrentRatings: [6, 10, 16, 20, 25, 32, 40, 50, 63] // Amperes
  },
  
  // Fuses - BS 88
  fuses: {
    description: 'High Breaking Capacity (HBC) fuses',
    standard: 'BS 88',
    
    types: {
      'gG': {
        description: 'General purpose fuse-links',
        characteristic: 'Full range protection',
        applicationNote: 'General circuits, cable protection',
        timeCurrentNote: 'Operates for overloads and short circuits'
      },
      'aM': {
        description: 'Motor protection fuse-links',
        characteristic: 'Short circuit protection only',
        applicationNote: 'Motor circuits with separate overload protection',
        timeCurrentNote: 'Designed to withstand motor starting currents'
      }
    },
    
    standardRatings: [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200], // Amperes
    breakingCapacity: {
      '50kA': 'High fault current applications',
      '80kA': 'Very high fault current applications',
      '120kA': 'Maximum breaking capacity'
    }
  }
};

// Residual Current Devices (RCDs) - BS 7671 Chapter 53
export const RESIDUAL_CURRENT_DEVICES = {
  description: 'Residual Current Device specifications and applications',
  standards: ['BS 7671 Chapter 53', 'BS EN 61008', 'BS IEC 62423'],
  
  types: {
    'AC': {
      description: 'Standard AC sensitive RCD',
      standard: 'BS EN 61008',
      detectionCapability: 'Sinusoidal AC residual currents only',
      phaseOut: 'Being phased out in favor of Type A',
      applicationNote: 'Legacy installations with resistive loads only'
    },
    'A': {
      description: 'Type A RCD with pulsating DC detection',
      standard: 'BS EN 61008',
      detectionCapability: 'AC and pulsating DC residual currents',
      currentRequirement: 'Minimum requirement for new installations',
      applicationNote: 'Standard for most modern installations'
    },
    'F': {
      description: 'Enhanced RCD for frequency-controlled equipment',
      standard: 'BS IEC 62423',
      detectionCapability: 'AC, pulsating DC, and mixed frequencies',
      applicationNote: 'Variable speed drives, IT equipment',
      frequencyRange: '5Hz to 1kHz'
    },
    'B': {
      description: 'All-current sensitive RCD',
      standard: 'BS IEC 62423',
      detectionCapability: 'All residual current types including smooth DC',
      applicationNote: 'Medical locations, EV charging, critical applications',
      dcDetection: 'Up to 6mA smooth DC'
    }
  },
  
  sensitivityLevels: {
    10: {
      application: 'Special protection (additional protection)',
      regulation: 'BS 7671 Regulation 415.1.1',
      use: 'Socket outlets ≤20A in domestic and similar premises'
    },
    30: {
      application: 'Personal protection (additional protection)',
      regulation: 'BS 7671 Regulation 415.1.1',
      use: 'General additional protection, socket outlets, mobile equipment'
    },
    100: {
      application: 'Fire protection',
      regulation: 'BS 7671 Regulation 422.3.9',
      use: 'Fire protection in locations with fire risk'
    },
    300: {
      application: 'Equipment protection',
      regulation: 'BS 7671 Regulation 531.3.3',
      use: 'Protection against fire, equipment protection'
    }
  },
  
  operatingTimes: {
    description: 'Maximum disconnection times for RCDs',
    standard: 'BS EN 61008 / BS EN 61009',
    times: {
      'I_n': { max: '300ms', typical: '20-30ms' },
      '2×I_n': { max: '150ms', typical: '10-20ms' },
      '5×I_n': { max: '40ms', typical: '5-10ms' }
    }
  }
};

// Maximum Earth Fault Loop Impedance Values - BS 7671 Chapter 41
export const MAX_ZS_VALUES = {
  description: 'Maximum earth fault loop impedance for automatic disconnection',
  standard: 'BS 7671 Chapter 41, Tables 41.2, 41.3, 41.4',
  note: 'Values for automatic disconnection of supply within required time',
  
  // Table 41.2 - MCBs to BS EN 60898
  mcb_bs_en_60898: {
    description: 'MCBs to BS EN 60898 (230V/400V systems)',
    voltage_230v: {
      'B6': 7.67, 'B10': 4.60, 'B16': 2.87, 'B20': 2.30, 'B25': 1.84, 'B32': 1.44,
      'B40': 1.15, 'B50': 0.92, 'B63': 0.73,
      'C6': 3.83, 'C10': 2.30, 'C16': 1.44, 'C20': 1.15, 'C25': 0.92, 'C32': 0.72,
      'C40': 0.57, 'C50': 0.46, 'C63': 0.36,
      'D6': 1.92, 'D10': 1.15, 'D16': 0.72, 'D20': 0.57, 'D25': 0.46, 'D32': 0.36,
      'D40': 0.29, 'D50': 0.23, 'D63': 0.18
    },
    voltage_400v: {
      'B6': 13.33, 'B10': 8.0, 'B16': 5.0, 'B20': 4.0, 'B25': 3.2, 'B32': 2.5,
      'B40': 2.0, 'B50': 1.6, 'B63': 1.27,
      'C6': 6.67, 'C10': 4.0, 'C16': 2.5, 'C20': 2.0, 'C25': 1.6, 'C32': 1.25,
      'C40': 1.0, 'C50': 0.8, 'C63': 0.63,
      'D6': 3.33, 'D10': 2.0, 'D16': 1.25, 'D20': 1.0, 'D25': 0.8, 'D32': 0.63,
      'D40': 0.5, 'D50': 0.4, 'D63': 0.32
    }
  },
  
  // Table 41.3 - Fuses to BS 88
  fuses_bs_88: {
    description: 'Fuses to BS 88 (gG type)',
    voltage_230v: {
      '2': 23.0, '4': 11.5, '6': 7.67, '10': 4.6, '16': 2.87, '20': 2.3,
      '25': 1.84, '32': 1.44, '40': 1.15, '50': 0.92, '63': 0.73, '80': 0.575,
      '100': 0.46, '125': 0.368, '160': 0.287, '200': 0.23
    },
    voltage_400v: {
      '2': 40.0, '4': 20.0, '6': 13.33, '10': 8.0, '16': 5.0, '20': 4.0,
      '25': 3.2, '32': 2.5, '40': 2.0, '50': 1.6, '63': 1.27, '80': 1.0,
      '100': 0.8, '125': 0.64, '160': 0.5, '200': 0.4
    }
  },
  
  // Table 41.4 - RCDs (30mA and 100mA)
  rcd_protection: {
    description: 'RCD protection (any Zs value acceptable if RCD operates correctly)',
    note: 'Additional protection by RCD with I∆n ≤ 30mA',
    max_zs_with_rcd: {
      '30mA': 1667, // Ω (230V ÷ 30mA × 0.25 for safety factor)
      '100mA': 500   // Ω (230V ÷ 100mA × 0.25 for safety factor)
    }
  }
};

// Disconnection Times - BS 7671 Chapter 41
export const DISCONNECTION_TIMES = {
  description: 'Maximum disconnection times for automatic disconnection of supply',
  standard: 'BS 7671 Chapter 41',
  
  // Table 41.1 - Final circuits
  final_circuits: {
    description: 'Final circuits not exceeding 32A',
    regulation: 'BS 7671 Regulation 411.3.2.2',
    
    '230V_system': {
      'TN': { max_time: '0.4s', note: 'TN systems (TN-S, TN-C-S)' },
      'TT': { max_time: '0.2s', note: 'TT systems with RCD protection' }
    },
    '400V_system': {
      'TN': { max_time: '0.4s', note: 'TN systems between lines' },
      'TT': { max_time: '0.4s', note: 'TT systems between lines' }
    }
  },
  
  // Distribution circuits
  distribution_circuits: {
    description: 'Distribution circuits exceeding 32A',
    regulation: 'BS 7671 Regulation 411.3.2.3',
    
    '230V_system': {
      'TN': { max_time: '5s', note: 'TN systems' },
      'TT': { max_time: '1s', note: 'TT systems' }
    },
    '400V_system': {
      'TN': { max_time: '5s', note: 'TN systems' },
      'TT': { max_time: '5s', note: 'TT systems' }
    }
  },
  
  // Special locations
  special_locations: {
    description: 'Reduced disconnection times for special locations',
    
    bathrooms: {
      regulation: 'BS 7671 Section 701',
      time: '0.4s',
      note: 'All circuits in zones 0, 1, and 2'
    },
    swimming_pools: {
      regulation: 'BS 7671 Section 702',
      time: '0.4s',
      note: 'All circuits in zones 0, 1, and 2'
    },
    construction_sites: {
      regulation: 'BS 7671 Section 704',
      time: '0.4s',
      note: 'Socket outlet circuits'
    },
    agricultural: {
      regulation: 'BS 7671 Section 705',
      time: '0.2s',
      note: 'Socket outlet circuits in livestock locations'
    }
  }
};

// Touch Voltage Limits - BS 7671 Chapter 41
export const TOUCH_VOLTAGE_LIMITS = {
  description: 'Maximum touch voltages for safety',
  standard: 'BS 7671 Chapter 41',
  regulation: 'BS 7671 Regulation 411.3.2.5',
  
  limits: {
    description: 'Touch voltage limits under fault conditions',
    dry_conditions: {
      voltage: '50V',
      note: 'Normal dry conditions',
      application: 'General locations'
    },
    wet_conditions: {
      voltage: '25V',
      note: 'Locations where body resistance is reduced',
      application: 'Bathrooms, swimming pools, agricultural locations'
    },
    immersion_conditions: {
      voltage: '12V',
      note: 'Locations where persons may be immersed',
      application: 'Swimming pool zones 0 and 1'
    }
  },
  
  body_resistance: {
    description: 'Typical human body resistance values for calculation',
    note: 'For design purposes - actual values vary significantly',
    dry_skin: { min: '1000Ω', typical: '2000Ω', max: '3000Ω' },
    wet_skin: { min: '500Ω', typical: '1000Ω', max: '1500Ω' },
    immersed: { min: '200Ω', typical: '500Ω', max: '700Ω' }
  }
};

// Helper functions for protection and safety calculations
export class ProtectionSafetyHelper {
  /**
   * Get maximum Zs for automatic disconnection
   * BS 7671 Chapter 41 compliance check
   */
  static getMaxZs(
    protectionType: 'mcb' | 'fuse' | 'rcd',
    rating: string,
    characteristic?: string,
    voltage: '230' | '400' = '230'
  ): number | null {
    try {
      if (protectionType === 'mcb' && characteristic) {
        const voltageKey = voltage === '230' ? 'voltage_230v' : 'voltage_400v';
        const deviceKey = `${characteristic}${rating}`;
        return (MAX_ZS_VALUES.mcb_bs_en_60898 as any)[voltageKey][deviceKey] || null;
      }
      
      if (protectionType === 'fuse') {
        const voltageKey = voltage === '230' ? 'voltage_230v' : 'voltage_400v';
        return (MAX_ZS_VALUES.fuses_bs_88 as any)[voltageKey][rating] || null;
      }
      
      if (protectionType === 'rcd') {
        const currentRating = parseInt(rating);
        if (currentRating <= 30) {
          return MAX_ZS_VALUES.rcd_protection.max_zs_with_rcd['30mA'];
        } else {
          return MAX_ZS_VALUES.rcd_protection.max_zs_with_rcd['100mA'];
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  /**
   * Check if disconnection time requirements are met
   * BS 7671 Regulation 411.3.2 compliance
   */
  static checkDisconnectionTime(
    systemType: 'TN' | 'TT',
    circuitType: 'final' | 'distribution',
    voltage: '230' | '400' = '230',
    specialLocation?: string
  ): { maxTime: string; regulation: string; notes: string } {
    // Check special locations first
    if (specialLocation) {
      const special = (DISCONNECTION_TIMES.special_locations as any)[specialLocation];
      if (special) {
        return {
          maxTime: special.time,
          regulation: special.regulation,
          notes: special.note
        };
      }
    }
    
    // Standard disconnection times
    const voltageKey = voltage === '230' ? '230V_system' : '400V_system';
    const times = DISCONNECTION_TIMES[`${circuitType}_circuits` as keyof typeof DISCONNECTION_TIMES] as any;
    
    const requirement = times[voltageKey][systemType];
    return {
      maxTime: requirement.max_time,
      regulation: times.regulation,
      notes: requirement.note
    };
  }
  
  /**
   * Get touch voltage limit for location
   * BS 7671 Regulation 411.3.2.5 compliance
   */
  static getTouchVoltageLimit(location: 'dry' | 'wet' | 'immersion'): {
    voltage: string;
    note: string;
    application: string;
  } {
    const conditionKey = `${location}_conditions`;
    const limits = TOUCH_VOLTAGE_LIMITS.limits as any;
    return limits[conditionKey];
  }
  
  /**
   * Calculate maximum earth fault current for protection device
   * I = U / Zs (simplified)
   */
  static calculateMaxFaultCurrent(voltage: number, zs: number): number {
    return voltage / zs;
  }
  
  /**
   * Validate protection device selection
   * Comprehensive BS 7671 compliance check
   */
  static validateProtectionDevice(params: {
    deviceType: 'mcb' | 'fuse' | 'rcd' | 'rcbo';
    rating: number;
    characteristic?: string;
    rcdSensitivity?: number;
    rcdType?: string;
    circuitCurrent: number;
    faultCurrent: number;
    zs: number;
    voltage: number;
    systemType: 'TN' | 'TT';
  }): {
    valid: boolean;
    issues: string[];
    recommendations: string[];
    compliance: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const compliance: string[] = [];
    
    // Basic rating check
    if (params.rating < params.circuitCurrent * 1.45) {
      issues.push('Device rating may be insufficient for circuit load (consider 1.45× factor for MCBs)');
    }
    
    // Fault current capability
    if (params.faultCurrent > 10000) { // High fault current threshold
      recommendations.push('Check device breaking capacity against prospective fault current');
    }
    
    if (params.faultCurrent > params.rating * 1000) { // Very high fault current
      issues.push('Fault current may exceed device breaking capacity');
      recommendations.push('Consider higher breaking capacity device or fault limiting measures');
    }
    
    // Zs compliance
    if (params.deviceType === 'mcb' && params.characteristic) {
      const maxZs = this.getMaxZs('mcb', params.rating.toString(), params.characteristic, 
        params.voltage > 300 ? '400' : '230');
      if (maxZs && params.zs > maxZs) {
        issues.push(`Zs (${params.zs.toFixed(2)}Ω) exceeds maximum permitted (${maxZs}Ω)`);
        compliance.push(`BS 7671 Table 41.2 - Maximum Zs exceeded`);
      } else if (maxZs) {
        compliance.push(`BS 7671 Table 41.2 - Zs compliant (${params.zs.toFixed(2)}Ω ≤ ${maxZs}Ω)`);
      }
    }
    
    // RCD recommendations
    if (params.deviceType === 'rcbo' || params.rcdSensitivity) {
      if (params.rcdSensitivity === 30) {
        compliance.push('BS 7671 Regulation 415.1.1 - 30mA RCD provides additional protection');
      }
      if (!params.rcdType || params.rcdType === 'AC') {
        recommendations.push('Consider Type A or F RCD for modern electronic loads');
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      recommendations,
      compliance
    };
  }
}
