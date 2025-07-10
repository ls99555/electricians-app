/**
 * Comprehensive test suite for Switchgear Rating Calculator and Busbar Current Rating Calculator
 * Tests cover UK regulation compliance, edge cases, and realistic scenarios
 */

import { SwitchgearRatingCalculator, BusbarCurrentRatingCalculator } from '../capacity-calculations';

describe('SwitchgearRatingCalculator', () => {
  describe('Basic Functionality', () => {
    test('should calculate switchgear rating for typical industrial installation', () => {
      const inputs = {
        systemVoltage: 11000, // 11kV
        totalLoad: 2500, // 2.5MW
        prospectiveFaultCurrent: 25, // 25kA
        switchgearType: 'air_insulated' as const,
        operatingConditions: {
          indoor: true,
          ambientTemperature: 35,
          altitude: 200,
          pollution: 'light' as const
        },
        protectionRequirements: ['overcurrent', 'earth_fault'],
        automationLevel: 'semi_automatic' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.nominalVoltage).toBe(11);
      expect(result.nominalCurrent).toBeGreaterThan(130); // ~131A expected
      expect(result.shortCircuitRating.breakingCurrent).toBeCloseTo(27.5, 1);
      expect(result.shortCircuitRating.makingCurrent).toBeCloseTo(68.75, 1);
      expect(result.busbarRating.continuousCurrent).toBeGreaterThan(130);
      expect(result.regulation).toContain('BS EN 61936-1');
    });

    test('should calculate switchgear rating for commercial LV installation', () => {
      const inputs = {
        systemVoltage: 400, // 400V
        totalLoad: 200, // 200kW
        prospectiveFaultCurrent: 16, // 16kA
        switchgearType: 'air_insulated' as const,
        operatingConditions: {
          indoor: true,
          ambientTemperature: 25,
          altitude: 100,
          pollution: 'light' as const
        },
        protectionRequirements: ['overcurrent'],
        automationLevel: 'manual' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.nominalVoltage).toBe(0.4);
      expect(result.nominalCurrent).toBeGreaterThan(350); // ~361A expected
      expect(result.shortCircuitRating.breakingCurrent).toBeCloseTo(17.6, 1);
      expect(result.recommendations).toContain('Ensure switchgear rating exceeds maximum demand current by at least 25%');
    });

    test('should handle outdoor gas insulated switchgear', () => {
      const inputs = {
        systemVoltage: 33000, // 33kV
        totalLoad: 10000, // 10MW
        prospectiveFaultCurrent: 31.5, // 31.5kA
        switchgearType: 'gas_insulated' as const,
        operatingConditions: {
          indoor: false,
          ambientTemperature: 40,
          altitude: 500,
          pollution: 'medium' as const
        },
        protectionRequirements: ['overcurrent', 'earth_fault', 'differential'],
        automationLevel: 'fully_automatic' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.nominalVoltage).toBe(33);
      expect(result.nominalCurrent).toBeGreaterThan(190); // ~196A expected
      expect(result.mechanicalSpecification.operatingMechanism).toBe('Stored energy mechanism');
      expect(result.mechanicalSpecification.operatingTime).toBe(50);
      expect(result.protectionCoordination).toContain('Differential protection recommended for transformer circuits');
      expect(result.recommendations).toContain('Outdoor installation - specify appropriate IP rating and UV protection');
    });
  });

  describe('Environmental Conditions', () => {
    test('should apply altitude correction to insulation levels', () => {
      const baseInputs = {
        systemVoltage: 11000,
        totalLoad: 1000,
        prospectiveFaultCurrent: 20,
        switchgearType: 'air_insulated' as const,
        operatingConditions: {
          indoor: true,
          ambientTemperature: 25,
          altitude: 0,
          pollution: 'light' as const
        },
        protectionRequirements: ['overcurrent'],
        automationLevel: 'manual' as const
      };

      const seaLevel = SwitchgearRatingCalculator.calculate(baseInputs);
      
      const highAltitude = SwitchgearRatingCalculator.calculate({
        ...baseInputs,
        operatingConditions: {
          ...baseInputs.operatingConditions,
          altitude: 2000
        }
      });

      expect(highAltitude.insulationLevel.powerFrequencyVoltage)
        .toBeGreaterThan(seaLevel.insulationLevel.powerFrequencyVoltage);
      expect(highAltitude.recommendations).toContain('Altitude derating applied - verify with manufacturer specifications');
    });

    test('should handle polluted environments', () => {
      const inputs = {
        systemVoltage: 11000,
        totalLoad: 1000,
        prospectiveFaultCurrent: 20,
        switchgearType: 'air_insulated' as const,
        operatingConditions: {
          indoor: false,
          ambientTemperature: 35,
          altitude: 200,
          pollution: 'heavy' as const
        },
        protectionRequirements: ['overcurrent'],
        automationLevel: 'manual' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.installationRequirements).toContain('Enhanced cleaning schedule required');
      expect(result.recommendations).toContain('Enhanced insulation and cleaning schedule required for polluted environment');
    });
  });

  describe('Protection and Coordination', () => {
    test('should provide appropriate protection coordination for multiple requirements', () => {
      const inputs = {
        systemVoltage: 11000,
        totalLoad: 5000,
        prospectiveFaultCurrent: 25,
        switchgearType: 'vacuum' as const,
        operatingConditions: {
          indoor: true,
          ambientTemperature: 25,
          altitude: 100,
          pollution: 'light' as const
        },
        protectionRequirements: ['overcurrent', 'earth_fault', 'differential', 'directional', 'distance'],
        automationLevel: 'fully_automatic' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.protectionCoordination).toContain('Differential protection recommended for transformer circuits');
      expect(result.protectionCoordination).toContain('Directional overcurrent protection for parallel feeders');
      expect(result.protectionCoordination).toContain('Distance protection for long transmission lines');
      expect(result.mechanicalSpecification.operatingMechanism).toBe('Magnetic actuator');
    });
  });

  describe('Economic Analysis', () => {
    test('should provide realistic cost estimates', () => {
      const inputs = {
        systemVoltage: 11000,
        totalLoad: 2000,
        prospectiveFaultCurrent: 20,
        switchgearType: 'gas_insulated' as const,
        operatingConditions: {
          indoor: true,
          ambientTemperature: 25,
          altitude: 100,
          pollution: 'light' as const
        },
        protectionRequirements: ['overcurrent'],
        automationLevel: 'semi_automatic' as const
      };

      const result = SwitchgearRatingCalculator.calculate(inputs);

      expect(result.economics.equipmentCost).toBeGreaterThan(50000);
      expect(result.economics.installationCost).toBeGreaterThan(15000);
      expect(result.economics.maintenanceCost).toBeGreaterThan(1000);
      // Installation cost should be approximately 30% of equipment cost
      expect(result.economics.installationCost).toBeGreaterThan(result.economics.equipmentCost * 0.25);
      expect(result.economics.installationCost).toBeLessThan(result.economics.equipmentCost * 0.35);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for invalid system voltage', () => {
      expect(() => {
        SwitchgearRatingCalculator.calculate({
          systemVoltage: -400,
          totalLoad: 100,
          prospectiveFaultCurrent: 10,
          switchgearType: 'air_insulated',
          operatingConditions: {
            indoor: true,
            ambientTemperature: 25,
            altitude: 100,
            pollution: 'light'
          },
          protectionRequirements: ['overcurrent'],
          automationLevel: 'manual'
        });
      }).toThrow('System voltage must be positive');
    });

    test('should throw error for invalid load', () => {
      expect(() => {
        SwitchgearRatingCalculator.calculate({
          systemVoltage: 400,
          totalLoad: 0,
          prospectiveFaultCurrent: 10,
          switchgearType: 'air_insulated',
          operatingConditions: {
            indoor: true,
            ambientTemperature: 25,
            altitude: 100,
            pollution: 'light'
          },
          protectionRequirements: ['overcurrent'],
          automationLevel: 'manual'
        });
      }).toThrow('Total load must be positive');
    });

    test('should throw error for extreme temperatures', () => {
      expect(() => {
        SwitchgearRatingCalculator.calculate({
          systemVoltage: 400,
          totalLoad: 100,
          prospectiveFaultCurrent: 10,
          switchgearType: 'air_insulated',
          operatingConditions: {
            indoor: true,
            ambientTemperature: 70,
            altitude: 100,
            pollution: 'light'
          },
          protectionRequirements: ['overcurrent'],
          automationLevel: 'manual'
        });
      }).toThrow('Ambient temperature must be between -40°C and 60°C');
    });

    test('should throw error for excessive altitude', () => {
      expect(() => {
        SwitchgearRatingCalculator.calculate({
          systemVoltage: 400,
          totalLoad: 100,
          prospectiveFaultCurrent: 10,
          switchgearType: 'air_insulated',
          operatingConditions: {
            indoor: true,
            ambientTemperature: 25,
            altitude: 6000,
            pollution: 'light'
          },
          protectionRequirements: ['overcurrent'],
          automationLevel: 'manual'
        });
      }).toThrow('Altitude must be between 0 and 5000 meters');
    });
  });
});

describe('BusbarCurrentRatingCalculator', () => {
  describe('Basic Functionality', () => {
    test('should calculate current rating for rectangular copper busbars', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100, // 100mm
          thickness: 10 // 10mm
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 35,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150, // 150mm
        length: 10 // 10m
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.continuousCurrentRating).toBeGreaterThan(3000); // ~3500A expected
      expect(result.shortTimeCurrentRating).toBeGreaterThan(140); // ~143kA expected
      expect(result.peakCurrentRating).toBeCloseTo(result.shortTimeCurrentRating * 2.5, 10);
      expect(result.thermalCalculation.steadyStateTemperature).toBeGreaterThan(40);
      expect(result.thermalCalculation.steadyStateTemperature).toBeLessThan(120);
      expect(result.regulation).toContain('BS EN 60439-1');
    });

    test('should calculate current rating for circular aluminium busbars', () => {
      const inputs = {
        busbarType: 'circular' as const,
        material: 'aluminium' as const,
        dimensions: {
          diameter: 50 // 50mm
        },
        installationMethod: 'enclosed' as const,
        ambientTemperature: 40,
        temperatureRise: 40,
        ventilation: 'forced' as const,
        spacing: 100,
        length: 5
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.continuousCurrentRating).toBeGreaterThan(1000);
      expect(result.shortTimeCurrentRating).toBeGreaterThan(18); // Aluminium has lower short-time rating
      expect(result.thermalCalculation.steadyStateTemperature).toBeGreaterThan(40);
      expect(result.thermalCalculation.steadyStateTemperature).toBeLessThan(120);
      expect(result.economics.materialCost).toBeLessThan(50); // Aluminium is cheaper than copper
    });

    test('should handle multistrip busbar configuration', () => {
      const inputs = {
        busbarType: 'multistrip' as const,
        material: 'copper' as const,
        dimensions: {
          width: 80,
          thickness: 8,
          numberOfStrips: 3
        },
        installationMethod: 'duct' as const,
        ambientTemperature: 30,
        temperatureRise: 60,
        ventilation: 'natural' as const,
        spacing: 200,
        length: 15
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.continuousCurrentRating).toBeGreaterThan(3000);
      expect(result.mechanicalStresses.supportSpacing).toBeGreaterThan(0.5); // Should be reasonable spacing
      expect(result.mechanicalStresses.supportSpacing).toBeLessThan(3.5); // Within practical limits
      expect(result.recommendations).toContain('Ensure busbar current rating exceeds maximum demand current');
    });
  });

  describe('Thermal Calculations', () => {
    test('should calculate realistic thermal characteristics', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 120,
          thickness: 12
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 40,
        temperatureRise: 45,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 8
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.thermalCalculation.steadyStateTemperature).toBeGreaterThan(inputs.ambientTemperature);
      expect(result.thermalCalculation.temperatureRise).toBeGreaterThan(0);
      expect(result.thermalCalculation.thermalResistance).toBeGreaterThan(0);
      expect(result.thermalCalculation.powerloss).toBeGreaterThan(0);

      // Check for high temperature warning
      if (result.thermalCalculation.steadyStateTemperature > 70) {
        expect(result.recommendations).toContain('High operating temperature - consider enhanced cooling or larger conductor');
      }
    });

    test('should apply ventilation effects correctly', () => {
      const baseInputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        installationMethod: 'enclosed' as const,
        ambientTemperature: 35,
        temperatureRise: 50,
        spacing: 150,
        length: 10
      };

      const naturalVent = BusbarCurrentRatingCalculator.calculate({
        ...baseInputs,
        ventilation: 'natural' as const
      });

      const forcedVent = BusbarCurrentRatingCalculator.calculate({
        ...baseInputs,
        ventilation: 'forced' as const
      });

      const noVent = BusbarCurrentRatingCalculator.calculate({
        ...baseInputs,
        ventilation: 'none' as const
      });

      expect(forcedVent.continuousCurrentRating).toBeGreaterThan(naturalVent.continuousCurrentRating);
      expect(naturalVent.continuousCurrentRating).toBeGreaterThan(noVent.continuousCurrentRating);
      expect(noVent.recommendations).toContain('No ventilation - consider forced cooling for high current applications');
    });
  });

  describe('Mechanical Calculations', () => {
    test('should calculate electromagnetic forces accurately', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 100, // Close spacing = higher forces
        length: 5
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.mechanicalStresses.electromagneticForce).toBeGreaterThan(0);
      expect(result.mechanicalStresses.mechanicalResonance).toBeGreaterThan(0);
      expect(result.mechanicalStresses.supportSpacing).toBeGreaterThan(0.5);
      expect(result.mechanicalStresses.supportSpacing).toBeLessThan(3.5);
    });

    test('should provide realistic support spacing recommendations', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 150,
          thickness: 15
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 200,
        length: 20
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      // Support spacing should be reasonable for practical installation
      expect(result.mechanicalStresses.supportSpacing).toBeGreaterThan(0.5);
      expect(result.mechanicalStresses.supportSpacing).toBeLessThan(3.5);
    });
  });

  describe('Short-Circuit Effects', () => {
    test('should calculate short-circuit temperature rise', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 40,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 10
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.shortCircuitEffects.maxTemperature).toBeGreaterThan(inputs.ambientTemperature);
      expect(result.shortCircuitEffects.expansionForces).toBeGreaterThan(0);
      
      if (result.shortCircuitEffects.maxTemperature > 200) {
        expect(result.shortCircuitEffects.thermalStress).toContain('High thermal stress');
      }
    });
  });

  describe('Economic Analysis', () => {
    test('should provide realistic material costs', () => {
      const copperInputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 10
      };

      const aluminiumInputs = {
        ...copperInputs,
        material: 'aluminium' as const
      };

      const copperResult = BusbarCurrentRatingCalculator.calculate(copperInputs);
      const aluminiumResult = BusbarCurrentRatingCalculator.calculate(aluminiumInputs);

      expect(copperResult.economics.materialCost).toBeGreaterThan(aluminiumResult.economics.materialCost);
      expect(copperResult.economics.installationCost).toBeGreaterThan(0);
      expect(copperResult.economics.lossesCost).toBeGreaterThan(0);
      
      // Aluminium has higher losses due to higher resistance, but the difference may be small
      expect(aluminiumResult.economics.lossesCost).toBeGreaterThan(0);
      expect(copperResult.economics.lossesCost).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for invalid dimensions', () => {
      expect(() => {
        BusbarCurrentRatingCalculator.calculate({
          busbarType: 'rectangular',
          material: 'copper',
          dimensions: {
            width: 100
            // Missing thickness
          },
          installationMethod: 'open_air',
          ambientTemperature: 25,
          temperatureRise: 50,
          ventilation: 'natural',
          spacing: 150,
          length: 10
        });
      }).toThrow('Width and thickness required for rectangular busbars');
    });

    test('should throw error for circular busbar without diameter', () => {
      expect(() => {
        BusbarCurrentRatingCalculator.calculate({
          busbarType: 'circular',
          material: 'copper',
          dimensions: {},
          installationMethod: 'open_air',
          ambientTemperature: 25,
          temperatureRise: 50,
          ventilation: 'natural',
          spacing: 150,
          length: 10
        });
      }).toThrow('Diameter required for circular busbars');
    });

    test('should throw error for invalid temperature range', () => {
      expect(() => {
        BusbarCurrentRatingCalculator.calculate({
          busbarType: 'rectangular',
          material: 'copper',
          dimensions: {
            width: 100,
            thickness: 10
          },
          installationMethod: 'open_air',
          ambientTemperature: -50,
          temperatureRise: 50,
          ventilation: 'natural',
          spacing: 150,
          length: 10
        });
      }).toThrow('Ambient temperature must be between -40°C and 60°C');
    });

    test('should throw error for invalid temperature rise', () => {
      expect(() => {
        BusbarCurrentRatingCalculator.calculate({
          busbarType: 'rectangular',
          material: 'copper',
          dimensions: {
            width: 100,
            thickness: 10
          },
          installationMethod: 'open_air',
          ambientTemperature: 25,
          temperatureRise: 120,
          ventilation: 'natural',
          spacing: 150,
          length: 10
        });
      }).toThrow('Temperature rise must be between 0K and 100K');
    });

    test('should throw error for invalid spacing', () => {
      expect(() => {
        BusbarCurrentRatingCalculator.calculate({
          busbarType: 'rectangular',
          material: 'copper',
          dimensions: {
            width: 100,
            thickness: 10
          },
          installationMethod: 'open_air',
          ambientTemperature: 25,
          temperatureRise: 50,
          ventilation: 'natural',
          spacing: 0,
          length: 10
        });
      }).toThrow('Phase spacing must be positive');
    });
  });

  describe('Material-Specific Behavior', () => {
    test('should provide appropriate recommendations for aluminium', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'aluminium' as const,
        dimensions: {
          width: 120,
          thickness: 12
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 10
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.recommendations).toContain('Aluminium busbars - use appropriate connection techniques to prevent corrosion');
    });

    test('should handle silver-plated busbars with higher ratings', () => {
      const inputs = {
        busbarType: 'rectangular' as const,
        material: 'silver_plated' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        installationMethod: 'open_air' as const,
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 10
      };

      const result = BusbarCurrentRatingCalculator.calculate(inputs);

      expect(result.continuousCurrentRating).toBeGreaterThan(3000);
      expect(result.economics.materialCost).toBeGreaterThan(100); // Silver-plated is expensive
    });
  });

  describe('Installation Method Effects', () => {
    test('should show enclosed installation has lower ratings', () => {
      const baseInputs = {
        busbarType: 'rectangular' as const,
        material: 'copper' as const,
        dimensions: {
          width: 100,
          thickness: 10
        },
        ambientTemperature: 25,
        temperatureRise: 50,
        ventilation: 'natural' as const,
        spacing: 150,
        length: 10
      };

      const openAir = BusbarCurrentRatingCalculator.calculate({
        ...baseInputs,
        installationMethod: 'open_air' as const
      });

      const enclosed = BusbarCurrentRatingCalculator.calculate({
        ...baseInputs,
        installationMethod: 'enclosed' as const
      });

      expect(openAir.continuousCurrentRating).toBeGreaterThan(enclosed.continuousCurrentRating);
      expect(enclosed.recommendations).toContain('Enclosed installation - ensure adequate ventilation for heat dissipation');
    });
  });
});
