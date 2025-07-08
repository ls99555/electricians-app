/**
 * Building Regulations & Standards Calculations Tests
 * Tests for Part P compliance, energy performance, and building regulation calculations
 * Ensures compliance with UK Building Regulations and BS 7671
 */

import { 
  PartPComplianceCalculator, 
  BuildingRegulationCalculator, 
  EnergyPerformanceCalculator 
} from '../building-regulations';

describe('PartPComplianceCalculator', () => {
  describe('Part P notification requirements', () => {
    test('should require notification for consumer unit replacement', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'consumer_unit',
        location: 'general',
        circuitProtection: 32,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: true,
        newCircuitInstallation: false
      });

      expect(result.notificationRequired).toBe(true);
      expect(result.regulation).toContain('Building Regulations Part P');
      expect(result.recommendations).toContain('Consumer unit work requires RCD protection for all circuits per Amendment 3');
    });

    test('should require notification for bathroom work', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'new_circuit',
        location: 'bathroom',
        circuitProtection: 20,
        installerQualification: 'competent_person',
        specialLocationWork: true,
        consumerUnitReplacement: false,
        newCircuitInstallation: true
      });

      expect(result.notificationRequired).toBe(true);
      expect(result.recommendations).toContain('Bathroom work must comply with BS 7671 Section 701 requirements');
    });

    test('should require notification for new kitchen circuits', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'new_circuit',
        location: 'kitchen',
        circuitProtection: 32,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: false,
        newCircuitInstallation: true
      });

      expect(result.notificationRequired).toBe(true);
      expect(result.recommendations).toContain('Kitchen installations require dedicated cooker circuit');
    });

    test('should require notification for outdoor circuits', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'new_circuit',
        location: 'garden',
        circuitProtection: 20,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: false,
        newCircuitInstallation: true
      });

      expect(result.notificationRequired).toBe(true);
    });

    test('should require notification for circuits > 32A', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'new_circuit',
        location: 'general',
        circuitProtection: 40,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: false,
        newCircuitInstallation: true
      });

      expect(result.notificationRequired).toBe(true);
    });

    test('should not require notification for minor works by competent person', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'replacement',
        location: 'general',
        circuitProtection: 20,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: false,
        newCircuitInstallation: false
      });

      expect(result.notificationRequired).toBe(false);
      expect(result.competentPersonEligible).toBe(true);
    });

    test('should handle swimming pool installations correctly', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'special_location',
        location: 'swimming_pool',
        circuitProtection: 16,
        installerQualification: 'competent_person',
        specialLocationWork: true,
        consumerUnitReplacement: false,
        newCircuitInstallation: true
      });

      expect(result.notificationRequired).toBe(true);
      expect(result.competentPersonEligible).toBe(false); // Swimming pools require Building Control
    });
  });

  describe('Cost calculations', () => {
    test('should calculate appropriate costs for competent person work', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'replacement',
        location: 'general',
        circuitProtection: 20,
        installerQualification: 'competent_person',
        specialLocationWork: false,
        consumerUnitReplacement: false,
        newCircuitInstallation: false
      });

      expect(result.complianceCost.min).toBe(0);
      expect(result.complianceCost.max).toBe(50);
      expect(result.complianceCost.description).toBe('Self-certification only');
    });

    test('should calculate higher costs for Building Control notification', () => {
      const result = PartPComplianceCalculator.calculate({
        workType: 'consumer_unit',
        location: 'general',
        circuitProtection: 32,
        installerQualification: 'unqualified',
        specialLocationWork: false,
        consumerUnitReplacement: true,
        newCircuitInstallation: false
      });

      expect(result.complianceCost.min).toBeGreaterThan(100);
      expect(result.complianceCost.description).toBe('Building Control application and inspection');
    });
  });

  describe('Input validation', () => {
    test('should throw error for invalid circuit protection rating', () => {
      expect(() => {
        PartPComplianceCalculator.calculate({
          workType: 'new_circuit',
          location: 'general',
          circuitProtection: -5,
          installerQualification: 'competent_person',
          specialLocationWork: false,
          consumerUnitReplacement: false,
          newCircuitInstallation: true
        });
      }).toThrow('Circuit protection rating must be between 0 and 125A');
    });

    test('should throw error for circuit protection rating > 125A', () => {
      expect(() => {
        PartPComplianceCalculator.calculate({
          workType: 'new_circuit',
          location: 'general',
          circuitProtection: 150,
          installerQualification: 'competent_person',
          specialLocationWork: false,
          consumerUnitReplacement: false,
          newCircuitInstallation: true
        });
      }).toThrow('Circuit protection rating must be between 0 and 125A');
    });
  });
});

describe('BuildingRegulationCalculator', () => {
  describe('Domestic load calculations', () => {
    test('should calculate domestic loads correctly with BS 7671 diversity', () => {
      const result = BuildingRegulationCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        numberOfBedrooms: 3,
        occupancyType: 'family',
        heatingType: 'gas',
        hotWaterType: 'gas',
        cookingType: 'electric',
        evChargingRequired: false,
        solarPVInstallation: false,
        futureProofing: false
      });

      expect(result.buildingType).toBe('domestic');
      expect(result.floorArea).toBe(100);
      expect(result.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.maximumDemand).toBeLessThan(result.totalConnectedLoad); // Diversity applied
      expect(result.loadBreakdown.cooking).toBe(10000); // 10kW electric cooker
      expect(result.regulation).toContain('BS 7671 Section 311');
    });

    test('should include EV charging load when required', () => {
      const result = BuildingRegulationCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 120,
        numberOfBedrooms: 4,
        occupancyType: 'family',
        heatingType: 'heat_pump',
        hotWaterType: 'heat_pump',
        cookingType: 'electric',
        evChargingRequired: true,
        solarPVInstallation: false,
        futureProofing: false
      });

      expect(result.loadBreakdown.evCharging).toBe(7400); // 7.4kW domestic EV charger
      expect(result.recommendations).toContain('Install dedicated EV charging circuit with Type B RCD (BS EN 61851)');
    });

    test('should apply correct diversity factors for electric heating', () => {
      const electricResult = BuildingRegulationCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        numberOfBedrooms: 3,
        occupancyType: 'family',
        heatingType: 'electric',
        hotWaterType: 'electric',
        cookingType: 'electric',
        evChargingRequired: false,
        solarPVInstallation: false,
        futureProofing: false
      });

      const gasResult = BuildingRegulationCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        numberOfBedrooms: 3,
        occupancyType: 'family',
        heatingType: 'gas',
        hotWaterType: 'gas',
        cookingType: 'electric',
        evChargingRequired: false,
        solarPVInstallation: false,
        futureProofing: false
      });

      // Electric heating should have higher electrical demand
      expect(electricResult.maximumDemand).toBeGreaterThan(gasResult.maximumDemand);
    });

    test('should calculate appropriate minimum circuits', () => {
      const result = BuildingRegulationCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 150,
        numberOfBedrooms: 4,
        occupancyType: 'family',
        heatingType: 'electric',
        hotWaterType: 'electric',
        cookingType: 'electric',
        evChargingRequired: true,
        solarPVInstallation: false,
        futureProofing: false
      });

      expect(result.minimumCircuits).toBeGreaterThanOrEqual(10); // Modern minimum
      expect(result.minimumCircuits).toBeGreaterThan(10); // Should include EV circuit + larger home
      expect(result.recommendations).toContain('Install minimum 10-way consumer unit for domestic installations');
    });
  });

  describe('Commercial load calculations', () => {
    test('should calculate commercial loads with appropriate diversity', () => {
      const result = BuildingRegulationCalculator.calculate({
        buildingType: 'commercial',
        floorArea: 500,
        occupancyType: 'office',
        heatingType: 'heat_pump',
        hotWaterType: 'electric',
        cookingType: 'electric',
        evChargingRequired: true,
        solarPVInstallation: true,
        futureProofing: true
      });

      expect(result.buildingType).toBe('commercial');
      expect(result.loadBreakdown.evCharging).toBe(22000); // 22kW commercial charger
      expect(result.serviceCapacity).toBeGreaterThan(result.maximumDemand); // Future proofing
      expect(result.recommendations).toContain('Ensure G98/G99 compliance for grid connection');
    });
  });

  describe('Input validation', () => {
    test('should throw error for negative floor area', () => {
      expect(() => {
        BuildingRegulationCalculator.calculate({
          buildingType: 'domestic',
          floorArea: -50,
          numberOfBedrooms: 3,
          occupancyType: 'family',
          heatingType: 'gas',
          hotWaterType: 'gas',
          cookingType: 'electric',
          evChargingRequired: false,
          solarPVInstallation: false,
          futureProofing: false
        });
      }).toThrow('Floor area must be positive');
    });

    test('should throw error for negative number of bedrooms', () => {
      expect(() => {
        BuildingRegulationCalculator.calculate({
          buildingType: 'domestic',
          floorArea: 100,
          numberOfBedrooms: -1,
          occupancyType: 'family',
          heatingType: 'gas',
          hotWaterType: 'gas',
          cookingType: 'electric',
          evChargingRequired: false,
          solarPVInstallation: false,
          futureProofing: false
        });
      }).toThrow('Number of bedrooms cannot be negative');
    });
  });
});

describe('EnergyPerformanceCalculator', () => {
  describe('Energy rating calculations', () => {
    test('should calculate energy performance with correct UK carbon factors', () => {
      const result = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 15000, // kWh/year
        renewableGeneration: 3000, // kWh/year solar
        heatingSystem: 'gas',
        insulationLevel: 'enhanced',
        lightingType: 'led',
        applianceEfficiency: 'high_efficiency'
      });

      expect(result.energyUseIntensity).toBe(150); // 15000/100
      expect(result.netEnergyConsumption).toBe(12000); // 15000-3000
      expect(result.renewableContribution).toBe(20); // 3000/15000 * 100
      expect(result.carbonEmissions).toBeGreaterThan(0);
      expect(result.regulation).toContain('Building Regulations Part L');
    });

    test('should calculate carbon emissions correctly for different heating systems', () => {
      const gasResult = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 20000,
        renewableGeneration: 0,
        heatingSystem: 'gas',
        insulationLevel: 'basic',
        lightingType: 'mixed',
        applianceEfficiency: 'standard'
      });

      const electricResult = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 15000, // Lower due to heat pump efficiency
        renewableGeneration: 0,
        heatingSystem: 'heat_pump',
        insulationLevel: 'basic',
        lightingType: 'mixed',
        applianceEfficiency: 'standard'
      });

      // Heat pump should have lower emissions despite all-electric
      expect(electricResult.carbonEmissions).toBeLessThan(gasResult.carbonEmissions);
    });

    test('should include biomass heating in carbon calculations', () => {
      const result = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 150,
        annualEnergyConsumption: 18000,
        renewableGeneration: 0,
        heatingSystem: 'biomass',
        insulationLevel: 'enhanced',
        lightingType: 'led',
        applianceEfficiency: 'high_efficiency'
      });

      expect(result.carbonEmissions).toBeGreaterThan(0);
      expect(result.carbonEmissions).toBeLessThan(18000 * 0.193); // Should be less than all-electric
    });

    test('should calculate cost savings and payback periods', () => {
      const result = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 120,
        annualEnergyConsumption: 25000, // High consumption
        renewableGeneration: 0,
        heatingSystem: 'electric',
        insulationLevel: 'basic',
        lightingType: 'fluorescent',
        applianceEfficiency: 'standard'
      });

      expect(result.costSavings.annualSavings).toBeGreaterThan(0);
      expect(result.costSavings.investmentRequired).toBeGreaterThan(0);
      expect(result.costSavings.paybackYears).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Install LED lighting throughout building');
    });
  });

  describe('Energy rating system', () => {
    test('should assign correct energy ratings for domestic buildings', () => {
      const efficientResult = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 4000, // Very efficient - 40 kWh/m²/year
        renewableGeneration: 1000,
        heatingSystem: 'heat_pump',
        insulationLevel: 'high_performance',
        lightingType: 'led',
        applianceEfficiency: 'high_efficiency'
      });

      const inefficientResult = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 20000, // Inefficient - 200 kWh/m²/year
        renewableGeneration: 0,
        heatingSystem: 'electric',
        insulationLevel: 'basic',
        lightingType: 'fluorescent',
        applianceEfficiency: 'standard'
      });

      expect(['A', 'B']).toContain(efficientResult.energyRating);
      expect(['E', 'F', 'G']).toContain(inefficientResult.energyRating);
    });
  });

  describe('Input validation', () => {
    test('should throw error for negative energy consumption', () => {
      expect(() => {
        EnergyPerformanceCalculator.calculate({
          buildingType: 'domestic',
          floorArea: 100,
          annualEnergyConsumption: -1000,
          renewableGeneration: 0,
          heatingSystem: 'gas',
          insulationLevel: 'basic',
          lightingType: 'led',
          applianceEfficiency: 'standard'
        });
      }).toThrow('Energy consumption cannot be negative');
    });

    test('should throw error for negative renewable generation', () => {
      expect(() => {
        EnergyPerformanceCalculator.calculate({
          buildingType: 'domestic',
          floorArea: 100,
          annualEnergyConsumption: 15000,
          renewableGeneration: -500,
          heatingSystem: 'gas',
          insulationLevel: 'basic',
          lightingType: 'led',
          applianceEfficiency: 'standard'
        });
      }).toThrow('Renewable generation cannot be negative');
    });
  });

  describe('Renewable energy integration', () => {
    test('should handle high renewable generation correctly', () => {
      const result = EnergyPerformanceCalculator.calculate({
        buildingType: 'domestic',
        floorArea: 100,
        annualEnergyConsumption: 12000,
        renewableGeneration: 15000, // More generation than consumption
        heatingSystem: 'heat_pump',
        insulationLevel: 'high_performance',
        lightingType: 'led',
        applianceEfficiency: 'high_efficiency'
      });

      expect(result.netEnergyConsumption).toBe(0); // Should be capped at 0
      expect(result.renewableContribution).toBeGreaterThan(100);
      expect(result.carbonEmissions).toBeLessThan(100); // Very low emissions
    });
  });
});

describe('Building regulations compliance verification', () => {
  test('should ensure all calculators reference correct UK regulations', () => {
    const partPResult = PartPComplianceCalculator.calculate({
      workType: 'new_circuit',
      location: 'general',
      circuitProtection: 20,
      installerQualification: 'competent_person',
      specialLocationWork: false,
      consumerUnitReplacement: false,
      newCircuitInstallation: true
    });

    const buildingRegResult = BuildingRegulationCalculator.calculate({
      buildingType: 'domestic',
      floorArea: 100,
      numberOfBedrooms: 3,
      occupancyType: 'family',
      heatingType: 'gas',
      hotWaterType: 'gas',
      cookingType: 'electric',
      evChargingRequired: false,
      solarPVInstallation: false,
      futureProofing: false
    });

    const energyResult = EnergyPerformanceCalculator.calculate({
      buildingType: 'domestic',
      floorArea: 100,
      annualEnergyConsumption: 15000,
      renewableGeneration: 0,
      heatingSystem: 'gas',
      insulationLevel: 'basic',
      lightingType: 'led',
      applianceEfficiency: 'standard'
    });

    // Verify regulation references
    expect(partPResult.regulation).toContain('Building Regulations Part P');
    expect(partPResult.regulation).toContain('BS 7671');
    expect(buildingRegResult.regulation).toContain('BS 7671 Section 311');
    expect(energyResult.regulation).toContain('Building Regulations Part L');

    // Verify safety recommendations are included
    expect(partPResult.recommendations.some(r => r.includes('BS 7671'))).toBe(true);
    expect(buildingRegResult.recommendations.some(r => r.includes('RCD protection'))).toBe(true);
    expect(energyResult.recommendations.some(r => r.includes('LED lighting'))).toBe(true);
  });
});
