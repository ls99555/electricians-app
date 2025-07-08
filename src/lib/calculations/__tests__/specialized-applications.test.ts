/**
 * Unit Tests for Specialized Applications Calculations
 * Tests fire alarm, CCTV, and data center power calculations
 */

import {
  FireAlarmCalculator,
  CCTVCalculator,
  DataCenterCalculator
} from '../specialized-applications';

describe('FireAlarmCalculator', () => {
  describe('calculate', () => {
    it('should calculate fire alarm system requirements correctly', () => {
      const inputs = {
        numberOfDevices: 50,
        deviceTypes: {
          detectors: 30,
          callPoints: 10,
          sounders: 8,
          beacons: 6,
          interfaces: 4
        },
        systemVoltage: 24,
        cableLength: 200,
        standbyTime: 72,
        alarmTime: 2,
        diversityFactor: 0.8
      };

      const result = FireAlarmCalculator.calculate(inputs);

      expect(result.numberOfDevices).toBe(50);
      expect(result.standbyCurrentAmps).toBeGreaterThan(0);
      expect(result.alarmCurrentAmps).toBeGreaterThan(result.standbyCurrentAmps);
      expect(result.batteryCapacityAh).toBeGreaterThan(0);
      expect(result.powerSupplyRating).toBeGreaterThan(0);
      expect(result.minCableCSA).toBeGreaterThan(0);
      expect(result.maxVoltageDrop).toBe(1.2); // 5% of 24V
      expect(result.recommendations).toContain('Install dedicated fire alarm circuit with RCD protection');
      expect(result.regulation).toContain('BS 5839');
    });

    it('should recommend addressable system for large installations', () => {
      const inputs = {
        numberOfDevices: 100, // Large installation
        deviceTypes: {
          detectors: 60,
          callPoints: 20,
          sounders: 15,
          beacons: 10,
          interfaces: 5
        },
        systemVoltage: 24,
        cableLength: 300,
        standbyTime: 72,
        alarmTime: 2,
        diversityFactor: 0.7
      };

      const result = FireAlarmCalculator.calculate(inputs);

      expect(result.recommendations).toContain('Consider addressable system for large installations');
    });

    it('should recommend voltage drop compensation for long cable runs', () => {
      const inputs = {
        numberOfDevices: 20,
        deviceTypes: {
          detectors: 15,
          callPoints: 3,
          sounders: 4,
          beacons: 2,
          interfaces: 1
        },
        systemVoltage: 24,
        cableLength: 600, // Long cable run
        standbyTime: 72,
        alarmTime: 2,
        diversityFactor: 0.8
      };

      const result = FireAlarmCalculator.calculate(inputs);

      expect(result.recommendations).toContain('Consider voltage drop compensation or higher voltage system');
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          numberOfDevices: 0, // Invalid
          deviceTypes: { detectors: 5, callPoints: 2, sounders: 3, beacons: 2, interfaces: 1 },
          systemVoltage: 24,
          cableLength: 100,
          standbyTime: 72,
          alarmTime: 2,
          diversityFactor: 0.8
        },
        {
          numberOfDevices: 10,
          deviceTypes: { detectors: 5, callPoints: 2, sounders: 3, beacons: 2, interfaces: 1 },
          systemVoltage: 24,
          cableLength: 100,
          standbyTime: 12, // Too short
          alarmTime: 2,
          diversityFactor: 0.8
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => FireAlarmCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should calculate different battery capacities based on operating times', () => {
      const baseInputs = {
        numberOfDevices: 30,
        deviceTypes: {
          detectors: 20,
          callPoints: 5,
          sounders: 6,
          beacons: 4,
          interfaces: 2
        },
        systemVoltage: 24,
        cableLength: 150,
        alarmTime: 2,
        diversityFactor: 0.8
      };

      const standardBackup = FireAlarmCalculator.calculate({
        ...baseInputs,
        standbyTime: 72
      });

      const extendedBackup = FireAlarmCalculator.calculate({
        ...baseInputs,
        standbyTime: 168 // 7 days
      });

      expect(extendedBackup.batteryCapacityAh).toBeGreaterThan(standardBackup.batteryCapacityAh);
    });
  });
});

describe('CCTVCalculator', () => {
  describe('calculate', () => {
    it('should calculate CCTV system power requirements correctly', () => {
      const inputs = {
        cameras: {
          analog: 10,
          ipCameras: 15,
          ptzCameras: 3,
          nvr: 2,
          monitors: 4
        },
        cameraTypes: {
          analogPower: 5,    // 5W per analog camera
          ipPower: 8,        // 8W per IP camera
          ptzPower: 25,      // 25W per PTZ camera
          nvrPower: 50,      // 50W per NVR
          monitorPower: 80   // 80W per monitor
        },
        operatingHours: 24,
        cableLength: 100,
        voltage: 12,
        redundancy: true
      };

      const result = CCTVCalculator.calculate(inputs);

      expect(result.totalCameras).toBe(28);
      expect(result.totalPowerConsumption).toBeGreaterThan(0);
      expect(result.totalCurrent).toBeGreaterThan(0);
      expect(result.minCableCSA).toBeGreaterThan(0);
      expect(result.upsRating).toBeGreaterThan(0); // Redundancy enabled
      expect(result.batteryBackupTime).toBe(4);
      expect(result.dailyEnergyConsumption).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Use Category 6 or better cables for IP cameras');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate power with PTZ diversity factor', () => {
      const inputs = {
        cameras: {
          analog: 0,
          ipCameras: 0,
          ptzCameras: 10, // Only PTZ cameras
          nvr: 1,
          monitors: 1
        },
        cameraTypes: {
          analogPower: 5,
          ipPower: 8,
          ptzPower: 30,
          nvrPower: 50,
          monitorPower: 80
        },
        operatingHours: 12,
        cableLength: 50,
        voltage: 24,
        redundancy: false
      };

      const result = CCTVCalculator.calculate(inputs);

      // Power should be less than full PTZ power due to diversity factor
      const fullPtzPower = 10 * 30 + 50 + 80; // 430W
      expect(result.totalPowerConsumption).toBeLessThan(fullPtzPower);
    });

    it('should recommend IP camera considerations', () => {
      const inputs = {
        cameras: {
          analog: 2,
          ipCameras: 20, // Many IP cameras
          ptzCameras: 1,
          nvr: 1,
          monitors: 2
        },
        cameraTypes: {
          analogPower: 5,
          ipPower: 10,
          ptzPower: 30,
          nvrPower: 60,
          monitorPower: 100
        },
        operatingHours: 24,
        cableLength: 150,
        voltage: 48,
        redundancy: true
      };

      const result = CCTVCalculator.calculate(inputs);

      expect(result.recommendations).toContain('Ensure network infrastructure can handle IP camera bandwidth');
      expect(result.recommendations).toContain('Install UPS with network management capability');
    });

    it('should validate CCTV input parameters correctly', () => {
      const invalidInputs = [
        {
          cameras: { analog: 5, ipCameras: 5, ptzCameras: 2, nvr: 1, monitors: 2 },
          cameraTypes: { analogPower: 5, ipPower: 8, ptzPower: 25, nvrPower: 50, monitorPower: 80 },
          operatingHours: 25, // Invalid
          cableLength: 100,
          voltage: 12,
          redundancy: false
        },
        {
          cameras: { analog: 5, ipCameras: 5, ptzCameras: 2, nvr: 1, monitors: 2 },
          cameraTypes: { analogPower: 5, ipPower: 8, ptzPower: 25, nvrPower: 50, monitorPower: 80 },
          operatingHours: 12,
          cableLength: -50, // Invalid
          voltage: 12,
          redundancy: false
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => CCTVCalculator.calculate(inputs)).toThrow();
      });
    });
  });
});

describe('DataCenterCalculator', () => {
  describe('calculate', () => {
    it('should calculate data center requirements for N redundancy', () => {
      const inputs = {
        itLoad: 100,          // 100kW IT load
        redundancyLevel: 'N' as const,
        coolingRatio: 1.4,    // PUE of 1.4
        upsSizing: 1.5,       // 50% UPS oversizing
        batteryBackupTime: 15, // 15 minutes backup
        generatorBackup: true,
        phases: 3 as const,
        voltage: 400
      };

      const result = DataCenterCalculator.calculate(inputs);

      expect(result.itLoad).toBe(100);
      expect(result.totalFacilityPower).toBe(140); // 100kW × 1.4 PUE
      expect(result.upsCapacity).toBe(210); // 140kW × 1.5 sizing
      expect(result.generatorCapacity).toBe(175); // 140kW × 1.25
      expect(result.coolingLoad).toBe(40); // 140kW - 100kW
      expect(result.pue).toBe(1.4);
      expect(result.redundancyLevel).toBe('N');
      expect(result.recommendations).toContain('Install dual power feeds with automatic transfer switching');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate data center requirements for N+1 redundancy', () => {
      const inputs = {
        itLoad: 200,
        redundancyLevel: 'N+1' as const,
        coolingRatio: 1.3,
        upsSizing: 1.4,
        batteryBackupTime: 30,
        generatorBackup: true,
        phases: 3 as const,
        voltage: 400
      };

      const result = DataCenterCalculator.calculate(inputs);

      expect(result.redundancyLevel).toBe('N+1');
      // UPS capacity should be higher than N redundancy due to N+1 requirement
      expect(result.upsCapacity).toBeGreaterThan(result.totalFacilityPower * 1.4);
    });

    it('should calculate data center requirements for 2N redundancy', () => {
      const inputs = {
        itLoad: 500,
        redundancyLevel: '2N' as const,
        coolingRatio: 1.5,
        upsSizing: 1.3,
        batteryBackupTime: 45,
        generatorBackup: true,
        phases: 3 as const,
        voltage: 400
      };

      const result = DataCenterCalculator.calculate(inputs);

      expect(result.redundancyLevel).toBe('2N');
      expect(result.upsCapacity).toBe(result.totalFacilityPower * 1.3 * 2); // Full duplication
      expect(result.recommendations).toContain('Implement full electrical path redundancy');
    });

    it('should handle data center without generator backup', () => {
      const inputs = {
        itLoad: 50,
        redundancyLevel: 'N' as const,
        coolingRatio: 1.2,
        upsSizing: 1.6,
        batteryBackupTime: 60,
        generatorBackup: false,
        phases: 3 as const,
        voltage: 415
      };

      const result = DataCenterCalculator.calculate(inputs);

      expect(result.generatorCapacity).toBe(0);
      expect(result.recommendations).not.toContain('Test generator monthly under load conditions');
    });

    it('should validate data center input parameters correctly', () => {
      const invalidInputs = [
        {
          itLoad: -50, // Invalid
          redundancyLevel: 'N' as const,
          coolingRatio: 1.4,
          upsSizing: 1.5,
          batteryBackupTime: 15,
          generatorBackup: true,
          phases: 3 as const,
          voltage: 400
        },
        {
          itLoad: 100,
          redundancyLevel: 'N' as const,
          coolingRatio: 0.8, // Invalid - PUE cannot be less than 1
          upsSizing: 1.5,
          batteryBackupTime: 15,
          generatorBackup: true,
          phases: 3 as const,
          voltage: 400
        },
        {
          itLoad: 100,
          redundancyLevel: 'N' as const,
          coolingRatio: 1.4,
          upsSizing: 4.0, // Invalid - too high
          batteryBackupTime: 15,
          generatorBackup: true,
          phases: 3 as const,
          voltage: 400
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => DataCenterCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should calculate appropriate breaker ratings', () => {
      const smallDataCenter = {
        itLoad: 25,
        redundancyLevel: 'N' as const,
        coolingRatio: 1.3,
        upsSizing: 1.5,
        batteryBackupTime: 20,
        generatorBackup: false,
        phases: 3 as const,
        voltage: 400
      };

      const largeDataCenter = {
        ...smallDataCenter,
        itLoad: 1000 // Much larger load
      };

      const smallResult = DataCenterCalculator.calculate(smallDataCenter);
      const largeResult = DataCenterCalculator.calculate(largeDataCenter);

      expect(largeResult.mainBreakerRating).toBeGreaterThan(smallResult.mainBreakerRating);
      expect(smallResult.mainBreakerRating).toBeGreaterThan(0);
      expect(largeResult.mainBreakerRating).toBeGreaterThan(0);
    });

    it('should calculate battery capacity based on redundancy level', () => {
      const baseInputs = {
        itLoad: 150,
        coolingRatio: 1.4,
        upsSizing: 1.5,
        batteryBackupTime: 30,
        generatorBackup: true,
        phases: 3 as const,
        voltage: 400
      };

      const nResult = DataCenterCalculator.calculate({
        ...baseInputs,
        redundancyLevel: 'N' as const
      });

      const doubleNResult = DataCenterCalculator.calculate({
        ...baseInputs,
        redundancyLevel: '2N' as const
      });

      expect(doubleNResult.batteryCapacity).toBeGreaterThanOrEqual(nResult.batteryCapacity);
    });
  });
});
