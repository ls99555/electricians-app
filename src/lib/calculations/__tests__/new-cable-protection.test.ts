/**
 * Unit Tests for New Cable & Protection Calculations
 * Testing cable route length, fuse selection, and cable screen/armour calculations
 * All tests validate against UK regulations and standards
 */

import { describe, it, expect } from '@jest/globals';
import { 
  CableRouteLengthCalculator,
  FuseSelectionCalculator,
  CableScreenArmourCalculator
} from '../core/cable-protection';

describe('CableRouteLengthCalculator', () => {
  describe('calculate()', () => {
    it('should calculate route length for simple surface installation', () => {
      const inputs = {
        directDistance: 50,
        routeType: 'surface_clipped',
        numberOfBends: 4,
        numberOfChanges: 2,
        heightDifference: 3,
        safetyMargin: 10,
        routeObstacles: ['beam']
      };

      const result = CableRouteLengthCalculator.calculate(inputs);

      expect(result.directDistance).toBe(50);
      expect(result.totalRouteLength).toBeGreaterThan(50);
      expect(result.bendsAllowance).toBeGreaterThan(0);
      expect(result.heightAllowance).toBeGreaterThan(0);
      expect(result.obstacleAllowance).toBeGreaterThan(0);
      expect(result.safetyAllowance).toBeGreaterThan(0);
      expect(result.costImplications.additionalCableCost).toBeGreaterThan(0);
      expect(result.costImplications.voltageDrop).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate route length for underground installation', () => {
      const inputs = {
        directDistance: 100,
        routeType: 'underground',
        numberOfBends: 2,
        numberOfChanges: 1,
        heightDifference: 0,
        safetyMargin: 15,
        routeObstacles: ['pipe_cluster', 'structural_member']
      };

      const result = CableRouteLengthCalculator.calculate(inputs);

      expect(result.totalRouteLength).toBeGreaterThan(100);
      expect(result.costImplications.voltageDrop).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('Underground'))).toBe(true);
    });

    it('should handle complex routing with multiple obstacles', () => {
      const inputs = {
        directDistance: 75,
        routeType: 'cable_tray',
        numberOfBends: 8,
        numberOfChanges: 4,
        heightDifference: 10,
        safetyMargin: 20,
        routeObstacles: ['equipment', 'tight_space', 'beam']
      };

      const result = CableRouteLengthCalculator.calculate(inputs);

      expect(result.totalRouteLength).toBeGreaterThan(result.directDistance * 1.3);
      expect(result.recommendations.some(r => r.includes('bends'))).toBe(true);
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs = {
        directDistance: 0,
        routeType: 'surface',
        numberOfBends: 2,
        numberOfChanges: 1,
        heightDifference: 0,
        safetyMargin: 10,
        routeObstacles: []
      };

      expect(() => CableRouteLengthCalculator.calculate(invalidInputs)).toThrow();
    });

    it('should provide cost implications for extended routes', () => {
      const inputs = {
        directDistance: 30,
        routeType: 'rigid_conduit',
        numberOfBends: 6,
        numberOfChanges: 3,
        heightDifference: 5,
        safetyMargin: 15,
        routeObstacles: ['beam', 'equipment']
      };

      const result = CableRouteLengthCalculator.calculate(inputs);

      expect(result.costImplications.additionalCableCost).toBeGreaterThan(0);
      expect(result.costImplications.voltageDrop).toBeGreaterThan(0);
    });
  });
});

describe('FuseSelectionCalculator', () => {
  describe('calculate()', () => {
    it('should select appropriate fuse for general load', () => {
      const inputs = {
        loadCurrent: 18,
        cableCurrent: 25,
        fuseType: 'BS88',
        applicationCategory: 'general',
        ambientTemperature: 30,
        shortCircuitCurrent: 6,
        discriminationRequired: false
      };

      const result = FuseSelectionCalculator.calculate(inputs);

      expect(result.recommendedFuseRating).toBeGreaterThanOrEqual(18);
      expect(result.recommendedFuseRating).toBeLessThanOrEqual(25);
      expect(result.fuseType).toBe('BS88');
      expect(result.fuseCategory).toBe('High Rupturing Capacity');
      expect(result.breakingCapacity).toBeGreaterThan(0);
      expect(result.complianceChecks.overloadProtection).toBe(true);
      expect(result.complianceChecks.shortCircuitProtection).toBe(true);
      expect(result.complianceChecks.cableProtection).toBe(true);
      expect(result.recommendations).toBeDefined();
    });

    it('should select fuse for motor application with starting current consideration', () => {
      const inputs = {
        loadCurrent: 15,
        cableCurrent: 32,
        fuseType: 'BS1361',
        applicationCategory: 'motor',
        ambientTemperature: 40,
        shortCircuitCurrent: 4,
        discriminationRequired: false
      };

      const result = FuseSelectionCalculator.calculate(inputs);

      // Motor application should consider 1.25 factor for starting current
      expect(result.recommendedFuseRating).toBeGreaterThan(15 * 1.2); // Allow for motor starting
      expect(result.fuseCategory).toBe('Cartridge Fuse');
      expect(result.temperatureDerating).toBeLessThan(1.0); // 40°C should cause derating
    });

    it('should handle discrimination requirements', () => {
      const inputs = {
        loadCurrent: 12,
        cableCurrent: 20,
        fuseType: 'BS88',
        applicationCategory: 'lighting',
        ambientTemperature: 25,
        shortCircuitCurrent: 8,
        discriminationRequired: true,
        upstreamProtection: 50
      };

      const result = FuseSelectionCalculator.calculate(inputs);

      expect(result.discriminationMargin).toBeGreaterThan(0);
      expect(result.complianceChecks.discrimination).toBe(true);
      expect(result.recommendedFuseRating).toBeLessThan(50); // Must be smaller than upstream
    });

    it('should handle high temperature environment', () => {
      const inputs = {
        loadCurrent: 20,
        cableCurrent: 30,
        fuseType: 'HRC',
        applicationCategory: 'heating',
        ambientTemperature: 60,
        shortCircuitCurrent: 10,
        discriminationRequired: false
      };

      const result = FuseSelectionCalculator.calculate(inputs);

      expect(result.temperatureDerating).toBeLessThan(0.9); // High temperature derating
      expect(result.complianceChecks.cableProtection).toBe(true);
    });

    it('should identify when no suitable fuse exists', () => {
      const inputs = {
        loadCurrent: 45,
        cableCurrent: 40, // Cable too small for load
        fuseType: 'BS88',
        applicationCategory: 'general',
        ambientTemperature: 30,
        shortCircuitCurrent: 5,
        discriminationRequired: false
      };

      expect(() => FuseSelectionCalculator.calculate(inputs)).toThrow();
    });

    it('should provide motor-specific recommendations', () => {
      const inputs = {
        loadCurrent: 25,
        cableCurrent: 50,
        fuseType: 'BS88',
        applicationCategory: 'motor',
        ambientTemperature: 35,
        shortCircuitCurrent: 12,
        discriminationRequired: false
      };

      const result = FuseSelectionCalculator.calculate(inputs);

      expect(result.recommendations.some(r => r.includes('motor protection'))).toBe(true);
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs = {
        loadCurrent: 0,
        cableCurrent: 25,
        fuseType: 'BS88',
        applicationCategory: 'general',
        ambientTemperature: 30,
        shortCircuitCurrent: 6,
        discriminationRequired: false
      };

      expect(() => FuseSelectionCalculator.calculate(invalidInputs)).toThrow();
    });
  });
});

describe('CableScreenArmourCalculator', () => {
  describe('calculate()', () => {
    it('should calculate screen and armour for standard indoor cable', () => {
      const inputs = {
        cableCores: 3,
        coreCSA: 2.5,
        systemVoltage: 400,
        installationEnvironment: 'indoor',
        mechanicalProtection: 'light',
        faultCurrent: 100,
        faultDuration: 0.4,
        screenType: 'foil',
        armourRequired: false
      };

      const result = CableScreenArmourCalculator.calculate(inputs);

      expect(result.screenCSA).toBeGreaterThan(0);
      expect(result.armourType).toBe('None');
      expect(result.earthingRequirements.screenEarthing).toContain('Required');
      expect(result.earthingRequirements.earthConductor).toBeGreaterThan(0);
      expect(result.mechanicalProtection.bendRadius).toBeGreaterThan(0);
      expect(result.environmentalProtection.moistureResistance).toBe('Standard');
      expect(result.recommendations).toBeDefined();
    });

    it('should calculate armour for underground installation', () => {
      const inputs = {
        cableCores: 4,
        coreCSA: 10,
        systemVoltage: 11000,
        installationEnvironment: 'underground',
        mechanicalProtection: 'heavy',
        faultCurrent: 1000,
        faultDuration: 1.0,
        screenType: 'wire',
        armourRequired: true
      };

      const result = CableScreenArmourCalculator.calculate(inputs);

      expect(result.screenCSA).toBeGreaterThan(0);
      expect(result.armourType).toBe('Steel Wire Armour');
      expect(result.armourThickness).toBeGreaterThan(1);
      expect(result.earthingRequirements.armourEarthing).toContain('Required');
      expect(result.mechanicalProtection.tensileStrength).toBeGreaterThan(500);
      expect(result.environmentalProtection.moistureResistance).toBe('Excellent');
      expect(result.recommendations.some(r => r.includes('underground'))).toBe(true);
    });

    it('should calculate for marine environment', () => {
      const inputs = {
        cableCores: 3,
        coreCSA: 16,
        systemVoltage: 690,
        installationEnvironment: 'marine',
        mechanicalProtection: 'heavy',
        faultCurrent: 500,
        faultDuration: 0.5,
        screenType: 'braid',
        armourRequired: true
      };

      const result = CableScreenArmourCalculator.calculate(inputs);

      expect(result.armourType).toBe('Galvanized Steel Wire');
      expect(result.environmentalProtection.corrosionProtection).toBe('Marine Grade');
      expect(result.environmentalProtection.moistureResistance).toBe('Excellent');
      expect(result.environmentalProtection.uvResistance).toBe('High');
    });

    it('should calculate screen CSA based on fault current', () => {
      const highFaultInputs = {
        cableCores: 3,
        coreCSA: 25,
        systemVoltage: 3300,
        installationEnvironment: 'indoor',
        mechanicalProtection: 'medium',
        faultCurrent: 2000,
        faultDuration: 0.8,
        screenType: 'copper_wire',
        armourRequired: false
      };

      const lowFaultInputs = { ...highFaultInputs, faultCurrent: 200 };

      const highResult = CableScreenArmourCalculator.calculate(highFaultInputs);
      const lowResult = CableScreenArmourCalculator.calculate(lowFaultInputs);

      expect(highResult.screenCSA).toBeGreaterThanOrEqual(lowResult.screenCSA);
    });

    it('should provide different armour types for different protection levels', () => {
      const lightInputs = {
        cableCores: 3,
        coreCSA: 4,
        systemVoltage: 400,
        installationEnvironment: 'outdoor',
        mechanicalProtection: 'light',
        faultCurrent: 100,
        faultDuration: 0.4,
        screenType: 'foil',
        armourRequired: true
      };

      const heavyInputs = { ...lightInputs, mechanicalProtection: 'heavy' };

      const lightResult = CableScreenArmourCalculator.calculate(lightInputs);
      const heavyResult = CableScreenArmourCalculator.calculate(heavyInputs);

      expect(lightResult.armourType).toBe('Aluminium Wire Armour');
      expect(heavyResult.armourType).toBe('Steel Wire Armour');
      expect(heavyResult.mechanicalProtection.tensileStrength).toBeGreaterThan(
        lightResult.mechanicalProtection.tensileStrength
      );
    });

    it('should calculate mechanical properties correctly', () => {
      const inputs = {
        cableCores: 3,
        coreCSA: 35,
        systemVoltage: 1000,
        installationEnvironment: 'industrial',
        mechanicalProtection: 'medium',
        faultCurrent: 800,
        faultDuration: 0.6,
        screenType: 'tape',
        armourRequired: true
      };

      const result = CableScreenArmourCalculator.calculate(inputs);

      expect(result.mechanicalProtection.bendRadius).toBeGreaterThan(0);
      expect(result.mechanicalProtection.tensileStrength).toBeGreaterThan(0);
      expect(result.mechanicalProtection.compressionResistance).toBeGreaterThan(0);
    });

    it('should provide high voltage specific recommendations', () => {
      const inputs = {
        cableCores: 3,
        coreCSA: 50,
        systemVoltage: 11000, // High voltage
        installationEnvironment: 'underground',
        mechanicalProtection: 'heavy',
        faultCurrent: 1500,
        faultDuration: 1.0,
        screenType: 'copper_wire',
        armourRequired: true
      };

      const result = CableScreenArmourCalculator.calculate(inputs);

      expect(result.recommendations.some(r => r.includes('High voltage'))).toBe(true);
    });
  });
});

describe('Cable & Protection Integration Tests', () => {
  it('should provide consistent results across related calculations', () => {
    // Test that route length affects fuse selection through voltage drop considerations
    const shortRoute = {
      directDistance: 20,
      routeType: 'surface_clipped',
      numberOfBends: 2,
      numberOfChanges: 1,
      heightDifference: 0,
      safetyMargin: 10,
      routeObstacles: []
    };

    const longRoute = { ...shortRoute, directDistance: 150 };

    const shortResult = CableRouteLengthCalculator.calculate(shortRoute);
    const longResult = CableRouteLengthCalculator.calculate(longRoute);

    expect(longResult.costImplications.voltageDrop).toBeGreaterThan(
      shortResult.costImplications.voltageDrop
    );
  });

  it('should handle edge cases gracefully', () => {
    // Test minimum values
    const minInputs = {
      directDistance: 1,
      routeType: 'surface_clipped',
      numberOfBends: 0,
      numberOfChanges: 0,
      heightDifference: 0,
      safetyMargin: 5,
      routeObstacles: []
    };

    const result = CableRouteLengthCalculator.calculate(minInputs);
    expect(result.totalRouteLength).toBeGreaterThan(0);
  });
});
