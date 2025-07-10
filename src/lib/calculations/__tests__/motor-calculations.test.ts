/**
 * Unit Tests for Motor Calculations
 * Tests motor load calculations, VFD sizing, and efficiency calculations
 * Based on BS 7671 and IEC motor standards
 */

import {
  MotorLoadCalculator,
  VFDSizingCalculator,
  MotorEfficiencyCalculator
} from '../specialized/motor-calculations';

describe('MotorLoadCalculator', () => {
  describe('calculate', () => {
    it('should calculate motor load for 3-phase motor correctly', () => {
      const inputs = {
        motorPower: 5.5, // 5.5kW motor
        voltage: 400,    // 400V 3-phase
        phases: 3 as const,
        efficiency: 0.85,
        powerFactor: 0.85,
        startingMethod: 'direct' as const,
        loadType: 'constant' as const,
        ambientTemp: 25
      };

      const result = MotorLoadCalculator.calculate(inputs);

      expect(result.motorPower).toBe(5.5);
      expect(result.fullLoadCurrent).toBeCloseTo(10.99, 1); // 5.5kW / (√3 × 400V × 0.85 × 0.85)
      expect(result.startingCurrent).toBeCloseTo(65.94, 1); // 6 × full load for direct starting
      expect(result.apparentPower).toBeCloseTo(7612, 0);
      expect(result.activePower).toBe(5500);
      expect(result.cableRating).toBeGreaterThan(result.fullLoadCurrent * 1.25);
      expect(result.protectionRating).toBeGreaterThanOrEqual(result.fullLoadCurrent * 1.25);
      expect(result.startingTime).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Consider soft start or VFD for motors ≥5.5kW to reduce grid impact');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate motor load for single-phase motor correctly', () => {
      const inputs = {
        motorPower: 1.5, // 1.5kW motor
        voltage: 230,    // 230V single-phase
        phases: 1 as const,
        efficiency: 0.80,
        powerFactor: 0.80,
        startingMethod: 'direct' as const,
        loadType: 'constant' as const,
        ambientTemp: 30
      };

      const result = MotorLoadCalculator.calculate(inputs);

      expect(result.motorPower).toBe(1.5);
      expect(result.fullLoadCurrent).toBeCloseTo(10.19, 1); // 1.5kW / (230V × 0.80 × 0.80)
      expect(result.startingCurrent).toBeCloseTo(61.14, 1); // 6 × full load for direct starting
      expect(result.apparentPower).toBeCloseTo(2344, 0);
      expect(result.activePower).toBe(1500);
      expect(result.cableRating).toBeGreaterThan(result.fullLoadCurrent * 1.25);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should apply correct derating for high ambient temperature', () => {
      const inputsNormal = {
        motorPower: 3.0,
        voltage: 400,
        phases: 3 as const,
        efficiency: 0.85,
        powerFactor: 0.85,
        startingMethod: 'direct' as const,
        loadType: 'constant' as const,
        ambientTemp: 25
      };

      const inputsHot = {
        ...inputsNormal,
        ambientTemp: 45
      };

      const resultNormal = MotorLoadCalculator.calculate(inputsNormal);
      const resultHot = MotorLoadCalculator.calculate(inputsHot);

      expect(resultHot.cableRating).toBeGreaterThanOrEqual(resultNormal.cableRating);
      expect(resultHot.recommendations).toContain('High ambient temperature - ensure adequate ventilation');
    });

    it('should calculate different starting currents for different starting methods', () => {
      const baseInputs = {
        motorPower: 7.5,
        voltage: 400,
        phases: 3 as const,
        efficiency: 0.87,
        powerFactor: 0.87,
        loadType: 'constant' as const,
        ambientTemp: 25
      };

      const directResult = MotorLoadCalculator.calculate({
        ...baseInputs,
        startingMethod: 'direct' as const
      });

      const starDeltaResult = MotorLoadCalculator.calculate({
        ...baseInputs,
        startingMethod: 'star_delta' as const
      });

      const vfdResult = MotorLoadCalculator.calculate({
        ...baseInputs,
        startingMethod: 'vfd' as const
      });

      expect(starDeltaResult.startingCurrent).toBeLessThan(directResult.startingCurrent);
      expect(vfdResult.startingCurrent).toBeLessThan(starDeltaResult.startingCurrent);
      expect(vfdResult.recommendations).toContain('VFD provides energy savings through speed control');
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs = [
        {
          motorPower: -1,
          voltage: 400,
          phases: 3 as const,
          efficiency: 0.85,
          powerFactor: 0.85,
          startingMethod: 'direct' as const,
          loadType: 'constant' as const,
          ambientTemp: 25
        },
        {
          motorPower: 5,
          voltage: 400,
          phases: 4 as any,
          efficiency: 0.85,
          powerFactor: 0.85,
          startingMethod: 'direct' as const,
          loadType: 'constant' as const,
          ambientTemp: 25
        },
        {
          motorPower: 5,
          voltage: 400,
          phases: 3 as const,
          efficiency: 1.5,
          powerFactor: 0.85,
          startingMethod: 'direct' as const,
          loadType: 'constant' as const,
          ambientTemp: 25
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => MotorLoadCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should handle high inertia loads correctly', () => {
      const normalLoad = {
        motorPower: 10,
        voltage: 400,
        phases: 3 as const,
        efficiency: 0.90,
        powerFactor: 0.85,
        startingMethod: 'direct' as const,
        loadType: 'constant' as const,
        ambientTemp: 25
      };

      const highInertiaLoad = {
        ...normalLoad,
        loadType: 'high_inertia' as const
      };

      const normalResult = MotorLoadCalculator.calculate(normalLoad);
      const highInertiaResult = MotorLoadCalculator.calculate(highInertiaLoad);

      expect(highInertiaResult.startingCurrent).toBeGreaterThan(normalResult.startingCurrent);
      expect(highInertiaResult.startingTime).toBeGreaterThan(normalResult.startingTime);
    });
  });
});

describe('VFDSizingCalculator', () => {
  describe('calculate', () => {
    it('should size VFD correctly for constant torque application', () => {
      const inputs = {
        motorPower: 15,
        motorVoltage: 400,
        motorCurrent: 30,
        operatingProfile: 'constant_torque' as const,
        overloadRequirement: 110,
        ambientTemp: 30,
        harmonicsMitigation: true
      };

      const result = VFDSizingCalculator.calculate(inputs);

      expect(result.recommendedVFDPower).toBeGreaterThan(inputs.motorPower);
      expect(result.recommendedVFDPower).toBeCloseTo(16.5, 1); // 15kW × 1.1
      expect(result.vfdCurrent).toBeGreaterThan(0);
      expect(result.efficiency).toBeGreaterThan(90);
      expect(result.harmonicDistortion).toBe(5); // With harmonic mitigation
      expect(result.operatingProfile).toBe('constant_torque');
      expect(result.recommendations).toContain('Harmonic filter reduces grid harmonic distortion');
      expect(result.regulation).toContain('IEC 61800');
    });

    it('should size VFD correctly for variable torque application', () => {
      const inputs = {
        motorPower: 22,
        motorVoltage: 400,
        motorCurrent: 42,
        operatingProfile: 'variable_torque' as const,
        overloadRequirement: 120,
        ambientTemp: 25,
        harmonicsMitigation: false
      };

      const result = VFDSizingCalculator.calculate(inputs);

      expect(result.recommendedVFDPower).toBeCloseTo(26.4, 1); // 22kW × 1.2 (overload requirement)
      expect(result.harmonicDistortion).toBe(35); // Without harmonic mitigation
      expect(result.operatingProfile).toBe('variable_torque');
      expect(result.recommendations).not.toContain('Harmonic filter');
    });

    it('should apply temperature derating for high ambient temperature', () => {
      const normalTemp = {
        motorPower: 30,
        motorVoltage: 400,
        motorCurrent: 57,
        operatingProfile: 'constant_torque' as const,
        overloadRequirement: 110,
        ambientTemp: 25,
        harmonicsMitigation: false
      };

      const highTemp = {
        ...normalTemp,
        ambientTemp: 45
      };

      const normalResult = VFDSizingCalculator.calculate(normalTemp);
      const highTempResult = VFDSizingCalculator.calculate(highTemp);

      expect(highTempResult.recommendedVFDPower).toBeGreaterThan(normalResult.recommendedVFDPower);
    });

    it('should validate VFD input parameters correctly', () => {
      const invalidInputs = [
        {
          motorPower: -5,
          motorVoltage: 400,
          motorCurrent: 10,
          operatingProfile: 'constant_torque' as const,
          overloadRequirement: 110,
          ambientTemp: 25,
          harmonicsMitigation: false
        },
        {
          motorPower: 5,
          motorVoltage: 400,
          motorCurrent: 10,
          operatingProfile: 'constant_torque' as const,
          overloadRequirement: 50, // Too low
          ambientTemp: 25,
          harmonicsMitigation: false
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => VFDSizingCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should calculate VFD efficiency based on power rating', () => {
      const smallMotor = {
        motorPower: 0.75,
        motorVoltage: 400,
        motorCurrent: 2,
        operatingProfile: 'constant_torque' as const,
        overloadRequirement: 110,
        ambientTemp: 25,
        harmonicsMitigation: false
      };

      const largeMotor = {
        ...smallMotor,
        motorPower: 75,
        motorCurrent: 140
      };

      const smallResult = VFDSizingCalculator.calculate(smallMotor);
      const largeResult = VFDSizingCalculator.calculate(largeMotor);

      expect(largeResult.efficiency).toBeGreaterThan(smallResult.efficiency);
    });
  });
});

describe('MotorEfficiencyCalculator', () => {
  describe('calculate', () => {
    it('should calculate motor efficiency correctly for IE3 motor', () => {
      const inputs = {
        motorPower: 5.5,
        loadFactor: 0.75,
        operatingHours: 4000,
        energyCost: 0.15,
        motorClass: 'IE3' as const,
        powerFactor: 0.85
      };

      const result = MotorEfficiencyCalculator.calculate(inputs);

      expect(result.efficiency).toBeGreaterThan(90);
      expect(result.inputPower).toBeGreaterThan(result.actualPower);
      expect(result.actualPower).toBeCloseTo(4.13, 1); // 5.5kW × 0.75 = 4.125kW
      expect(result.losses).toBeGreaterThan(0);
      expect(result.lossPercentage).toBeGreaterThan(0);
      expect(result.annualEnergyConsumption).toBeGreaterThan(0);
      expect(result.annualEnergyCost).toBeGreaterThan(0);
      expect(result.regulation).toContain('IEC 60034-30');
    });

    it('should show potential savings when upgrading motor class', () => {
      const ie2Motor = {
        motorPower: 11,
        loadFactor: 0.8,
        operatingHours: 6000,
        energyCost: 0.12,
        motorClass: 'IE2' as const,
        powerFactor: 0.87
      };

      const result = MotorEfficiencyCalculator.calculate(ie2Motor);

      expect(result.potentialSavings).not.toBeNull();
      if (result.potentialSavings) {
        expect(result.potentialSavings.annualSavings).toBeGreaterThan(0);
        expect(result.potentialSavings.paybackYears).toBeGreaterThan(0);
      }
    });

    it('should not show potential savings for highest efficiency class', () => {
      const ie4Motor = {
        motorPower: 7.5,
        loadFactor: 0.75,
        operatingHours: 5000,
        energyCost: 0.14,
        motorClass: 'IE4' as const,
        powerFactor: 0.90
      };

      const result = MotorEfficiencyCalculator.calculate(ie4Motor);

      expect(result.potentialSavings).toBeNull();
    });

    it('should provide recommendations for oversized motors', () => {
      const oversizedMotor = {
        motorPower: 15,
        loadFactor: 0.3, // Very low load factor
        operatingHours: 3000,
        energyCost: 0.13,
        motorClass: 'IE2' as const,
        powerFactor: 0.80
      };

      const result = MotorEfficiencyCalculator.calculate(oversizedMotor);

      expect(result.recommendations).toContain('Motor is oversized - consider smaller motor for better efficiency');
      expect(result.efficiency).toBeLessThan(87); // Poor efficiency at low load
    });

    it('should recommend efficiency upgrades for low efficiency motors', () => {
      const lowEfficiencyMotor = {
        motorPower: 3,
        loadFactor: 0.6,
        operatingHours: 4000,
        energyCost: 0.15,
        motorClass: 'IE1' as const,
        powerFactor: 0.80
      };

      const result = MotorEfficiencyCalculator.calculate(lowEfficiencyMotor);

      expect(result.recommendations).toContain('Consider upgrading to higher efficiency motor class');
    });

    it('should validate efficiency input parameters correctly', () => {
      const invalidInputs = [
        {
          motorPower: -5,
          loadFactor: 0.75,
          operatingHours: 4000,
          energyCost: 0.15,
          motorClass: 'IE3' as const,
          powerFactor: 0.85
        },
        {
          motorPower: 5,
          loadFactor: 1.5, // Too high
          operatingHours: 4000,
          energyCost: 0.15,
          motorClass: 'IE3' as const,
          powerFactor: 0.85
        },
        {
          motorPower: 5,
          loadFactor: 0.75,
          operatingHours: 10000, // Too many hours
          energyCost: 0.15,
          motorClass: 'IE3' as const,
          powerFactor: 0.85
        }
      ];

      invalidInputs.forEach(inputs => {
        expect(() => MotorEfficiencyCalculator.calculate(inputs)).toThrow();
      });
    });

    it('should calculate different efficiencies for different motor classes', () => {
      const baseInputs = {
        motorPower: 7.5,
        loadFactor: 0.8,
        operatingHours: 5000,
        energyCost: 0.14,
        powerFactor: 0.85
      };

      const ie1Result = MotorEfficiencyCalculator.calculate({
        ...baseInputs,
        motorClass: 'IE1' as const
      });

      const ie2Result = MotorEfficiencyCalculator.calculate({
        ...baseInputs,
        motorClass: 'IE2' as const
      });

      const ie3Result = MotorEfficiencyCalculator.calculate({
        ...baseInputs,
        motorClass: 'IE3' as const
      });

      const ie4Result = MotorEfficiencyCalculator.calculate({
        ...baseInputs,
        motorClass: 'IE4' as const
      });

      expect(ie2Result.efficiency).toBeGreaterThan(ie1Result.efficiency);
      expect(ie3Result.efficiency).toBeGreaterThan(ie2Result.efficiency);
      expect(ie4Result.efficiency).toBeGreaterThan(ie3Result.efficiency);

      expect(ie1Result.annualEnergyCost).toBeGreaterThan(ie2Result.annualEnergyCost);
      expect(ie2Result.annualEnergyCost).toBeGreaterThan(ie3Result.annualEnergyCost);
      expect(ie3Result.annualEnergyCost).toBeGreaterThan(ie4Result.annualEnergyCost);
    });

    it('should handle edge cases for motor power ratings', () => {
      const smallMotor = {
        motorPower: 0.5, // Below standard ratings
        loadFactor: 0.75,
        operatingHours: 2000,
        energyCost: 0.15,
        motorClass: 'IE3' as const,
        powerFactor: 0.80
      };

      const largeMotor = {
        motorPower: 50, // Above standard ratings
        loadFactor: 0.85,
        operatingHours: 6000,
        energyCost: 0.12,
        motorClass: 'IE3' as const,
        powerFactor: 0.90
      };

      expect(() => MotorEfficiencyCalculator.calculate(smallMotor)).not.toThrow();
      expect(() => MotorEfficiencyCalculator.calculate(largeMotor)).not.toThrow();

      const smallResult = MotorEfficiencyCalculator.calculate(smallMotor);
      const largeResult = MotorEfficiencyCalculator.calculate(largeMotor);

      expect(smallResult.efficiency).toBeGreaterThan(0);
      expect(largeResult.efficiency).toBeGreaterThan(0);
    });
  });
});
