/**
 * Renewable Energy Calculations Test Suite
 * Tests for Wind Turbine, Generator Sizing, Standby Generator, Feed-in Tariff, and Carbon Footprint calculators
 */

import {
  WindTurbineCalculator,
  GeneratorSizingCalculator,
  StandbyGeneratorCalculator,
  FeedInTariffCalculator,
  CarbonFootprintCalculator
} from '../renewable-energy';

describe('Renewable Energy Calculations', () => {
  describe('WindTurbineCalculator', () => {
    const mockInputs = {
      turbineRating: 10, // kW
      hubHeight: 30, // meters
      rotorDiameter: 8, // meters
      windSpeed: 7, // m/s
      airDensity: 1.225, // kg/m³
      powerCurve: [
        { windSpeed: 3, power: 0 },
        { windSpeed: 7, power: 5 },
        { windSpeed: 12, power: 10 },
        { windSpeed: 25, power: 0 }
      ],
      siteConditions: 'rural' as const,
      terrainRoughness: 0.14
    };

    test('should calculate basic wind turbine parameters', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(result.nominalPower).toBe(10);
      expect(result.actualPower).toBeGreaterThan(0);
      expect(result.actualPower).toBeLessThanOrEqual(10);
      expect(result.cutInSpeed).toBe(3);
      expect(result.ratedSpeed).toBe(12);
      expect(result.cutOutSpeed).toBe(25);
    });

    test('should calculate annual energy output', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(result.annualEnergyOutput).toBeGreaterThan(0);
      expect(result.annualEnergyOutput).toBeLessThan(100000); // Reasonable upper limit
      expect(result.capacityFactor).toBeGreaterThan(0);
      expect(result.capacityFactor).toBeLessThan(100);
    });

    test('should determine grid connection requirements', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(['G98', 'G99']).toContain(result.gridConnection.type);
      expect(result.gridConnection.voltageLevel).toBeDefined();
      expect(Array.isArray(result.gridConnection.protectionRequired)).toBe(true);
      
      // Small turbine should be G98 compliant
      expect(result.gridConnection.type).toBe('G98');
    });

    test('should calculate economic parameters', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(result.economics.installationCost).toBeGreaterThan(0);
      expect(result.economics.annualIncome).toBeGreaterThan(0);
      expect(result.economics.paybackPeriod).toBeGreaterThan(0);
      expect(result.economics.paybackPeriod).toBeLessThan(50); // Reasonable upper limit
    });

    test('should handle large turbine (G99)', () => {
      const largeInputs = { ...mockInputs, turbineRating: 100 };
      const result = WindTurbineCalculator.calculate(largeInputs);
      
      expect(result.gridConnection.type).toBe('G99');
      expect(result.gridConnection.voltageLevel).toContain('kV');
    });

    test('should validate input parameters', () => {
      expect(() => {
        WindTurbineCalculator.calculate({ ...mockInputs, turbineRating: 0 });
      }).toThrow('Invalid input parameters');

      expect(() => {
        WindTurbineCalculator.calculate({ ...mockInputs, hubHeight: -10 });
      }).toThrow('Invalid input parameters');
    });

    test('should include regulation compliance', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(result.regulation).toContain('IEC 61400');
      expect(result.regulation).toContain('G98/G99');
    });

    test('should provide recommendations', () => {
      const result = WindTurbineCalculator.calculate(mockInputs);
      
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('GeneratorSizingCalculator', () => {
    const mockInputs = {
      loadType: 'standby' as const,
      totalLoad: 50, // kW
      startingLoads: [
        { equipment: 'Motor 1', startingPower: 15, runningPower: 10, startingMethod: 'DOL' as const },
        { equipment: 'Motor 2', startingPower: 10, runningPower: 8, startingMethod: 'star_delta' as const }
      ],
      powerFactor: 0.8,
      fuelType: 'diesel' as const,
      altitude: 100, // meters
      ambientTemperature: 25, // °C
      runningHours: 500 // hours/year
    };

    test('should calculate generator sizing', () => {
      const result = GeneratorSizingCalculator.calculate(mockInputs);
      
      expect(result.recommendedRating).toBeGreaterThanOrEqual(50);
      expect(result.enginePower).toBeGreaterThan(0);
      expect(result.fuelConsumption).toBeGreaterThan(0);
    });

    test('should handle starting loads correctly', () => {
      const result = GeneratorSizingCalculator.calculate(mockInputs);
      
      expect(result.startingCapability.largestMotor).toBe(15);
      expect(result.startingCapability.totalStartingLoad).toBeGreaterThan(25); // With starting factors
      expect(result.startingCapability.voltageDip).toBeGreaterThan(0);
      expect(result.startingCapability.voltageDip).toBeLessThan(100);
    });

    test('should specify alternator configuration', () => {
      const result = GeneratorSizingCalculator.calculate(mockInputs);
      
      expect(result.alternatorSpecification.voltage).toBeGreaterThan(0);
      expect(result.alternatorSpecification.frequency).toBe(50);
      expect([1, 3]).toContain(result.alternatorSpecification.phases);
      expect(result.alternatorSpecification.connection).toBe('star');
    });

    test('should calculate transfer switch rating', () => {
      const result = GeneratorSizingCalculator.calculate(mockInputs);
      
      expect(result.transferSwitchRating).toBeGreaterThan(0);
      expect(result.transferSwitchRating).toBeGreaterThan(result.recommendedRating * 0.5);
    });

    test('should include protection requirements', () => {
      const result = GeneratorSizingCalculator.calculate(mockInputs);
      
      expect(Array.isArray(result.protectionRequirements)).toBe(true);
      expect(result.protectionRequirements.length).toBeGreaterThan(0);
      expect(result.protectionRequirements.some(req => req.includes('Engine protection'))).toBe(true);
    });

    test('should handle different fuel types', () => {
      const gasInputs = { ...mockInputs, fuelType: 'gas' as const };
      const result = GeneratorSizingCalculator.calculate(gasInputs);
      
      expect(result.fuelConsumption).toBeGreaterThan(0);
      expect(result.economics).toBeDefined();
    });

    test('should apply derating for altitude and temperature', () => {
      const highAltInputs = { ...mockInputs, altitude: 2000, ambientTemperature: 45 };
      const result = GeneratorSizingCalculator.calculate(highAltInputs);
      
      // Engine power should be derated for high altitude and temperature
      expect(result.enginePower).toBeLessThan(result.recommendedRating);
    });

    test('should validate input parameters', () => {
      expect(() => {
        GeneratorSizingCalculator.calculate({ ...mockInputs, totalLoad: 0 });
      }).toThrow('Invalid input parameters');

      expect(() => {
        GeneratorSizingCalculator.calculate({ ...mockInputs, powerFactor: 1.5 });
      }).toThrow('Invalid input parameters');
    });
  });

  describe('StandbyGeneratorCalculator', () => {
    const mockInputs = {
      buildingType: 'commercial' as const,
      essentialLoads: [
        { description: 'Emergency lighting', power: 5, priority: 'critical' as const },
        { description: 'Fire alarm', power: 2, priority: 'critical' as const },
        { description: 'HVAC', power: 50, priority: 'essential' as const },
        { description: 'IT systems', power: 30, priority: 'essential' as const },
        { description: 'Security', power: 8, priority: 'essential' as const }
      ],
      transferTime: 15, // seconds
      fuelType: 'diesel' as const,
      autonomy: 24, // hours
      testingSchedule: 'weekly' as const,
      emergencyShutdownRequired: true
    };

    test('should calculate standby generator requirements', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(result.generatorRating).toBeGreaterThan(0);
      expect(result.engineRating).toBeGreaterThan(0);
      expect(result.criticalLoad).toBe(7); // 5 + 2
      expect(result.essentialLoad).toBe(88); // 50 + 30 + 8
    });

    test('should apply diversity factors', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(result.totalLoad).toBe(result.essentialLoad + result.criticalLoad);
      expect(result.generatorRating).toBeGreaterThanOrEqual(result.totalLoad * 0.8 * 1.25); // designLoad with safety margin
    });

    test('should calculate fuel requirements', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(result.fuelConsumption).toBeGreaterThan(0);
      expect(result.fuelTankCapacity).toBeGreaterThan(0);
      expect(result.autonomyAchieved).toBeGreaterThanOrEqual(24);
    });

    test('should specify transfer switch type', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(['automatic', 'manual']).toContain(result.transferSwitchType);
      expect(result.transferSwitchType).toBe('manual'); // For 15 second transfer time
    });

    test('should include installation requirements', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(result.installationRequirements.concreteBase).toBeDefined();
      expect(result.installationRequirements.weatherEnclosure).toBe(true);
      expect(result.installationRequirements.fuelSupply).toBeDefined();
      expect(result.installationRequirements.exhaustSystem).toBeDefined();
      expect(typeof result.installationRequirements.ventilation).toBe('boolean');
    });

    test('should include compliance requirements', () => {
      const result = StandbyGeneratorCalculator.calculate(mockInputs);
      
      expect(Array.isArray(result.complianceRequirements)).toBe(true);
      expect(result.complianceRequirements.some(req => req.includes('BS 7909'))).toBe(true);
    });

    test('should handle hospital applications', () => {
      const hospitalInputs = { ...mockInputs, buildingType: 'hospital' as const };
      const result = StandbyGeneratorCalculator.calculate(hospitalInputs);
      
      expect(result.complianceRequirements.some(req => req.includes('HTM'))).toBe(true);
      expect(result.recommendations.some(rec => rec.includes('redundant'))).toBe(true);
    });

    test('should validate essential loads', () => {
      expect(() => {
        StandbyGeneratorCalculator.calculate({ ...mockInputs, essentialLoads: [] });
      }).toThrow('At least one load must be specified');
    });
  });

  describe('FeedInTariffCalculator', () => {
    const mockInputs = {
      generationType: 'solar_pv' as const,
      installedCapacity: 4, // kW
      commissionDate: new Date('2023-01-01'),
      tariffScheme: 'SEG' as const,
      annualGeneration: 3500, // kWh
      exportPercentage: 50,
      consumptionOffset: 1750, // kWh
      tariffRate: 55, // £/MWh (5.5p/kWh)
      escalationRate: 2.5, // % per year
      contractPeriod: 20 // years
    };

    test('should calculate annual payments and exports', () => {
      const result = FeedInTariffCalculator.calculate(mockInputs);
      
      expect(result.annualGeneration).toBe(3500);
      expect(result.annualExport).toBe(1750); // 50% of generation
      expect(result.annualConsumption).toBe(1750);
      
      expect(result.payments.exportPayment).toBeCloseTo(96.25); // 1750 * 0.055
      expect(result.payments.totalAnnualPayment).toBeGreaterThan(0);
    });

    test('should calculate bill savings', () => {
      const result = FeedInTariffCalculator.calculate(mockInputs);
      
      expect(result.savings.electricityBillSaving).toBeCloseTo(525); // 1750 * 0.30
      expect(result.savings.totalAnnualBenefit).toBeGreaterThan(result.savings.electricityBillSaving);
    });

    test('should calculate lifecycle values', () => {
      const result = FeedInTariffCalculator.calculate(mockInputs);
      
      expect(result.lifecycle.totalIncome).toBeGreaterThan(0);
      expect(result.lifecycle.presentValue).toBeGreaterThan(0);
      expect(result.lifecycle.presentValue).toBeLessThan(result.lifecycle.totalIncome);
    });

    test('should handle FIT scheme', () => {
      const fitInputs = {
        ...mockInputs,
        tariffScheme: 'FIT' as const,
        commissionDate: new Date('2018-01-01') // Before FIT closure
      };
      const result = FeedInTariffCalculator.calculate(fitInputs);
      
      expect(result.payments.generationPayment).toBeGreaterThan(0);
      expect(result.contractTerms.tariffGuaranteed).toBe(true);
      expect(result.contractTerms.indexLinked).toBe(true);
    });

    test('should assess tax implications', () => {
      const result = FeedInTariffCalculator.calculate(mockInputs);
      
      expect(typeof result.taxImplications.incomeTaxLiable).toBe('boolean');
      expect(result.taxImplications.vatStatus).toBeDefined();
      expect(result.taxImplications.estimatedTax).toBeGreaterThanOrEqual(0);
    });

    test('should provide contract terms', () => {
      const result = FeedInTariffCalculator.calculate(mockInputs);
      
      expect(typeof result.contractTerms.tariffGuaranteed).toBe('boolean');
      expect(typeof result.contractTerms.indexLinked).toBe('boolean');
      expect(typeof result.contractTerms.transferable).toBe('boolean');
    });

    test('should handle different generation types', () => {
      const windInputs = { ...mockInputs, generationType: 'wind' as const };
      const result = FeedInTariffCalculator.calculate(windInputs);
      
      expect(result.payments.exportPayment).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should validate input parameters', () => {
      expect(() => {
        FeedInTariffCalculator.calculate({ ...mockInputs, installedCapacity: 0 });
      }).toThrow('Invalid input parameters');

      expect(() => {
        FeedInTariffCalculator.calculate({ ...mockInputs, contractPeriod: 0 });
      }).toThrow('Invalid input parameters');
    });
  });

  describe('CarbonFootprintCalculator', () => {
    const mockInputs = {
      energyConsumption: {
        electricity: 4000, // kWh/year
        gas: 12000, // kWh/year
        oil: 0,
        coal: 0,
        lpg: 0
      },
      renewableGeneration: {
        solar: 3500, // kWh/year
        wind: 0,
        other: 0
      },
      transport: {
        petrolVehicles: 10000, // km/year
        dieselVehicles: 5000, // km/year
        electricVehicles: 0,
        publicTransport: 2000 // km/year
      },
      location: 'UK' as const,
      calculationYear: 2023
    };

    test('should calculate total emissions', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.totalEmissions).toBeGreaterThan(0);
      expect(result.emissionsBySource.electricity).toBeGreaterThanOrEqual(0); // Could be negative with renewables
      expect(result.emissionsBySource.gas).toBeGreaterThan(0);
      expect(result.emissionsBySource.transport).toBeGreaterThan(0);
    });

    test('should account for renewable generation', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.reductions.renewableOffset).toBeGreaterThan(0);
      expect(result.netEmissions).toBeLessThanOrEqual(result.totalEmissions);
    });

    test('should calculate carbon intensity', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.carbonIntensity).toBeGreaterThan(0);
      expect(result.carbonIntensity).toBeLessThan(1); // Should be reasonable for UK
    });

    test('should provide benchmarking', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.benchmarking.ukAverage).toBe(2300);
      expect(result.benchmarking.bestPractice).toBe(1000);
      expect(result.benchmarking.percentileRanking).toBeGreaterThan(0);
      expect(result.benchmarking.percentileRanking).toBeLessThanOrEqual(100);
    });

    test('should calculate reduction targets', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.reductionTargets.netZero2050).toBe(100);
      expect(result.reductionTargets.paris2030).toBe(68);
      expect(result.reductionTargets.annualReductionRate).toBeGreaterThan(0);
    });

    test('should calculate cost of carbon', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(result.costOfCarbon.socialCostEstimate).toBeGreaterThan(0);
      expect(result.costOfCarbon.carbonTaxLiability).toBeGreaterThanOrEqual(0);
      expect(result.costOfCarbon.offsetCost).toBeGreaterThan(0);
    });

    test('should handle different locations', () => {
      const usInputs = { ...mockInputs, location: 'US' as const };
      const result = CarbonFootprintCalculator.calculate(usInputs);
      
      expect(result.benchmarking.ukAverage).toBe(4800); // US average
    });

    test('should account for grid decarbonization over time', () => {
      const futureInputs = { ...mockInputs, calculationYear: 2030 };
      const currentResult = CarbonFootprintCalculator.calculate(mockInputs);
      const futureResult = CarbonFootprintCalculator.calculate(futureInputs);
      
      // Electricity emissions should be lower in future due to grid decarbonization
      expect(futureResult.emissionsBySource.electricity).toBeLessThan(currentResult.emissionsBySource.electricity);
    });

    test('should provide relevant recommendations', () => {
      const result = CarbonFootprintCalculator.calculate(mockInputs);
      
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should recommend efficiency measures for high consumption
      const hasEfficiencyRec = result.recommendations.some(rec => 
        rec.includes('efficient') || rec.includes('LED') || rec.includes('insulation')
      );
      expect(hasEfficiencyRec).toBe(true);
    });

    test('should handle edge cases', () => {
      const zeroInputs = {
        ...mockInputs,
        energyConsumption: { electricity: 0, gas: 0, oil: 0, coal: 0, lpg: 0 },
        transport: { petrolVehicles: 0, dieselVehicles: 0, electricVehicles: 0, publicTransport: 0 }
      };
      
      const result = CarbonFootprintCalculator.calculate(zeroInputs);
      expect(result.totalEmissions).toBeGreaterThanOrEqual(0);
      expect(result.netEmissions).toBeGreaterThanOrEqual(0);
    });
  });
});
