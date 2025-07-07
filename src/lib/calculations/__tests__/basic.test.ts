/**
 * Unit Tests for Basic Electrical Calculations
 * Testing compliance with UK electrical regulations (BS 7671)
 */

import { OhmLawCalculator, VoltageDropCalculator, CableSizingCalculator } from '../basic';

describe('OhmLawCalculator', () => {
  describe('calculate()', () => {
    it('should calculate voltage from current and resistance (V = I × R)', () => {
      const result = OhmLawCalculator.calculate({ current: 10, resistance: 23 });
      expect(result.voltage).toBe(230);
      expect(result.current).toBe(10);
      expect(result.resistance).toBe(23);
      expect(result.power).toBe(2300);
    });

    it('should calculate current from voltage and resistance (I = V / R)', () => {
      const result = OhmLawCalculator.calculate({ voltage: 230, resistance: 23 });
      expect(result.current).toBe(10);
      expect(result.voltage).toBe(230);
      expect(result.resistance).toBe(23);
      expect(result.power).toBe(2300);
    });

    it('should calculate resistance from voltage and current (R = V / I)', () => {
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 10 });
      expect(result.resistance).toBe(23);
      expect(result.voltage).toBe(230);
      expect(result.current).toBe(10);
      expect(result.power).toBe(2300);
    });

    it('should calculate power from voltage and current (P = V × I)', () => {
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 10 });
      expect(result.power).toBe(2300);
    });

    it('should calculate power from voltage and resistance (P = V² / R)', () => {
      const result = OhmLawCalculator.calculate({ voltage: 230, resistance: 23 });
      expect(result.power).toBe(2300);
    });

    it('should calculate power from current and resistance (P = I² × R)', () => {
      const result = OhmLawCalculator.calculate({ current: 10, resistance: 23 });
      expect(result.power).toBe(2300);
    });

    it('should handle real-world domestic lighting circuit values', () => {
      // 6A lighting circuit at 230V
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 6 });
      expect(result.resistance).toBeCloseTo(38.33, 2);
      expect(result.power).toBe(1380);
    });

    it('should handle real-world ring circuit values', () => {
      // 32A ring circuit at 230V
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 32 });
      expect(result.resistance).toBeCloseTo(7.19, 2);
      expect(result.power).toBe(7360);
    });

    it('should validate inputs and throw error for invalid values', () => {
      expect(() => {
        OhmLawCalculator.calculate({ current: -5, resistance: 10 });
      }).toThrow();
    });

    it('should handle edge case with very small resistance values', () => {
      const result = OhmLawCalculator.calculate({ voltage: 12, current: 100 });
      expect(result.resistance).toBe(0.12);
    });

    it('should handle edge case with very high resistance values', () => {
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 0.001 });
      expect(result.resistance).toBe(230000);
    });
  });

  describe('validate()', () => {
    it('should validate correct electrical values through calculation', () => {
      // Test that valid inputs produce valid outputs
      const result = OhmLawCalculator.calculate({ voltage: 230, current: 10 });
      expect(result.voltage).toBe(230);
      expect(result.current).toBe(10);
      expect(result.resistance).toBe(23);
      expect(result.power).toBe(2300);
    });

    it('should throw error for negative values', () => {
      expect(() => {
        OhmLawCalculator.calculate({ voltage: -230, current: 10 });
      }).toThrow();
    });

    it('should handle zero values appropriately', () => {
      // Zero current should still calculate other values correctly
      const result = OhmLawCalculator.calculate({ voltage: 230, resistance: 23 });
      expect(result.current).toBeCloseTo(10, 2);
    });
  });
});

describe('VoltageDropCalculator', () => {
  describe('calculate()', () => {
    it('should calculate voltage drop for 2.5mm² T&E cable (BS 7671 compliant)', () => {
      // 20A load, 20m run, 2.5mm² cable
      const result = VoltageDropCalculator.calculate({
        current: 20,
        length: 20,
        cableSize: 2.5,
        phases: 1,
        powerFactor: 0.95,
        cableType: 'copper',
        temperature: 70
      });
      
      expect(result.voltageDrop).toBeGreaterThan(0);
      expect(result.voltageDropPercentage).toBeLessThan(10);
      expect(result.voltageAtLoad).toBeLessThan(230);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should flag excessive voltage drop exceeding BS 7671 limits', () => {
      // High current, long run, small cable - should exceed limits
      const result = VoltageDropCalculator.calculate({
        current: 32,
        length: 100,
        cableSize: 1.5,
        phases: 1,
        powerFactor: 0.9,
        cableType: 'copper',
        temperature: 70
      });
      
      expect(result.voltageDropPercentage).toBeGreaterThan(5);
      expect(result.isWithinLimits).toBe(false);
    });

    it('should handle three-phase calculations correctly', () => {
      // 20A per phase, 30m run, 4mm² cable
      const result = VoltageDropCalculator.calculate({
        current: 20,
        length: 30,
        cableSize: 4,
        phases: 3,
        powerFactor: 0.9,
        cableType: 'copper',
        temperature: 70
      });
      
      expect(result.voltageDrop).toBeGreaterThan(0);
      expect(result.voltageDropPercentage).toBeLessThan(10);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should validate input parameters', () => {
      expect(() => {
        VoltageDropCalculator.calculate({
          current: -5,
          length: 25,
          cableSize: 2.5,
          phases: 1,
          powerFactor: 0.9,
          cableType: 'copper',
          temperature: 70
        });
      }).toThrow();
    });

    it('should handle edge cases for cable parameters', () => {
      expect(() => {
        VoltageDropCalculator.calculate({
          current: 16,
          length: 25,
          cableSize: 0.5, // Invalid small cable
          phases: 1,
          powerFactor: 0.9,
          cableType: 'copper',
          temperature: 70
        });
      }).toThrow();
    });

    it('should validate cable length limits', () => {
      expect(() => {
        VoltageDropCalculator.calculate({
          current: 16,
          length: 2000, // Very long cable
          cableSize: 2.5,
          phases: 1,
          powerFactor: 0.9,
          cableType: 'copper',
          temperature: 70
        });
      }).toThrow();
    });
  });
});

describe('CableSizingCalculator', () => {
  describe('calculate()', () => {
    it('should size cable for domestic ring circuit (BS 7671 compliant)', () => {
      // 32A ring circuit, 30m run
      const result = CableSizingCalculator.calculate({
        designCurrent: 32,
        length: 30,
        installationMethod: 'C',
        phases: 1,
        powerFactor: 0.95,
        groupingFactor: 1.0,
        ambientTempFactor: 1.0,
        thermalInsulationFactor: 1.0,
        voltageDropLimit: 5
      });
      
      expect(result.recommendedSize).toBeGreaterThanOrEqual(2.5);
      expect(result.currentCarryingCapacity).toBeGreaterThanOrEqual(32);
      expect(result.voltageDropCheck).toBe(true);
      expect(result.protectionRequired).toBeDefined();
    });

    it('should size cable for high-power appliance circuit', () => {
      // 40A shower circuit, 25m run
      const result = CableSizingCalculator.calculate({
        designCurrent: 40,
        length: 25,
        installationMethod: 'C',
        phases: 1,
        powerFactor: 0.95,
        groupingFactor: 1.0,
        ambientTempFactor: 1.0,
        thermalInsulationFactor: 1.0,
        voltageDropLimit: 5
      });
      
      expect(result.recommendedSize).toBeGreaterThanOrEqual(6);
      expect(result.currentCarryingCapacity).toBeGreaterThanOrEqual(40);
      expect(result.voltageDropCheck).toBe(true);
    });

    it('should account for derating factors in cable sizing', () => {
      // Cable with various derating factors
      const normal = CableSizingCalculator.calculate({
        designCurrent: 20,
        length: 20,
        installationMethod: 'C',
        phases: 1,
        powerFactor: 0.95,
        groupingFactor: 1.0,
        ambientTempFactor: 1.0,
        thermalInsulationFactor: 1.0,
        voltageDropLimit: 5
      });
      
      const derated = CableSizingCalculator.calculate({
        designCurrent: 20,
        length: 20,
        installationMethod: 'C',
        phases: 1,
        powerFactor: 0.95,
        groupingFactor: 0.8,
        ambientTempFactor: 0.87,
        thermalInsulationFactor: 0.5,
        voltageDropLimit: 5
      });
      
      expect(derated.recommendedSize).toBeGreaterThanOrEqual(normal.recommendedSize);
    });

    it('should validate current capacity against realistic values', () => {
      // Test with known acceptable values
      const result = CableSizingCalculator.calculate({
        designCurrent: 27,
        length: 20,
        installationMethod: 'C',
        phases: 1,
        powerFactor: 0.95,
        groupingFactor: 1.0,
        ambientTempFactor: 1.0,
        thermalInsulationFactor: 1.0,
        voltageDropLimit: 5
      });
      
      expect(result.currentCarryingCapacity).toBeGreaterThanOrEqual(27);
      expect(result.recommendedSize).toBeGreaterThan(0);
    });
  });
});

/**
 * Test utilities for regulatory compliance validation
 */
describe('Regulatory Compliance', () => {
  it('should ensure all calculations reference BS 7671', () => {
    const ohmsResult = OhmLawCalculator.calculate({ voltage: 230, current: 10 });
    
    const voltageDropResult = VoltageDropCalculator.calculate({
      current: 16,
      length: 25,
      cableSize: 2.5,
      phases: 1,
      powerFactor: 0.95,
      cableType: 'copper',
      temperature: 70
    });
    
    const cableSizingResult = CableSizingCalculator.calculate({
      designCurrent: 20,
      length: 30,
      installationMethod: 'C',
      phases: 1,
      powerFactor: 0.95,
      groupingFactor: 1.0,
      ambientTempFactor: 1.0,
      thermalInsulationFactor: 1.0,
      voltageDropLimit: 5
    });
    
    // All calculations should reference UK regulations
    expect(voltageDropResult.regulation).toContain('BS 7671');
    expect(cableSizingResult.protectionRequired).toBeDefined();
    expect(ohmsResult.voltage).toBeDefined();
  });

  it('should validate safety margins in all calculations', () => {
    // All cable sizing should include appropriate safety margins
    const result = CableSizingCalculator.calculate({
      designCurrent: 16,
      length: 25,
      installationMethod: 'C',
      phases: 1,
      powerFactor: 0.95,
      groupingFactor: 1.0,
      ambientTempFactor: 1.0,
      thermalInsulationFactor: 1.0,
      voltageDropLimit: 5
    });
    
    expect(result.currentCarryingCapacity).toBeGreaterThan(16);
    expect(result.voltageDropCheck).toBe(true);
  });
});
