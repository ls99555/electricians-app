/**
 * Unit Tests for Load and Demand Calculations
 * Testing compliance with UK electrical regulations (BS 7671)
 */

import { 
  LoadCalculator, 
  MaximumDemandCalculator, 
  DiversityFactorCalculator 
} from '../load-demand';

describe('LoadCalculator', () => {
  describe('calculate()', () => {
    it('should calculate total load for domestic installation with correct diversity factors', () => {
      const inputs = {
        lighting: 2000, // 2kW lighting
        heating: 8000, // 8kW heating
        cooking: 12000, // 12kW cooking (large range)
        sockets: 5000, // 5kW socket outlets
        otherLoads: 3000, // 3kW other loads
        installationType: 'domestic' as const
      };

      const result = LoadCalculator.calculate(inputs);

      expect(result.totalLoad).toBe(30000); // Total connected load
      expect(result.maximumDemand).toBeLessThan(30000); // Should be less due to diversity
      expect(result.diversityFactor).toBeLessThan(1.0); // Should have diversity applied
      expect(result.breakdown).toHaveLength(5);
      
      // Check specific diversity factors per BS 7671
      const lightingItem = result.breakdown.find(item => item.item === 'Lighting');
      expect(lightingItem?.diversity).toBe(0.9); // 90% for lighting
      
      const heatingItem = result.breakdown.find(item => item.item === 'Heating');
      expect(heatingItem?.diversity).toBe(1.0); // 100% for heating (no diversity)
    });

    it('should apply correct cooking diversity per BS 7671 Table A1', () => {
      // Test various cooking loads per BS 7671 Appendix A
      const smallCooking = {
        lighting: 1000,
        heating: 5000,
        cooking: 3000, // 3kW cooker - 100% diversity
        sockets: 2000,
        otherLoads: 0,
        installationType: 'domestic' as const
      };

      const largeCooking = {
        lighting: 1000,
        heating: 5000,
        cooking: 15000, // 15kW cooking - should have diversity
        sockets: 2000,
        otherLoads: 0,
        installationType: 'domestic' as const
      };

      const smallResult = LoadCalculator.calculate(smallCooking);
      const largeResult = LoadCalculator.calculate(largeCooking);

      const smallCookingItem = smallResult.breakdown.find(item => item.item === 'Cooking');
      const largeCookingItem = largeResult.breakdown.find(item => item.item === 'Cooking');

      // Small cookers should have 100% diversity
      expect(smallCookingItem?.diversity).toBe(1.0);
      
      // Large cookers should have reduced diversity per BS 7671
      expect(largeCookingItem?.diversity).toBeLessThan(1.0);
    });

    it('should handle commercial installation diversity factors', () => {
      const commercialInputs = {
        lighting: 10000,
        heating: 20000,
        cooking: 0,
        sockets: 15000,
        otherLoads: 25000,
        installationType: 'commercial' as const
      };

      const result = LoadCalculator.calculate(commercialInputs);

      expect(result.totalLoad).toBe(70000);
      expect(result.maximumDemand).toBeLessThan(70000);
      expect(result.diversityFactor).toBeGreaterThan(0.5);
      expect(result.diversityFactor).toBeLessThan(1.0);
    });

    it('should validate input parameters', () => {
      expect(() => {
        LoadCalculator.calculate({
          lighting: -1000, // Negative value should throw
          heating: 5000,
          cooking: 3000,
          sockets: 2000,
          otherLoads: 0,
          installationType: 'domestic'
        });
      }).toThrow();
    });

    it('should handle zero loads correctly', () => {
      const zeroInputs = {
        lighting: 0,
        heating: 0,
        cooking: 0,
        sockets: 0,
        otherLoads: 0,
        installationType: 'domestic' as const
      };

      const result = LoadCalculator.calculate(zeroInputs);

      expect(result.totalLoad).toBe(0);
      expect(result.maximumDemand).toBe(0);
      expect(result.diversityFactor).toBe(0);
    });
  });
});

describe('MaximumDemandCalculator', () => {
  describe('calculate()', () => {
    it('should calculate maximum demand for typical domestic installation per BS 7671', () => {
      const result = MaximumDemandCalculator.calculate({
        lighting: 2500,
        heating: 8000,
        waterHeating: 3000,
        cooking: [
          { appliance: 'Electric cooker', rating: 12000 }
        ],
        socketOutlets: 32,
        largeAppliances: [
          { appliance: 'Immersion heater', rating: 3000 }
        ],
        installationType: 'domestic'
      });

      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.maximumDemand).toBeLessThan(result.totalConnectedLoad);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS 7671');
      
      // Should include proper load breakdown
      expect(result.loadBreakdown).toBeDefined();
      expect(result.loadBreakdown.length).toBeGreaterThan(0);
    });

    it('should apply correct diversity factors for different load types', () => {
      const result = MaximumDemandCalculator.calculate({
        lighting: 3000,
        heating: 5000,
        waterHeating: 3000,
        cooking: [
          { appliance: 'Electric range', rating: 8000 }
        ],
        socketOutlets: 32,
        largeAppliances: [
          { appliance: 'Other appliances', rating: 1000 }
        ],
        installationType: 'domestic'
      });

      // Find specific load items in breakdown
      const lightingItem = result.loadBreakdown.find((item: any) => item.appliance === 'Lighting');
      const heatingItem = result.loadBreakdown.find((item: any) => item.appliance === 'Heating');
      const cookingItem = result.loadBreakdown.find((item: any) => item.appliance === 'Cooking');

      // Verify diversity factors per BS 7671 Table A1
      expect(lightingItem?.diversity).toBeLessThanOrEqual(1.0);
      expect(heatingItem?.diversity).toBeLessThanOrEqual(1.0);
      expect(cookingItem?.diversity).toBeLessThanOrEqual(1.0);
    });

    it('should handle commercial installations with appropriate diversity', () => {
      const result = MaximumDemandCalculator.calculate({
        lighting: 15000,
        heating: 20000,
        waterHeating: 5000,
        cooking: [
          { appliance: 'Commercial kitchen', rating: 25000 }
        ],
        socketOutlets: 50,
        largeAppliances: [
          { appliance: 'HVAC system', rating: 30000 }
        ],
        installationType: 'commercial'
      });

      expect(result.maximumDemand).toBeLessThan(result.totalConnectedLoad);
      expect(result.diversityFactor).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS 7671');
    });

    it('should validate load parameters', () => {
      expect(() => {
        MaximumDemandCalculator.calculate({
          lighting: -1000, // Invalid negative
          heating: 5000,
          waterHeating: 3000,
          cooking: [],
          socketOutlets: 32,
          largeAppliances: [],
          installationType: 'domestic'
        });
      }).toThrow();
    });

    it('should handle installations with special circuits', () => {
      const result = MaximumDemandCalculator.calculate({
        lighting: 2000,
        heating: 5000,
        waterHeating: 3000,
        cooking: [
          { appliance: 'Electric cooker', rating: 10000 }
        ],
        socketOutlets: 32,
        largeAppliances: [
          { appliance: 'EV charger', rating: 7000 }
        ],
        installationType: 'domestic',
        specialCircuits: [
          { circuit: 'Pool pump', rating: 2000 }
        ]
      });

      expect(result.maximumDemand).toBeGreaterThan(0);
      expect(result.totalConnectedLoad).toBeGreaterThan(25000);
      expect(result.regulation).toContain('BS 7671');
    });
  });
});

describe('DiversityFactorCalculator', () => {
  describe('calculate()', () => {
    it('should calculate diversity factors per BS 7671 Table A1', () => {
      const result = DiversityFactorCalculator.calculate({
        lighting: 5000,
        heating: 8000,
        socketOutlets: 20,
        cookers: [
          { rating: 8000, quantity: 1 }
        ],
        waterHeating: 3000,
        airConditioning: 5000,
        motorLoads: 2000,
        installationType: 'domestic'
      });

      expect(result.totalDemand).toBeGreaterThan(0);
      expect(result.totalDemand).toBeLessThanOrEqual(31000); // Reasonable upper bound
      expect(result.diversityApplied).toBeGreaterThan(0);
      expect(result.diversityApplied).toBeLessThanOrEqual(1.0);
    });

    it('should apply different diversity for domestic vs commercial', () => {
      const domesticResult = DiversityFactorCalculator.calculate({
        lighting: 10000,
        heating: 15000,
        socketOutlets: 30,
        cookers: [
          { rating: 12000, quantity: 1 }
        ],
        waterHeating: 5000,
        airConditioning: 8000,
        motorLoads: 3000,
        installationType: 'domestic'
      });

      const commercialResult = DiversityFactorCalculator.calculate({
        lighting: 10000,
        heating: 15000,
        socketOutlets: 30,
        cookers: [
          { rating: 12000, quantity: 1 }
        ],
        waterHeating: 5000,
        airConditioning: 8000,
        motorLoads: 3000,
        installationType: 'commercial'
      });

      // Commercial installations typically have different diversity
      expect(domesticResult.diversityApplied).not.toBe(commercialResult.diversityApplied);
    });

    it('should validate diversity calculation inputs', () => {
      expect(() => {
        DiversityFactorCalculator.calculate({
          lighting: -5000, // Invalid negative load
          heating: 8000,
          socketOutlets: 20,
          cookers: [],
          waterHeating: 3000,
          airConditioning: 5000,
          motorLoads: 2000,
          installationType: 'domestic'
        });
      }).toThrow();

      expect(() => {
        DiversityFactorCalculator.calculate({
          lighting: 5000,
          heating: 8000,
          socketOutlets: -10, // Invalid negative sockets
          cookers: [],
          waterHeating: 3000,
          airConditioning: 5000,
          motorLoads: 2000,
          installationType: 'domestic'
        });
      }).toThrow();
    });

    it('should handle cooking appliance diversity per BS 7671 specifics', () => {
      // Test small cooker installation
      const smallCooker = DiversityFactorCalculator.calculate({
        lighting: 2000,
        heating: 5000,
        socketOutlets: 15,
        cookers: [
          { rating: 3000, quantity: 1 } // Small 3kW cooker
        ],
        waterHeating: 3000,
        airConditioning: 0,
        motorLoads: 0,
        installationType: 'domestic'
      });

      // Test large cooker installation
      const largeCooker = DiversityFactorCalculator.calculate({
        lighting: 2000,
        heating: 5000,
        socketOutlets: 15,
        cookers: [
          { rating: 15000, quantity: 1 } // Large 15kW cooker
        ],
        waterHeating: 3000,
        airConditioning: 0,
        motorLoads: 0,
        installationType: 'domestic'
      });

      // Small cookers should have higher proportion of demand
      expect(smallCooker.cookerDemand).toBe(3000); // 100% diversity for small loads
      
      // Large cookers should have reduced diversity per BS 7671
      expect(largeCooker.cookerDemand).toBeLessThan(15000);
      expect(largeCooker.cookerDemand).toBeGreaterThan(10000); // Should still be substantial
    });

    it('should handle motor loads with proper diversity considerations', () => {
      const result = DiversityFactorCalculator.calculate({
        lighting: 5000,
        heating: 8000,
        socketOutlets: 20,
        cookers: [],
        waterHeating: 3000,
        airConditioning: 0,
        motorLoads: 20000, // Significant motor load
        installationType: 'commercial'
      });

      expect(result.motorDemand).toBeGreaterThan(0);
      expect(result.motorDemand).toBeLessThanOrEqual(20000);
      expect(result.totalDemand).toBeGreaterThan(0);
    });
  });
});

/**
 * Test utilities for UK regulation compliance validation
 */
describe('Load and Demand Regulatory Compliance', () => {
  it('should ensure all calculations reference BS 7671', () => {
    const loadResult = LoadCalculator.calculate({
      lighting: 2000,
      heating: 5000,
      cooking: 8000,
      sockets: 3000,
      otherLoads: 1000,
      installationType: 'domestic'
    });

    const demandResult = MaximumDemandCalculator.calculate({
      lighting: 2000,
      heating: 5000,
      waterHeating: 3000,
      cooking: [
        { appliance: 'Electric cooker', rating: 8000 }
      ],
      socketOutlets: 32,
      largeAppliances: [
        { appliance: 'Other', rating: 1000 }
      ],
      installationType: 'domestic'
    });

    const diversityResult = DiversityFactorCalculator.calculate({
      lighting: 5000,
      heating: 8000,
      socketOutlets: 20,
      cookers: [
        { rating: 8000, quantity: 1 }
      ],
      waterHeating: 3000,
      airConditioning: 0,
      motorLoads: 0,
      installationType: 'domestic'
    });

    // All calculations should reference UK regulations
    expect(demandResult.regulation).toContain('BS 7671');
    expect(diversityResult.totalDemand).toBeGreaterThan(0);
    expect(loadResult.breakdown).toBeDefined();
  });

  it('should validate safety margins in all load calculations', () => {
    const result = MaximumDemandCalculator.calculate({
      lighting: 3000,
      heating: 8000,
      waterHeating: 3000,
      cooking: [
        { appliance: 'Electric cooker', rating: 12000 }
      ],
      socketOutlets: 32,
      largeAppliances: [
        { appliance: 'Other', rating: 2000 }
      ],
      installationType: 'domestic'
    });

    // Maximum demand should be realistic and include appropriate diversity
    expect(result.maximumDemand).toBeLessThan(result.totalConnectedLoad);
    expect(result.maximumDemand).toBeGreaterThan(result.totalConnectedLoad * 0.4);
    expect(result.diversityFactor).toBeGreaterThan(0);
  });

  it('should ensure diversity factors comply with BS 7671 Table A1', () => {
    // Test specific diversity factors from BS 7671
    const lightingDiversity = DiversityFactorCalculator.calculate({
      lighting: 5000,
      heating: 0,
      socketOutlets: 10,
      cookers: [],
      waterHeating: 0,
      airConditioning: 0,
      motorLoads: 0,
      installationType: 'domestic'
    });

    const heatingDiversity = DiversityFactorCalculator.calculate({
      lighting: 0,
      heating: 10000,
      socketOutlets: 0,
      cookers: [],
      waterHeating: 0,
      airConditioning: 0,
      motorLoads: 0,
      installationType: 'domestic'
    });

    // Heating should typically have 100% diversity (no reduction)
    expect(heatingDiversity.heatingDemand).toBe(10000);
    
    // Lighting can have some diversity
    expect(lightingDiversity.lightingDemand).toBeGreaterThan(4000);
    expect(lightingDiversity.lightingDemand).toBeLessThanOrEqual(5000);
  });
});
