/**
 * Tests for Cable Reference Data and Helper Functions
 * Tests UK electrical cable reference information and helper calculations
 * Based on BS 7671:2018+A2:2022 Appendix 4
 */

import {
  CABLE_INSTALLATION_METHODS,
  CABLE_CURRENT_RATINGS,
  DERATING_FACTORS,
  VOLTAGE_DROP_VALUES,
  CABLE_ELECTRICAL_PROPERTIES,
  ARMOURED_CABLE_SPECS,
  FIRE_PERFORMANCE_CLASSES,
  CableReferenceHelper
} from '../cable-references';

describe('Cable References', () => {
  
  describe('Cable Installation Methods', () => {
    it('should contain all BS 7671 reference methods', () => {
      const expectedMethods: Array<keyof typeof CABLE_INSTALLATION_METHODS> = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2', 'E', 'F', 'G'];
      expectedMethods.forEach(method => {
        expect(CABLE_INSTALLATION_METHODS[method]).toBeDefined();
        expect(CABLE_INSTALLATION_METHODS[method].description).toBeTruthy();
        expect(CABLE_INSTALLATION_METHODS[method].applicationNote).toBeTruthy();
      });
    });

    it('should correctly identify methods requiring derating', () => {
      expect(CABLE_INSTALLATION_METHODS.A1.deratingRequired).toBe(true);
      expect(CABLE_INSTALLATION_METHODS.A2.deratingRequired).toBe(false);
      expect(CABLE_INSTALLATION_METHODS.B1.deratingRequired).toBe(true);
      expect(CABLE_INSTALLATION_METHODS.D1.deratingRequired).toBe(true);
    });

    it('should have appropriate thermal resistance classifications', () => {
      expect(CABLE_INSTALLATION_METHODS.A1.thermalResistance).toBe('High');
      expect(CABLE_INSTALLATION_METHODS.E.thermalResistance).toBe('Excellent');
      expect(CABLE_INSTALLATION_METHODS.G.thermalResistance).toBe('Better');
    });
  });

  describe('Cable Current Ratings', () => {
    it('should contain PVC 70°C ratings for all standard cable sizes', () => {
      const standardSizes: Array<keyof typeof CABLE_CURRENT_RATINGS.PVC_70C.ratings> = ['1.0', '1.5', '2.5', '4', '6', '10', '16', '25', '35', '50'];
      
      standardSizes.forEach(size => {
        const ratings = (CABLE_CURRENT_RATINGS.PVC_70C.ratings as any)[size];
        expect(ratings).toBeDefined();
        expect(ratings.refMethodC).toBeGreaterThan(0);
      });
    });

    it('should have increasing current ratings with cable size', () => {
      const pvcRatings = CABLE_CURRENT_RATINGS.PVC_70C.ratings;
      
      expect(pvcRatings['1.0'].refMethodC).toBeLessThan(pvcRatings['2.5'].refMethodC);
      expect(pvcRatings['2.5'].refMethodC).toBeLessThan(pvcRatings['10'].refMethodC);
      expect(pvcRatings['10'].refMethodC).toBeLessThan(pvcRatings['25'].refMethodC);
    });

    it('should have realistic current ratings for common sizes', () => {
      const pvcRatings = CABLE_CURRENT_RATINGS.PVC_70C.ratings;
      
      // 2.5mm² T&E cable (Reference Method C) should be around 28A
      expect(pvcRatings['2.5'].refMethodC).toBeCloseTo(28, 0);
      
      // 10mm² cable should be around 64A
      expect(pvcRatings['10'].refMethodC).toBeCloseTo(64, 0);
      
      // 25mm² cable should be around 112A
      expect(pvcRatings['25'].refMethodC).toBeCloseTo(112, 0);
    });
  });

  describe('Derating Factors', () => {
    it('should contain ambient temperature factors for both cable types', () => {
      expect(DERATING_FACTORS.ambientTemperature.factors.PVC_70C).toBeDefined();
      expect(DERATING_FACTORS.ambientTemperature.factors.XLPE_90C).toBeDefined();
      
      // Should have factors for temperatures from 25°C to 50°C
      expect(DERATING_FACTORS.ambientTemperature.factors.PVC_70C[25]).toBeDefined();
      expect(DERATING_FACTORS.ambientTemperature.factors.PVC_70C[50]).toBeDefined();
    });

    it('should have grouping factors for different installation methods', () => {
      expect(DERATING_FACTORS.grouping.factors.enclosed).toBeDefined();
      expect(DERATING_FACTORS.grouping.factors.surface).toBeDefined();
      expect(DERATING_FACTORS.grouping.factors.perforatedTray).toBeDefined();
      
      // Grouping factors should decrease with more cables
      const enclosed = DERATING_FACTORS.grouping.factors.enclosed;
      expect(enclosed[1]).toBeGreaterThan(enclosed[5]);
      expect(enclosed[5]).toBeGreaterThan(enclosed[10]);
    });

    it('should have thermal insulation factors', () => {
      const insulation = DERATING_FACTORS.thermalInsulation.factors;
      
      expect(insulation.completelyEnclosed).toBeLessThan(1.0);
      expect(insulation.partiallyEnclosed).toBeLessThan(1.0);
      expect(insulation.touching).toBeLessThan(1.0);
      // Note: 'none' is not in the factors object as it would be handled as no derating applied
    });
  });

  describe('Voltage Drop Values', () => {
    it('should contain voltage drop data for PVC cables', () => {
      const pvcData = VOLTAGE_DROP_VALUES.PVC_70C;
      
      expect(pvcData.twoCore).toBeDefined();
      expect(pvcData.threeCore).toBeDefined();
      
      // Should have data for common cable sizes
      expect(pvcData.twoCore['2.5']).toBeDefined();
      expect(pvcData.twoCore['2.5'].r).toBeGreaterThan(0);
      expect(pvcData.twoCore['2.5'].x).toBeGreaterThanOrEqual(0); // Can be 0 for smaller cables
      expect(pvcData.twoCore['2.5'].z).toBeGreaterThan(0);
    });

    it('should have decreasing voltage drop with larger cable sizes', () => {
      const twoCore = VOLTAGE_DROP_VALUES.PVC_70C.twoCore;
      
      expect(twoCore['1.5'].z).toBeGreaterThan(twoCore['2.5'].z);
      expect(twoCore['2.5'].z).toBeGreaterThan(twoCore['10'].z);
      expect(twoCore['10'].z).toBeGreaterThan(twoCore['25'].z);
    });
  });

  describe('Cable Electrical Properties', () => {
    it('should have resistance values for copper conductors', () => {
      const copper = CABLE_ELECTRICAL_PROPERTIES.resistance.copper;
      
      expect(copper['1.0']).toBeGreaterThan(copper['2.5']);
      expect(copper['2.5']).toBeGreaterThan(copper['10']);
      expect(copper['10']).toBeGreaterThan(copper['25']);
    });

    it('should have resistance values for aluminium conductors', () => {
      const aluminium = CABLE_ELECTRICAL_PROPERTIES.resistance.aluminium;
      
      // Aluminium should have higher resistance than copper for same size
      expect(aluminium['25']).toBeGreaterThan(CABLE_ELECTRICAL_PROPERTIES.resistance.copper['25']);
    });

    it('should have reactance values', () => {
      const reactance = CABLE_ELECTRICAL_PROPERTIES.reactance;
      
      expect(reactance.singleCore.touching['10']).toBeDefined();
      expect((reactance.multicore as any)['10']).toBeDefined();
      
      // Single core touching should generally have lower reactance than spaced
      expect(reactance.singleCore.touching['10']).toBeLessThan(reactance.singleCore.spaced['10']);
    });
  });

  describe('Fire Performance Classes', () => {
    it('should contain standard fire performance classifications', () => {
      expect(FIRE_PERFORMANCE_CLASSES.classes.Aca).toBeDefined();
      expect(FIRE_PERFORMANCE_CLASSES.classes.B1ca).toBeDefined();
      expect(FIRE_PERFORMANCE_CLASSES.classes.Cca).toBeDefined();
      expect(FIRE_PERFORMANCE_CLASSES.classes.Dca).toBeDefined();
    });

    it('should have appropriate fire resistance classifications', () => {
      expect(FIRE_PERFORMANCE_CLASSES.classes.Aca.flameSpread).toBe('No contribution to fire');
      expect(FIRE_PERFORMANCE_CLASSES.classes.Eca.flameSpread).toBe('No requirement');
    });
  });
});

describe('CableReferenceHelper', () => {
  
  describe('getCurrentRating', () => {
    it('should return correct current rating for valid inputs', () => {
      const rating = CableReferenceHelper.getCurrentRating('PVC_70C', '2.5', 'refMethodC');
      expect(rating).toBe(28);
    });

    it('should return null for invalid cable size', () => {
      const rating = CableReferenceHelper.getCurrentRating('PVC_70C', '999', 'refMethodC');
      expect(rating).toBeNull();
    });

    it('should return null for invalid installation method', () => {
      const rating = CableReferenceHelper.getCurrentRating('PVC_70C', '2.5', 'invalidMethod');
      expect(rating).toBeNull();
    });

    it('should handle different installation methods correctly', () => {
      const ratingA1 = CableReferenceHelper.getCurrentRating('PVC_70C', '2.5', 'refMethodA1');
      const ratingC = CableReferenceHelper.getCurrentRating('PVC_70C', '2.5', 'refMethodC');
      const ratingE = CableReferenceHelper.getCurrentRating('PVC_70C', '2.5', 'refMethodE');
      
      expect(ratingA1).not.toBeNull();
      expect(ratingC).not.toBeNull();
      expect(ratingE).not.toBeNull();
      
      expect(ratingA1!).toBeLessThan(ratingC!);
      expect(ratingC!).toBeLessThan(ratingE!);
    });
  });

  describe('calculateDeratingFactor', () => {
    it('should return factor of 1.0 for standard conditions', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({});
      expect(result.factor).toBe(1.0);
      expect(result.breakdown).toHaveLength(0);
    });

    it('should apply ambient temperature correction', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({
        ambientTemp: 40,
        cableType: 'PVC_70C'
      });
      
      expect(result.factor).toBeLessThan(1.0);
      expect(result.breakdown.some(item => item.includes('Ambient temp (40°C)'))).toBe(true);
    });

    it('should apply grouping factor', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({
        groupingMethod: 'enclosed',
        numberOfCables: 5
      });
      
      expect(result.factor).toBeLessThan(1.0);
      expect(result.breakdown.some(item => item.includes('Grouping (5 cables'))).toBe(true);
    });

    it('should apply thermal insulation factor', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({
        thermalInsulation: 'completelyEnclosed'
      });
      
      expect(result.factor).toBeLessThan(1.0);
      expect(result.breakdown.some(item => item.includes('Thermal insulation'))).toBe(true);
    });

    it('should combine multiple derating factors correctly', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({
        ambientTemp: 45,
        cableType: 'PVC_70C',
        groupingMethod: 'enclosed',
        numberOfCables: 8,
        thermalInsulation: 'partiallyEnclosed'
      });
      
      expect(result.factor).toBeLessThan(0.5); // Multiple factors should compound
      expect(result.breakdown).toHaveLength(3); // Three factors applied
    });

    it('should handle edge cases for grouping', () => {
      const result = CableReferenceHelper.calculateDeratingFactor({
        groupingMethod: 'enclosed',
        numberOfCables: 25 // Beyond standard table
      });
      
      expect(result.factor).toBe(0.38); // Should use default minimum factor
    });
  });

  describe('getVoltageDropValues', () => {
    it('should return voltage drop values for valid inputs', () => {
      const values = CableReferenceHelper.getVoltageDropValues('PVC_70C', '2.5', 'twoCore');
      
      expect(values).not.toBeNull();
      expect(values?.r).toBeGreaterThan(0);
      expect(values?.x).toBeGreaterThanOrEqual(0); // Can be 0 for smaller cables
      expect(values?.z).toBeGreaterThan(0);
    });

    it('should return null for invalid cable size', () => {
      const values = CableReferenceHelper.getVoltageDropValues('PVC_70C', '999', 'twoCore');
      expect(values).toBeNull();
    });

    it('should handle both two-core and three-core cables', () => {
      const twoCore = CableReferenceHelper.getVoltageDropValues('PVC_70C', '10', 'twoCore');
      const threeCore = CableReferenceHelper.getVoltageDropValues('PVC_70C', '10', 'threeCore');
      
      expect(twoCore).not.toBeNull();
      expect(threeCore).not.toBeNull();
      
      // Both should have valid voltage drop values
      expect(twoCore?.z).toBeGreaterThan(0);
      expect(threeCore?.z).toBeGreaterThan(0);
    });
  });

  describe('getCableResistance', () => {
    it('should return resistance for copper conductors', () => {
      const resistance = CableReferenceHelper.getCableResistance('copper', '2.5');
      expect(resistance).toBeGreaterThan(0);
    });

    it('should return resistance for aluminium conductors', () => {
      const resistance = CableReferenceHelper.getCableResistance('aluminium', '25');
      expect(resistance).toBeGreaterThan(0);
    });

    it('should return null for invalid cable size', () => {
      const resistance = CableReferenceHelper.getCableResistance('copper', '999');
      expect(resistance).toBeNull();
    });

    it('should show aluminium has higher resistance than copper', () => {
      const copperResistance = CableReferenceHelper.getCableResistance('copper', '25');
      const aluminiumResistance = CableReferenceHelper.getCableResistance('aluminium', '25');
      
      expect(copperResistance).not.toBeNull();
      expect(aluminiumResistance).not.toBeNull();
      expect(aluminiumResistance!).toBeGreaterThan(copperResistance!);
    });

    it('should show decreasing resistance with larger cable sizes', () => {
      const resistance1_5 = CableReferenceHelper.getCableResistance('copper', '1.5');
      const resistance2_5 = CableReferenceHelper.getCableResistance('copper', '2.5');
      const resistance10 = CableReferenceHelper.getCableResistance('copper', '10');
      
      expect(resistance1_5).not.toBeNull();
      expect(resistance2_5).not.toBeNull();
      expect(resistance10).not.toBeNull();
      expect(resistance1_5!).toBeGreaterThan(resistance2_5!);
      expect(resistance2_5!).toBeGreaterThan(resistance10!);
    });
  });

  describe('Real-world cable selection scenarios', () => {
    it('should handle domestic ring circuit scenario', () => {
      // 32A ring circuit with 4mm² T&E cable (2.5mm² is only 28A, insufficient)
      const baseRating = CableReferenceHelper.getCurrentRating('PVC_70C', '4', 'refMethodC');
      expect(baseRating).toBeGreaterThanOrEqual(32); // Should handle 32A load
      
      // With insulation derating
      const derated = CableReferenceHelper.calculateDeratingFactor({
        thermalInsulation: 'completelyEnclosed'
      });
      
      const finalRating = baseRating! * derated.factor;
      expect(finalRating).toBeLessThan(baseRating!);
    });

    it('should handle commercial installation scenario', () => {
      // 16mm² cable in trunking with multiple circuits
      const baseRating = CableReferenceHelper.getCurrentRating('PVC_70C', '16', 'refMethodB2');
      
      const derated = CableReferenceHelper.calculateDeratingFactor({
        ambientTemp: 35,
        cableType: 'PVC_70C',
        groupingMethod: 'enclosed',
        numberOfCables: 6
      });
      
      const finalRating = baseRating! * derated.factor;
      expect(finalRating).toBeLessThan(baseRating!);
      expect(derated.breakdown.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle underground installation scenario', () => {
      // 25mm² SWA cable direct in ground
      const baseRating = CableReferenceHelper.getCurrentRating('PVC_70C', '25', 'refMethodD2');
      expect(baseRating).toBeGreaterThan(100);
      
      const voltageDropValues = CableReferenceHelper.getVoltageDropValues('PVC_70C', '25', 'threeCore');
      expect(voltageDropValues?.z).toBeLessThan(2.0); // Should be low for large cable
    });
  });

  describe('Regulation compliance validation', () => {
    it('should ensure cable ratings comply with BS 7671 values', () => {
      // Spot check key cable ratings against BS 7671 Table 4D1A
      expect(CableReferenceHelper.getCurrentRating('PVC_70C', '1.0', 'refMethodC')).toBe(16);
      expect(CableReferenceHelper.getCurrentRating('PVC_70C', '4', 'refMethodC')).toBe(37);
      expect(CableReferenceHelper.getCurrentRating('PVC_70C', '16', 'refMethodC')).toBe(85);
    });

    it('should ensure derating factors are within BS 7671 ranges', () => {
      // Temperature factors should be between 0.5 and 1.25 (includes low temperature boost)
      const tempFactors = DERATING_FACTORS.ambientTemperature.factors.PVC_70C;
      Object.values(tempFactors).forEach(factor => {
        expect(factor).toBeGreaterThanOrEqual(0.5);
        expect(factor).toBeLessThanOrEqual(1.25);
      });
    });

    it('should ensure grouping factors comply with BS 7671', () => {
      // Grouping factors should be between 0.38 and 1.0
      const groupingMethods = ['enclosed', 'surface', 'perforatedTray'] as const;
      groupingMethods.forEach(method => {
        const factors = DERATING_FACTORS.grouping.factors[method];
        Object.values(factors).forEach(factor => {
          expect(factor).toBeGreaterThanOrEqual(0.38);
          expect(factor).toBeLessThanOrEqual(1.0);
        });
      });
    });
  });
});
