/**
 * Specialized Applications Calculations
 * Fire Alarm, CCTV, Data Center, and other specialized electrical systems
 * 
 * Based on:
 * - BS 5839-1:2017 - Fire detection and fire alarm systems for buildings
 * - BS 7671:2018+A2:2022 Section 560 - Safety services
 * - BS EN 54 series - Fire detection and fire alarm systems
 * - BS 8593:2017 - Code of practice for the design of closed circuit television systems
 * - BS EN 50174 - Information technology - Cabling installation
 * - IET Code of Practice for Data Centres
 * 
 * UK Requirements for Specialized Systems:
 * - Fire alarm systems must comply with BS 5839-1
 * - Emergency lighting per BS 5266-1
 * - Security systems per BS 8591
 * - Data center installations per BS EN 50174
 * - Safety services supply per BS 7671 Section 560
 * 
 * Fire Alarm Categories (BS 5839-1):
 * - Category M: Manual systems
 * - Category L1-L5: Automatic detection systems
 * - Category P1-P2: Property protection systems
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All specialized systems must be designed by competent persons
 * - Fire safety systems require approval from relevant authorities
 * - System commissioning and testing mandatory per relevant standards
 * - Professional indemnity insurance recommended for all electrical work
 */

import type {
  SwimmingPoolInputs,
  SwimmingPoolResult,
  CaravanMarinaInputs,
  CaravanMarinaResult,
  AgriculturalInputs,
  AgriculturalResult,
  TemporarySupplyInputs,
  TemporarySupplyResult,
  HazardousAreaInputs,
  HazardousAreaResult
} from './types';

/**
 * Fire Alarm System Calculator
 * Calculates power requirements and cable sizing for fire alarm systems
 * Based on BS 5839 Fire Detection and Alarm Systems
 */
export class FireAlarmCalculator {
  /**
   * Calculate fire alarm system power requirements
   */
  static calculate(inputs: {
    numberOfDevices: number; // Total number of devices
    deviceTypes: {
      detectors: number;      // Smoke/heat detectors
      callPoints: number;     // Manual call points  
      sounders: number;       // Alarm sounders
      beacons: number;        // Visual alarm beacons
      interfaces: number;     // Interface units
    };
    systemVoltage: number;    // System voltage (typically 24V)
    cableLength: number;      // Maximum cable run length (m)
    standbyTime: number;      // Standby battery time (hours)
    alarmTime: number;        // Alarm condition time (hours)
    diversityFactor: number;  // Simultaneous operation factor (0-1)
  }) {
    const { 
      numberOfDevices, 
      deviceTypes, 
      systemVoltage, 
      cableLength, 
      standbyTime, 
      alarmTime,
      diversityFactor 
    } = inputs;

    try {
      this.validateFireAlarmInputs(inputs);

      // Calculate power consumption for each device type (typical values)
      const devicePowers = {
        detectors: deviceTypes.detectors * 0.0005,    // 0.5mA per detector
        callPoints: deviceTypes.callPoints * 0.0003,  // 0.3mA per call point
        sounders: deviceTypes.sounders * 0.020,       // 20mA per sounder in alarm
        beacons: deviceTypes.beacons * 0.015,         // 15mA per beacon in alarm
        interfaces: deviceTypes.interfaces * 0.002    // 2mA per interface
      };

      // Calculate standby current (normal operation)
      const standbyCurrentAmps = (
        devicePowers.detectors + 
        devicePowers.callPoints + 
        devicePowers.interfaces
      );

      // Calculate alarm current (all devices operating)
      const alarmCurrentAmps = (
        standbyCurrentAmps + 
        (devicePowers.sounders + devicePowers.beacons) * diversityFactor
      );

      // Calculate battery capacity required (BS 5839-1)
      const standbyCapacityAh = (standbyCurrentAmps * standbyTime);
      const alarmCapacityAh = (alarmCurrentAmps * alarmTime);
      const totalBatteryCapacityAh = (standbyCapacityAh + alarmCapacityAh) * 1.25; // 25% safety factor

      // Calculate cable sizing based on voltage drop
      const maxVoltageDrop = systemVoltage * 0.05; // 5% max voltage drop
      const cableResistance = this.calculateCableResistance(
        alarmCurrentAmps, 
        cableLength, 
        maxVoltageDrop
      );

      // Calculate minimum cable CSA
      const minCableCSA = this.calculateMinimumCableCSA(cableResistance, cableLength);

      // Calculate power supply rating
      const powerSupplyRating = Math.ceil(alarmCurrentAmps * systemVoltage * 1.5); // 50% margin

      const recommendations = [
        'Install dedicated fire alarm circuit with RCD protection',
        'Use fire-resistant cables (FP200 or equivalent)',
        'Provide 72-hour standby battery capacity minimum',
        'Install surge protection devices on mains supply'
      ];

      if (numberOfDevices > 32) {
        recommendations.push('Consider addressable system for large installations');
      }

      if (cableLength > 500) {
        recommendations.push('Consider voltage drop compensation or higher voltage system');
      }

      return {
        numberOfDevices,
        standbyCurrentAmps: Math.round(standbyCurrentAmps * 10000) / 10000,
        alarmCurrentAmps: Math.round(alarmCurrentAmps * 10000) / 10000,
        batteryCapacityAh: Math.ceil(totalBatteryCapacityAh * 10) / 10,
        powerSupplyRating,
        minCableCSA,
        maxVoltageDrop: Math.round(maxVoltageDrop * 100) / 100,
        recommendations,
        regulation: 'BS 5839 Fire Detection and Alarm Systems, BS 7671 Section 560.5'
      };
    } catch (error) {
      throw new Error(`Fire alarm calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateFireAlarmInputs(inputs: {
    numberOfDevices: number;
    systemVoltage: number;
    cableLength: number;
    standbyTime: number;
    alarmTime: number;
    diversityFactor: number;
  }): void {
    const { numberOfDevices, systemVoltage, cableLength, standbyTime, alarmTime, diversityFactor } = inputs;

    if (numberOfDevices <= 0) throw new Error('Number of devices must be positive');
    if (systemVoltage <= 0) throw new Error('System voltage must be positive');
    if (cableLength <= 0) throw new Error('Cable length must be positive');
    if (standbyTime < 24) throw new Error('Standby time must be at least 24 hours');
    if (alarmTime < 0.5) throw new Error('Alarm time must be at least 0.5 hours');
    if (diversityFactor <= 0 || diversityFactor > 1) throw new Error('Diversity factor must be between 0 and 1');
  }

  private static calculateCableResistance(
    current: number,
    length: number,
    maxVoltageDrop: number
  ): number {
    // R = V / (2 × I × L) for loop resistance
    return maxVoltageDrop / (2 * current * length);
  }

  private static calculateMinimumCableCSA(resistance: number, length: number): number {
    // Using typical copper resistivity of 0.0175 Ω·mm²/m
    const copperResistivity = 0.0175;
    const requiredCSA = (copperResistivity * length * 2) / resistance; // Factor of 2 for loop

    // Standard cable sizes for fire alarm systems
    const standardSizes = [0.5, 0.75, 1.0, 1.5, 2.5];
    return standardSizes.find(size => size >= requiredCSA) || 2.5;
  }
}

/**
 * CCTV Power Requirements Calculator
 * Calculates power consumption and cable sizing for CCTV systems
 */
export class CCTVCalculator {
  static calculate(inputs: {
    cameras: {
      analog: number;        // Number of analog cameras
      ipCameras: number;     // Number of IP cameras
      ptzCameras: number;    // Number of PTZ cameras
      nvr: number;           // Number of NVR units
      monitors: number;      // Number of monitors
    };
    cameraTypes: {
      analogPower: number;   // Power per analog camera (W)
      ipPower: number;       // Power per IP camera (W)
      ptzPower: number;      // Power per PTZ camera (W)
      nvrPower: number;      // Power per NVR (W)
      monitorPower: number;  // Power per monitor (W)
    };
    operatingHours: number;  // Operating hours per day
    cableLength: number;     // Maximum cable run (m)
    voltage: number;         // System voltage (12V, 24V, 48V)
    redundancy: boolean;     // Require backup power
  }) {
    const { cameras, cameraTypes, operatingHours, cableLength, voltage, redundancy } = inputs;

    try {
      this.validateCCTVInputs(inputs);

      // Calculate total power consumption
      const totalPower = 
        (cameras.analog * cameraTypes.analogPower) +
        (cameras.ipCameras * cameraTypes.ipPower) +
        (cameras.ptzCameras * cameraTypes.ptzPower) +
        (cameras.nvr * cameraTypes.nvrPower) +
        (cameras.monitors * cameraTypes.monitorPower);

      // Add diversity factor for PTZ cameras (typically not all moving simultaneously)
      const ptzDiversityFactor = 0.7;
      const adjustedPower = totalPower - (cameras.ptzCameras * cameraTypes.ptzPower * (1 - ptzDiversityFactor));

      // Calculate current requirement
      const totalCurrent = adjustedPower / voltage;

      // Calculate cable sizing for voltage drop
      const maxVoltageDrop = voltage * 0.05; // 5% max voltage drop
      const cableResistance = maxVoltageDrop / (2 * totalCurrent * cableLength / 1000);
      const minCableCSA = this.calculateCCTVCableCSA(cableResistance, cableLength);

      // Calculate UPS sizing if redundancy required
      const upsRating = redundancy ? Math.ceil(adjustedPower * 1.3) : 0; // 30% margin
      const batteryBackupTime = redundancy ? 4 : 0; // 4 hours backup

      // Calculate daily energy consumption
      const dailyEnergyConsumption = (adjustedPower * operatingHours) / 1000; // kWh

      const recommendations = [
        'Use Category 6 or better cables for IP cameras',
        'Install surge protection on all outdoor cables',
        'Provide dedicated earthing for CCTV equipment',
        'Consider PoE switches for IP camera installations'
      ];

      if (cameras.ipCameras > 0) {
        recommendations.push('Ensure network infrastructure can handle IP camera bandwidth');
      }

      if (redundancy) {
        recommendations.push('Install UPS with network management capability');
      }

      return {
        totalCameras: cameras.analog + cameras.ipCameras + cameras.ptzCameras,
        totalPowerConsumption: Math.round(adjustedPower),
        totalCurrent: Math.round(totalCurrent * 100) / 100,
        minCableCSA,
        upsRating,
        batteryBackupTime,
        dailyEnergyConsumption: Math.round(dailyEnergyConsumption * 100) / 100,
        recommendations,
        regulation: 'BS 7671 Section 717 Mobile or Transportable Units, BS EN 50132 CCTV Standards'
      };
    } catch (error) {
      throw new Error(`CCTV calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateCCTVInputs(inputs: {
    operatingHours: number;
    cableLength: number;
    voltage: number;
  }): void {
    const { operatingHours, cableLength, voltage } = inputs;

    if (operatingHours < 0 || operatingHours > 24) throw new Error('Operating hours must be between 0 and 24');
    if (cableLength <= 0) throw new Error('Cable length must be positive');
    if (voltage <= 0) throw new Error('Voltage must be positive');
  }

  private static calculateCCTVCableCSA(resistance: number, length: number): number {
    const copperResistivity = 0.0175;
    const requiredCSA = (copperResistivity * length * 2) / resistance;

    const standardSizes = [0.5, 0.75, 1.0, 1.5, 2.5, 4.0, 6.0];
    return standardSizes.find(size => size >= requiredCSA) || 6.0;
  }
}

/**
 * Data Center Power Calculator
 * Calculates power requirements for data center installations
 */
export class DataCenterCalculator {
  static calculate(inputs: {
    itLoad: number;           // IT equipment load (kW)
    redundancyLevel: 'N' | 'N+1' | '2N'; // Redundancy requirement
    coolingRatio: number;     // PUE (Power Usage Effectiveness)
    upsSizing: number;        // UPS sizing factor (1.2-2.0)
    batteryBackupTime: number; // Required backup time (minutes)
    generatorBackup: boolean; // Generator backup required
    phases: 3;               // Always 3-phase for data centers
    voltage: number;         // Supply voltage
  }) {
    const { 
      itLoad, 
      redundancyLevel, 
      coolingRatio, 
      upsSizing, 
      batteryBackupTime, 
      generatorBackup,
      voltage 
    } = inputs;

    try {
      this.validateDataCenterInputs(inputs);

      // Calculate total facility power based on PUE
      const totalFacilityPower = itLoad * coolingRatio;

      // Calculate UPS capacity based on redundancy
      let upsCapacity: number;
      switch (redundancyLevel) {
        case 'N':
          upsCapacity = totalFacilityPower * upsSizing;
          break;
        case 'N+1':
          upsCapacity = totalFacilityPower * upsSizing * 1.2; // 20% additional capacity
          break;
        case '2N':
          upsCapacity = totalFacilityPower * upsSizing * 2; // Full duplication
          break;
      }

      // Calculate generator sizing
      const generatorCapacity = generatorBackup ? totalFacilityPower * 1.25 : 0;

      // Calculate electrical infrastructure
      const totalCurrent = totalFacilityPower * 1000 / (Math.sqrt(3) * voltage);
      const mainBreakerRating = this.calculateBreakerRating(totalCurrent);

      // Calculate battery requirements
      const batteryCapacity = this.calculateBatteryCapacity(
        upsCapacity, 
        batteryBackupTime, 
        redundancyLevel
      );

      // Calculate cooling load
      const coolingLoad = totalFacilityPower - itLoad;

      // Power distribution recommendations
      const recommendations = [
        'Install dual power feeds with automatic transfer switching',
        'Use isolated neutral earthing system (IT system preferred)',
        'Implement comprehensive monitoring and alarming',
        'Install harmonic filters for non-linear loads'
      ];

      if (redundancyLevel === '2N') {
        recommendations.push('Implement full electrical path redundancy');
      }

      if (generatorBackup) {
        recommendations.push('Test generator monthly under load conditions');
      }

      return {
        itLoad,
        totalFacilityPower: Math.round(totalFacilityPower),
        upsCapacity: Math.round(upsCapacity),
        generatorCapacity: Math.round(generatorCapacity),
        coolingLoad: Math.round(coolingLoad),
        totalCurrent: Math.round(totalCurrent),
        mainBreakerRating,
        batteryCapacity: Math.round(batteryCapacity),
        pue: coolingRatio,
        redundancyLevel,
        recommendations,
        regulation: 'BS 7671 Section 717, TIA-942 Data Center Standards'
      };
    } catch (error) {
      throw new Error(`Data center calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateDataCenterInputs(inputs: {
    itLoad: number;
    coolingRatio: number;
    upsSizing: number;
    batteryBackupTime: number;
    voltage: number;
  }): void {
    const { itLoad, coolingRatio, upsSizing, batteryBackupTime, voltage } = inputs;

    if (itLoad <= 0) throw new Error('IT load must be positive');
    if (coolingRatio < 1.0) throw new Error('PUE must be at least 1.0');
    if (upsSizing < 1.0 || upsSizing > 3.0) throw new Error('UPS sizing factor must be between 1.0 and 3.0');
    if (batteryBackupTime < 5 || batteryBackupTime > 480) throw new Error('Battery backup time must be between 5 and 480 minutes');
    if (voltage <= 0) throw new Error('Voltage must be positive');
  }

  private static calculateBreakerRating(current: number): number {
    const standardRatings = [63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600];
    return standardRatings.find(rating => rating >= current * 1.25) || 1600;
  }

  private static calculateBatteryCapacity(
    upsCapacity: number, 
    backupTime: number, 
    redundancy: string
  ): number {
    // Simplified battery calculation - actual calculation requires detailed UPS specifications
    const baseCapacity = (upsCapacity * backupTime) / 60; // Ah estimate
    
    return redundancy === '2N' ? baseCapacity * 2 : baseCapacity;
  }
}

/**
 * Swimming Pool & Spa Electrical Calculator
 * Calculates electrical requirements for swimming pools and spas
 * Based on BS 7671 Section 702 - Swimming Pools and Fountains
 */
export class SwimmingPoolCalculator {
  /**
   * Calculate swimming pool electrical requirements
   * Based on BS 7671:2018+A2:2022 Section 702
   */
  static calculate(inputs: SwimmingPoolInputs): SwimmingPoolResult {
    // Zone classifications per BS 7671 Section 702.410
    const zoneClassification = this.calculateZoneClassification(inputs);
    
    // Power calculations with diversity
    const powerCalculations = this.calculatePowerRequirements(inputs);
    
    // Protection requirements per Section 702.4
    const protectionRequirements = this.calculateProtectionRequirements(inputs, powerCalculations);
    
    // Safety requirements per Section 702.5
    const safetyRequirements = this.calculateSafetyRequirements(inputs);
    
    // Compliance checks
    const compliance = this.checkCompliance(inputs);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, powerCalculations);

    return {
      zoneClassification,
      powerCalculations,
      protectionRequirements,
      safetyRequirements,
      compliance,
      recommendations,
      regulation: 'BS 7671:2018+A2:2022 Section 702 - Swimming Pools and Fountains'
    };
  }

  private static calculateZoneClassification(inputs: SwimmingPoolInputs) {
    return {
      zone0: {
        description: 'Interior of pool (including fountain jets)',
        ipRating: inputs.poolData.poolType === 'outdoor' ? 'IPX8' : 'IPX7',
        maxVoltage: 12 // V SELV only
      },
      zone1: {
        description: '2m horizontal from pool edge, 2.5m above pool',
        ipRating: inputs.poolData.poolType === 'outdoor' ? 'IPX5' : 'IPX4',
        maxVoltage: 12 // V SELV only  
      },
      zone2: {
        description: '1.5m beyond zone 1',
        ipRating: inputs.poolData.poolType === 'outdoor' ? 'IPX4' : 'IPX2',
        maxVoltage: 'SELV/230V with RCD protection'
      }
    };
  }

  private static calculatePowerRequirements(inputs: SwimmingPoolInputs) {
    // Calculate pump loads
    const pumpLoad = inputs.equipment.pumps.reduce((total, pump) => {
      return total + pump.power;
    }, 0);

    // Calculate heating load  
    const heatingLoad = inputs.equipment.heaters.reduce((total, heater) => {
      return total + heater.power;
    }, 0);

    // Calculate lighting load (SELV only)
    const lightingLoad = inputs.equipment.lighting.reduce((total, light) => {
      return total + (light.power * light.quantity) / 1000; // Convert W to kW
    }, 0);

    // Calculate auxiliary equipment load
    const auxiliaryLoad = inputs.equipment.accessories.reduce((total, accessory) => {
      return total + accessory.power / 1000; // Convert W to kW
    }, 0);

    const totalLoad = pumpLoad + heatingLoad + lightingLoad + auxiliaryLoad;
    
    // Apply diversity factor per BS 7671 recommendations
    const diversityFactor = this.calculateDiversityFactor(inputs);
    const maximumDemand = totalLoad * diversityFactor;

    return {
      pumpLoad,
      heatingLoad,
      lightingLoad,
      auxiliaryLoad,
      totalLoad,
      diversityFactor,
      maximumDemand
    };
  }

  private static calculateDiversityFactor(inputs: SwimmingPoolInputs): number {
    // Diversity factors for pool equipment per industry standards
    let diversityFactor = 1.0;

    if (inputs.poolData.poolType === 'outdoor') {
      diversityFactor = 0.8; // Seasonal use
    }

    // Reduce for multiple heating systems
    if (inputs.equipment.heaters.length > 1) {
      diversityFactor *= 0.9;
    }

    return Math.max(diversityFactor, 0.7); // Minimum 70% diversity
  }

  private static calculateProtectionRequirements(inputs: SwimmingPoolInputs, power: any) {
    // RCD protection per Section 702.410.3.4
    const rcdType = inputs.installation.rcdProtection === '10mA' ? 
      'Type A 10mA RCBO for all circuits' : 
      'Type A 30mA RCD minimum';
    
    // MCB rating based on maximum demand
    const mcbRating = Math.ceil(power.maximumDemand * 1000 / 230 * 1.25); // 25% safety margin

    return {
      rcdType,
      rcdRating: inputs.installation.rcdProtection,
      mcbRating,
      cableType: 'PVC/PVC or equivalent, suitable for damp conditions',
      equipotentialBonding: [
        'Metallic structures in contact with pool water',
        'Metallic fittings within 2m of pool edge',
        'Pool reinforcement if metallic',
        'Electrical equipment metalwork'
      ],
      earthingArrangement: 'TN-S preferred, supplementary equipotential bonding required'
    };
  }

  private static calculateSafetyRequirements(inputs: SwimmingPoolInputs) {
    return {
      isolationRequired: true,
      emergencyStop: inputs.equipment.pumps.length > 0,
      warningNotices: [
        'Danger - Swimming Pool Electrical Installation',
        'Switch off before maintenance',
        'No electrical equipment in Zones 0 and 1 except SELV'
      ],
      accessRestrictions: [
        'Isolators outside pool zones',
        'Control equipment in Zone 2 minimum',
        'Consumer unit outside pool area'
      ],
      maintenanceRequirements: [
        'Annual electrical inspection',
        'RCD testing monthly',
        'Visual inspection before use',
        'Professional service every 3 years'
      ]
    };
  }

  private static checkCompliance(inputs: SwimmingPoolInputs) {
    return {
      bs7671Section702: true,
      buildingRegulations: true,
      healthSafetyCompliance: true,
      planningPermissionNote: 'Check with local authority for planning requirements'
    };
  }

  private static generateRecommendations(inputs: SwimmingPoolInputs, power: any): string[] {
    const recommendations: string[] = [
      'All electrical work must be carried out by qualified electricians',
      'Installation must be notified to Building Control under Part P',
      'Use only SELV equipment in Zones 0 and 1',
      'Install RCD protection as specified in BS 7671 Section 702',
      'Ensure proper equipotential bonding of all metalwork'
    ];

    if (inputs.poolData.fillType === 'saltwater') {
      recommendations.push('Use marine-grade cables due to saltwater environment');
      recommendations.push('Increase frequency of electrical inspections');
    }

    if (power.heatingLoad > 10) {
      recommendations.push('Consider three-phase supply for high power heating loads');
    }

    return recommendations;
  }
}

/**
 * Caravan & Marina Supply Calculator
 * Calculates electrical supply requirements for caravan parks and marinas
 * Based on BS 7671 Section 708 (Caravan Parks) and Section 709 (Marinas)
 */
export class CaravanMarinaCalculator {
  /**
   * Calculate caravan park or marina electrical supply requirements
   * Based on BS 7671:2018+A2:2022 Sections 708 & 709
   */
  static calculate(inputs: CaravanMarinaInputs): CaravanMarinaResult {
    // Load calculations with diversity
    const loadCalculations = this.calculateLoadRequirements(inputs);
    
    // Distribution system design
    const distributionDesign = this.calculateDistributionSystem(inputs, loadCalculations);
    
    // Protection requirements
    const protectionRequirements = this.calculateProtectionRequirements(inputs);
    
    // Outlet specifications
    const outletSpecification = this.calculateOutletRequirements(inputs);
    
    // Environmental considerations
    const environmentalConsiderations = this.calculateEnvironmentalRequirements(inputs);
    
    // Compliance checks
    const compliance = this.checkCompliance(inputs);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, loadCalculations);

    return {
      loadCalculations,
      distributionDesign,
      protectionRequirements,
      outletSpecification,
      environmentalConsiderations,
      compliance,
      recommendations,
      regulation: inputs.facilityType.includes('marina') ? 
        'BS 7671:2018+A2:2022 Section 709 - Marinas' :
        'BS 7671:2018+A2:2022 Section 708 - Caravan Parks'
    };
  }

  private static calculateLoadRequirements(inputs: CaravanMarinaInputs) {
    // Diversity factors per BS 7671 for caravan/marina installations
    const diversityFactors = {
      lighting: 60, // %
      heating: 80, // % 
      powerOutlets: inputs.facilityType.includes('marina') ? 50 : 70, // %
      overall: inputs.facilityType.includes('marina') ? 45 : 60 // %
    };

    // Standard loads per pitch
    const loadPer16A = 3.68; // kW (16A at 230V)
    const loadPer32A = 7.36; // kW (32A at 230V)

    // Calculate total connected load
    const totalConnectedLoad = 
      (inputs.pitchRequirements.standard16A * loadPer16A) +
      (inputs.pitchRequirements.higherRated32A * loadPer32A);

    // Apply diversity
    const coincidenceFactor = this.calculateCoincidenceFactor(inputs);
    const maximumDemand = totalConnectedLoad * (diversityFactors.overall / 100) * coincidenceFactor;

    return {
      diversityFactors,
      totalConnectedLoad,
      maximumDemand,
      coincidenceFactor,
      futureExpansion: 20 // % allowance for future expansion
    };
  }

  private static calculateCoincidenceFactor(inputs: CaravanMarinaInputs): number {
    // Coincidence factor based on number of pitches
    const totalPitches = inputs.numberOfPitches;
    
    if (totalPitches <= 10) return 1.0;
    if (totalPitches <= 50) return 0.85;
    if (totalPitches <= 100) return 0.75;
    return 0.65;
  }

  private static calculateDistributionSystem(inputs: CaravanMarinaInputs, loads: any) {
    // Main supply rating with future expansion
    const mainSupplyRating = Math.ceil(loads.maximumDemand * 1.2 * 1000 / 
      (inputs.supplyData.voltage * (inputs.supplyData.phases === 3 ? Math.sqrt(3) : 1)));

    // Distribution method
    const distributionMethod = inputs.numberOfPitches > 10 ? 
      'Ring circuit with distribution pillars' : 
      'Radial circuits from main distribution board';

    // Pillar locations (one per 4-6 pitches typically)
    const pillarLocations = Math.ceil(inputs.numberOfPitches / 5);

    return {
      mainSupplyRating,
      distributionMethod,
      pillarLocations,
      cableRequirements: {
        mainCable: this.selectMainCable(mainSupplyRating, inputs.supplyData.phases),
        distributionCables: '4mm² 3-core SWA minimum',
        dropCables: '2.5mm² 3-core flexible cable with RCD protection'
      }
    };
  }

  private static selectMainCable(rating: number, phases: number): string {
    if (phases === 3) {
      if (rating <= 100) return '25mm² 4-core SWA';
      if (rating <= 160) return '35mm² 4-core SWA';
      if (rating <= 200) return '50mm² 4-core SWA';
      return '70mm² 4-core SWA or larger';
    } else {
      if (rating <= 63) return '16mm² 3-core SWA';
      if (rating <= 100) return '25mm² 3-core SWA';
      return '35mm² 3-core SWA or larger';
    }
  }

  private static calculateProtectionRequirements(inputs: CaravanMarinaInputs) {
    return {
      incomingProtection: 'MCCB or fused switch, isolator required',
      rcdProtection: inputs.facilityType.includes('marina') ? '30mA' as const : '30mA' as const,
      surgeProtection: inputs.environmentalFactors.weatherExposure !== 'sheltered',
      isolationRequirements: [
        'Main isolator accessible to site management',
        'Pillar isolators for maintenance',
        'Individual pitch isolation if required'
      ],
      emergencyIsolation: true
    };
  }

  private static calculateOutletRequirements(inputs: CaravanMarinaInputs) {
    return {
      ceeOutlets: {
        '16A': {
          type: 'CEE 16A 2P+E socket outlet',
          ipRating: 'IP44 minimum',
          mounting: 'Distribution pillar at 0.5-1.5m height'
        },
        '32A': {
          type: 'CEE 32A 2P+E socket outlet', 
          ipRating: 'IP44 minimum',
          mounting: 'Distribution pillar with secure cover'
        }
      },
      additionalOutlets: [
        'TV aerial connections if required',
        'Telephone/internet connections if specified',
        'Water and waste connections (non-electrical)'
      ],
      meteringRequirements: inputs.numberOfPitches > 10
    };
  }

  private static calculateEnvironmentalRequirements(inputs: CaravanMarinaInputs) {
    const baseIP = 'IP44';
    let enhancedIP = baseIP;
    
    if (inputs.environmentalFactors.saltWaterExposure) {
      enhancedIP = 'IP65';
    }
    if (inputs.environmentalFactors.weatherExposure === 'severe') {
      enhancedIP = 'IP65';
    }

    return {
      ipRating: enhancedIP,
      cableProtection: 'SWA cables underground, additional conduit protection if required',
      corrosionProtection: inputs.environmentalFactors.saltWaterExposure ? [
        'Marine-grade materials',
        'Stainless steel fixings',
        'Enhanced earthing protection',
        'Regular inspection schedule'
      ] : ['Standard galvanized protection', 'Appropriate cable grades'],
      earthingSpecial: inputs.environmentalFactors.saltWaterExposure,
      lightningProtection: inputs.environmentalFactors.weatherExposure === 'severe'
    };
  }

  private static checkCompliance(inputs: CaravanMarinaInputs) {
    return {
      bs7671Section708: !inputs.facilityType.includes('marina'),
      bs7671Section709: inputs.facilityType.includes('marina'),
      marineSafetyCode: inputs.facilityType.includes('marina'),
      environmentalRegulations: true
    };
  }

  private static generateRecommendations(inputs: CaravanMarinaInputs, loads: any): string[] {
    const recommendations: string[] = [
      'All electrical work must be carried out by qualified electricians',
      'Regular inspection and testing required per BS 7671',
      'Use CEE socket outlets as specified in relevant standards',
      'Ensure adequate earthing and RCD protection',
      'Install weather-protected distribution equipment'
    ];

    if (inputs.facilityType.includes('marina')) {
      recommendations.push('Consider additional surge protection due to marine environment');
      recommendations.push('Use marine-grade cables and fittings');
      recommendations.push('Install shore connection pedestals at appropriate intervals');
    }

    if (loads.maximumDemand > 100) {
      recommendations.push('Consider three-phase distribution for high loads');
    }

    if (inputs.environmentalFactors.saltWaterExposure) {
      recommendations.push('Increase inspection frequency due to corrosive environment');
    }

    return recommendations;
  }
}

/**
 * Agricultural Installation Calculator
 * Calculates electrical requirements for farm and agricultural installations
 * Based on BS 7671 Section 705 - Agricultural and Horticultural Premises
 */
export class AgriculturalCalculator {
  /**
   * Calculate agricultural installation electrical requirements
   * Based on BS 7671:2018+A2:2022 Section 705
   */
  static calculate(inputs: AgriculturalInputs): AgriculturalResult {
    // Load assessment with agricultural diversity factors
    const loadAssessment = this.calculateLoadAssessment(inputs);
    
    // Protection requirements for agricultural environments
    const protectionRequirements = this.calculateProtectionRequirements(inputs);
    
    // Installation methods suitable for agricultural environments
    const installationMethods = this.calculateInstallationMethods(inputs);
    
    // Special considerations for agricultural installations
    const specialConsiderations = this.calculateSpecialConsiderations(inputs);
    
    // Earthing and bonding requirements
    const earthingBonding = this.calculateEarthingBonding(inputs);
    
    // Compliance checks
    const compliance = this.checkCompliance(inputs);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, loadAssessment);

    return {
      loadAssessment,
      protectionRequirements,
      installationMethods,
      specialConsiderations,
      earthingBonding,
      compliance,
      recommendations,
      regulation: 'BS 7671:2018+A2:2022 Section 705 - Agricultural and Horticultural Premises'
    };
  }

  private static calculateLoadAssessment(inputs: AgriculturalInputs) {
    // Calculate lighting load
    const lightingLoad = inputs.buildings.reduce((total, building) => {
      return total + (building.area * inputs.electricalLoads.lighting.generalLighting / 1000);
    }, 0) + (inputs.electricalLoads.lighting.taskLighting / 1000);

    // Calculate machinery load
    const machineryLoad = inputs.electricalLoads.machinery.reduce((total, machine) => {
      return total + machine.power;
    }, 0);

    // Calculate ventilation load
    const ventilationLoad = (inputs.electricalLoads.ventilation.fans * 
      inputs.electricalLoads.ventilation.fanPower / 1000) + 
      inputs.electricalLoads.ventilation.heatingLoad;

    // Calculate specialist load (milking equipment etc.)
    let specialistLoad = 0;
    if (inputs.electricalLoads.milkingEquipment) {
      const milking = inputs.electricalLoads.milkingEquipment;
      specialistLoad += milking.coolingTanks + milking.washingSystems;
    }

    const totalConnectedLoad = lightingLoad + machineryLoad + ventilationLoad + specialistLoad;

    // Agricultural diversity factors per BS 7671 guidance
    const diversityFactors = this.calculateAgriculturalDiversity(inputs);
    const maximumDemand = 
      (lightingLoad * diversityFactors.lighting / 100) +
      (machineryLoad * diversityFactors.machinery / 100) +
      (ventilationLoad * diversityFactors.ventilation / 100) +
      (specialistLoad * diversityFactors.overall / 100);

    return {
      lightingLoad,
      machineryLoad,
      ventilationLoad,
      specialistLoad,
      totalConnectedLoad,
      diversityFactors,
      maximumDemand
    };
  }

  private static calculateAgriculturalDiversity(inputs: AgriculturalInputs) {
    // Diversity factors vary by farm type and operation
    const baseDiversity = {
      lighting: 80, // %
      machinery: 60, // % (seasonal/intermittent use)
      ventilation: 90, // % (often continuous)
      overall: 70 // %
    };

    // Adjust for farm type
    if (inputs.farmType === 'dairy') {
      baseDiversity.machinery = 75; // Higher coincidence for milking operations
      baseDiversity.overall = 80;
    } else if (inputs.farmType === 'arable') {
      baseDiversity.machinery = 50; // More seasonal
    }

    return baseDiversity;
  }

  private static calculateProtectionRequirements(inputs: AgriculturalInputs) {
    // IP ratings based on environmental conditions
    const ipRatings = {
      generalAreas: 'IP54',
      animalAreas: inputs.environmentalConditions.animalContact ? 'IP65' : 'IP54',
      washdownAreas: 'IP65',
      outdoorAreas: 'IP65'
    };

    // Enhanced IP rating for harsh conditions
    if (inputs.environmentalConditions.dampness === 'high') {
      Object.keys(ipRatings).forEach(key => {
        ipRatings[key as keyof typeof ipRatings] = 'IP65';
      });
    }

    // Enhanced IP rating for high dust conditions
    if (inputs.environmentalConditions.dustLevel === 'high') {
      Object.keys(ipRatings).forEach(key => {
        ipRatings[key as keyof typeof ipRatings] = 'IP65';
      });
    }

    return {
      ipRatings,
      rcdProtection: {
        socketOutlets: '30mA' as const,
        fixed_equipment: inputs.environmentalConditions.dampness === 'high' ? '100mA' as const : '300mA' as const,
        fireProtection: inputs.environmentalConditions.dustLevel === 'high'
      },
      additionalProtection: {
        surgeProtection: true, // Rural installations often exposed to lightning
        isolationSwitches: [
          'Main farm supply isolator',
          'Building isolators',
          'Machinery isolators',
          'Emergency stop for hazardous machinery'
        ],
        emergencyStop: inputs.electricalLoads.machinery.some(m => m.name.includes('silo') || m.name.includes('feed'))
      }
    };
  }

  private static calculateInstallationMethods(inputs: AgriculturalInputs) {
    return {
      cableTypes: {
        underground: [
          'PVC/SWA/PVC cables for general use',
          'XLPE/SWA/PVC for high-temperature areas',
          'Flexible cables for mobile equipment connections'
        ],
        overhead: [
          'PVC/PVC overhead line cables',
          'Catenary wire systems for temporary supplies',
          'Weather-resistant cables only'
        ],
        indoorFixed: [
          'PVC/PVC cables in containment',
          'MICC cables in high-risk fire areas',
          'Flexible cables for equipment connections'
        ],
        flexible: [
          'Heavy duty rubber cables for mobile equipment',
          'PVC flex for light duty applications',
          'EPR cables for high-temperature applications'
        ]
      },
      cabingMethods: {
        underground: 'Direct burial at 600mm minimum depth, cable route marking required',
        overhead: 'Minimum 5.2m height over vehicle routes, 3.5m over footpaths',
        indoorRoutes: [
          'Cable basket/tray systems in clean areas',
          'Conduit systems in dusty/corrosive areas',
          'Surface-mounted steel wire armoured where mechanical protection needed'
        ],
        protection: [
          'Mechanical protection at vehicle crossing points',
          'Rodent protection in feed storage areas',
          'Chemical protection in areas using agricultural chemicals'
        ]
      }
    };
  }

  private static calculateSpecialConsiderations(inputs: AgriculturalInputs) {
    return {
      animalSafety: [
        'All accessible electrical equipment out of animal reach',
        'Use SELV systems where animals may contact equipment',
        'Install animal-proof cable protection',
        'Regular inspection for animal damage'
      ],
      firePrevention: [
        'Enhanced fire detection in hay/straw storage areas',
        'RCD fire protection where required',
        'Heat-resistant cable types in high-risk areas',
        'Adequate ventilation around electrical equipment'
      ],
      operationalRequirements: [
        'Emergency supplies for critical ventilation systems',
        'Standby generator connections where required',
        'Load shedding provisions for peak demand management',
        'Flexible connections for mobile equipment'
      ],
      maintenanceAccess: [
        'All equipment accessible for routine maintenance',
        'Isolation facilities near equipment',
        'Weather protection for outdoor equipment',
        'Vehicle access to major equipment'
      ]
    };
  }

  private static calculateEarthingBonding(inputs: AgriculturalInputs) {
    return {
      earthingMethod: 'TT system often preferred in rural locations',
      bondingRequirements: [
        'Metallic structure bonding',
        'Water supply pipe bonding',
        'Feed/milk pipeline bonding where metallic',
        'Livestock barrier bonding if metallic'
      ],
      specialEarthing: inputs.environmentalConditions.corrosiveSubstances,
      lightningProtection: true // Rural locations typically require lightning protection
    };
  }

  private static checkCompliance(inputs: AgriculturalInputs) {
    return {
      bs7671Section705: true,
      animalWelfareRegs: inputs.farmType === 'livestock' || inputs.farmType === 'dairy' || inputs.farmType === 'poultry',
      healthSafetyRegs: true,
      environmentalRegs: true,
      fireRegulations: true
    };
  }

  private static generateRecommendations(inputs: AgriculturalInputs, loads: any): string[] {
    const recommendations: string[] = [
      'All electrical work must be carried out by qualified electricians',
      'Use enhanced IP ratings due to agricultural environment',
      'Install RCD protection as specified in BS 7671 Section 705',
      'Consider lightning protection for rural installation',
      'Plan for emergency supplies to critical systems'
    ];

    if (inputs.environmentalConditions.animalContact) {
      recommendations.push('Use SELV systems where animals may contact electrical equipment');
      recommendations.push('Install animal-proof cable protection');
    }

    if (inputs.electricalLoads.milkingEquipment) {
      recommendations.push('Install emergency backup for milking operations');
      recommendations.push('Consider load monitoring for dairy equipment');
    }

    if (loads.maximumDemand > 50) {
      recommendations.push('Consider three-phase supply for high power requirements');
    }

    return recommendations;
  }
}

/**
 * Temporary Supply Calculator
 * Calculates electrical requirements for temporary installations
 * Based on BS 7671 Section 717 - Mobile or Transportable Units
 */
export class TemporarySupplyCalculator {
  /**
   * Calculate temporary supply requirements
   * Based on BS 7671:2018+A2:2022 Section 717
   */
  static calculate(inputs: TemporarySupplyInputs): TemporarySupplyResult {
    // Supply design calculations
    const supplyDesign = this.calculateSupplyDesign(inputs);
    
    // Distribution system requirements
    const distributionSystem = this.calculateDistributionSystem(inputs);
    
    // Protection measures for temporary installations
    const protectionMeasures = this.calculateProtectionMeasures(inputs);
    
    // Safety requirements for temporary supplies
    const safetyRequirements = this.calculateSafetyRequirements(inputs);
    
    // Installation guidance
    const installationGuidance = this.calculateInstallationGuidance(inputs);
    
    // Compliance checks
    const compliance = this.checkCompliance(inputs);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, supplyDesign);

    return {
      supplyDesign,
      distributionSystem,
      protectionMeasures,
      safetyRequirements,
      installationGuidance,
      compliance,
      recommendations,
      regulation: 'BS 7671:2018+A2:2022 Section 717 - Mobile or Transportable Units'
    };
  }

  private static calculateSupplyDesign(inputs: TemporarySupplyInputs) {
    // Calculate connected load
    let connectedLoad = 0;

    if (inputs.constructionSite) {
      // Machinery load
      connectedLoad += inputs.constructionSite.machinery.reduce((total, machine) => {
        return total + (machine.power * machine.quantity);
      }, 0);

      // Lighting load
      const site = inputs.constructionSite;
      const siteAreaKW = (site.lighting.siteArea * site.siteArea) / 1000; // W/m² × m² / 1000 = kW
      const workAreaKW = (site.lighting.workAreas * site.siteArea) / 1000; // W/m² × m² / 1000 = kW
      connectedLoad += siteAreaKW + workAreaKW;
      
      // Accommodation loads
      connectedLoad += (site.accommodation.offices * 2) + // 2kW per office
                      (site.accommodation.welfare * 3) + // 3kW per welfare unit
                      (site.accommodation.storage * 0.5); // 0.5kW per storage
    }

    // Temporary installation diversity factors
    const diversityFactor = this.calculateTemporaryDiversity(inputs);
    const maximumDemand = connectedLoad * diversityFactor;

    return {
      incomingSupply: {
        voltage: inputs.supplyRequirements.voltage,
        rating: Math.ceil(maximumDemand * 1000 / inputs.supplyRequirements.voltage * 1.25), // 25% margin
        phases: inputs.supplyRequirements.phases,
        earthing: 'TN-S preferred for temporary supplies',
        isolationMethod: 'Lockable main isolator with emergency stop'
      },
      loadCalculation: {
        connectedLoad,
        diversityFactor: diversityFactor * 100, // Convert to %
        maximumDemand,
        futureExpansion: 25 // % for temporary installations
      }
    };
  }

  private static calculateTemporaryDiversity(inputs: TemporarySupplyInputs): number {
    // Diversity factors for temporary installations
    let diversity = 0.6; // Base 60% diversity

    if (inputs.supplyType === 'construction_site') {
      diversity = 0.5; // Lower diversity for construction sites
    } else if (inputs.supplyType === 'exhibition' || inputs.supplyType === 'fair') {
      diversity = 0.8; // Higher for events
    }

    // Adjust for duration
    if (inputs.duration === 'less_than_3_months') {
      diversity *= 1.1; // Can be higher for short-term
    }

    return Math.min(diversity, 0.9); // Maximum 90%
  }

  private static calculateDistributionSystem(inputs: TemporarySupplyInputs) {
    const assemblies: Array<{
      assemblyType: string;
      rating: number;
      outlets: { [type: string]: number };
      protection: string[];
      ipRating: string;
    }> = [];

    // Calculate number of distribution assemblies needed
    const totalOutlets = inputs.distribution.outlets['16A_sockets'] + 
                        inputs.distribution.outlets['32A_sockets'] + 
                        inputs.distribution.outlets['63A_sockets'] +
                        inputs.distribution.outlets.specialOutlets;
    
    const assembliesNeeded = Math.ceil(totalOutlets / 5.3); // Based on construction site requirements for adequate distribution

    for (let i = 0; i < assembliesNeeded; i++) {
      assemblies.push({
        assemblyType: `Distribution Assembly ${i + 1}`,
        rating: 63, // A typical rating
        outlets: {
          '16A_sockets': Math.ceil(inputs.distribution.outlets['16A_sockets'] / assembliesNeeded),
          '32A_sockets': Math.ceil(inputs.distribution.outlets['32A_sockets'] / assembliesNeeded)
        },
        protection: ['Individual RCD protection', 'MCB protection per circuit'],
        ipRating: inputs.environmentalConditions.outdoor ? 'IP65' : 'IP44'
      });
    }

    return {
      assemblies,
      cableRequirements: {
        mainCables: ['PVC/SWA/PVC for permanent routes', 'Heavy duty flexible for connections'],
        distributionCables: ['4mm² 3-core SWA minimum', '6mm² for longer runs'],
        flexibleCables: ['Heavy duty rubber/neoprene for equipment connections']
      }
    };
  }

  private static calculateProtectionMeasures(inputs: TemporarySupplyInputs) {
    return {
      rcdProtection: {
        incomingRCD: inputs.supplyRequirements.voltage === 110 ? 
          'Type B 30mA RCD for 110V supplies' : 
          'Type A 30mA RCD for 230V supplies',
        socketRCDs: '30mA' as const,
        additionalRCDs: inputs.supplyType === 'construction_site' ? 
          ['10mA RCD for hand tools', 'Fire protection RCDs where required'] : 
          []
      },
      additionalProtection: {
        surgeProtection: inputs.environmentalConditions.weatherExposed,
        isolationPoints: Math.ceil(inputs.distribution.assemblies / 3), // One per 3 assemblies
        emergencyIsolation: true,
        mechanicalProtection: [
          'Cable protection at ground level',
          'Equipment guards in public areas',
          'Warning signs and barriers'
        ]
      }
    };
  }

  private static calculateSafetyRequirements(inputs: TemporarySupplyInputs) {
    return {
      inspectionTesting: {
        initialVerification: true,
        periodicInspection: inputs.duration === 'over_12_months' ? 
          'Every 12 months' : 
          'Every 3 months for temporary installations',
        portableAppliances: 'Monthly visual inspection, annual PAT testing',
        records: [
          'Installation certificate',
          'Periodic inspection reports',
          'PAT testing records',
          'Incident reports'
        ]
      },
      operationalSafety: {
        competentPersons: true,
        userInstructions: [
          'Safe operation procedures',
          'Emergency contact details',
          'Isolation procedures',
          'Reporting procedures for faults'
        ],
        maintenanceSchedule: [
          'Daily visual checks',
          'Weekly RCD testing',
          'Monthly detailed inspection',
          'Annual professional inspection'
        ],
        hazardIdentification: [
          'Public access restrictions',
          'Vehicle movement areas',
          'Weather-related hazards',
          'Equipment-specific risks'
        ]
      }
    };
  }

  private static calculateInstallationGuidance(inputs: TemporarySupplyInputs) {
    return {
      cableInstallation: [
        'Overhead cables minimum 5.2m height over vehicle routes',
        'Underground cables at minimum 450mm depth with warning tape',
        'Surface cables protected by appropriate covers/guards',
        'Flexible connections only where movement required'
      ],
      earthingArrangements: [
        'TN-S earthing preferred for temporary supplies',
        'Supplementary equipotential bonding where required',
        'Earth electrode testing if TT system used',
        'Protective bonding of all exposed metalwork'
      ],
      equipmentMounting: [
        'Distribution assemblies at 1.0-1.5m height',
        'Weather protection for all equipment',
        'Secure mounting to prevent theft/vandalism',
        'Clear identification and labeling'
      ],
      signageRequirements: [
        'Danger - Electrical Installation signs',
        'Emergency contact details prominently displayed',
        'Circuit identification labels',
        'Isolation point identification'
      ]
    };
  }

  private static checkCompliance(inputs: TemporarySupplyInputs) {
    return {
      bs7671Section717: true,
      constructionRegs: inputs.supplyType === 'construction_site',
      healthSafetyRegs: true,
      publicSafetyReqs: inputs.environmentalConditions.publicAccess
    };
  }

  private static generateRecommendations(inputs: TemporarySupplyInputs, supply: any): string[] {
    const recommendations: string[] = [
      'All electrical work must be carried out by qualified electricians',
      'Use appropriate temporary supply equipment to BS EN 61439-4',
      'Install enhanced RCD protection for temporary installations',
      'Implement regular inspection and testing schedule',
      'Ensure adequate mechanical protection for cables and equipment'
    ];

    if (inputs.supplyType === 'construction_site') {
      recommendations.push('Use 110V CTE supplies for hand tools where possible');
      recommendations.push('Install emergency isolation accessible to site management');
    }

    if (inputs.environmentalConditions.publicAccess) {
      recommendations.push('Install additional security measures to prevent public access');
      recommendations.push('Use tamper-resistant equipment');
    }

    if (supply.loadCalculation.maximumDemand > 50) {
      recommendations.push('Consider three-phase distribution for high loads');
    }

    return recommendations;
  }
}

/**
 * Hazardous Area Calculator
 * Calculates electrical installation requirements for hazardous areas
 * Based on BS EN 60079 series and ATEX regulations
 */
export class HazardousAreaCalculator {
  /**
   * Calculate hazardous area electrical requirements
   * Based on BS EN 60079 series and ATEX Directive 2014/34/EU
   */
  static calculate(inputs: HazardousAreaInputs): HazardousAreaResult {
    // Equipment specification for the classified area
    const equipmentSpecification = this.calculateEquipmentSpecification(inputs);
    
    // Cable and wiring requirements
    const cableAndWiring = this.calculateCableWiring(inputs);
    
    // Earthing and bonding for hazardous areas
    const earthingAndBonding = this.calculateEarthingBonding(inputs);
    
    // Inspection and testing requirements
    const inspectionTesting = this.calculateInspectionTesting(inputs);
    
    // Compliance standards
    const complianceStandards = this.checkComplianceStandards(inputs);
    
    // Safety considerations
    const safetyConsiderations = this.calculateSafetyConsiderations(inputs);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs);

    return {
      equipmentSpecification,
      cableAndWiring,
      earthingAndBonding,
      inspectionTesting,
      complianceStandards,
      safetyConsiderations,
      recommendations,
      regulation: 'BS EN 60079 series - Explosive Atmospheres & ATEX Directive 2014/34/EU'
    };
  }

  private static calculateEquipmentSpecification(inputs: HazardousAreaInputs) {
    // Determine protection concept based on zone
    const protectionConcept = this.determineProtectionConcept(inputs.areaClassification.zone);
    
    // Equipment category based on zone and substance type
    const category = this.determineEquipmentCategory(inputs.areaClassification.zone, inputs.areaClassification.substanceType);
    
    return {
      protectionConcept,
      certificationRequired: [
        'ATEX certificate of conformity',
        'EU type examination certificate',
        'Quality assurance notification',
        'Installation instructions'
      ],
      equipmentCategories: {
        category,
        suitableFor: this.getSuitableZones(category),
        markingRequired: this.getRequiredMarking(inputs)
      },
      installationRequirements: [
        'Installation must be by competent persons',
        'Equipment must be suitable for temperature class',
        'Protection concept must be maintained',
        'Regular inspection and maintenance required'
      ]
    };
  }

  private static determineProtectionConcept(zone: string): string {
    const concepts = {
      '0': 'Ex ia (intrinsic safety category "ia")',
      '1': 'Ex d (flameproof), Ex e (increased safety), Ex ia/ib',
      '2': 'Ex d, Ex e, Ex ia/ib, Ex n (type "n")',
      '20': 'Ex ia (intrinsic safety) for dust',
      '21': 'Ex t (protection by enclosure) or Ex ia for dust',
      '22': 'Ex t or general equipment for dust'
    };
    return concepts[zone as keyof typeof concepts] || 'Consult specialist';
  }

  private static determineEquipmentCategory(zone: string, substanceType: string): string {
    if (substanceType === 'gas_vapour') {
      switch (zone) {
        case '0': return 'Category 1G (very high protection)';
        case '1': return 'Category 2G (high protection)';
        case '2': return 'Category 3G (normal protection)';
      }
    } else {
      switch (zone) {
        case '20': return 'Category 1D (very high protection)';
        case '21': return 'Category 2D (high protection)';
        case '22': return 'Category 3D (normal protection)';
      }
    }
    return 'Consult specialist for classification';
  }

  private static getSuitableZones(category: string): string[] {
    // Extract just the category part (e.g., "Category 2G" from "Category 2G (high protection)")
    const categoryKey = category.split(' (')[0];
    
    const suitability = {
      'Category 1G': ['Zone 0', 'Zone 1', 'Zone 2'],
      'Category 2G': ['Zone 1', 'Zone 2'],
      'Category 3G': ['Zone 2'],
      'Category 1D': ['Zone 20', 'Zone 21', 'Zone 22'],
      'Category 2D': ['Zone 21', 'Zone 22'],
      'Category 3D': ['Zone 22']
    };
    return suitability[categoryKey as keyof typeof suitability] || [];
  }

  private static getRequiredMarking(inputs: HazardousAreaInputs): string {
    const baseMarking = `Ex [protection concept] [gas group] T[temperature class]`;
    return `CE marking, ${baseMarking}, ATEX marking required`;
  }

  private static calculateCableWiring(inputs: HazardousAreaInputs) {
    return {
      cableTypes: {
        powerCables: [
          'PVC/SWA/PVC cables for general use',
          'MICC cables for high temperature applications',
          'Intrinsically safe cables for Ex ia circuits'
        ],
        controlCables: [
          'Individually screened pairs for control',
          'Blue cables for intrinsically safe circuits',
          'Barrier cables for safety systems'
        ],
        instrumentationCables: [
          'Twisted pair instrumentation cables',
          'Individual screens for each pair',
          'Special barriers required for IS circuits'
        ]
      },
      installationMethods: {
        acceptableMethods: [
          'Direct burial for SWA cables',
          'Cable tray installation with appropriate glands',
          'Conduit systems with certified fittings'
        ],
        prohibitedMethods: [
          'Non-certified cable entry systems',
          'Standard plastic conduit in explosive areas',
          'Cable joints within the hazardous area'
        ],
        sealingRequirements: [
          'Certified cable glands only',
          'Seal all cable entries to enclosures',
          'Maintain IP rating and explosion protection'
        ]
      },
      terminationRequirements: {
        glanding: [
          'Use only certified Ex cable glands',
          'Maintain earth continuity through glands',
          'Use appropriate stopping systems'
        ],
        barriers: [
          'Safety barriers for intrinsically safe circuits',
          'Galvanic isolation where required',
          'Earth connection integrity'
        ],
        isolators: [
          'Ex certified local isolators',
          'Remote isolation capabilities',
          'Emergency isolation systems'
        ]
      }
    };
  }

  private static calculateEarthingBonding(inputs: HazardousAreaInputs) {
    return {
      earthingSystem: 'Enhanced earthing system required for explosive atmospheres',
      bondingRequirements: [
        'Equipotential bonding of all metalwork',
        'Antistatic bonding where required',
        'Process equipment bonding',
        'Structure bonding to earth'
      ],
      resistanceRequirements: {
        earthing: 1, // Ω maximum
        bonding: 0.1, // Ω maximum between bonded parts
        antistatic: 1000000 // MΩ (1000 MΩ) for antistatic requirements
      },
      testingRequirements: [
        'Annual earthing resistance testing',
        'Bonding continuity testing',
        'Antistatic discharge testing',
        'Equipment earth testing'
      ]
    };
  }

  private static calculateInspectionTesting(inputs: HazardousAreaInputs) {
    return {
      initialVerification: {
        visualInspection: [
          'Equipment certification verification',
          'Installation method compliance',
          'Cable gland integrity',
          'Marking and labeling verification'
        ],
        testingRequired: [
          'Insulation resistance testing',
          'Earth continuity testing',
          'Protection circuit testing',
          'Functional testing of safety systems'
        ],
        documentation: [
          'Installation certificate',
          'Equipment certificates',
          'Test results',
          'As-installed drawings'
        ]
      },
      periodicInspection: {
        frequency: 'Annual inspection minimum, more frequent for harsh conditions',
        testsProcedures: [
          'Visual inspection of all equipment',
          'Electrical testing as per initial verification',
          'Mechanical integrity checks',
          'Environmental monitoring'
        ],
        maintenanceRequirements: [
          'Planned preventive maintenance',
          'Condition monitoring',
          'Spare parts management',
          'Competent person involvement'
        ]
      },
      competencyRequirements: [
        'CompEx or equivalent certification',
        'Understanding of ATEX requirements',
        'Specialist training for equipment types',
        'Regular competency updates'
      ]
    };
  }

  private static checkComplianceStandards(inputs: HazardousAreaInputs) {
    return {
      bsEn60079Series: true,
      atexDirectives: true,
      dsearCompliance: true,
      iecExStandards: true
    };
  }

  private static calculateSafetyConsiderations(inputs: HazardousAreaInputs) {
    return {
      riskAssessment: [
        'Comprehensive hazard identification',
        'Risk evaluation and control measures',
        'Emergency response procedures',
        'Personnel safety requirements'
      ],
      emergencyProcedures: [
        'Emergency isolation procedures',
        'Evacuation procedures',
        'Fire and explosion response',
        'First aid and rescue procedures'
      ],
      personnelTraining: [
        'Hazardous area awareness training',
        'Equipment operation training',
        'Emergency response training',
        'Regular competency assessment'
      ],
      documentationRequired: [
        'Area classification drawings',
        'Equipment schedules',
        'Maintenance procedures',
        'Training records'
      ]
    };
  }

  private static generateRecommendations(inputs: HazardousAreaInputs): string[] {
    return [
      'All work must be carried out by CompEx certified personnel',
      'Use only ATEX certified equipment for the specific zone classification',
      'Ensure regular inspection and maintenance by competent persons',
      'Maintain comprehensive documentation and certification records',
      'Implement robust emergency procedures and personnel training',
      'Consider additional safety measures beyond minimum requirements',
      'Regular review of area classification and equipment suitability',
      'Ensure compliance with DSEAR and other relevant regulations'
    ];
  }
}
