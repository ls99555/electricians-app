/**
 * Unit Tests for Safety and Testing Calculations
 * Testing loop impedance, RCD selection, earth electrode, and fault current calculations
 * All tests validate against BS 7671 safety requirements
 */

import { describe, it, expect } from '@jest/globals';
import { 
  LoopImpedanceCalculator, 
  RCDSelectionCalculator,
  EarthElectrodeCalculator,
  FaultCurrentCalculator
} from '../safety-testing';

describe('LoopImpedanceCalculator', () => {
  describe('calculate()', () => {
    it('should calculate loop impedance for domestic circuit with B32 MCB (BS 7671 compliant)', () => {
      const inputs = {
        ze: 0.35, // Typical TN-C-S external impedance
        r1: 0.074, // 2.5mm² line conductor (10m)
        r2: 0.118, // 1.5mm² protective conductor (10m)
        protectionDevice: 'B32',
        voltage: 230
      };

      const result = LoopImpedanceCalculator.calculate(inputs);

      expect(result.ze).toBe(0.35);
      expect(result.r1PlusR2).toBeCloseTo(0.192, 3);
      expect(result.zs).toBeCloseTo(0.542, 3);
      expect(result.maxZsAllowed).toBeLessThanOrEqual(1.44); // BS 7671 Appendix 3 limit for B32
      expect(result.isCompliant).toBe(true);
      expect(result.disconnectionTime).toBeLessThanOrEqual(0.4); // BS 7671 requirement
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate loop impedance for industrial circuit with C63 MCB', () => {
      const inputs = {
        ze: 0.8, // Industrial supply
        r1: 0.036, // 6mm² line conductor (20m)
        r2: 0.074, // 2.5mm² protective conductor (20m)
        protectionDevice: 'C63',
        voltage: 400
      };

      const result = LoopImpedanceCalculator.calculate(inputs);

      expect(result.ze).toBe(0.8);
      expect(result.r1PlusR2).toBeCloseTo(0.11, 2);
      expect(result.zs).toBeCloseTo(0.91, 2);
      expect(result.isCompliant).toBe(true);
      expect(result.protectionType).toContain('C63');
    });

    it('should identify non-compliant loop impedance values', () => {
      const inputs = {
        ze: 2.0, // Very high external impedance
        r1: 0.5,  // Long run with small cable
        r2: 0.8,  // Small protective conductor
        protectionDevice: 'B16',
        voltage: 230
      };

      const result = LoopImpedanceCalculator.calculate(inputs);

      expect(result.zs).toBeGreaterThan(3.0);
      expect(result.isCompliant).toBe(false);
      expect(result.disconnectionTime).toBeGreaterThan(5.0); // Excessive disconnection time
    });

    it('should validate input parameters', () => {
      expect(() => {
        LoopImpedanceCalculator.calculate({
          ze: -0.1, // Negative value should throw
          r1: 0.074,
          r2: 0.118,
          protectionDevice: 'B32',
          voltage: 230
        });
      }).toThrow();
    });

    it('should handle different MCB types correctly', () => {
      const baseInputs = {
        ze: 0.35,
        r1: 0.074,
        r2: 0.118,
        voltage: 230
      };

      const b16Result = LoopImpedanceCalculator.calculate({
        ...baseInputs,
        protectionDevice: 'B16'
      });

      const c32Result = LoopImpedanceCalculator.calculate({
        ...baseInputs,
        protectionDevice: 'C32'
      });

      // Different MCB types should have different max Zs values
      expect(b16Result.maxZsAllowed).not.toEqual(c32Result.maxZsAllowed);
      expect(b16Result.protectionType).toContain('B16');
      expect(c32Result.protectionType).toContain('C32');
    });

    it('should calculate realistic values for ring circuit', () => {
      const inputs = {
        ze: 0.35,
        r1: 0.037, // 2.5mm² twin and earth (ring circuit - half values)
        r2: 0.059, // 1.5mm² protective conductor (ring circuit)
        protectionDevice: 'B32',
        voltage: 230
      };

      const result = LoopImpedanceCalculator.calculate(inputs);

      expect(result.r1PlusR2).toBeLessThan(0.1); // Ring circuit has lower R1+R2
      expect(result.zs).toBeLessThan(0.5);
      expect(result.isCompliant).toBe(true);
    });
  });
});

describe('RCDSelectionCalculator', () => {
  describe('calculate()', () => {
    it('should select appropriate RCD for bathroom installation (BS 7671 Section 701)', () => {
      const inputs = {
        loadCurrent: 32,
        earthFaultLoopImpedance: 1.37,
        circuitType: 'final_circuit' as const,
        location: 'bathroom',
        earthingSystem: 'TN-C-S' as const
      };

      const result = RCDSelectionCalculator.calculate(inputs);

      expect(result.recommendedRating).toBe(30); // 30mA RCD required for bathrooms
      expect(result.rcdType).toContain('30mA');
      expect(result.testCurrent).toBe(150); // 5 × 30mA for test
      expect(result.operatingTime).toBeLessThanOrEqual(300); // Max 300ms
      expect(result.applications).toContain('bathroom');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should select RCD for socket outlet circuits (BS 7671 Regulation 411.3.3)', () => {
      const inputs = {
        loadCurrent: 20,
        earthFaultLoopImpedance: 0.73,
        circuitType: 'socket_outlet' as const,
        location: 'general',
        earthingSystem: 'TN-S' as const
      };

      const result = RCDSelectionCalculator.calculate(inputs);

      expect(result.recommendedRating).toBe(30); // 30mA RCD required for socket outlets
      expect(result.isGRCDRequired).toBe(false); // GFCI not required for general areas
      expect(result.applications).toContain('socket outlet');
    });

    it('should recommend time-delayed RCD for supply incomer', () => {
      const inputs = {
        loadCurrent: 100,
        earthFaultLoopImpedance: 0.35,
        circuitType: 'distribution' as const,
        location: 'consumer_unit',
        earthingSystem: 'TN-C-S' as const
      };

      const result = RCDSelectionCalculator.calculate(inputs);

      expect(result.recommendedRating).toBeGreaterThan(30); // Likely 100mA or 300mA for discrimination
      expect(result.rcdType).toContain('time-delayed');
      expect(result.operatingTime).toBeGreaterThan(300); // Longer time for discrimination
    });

    it('should validate RCD selection inputs', () => {
      expect(() => {
        RCDSelectionCalculator.calculate({
          loadCurrent: -10, // Negative current should throw
          earthFaultLoopImpedance: 0.73,
          circuitType: 'socket_outlet',
          location: 'general',
          earthingSystem: 'TN-S'
        });
      }).toThrow();
    });

    it('should handle outdoor installations correctly', () => {
      const inputs = {
        loadCurrent: 16,
        earthFaultLoopImpedance: 1.0,
        circuitType: 'outdoor' as const,
        location: 'garden',
        earthingSystem: 'TT' as const
      };

      const result = RCDSelectionCalculator.calculate(inputs);

      expect(result.recommendedRating).toBe(30); // 30mA for outdoor
      expect(result.applications).toContain('outdoor');
      expect(result.isGRCDRequired).toBe(true); // TT system requires RCD protection
    });
  });
});

describe('EarthElectrodeCalculator', () => {
  describe('calculate()', () => {
    it('should calculate earth electrode resistance for TT system (BS 7671 Section 542)', () => {
      const inputs = {
        electrodeType: 'rod' as const,
        soilResistivity: 100, // Ω⋅m - typical clay soil
        electrodeLength: 2.4, // Standard 2.4m earth rod
        electrodeDiameter: 0.016, // 16mm diameter rod
        installationDepth: 0.6,
        seasonalVariation: true
      };

      const result = EarthElectrodeCalculator.calculate(inputs);

      expect(result.resistance).toBeGreaterThan(0);
      expect(result.resistance).toBeLessThan(200); // Should be reasonable for TT system
      expect(result.maxResistanceAllowed).toBeLessThanOrEqual(200); // BS 7671 guidance for TT
      expect(result.isCompliant).toBe(true);
      expect(result.electrodeType).toBe('rod');
      expect(result.seasonalVariation).toContain('expect resistance to vary');
    });

    it('should calculate earth electrode for high resistivity soil', () => {
      const inputs = {
        electrodeType: 'plate' as const,
        soilResistivity: 500, // High resistivity soil
        electrodeLength: 1.2,
        electrodeDiameter: 0.02,
        installationDepth: 1.0,
        seasonalVariation: false
      };

      const result = EarthElectrodeCalculator.calculate(inputs);

      expect(result.resistance).toBeGreaterThan(50); // Higher resistance expected
      expect(result.improvementSuggestions).toContain('multiple electrodes');
      expect(result.testConditions).toContain('dry conditions');
    });

    it('should validate earth electrode inputs', () => {
      expect(() => {
        EarthElectrodeCalculator.calculate({
          electrodeType: 'rod',
          soilResistivity: -50, // Negative value should throw
          electrodeLength: 2.4,
          electrodeDiameter: 0.016,
          installationDepth: 0.6,
          seasonalVariation: true
        });
      }).toThrow();
    });

    it('should provide improvement suggestions for poor soil conditions', () => {
      const inputs = {
        electrodeType: 'rod' as const,
        soilResistivity: 1000, // Very high resistivity
        electrodeLength: 1.2,
        electrodeDiameter: 0.012,
        installationDepth: 0.5,
        seasonalVariation: true
      };

      const result = EarthElectrodeCalculator.calculate(inputs);

      expect(result.isCompliant).toBe(false);
      expect(result.improvementSuggestions.length).toBeGreaterThan(1);
      expect(result.improvementSuggestions).toContain('longer electrodes');
      expect(result.improvementSuggestions).toContain('chemical treatment');
    });

    it('should handle different electrode types correctly', () => {
      const rodInputs = {
        electrodeType: 'rod' as const,
        soilResistivity: 200,
        electrodeLength: 2.4,
        electrodeDiameter: 0.016,
        installationDepth: 0.6,
        seasonalVariation: false
      };

      const tapeInputs = {
        ...rodInputs,
        electrodeType: 'tape' as const,
        electrodeLength: 10, // 10m of tape
        electrodeDiameter: 0.025 // 25mm tape width
      };

      const rodResult = EarthElectrodeCalculator.calculate(rodInputs);
      const tapeResult = EarthElectrodeCalculator.calculate(tapeInputs);

      expect(rodResult.electrodeType).toBe('rod');
      expect(tapeResult.electrodeType).toBe('tape');
      expect(tapeResult.resistance).toBeLessThan(rodResult.resistance); // Tape usually has lower resistance
    });
  });
});

describe('FaultCurrentCalculator', () => {
  describe('calculate()', () => {
    it('should calculate prospective fault current for TN-S system', () => {
      const inputs = {
        supplyVoltage: 230,
        sourceImpedance: 0.15, // Transformer impedance
        cableImpedance: 0.25,  // Cable impedance to fault point
        earthingSystem: 'TN-S' as const,
        faultType: 'phase_to_earth'
      };

      const result = FaultCurrentCalculator.calculate(inputs);

      expect(result.prospectiveFaultCurrent).toBeGreaterThan(500); // Should be substantial fault current
      expect(result.faultCurrentRMS).toBeGreaterThan(0);
      expect(result.breakingCapacity).toBeGreaterThan(result.prospectiveFaultCurrent);
      expect(result.isWithinLimits).toBe(true);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate three-phase fault current', () => {
      const inputs = {
        supplyVoltage: 400,
        sourceImpedance: 0.1,
        cableImpedance: 0.15,
        earthingSystem: 'TN-C-S' as const,
        faultType: 'phase_to_phase'
      };

      const result = FaultCurrentCalculator.calculate(inputs);

      expect(result.prospectiveFaultCurrent).toBeGreaterThan(1000); // Higher for 3-phase
      expect(result.faultType).toBe('phase_to_phase');
      expect(result.isWithinLimits).toBe(true);
    });

    it('should validate fault current inputs', () => {
      expect(() => {
        FaultCurrentCalculator.calculate({
          supplyVoltage: -230, // Negative voltage should throw
          sourceImpedance: 0.15,
          cableImpedance: 0.25,
          earthingSystem: 'TN-S',
          faultType: 'phase_to_earth'
        });
      }).toThrow();
    });

    it('should handle TT system with higher impedance', () => {
      const inputs = {
        supplyVoltage: 230,
        sourceImpedance: 0.35,
        cableImpedance: 1.5, // Higher impedance in TT system
        earthingSystem: 'TT' as const,
        faultType: 'phase_to_earth'
      };

      const result = FaultCurrentCalculator.calculate(inputs);

      expect(result.prospectiveFaultCurrent).toBeLessThan(200); // Lower fault current in TT system
      expect(result.recommendations).toContain('RCD protection essential');
    });

    it('should verify protective device breaking capacity', () => {
      const inputs = {
        supplyVoltage: 230,
        sourceImpedance: 0.08, // Low impedance supply
        cableImpedance: 0.12,
        earthingSystem: 'TN-C-S' as const,
        faultType: 'phase_to_neutral'
      };

      const result = FaultCurrentCalculator.calculate(inputs);

      expect(result.prospectiveFaultCurrent).toBeGreaterThan(1000);
      expect(result.breakingCapacity).toBeGreaterThanOrEqual(6000); // Standard MCB rating
      expect(result.isWithinLimits).toBe(true);
    });
  });
});

describe('Regulatory Compliance', () => {
  it('should ensure all safety calculations reference BS 7671', () => {
    const loopInputs = {
      ze: 0.35,
      r1: 0.074,
      r2: 0.118,
      protectionDevice: 'B32',
      voltage: 230
    };

    const rcdInputs = {
      loadCurrent: 32,
      earthFaultLoopImpedance: 1.37,
      circuitType: 'final_circuit' as const,
      location: 'bathroom',
      earthingSystem: 'TN-C-S' as const
    };

    const earthInputs = {
      electrodeType: 'rod' as const,
      soilResistivity: 100,
      electrodeLength: 2.4,
      electrodeDiameter: 0.016,
      installationDepth: 0.6,
      seasonalVariation: true
    };

    const loopResult = LoopImpedanceCalculator.calculate(loopInputs);
    const rcdResult = RCDSelectionCalculator.calculate(rcdInputs);
    const earthResult = EarthElectrodeCalculator.calculate(earthInputs);

    expect(loopResult.regulation).toContain('BS 7671');
    expect(rcdResult.regulation).toContain('BS 7671');
    expect(earthResult.testConditions).toContain('BS 7671');
  });

  it('should validate safety margins in all calculations', () => {
    const inputs = {
      ze: 0.35,
      r1: 0.074,
      r2: 0.118,
      protectionDevice: 'B32',
      voltage: 230
    };

    const result = LoopImpedanceCalculator.calculate(inputs);

    // Should have reasonable safety margin
    expect(result.zs).toBeLessThan(result.maxZsAllowed * 0.8); // 20% safety margin
    expect(result.disconnectionTime).toBeLessThan(0.3); // Well within 0.4s limit
  });

  it('should ensure all calculations include appropriate recommendations', () => {
    const faultInputs = {
      supplyVoltage: 230,
      sourceImpedance: 0.15,
      cableImpedance: 0.25,
      earthingSystem: 'TN-S' as const,
      faultType: 'phase_to_earth'
    };

    const result = FaultCurrentCalculator.calculate(faultInputs);

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
