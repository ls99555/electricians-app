/**
 * Unit Tests for Specialized Applications Calculations
 * Tests fire alarm, CCTV, and data center power calculations
 */

import {
  FireAlarmCalculator,
  CCTVCalculator,
  DataCenterCalculator,
  SwimmingPoolCalculator,
  CaravanMarinaCalculator,
  AgriculturalCalculator,
  TemporarySupplyCalculator,
  HazardousAreaCalculator
} from '../specialized/specialized-applications';

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

describe('SwimmingPoolCalculator', () => {
  describe('calculate', () => {
    test('should calculate swimming pool electrical requirements correctly', () => {
      const inputs: SwimmingPoolInputs = {
        poolData: {
          poolType: 'outdoor',
          volume: 50, // m³
          fillType: 'freshwater',
          treatmentType: 'chlorine',
          heatingRequired: true,
          lightingRequired: true
        },
        equipment: {
          pumps: [
            { power: 1.5, type: 'circulation', operatingHours: 8 },
            { power: 0.75, type: 'filtration', operatingHours: 6 }
          ],
          heaters: [
            { power: 12, type: 'electric', efficiency: 95 }
          ],
          lighting: [
            { voltage: 12, power: 50, quantity: 8, location: 'underwater' }
          ],
          accessories: [
            { name: 'skimmer', power: 200, location: 'zone2' },
            { name: 'auto_cover', power: 500, location: 'outside_zones' }
          ]
        },
        installation: {
          zone0Distance: 0,
          zone1Distance: 2,
          zone2Distance: 3.5,
          earthingRequired: true,
          equipotentialBonding: true,
          rcdProtection: '30mA'
        }
      };

      const result = SwimmingPoolCalculator.calculate(inputs);

      expect(result.powerCalculations.pumpLoad).toBe(2.25);
      expect(result.powerCalculations.heatingLoad).toBe(12);
      expect(result.powerCalculations.lightingLoad).toBe(0.4); // 8 x 50W = 400W = 0.4kW
      expect(result.powerCalculations.auxiliaryLoad).toBe(0.7); // 200W + 500W = 700W = 0.7kW
      expect(result.powerCalculations.totalLoad).toBe(15.35);
      expect(result.powerCalculations.diversityFactor).toBe(0.8); // Outdoor pool
      expect(result.powerCalculations.maximumDemand).toBeCloseTo(12.28, 2);

      expect(result.zoneClassification.zone0.maxVoltage).toBe(12);
      expect(result.zoneClassification.zone1.maxVoltage).toBe(12);
      expect(result.zoneClassification.zone0.ipRating).toBe('IPX8');

      expect(result.protectionRequirements.rcdRating).toBe('30mA');
      expect(result.protectionRequirements.equipotentialBonding).toContain('Metallic structures in contact with pool water');
      
      expect(result.compliance.bs7671Section702).toBe(true);
      expect(result.recommendations).toContain('Use only SELV equipment in Zones 0 and 1');
    });

    test('should handle saltwater pool with enhanced protection', () => {
      const inputs: SwimmingPoolInputs = {
        poolData: {
          poolType: 'outdoor',
          volume: 30,
          fillType: 'saltwater',
          treatmentType: 'salt',
          heatingRequired: false,
          lightingRequired: true
        },
        equipment: {
          pumps: [{ power: 1.0, type: 'circulation', operatingHours: 12 }],
          heaters: [],
          lighting: [{ voltage: 12, power: 30, quantity: 6, location: 'underwater' }],
          accessories: []
        },
        installation: {
          zone0Distance: 0,
          zone1Distance: 2,
          zone2Distance: 3.5,
          earthingRequired: true,
          equipotentialBonding: true,
          rcdProtection: '10mA'
        }
      };

      const result = SwimmingPoolCalculator.calculate(inputs);

      expect(result.protectionRequirements.rcdRating).toBe('10mA');
      expect(result.recommendations).toContain('Use marine-grade cables due to saltwater environment');
      expect(result.recommendations).toContain('Increase frequency of electrical inspections');
    });

    test('should recommend three-phase for high heating loads', () => {
      const inputs: SwimmingPoolInputs = {
        poolData: {
          poolType: 'indoor',
          volume: 100,
          fillType: 'freshwater',
          treatmentType: 'chlorine',
          heatingRequired: true,
          lightingRequired: true
        },
        equipment: {
          pumps: [{ power: 2.0, type: 'circulation', operatingHours: 24 }],
          heaters: [{ power: 15, type: 'electric', efficiency: 90 }],
          lighting: [{ voltage: 12, power: 40, quantity: 12, location: 'underwater' }],
          accessories: []
        },
        installation: {
          zone0Distance: 0,
          zone1Distance: 2,
          zone2Distance: 3.5,
          earthingRequired: true,
          equipotentialBonding: true,
          rcdProtection: '30mA'
        }
      };

      const result = SwimmingPoolCalculator.calculate(inputs);

      expect(result.powerCalculations.heatingLoad).toBe(15);
      expect(result.recommendations).toContain('Consider three-phase supply for high power heating loads');
    });
  });
});

describe('CaravanMarinaCalculator', () => {
  describe('calculate', () => {
    test('should calculate caravan park electrical requirements', () => {
      const inputs: CaravanMarinaInputs = {
        facilityType: 'caravan_park',
        numberOfPitches: 20,
        supplyData: {
          voltage: 230,
          phases: 1,
          frequency: 50,
          earthingSystem: 'TN-S'
        },
        pitchRequirements: {
          standard16A: 15,
          higherRated32A: 5,
          waterSupply: true,
          wasteConnection: true,
          tvAerial: false,
          internetConnection: false
        },
        environmentalFactors: {
          weatherExposure: 'exposed',
          saltWaterExposure: false,
          floodRisk: false,
          corrosiveEnvironment: false
        }
      };

      const result = CaravanMarinaCalculator.calculate(inputs);

      expect(result.loadCalculations.totalConnectedLoad).toBe(92); // (15 × 3.68) + (5 × 7.36)
      expect(result.loadCalculations.diversityFactors.overall).toBe(60);
      expect(result.loadCalculations.maximumDemand).toBe(result.loadCalculations.totalConnectedLoad * 0.6 * 0.85); // 85% coincidence for 20 pitches

      expect(result.distributionDesign.distributionMethod).toBe('Ring circuit with distribution pillars');
      expect(result.distributionDesign.pillarLocations).toBe(4); // 20 / 5

      expect(result.protectionRequirements.rcdProtection).toBe('30mA');
      expect(result.outletSpecification.ceeOutlets['16A'].ipRating).toBe('IP44 minimum');
      expect(result.environmentalConsiderations.ipRating).toBe('IP44');
    });

    test('should calculate marina electrical requirements with saltwater exposure', () => {
      const inputs: CaravanMarinaInputs = {
        facilityType: 'marina',
        numberOfPitches: 30,
        supplyData: {
          voltage: 400,
          phases: 3,
          frequency: 50,
          earthingSystem: 'TN-S'
        },
        pitchRequirements: {
          standard16A: 20,
          higherRated32A: 10,
          waterSupply: true,
          wasteConnection: true,
          tvAerial: true,
          internetConnection: true
        },
        marineSpecific: {
          shoreConnections: 30,
          boatSizes: [
            { length: 10, maxPower: 5, quantity: 15 },
            { length: 15, maxPower: 10, quantity: 15 }
          ],
          fuelPumps: 2,
          craneFacilities: true,
          workShops: true
        },
        environmentalFactors: {
          weatherExposure: 'severe',
          saltWaterExposure: true,
          floodRisk: true,
          corrosiveEnvironment: true
        }
      };

      const result = CaravanMarinaCalculator.calculate(inputs);

      expect(result.loadCalculations.diversityFactors.powerOutlets).toBe(50); // Marina has lower diversity
      expect(result.loadCalculations.diversityFactors.overall).toBe(45);

      expect(result.environmentalConsiderations.ipRating).toBe('IP65'); // Enhanced due to saltwater
      expect(result.environmentalConsiderations.corrosionProtection).toContain('Marine-grade materials');
      expect(result.environmentalConsiderations.earthingSpecial).toBe(true);
      expect(result.environmentalConsiderations.lightningProtection).toBe(true);

      expect(result.compliance.bs7671Section709).toBe(true); // Marina section
      expect(result.recommendations).toContain('Use marine-grade cables and fittings');
    });
  });
});

describe('AgriculturalCalculator', () => {
  describe('calculate', () => {
    test('should calculate agricultural installation requirements for dairy farm', () => {
      const inputs: AgriculturalInputs = {
        farmType: 'dairy',
        buildings: [
          {
            buildingType: 'milking_parlour',
            area: 200,
            animalAccess: true,
            washdownRequired: true,
            climateControl: true,
            specialRequirements: ['stainless steel equipment', 'washdown areas']
          },
          {
            buildingType: 'barn',
            area: 500,
            animalAccess: true,
            washdownRequired: false,
            climateControl: false,
            specialRequirements: []
          }
        ],
        electricalLoads: {
          lighting: {
            generalLighting: 10, // W/m²
            taskLighting: 2000, // W
            emergencyLighting: true,
            securityLighting: true
          },
          machinery: [
            { name: 'milking_machine', power: 5, startingMethod: 'direct', usage: 'intermittent', location: 'indoor' },
            { name: 'feed_mixer', power: 15, startingMethod: 'star_delta', usage: 'intermittent', location: 'indoor' }
          ],
          ventilation: {
            fans: 8,
            fanPower: 500, // W each
            climateControl: true,
            heatingLoad: 10 // kW
          },
          milkingEquipment: {
            milkingMachines: 2,
            coolingTanks: 8, // kW
            washingSystems: 3, // kW
            feedingSystems: true
          }
        },
        environmentalConditions: {
          dampness: 'high',
          dustLevel: 'medium',
          corrosiveSubstances: false,
          animalContact: true,
          mechanicalDamage: 'medium',
          temperatureRange: { min: -5, max: 35 }
        }
      };

      const result = AgriculturalCalculator.calculate(inputs);

      expect(result.loadAssessment.lightingLoad).toBe(9); // (700 × 10 / 1000) + (2000 / 1000)
      expect(result.loadAssessment.machineryLoad).toBe(20); // 5 + 15
      expect(result.loadAssessment.ventilationLoad).toBe(14); // (8 × 500 / 1000) + 10
      expect(result.loadAssessment.specialistLoad).toBe(11); // 8 + 3

      expect(result.loadAssessment.diversityFactors.machinery).toBe(75); // Higher for dairy
      expect(result.loadAssessment.diversityFactors.overall).toBe(80);

      expect(result.protectionRequirements.ipRatings.animalAreas).toBe('IP65');
      expect(result.protectionRequirements.ipRatings.washdownAreas).toBe('IP65');
      expect(result.protectionRequirements.rcdProtection.fixed_equipment).toBe('100mA');

      expect(result.earthingBonding.lightningProtection).toBe(true);
      expect(result.compliance.animalWelfareRegs).toBe(true);
      expect(result.recommendations).toContain('Use SELV systems where animals may contact electrical equipment');
    });

    test('should calculate for arable farm with seasonal machinery', () => {
      const inputs: AgriculturalInputs = {
        farmType: 'arable',
        buildings: [
          {
            buildingType: 'grain_store',
            area: 1000,
            animalAccess: false,
            washdownRequired: false,
            climateControl: false,
            specialRequirements: ['dust suppression', 'fire detection']
          }
        ],
        electricalLoads: {
          lighting: {
            generalLighting: 5,
            taskLighting: 500,
            emergencyLighting: false,
            securityLighting: true
          },
          machinery: [
            { name: 'grain_dryer', power: 25, startingMethod: 'soft_start', usage: 'seasonal', location: 'indoor' },
            { name: 'conveyor', power: 3, startingMethod: 'direct', usage: 'seasonal', location: 'indoor' }
          ],
          ventilation: {
            fans: 4,
            fanPower: 750,
            climateControl: false,
            heatingLoad: 0
          }
        },
        environmentalConditions: {
          dampness: 'low',
          dustLevel: 'high',
          corrosiveSubstances: false,
          animalContact: false,
          mechanicalDamage: 'high',
          temperatureRange: { min: -10, max: 40 }
        }
      };

      const result = AgriculturalCalculator.calculate(inputs);

      expect(result.loadAssessment.diversityFactors.machinery).toBe(50); // Lower for arable (seasonal)
      expect(result.protectionRequirements.rcdProtection.fireProtection).toBe(true); // High dust level
      expect(result.protectionRequirements.ipRatings.generalAreas).toBe('IP65'); // High dust adjusted IP rating

      expect(result.specialConsiderations.firePrevention).toContain('Enhanced fire detection in hay/straw storage areas');
    });
  });
});

describe('TemporarySupplyCalculator', () => {
  describe('calculate', () => {
    test('should calculate construction site temporary supply', () => {
      const inputs: TemporarySupplyInputs = {
        supplyType: 'construction_site',
        duration: 'less_than_3_months',
        supplyRequirements: {
          voltage: 110,
          phases: 1,
          maxDemand: 50,
          continuousOperation: false
        },
        constructionSite: {
          siteArea: 2000, // m²
          buildingHeight: 20, // m
          machinery: [
            { name: 'tower_crane', power: 25, quantity: 1, mobile: false },
            { name: 'concrete_pump', power: 15, quantity: 1, mobile: true },
            { name: 'hand_tools', power: 2, quantity: 10, mobile: true }
          ],
          accommodation: {
            offices: 2,
            welfare: 1,
            storage: 1
          },
          lighting: {
            siteArea: 5, // W/m²
            roadways: 20, // W/m
            workAreas: 15, // W/m²
            security: true
          }
        },
        environmentalConditions: {
          outdoor: true,
          weatherExposed: true,
          mechanicalDamage: 'high',
          publicAccess: false,
          specialHazards: ['overhead_cranes', 'excavations']
        },
        distribution: {
          assemblies: 3,
          outlets: {
            '16A_sockets': 20,
            '32A_sockets': 10,
            '63A_sockets': 2,
            specialOutlets: 5
          },
          cableRoutes: {
            overhead: true,
            underground: false,
            surfaceCables: true,
            temporaryStructures: true
          }
        }
      };

      const result = TemporarySupplyCalculator.calculate(inputs);

      // Construction site connected load calculation
      const expectedMachineryLoad = 25 + 15 + (2 * 10); // 60 kW
      const expectedAccommodationLoad = (2 * 2) + (1 * 3) + (1 * 0.5); // 7.5 kW
      const expectedLightingLoad = (5 * 2000 / 1000) + (15 * 2000 / 1000); // 40 kW
      const expectedTotalLoad = expectedMachineryLoad + expectedAccommodationLoad + expectedLightingLoad; // 107.5 kW

      expect(result.supplyDesign.loadCalculation.connectedLoad).toBeCloseTo(expectedTotalLoad, 1);
      expect(result.supplyDesign.loadCalculation.diversityFactor).toBeCloseTo(55, 1); // 50% * 110% for short-term
      expect(result.supplyDesign.incomingSupply.voltage).toBe(110);

      expect(result.distributionSystem.assemblies).toHaveLength(7); // Ceil(37 outlets / 8)
      expect(result.distributionSystem.assemblies[0].ipRating).toBe('IP65'); // Outdoor

      expect(result.protectionMeasures.rcdProtection.incomingRCD).toBe('Type B 30mA RCD for 110V supplies');
      expect(result.protectionMeasures.rcdProtection.additionalRCDs).toContain('10mA RCD for hand tools');

      expect(result.safetyRequirements.inspectionTesting.periodicInspection).toBe('Every 3 months for temporary installations');
      expect(result.recommendations).toContain('Use 110V CTE supplies for hand tools where possible');
    });

    test('should calculate exhibition temporary supply', () => {
      const inputs: TemporarySupplyInputs = {
        supplyType: 'exhibition',
        duration: '3_to_12_months',
        supplyRequirements: {
          voltage: 230,
          phases: 3,
          maxDemand: 100,
          continuousOperation: true
        },
        environmentalConditions: {
          outdoor: false,
          weatherExposed: false,
          mechanicalDamage: 'low',
          publicAccess: true,
          specialHazards: []
        },
        distribution: {
          assemblies: 5,
          outlets: {
            '16A_sockets': 30,
            '32A_sockets': 15,
            '63A_sockets': 0,
            specialOutlets: 0
          },
          cableRoutes: {
            overhead: false,
            underground: true,
            surfaceCables: false,
            temporaryStructures: false
          }
        }
      };

      const result = TemporarySupplyCalculator.calculate(inputs);

      expect(result.supplyDesign.loadCalculation.diversityFactor).toBe(80); // Exhibition has higher diversity
      expect(result.distributionSystem.assemblies[0].ipRating).toBe('IP44'); // Indoor
      expect(result.protectionMeasures.rcdProtection.incomingRCD).toBe('Type A 30mA RCD for 230V supplies');
      expect(result.recommendations).toContain('Install additional security measures to prevent public access');
    });
  });
});

describe('HazardousAreaCalculator', () => {
  describe('calculate', () => {
    test('should calculate Zone 1 gas area requirements', () => {
      const inputs: HazardousAreaInputs = {
        areaClassification: {
          zone: '1',
          substanceType: 'gas_vapour',
          temperatureClass: 'T3',
          gasGroup: 'IIA',
          ignitionTemperature: 280
        },
        installationDetails: {
          equipmentRequired: [
            { type: 'lighting', power: 100, voltage: 230, operatingTemp: 60, quantity: 10 },
            { type: 'power', power: 5000, voltage: 400, operatingTemp: 80, quantity: 2 }
          ],
          cableRequirements: {
            totalLength: 500,
            routes: 'armoured',
            terminationMethod: 'certified_glands'
          },
          earthingRequirements: {
            earthingRequired: true,
            bondingRequired: true,
            antistaticRequirements: false
          }
        },
        environmentalFactors: {
          ambientTemperature: { min: -10, max: 40 },
          humidity: 80,
          corrosiveEnvironment: false,
          mechanicalStresses: true,
          ventilationType: 'natural'
        }
      };

      const result = HazardousAreaCalculator.calculate(inputs);

      expect(result.equipmentSpecification.protectionConcept).toBe('Ex d (flameproof), Ex e (increased safety), Ex ia/ib');
      expect(result.equipmentSpecification.equipmentCategories.category).toBe('Category 2G (high protection)');
      expect(result.equipmentSpecification.equipmentCategories.suitableFor).toContain('Zone 1');
      expect(result.equipmentSpecification.equipmentCategories.suitableFor).toContain('Zone 2');

      expect(result.cableAndWiring.cableTypes.powerCables).toContain('PVC/SWA/PVC cables for general use');
      expect(result.cableAndWiring.installationMethods.acceptableMethods).toContain('Cable tray installation with appropriate glands');
      expect(result.cableAndWiring.installationMethods.prohibitedMethods).toContain('Non-certified cable entry systems');

      expect(result.earthingAndBonding.resistanceRequirements.earthing).toBe(1);
      expect(result.earthingAndBonding.resistanceRequirements.bonding).toBe(0.1);

      expect(result.inspectionTesting.periodicInspection.frequency).toBe('Annual inspection minimum, more frequent for harsh conditions');
      expect(result.inspectionTesting.competencyRequirements).toContain('CompEx or equivalent certification');

      expect(result.complianceStandards.bsEn60079Series).toBe(true);
      expect(result.complianceStandards.atexDirectives).toBe(true);
      expect(result.recommendations).toContain('All work must be carried out by CompEx certified personnel');
    });

    test('should calculate Zone 0 intrinsic safety requirements', () => {
      const inputs: HazardousAreaInputs = {
        areaClassification: {
          zone: '0',
          substanceType: 'gas_vapour',
          temperatureClass: 'T4',
          gasGroup: 'IIC',
          ignitionTemperature: 135
        },
        installationDetails: {
          equipmentRequired: [
            { type: 'instrumentation', power: 10, voltage: 24, operatingTemp: 40, quantity: 5 }
          ],
          cableRequirements: {
            totalLength: 100,
            routes: 'conduit',
            terminationMethod: 'safety_barriers'
          },
          earthingRequirements: {
            earthingRequired: true,
            bondingRequired: true,
            antistaticRequirements: true
          }
        },
        environmentalFactors: {
          ambientTemperature: { min: 0, max: 50 },
          humidity: 90,
          corrosiveEnvironment: true,
          mechanicalStresses: false,
          ventilationType: 'forced'
        }
      };

      const result = HazardousAreaCalculator.calculate(inputs);

      expect(result.equipmentSpecification.protectionConcept).toBe('Ex ia (intrinsic safety category "ia")');
      expect(result.equipmentSpecification.equipmentCategories.category).toBe('Category 1G (very high protection)');
      expect(result.equipmentSpecification.equipmentCategories.suitableFor).toContain('Zone 0');

      expect(result.cableAndWiring.cableTypes.instrumentationCables).toContain('Special barriers required for IS circuits');
      expect(result.earthingAndBonding.resistanceRequirements.antistatic).toBe(1000000);
      expect(result.earthingAndBonding.testingRequirements).toContain('Antistatic discharge testing');
    });

    test('should calculate Zone 22 dust area requirements', () => {
      const inputs: HazardousAreaInputs = {
        areaClassification: {
          zone: '22',
          substanceType: 'combustible_dust',
          temperatureClass: 'T1',
          gasGroup: 'IIIA',
          ignitionTemperature: 450
        },
        installationDetails: {
          equipmentRequired: [
            { type: 'lighting', power: 200, voltage: 230, operatingTemp: 70, quantity: 20 },
            { type: 'power', power: 10000, voltage: 400, operatingTemp: 90, quantity: 5 }
          ],
          cableRequirements: {
            totalLength: 1000,
            routes: 'direct_buried',
            terminationMethod: 'certified_glands'
          },
          earthingRequirements: {
            earthingRequired: true,
            bondingRequired: true,
            antistaticRequirements: true
          }
        },
        environmentalFactors: {
          ambientTemperature: { min: -20, max: 60 },
          humidity: 60,
          corrosiveEnvironment: false,
          mechanicalStresses: true,
          ventilationType: 'pressurized'
        }
      };

      const result = HazardousAreaCalculator.calculate(inputs);

      expect(result.equipmentSpecification.protectionConcept).toBe('Ex t or general equipment for dust');
      expect(result.equipmentSpecification.equipmentCategories.category).toBe('Category 3D (normal protection)');
      expect(result.equipmentSpecification.equipmentCategories.suitableFor).toEqual(['Zone 22']);
    });
  });
});

import type {
  SwimmingPoolInputs,
  CaravanMarinaInputs,
  AgriculturalInputs,
  TemporarySupplyInputs,
  HazardousAreaInputs
} from '../../types';
