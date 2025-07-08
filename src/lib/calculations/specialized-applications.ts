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
