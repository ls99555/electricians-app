/**
 * Unit Tests for Lighting Calculations
 * Testing illuminance, emergency lighting, and lighting design calculations
 * All tests validate against UK regulations and standards
 */

import { describe, it, expect } from '@jest/globals';
import { 
  IlluminanceCalculator, 
  EmergencyLightingCalculator,
  LuminousFluxCalculator,
  RoomIndexCalculator,
  UtilisationFactorCalculator,
  MaintenanceFactorCalculator,
  LEDReplacementCalculator,
  EnergyEfficiencyCalculator,
  UniformityRatioCalculator,
  GlareIndexCalculator,
  DomesticLightingCalculator,
  CommercialLightingCalculator
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

describe('LuminousFluxCalculator', () => {
  describe('calculate()', () => {
    it('should calculate luminous flux for office space', () => {
      const inputs = {
        roomLength: 10,
        roomWidth: 8,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        requiredIlluminance: 500,
        utilizationFactor: 0.6,
        maintenanceFactor: 0.8
      };

      const result = LuminousFluxCalculator.calculate(inputs);

      expect(result.totalLuminousFlux).toBeGreaterThan(0);
      expect(result.fluxPerM2).toBeGreaterThan(0);
      expect(result.roomIndex).toBeGreaterThan(0);
      expect(result.effectiveUtilizationFactor).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs = {
        roomLength: 0,
        roomWidth: 5,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        requiredIlluminance: 500,
        utilizationFactor: 0.6,
        maintenanceFactor: 0.8
      };

      expect(() => LuminousFluxCalculator.calculate(invalidInputs)).toThrow();
    });
  });
});

describe('RoomIndexCalculator', () => {
  describe('calculate()', () => {
    it('should calculate room index for typical office', () => {
      const inputs = {
        roomLength: 12,
        roomWidth: 8,
        roomHeight: 3,
        workingPlaneHeight: 0.8
      };

      const result = RoomIndexCalculator.calculate(inputs);

      expect(result.roomIndex).toBeGreaterThan(0);
      expect(result.roomCharacteristics.classification).toBeDefined();
      expect(result.roomCharacteristics.aspectRatio).toBeGreaterThan(0);
      expect(result.roomCharacteristics.cavityRatio).toBeGreaterThan(0);
      expect(result.mountingHeight).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should categorize room index correctly', () => {
      // Small room - low room index
      const smallRoom = {
        roomLength: 3,
        roomWidth: 3,
        roomHeight: 3,
        workingPlaneHeight: 0.8
      };

      // Large room - high room index  
      const largeRoom = {
        roomLength: 20,
        roomWidth: 15,
        roomHeight: 3,
        workingPlaneHeight: 0.8
      };

      const smallResult = RoomIndexCalculator.calculate(smallRoom);
      const largeResult = RoomIndexCalculator.calculate(largeRoom);

      expect(smallResult.roomIndex).toBeLessThan(largeResult.roomIndex);
      expect(smallResult.roomCharacteristics.classification).not.toBe(largeResult.roomCharacteristics.classification);
    });
  });
});

describe('UtilisationFactorCalculator', () => {
  describe('calculate()', () => {
    it('should calculate utilisation factor for standard office conditions', () => {
      const inputs = {
        roomIndex: 2.5,
        roomReflectances: {
          ceiling: 0.7,
          walls: 0.5,
          floor: 0.2
        },
        luminaireType: 'direct' as const
      };

      const result = UtilisationFactorCalculator.calculate(inputs);

      expect(result.utilisationFactor).toBeGreaterThan(0);
      expect(result.utilisationFactor).toBeLessThanOrEqual(1);
      expect(result.effectiveReflectances.ceiling).toBeGreaterThan(0.5);
      expect(result.effectiveReflectances.walls).toBeGreaterThan(0.3);
      expect(result.effectiveReflectances.floor).toBeGreaterThan(0.1);
      expect(result.recommendations).toBeDefined();
    });

    it('should show higher utilisation factor for better reflectances', () => {
      const baseInputs = {
        roomIndex: 2.0,
        roomReflectances: {
          ceiling: 0.5,
          walls: 0.3,
          floor: 0.1
        },
        luminaireType: 'direct' as const
      };

      const betterInputs = {
        roomIndex: 2.0,
        roomReflectances: {
          ceiling: 0.8,
          walls: 0.6,
          floor: 0.3
        },
        luminaireType: 'direct' as const
      };

      const baseResult = UtilisationFactorCalculator.calculate(baseInputs);
      const betterResult = UtilisationFactorCalculator.calculate(betterInputs);

      expect(betterResult.utilisationFactor).toBeGreaterThan(baseResult.utilisationFactor);
    });
  });
});

describe('MaintenanceFactorCalculator', () => {
  describe('calculate()', () => {
    it('should calculate maintenance factor for LED installation', () => {
      const inputs = {
        luminaireType: 'led' as const,
        environment: 'clean' as const,
        maintenanceSchedule: 'good' as const,
        operatingHours: 12,
        serviceLife: 10
      };

      const result = MaintenanceFactorCalculator.calculate(inputs);

      expect(result.maintenanceFactor).toBeGreaterThan(0);
      expect(result.maintenanceFactor).toBeLessThanOrEqual(1);
      expect(result.lampLumenDepreciation).toBeGreaterThan(0);
      expect(result.luminaireDirtDepreciation).toBeGreaterThan(0);
      expect(result.lampSurvivalFactor).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should show better maintenance factor for LED vs incandescent', () => {
      const baseInputs = {
        environment: 'normal' as const,
        maintenanceSchedule: 'good' as const,
        operatingHours: 8,
        serviceLife: 5
      };

      const ledInputs = { ...baseInputs, luminaireType: 'led' as const };
      const incandescentInputs = { ...baseInputs, luminaireType: 'incandescent' as const };

      const ledResult = MaintenanceFactorCalculator.calculate(ledInputs);
      const incandescentResult = MaintenanceFactorCalculator.calculate(incandescentInputs);

      expect(ledResult.maintenanceFactor).toBeGreaterThan(incandescentResult.maintenanceFactor);
    });

    it('should show impact of dirty environment', () => {
      const cleanInputs = {
        luminaireType: 'led' as const,
        environment: 'clean' as const,
        maintenanceSchedule: 'good' as const,
        operatingHours: 10,
        serviceLife: 8
      };

      const dirtyInputs = { ...cleanInputs, environment: 'very_dirty' as const };

      const cleanResult = MaintenanceFactorCalculator.calculate(cleanInputs);
      const dirtyResult = MaintenanceFactorCalculator.calculate(dirtyInputs);

      expect(cleanResult.maintenanceFactor).toBeGreaterThan(dirtyResult.maintenanceFactor);
    });
  });
});

describe('LEDReplacementCalculator', () => {
  describe('calculate()', () => {
    it('should calculate LED replacement benefits for incandescent lamps', () => {
      const inputs = {
        originalLuminaireType: 'incandescent',
        originalWattage: 60,
        numberOfLuminaires: 10,
        operatingHoursPerDay: 8,
        operatingDaysPerYear: 250,
        electricityRatePerKwh: 0.30,
        ledWattage: 8,
        ledCost: 15,
        installationCost: 50
      };

      const result = LEDReplacementCalculator.calculate(inputs);

      expect(result.originalWattage).toBe(60);
      expect(result.ledWattage).toBe(8);
      expect(result.energySavings.percentageSaving).toBeGreaterThan(80); // Should save >80%
      expect(result.energySavings.annualKwhSaving).toBeGreaterThan(0);
      expect(result.energySavings.annualCostSaving).toBeGreaterThan(0);
      expect(result.lightOutput.ledLumens).toBeGreaterThan(result.lightOutput.originalLumens);
      expect(result.paybackPeriod).toBeGreaterThan(0);
      expect(result.environmentalBenefit.co2Reduction).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should show excellent payback period for incandescent replacement', () => {
      const inputs = {
        originalLuminaireType: 'incandescent',
        originalWattage: 100,
        numberOfLuminaires: 20,
        operatingHoursPerDay: 12,
        operatingDaysPerYear: 365,
        electricityRatePerKwh: 0.35,
        ledWattage: 12,
        ledCost: 20,
        installationCost: 100
      };

      const result = LEDReplacementCalculator.calculate(inputs);

      // Should have very quick payback for this scenario
      expect(result.paybackPeriod).toBeLessThan(2); // Less than 2 years
      expect(result.energySavings.percentageSaving).toBeGreaterThan(85);
    });

    it('should calculate maintenance reduction benefits', () => {
      const inputs = {
        originalLuminaireType: 'halogen',
        originalWattage: 50,
        numberOfLuminaires: 15,
        operatingHoursPerDay: 10,
        operatingDaysPerYear: 300,
        electricityRatePerKwh: 0.28,
        ledWattage: 7,
        ledCost: 12
      };

      const result = LEDReplacementCalculator.calculate(inputs);

      expect(result.environmentalBenefit.reducedMaintenance).toBeGreaterThan(0);
    });

    it('should throw error for invalid inputs', () => {
      const invalidInputs = {
        originalLuminaireType: 'incandescent',
        originalWattage: 0,
        numberOfLuminaires: 10,
        operatingHoursPerDay: 8,
        operatingDaysPerYear: 250,
        electricityRatePerKwh: 0.30,
        ledWattage: 8,
        ledCost: 15
      };

      expect(() => LEDReplacementCalculator.calculate(invalidInputs)).toThrow();
    });
  });
});

describe('EnergyEfficiencyCalculator', () => {
  describe('calculate()', () => {
    it('should calculate energy efficiency for LED lighting system', () => {
      const inputs = {
        totalWattage: 2000,
        totalLumens: 200000,
        floorArea: 400,
        operatingHours: 2500,
        electricityRate: 0.30,
        buildingType: 'office'
      };

      const result = EnergyEfficiencyCalculator.calculate(inputs);

      expect(result.lumensPerWatt).toBe(100); // 200000/2000
      expect(result.efficacyRating).toBe('Excellent');
      expect(result.energyClass).toBe('A+');
      expect(result.annualEnergyConsumption).toBe(5000); // 2000W * 2500h / 1000
      expect(result.annualCost).toBe(1500); // 5000 * 0.30
      expect(result.complianceStatus.buildingRegsPartL).toBe(true);
      expect(result.complianceStatus.minEfficacy).toBe(60); // Office requirement
      expect(result.recommendations).toBeDefined();
    });

    it('should identify poor efficiency systems', () => {
      const inputs = {
        totalWattage: 5000,
        totalLumens: 50000, // Very poor efficiency
        floorArea: 200,
        operatingHours: 3000,
        electricityRate: 0.32,
        buildingType: 'warehouse'
      };

      const result = EnergyEfficiencyCalculator.calculate(inputs);

      expect(result.lumensPerWatt).toBe(10);
      expect(result.efficacyRating).toBe('Poor');
      expect(result.energyClass).toBe('F');
      expect(result.complianceStatus.buildingRegsPartL).toBe(false);
    });

    it('should handle different building types correctly', () => {
      const baseInputs = {
        totalWattage: 1000,
        totalLumens: 70000,
        floorArea: 100,
        operatingHours: 2000,
        electricityRate: 0.25
      };

      const officeInputs = { ...baseInputs, buildingType: 'office' };
      const retailInputs = { ...baseInputs, buildingType: 'retail' };

      const officeResult = EnergyEfficiencyCalculator.calculate(officeInputs);
      const retailResult = EnergyEfficiencyCalculator.calculate(retailInputs);

      expect(officeResult.complianceStatus.minEfficacy).toBe(60);
      expect(retailResult.complianceStatus.minEfficacy).toBe(50);
    });
  });
});

describe('UniformityRatioCalculator', () => {
  describe('calculate()', () => {
    it('should calculate uniformity ratio for office lighting', () => {
      const inputs = {
        roomLength: 12,
        roomWidth: 8,
        gridSpacing: 2,
        illuminanceMeasurements: [450, 480, 470, 460, 500, 490, 465, 475, 485, 455, 495, 480],
        standard: 'BS EN 12464-1',
        applicationType: 'office'
      };

      const result = UniformityRatioCalculator.calculate(inputs);

      expect(result.averageIlluminance).toBeCloseTo(475.4, 1);
      expect(result.minimumIlluminance).toBe(450);
      expect(result.uniformityRatio).toBeCloseTo(0.945, 2);
      expect(result.complianceStatus.standard).toBe('BS EN 12464-1');
      expect(result.complianceStatus.requiredRatio).toBe(0.7);
      expect(result.complianceStatus.isCompliant).toBe(true);
      expect(result.gridMeasurements).toBeDefined();
      expect(result.gridMeasurements.length).toBe(12);
      expect(result.recommendations).toBeDefined();
    });

    it('should identify poor uniformity', () => {
      const inputs = {
        roomLength: 10,
        roomWidth: 6,
        gridSpacing: 2,
        illuminanceMeasurements: [200, 450, 380, 150, 500, 420, 180, 480, 350],
        standard: 'BS EN 12464-1',
        applicationType: 'office'
      };

      const result = UniformityRatioCalculator.calculate(inputs);

      expect(result.uniformityRatio).toBeLessThan(0.7);
      expect(result.complianceStatus.isCompliant).toBe(false);
      expect(result.recommendations.some(r => r.includes('poor uniformity') || r.includes('below standard'))).toBe(true);
    });

    it('should handle different standards and application types', () => {
      const warehouseInputs = {
        roomLength: 20,
        roomWidth: 15,
        gridSpacing: 3,
        illuminanceMeasurements: [180, 220, 200, 190, 240, 210, 185, 225, 205, 195, 235, 215],
        standard: 'BS EN 12464-1',
        applicationType: 'warehouse'
      };

      const result = UniformityRatioCalculator.calculate(warehouseInputs);

      expect(result.complianceStatus.requiredRatio).toBe(0.4); // Warehouse requirement
    });

    it('should throw error for insufficient measurement points', () => {
      const inputs = {
        roomLength: 8,
        roomWidth: 6,
        gridSpacing: 2,
        illuminanceMeasurements: [400, 450, 420], // Only 3 points
        standard: 'BS EN 12464-1',
        applicationType: 'office'
      };

      expect(() => UniformityRatioCalculator.calculate(inputs)).toThrow();
    });
  });
});

describe('GlareIndexCalculator', () => {
  describe('calculate()', () => {
    it('should calculate UGR for office environment', () => {
      const inputs = {
        luminairePositions: [
          { x: 2, y: 3, height: 2.2, luminance: 3000, luminousArea: 0.36 },
          { x: 6, y: 3, height: 2.2, luminance: 3000, luminousArea: 0.36 },
          { x: 2, y: 6, height: 2.2, luminance: 3000, luminousArea: 0.36 },
          { x: 6, y: 6, height: 2.2, luminance: 3000, luminousArea: 0.36 }
        ],
        backgroundLuminance: 50,
        observerPosition: { x: 4, y: 4.5 },
        maxUgrAllowed: 19,
        standard: 'BS EN 12464-1'
      };

      const result = GlareIndexCalculator.calculate(inputs);

      expect(result.unifiedGlareRating).toBeGreaterThan(0);
      expect(result.glareCategory).toBeDefined();
      expect(['Imperceptible', 'Perceptible', 'Disturbing', 'Intolerable']).toContain(result.glareCategory);
      expect(result.complianceStatus.maxUgrAllowed).toBe(19);
      expect(result.complianceStatus.standard).toBe('BS EN 12464-1');
      expect(result.luminairePositions).toBeDefined();
      expect(result.luminairePositions.length).toBe(4);
      expect(result.recommendations).toBeDefined();
    });

    it('should identify glare problems', () => {
      const inputs = {
        luminairePositions: [
          { x: 1, y: 1, height: 1.8, luminance: 8000, luminousArea: 0.5 } // High luminance, low height
        ],
        backgroundLuminance: 30,
        observerPosition: { x: 2, y: 2 },
        maxUgrAllowed: 16,
        standard: 'BS EN 12464-1'
      };

      const result = GlareIndexCalculator.calculate(inputs);

      // This configuration should produce high UGR
      expect(result.unifiedGlareRating).toBeGreaterThan(16);
      expect(result.complianceStatus.isCompliant).toBe(false);
    });

    it('should categorize glare levels correctly', () => {
      // Test glare categories
      const lowGlareInputs = {
        luminairePositions: [
          { x: 5, y: 5, height: 3, luminance: 1000, luminousArea: 0.2 }
        ],
        backgroundLuminance: 80,
        observerPosition: { x: 3, y: 3 },
        maxUgrAllowed: 19,
        standard: 'BS EN 12464-1'
      };

      const result = GlareIndexCalculator.calculate(lowGlareInputs);
      
      // Should be low glare due to distance and lower luminance
      expect(['Imperceptible', 'Perceptible']).toContain(result.glareCategory);
    });
  });
});

describe('DomesticLightingCalculator', () => {
  describe('calculate()', () => {
    it('should calculate lighting for living room', () => {
      const inputs = {
        roomType: 'living_room',
        roomLength: 5,
        roomWidth: 4,
        roomHeight: 2.4,
        ceilingColor: 'light',
        wallColor: 'medium',
        electricityRate: 0.28,
        preferredColorTemperature: 2700
      };

      const result = DomesticLightingCalculator.calculate(inputs);

      expect(result.roomType).toBe('living_room');
      expect(result.recommendedIlluminance).toBe(150);
      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.luminaireType).toBeDefined();
      expect(result.totalWattage).toBeGreaterThan(0);
      expect(result.switchingArrangement).toBeDefined();
      expect(result.dimmingRecommendation).toBe(true); // Living room should have dimming
      expect(result.energyEfficiencyRating).toBeDefined();
      expect(result.complianceChecks.buildingRegs).toBeDefined();
      expect(result.annualCost).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
    });

    it('should calculate lighting for kitchen', () => {
      const inputs = {
        roomType: 'kitchen',
        roomLength: 4,
        roomWidth: 3,
        roomHeight: 2.4,
        ceilingColor: 'light',
        wallColor: 'light',
        electricityRate: 0.30
      };

      const result = DomesticLightingCalculator.calculate(inputs);

      expect(result.recommendedIlluminance).toBe(300); // Higher than living room
      expect(result.luminaireType).toBe('LED Downlight');
      expect(result.dimmingRecommendation).toBe(false); // Kitchen typically doesn't need dimming
    });

    it('should handle bathroom lighting with special requirements', () => {
      const inputs = {
        roomType: 'bathroom',
        roomLength: 2.5,
        roomWidth: 2,
        roomHeight: 2.4,
        ceilingColor: 'light',
        wallColor: 'light',
        electricityRate: 0.32
      };

      const result = DomesticLightingCalculator.calculate(inputs);

      expect(result.recommendedIlluminance).toBe(200);
      expect(result.luminaireType).toBe('LED IP44 Downlight');
      expect(result.recommendations.some(r => r.includes('IP44'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('Part P'))).toBe(true);
    });

    it('should calculate energy efficiency ratings correctly', () => {
      const efficientInputs = {
        roomType: 'bedroom',
        roomLength: 4,
        roomWidth: 3.5,
        roomHeight: 2.4,
        ceilingColor: 'light',
        wallColor: 'light',
        electricityRate: 0.25
      };

      const result = DomesticLightingCalculator.calculate(efficientInputs);

      // Should achieve good efficiency with LED
      expect(['A', 'B']).toContain(result.energyEfficiencyRating);
      expect(result.complianceChecks.buildingRegs).toBe(true);
    });
  });
});

describe('CommercialLightingCalculator', () => {
  describe('calculate()', () => {
    it('should calculate lighting for office space', () => {
      const inputs = {
        premiseType: 'office',
        workingArea: 'general',
        roomLength: 15,
        roomWidth: 10,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        operatingHours: 10,
        operatingDays: 250,
        electricityRate: 0.25,
        specialRequirements: ['VDU work']
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      expect(result.premiseType).toBe('office');
      expect(result.workingArea).toBe('general');
      expect(result.requiredIlluminance).toBe(500); // BS EN 12464-1 office requirement
      expect(result.designIlluminance).toBe(600); // 20% margin
      expect(result.numberOfLuminaires).toBeGreaterThan(0);
      expect(result.luminaireSpecification.type).toBe('LED Panel 600x600');
      expect(result.luminaireSpecification.wattage).toBe(40);
      expect(result.luminaireSpecification.lumens).toBe(4000);
      expect(result.luminaireSpecification.cri).toBe(80);
      expect(result.luminaireSpecification.colorTemperature).toBe(4000);
      expect(result.controlSystems).toContain('Occupancy sensors');
      expect(result.emergencyLighting.required).toBe(true);
      expect(result.energyConsumption.annualCost).toBeGreaterThan(0);
      expect(result.complianceChecks.bsEn12464).toBe(true);
      expect(result.maintenanceSchedule).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should calculate lighting for warehouse', () => {
      const inputs = {
        premiseType: 'warehouse',
        workingArea: 'general',
        roomLength: 50,
        roomWidth: 30,
        roomHeight: 8,
        workingPlaneHeight: 1,
        operatingHours: 12,
        operatingDays: 300,
        electricityRate: 0.22
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      expect(result.requiredIlluminance).toBe(200); // Warehouse requirement
      expect(result.luminaireSpecification.type).toBe('LED High Bay');
      expect(result.luminaireSpecification.wattage).toBe(150);
      expect(result.controlSystems).toContain('High/low level switching');
    });

    it('should calculate lighting for retail space', () => {
      const inputs = {
        premiseType: 'retail',
        workingArea: 'display',
        roomLength: 20,
        roomWidth: 15,
        roomHeight: 3.5,
        workingPlaneHeight: 0.8,
        operatingHours: 14,
        operatingDays: 360,
        electricityRate: 0.28
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      expect(result.requiredIlluminance).toBe(1000); // Display lighting requirement
      expect(result.luminaireSpecification.type).toBe('LED Track Spotlight');
      expect(result.luminaireSpecification.cri).toBe(90); // High CRI for retail
    });

    it('should handle precision work requirements', () => {
      const inputs = {
        premiseType: 'manufacturing',
        workingArea: 'precision',
        roomLength: 12,
        roomWidth: 8,
        roomHeight: 4,
        workingPlaneHeight: 1,
        operatingHours: 16,
        operatingDays: 250,
        electricityRate: 0.24,
        specialRequirements: ['high precision', 'fine work']
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      expect(result.requiredIlluminance).toBe(1000); // High illuminance for precision work
      expect(result.recommendations.some(r => r.includes('High CRI'))).toBe(true);
    });

    it('should check Building Regulations compliance', () => {
      const inputs = {
        premiseType: 'office',
        workingArea: 'general',
        roomLength: 10,
        roomWidth: 8,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        operatingHours: 8,
        operatingDays: 220,
        electricityRate: 0.30
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      // LED panels should meet Building Regs Part L
      expect(result.complianceChecks.buildingRegsPartL).toBe(true);
      expect(result.complianceChecks.workplaceRegs).toBe(true);
    });

    it('should calculate energy consumption accurately', () => {
      const inputs = {
        premiseType: 'office',
        workingArea: 'general',
        roomLength: 8,
        roomWidth: 6,
        roomHeight: 3,
        workingPlaneHeight: 0.8,
        operatingHours: 10,
        operatingDays: 250,
        electricityRate: 0.25
      };

      const result = CommercialLightingCalculator.calculate(inputs);

      const expectedDailyKwh = (result.numberOfLuminaires * 40 * 10) / 1000;
      const expectedAnnualKwh = expectedDailyKwh * 250;
      const expectedAnnualCost = expectedAnnualKwh * 0.25;

      expect(result.energyConsumption.dailyKwh).toBeCloseTo(expectedDailyKwh, 2);
      expect(result.energyConsumption.annualKwh).toBeCloseTo(expectedAnnualKwh, 2);
      expect(result.energyConsumption.annualCost).toBeCloseTo(expectedAnnualCost, 2);
    });
  });
});
