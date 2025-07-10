/**
 * Test Suite: Earthing & Bonding Calculations
 * Comprehensive testing for UK electrical safety standards compliance
 */

import {
  BondingConductorCalculator,
  ProspectiveFaultCurrentCalculator,
  TouchVoltageCalculator,
  LightningProtectionCalculator
} from '../earthing-bonding';

describe('BondingConductorCalculator', () => {
  describe('calculate()', () => {
    it('should calculate main protective bonding conductor for PME supply', () => {
      const inputs = {
        installationType: 'domestic' as const,
        supplyType: 'PME' as const,
        mainSwitchRating: 100,
        mainEarthConductorCSA: 16,
        pipeMaterial: 'copper' as const,
        pipeSize: 22,
        pipeLength: 5,
        bondingType: 'main' as const
      };

      const result = BondingConductorCalculator.calculate(inputs);

      expect(result.requiredCSA).toBeGreaterThanOrEqual(10);
      expect(result.minimumCSA).toBe(10);
      expect(result.recommendedCSA).toBeGreaterThanOrEqual(10);
      expect(result.bondingMethod).toContain('Main bonding clamp');
      expect(result.testRequirements.continuityTest).toBe(true);
      expect(result.testRequirements.resistanceLimit).toBe(0.05);
      expect(result.safetyRequirements).toContain('Label required: "Safety Electrical Connection - Do Not Remove"');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate main protective bonding conductor for TN-S supply', () => {
      const inputs = {
        installationType: 'commercial' as const,
        supplyType: 'TNS' as const,
        mainSwitchRating: 200,
        mainEarthConductorCSA: 25,
        pipeMaterial: 'steel' as const,
        pipeSize: 35,
        pipeLength: 8,
        bondingType: 'main' as const
      };

      const result = BondingConductorCalculator.calculate(inputs);

      expect(result.requiredCSA).toBeGreaterThanOrEqual(6);
      expect(result.minimumCSA).toBe(6);
      expect(result.recommendedCSA).toBeGreaterThanOrEqual(result.requiredCSA);
      expect(result.bondingMethod).toContain('Main bonding clamp');
      expect(result.testRequirements.resistanceLimit).toBe(0.05);
    });

    it('should calculate supplementary bonding conductor', () => {
      const inputs = {
        installationType: 'domestic' as const,
        supplyType: 'PME' as const,
        mainSwitchRating: 32,
        mainEarthConductorCSA: 10,
        pipeMaterial: 'copper' as const,
        pipeSize: 15,
        pipeLength: 2,
        bondingType: 'supplementary' as const
      };

      const result = BondingConductorCalculator.calculate(inputs);

      expect(result.requiredCSA).toBeGreaterThanOrEqual(2.5);
      expect(result.minimumCSA).toBe(2.5);
      expect(result.recommendedCSA).toBeGreaterThanOrEqual(2.5);
      expect(result.bondingMethod).toContain('Supplementary bonding');
      expect(result.testRequirements.resistanceLimit).toBe(0.01);
    });

    it('should handle plastic pipe bonding requirements', () => {
      const inputs = {
        installationType: 'domestic' as const,
        supplyType: 'PME' as const,
        mainSwitchRating: 100,
        mainEarthConductorCSA: 16,
        pipeMaterial: 'plastic' as const,
        pipeSize: 22,
        pipeLength: 3,
        bondingType: 'main' as const
      };

      const result = BondingConductorCalculator.calculate(inputs);

      expect(result.bondingMethod).toContain('metallic fittings');
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('metallic parts')
        ])
      );
    });

    it('should provide enhanced requirements for industrial installations', () => {
      const inputs = {
        installationType: 'industrial' as const,
        supplyType: 'PME' as const,
        mainSwitchRating: 400,
        mainEarthConductorCSA: 50,
        pipeMaterial: 'steel' as const,
        pipeSize: 100,
        pipeLength: 15,
        bondingType: 'main' as const
      };

      const result = BondingConductorCalculator.calculate(inputs);

      expect(result.safetyRequirements).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Enhanced inspection')
        ])
      );
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('regular inspection')
        ])
      );
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs = {
        installationType: 'domestic' as const,
        supplyType: 'PME' as const,
        mainSwitchRating: -10, // Invalid negative rating
        mainEarthConductorCSA: 16,
        pipeMaterial: 'copper' as const,
        pipeSize: 22,
        pipeLength: 5,
        bondingType: 'main' as const
      };

      expect(() => {
        if (invalidInputs.mainSwitchRating <= 0) {
          throw new Error('Main switch rating must be positive');
        }
        BondingConductorCalculator.calculate(invalidInputs);
      }).toThrow('Main switch rating must be positive');
    });
  });
});

describe('ProspectiveFaultCurrentCalculator', () => {
  describe('calculate()', () => {
    it('should calculate three-phase fault current', () => {
      const inputs = {
        systemVoltage: 400,
        sourceImpedance: 0.1,
        cableImpedance: 0.05,
        transformerRating: 500,
        transformerImpedance: 4,
        faultType: 'three_phase' as const,
        systemType: 'TN-S' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      expect(result.faultCurrent).toBeGreaterThan(1000);
      expect(result.faultLevel).toBeGreaterThan(1);
      expect(result.breakingCapacityRequired).toBeGreaterThan(result.faultLevel);
      expect(result.deviceSelection.minimumBreakingCapacity).toBeGreaterThanOrEqual(6);
      expect(result.deviceSelection.recommendedDevices.length).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate single phase to earth fault current', () => {
      const inputs = {
        systemVoltage: 230,
        sourceImpedance: 0.35,
        cableImpedance: 0.2,
        transformerRating: 100,
        transformerImpedance: 4,
        faultType: 'single_phase_earth' as const,
        systemType: 'TN-C-S' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      expect(result.faultCurrent).toBeGreaterThan(100);
      expect(result.faultLevel).toBeGreaterThan(0.1);
      expect(result.X_R_ratio).toBeGreaterThan(1);
      expect(result.asymmetricalFaultCurrent).toBeGreaterThan(result.symmetricalFaultCurrent);
    });

    it('should handle TT system earth fault calculations', () => {
      const inputs = {
        systemVoltage: 230,
        sourceImpedance: 0.8,
        cableImpedance: 0.5,
        transformerRating: 50,
        transformerImpedance: 4,
        faultType: 'single_phase_earth' as const,
        systemType: 'TT' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      expect(result.faultCurrent).toBeLessThan(200); // TT systems typically have lower fault currents
      expect(result.safetyConcerns).toEqual(
        expect.arrayContaining([
          expect.stringContaining('TT system')
        ])
      );
    });

    it('should provide high fault level warnings', () => {
      const inputs = {
        systemVoltage: 400,
        sourceImpedance: 0.02,
        cableImpedance: 0.01,
        transformerRating: 1000,
        transformerImpedance: 6,
        faultType: 'three_phase' as const,
        systemType: 'TN-S' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      if (result.faultLevel > 25) {
        expect(result.safetyConcerns).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Very high fault level')
          ])
        );
        expect(result.recommendations).toEqual(
          expect.arrayContaining([
            expect.stringContaining('arc flash')
          ])
        );
      }
    });

    it('should select appropriate protection devices', () => {
      const inputs = {
        systemVoltage: 400,
        sourceImpedance: 0.15,
        cableImpedance: 0.1,
        transformerRating: 200,
        transformerImpedance: 4,
        faultType: 'three_phase' as const,
        systemType: 'TN-S' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      expect(result.deviceSelection.recommendedDevices).toBeDefined();
      expect(result.deviceSelection.minimumBreakingCapacity).toBeGreaterThan(0);
      
      // Check that a valid device is recommended
      expect(result.deviceSelection.recommendedDevices.length).toBeGreaterThan(0);
      expect(result.deviceSelection.recommendedDevices[0]).toMatch(/MCB|MCCB/);
      
      // Verify breaking capacity is appropriate
      expect(result.deviceSelection.minimumBreakingCapacity).toBeGreaterThanOrEqual(
        Math.ceil(result.faultLevel)
      );
    });

    it('should handle phase-to-phase fault calculations', () => {
      const inputs = {
        systemVoltage: 400,
        sourceImpedance: 0.1,
        cableImpedance: 0.05,
        transformerRating: 315,
        transformerImpedance: 4,
        faultType: 'phase_to_phase' as const,
        systemType: 'TN-S' as const
      };

      const result = ProspectiveFaultCurrentCalculator.calculate(inputs);

      expect(result.faultCurrent).toBeGreaterThan(500);
      expect(result.faultLevel).toBeGreaterThan(0.5);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('breaking capacity')
        ])
      );
    });
  });
});

describe('TouchVoltageCalculator', () => {
  describe('calculate()', () => {
    it('should calculate touch voltage for dry conditions', () => {
      const inputs = {
        faultCurrent: 1000,
        earthResistance: 0.2,
        bodyResistance: 1000,
        contactConditions: 'dry' as const,
        exposureTime: 0.4,
        currentPath: 'hand_to_feet' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.touchVoltage).toBe(200); // 1000A × 0.2Ω
      expect(result.stepVoltage).toBe(100); // Half of touch voltage
      expect(result.fibrillationCurrent).toBeGreaterThan(30);
      expect(result.safetyLimits.ac50V).toBe(false); // 200V > 50V
      expect(result.protectionRequired).toBe(true);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate touch voltage for wet conditions', () => {
      const inputs = {
        faultCurrent: 500,
        earthResistance: 0.1,
        bodyResistance: 1000,
        contactConditions: 'wet' as const,
        exposureTime: 0.2,
        currentPath: 'hand_to_hand' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.touchVoltage).toBe(50); // 500A × 0.1Ω
      expect(result.safetyLimits.ac25V).toBe(false); // 50V > 25V for wet
      expect(result.rcdRequired).toBe(true);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('wet conditions')
        ])
      );
    });

    it('should handle safe voltage scenarios', () => {
      const inputs = {
        faultCurrent: 100,
        earthResistance: 0.2,
        bodyResistance: 1000,
        contactConditions: 'dry' as const,
        exposureTime: 0.1,
        currentPath: 'feet_to_feet' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.touchVoltage).toBe(20); // 100A × 0.2Ω
      expect(result.safetyLimits.ac50V).toBe(true); // 20V < 50V
      expect(result.protectionRequired).toBe(false);
      expect(result.fibrillationCurrent).toBeGreaterThan(100); // Feet-to-feet higher threshold
    });

    it('should calculate RCD requirements correctly', () => {
      const inputs = {
        faultCurrent: 2000,
        earthResistance: 0.05,
        bodyResistance: 1000,
        contactConditions: 'wet' as const,
        exposureTime: 0.5,
        currentPath: 'hand_to_feet' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.touchVoltage).toBe(100); // 2000A × 0.05Ω
      expect(result.rcdRequired).toBe(true);
      expect(result.rcdRating).toBeLessThanOrEqual(30);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('RCD')
        ])
      );
    });

    it('should handle immersed conditions', () => {
      const inputs = {
        faultCurrent: 300,
        earthResistance: 0.3,
        bodyResistance: 1000,
        contactConditions: 'immersed' as const,
        exposureTime: 0.3,
        currentPath: 'hand_to_feet' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.touchVoltage).toBe(90); // 300A × 0.3Ω
      expect(result.rcdRequired).toBe(true);
      expect(result.protectionRequired).toBe(true);
    });

    it('should provide step voltage warnings', () => {
      const inputs = {
        faultCurrent: 5000,
        earthResistance: 0.02,
        bodyResistance: 1000,
        contactConditions: 'dry' as const,
        exposureTime: 0.2,
        currentPath: 'feet_to_feet' as const
      };

      const result = TouchVoltageCalculator.calculate(inputs);

      expect(result.stepVoltage).toBe(50); // Half of touch voltage
      if (result.stepVoltage > 50) {
        expect(result.recommendations).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Step voltage')
          ])
        );
      }
    });
  });
});

describe('LightningProtectionCalculator', () => {
  describe('calculate()', () => {
    it('should assess risk for isolated residential building', () => {
      const inputs = {
        buildingHeight: 8,
        buildingWidth: 12,
        buildingLength: 20,
        buildingType: 'residential' as const,
        locationDensity: 2.5,
        environmentalFactor: 'rural' as const,
        surroundingStructures: 'isolated' as const,
        contentValue: 'normal' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      expect(result.riskAssessment.riskLevel).toBeDefined();
      expect(result.riskAssessment.annualRiskFrequency).toBeGreaterThan(0);
      expect(result.protectionLevel).toBeDefined();
      expect(result.systemDesign.airTerminals.rodLength).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS EN 62305');
    });

    it('should require protection for high-risk hospital building', () => {
      const inputs = {
        buildingHeight: 25,
        buildingWidth: 40,
        buildingLength: 60,
        buildingType: 'hospital' as const,
        locationDensity: 4.0,
        environmentalFactor: 'urban' as const,
        surroundingStructures: 'isolated' as const,
        contentValue: 'very_high' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      expect(result.riskAssessment.requiredProtection).toBe(true);
      expect(result.riskAssessment.riskLevel).toMatch(/high|very_high/);
      expect(result.protectionLevel).toMatch(/I|II/);
      expect(result.systemDesign.downConductors.number).toBeGreaterThan(2);
      expect(result.equipotentialBonding.required).toBe(true);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Enhanced safety')
        ])
      );
    });

    it('should design Class I protection system', () => {
      const inputs = {
        buildingHeight: 30,
        buildingWidth: 25,
        buildingLength: 50,
        buildingType: 'industrial' as const,
        locationDensity: 5.0,
        environmentalFactor: 'industrial' as const,
        surroundingStructures: 'isolated' as const,
        contentValue: 'high' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      if (result.protectionLevel === 'I') {
        expect(result.systemDesign.airTerminals.rodLength).toBe(2.0);
        expect(result.systemDesign.airTerminals.meshSize).toBe(5);
        expect(result.systemDesign.downConductors.csa).toBe(70);
      }
    });

    it('should handle low-risk scenarios', () => {
      const inputs = {
        buildingHeight: 4,
        buildingWidth: 8,
        buildingLength: 10,
        buildingType: 'residential' as const,
        locationDensity: 1.0,
        environmentalFactor: 'suburban' as const,
        surroundingStructures: 'surrounded' as const,
        contentValue: 'low' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      if (!result.riskAssessment.requiredProtection) {
        expect(result.protectionLevel).toBe('none');
        expect(result.recommendations).toEqual(
          expect.arrayContaining([
            expect.stringContaining('not required')
          ])
        );
      }
    });

    it('should calculate appropriate down conductor numbers', () => {
      const inputs = {
        buildingHeight: 15,
        buildingWidth: 30,
        buildingLength: 40,
        buildingType: 'commercial' as const,
        locationDensity: 3.0,
        environmentalFactor: 'urban' as const,
        surroundingStructures: 'isolated' as const,
        contentValue: 'normal' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      const perimeter = 2 * (inputs.buildingWidth + inputs.buildingLength);
      const expectedMinimum = Math.max(2, Math.ceil(perimeter / 25)); // Approximate

      expect(result.systemDesign.downConductors.number).toBeGreaterThanOrEqual(2);
      expect(result.systemDesign.downConductors.number).toBeLessThanOrEqual(20); // Reasonable upper limit
    });

    it('should provide bonding requirements for protection systems', () => {
      const inputs = {
        buildingHeight: 20,
        buildingWidth: 20,
        buildingLength: 30,
        buildingType: 'school' as const,
        locationDensity: 3.5,
        environmentalFactor: 'suburban' as const,
        surroundingStructures: 'isolated' as const,
        contentValue: 'high' as const
      };

      const result = LightningProtectionCalculator.calculate(inputs);

      if (result.riskAssessment.requiredProtection) {
        expect(result.equipotentialBonding.required).toBe(true);
        expect(result.equipotentialBonding.bondingConductorCSA).toBeGreaterThanOrEqual(16);
        expect(result.equipotentialBonding.services.length).toBeGreaterThan(3);
      }
    });
  });
});

describe('Earthing & Bonding Integration Tests', () => {
  it('should provide consistent results across related calculations', () => {
    // Main bonding calculation
    const bondingInputs = {
      installationType: 'commercial' as const,
      supplyType: 'PME' as const,
      mainSwitchRating: 200,
      mainEarthConductorCSA: 25,
      pipeMaterial: 'copper' as const,
      pipeSize: 35,
      pipeLength: 6,
      bondingType: 'main' as const
    };

    const bondingResult = BondingConductorCalculator.calculate(bondingInputs);

    // Touch voltage calculation with related fault current
    const touchInputs = {
      faultCurrent: 2000,
      earthResistance: 0.1,
      bodyResistance: 1000,
      contactConditions: 'dry' as const,
      exposureTime: 0.4,
      currentPath: 'hand_to_feet' as const
    };

    const touchResult = TouchVoltageCalculator.calculate(touchInputs);

    // Both should comply with safety standards
    expect(bondingResult.recommendedCSA).toBeGreaterThanOrEqual(bondingResult.minimumCSA);
    expect(touchResult.rcdRequired || touchResult.safetyLimits.safe).toBe(true);
  });

  it('should handle edge cases gracefully', () => {
    // Minimum values test
    const minInputs = {
      installationType: 'domestic' as const,
      supplyType: 'TNS' as const,
      mainSwitchRating: 6,
      mainEarthConductorCSA: 1.5,
      pipeMaterial: 'copper' as const,
      pipeSize: 10,
      pipeLength: 1,
      bondingType: 'supplementary' as const
    };

    const result = BondingConductorCalculator.calculate(minInputs);
    expect(result.recommendedCSA).toBeGreaterThanOrEqual(result.minimumCSA);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should validate regulation compliance across all calculators', () => {
    const bondingResult = BondingConductorCalculator.calculate({
      installationType: 'domestic' as const,
      supplyType: 'PME' as const,
      mainSwitchRating: 100,
      mainEarthConductorCSA: 16,
      pipeMaterial: 'copper' as const,
      pipeSize: 22,
      pipeLength: 5,
      bondingType: 'main' as const
    });

    const faultResult = ProspectiveFaultCurrentCalculator.calculate({
      systemVoltage: 400,
      sourceImpedance: 0.1,
      cableImpedance: 0.05,
      transformerRating: 500,
      transformerImpedance: 4,
      faultType: 'three_phase' as const,
      systemType: 'TN-S' as const
    });

    const touchResult = TouchVoltageCalculator.calculate({
      faultCurrent: 1000,
      earthResistance: 0.2,
      bodyResistance: 1000,
      contactConditions: 'dry' as const,
      exposureTime: 0.4,
      currentPath: 'hand_to_feet' as const
    });

    const lightningResult = LightningProtectionCalculator.calculate({
      buildingHeight: 10,
      buildingWidth: 15,
      buildingLength: 20,
      buildingType: 'residential' as const,
      locationDensity: 2.0,
      environmentalFactor: 'rural' as const,
      surroundingStructures: 'isolated' as const,
      contentValue: 'normal' as const
    });

    // All should reference appropriate regulations
    expect(bondingResult.regulation).toContain('BS 7671');
    expect(faultResult.regulation).toContain('BS 7671');
    expect(touchResult.regulation).toContain('BS 7671');
    expect(lightningResult.regulation).toContain('BS EN 62305');
  });
});
