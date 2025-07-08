/**
 * Unit Tests for Capacity Calculations
 * Tests service head, distribution board, transformer, and circuit capacity calculations
 */

import {
  ServiceHeadCalculator,
  DistributionBoardCalculator,
  TransformerCalculator,
  CircuitCapacityCalculator
} from '../capacity-calculations';

describe('ServiceHeadCalculator', () => {
  describe('calculate', () => {
    it('should calculate service head capacity for domestic installation', () => {
      const inputs = {
        installationType: 'domestic' as const,
        totalConnectedLoad: 30, // 30kW total
        diversityFactors: {
          lighting: 0.6,
          heating: 0.8,
          power: 0.4,
          motors: 0,
          specialLoads: 0
        },
        simultaneityFactor: 0.7,
        futureExpansion: 20, // 20% future expansion
        phases: 1 as const,
        voltage: 230
      };

      const result = ServiceHeadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(30);
      expect(result.maximumDemand).toBeGreaterThan(0);
      expect(result.designMaximumDemand).toBeGreaterThan(result.maximumDemand);
      expect(result.designCurrent).toBeGreaterThan(0);
      expect(result.serviceHeadCapacity).toBeGreaterThanOrEqual(result.designCurrent * 1.25);
      expect(result.utilizationFactor).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Confirm service head capacity with DNO before installation');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate service head capacity for three-phase commercial installation', () => {
      const inputs = {
        installationType: 'commercial' as const,
        totalConnectedLoad: 150, // 150kW total
        diversityFactors: {
          lighting: 0.8,
          heating: 0.9,
          power: 0.6,
          motors: 0.7,
          specialLoads: 0.5
        },
        simultaneityFactor: 0.8,
        futureExpansion: 25,
        phases: 3 as const,
        voltage: 400
      };

      const result = ServiceHeadCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(150);
      expect(result.serviceHeadCapacity).toBeGreaterThan(100); // Should be commercial rating
      expect(result.recommendations).toContain('Consider installing sub-meters for load monitoring');
    });

    it('should warn about high utilization', () => {
      const inputs = {
        installationType: 'domestic' as const,
        totalConnectedLoad: 25,
        diversityFactors: {
          lighting: 0.9,
          heating: 1.0,
          power: 0.8,
          motors: 0,
          specialLoads: 0
        },
        simultaneityFactor: 0.95, // High simultaneity
        futureExpansion: 30, // High expansion
        phases: 1 as const,
        voltage: 230
      };

      const result = ServiceHeadCalculator.calculate(inputs);

      if (result.utilizationFactor > 80) {
        expect(result.recommendations).toContain('Service head utilization is high - consider larger capacity');
      }
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          installationType: 'domestic' as const,
          totalConnectedLoad: -10, // Invalid
          diversityFactors: { lighting: 0.6, heating: 0.8, power: 0.4, motors: 0, specialLoads: 0 },
          simultaneityFactor: 0.7,
          futureExpansion: 20,
          phases: 1 as const,
          voltage: 230
        },
        {
          installationType: 'domestic' as const,
          totalConnectedLoad: 30,
          diversityFactors: { lighting: 0.6, heating: 0.8, power: 0.4, motors: 0, specialLoads: 0 },
          simultaneityFactor: 1.5, // Invalid
          futureExpansion: 20,
          phases: 1 as const,
          voltage: 230
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => ServiceHeadCalculator.calculate(inputs)).toThrow();
      });
    });
  });
});

describe('DistributionBoardCalculator', () => {
  describe('calculate', () => {
    it('should calculate distribution board requirements correctly', () => {
      const inputs = {
        circuits: [
          { type: 'lighting' as const, load: 2000, diversity: 0.6, protection: 6 },
          { type: 'power' as const, load: 3000, diversity: 0.4, protection: 16 },
          { type: 'heating' as const, load: 3000, diversity: 0.8, protection: 16 },
          { type: 'motor' as const, load: 2200, diversity: 0.9, protection: 10 },
          { type: 'special' as const, load: 1500, diversity: 1.0, protection: 10 }
        ],
        phases: 3 as const,
        voltage: 400,
        boardType: 'RCBO' as const,
        spareWays: 6
      };

      const result = DistributionBoardCalculator.calculate(inputs);

      expect(result.totalConnectedLoad).toBe(11700); // Sum of all loads
      expect(result.totalDemand).toBeLessThan(result.totalConnectedLoad); // Due to diversity
      expect(result.totalCurrent).toBeGreaterThan(0);
      expect(result.mainSwitchRating).toBeGreaterThanOrEqual(result.totalCurrent * 1.25);
      expect(result.usedWays).toBe(5);
      expect(result.spareWays).toBe(6);
      expect(result.recommendedBoardSize).toBeGreaterThanOrEqual(11);
      expect(result.recommendations).toContain('Install appropriate surge protection device (SPD)');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should recommend RCD protection for MCB-only boards', () => {
      const inputs = {
        circuits: [
          { type: 'lighting' as const, load: 1000, diversity: 0.6, protection: 6 },
          { type: 'power' as const, load: 2000, diversity: 0.4, protection: 16 }
        ],
        phases: 1 as const,
        voltage: 230,
        boardType: 'MCB_only' as const,
        spareWays: 2
      };

      const result = DistributionBoardCalculator.calculate(inputs);

      expect(result.recommendations).toContain('Consider RCD protection for enhanced safety');
    });

    it('should recommend larger board for high utilization', () => {
      const inputs = {
        circuits: Array(10).fill(null).map(() => ({
          type: 'power' as const,
          load: 1000,
          diversity: 0.5,
          protection: 10
        })),
        phases: 3 as const,
        voltage: 400,
        boardType: 'RCBO' as const,
        spareWays: 2 // Low spare ways for high utilization
      };

      const result = DistributionBoardCalculator.calculate(inputs);

      if (result.boardUtilization > 75) {
        expect(result.recommendations).toContain('Consider larger board for future expansion');
      }
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          circuits: [], // Empty circuits
          phases: 3 as const,
          voltage: 400,
          boardType: 'RCBO' as const,
          spareWays: 6
        },
        {
          circuits: [{ type: 'lighting' as const, load: -1000, diversity: 0.6, protection: 6 }], // Negative load
          phases: 3 as const,
          voltage: 400,
          boardType: 'RCBO' as const,
          spareWays: 6
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => DistributionBoardCalculator.calculate(inputs)).toThrow();
      });
    });
  });
});

describe('TransformerCalculator', () => {
  describe('calculate', () => {
    it('should calculate transformer requirements correctly', () => {
      const inputs = {
        primaryVoltage: 11000,
        secondaryVoltage: 400,
        loadPower: 250, // 250kVA
        loadPowerFactor: 0.85,
        efficiency: 0.98,
        diversityFactor: 0.8,
        ambientTemp: 35,
        loadGrowth: 20,
        redundancyRequired: false
      };

      const result = TransformerCalculator.calculate(inputs);

      expect(result.loadPower).toBe(250);
      expect(result.requiredCapacity).toBeGreaterThan(result.loadPower);
      expect(result.selectedRating).toBeGreaterThanOrEqual(result.requiredCapacity);
      expect(result.utilization).toBeGreaterThan(0);
      expect(result.efficiency).toBe(98);
      expect(result.losses).toBeGreaterThan(0);
      expect(result.primaryCurrent).toBeGreaterThan(0);
      expect(result.secondaryCurrent).toBeGreaterThan(0);
      expect(result.tempDerating).toBeLessThanOrEqual(1);
      expect(result.recommendations).toContain('Install appropriate protection on both primary and secondary sides');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should handle redundancy requirements', () => {
      const inputs = {
        primaryVoltage: 11000,
        secondaryVoltage: 400,
        loadPower: 100,
        loadPowerFactor: 0.9,
        efficiency: 0.97,
        diversityFactor: 0.85,
        ambientTemp: 30,
        loadGrowth: 15,
        redundancyRequired: true
      };

      const nonRedundantInputs = { ...inputs, redundancyRequired: false };

      const redundantResult = TransformerCalculator.calculate(inputs);
      const nonRedundantResult = TransformerCalculator.calculate(nonRedundantInputs);

      expect(redundantResult.selectedRating).toBeGreaterThan(nonRedundantResult.selectedRating);
      expect(redundantResult.recommendations).toContain('Implement automatic changeover system for redundancy');
    });

    it('should apply temperature derating correctly', () => {
      const normalTemp = {
        primaryVoltage: 11000,
        secondaryVoltage: 400,
        loadPower: 150,
        loadPowerFactor: 0.85,
        efficiency: 0.98,
        diversityFactor: 0.8,
        ambientTemp: 25,
        loadGrowth: 10,
        redundancyRequired: false
      };

      const highTemp = { ...normalTemp, ambientTemp: 50 };

      const normalResult = TransformerCalculator.calculate(normalTemp);
      const highTempResult = TransformerCalculator.calculate(highTemp);

      expect(highTempResult.tempDerating).toBeLessThan(normalResult.tempDerating);
      expect(highTempResult.selectedRating).toBeGreaterThanOrEqual(normalResult.selectedRating);
    });

    it('should warn about high utilization', () => {
      const inputs = {
        primaryVoltage: 11000,
        secondaryVoltage: 400,
        loadPower: 315, // High load
        loadPowerFactor: 0.95,
        efficiency: 0.99,
        diversityFactor: 0.95,
        ambientTemp: 40,
        loadGrowth: 5, // Low growth to keep utilization high
        redundancyRequired: false
      };

      const result = TransformerCalculator.calculate(inputs);

      if (result.utilization > 80) {
        expect(result.recommendations).toContain('Transformer utilization is high - monitor loading carefully');
      }
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          primaryVoltage: -11000, // Invalid
          secondaryVoltage: 400,
          loadPower: 250,
          loadPowerFactor: 0.85,
          efficiency: 0.98,
          diversityFactor: 0.8,
          ambientTemp: 35,
          loadGrowth: 20,
          redundancyRequired: false
        },
        {
          primaryVoltage: 11000,
          secondaryVoltage: 400,
          loadPower: 250,
          loadPowerFactor: 1.5, // Invalid
          efficiency: 0.98,
          diversityFactor: 0.8,
          ambientTemp: 35,
          loadGrowth: 20,
          redundancyRequired: false
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => TransformerCalculator.calculate(inputs)).toThrow();
      });
    });
  });
});

describe('CircuitCapacityCalculator', () => {
  describe('calculate', () => {
    it('should calculate ring circuit capacity correctly', () => {
      const inputs = {
        circuitType: 'ring' as const,
        cableSize: 2.5,
        installationMethod: 'C' as const,
        circuitLength: 50,
        voltage: 230,
        maxVoltageDrop: 3, // 3% for power circuits
        ambientTemp: 30,
        groupingFactor: 1.0,
        thermalInsulation: false
      };

      const result = CircuitCapacityCalculator.calculate(inputs);

      expect(result.circuitType).toBe('ring');
      expect(result.cableSize).toBe(2.5);
      expect(result.baseCurrentCarryingCapacity).toBeGreaterThan(0);
      expect(result.deratedCapacity).toBeLessThanOrEqual(result.baseCurrentCarryingCapacity);
      expect(result.voltageDropConstraint).toBeGreaterThan(0);
      expect(result.circuitCapacity).toBe(Math.min(result.deratedCapacity, result.voltageDropConstraint));
      expect(result.maxLoad).toBeGreaterThan(0);
      expect(result.utilizationFactor).toBe(80); // Ring circuit utilization
      expect(result.recommendations).toContain('Test ring circuit continuity at both ends');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate radial circuit capacity correctly', () => {
      const inputs = {
        circuitType: 'radial' as const,
        cableSize: 4.0,
        installationMethod: 'B' as const,
        circuitLength: 30,
        voltage: 230,
        maxVoltageDrop: 5, // 5% for power circuits
        ambientTemp: 25,
        groupingFactor: 0.8,
        thermalInsulation: false
      };

      const result = CircuitCapacityCalculator.calculate(inputs);

      expect(result.circuitType).toBe('radial');
      expect(result.utilizationFactor).toBe(70); // Radial circuit utilization
      expect(result.recommendations).not.toContain('Test ring circuit continuity at both ends');
    });

    it('should apply derating factors correctly', () => {
      const normalConditions = {
        circuitType: 'radial' as const,
        cableSize: 2.5,
        installationMethod: 'C' as const,
        circuitLength: 25,
        voltage: 230,
        maxVoltageDrop: 3,
        ambientTemp: 30,
        groupingFactor: 1.0,
        thermalInsulation: false
      };

      const adverseConditions = {
        ...normalConditions,
        ambientTemp: 45, // High temperature
        groupingFactor: 0.6, // Cable grouping
        thermalInsulation: true // Thermal insulation
      };

      const normalResult = CircuitCapacityCalculator.calculate(normalConditions);
      const adverseResult = CircuitCapacityCalculator.calculate(adverseConditions);

      expect(adverseResult.deratedCapacity).toBeLessThan(normalResult.deratedCapacity);
    });

    it('should identify voltage drop limitations', () => {
      const inputs = {
        circuitType: 'radial' as const,
        cableSize: 1.5, // Small cable
        installationMethod: 'B' as const,
        circuitLength: 100, // Long circuit
        voltage: 230,
        maxVoltageDrop: 3, // Tight voltage drop limit
        ambientTemp: 25,
        groupingFactor: 1.0,
        thermalInsulation: false
      };

      const result = CircuitCapacityCalculator.calculate(inputs);

      if (result.circuitCapacity === result.voltageDropConstraint) {
        expect(result.recommendations).toContain('Circuit capacity limited by voltage drop - consider larger cable');
      }
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          circuitType: 'ring' as const,
          cableSize: -2.5, // Invalid
          installationMethod: 'C' as const,
          circuitLength: 50,
          voltage: 230,
          maxVoltageDrop: 3,
          ambientTemp: 30,
          groupingFactor: 1.0,
          thermalInsulation: false
        },
        {
          circuitType: 'ring' as const,
          cableSize: 2.5,
          installationMethod: 'C' as const,
          circuitLength: 50,
          voltage: 230,
          maxVoltageDrop: 15, // Too high
          ambientTemp: 30,
          groupingFactor: 1.0,
          thermalInsulation: false
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => CircuitCapacityCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should handle different installation methods', () => {
      const baseInputs = {
        circuitType: 'radial' as const,
        cableSize: 2.5,
        circuitLength: 30,
        voltage: 230,
        maxVoltageDrop: 3,
        ambientTemp: 30,
        groupingFactor: 1.0,
        thermalInsulation: false
      };

      const methodA = CircuitCapacityCalculator.calculate({
        ...baseInputs,
        installationMethod: 'A' as const
      });

      const methodF = CircuitCapacityCalculator.calculate({
        ...baseInputs,
        installationMethod: 'F' as const
      });

      // Method A should have higher current carrying capacity than Method F
      expect(methodA.baseCurrentCarryingCapacity).toBeGreaterThan(methodF.baseCurrentCarryingCapacity);
    });
  });
});
