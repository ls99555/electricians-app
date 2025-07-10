/**
 * Tests for Protection & Safety Reference Data and Helper Functions
 * Tests UK electrical protection and safety reference information
 * Based on BS 7671:2018+A2:2022 Chapter 41 and 43
 */

import {
  OVERCURRENT_PROTECTION_DEVICES,
  RESIDUAL_CURRENT_DEVICES,
  MAX_ZS_VALUES,
  DISCONNECTION_TIMES,
  TOUCH_VOLTAGE_LIMITS,
  ProtectionSafetyHelper
} from '../protection-safety-references';

describe('Protection & Safety References', () => {
  describe('Overcurrent Protection Devices', () => {
    it('should contain MCB characteristics with proper trip ranges', () => {
      const mcb = OVERCURRENT_PROTECTION_DEVICES.mcb;
      
      expect(mcb.characteristics.B.magneticTrip).toBe('3-5 × In');
      expect(mcb.characteristics.C.magneticTrip).toBe('5-10 × In');
      expect(mcb.characteristics.D.magneticTrip).toBe('10-20 × In');
    });

    it('should have standard MCB ratings', () => {
      const ratings = OVERCURRENT_PROTECTION_DEVICES.mcb.standardRatings;
      
      expect(ratings).toContain(6);
      expect(ratings).toContain(16);
      expect(ratings).toContain(32);
      expect(ratings).toContain(63);
      expect(ratings.length).toBeGreaterThan(5);
    });

    it('should contain RCBO types with correct detection capabilities', () => {
      const rcbo = OVERCURRENT_PROTECTION_DEVICES.rcbo;
      
      expect(rcbo.types.AC.detects).toContain('AC sinusoidal');
      expect(rcbo.types.A.detects).toContain('pulsating DC');
      expect(rcbo.types.F.detects).toContain('composite waveforms');
      expect(rcbo.types.B.detects).toContain('All residual current types');
    });

    it('should have correct RCD sensitivity ratings', () => {
      const sensitivities = OVERCURRENT_PROTECTION_DEVICES.rcbo.sensitivityRatings;
      
      expect(sensitivities).toContain(10);
      expect(sensitivities).toContain(30);
      expect(sensitivities).toContain(100);
      expect(sensitivities).toContain(300);
    });

    it('should contain fuse types with appropriate applications', () => {
      const fuses = OVERCURRENT_PROTECTION_DEVICES.fuses;
      
      expect(fuses.types.gG.characteristic).toBe('Full range protection');
      expect(fuses.types.aM.characteristic).toBe('Short circuit protection only');
      expect(fuses.types.aM.applicationNote).toContain('Motor circuits');
    });
  });

  describe('Residual Current Devices', () => {
    it('should define RCD types according to current standards', () => {
      const rcd = RESIDUAL_CURRENT_DEVICES;
      
      expect(rcd.types.AC.phaseOut).toContain('Being phased out');
      expect(rcd.types.A.currentRequirement).toContain('Minimum requirement');
      expect(rcd.types.F.frequencyRange).toBe('5Hz to 1kHz');
      expect(rcd.types.B.dcDetection).toContain('6mA smooth DC');
    });

    it('should have correct sensitivity levels with proper applications', () => {
      const levels = RESIDUAL_CURRENT_DEVICES.sensitivityLevels;
      
      expect(levels[10].application).toContain('Special protection');
      expect(levels[30].application).toContain('Personal protection');
      expect(levels[100].application).toContain('Fire protection');
      expect(levels[300].application).toContain('Equipment protection');
    });

    it('should specify correct operating times', () => {
      const times = RESIDUAL_CURRENT_DEVICES.operatingTimes.times;
      
      expect(times.I_n.max).toBe('300ms');
      expect(times['2×I_n'].max).toBe('150ms');
      expect(times['5×I_n'].max).toBe('40ms');
    });

    it('should reference correct regulations for each sensitivity', () => {
      const levels = RESIDUAL_CURRENT_DEVICES.sensitivityLevels;
      
      expect(levels[10].regulation).toContain('BS 7671 Regulation 415.1.1');
      expect(levels[30].regulation).toContain('BS 7671 Regulation 415.1.1');
      expect(levels[100].regulation).toContain('BS 7671 Regulation 422.3.9');
      expect(levels[300].regulation).toContain('BS 7671 Regulation 531.3.3');
    });
  });

  describe('Maximum Zs Values', () => {
    it('should contain MCB Zs values for 230V system', () => {
      const mcb230 = MAX_ZS_VALUES.mcb_bs_en_60898.voltage_230v;
      
      expect(mcb230.B32).toBe(1.44);
      expect(mcb230.C32).toBe(0.72);
      expect(mcb230.D32).toBe(0.36);
    });

    it('should contain MCB Zs values for 400V system', () => {
      const mcb400 = MAX_ZS_VALUES.mcb_bs_en_60898.voltage_400v;
      
      expect(mcb400.B32).toBe(2.5);
      expect(mcb400.C32).toBe(1.25);
      expect(mcb400.D32).toBe(0.63);
    });

    it('should show decreasing Zs with increasing current rating', () => {
      const mcb230 = MAX_ZS_VALUES.mcb_bs_en_60898.voltage_230v;
      
      expect(mcb230.C16).toBeGreaterThan(mcb230.C32);
      expect(mcb230.C32).toBeGreaterThan(mcb230.C63);
    });

    it('should show Type B > Type C > Type D for same rating', () => {
      const mcb230 = MAX_ZS_VALUES.mcb_bs_en_60898.voltage_230v;
      
      expect(mcb230.B32).toBeGreaterThan(mcb230.C32);
      expect(mcb230.C32).toBeGreaterThan(mcb230.D32);
    });

    it('should contain BS 88 fuse Zs values', () => {
      const fuse230 = MAX_ZS_VALUES.fuses_bs_88.voltage_230v;
      
      expect(fuse230['32']).toBe(1.44);
      expect(fuse230['63']).toBe(0.73);
      expect(fuse230['100']).toBe(0.46);
    });

    it('should have realistic RCD Zs limits', () => {
      const rcdLimits = MAX_ZS_VALUES.rcd_protection.max_zs_with_rcd;
      
      expect(rcdLimits['30mA']).toBe(1667);
      expect(rcdLimits['100mA']).toBe(500);
      expect(rcdLimits['30mA']).toBeGreaterThan(rcdLimits['100mA']);
    });
  });

  describe('Disconnection Times', () => {
    it('should specify correct times for final circuits', () => {
      const finalCircuits = DISCONNECTION_TIMES.final_circuits;
      
      expect(finalCircuits['230V_system'].TN.max_time).toBe('0.4s');
      expect(finalCircuits['230V_system'].TT.max_time).toBe('0.2s');
      expect(finalCircuits['400V_system'].TN.max_time).toBe('0.4s');
    });

    it('should specify correct times for distribution circuits', () => {
      const distCircuits = DISCONNECTION_TIMES.distribution_circuits;
      
      expect(distCircuits['230V_system'].TN.max_time).toBe('5s');
      expect(distCircuits['230V_system'].TT.max_time).toBe('1s');
      expect(distCircuits['400V_system'].TN.max_time).toBe('5s');
    });

    it('should have reduced times for special locations', () => {
      const special = DISCONNECTION_TIMES.special_locations;
      
      expect(special.bathrooms.time).toBe('0.4s');
      expect(special.swimming_pools.time).toBe('0.4s');
      expect(special.construction_sites.time).toBe('0.4s');
      expect(special.agricultural.time).toBe('0.2s');
    });

    it('should reference correct regulations', () => {
      const finalCircuits = DISCONNECTION_TIMES.final_circuits;
      
      expect(finalCircuits.regulation).toContain('BS 7671 Regulation 411.3.2.2');
    });
  });

  describe('Touch Voltage Limits', () => {
    it('should define correct voltage limits for different conditions', () => {
      const limits = TOUCH_VOLTAGE_LIMITS.limits;
      
      expect(limits.dry_conditions.voltage).toBe('50V');
      expect(limits.wet_conditions.voltage).toBe('25V');
      expect(limits.immersion_conditions.voltage).toBe('12V');
    });

    it('should have appropriate applications for each limit', () => {
      const limits = TOUCH_VOLTAGE_LIMITS.limits;
      
      expect(limits.dry_conditions.application).toBe('General locations');
      expect(limits.wet_conditions.application).toContain('Bathrooms');
      expect(limits.immersion_conditions.application).toContain('Swimming pool zones');
    });

    it('should provide body resistance ranges', () => {
      const resistance = TOUCH_VOLTAGE_LIMITS.body_resistance;
      
      expect(resistance.dry_skin.typical).toBe('2000Ω');
      expect(resistance.wet_skin.typical).toBe('1000Ω');
      expect(resistance.immersed.typical).toBe('500Ω');
    });
  });
});

describe('ProtectionSafetyHelper', () => {
  describe('getMaxZs', () => {
    it('should return correct Zs for MCB Type C 32A at 230V', () => {
      const zs = ProtectionSafetyHelper.getMaxZs('mcb', '32', 'C', '230');
      expect(zs).toBe(0.72);
    });

    it('should return correct Zs for MCB Type B 16A at 400V', () => {
      const zs = ProtectionSafetyHelper.getMaxZs('mcb', '16', 'B', '400');
      expect(zs).toBe(5.0);
    });

    it('should return correct Zs for BS 88 fuse 63A at 230V', () => {
      const zs = ProtectionSafetyHelper.getMaxZs('fuse', '63', undefined, '230');
      expect(zs).toBe(0.73);
    });

    it('should return null for invalid combinations', () => {
      const zs = ProtectionSafetyHelper.getMaxZs('mcb', '999', 'C', '230');
      expect(zs).toBeNull();
    });

    it('should handle RCD Zs limits', () => {
      const zs30 = ProtectionSafetyHelper.getMaxZs('rcd', '30');
      const zs100 = ProtectionSafetyHelper.getMaxZs('rcd', '100');
      
      expect(zs30).toBe(1667);
      expect(zs100).toBe(500);
    });
  });

  describe('checkDisconnectionTime', () => {
    it('should return correct time for TN final circuit at 230V', () => {
      const result = ProtectionSafetyHelper.checkDisconnectionTime('TN', 'final', '230');
      
      expect(result.maxTime).toBe('0.4s');
      expect(result.regulation).toContain('BS 7671 Regulation 411.3.2.2');
    });

    it('should return correct time for TT distribution circuit', () => {
      const result = ProtectionSafetyHelper.checkDisconnectionTime('TT', 'distribution', '230');
      
      expect(result.maxTime).toBe('1s');
    });

    it('should handle special locations', () => {
      const result = ProtectionSafetyHelper.checkDisconnectionTime('TN', 'final', '230', 'bathrooms');
      
      expect(result.maxTime).toBe('0.4s');
      expect(result.regulation).toContain('BS 7671 Section 701');
    });

    it('should prioritize special location requirements', () => {
      const result = ProtectionSafetyHelper.checkDisconnectionTime('TT', 'final', '230', 'agricultural');
      
      expect(result.maxTime).toBe('0.2s');
    });
  });

  describe('getTouchVoltageLimit', () => {
    it('should return correct limits for different conditions', () => {
      const dry = ProtectionSafetyHelper.getTouchVoltageLimit('dry');
      const wet = ProtectionSafetyHelper.getTouchVoltageLimit('wet');
      const immersion = ProtectionSafetyHelper.getTouchVoltageLimit('immersion');
      
      expect(dry.voltage).toBe('50V');
      expect(wet.voltage).toBe('25V');
      expect(immersion.voltage).toBe('12V');
    });

    it('should provide appropriate application notes', () => {
      const dry = ProtectionSafetyHelper.getTouchVoltageLimit('dry');
      const wet = ProtectionSafetyHelper.getTouchVoltageLimit('wet');
      
      expect(dry.application).toBe('General locations');
      expect(wet.application).toContain('swimming pools');
    });
  });

  describe('calculateMaxFaultCurrent', () => {
    it('should calculate fault current correctly', () => {
      const current = ProtectionSafetyHelper.calculateMaxFaultCurrent(230, 0.72);
      expect(current).toBeCloseTo(319.44, 2);
    });

    it('should handle different voltages', () => {
      const current400 = ProtectionSafetyHelper.calculateMaxFaultCurrent(400, 1.25);
      expect(current400).toBe(320);
    });
  });

  describe('validateProtectionDevice', () => {
    it('should validate proper MCB selection', () => {
      const result = ProtectionSafetyHelper.validateProtectionDevice({
        deviceType: 'mcb',
        rating: 32,
        characteristic: 'C',
        circuitCurrent: 20, // Reduced to be well within 1.45× factor
        faultCurrent: 300,
        zs: 0.65,
        voltage: 230,
        systemType: 'TN'
      });
      
      expect(result.valid).toBe(true);
      expect(result.compliance.some(comp => comp.includes('BS 7671 Table 41.2'))).toBe(true);
    });

    it('should identify Zs compliance issues', () => {
      const result = ProtectionSafetyHelper.validateProtectionDevice({
        deviceType: 'mcb',
        rating: 32,
        characteristic: 'C',
        circuitCurrent: 20,
        faultCurrent: 250,
        zs: 1.5, // Exceeds 0.72Ω limit for C32
        voltage: 230,
        systemType: 'TN'
      });
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Zs'))).toBe(true);
    });

    it('should check device rating adequacy', () => {
      const result = ProtectionSafetyHelper.validateProtectionDevice({
        deviceType: 'mcb',
        rating: 16,
        characteristic: 'C',
        circuitCurrent: 15, // Too close to rating
        faultCurrent: 200,
        zs: 1.0,
        voltage: 230,
        systemType: 'TN'
      });
      
      expect(result.issues.some(issue => issue.includes('rating may be insufficient'))).toBe(true);
    });

    it('should provide RCD recommendations', () => {
      const result = ProtectionSafetyHelper.validateProtectionDevice({
        deviceType: 'rcbo',
        rating: 32,
        rcdSensitivity: 30,
        rcdType: 'AC',
        circuitCurrent: 20,
        faultCurrent: 250,
        zs: 0.5,
        voltage: 230,
        systemType: 'TN'
      });
      
      expect(result.recommendations.some(rec => rec.includes('Type A or F'))).toBe(true);
      expect(result.compliance.some(comp => comp.includes('30mA RCD'))).toBe(true);
    });
  });

  describe('Real-world protection scenarios', () => {
    it('should handle domestic ring circuit protection', () => {
      // 32A MCB Type B for ring circuit
      const zs = ProtectionSafetyHelper.getMaxZs('mcb', '32', 'B', '230');
      expect(zs).toBe(1.44);
      
      const disconnection = ProtectionSafetyHelper.checkDisconnectionTime('TN', 'final', '230');
      expect(disconnection.maxTime).toBe('0.4s');
    });

    it('should handle bathroom circuit requirements', () => {
      const disconnection = ProtectionSafetyHelper.checkDisconnectionTime('TN', 'final', '230', 'bathrooms');
      const touchLimit = ProtectionSafetyHelper.getTouchVoltageLimit('wet');
      
      expect(disconnection.maxTime).toBe('0.4s');
      expect(touchLimit.voltage).toBe('25V');
    });

    it('should handle industrial installation with high fault current', () => {
      const validation = ProtectionSafetyHelper.validateProtectionDevice({
        deviceType: 'mcb',
        rating: 63,
        characteristic: 'C',
        circuitCurrent: 40, // Reduced to be within 1.45× factor (40 × 1.45 = 58A < 63A)
        faultCurrent: 15000, // High industrial fault current
        zs: 0.3,
        voltage: 400,
        systemType: 'TN'
      });
      
      expect(validation.recommendations.some(rec => 
        rec.includes('breaking capacity'))).toBe(true);
    });

    it('should handle TT system with RCD protection', () => {
      const disconnection = ProtectionSafetyHelper.checkDisconnectionTime('TT', 'final', '230');
      const rcdZs = ProtectionSafetyHelper.getMaxZs('rcd', '30');
      
      expect(disconnection.maxTime).toBe('0.2s');
      expect(rcdZs).toBe(1667); // Much higher than MCB limits
    });
  });

  describe('Regulation compliance validation', () => {
    it('should ensure MCB Zs values comply with BS 7671 Table 41.2', () => {
      const mcb230 = MAX_ZS_VALUES.mcb_bs_en_60898.voltage_230v;
      
      // Spot check key values against BS 7671
      expect(mcb230.B32).toBe(1.44);
      expect(mcb230.C20).toBe(1.15);
      expect(mcb230.D16).toBe(0.72);
    });

    it('should ensure disconnection times comply with BS 7671 Chapter 41', () => {
      // Final circuit times should not exceed 0.4s for TN systems
      const finalTN = DISCONNECTION_TIMES.final_circuits['230V_system'].TN.max_time;
      expect(finalTN).toBe('0.4s');
      
      // TT systems should have reduced times
      const finalTT = DISCONNECTION_TIMES.final_circuits['230V_system'].TT.max_time;
      expect(finalTT).toBe('0.2s');
    });

    it('should ensure touch voltage limits comply with BS 7671', () => {
      const limits = TOUCH_VOLTAGE_LIMITS.limits;
      
      // Standard limit should be 50V
      expect(limits.dry_conditions.voltage).toBe('50V');
      
      // Reduced limits for wet conditions
      expect(limits.wet_conditions.voltage).toBe('25V');
    });

    it('should ensure RCD types meet current requirements', () => {
      const rcdTypes = RESIDUAL_CURRENT_DEVICES.types;
      
      // Type A should be minimum requirement
      expect(rcdTypes.A.currentRequirement).toContain('Minimum requirement');
      
      // Type AC should be phased out
      expect(rcdTypes.AC.phaseOut).toContain('Being phased out');
    });
  });
});
