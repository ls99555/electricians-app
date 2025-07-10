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
  FaultCurrentCalculator,
  InsulationResistanceCalculator,
  ContinuityTestCalculator,
  PolarityTestCalculator,
  PhaseSequenceCalculator,
  AppliedVoltageTestCalculator,
  FunctionalTestCalculator
} from '../safety-testing';
import type {
  InsulationResistanceInputs,
  ContinuityTestInputs,
  PolarityTestInputs,
  PhaseSequenceInputs,
  AppliedVoltageTestInputs,
  FunctionalTestInputs
} from '../../types';

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
        faultType: 'phase_to_earth' as const
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
        faultType: 'phase_to_phase' as const
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
        faultType: 'phase_to_earth' as const
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
        faultType: 'phase_to_earth' as const
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
      faultType: 'phase_to_earth' as const
    };

    const result = FaultCurrentCalculator.calculate(faultInputs);

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations?.length).toBeGreaterThan(0);
  });
});

/**
 * Unit Tests for Additional Safety and Testing Calculations
 * Testing insulation resistance, continuity, polarity, phase sequence, applied voltage, and functional tests
 * All tests validate against BS 7671 and IET Guidance Note 3 requirements
 */

describe('InsulationResistanceCalculator', () => {
  describe('calculate()', () => {
    it('should calculate insulation resistance for standard LV circuit (BS 7671 compliant)', () => {
      const inputs: InsulationResistanceInputs = {
        testVoltage: 500,
        circuitType: 'lv_circuit',
        installationType: 'new_installation',
        environmentalConditions: {
          temperature: 20,
          humidity: 50,
          contamination: 'clean'
        },
        cableLength: 50,
        numberOfCores: 3,
        cableType: 'pvc',
        connectedEquipment: false,
        surgeSuppressors: false
      };

      const result = InsulationResistanceCalculator.calculate(inputs);

      expect(result.minimumResistance).toBe(1.0); // BS 7671 Table 61 requirement
      expect(result.testResult).toMatch(/pass|fail|investigate/);
      expect(result.complianceAssessment.bs7671Compliant).toEqual(result.testResult === 'pass');
      expect(result.regulation).toContain('BS 7671');
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.remedialActions).toBeInstanceOf(Array);
      expect(result.temperatureCorrectionFactor).toBeCloseTo(1.0, 1); // At 20°C
    });

    it('should calculate minimum resistance correctly for SELV circuits', () => {
      const inputs: InsulationResistanceInputs = {
        testVoltage: 250,
        circuitType: 'extra_low_voltage',
        installationType: 'new_installation',
        environmentalConditions: {
          temperature: 20,
          humidity: 50,
          contamination: 'clean'
        },
        cableLength: 20,
        numberOfCores: 2,
        cableType: 'pvc',
        connectedEquipment: false,
        surgeSuppressors: false
      };

      const result = InsulationResistanceCalculator.calculate(inputs);

      expect(result.minimumResistance).toBe(0.25); // BS 7671 Table 61 for SELV
    });

    it('should apply temperature correction factor correctly', () => {
      const inputs: InsulationResistanceInputs = {
        testVoltage: 500,
        circuitType: 'lv_circuit',
        installationType: 'periodic_inspection',
        environmentalConditions: {
          temperature: 40, // High temperature
          humidity: 60,
          contamination: 'clean'
        },
        cableLength: 30,
        numberOfCores: 3,
        cableType: 'pvc',
        connectedEquipment: false,
        surgeSuppressors: false
      };

      const result = InsulationResistanceCalculator.calculate(inputs);

      expect(result.temperatureCorrectionFactor).toBeLessThan(1.0); // Higher temp = lower correction
      expect(result.correctedResistance).not.toEqual(result.measuredResistance);
    });

    it('should throw error for invalid test voltage', () => {
      const inputs: InsulationResistanceInputs = {
        testVoltage: -100, // Invalid
        circuitType: 'lv_circuit',
        installationType: 'new_installation',
        environmentalConditions: {
          temperature: 20,
          humidity: 50,
          contamination: 'clean'
        },
        cableLength: 50,
        numberOfCores: 3,
        cableType: 'pvc',
        connectedEquipment: false,
        surgeSuppressors: false
      };

      expect(() => InsulationResistanceCalculator.calculate(inputs)).toThrow('Test voltage must be positive');
    });

    it('should handle extreme environmental conditions', () => {
      const inputs: InsulationResistanceInputs = {
        testVoltage: 500,
        circuitType: 'lv_circuit',
        installationType: 'periodic_inspection',
        environmentalConditions: {
          temperature: 45, // High temperature
          humidity: 95, // High humidity
          contamination: 'damp'
        },
        cableLength: 100,
        numberOfCores: 4,
        cableType: 'pvc',
        connectedEquipment: true,
        surgeSuppressors: true
      };

      const result = InsulationResistanceCalculator.calculate(inputs);

      expect(result.temperatureCorrectionFactor).toBeLessThan(0.9);
      expect(result.recommendations.some(rec => rec.includes('humidity'))).toBe(true);
    });
  });
});

describe('ContinuityTestCalculator', () => {
  describe('calculate()', () => {
    it('should calculate continuity test for protective conductor (BS 7671 compliant)', () => {
      const inputs: ContinuityTestInputs = {
        testType: 'protective_conductor',
        conductorCsa: 2.5,
        conductorLength: 30,
        conductorMaterial: 'copper',
        testCurrent: 10,
        ambientTemperature: 20
      };

      const result = ContinuityTestCalculator.calculate(inputs);

      expect(result.expectedResistance).toBeGreaterThan(0);
      expect(result.measuredResistance).toBeGreaterThan(0);
      expect(result.testResult).toMatch(/pass|fail|investigate/);
      expect(result.complianceAssessment.bs7671Compliant).toEqual(result.testResult === 'pass');
      expect(result.regulation).toContain('BS 7671');
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.complianceAssessment.acceptableTolerance).toBe('±10% or ±0.05Ω, whichever is greater');
    });

    it('should calculate ring circuit continuity with analysis', () => {
      const inputs: ContinuityTestInputs = {
        testType: 'ring_circuit',
        conductorCsa: 2.5,
        conductorLength: 60,
        conductorMaterial: 'copper',
        testCurrent: 10,
        ambientTemperature: 20,
        ringCircuitDetails: {
          liveConductorCsa: 2.5,
          cpcCsa: 1.5,
          totalLength: 60
        }
      };

      const result = ContinuityTestCalculator.calculate(inputs);

      expect(result.ringCircuitAnalysis).toBeDefined();
      expect(result.ringCircuitAnalysis?.r1).toBeGreaterThan(0);
      expect(result.ringCircuitAnalysis?.r2).toBeGreaterThan(0);
      expect(result.ringCircuitAnalysis?.ringIntegrity).toMatch(/good|poor|broken/);
    });

    it('should apply temperature correction correctly', () => {
      const inputs: ContinuityTestInputs = {
        testType: 'protective_conductor',
        conductorCsa: 2.5,
        conductorLength: 30,
        conductorMaterial: 'copper',
        testCurrent: 10,
        ambientTemperature: 35 // Higher temperature
      };

      const result = ContinuityTestCalculator.calculate(inputs);

      expect(result.temperatureCorrectedResistance).toBeGreaterThan(result.measuredResistance);
    });

    it('should handle long cable runs accurately', () => {
      const inputs: ContinuityTestInputs = {
        testType: 'protective_conductor',
        conductorCsa: 1.5,
        conductorLength: 200, // Very long run
        conductorMaterial: 'copper',
        testCurrent: 10,
        ambientTemperature: 30
      };

      const result = ContinuityTestCalculator.calculate(inputs);

      expect(result.expectedResistance).toBeGreaterThan(10); // Should be significant for long run
      expect(result.deviationFromExpected).toBeDefined();
    });

    it('should throw error for invalid conductor CSA', () => {
      const inputs: ContinuityTestInputs = {
        testType: 'protective_conductor',
        conductorCsa: -1, // Invalid
        conductorLength: 30,
        conductorMaterial: 'copper',
        testCurrent: 10,
        ambientTemperature: 20
      };

      expect(() => ContinuityTestCalculator.calculate(inputs)).toThrow('Conductor CSA must be positive');
    });
  });
});

describe('PolarityTestCalculator', () => {
  describe('calculate()', () => {
    it('should verify polarity test for single phase installation (BS 7671 compliant)', () => {
      const inputs: PolarityTestInputs = {
        installationType: 'new_installation',
        circuitType: 'lighting',
        supplySystem: 'single_phase',
        testMethod: 'continuity',
        circuitsToTest: ['C1', 'C2', 'C3'],
        switchgearType: 'consumer_unit',
        earthingArrangement: 'tn_c_s'
      };

      const result = PolarityTestCalculator.calculate(inputs);

      expect(result.overallResult).toMatch(/pass|fail|not_applicable/);
      expect(result.circuitResults).toHaveLength(3);
      expect(result.complianceAssessment.bs7671Compliant).toEqual(result.overallResult === 'pass');
      expect(result.regulation).toContain('BS 7671');
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.complianceAssessment.safetyRequirements).toContain('All switching devices in line conductor');
    });

    it('should handle three-phase polarity testing', () => {
      const inputs: PolarityTestInputs = {
        installationType: 'new_installation',
        circuitType: 'three_phase',
        supplySystem: 'three_phase_4wire',
        testMethod: 'continuity',
        circuitsToTest: ['L1', 'L2', 'L3', 'N'],
        switchgearType: 'distribution_board',
        earthingArrangement: 'tn_s'
      };

      const result = PolarityTestCalculator.calculate(inputs);

      expect(result.complianceAssessment.safetyRequirements).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify polarity faults when present', () => {
      const inputs: PolarityTestInputs = {
        installationType: 'periodic_inspection',
        circuitType: 'socket_outlet',
        supplySystem: 'single_phase',
        testMethod: 'low_voltage',
        circuitsToTest: ['C1'],
        switchgearType: 'distribution_board',
        earthingArrangement: 'tn_s'
      };

      const result = PolarityTestCalculator.calculate(inputs);

      if (result.overallResult === 'fail') {
        expect(result.criticalFindings.length).toBeGreaterThan(0);
        expect(result.retestRequired).toBe(true);
      }
    });

    it('should throw error for empty circuits list', () => {
      const inputs: PolarityTestInputs = {
        installationType: 'new_installation',
        circuitType: 'lighting',
        supplySystem: 'single_phase',
        testMethod: 'continuity',
        circuitsToTest: [], // Empty array
        switchgearType: 'consumer_unit',
        earthingArrangement: 'tn_c_s'
      };

      expect(() => PolarityTestCalculator.calculate(inputs)).toThrow('At least one circuit to test must be specified');
    });
  });
});

describe('PhaseSequenceCalculator', () => {
  describe('calculate()', () => {
    it('should verify correct phase sequence for three-phase system (BS 7671 compliant)', () => {
      const inputs: PhaseSequenceInputs = {
        supplyType: 'three_phase_4wire',
        nominalVoltage: 400,
        frequency: 50,
        loadType: 'motor',
        rotationDirection: 'clockwise',
        testMethod: 'phase_sequence_indicator',
        installationType: 'new_installation'
      };

      const result = PhaseSequenceCalculator.calculate(inputs);

      expect(result.phaseSequence).toMatch(/l1_l2_l3|l1_l3_l2|incorrect|unable_to_determine/);
      expect(result.rotationDirection).toMatch(/clockwise|anticlockwise/);
      expect(result.testResult).toMatch(/correct|incorrect|requires_correction/);
      expect(result.voltageReadings.l1_l2).toBeGreaterThan(0);
      expect(result.voltageReadings.l2_l3).toBeGreaterThan(0);
      expect(result.voltageReadings.l3_l1).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should include neutral voltages for 4-wire system', () => {
      const inputs: PhaseSequenceInputs = {
        supplyType: 'three_phase_4wire',
        nominalVoltage: 400,
        frequency: 50,
        loadType: 'general_load',
        rotationDirection: 'not_specified',
        testMethod: 'phase_sequence_indicator',
        installationType: 'maintenance'
      };

      const result = PhaseSequenceCalculator.calculate(inputs);

      expect(result.voltageReadings.l1_n).toBeDefined();
      expect(result.voltageReadings.l2_n).toBeDefined();
      expect(result.voltageReadings.l3_n).toBeDefined();
    });

    it('should assess motor compatibility correctly', () => {
      const inputs: PhaseSequenceInputs = {
        supplyType: 'three_phase_3wire',
        nominalVoltage: 400,
        frequency: 50,
        loadType: 'motor',
        rotationDirection: 'clockwise',
        testMethod: 'motor_rotation',
        installationType: 'new_installation'
      };

      const result = PhaseSequenceCalculator.calculate(inputs);

      expect(result.complianceAssessment.motorCompatible).toBeDefined();
      expect(result.complianceAssessment.loadCompatible).toBeDefined();
    });

    it('should handle high voltage systems with safety warnings', () => {
      const inputs: PhaseSequenceInputs = {
        supplyType: 'three_phase_3wire',
        nominalVoltage: 11000, // High voltage
        frequency: 50,
        loadType: 'transformer',
        rotationDirection: 'clockwise',
        testMethod: 'oscilloscope',
        installationType: 'new_installation'
      };

      const result = PhaseSequenceCalculator.calculate(inputs);

      expect(result.recommendations.some(rec => rec.includes('extreme caution'))).toBe(true);
    });

    it('should throw error for invalid voltage', () => {
      const inputs: PhaseSequenceInputs = {
        supplyType: 'three_phase_4wire',
        nominalVoltage: -400, // Invalid
        frequency: 50,
        loadType: 'motor',
        rotationDirection: 'clockwise',
        testMethod: 'phase_sequence_indicator',
        installationType: 'new_installation'
      };

      expect(() => PhaseSequenceCalculator.calculate(inputs)).toThrow('Nominal voltage must be positive');
    });
  });
});

describe('AppliedVoltageTestCalculator', () => {
  describe('calculate()', () => {
    it('should calculate applied voltage test for switchgear (BS 7671 compliant)', () => {
      const inputs: AppliedVoltageTestInputs = {
        testVoltage: 2500,
        equipmentType: 'switchgear',
        ratedVoltage: 400,
        testDuration: 60,
        testStandard: 'bs_en_61439',
        insulationClass: 'class_1',
        environmentalConditions: {
          temperature: 20,
          humidity: 65,
          altitude: 100
        },
        equipmentCondition: 'new'
      };

      const result = AppliedVoltageTestCalculator.calculate(inputs);

      expect(result.testVoltageApplied).toBe(2500);
      expect(result.testDuration).toBe(60);
      expect(result.leakageCurrent).toBeGreaterThanOrEqual(0);
      expect(result.testResult).toMatch(/pass|fail|breakdown/);
      expect(result.complianceAssessment.standardCompliant).toEqual(result.testResult === 'pass');
      expect(result.insulationQuality).toMatch(/excellent|good|acceptable|poor|failed/);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should assess insulation quality based on safety margin', () => {
      const inputs: AppliedVoltageTestInputs = {
        testVoltage: 1500,
        equipmentType: 'motor',
        ratedVoltage: 400,
        testDuration: 60,
        testStandard: 'bs_7671',
        insulationClass: 'class_1',
        environmentalConditions: {
          temperature: 25,
          humidity: 50,
          altitude: 150
        },
        equipmentCondition: 'existing'
      };

      const result = AppliedVoltageTestCalculator.calculate(inputs);

      if (result.testResult === 'pass') {
        expect(result.complianceAssessment.safetyMargin).toBeGreaterThanOrEqual(0);
        expect(['excellent', 'good', 'acceptable']).toContain(result.insulationQuality);
      }
    });

    it('should handle Class II equipment with appropriate test voltage', () => {
      const inputs: AppliedVoltageTestInputs = {
        testVoltage: 4000, // High test voltage for Class II
        equipmentType: 'motor',
        ratedVoltage: 400,
        testDuration: 60,
        testStandard: 'bs_en_60439',
        insulationClass: 'class_2',
        environmentalConditions: {
          temperature: 20,
          humidity: 60,
          altitude: 500
        },
        equipmentCondition: 'periodic_test'
      };

      const result = AppliedVoltageTestCalculator.calculate(inputs);

      expect(result.complianceAssessment.acceptanceCriteria).toContain('mA');
      expect(result.recommendations.some(rec => rec.includes('Class II'))).toBe(true);
    });

    it('should provide comprehensive safety considerations', () => {
      const inputs: AppliedVoltageTestInputs = {
        testVoltage: 4000,
        equipmentType: 'panel',
        ratedVoltage: 1000,
        testDuration: 60,
        testStandard: 'bs_en_60439',
        insulationClass: 'class_2',
        environmentalConditions: {
          temperature: 20,
          humidity: 60,
          altitude: 200
        },
        equipmentCondition: 'after_repair'
      };

      const result = AppliedVoltageTestCalculator.calculate(inputs);

      expect(result.safetyConsiderations).toBeInstanceOf(Array);
      expect(result.safetyConsiderations.length).toBeGreaterThan(0);
      expect(result.safetyConsiderations.some(item => item.includes('High voltage'))).toBe(true);
    });

    it('should throw error for invalid test voltage', () => {
      const inputs: AppliedVoltageTestInputs = {
        testVoltage: -1000, // Invalid
        equipmentType: 'switchgear',
        ratedVoltage: 400,
        testDuration: 60,
        testStandard: 'bs_en_61439',
        insulationClass: 'class_1',
        environmentalConditions: {
          temperature: 20,
          humidity: 65,
          altitude: 100
        },
        equipmentCondition: 'new'
      };

      expect(() => AppliedVoltageTestCalculator.calculate(inputs)).toThrow('Test voltage must be positive');
    });
  });
});

describe('FunctionalTestCalculator', () => {
  describe('calculate()', () => {
    it('should test RCD functionality (BS 7671 compliant)', () => {
      const inputs: FunctionalTestInputs = {
        systemType: 'rcd',
        testType: 'commissioning',
        equipmentDetails: {
          manufacturer: 'Test Manufacturer',
          model: 'RCD-30mA',
          ratingDetails: '30mA, 40ms',
          installationDate: '2024-01-01'
        },
        testParameters: {
          nominalCurrent: 32,
          tripCurrent: 30,
          tripTime: 25
        },
        environmentalConditions: {
          temperature: 20,
          humidity: 60
        },
        loadConditions: 'no_load'
      };

      const result = FunctionalTestCalculator.calculate(inputs);

      expect(result.overallResult).toMatch(/pass|fail|partial_pass/);
      expect(result.individualTests).toBeInstanceOf(Array);
      expect(result.performanceAssessment.withinSpecification).toBeDefined();
      expect(result.complianceAssessment.standardCompliant).toBeDefined();
      expect(result.regulation).toContain('BS 7671');
      expect(result.complianceAssessment.regulationReferences).toContain('BS 7671 Section 612.13');
    });

    it('should test emergency lighting functionality', () => {
      const inputs: FunctionalTestInputs = {
        systemType: 'emergency_lighting',
        testType: 'periodic',
        equipmentDetails: {
          manufacturer: 'Emergency Light Co',
          model: 'EL-LED-3H',
          ratingDetails: '3 hour duration, LED',
          installationDate: '2023-06-01'
        },
        testParameters: {},
        environmentalConditions: {
          temperature: 22,
          humidity: 55
        },
        loadConditions: 'full_load'
      };

      const result = FunctionalTestCalculator.calculate(inputs);

      expect(result.overallResult).toMatch(/pass|fail|partial_pass/);
      expect(result.maintenanceSchedule).toBeDefined();
      expect(result.nextTestDate).toBeDefined();
    });

    it('should assess performance degradation accurately', () => {
      const inputs: FunctionalTestInputs = {
        systemType: 'fire_alarm',
        testType: 'maintenance',
        equipmentDetails: {
          manufacturer: 'Fire Safety Ltd',
          model: 'FS-ALARM-001',
          ratingDetails: 'Optical smoke detector',
          installationDate: '2022-03-15'
        },
        testParameters: {
          testVoltage: 24,
          frequency: 50
        },
        environmentalConditions: {
          temperature: 25,
          humidity: 70
        },
        loadConditions: 'partial_load'
      };

      const result = FunctionalTestCalculator.calculate(inputs);

      expect(result.performanceAssessment.performanceDegradation).toBeGreaterThanOrEqual(0);
      expect(result.performanceAssessment.performanceDegradation).toBeLessThanOrEqual(100);
      expect(result.performanceAssessment.operationalReliability).toMatch(/excellent|good|acceptable|poor/);
    });

    it('should handle security system testing', () => {
      const inputs: FunctionalTestInputs = {
        systemType: 'security_system',
        testType: 'commissioning',
        equipmentDetails: {
          manufacturer: 'Security Systems Ltd',
          model: 'SEC-001',
          ratingDetails: 'Motion detector with PIR',
          installationDate: '2024-01-01'
        },
        testParameters: {
          testVoltage: 12,
          frequency: 50
        },
        environmentalConditions: {
          temperature: 20,
          humidity: 50
        },
        loadConditions: 'no_load'
      };

      const result = FunctionalTestCalculator.calculate(inputs);

      expect(result.maintenanceSchedule).toContain('Monthly function test');
      expect(result.nextTestDate).toBeDefined();
    });

    it('should throw error for missing system type', () => {
      const inputs = {
        systemType: '' as any, // Invalid
        testType: 'commissioning',
        equipmentDetails: {
          manufacturer: 'Test',
          model: 'Test',
          ratingDetails: 'Test',
          installationDate: '2024-01-01'
        },
        testParameters: {},
        environmentalConditions: {
          temperature: 20,
          humidity: 60
        },
        loadConditions: 'no_load'
      } as FunctionalTestInputs;

      expect(() => FunctionalTestCalculator.calculate(inputs)).toThrow('System type must be specified');
    });
  });
});
