/**
 * Unit Tests for Lighting Calculations
 * Testing illuminance, emergency lighting, and lighting design calculations
 * All tests validate against UK regulations and standards
 */

import { describe, it, expect } from '@jest/globals';
import { 
  IlluminanceCalculator, 
  EmergencyLightingCalculator 
} from '../lighting';

describe('IlluminanceCalculator', () => {
  describe('calculate()', () => {
    it('should calculate illuminance for typical office space (BS EN 12464 compliant)', () => {
      const inputs = {
        roomLength: 10,
        roomWidth: 8,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        requiredLux: 500, // Typical office requirement
        luminaireOutput: 4000, // Lumens per luminaire
        roomReflectances: {
          ceiling: 0.7,
          walls: 0.5,
          floor: 0.2
        },
        maintenanceFactor: 0.8
      };

      const result = IlluminanceCalculator.calculate(inputs);

      // Verify calculation results
      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.requiredLumens).toBeGreaterThan(0);
      expect(result.averageIlluminance).toBeGreaterThanOrEqual(450); // Within reasonable range of target
      expect(result.averageIlluminance).toBeLessThanOrEqual(550);
      expect(result.luminaireSpacing).toBeGreaterThan(0);
      expect(result.uniformityRatio).toBeGreaterThan(0);
      expect(result.energyConsumption).toBeGreaterThan(0);
      
      // Verify recommendations exist
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate illuminance for classroom environment', () => {
      const inputs = {
        roomLength: 12,
        roomWidth: 9,
        roomHeight: 3.2,
        workingPlaneHeight: 0.75,
        requiredLux: 300, // Classroom requirement
        luminaireOutput: 3600,
        roomReflectances: {
          ceiling: 0.8,
          walls: 0.6,
          floor: 0.3
        },
        maintenanceFactor: 0.85
      };

      const result = IlluminanceCalculator.calculate(inputs);

      expect(result.averageIlluminance).toBeGreaterThanOrEqual(280); // Within tolerance
      expect(result.averageIlluminance).toBeLessThanOrEqual(320);
      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.costAnalysis).toBeDefined();
      expect(result.costAnalysis.installationCost).toBeGreaterThan(0);
    });

    it('should handle high-bay industrial lighting calculations', () => {
      const inputs = {
        roomLength: 30,
        roomWidth: 20,
        roomHeight: 8,
        workingPlaneHeight: 1.0,
        requiredLux: 200, // Industrial requirement
        luminaireOutput: 15000, // High-bay luminaire
        roomReflectances: {
          ceiling: 0.5,
          walls: 0.3,
          floor: 0.1
        },
        maintenanceFactor: 0.7
      };

      const result = IlluminanceCalculator.calculate(inputs);

      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.averageIlluminance).toBeGreaterThanOrEqual(180);
      expect(result.luminaireSpacing).toBeGreaterThan(0);
      expect(result.energyConsumption).toBeGreaterThan(0);
    });

    it('should validate input parameters', () => {
      expect(() => {
        IlluminanceCalculator.calculate({
          roomLength: -5, // Negative value should throw
          roomWidth: 8,
          roomHeight: 3,
          workingPlaneHeight: 0.8,
          requiredLux: 500,
          luminaireOutput: 4000,
          roomReflectances: {
            ceiling: 0.7,
            walls: 0.5,
            floor: 0.2
          },
          maintenanceFactor: 0.8
        });
      }).toThrow();
    });

    it('should handle edge cases for small spaces', () => {
      const inputs = {
        roomLength: 2,
        roomWidth: 2,
        roomHeight: 2.5,
        workingPlaneHeight: 0.8,
        requiredLux: 200,
        luminaireOutput: 2000,
        roomReflectances: {
          ceiling: 0.7,
          walls: 0.5,
          floor: 0.2
        },
        maintenanceFactor: 0.8
      };

      const result = IlluminanceCalculator.calculate(inputs);

      expect(result.numberOfLuminaires).toBeGreaterThanOrEqual(1);
      expect(result.averageIlluminance).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should handle different reflectance values correctly', () => {
      const darkRoomInputs = {
        roomLength: 6,
        roomWidth: 4,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        requiredLux: 300,
        luminaireOutput: 3000,
        roomReflectances: {
          ceiling: 0.3,
          walls: 0.2,
          floor: 0.1
        },
        maintenanceFactor: 0.8
      };

      const brightRoomInputs = {
        ...darkRoomInputs,
        roomReflectances: {
          ceiling: 0.9,
          walls: 0.8,
          floor: 0.6
        }
      };

      const darkResult = IlluminanceCalculator.calculate(darkRoomInputs);
      const brightResult = IlluminanceCalculator.calculate(brightRoomInputs);

      // Bright room should need fewer luminaires due to better reflection
      expect(brightResult.numberOfLuminaires).toBeLessThanOrEqual(darkResult.numberOfLuminaires);
    });

    it('should provide cost analysis', () => {
      const inputs = {
        roomLength: 10,
        roomWidth: 6,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        requiredLux: 400,
        luminaireOutput: 3500,
        roomReflectances: {
          ceiling: 0.7,
          walls: 0.5,
          floor: 0.2
        },
        maintenanceFactor: 0.8
      };

      const result = IlluminanceCalculator.calculate(inputs);

      expect(result.costAnalysis).toBeDefined();
      expect(result.costAnalysis.installationCost).toBeGreaterThan(0);
      expect(result.costAnalysis.annualEnergyCost).toBeGreaterThan(0);
      expect(result.costAnalysis.maintenanceCost).toBeGreaterThan(0);
    });
  });
});

describe('EmergencyLightingCalculator', () => {
  describe('calculate()', () => {
    it('should calculate emergency lighting for office area (BS 5266 compliant)', () => {
      const inputs = {
        roomArea: 60, // 60 square meters
        roomType: 'open_area' as const,
        ceilingHeight: 3,
        occupancy: 20
      };

      const result = EmergencyLightingCalculator.calculate(inputs);

      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.requiredIlluminance).toBeGreaterThanOrEqual(0.5); // Minimum for open areas
      expect(result.luminaireSpacing).toBeGreaterThan(0);
      expect(result.minimumDuration).toBeGreaterThanOrEqual(3); // 3 hours minimum
      expect(result.testingSchedule).toBeDefined();
      expect(result.testingSchedule.length).toBeGreaterThan(0);
    });

    it('should calculate emergency lighting for escape route', () => {
      const inputs = {
        roomArea: 30, // 30m² corridor
        roomType: 'escape_route' as const,
        ceilingHeight: 2.7,
        escapeRouteWidth: 2,
        occupancy: 50
      };

      const result = EmergencyLightingCalculator.calculate(inputs);

      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.requiredIlluminance).toBeGreaterThanOrEqual(1.0); // Higher requirement for escape routes
      expect(result.uniformityRatio).toBeGreaterThan(0);
    });

    it('should validate emergency lighting inputs', () => {
      expect(() => {
        EmergencyLightingCalculator.calculate({
          roomArea: -10, // Negative value should throw
          roomType: 'open_area',
          ceilingHeight: 3,
          occupancy: 20
        });
      }).toThrow();
    });

    it('should handle high-risk areas with higher illuminance requirements', () => {
      const inputs = {
        roomArea: 45,
        roomType: 'high_risk' as const,
        ceilingHeight: 3.5,
        occupancy: 15
      };

      const result = EmergencyLightingCalculator.calculate(inputs);

      expect(result.requiredIlluminance).toBeGreaterThanOrEqual(15); // High-risk area requirement
      expect(result.numberOfLuminaires).toBeGreaterThan(3); // Should need multiple luminaires
    });

    it('should provide appropriate testing schedule', () => {
      const inputs = {
        roomArea: 25,
        roomType: 'escape_route' as const,
        ceilingHeight: 3,
        escapeRouteWidth: 1.5,
        occupancy: 30
      };

      const result = EmergencyLightingCalculator.calculate(inputs);

      expect(result.testingSchedule).toContain('Daily: Visual check of indicators');
      expect(result.testingSchedule).toContain('Monthly: Brief functional test');
      expect(result.testingSchedule).toContain('Annual: Full 3-hour duration test');
      expect(result.testingSchedule.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle different room types with appropriate requirements', () => {
      const toiletInputs = {
        roomArea: 4,
        roomType: 'toilet' as const,
        ceilingHeight: 2.5,
        occupancy: 1
      };

      const liftInputs = {
        roomArea: 2,
        roomType: 'lift_car' as const,
        ceilingHeight: 2.3,
        occupancy: 8
      };

      const toiletResult = EmergencyLightingCalculator.calculate(toiletInputs);
      const liftResult = EmergencyLightingCalculator.calculate(liftInputs);

      expect(toiletResult.numberOfLuminaires).toBeGreaterThanOrEqual(1);
      expect(liftResult.numberOfLuminaires).toBeGreaterThanOrEqual(1);
      expect(toiletResult.requiredIlluminance).toBeGreaterThan(0);
      expect(liftResult.requiredIlluminance).toBeGreaterThan(0);
    });
  });
});

describe('Regulatory Compliance', () => {
  it('should ensure all lighting calculations provide appropriate recommendations', () => {
    const illuminanceInputs = {
      roomLength: 8,
      roomWidth: 6,
      roomHeight: 3,
      workingPlaneHeight: 0.8,
      requiredLux: 400,
      luminaireOutput: 3200,
      roomReflectances: {
        ceiling: 0.7,
        walls: 0.5,
        floor: 0.2
      },
      maintenanceFactor: 0.8
    };

    const emergencyInputs = {
      roomArea: 48,
      roomType: 'open_area' as const,
      ceilingHeight: 3,
      occupancy: 15
    };

    const illuminanceResult = IlluminanceCalculator.calculate(illuminanceInputs);
    const emergencyResult = EmergencyLightingCalculator.calculate(emergencyInputs);

    // Verify both calculations provide recommendations
    expect(illuminanceResult.recommendations).toBeDefined();
    expect(illuminanceResult.recommendations.length).toBeGreaterThan(0);
    expect(emergencyResult.testingSchedule).toBeDefined();
    expect(emergencyResult.testingSchedule.length).toBeGreaterThan(0);
  });

  it('should validate safety margins in lighting calculations', () => {
    const inputs = {
      roomLength: 10,
      roomWidth: 8,
      roomHeight: 3,
      workingPlaneHeight: 0.8,
      requiredLux: 500,
      luminaireOutput: 4000,
      roomReflectances: {
        ceiling: 0.7,
        walls: 0.5,
        floor: 0.2
      },
      maintenanceFactor: 0.8
    };

    const result = IlluminanceCalculator.calculate(inputs);

    // Should provide adequate lighting with reasonable safety margin
    expect(result.averageIlluminance).toBeGreaterThanOrEqual(inputs.requiredLux * 0.9); // At least 90% of required
    expect(result.averageIlluminance).toBeLessThanOrEqual(inputs.requiredLux * 1.5); // Not grossly over-designed
  });

  it('should ensure emergency lighting meets minimum duration requirements', () => {
    const inputs = {
      roomArea: 100,
      roomType: 'escape_route' as const,
      ceilingHeight: 3,
      escapeRouteWidth: 2,
      occupancy: 50
    };

    const result = EmergencyLightingCalculator.calculate(inputs);

    // BS 5266 requires minimum 3 hours duration
    expect(result.minimumDuration).toBeGreaterThanOrEqual(3); // 3 hours
  });
});
