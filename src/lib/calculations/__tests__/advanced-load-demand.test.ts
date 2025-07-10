/**
 * Advanced Load & Demand Calculations Test Suite
 * Comprehensive tests for lighting, water heating, space heating, air conditioning, and total installation load calculations
 * 
 * Tests cover:
 * - Lighting Load Calculator with diversity
 * - Water Heating Load Assessment
 * - Space Heating Load Calculator
 * - Air Conditioning Load Assessment
 * - Total Installation Load Calculator
 * - UK regulation compliance (BS 7671)
 * - Real-world scenarios and edge cases
 */

import {
  LightingLoadCalculator,
  WaterHeatingLoadAssessment,
  SpaceHeatingLoadCalculator,
  AirConditioningLoadAssessment,
  TotalInstallationLoadCalculator
} from '../advanced-load-demand';

describe('Advanced Load & Demand Calculations', () => {
  describe('LightingLoadCalculator', () => {
    test('should calculate domestic lighting load correctly', () => {
      const inputs = {
        rooms: [
          {
            name: 'Living Room',
            area: 25,
            roomType: 'living_room' as const,
            ceilingHeight: 2.4
          },
          {
            name: 'Kitchen',
            area: 15,
            roomType: 'kitchen' as const,
            ceilingHeight: 2.4
          }
        ],
        lightingType: 'led' as const,
        controlSystem: 'manual' as const,
        installationType: 'domestic' as const
      };

      const result = LightingLoadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.totalDemandLoad).toBeLessThanOrEqual(result.totalConnectedLoad);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.diversityFactor).toBeLessThanOrEqual(1);
      expect(result.roomBreakdown).toHaveLength(2);
      expect(result.roomBreakdown[0].room).toBe('Living Room');
      expect(result.roomBreakdown[1].room).toBe('Kitchen');
      expect(result.regulation).toContain('BS EN 12464-1');
    });

    test('should calculate office lighting load with higher lux requirements', () => {
      const inputs = {
        rooms: [
          {
            name: 'Open Office',
            area: 100,
            roomType: 'office' as const,
            ceilingHeight: 3.0
          }
        ],
        lightingType: 'led' as const,
        controlSystem: 'occupancy_sensor' as const,
        installationType: 'commercial' as const
      };

      const result = LightingLoadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.roomBreakdown[0].luxLevel).toBe(500); // Office standard
      expect(result.diversityFactor).toBeLessThan(0.9); // Occupancy sensor reduces diversity
      expect(result.recommendations[0]).toContain('Total lighting demand');
    });

    test('should handle custom lux levels and utilization factors', () => {
      const inputs = {
        rooms: [
          {
            name: 'Laboratory',
            area: 50,
            roomType: 'laboratory' as const,
            ceilingHeight: 3.2,
            customLuxLevel: 1000,
            utilizationFactor: 0.9,
            maintenanceFactor: 0.85
          }
        ],
        lightingType: 'fluorescent' as const,
        controlSystem: 'smart_control' as const,
        installationType: 'industrial' as const
      };

      const result = LightingLoadCalculator.calculate(inputs);

      expect(result.roomBreakdown[0].luxLevel).toBe(1000);
      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.diversityFactor).toBeLessThan(0.8); // Smart control reduces diversity
    });

    test('should throw error for invalid inputs', () => {
      expect(() => {
        LightingLoadCalculator.calculate({
          rooms: [],
          lightingType: 'led' as const,
          controlSystem: 'manual' as const,
          installationType: 'domestic' as const
        });
      }).toThrow('At least one room must be specified');

      expect(() => {
        LightingLoadCalculator.calculate({
          rooms: [{ name: '', area: -5, roomType: 'office' as const, ceilingHeight: 2.4 }],
          lightingType: 'led' as const,
          controlSystem: 'manual' as const,
          installationType: 'domestic' as const
        });
      }).toThrow('Invalid room parameters');
    });
  });

  describe('WaterHeatingLoadAssessment', () => {
    test('should calculate domestic water heating load correctly', () => {
      const inputs = {
        installationType: 'domestic' as const,
        heatingMethod: 'storage' as const,
        heaterDetails: [
          {
            type: 'electric_immersion' as const,
            capacity: 200,
            power: 3000,
            quantity: 1
          }
        ],
        usage: 'domestic_medium' as const,
        peakDemandTime: 2,
        recoveryTime: 4
      };

      const result = WaterHeatingLoadAssessment.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(3000);
      expect(result.totalDemandLoad).toBeGreaterThan(0);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.heaterBreakdown).toHaveLength(1);
      expect(result.peakDemandCurrent).toBeCloseTo(result.totalDemandLoad / 230, 1);
      expect(result.regulation).toContain('BS 7671');
    });

    test('should calculate commercial water heating with multiple units', () => {
      const inputs = {
        installationType: 'commercial' as const,
        heatingMethod: 'instantaneous' as const,
        heaterDetails: [
          {
            type: 'instantaneous_electric' as const,
            capacity: 50,
            power: 12000,
            quantity: 3
          }
        ],
        usage: 'commercial_restaurant' as const,
        peakDemandTime: 4,
        recoveryTime: 1
      };

      const result = WaterHeatingLoadAssessment.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(36000);
      expect(result.diversityFactor).toBeLessThan(1.0); // Commercial has diversity
      expect(result.recommendations[0]).toContain('Total water heating demand');
    });

    test('should handle heat pump water heating', () => {
      const inputs = {
        installationType: 'domestic' as const,
        heatingMethod: 'heat_pump' as const,
        heaterDetails: [
          {
            type: 'heat_pump_water' as const,
            capacity: 300,
            power: 2500,
            quantity: 1,
            simultaneousFactor: 0.8
          }
        ],
        usage: 'domestic_high' as const,
        peakDemandTime: 3,
        recoveryTime: 6
      };

      const result = WaterHeatingLoadAssessment.calculate(inputs);

      expect(result.heaterBreakdown[0].simultaneousFactor).toBe(0.8);
      expect(result.totalDemandLoad).toBeLessThan(result.totalConnectedLoad);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => {
        WaterHeatingLoadAssessment.calculate({
          installationType: 'domestic' as const,
          heatingMethod: 'storage' as const,
          heaterDetails: [],
          usage: 'domestic_medium' as const,
          peakDemandTime: 2,
          recoveryTime: 4
        });
      }).toThrow('At least one water heater must be specified');
    });
  });

  describe('SpaceHeatingLoadCalculator', () => {
    test('should calculate domestic space heating load correctly', () => {
      const inputs = {
        rooms: [
          {
            name: 'Living Room',
            area: 25,
            volume: 60,
            roomType: 'living_room' as const,
            heatingMethod: 'electric_radiator' as const,
            power: 2000,
            thermostatControl: true,
            zoneControl: false,
            occupancySchedule: 'evening_only' as const
          },
          {
            name: 'Bedroom',
            area: 15,
            volume: 36,
            roomType: 'bedroom' as const,
            heatingMethod: 'panel_heater' as const,
            power: 1000,
            thermostatControl: true,
            zoneControl: true,
            occupancySchedule: 'evening_only' as const
          }
        ],
        buildingType: 'residential' as const,
        controlSystem: 'programmable' as const,
        installationType: 'domestic' as const
      };

      const result = SpaceHeatingLoadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(3000);
      expect(result.totalDemandLoad).toBeLessThan(result.totalConnectedLoad);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.simultaneityFactor).toBeGreaterThan(0);
      expect(result.roomBreakdown).toHaveLength(2);
      expect(result.regulation).toContain('BS 7671');
    });

    test('should calculate commercial space heating with zone control', () => {
      const inputs = {
        rooms: [
          {
            name: 'Office Area',
            area: 100,
            volume: 300,
            roomType: 'office' as const,
            heatingMethod: 'underfloor_heating' as const,
            power: 5000,
            thermostatControl: true,
            zoneControl: true,
            occupancySchedule: 'office_hours' as const
          }
        ],
        buildingType: 'office' as const,
        controlSystem: 'bms' as const,
        installationType: 'commercial' as const
      };

      const result = SpaceHeatingLoadCalculator.calculate(inputs);

      expect(result.simultaneityFactor).toBeLessThan(0.8); // Office hours and BMS reduce simultaneity
      expect(result.recommendations[0]).toContain('Total space heating demand');
    });

    test('should handle industrial heating loads', () => {
      const inputs = {
        rooms: [
          {
            name: 'Workshop',
            area: 200,
            volume: 800,
            roomType: 'workshop' as const,
            heatingMethod: 'radiant_heating' as const,
            power: 15000,
            thermostatControl: false,
            zoneControl: false,
            occupancySchedule: 'continuous' as const
          }
        ],
        buildingType: 'industrial' as const,
        controlSystem: 'manual' as const,
        installationType: 'industrial' as const
      };

      const result = SpaceHeatingLoadCalculator.calculate(inputs);

      expect(result.simultaneityFactor).toBeGreaterThan(0.8); // Continuous operation
      expect(result.peakDemandCurrent).toBeGreaterThan(30);
    });
  });

  describe('AirConditioningLoadAssessment', () => {
    test('should calculate office air conditioning load correctly', () => {
      const inputs = {
        systems: [
          {
            name: 'Main Office AC',
            type: 'split_system' as const,
            coolingCapacity: 8000,
            heatingCapacity: 6000,
            area: 50,
            roomType: 'office' as const,
            operatingHours: 8
          }
        ],
        buildingType: 'office' as const,
        controlSystem: 'thermostat' as const,
        installationType: 'commercial' as const
      };

      const result = AirConditioningLoadAssessment.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(8000); // Uses higher of cooling/heating
      expect(result.totalDemandLoad).toBeLessThan(result.totalConnectedLoad);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.systemBreakdown).toHaveLength(1);
      expect(result.regulation).toContain('BS 7671');
    });

    test('should calculate multiple VRV systems', () => {
      const inputs = {
        systems: [
          {
            name: 'Floor 1 VRV',
            type: 'vrv_vrf' as const,
            coolingCapacity: 20000,
            area: 200,
            roomType: 'office' as const,
            operatingHours: 10
          },
          {
            name: 'Floor 2 VRV',
            type: 'vrv_vrf' as const,
            coolingCapacity: 18000,
            area: 180,
            roomType: 'office' as const,
            operatingHours: 10
          }
        ],
        buildingType: 'office' as const,
        controlSystem: 'bms' as const,
        installationType: 'commercial' as const
      };

      const result = AirConditioningLoadAssessment.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(38000);
      expect(result.diversityFactor).toBeLessThan(0.8); // BMS and VRV reduce diversity
      expect(result.systemBreakdown).toHaveLength(2);
    });

    test('should handle server room with continuous operation', () => {
      const inputs = {
        systems: [
          {
            name: 'Server Room AC',
            type: 'central_system' as const,
            coolingCapacity: 15000,
            area: 30,
            roomType: 'server_room' as const,
            operatingHours: 24,
            simultaneousFactor: 1.0
          }
        ],
        buildingType: 'office' as const,
        controlSystem: 'smart_control' as const,
        installationType: 'commercial' as const
      };

      const result = AirConditioningLoadAssessment.calculate(inputs);

      expect(result.systemBreakdown[0].simultaneousFactor).toBe(1.0);
      expect(result.totalDemandLoad).toBeCloseTo(result.totalConnectedLoad * result.diversityFactor, 0);
    });
  });

  describe('TotalInstallationLoadCalculator', () => {
    test('should calculate complete domestic installation', () => {
      const inputs = {
        lighting: {
          rooms: [
            { name: 'Living Room', area: 25, roomType: 'living_room' as const, ceilingHeight: 2.4 }
          ],
          lightingType: 'led' as const,
          controlSystem: 'manual' as const,
          installationType: 'domestic' as const
        },
        heating: {
          rooms: [
            {
              name: 'Living Room',
              area: 25,
              volume: 60,
              roomType: 'living_room' as const,
              heatingMethod: 'electric_radiator' as const,
              power: 2000,
              thermostatControl: true,
              zoneControl: false,
              occupancySchedule: 'evening_only' as const
            }
          ],
          buildingType: 'residential' as const,
          controlSystem: 'thermostat' as const,
          installationType: 'domestic' as const
        },
        waterHeating: {
          installationType: 'domestic' as const,
          heatingMethod: 'storage' as const,
          heaterDetails: [
            { type: 'electric_immersion' as const, capacity: 200, power: 3000, quantity: 1 }
          ],
          usage: 'domestic_medium' as const,
          peakDemandTime: 2,
          recoveryTime: 4
        },
        airConditioning: {
          systems: [
            {
              name: 'Living Room AC',
              type: 'split_system' as const,
              coolingCapacity: 3000,
              area: 25,
              roomType: 'living_room' as const,
              operatingHours: 6
            }
          ],
          buildingType: 'residential' as const,
          controlSystem: 'manual' as const,
          installationType: 'domestic' as const
        },
        socketOutlets: 20,
        cooking: [
          { appliance: 'Electric Oven', rating: 6000, quantity: 1 }
        ],
        specialLoads: [
          { description: 'Security System', power: 200, diversityFactor: 1.0 }
        ],
        installationType: 'domestic' as const
      };

      const result = TotalInstallationLoadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.totalDemandLoad).toBeLessThan(result.totalConnectedLoad);
      expect(result.overallDiversityFactor).toBeGreaterThan(0);
      expect(result.overallDiversityFactor).toBeLessThan(1);
      expect(result.loadBreakdown).toHaveLength(7);
      expect(result.currentBreakdown.singlePhase).toBeGreaterThan(0);
      expect(result.currentBreakdown.threePhase).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS 7671');
    });

    test('should handle high-demand commercial installation', () => {
      const inputs = {
        lighting: {
          rooms: [
            { name: 'Office Floor', area: 500, roomType: 'office' as const, ceilingHeight: 3.0 }
          ],
          lightingType: 'led' as const,
          controlSystem: 'smart_control' as const,
          installationType: 'commercial' as const
        },
        heating: {
          rooms: [
            {
              name: 'Office Floor',
              area: 500,
              volume: 1500,
              roomType: 'office' as const,
              heatingMethod: 'underfloor_heating' as const,
              power: 25000,
              thermostatControl: true,
              zoneControl: true,
              occupancySchedule: 'office_hours' as const
            }
          ],
          buildingType: 'office' as const,
          controlSystem: 'bms' as const,
          installationType: 'commercial' as const
        },
        waterHeating: {
          installationType: 'commercial' as const,
          heatingMethod: 'instantaneous' as const,
          heaterDetails: [
            { type: 'instantaneous_electric' as const, capacity: 50, power: 12000, quantity: 2 }
          ],
          usage: 'commercial_office' as const,
          peakDemandTime: 4,
          recoveryTime: 1
        },
        airConditioning: {
          systems: [
            {
              name: 'Main VRV',
              type: 'vrv_vrf' as const,
              coolingCapacity: 40000,
              area: 500,
              roomType: 'office' as const,
              operatingHours: 10
            }
          ],
          buildingType: 'office' as const,
          controlSystem: 'bms' as const,
          installationType: 'commercial' as const
        },
        socketOutlets: 100,
        cooking: [],
        specialLoads: [
          { description: 'IT Equipment', power: 15000, diversityFactor: 0.8 }
        ],
        installationType: 'commercial' as const
      };

      const result = TotalInstallationLoadCalculator.calculate(inputs);

      expect(result.totalDemandLoad).toBeGreaterThan(50000);
      expect(result.currentBreakdown.singlePhase).toBeGreaterThan(100);
      expect(result.recommendations[3]).toContain('Three-phase supply recommended');
    });

    test('should throw error for invalid installation type', () => {
      expect(() => {
        TotalInstallationLoadCalculator.calculate({
          lighting: null as any,
          heating: null as any,
          waterHeating: null as any,
          airConditioning: null as any,
          socketOutlets: 10,
          cooking: [],
          specialLoads: [],
          installationType: null as any
        });
      }).toThrow('Installation type must be specified');
    });
  });

  describe('Real-world scenarios', () => {
    test('should handle typical 3-bedroom house installation', () => {
      const lightingInputs = {
        rooms: [
          { name: 'Living Room', area: 30, roomType: 'living_room' as const, ceilingHeight: 2.4 },
          { name: 'Kitchen', area: 15, roomType: 'kitchen' as const, ceilingHeight: 2.4 },
          { name: 'Bedroom 1', area: 18, roomType: 'bedroom' as const, ceilingHeight: 2.4 },
          { name: 'Bedroom 2', area: 15, roomType: 'bedroom' as const, ceilingHeight: 2.4 },
          { name: 'Bedroom 3', area: 12, roomType: 'bedroom' as const, ceilingHeight: 2.4 },
          { name: 'Bathroom', area: 8, roomType: 'bathroom' as const, ceilingHeight: 2.4 },
          { name: 'Hallway', area: 10, roomType: 'hallway' as const, ceilingHeight: 2.4 }
        ],
        lightingType: 'led' as const,
        controlSystem: 'manual' as const,
        installationType: 'domestic' as const
      };

      const result = LightingLoadCalculator.calculate(lightingInputs);

      expect(result.roomBreakdown).toHaveLength(7);
      expect(result.totalConnectedLoad).toBeGreaterThan(500);
      expect(result.totalConnectedLoad).toBeLessThan(5000);
      expect(result.diversityFactor).toBeCloseTo(0.9, 1);
    });

    test('should handle small office building', () => {
      const waterHeatingInputs = {
        installationType: 'commercial' as const,
        heatingMethod: 'storage' as const,
        heaterDetails: [
          { type: 'electric_storage' as const, capacity: 500, power: 9000, quantity: 1 }
        ],
        usage: 'commercial_office' as const,
        peakDemandTime: 3,
        recoveryTime: 2
      };

      const result = WaterHeatingLoadAssessment.calculate(waterHeatingInputs);

      expect(result.totalConnectedLoad).toBe(9000);
      expect(result.diversityFactor).toBeLessThan(1.0);
      expect(result.peakDemandCurrent).toBeLessThan(40);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle zero area rooms gracefully', () => {
      expect(() => {
        LightingLoadCalculator.calculate({
          rooms: [{ name: 'Invalid Room', area: 0, roomType: 'office' as const, ceilingHeight: 2.4 }],
          lightingType: 'led' as const,
          controlSystem: 'manual' as const,
          installationType: 'commercial' as const
        });
      }).toThrow('Invalid room parameters');
    });

    test('should handle negative power values', () => {
      expect(() => {
        SpaceHeatingLoadCalculator.calculate({
          rooms: [
            {
              name: 'Invalid Room',
              area: 20,
              volume: 50,
              roomType: 'office' as const,
              heatingMethod: 'electric_radiator' as const,
              power: -1000,
              thermostatControl: true,
              zoneControl: false,
              occupancySchedule: 'office_hours' as const
            }
          ],
          buildingType: 'office' as const,
          controlSystem: 'manual' as const,
          installationType: 'commercial' as const
        });
      }).toThrow('Invalid room parameters');
    });

    test('should handle minimum diversity factors', () => {
      const inputs = {
        systems: [
          {
            name: 'Test AC',
            type: 'portable' as const,
            coolingCapacity: 1000,
            area: 10,
            roomType: 'bedroom' as const,
            operatingHours: 24,
            simultaneousFactor: 0.1
          }
        ],
        buildingType: 'residential' as const,
        controlSystem: 'smart_control' as const,
        installationType: 'domestic' as const
      };

      const result = AirConditioningLoadAssessment.calculate(inputs);

      expect(result.diversityFactor).toBeGreaterThanOrEqual(0.5); // Minimum 50%
      expect(result.systemBreakdown[0].simultaneousFactor).toBeGreaterThanOrEqual(0.1); // Input value should be respected
    });
  });
});
