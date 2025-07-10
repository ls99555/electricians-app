/**
 * Special Location and Critical Building Regulation Calculators Tests
 * Tests for the 🔥 critical features: Special Locations, Medical Locations, Educational Facilities, Care Homes
 */

import { 
  SpecialLocationCalculator,
  MedicalLocationCalculator,
  EducationalFacilityCalculator,
  CareHomeCalculator
} from '../building-regulations';

describe('SpecialLocationCalculator', () => {
  describe('Bathroom requirements', () => {
    test('should calculate bathroom zone requirements correctly', () => {
      const result = SpecialLocationCalculator.calculate({
        locationType: 'bathroom',
        roomDimensions: { length: 2.5, width: 2.0, height: 2.5 },
        equipmentPresent: ['shower', 'bath', 'basin'],
        voltageLevel: 230,
        earthingSystem: 'TN-C-S',
        waterPresent: true,
        metallicParts: true,
        publicAccess: false
      });

      expect(result.locationType).toBe('bathroom');
      expect(result.zones).toHaveLength(3); // Zones 0, 1, 2
      expect(result.zones[0].zone).toBe('Zone 0');
      expect(result.zones[0].voltageRestriction).toBe(12);
      expect(result.zones[0].ipRating).toBe('IPX7');
      expect(result.protectionMeasures.rcdRating).toBe(30);
      expect(result.compliance.bs7671Part).toBe('Section 701');
      expect(result.recommendations).toContain('All circuits in bathroom must have RCD protection ≤30mA');
    });
  });

  describe('Swimming pool requirements', () => {
    test('should calculate swimming pool zone requirements correctly', () => {
      const result = SpecialLocationCalculator.calculate({
        locationType: 'swimming_pool',
        roomDimensions: { length: 10, width: 5, height: 3 },
        equipmentPresent: ['pool', 'filtration', 'lighting'],
        voltageLevel: 230,
        earthingSystem: 'TN-C-S',
        waterPresent: true,
        metallicParts: true,
        publicAccess: true
      });

      expect(result.locationType).toBe('swimming_pool');
      expect(result.zones).toHaveLength(3); // Zones 0, 1, 2
      expect(result.zones[0].zone).toBe('Zone 0');
      expect(result.zones[0].voltageRestriction).toBe(12);
      expect(result.zones[0].ipRating).toBe('IPX8');
      expect(result.compliance.bs7671Part).toBe('Section 702');
    });
  });

  describe('Regulation compliance', () => {
    test('should ensure all calculations reference correct BS 7671 sections', () => {
      const bathroomResult = SpecialLocationCalculator.calculate({
        locationType: 'bathroom',
        equipmentPresent: [],
        voltageLevel: 230,
        earthingSystem: 'TN-C-S',
        waterPresent: true,
        metallicParts: false,
        publicAccess: false
      });

      expect(bathroomResult.regulation).toContain('BS 7671:2018+A2:2022');
      expect(bathroomResult.regulation).toContain('Parts 701-753');
    });
  });
});

describe('MedicalLocationCalculator', () => {
  describe('Group 1 medical locations', () => {
    test('should calculate Group 1 requirements correctly', () => {
      const result = MedicalLocationCalculator.calculate({
        group: '1',
        appliedPart: 'BF',
        lifeSupport: false,
        surgicalApplications: false,
        intracardiacProcedures: false,
        roomArea: 20,
        medicalEquipmentLoad: 5,
        emergencyDuration: 3,
        earthingSystem: 'TN-S'
      });

      expect(result.group).toBe('1');
      expect(result.groupDescription).toContain('not life threatening');
      expect(result.supplySystem.emergencySupply).toBe(false);
      expect(result.protectionMeasures.earthFaultCurrent).toBe(5); // mA max for Group 1
      expect(result.safetyRequirements.maximumTouchVoltage).toBe(25);
      expect(result.compliance.bs7671Section710).toBe(true);
    });
  });

  describe('Group 2 medical locations', () => {
    test('should calculate Group 2 requirements correctly', () => {
      const result = MedicalLocationCalculator.calculate({
        group: '2',
        appliedPart: 'CF',
        lifeSupport: true,
        surgicalApplications: true,
        intracardiacProcedures: false,
        roomArea: 30,
        medicalEquipmentLoad: 15,
        emergencyDuration: 24,
        earthingSystem: 'IT'
      });

      expect(result.group).toBe('2');
      expect(result.groupDescription).toContain('endanger life');
      expect(result.supplySystem.emergencySupply).toBe(true);
      expect(result.supplySystem.medicicalITSystem).toBe(true);
      expect(result.protectionMeasures.earthFaultCurrent).toBe(0.5); // mA max for Group 2
      expect(result.safetyRequirements.maximumTouchVoltage).toBe(10);
      expect(result.monitoring.isolationMonitoring).toBe(true);
      expect(result.recommendations).toContain('Medical IT system mandatory for Group 2 locations');
    });
  });

  describe('Safety requirements', () => {
    test('should include appropriate testing requirements', () => {
      const result = MedicalLocationCalculator.calculate({
        group: '2',
        appliedPart: 'CF',
        lifeSupport: true,
        surgicalApplications: true,
        intracardiacProcedures: true,
        roomArea: 25,
        medicalEquipmentLoad: 10,
        emergencyDuration: 24,
        earthingSystem: 'IT'
      });

      expect(result.testingRequirements.initialTesting).toContain('Insulation resistance ≥5MΩ (Group 2)');
      expect(result.testingRequirements.periodicTesting).toContain('Daily visual inspection');
      expect(result.testingRequirements.specialTests).toContain('IT system insulation monitoring');
    });
  });
});

describe('EducationalFacilityCalculator', () => {
  describe('Primary school calculations', () => {
    test('should calculate primary school electrical requirements correctly', () => {
      const result = EducationalFacilityCalculator.calculate({
        facilityType: 'primary_school',
        floorArea: 1500,
        pupilNumbers: 300,
        staffNumbers: 30,
        ictSuites: 2,
        scienceLabs: 0,
        workshops: 0,
        sportsFacilities: true,
        catering: true,
        residentialAccommodation: false,
        specialNeeds: false
      });

      expect(result.facilityType).toBe('primary_school');
      expect(result.loadAnalysis.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.loadAnalysis.maximumDemand).toBeLessThan(result.loadAnalysis.totalConnectedLoad);
      expect(result.circuitDesign.lightingCircuits[0].illuminance).toBe(500); // 500 lux for primary school
      expect(result.safetyConsiderations.tamperResistant).toBe(true);
      expect(result.accessibilityCompliance.socketHeight.min).toBe(450);
      expect(result.compliance.buildingBulletin).toBe('BB99');
    });
  });

  describe('Secondary school calculations', () => {
    test('should calculate secondary school electrical requirements correctly', () => {
      const result = EducationalFacilityCalculator.calculate({
        facilityType: 'secondary_school',
        floorArea: 3000,
        pupilNumbers: 800,
        staffNumbers: 80,
        ictSuites: 5,
        scienceLabs: 8,
        workshops: 3,
        sportsFacilities: true,
        catering: true,
        residentialAccommodation: false,
        specialNeeds: true
      });

      expect(result.facilityType).toBe('secondary_school');
      expect(result.loadAnalysis.ictEquipment).toBe(75); // 5 * 15kW
      expect(result.circuitDesign.lightingCircuits[0].illuminance).toBe(500);
      expect(result.circuitDesign.powerCircuits[1].area).toBe('ICT suites');
      expect(result.circuitDesign.powerCircuits[1].socketOutlets).toBe(160); // 5 * 32
      expect(result.safetyConsiderations.accessibleSockets).toBe(450); // Special needs
      expect(result.compliance.buildingBulletin).toBe('BB98');
    });
  });

  describe('Energy efficiency requirements', () => {
    test('should include appropriate energy efficiency measures', () => {
      const result = EducationalFacilityCalculator.calculate({
        facilityType: 'college',
        floorArea: 5000,
        pupilNumbers: 1200,
        staffNumbers: 120,
        ictSuites: 10,
        scienceLabs: 15,
        workshops: 5,
        sportsFacilities: true,
        catering: true,
        residentialAccommodation: true,
        specialNeeds: false
      });

      expect(result.energyEfficiency.led).toBe(true);
      expect(result.energyEfficiency.occupancyDetection).toBe(true);
      expect(result.energyEfficiency.efficacy).toBe(120); // lm/W minimum
      expect(result.emergencyProvision.duration).toBe(3); // hours
    });
  });
});

describe('CareHomeCalculator', () => {
  describe('Residential care calculations', () => {
    test('should calculate residential care electrical requirements correctly', () => {
      const result = CareHomeCalculator.calculate({
        careLevel: 'residential',
        residents: 40,
        rooms: 45,
        floorArea: 2000,
        kitchenFacilities: true,
        laundryFacilities: true,
        medicalEquipment: false,
        liftSystems: 1,
        emergencyGenerator: false,
        dementiaSpecific: false
      });

      expect(result.careLevel).toBe('residential');
      expect(result.capacityAnalysis.residents).toBe(40);
      expect(result.capacityAnalysis.staff).toBe(7); // residents/6 rounded up
      expect(result.loadCalculation.totalConnectedLoad).toBeGreaterThan(0);
      expect(result.circuitRequirements.bedroomCircuits[0].nurseCall).toBe(false); // Not for residential
      expect(result.safetyFeatures.wanderManagement).toBe(false);
      expect(result.accessibilityFeatures.socketHeight).toBe(600); // Wheelchair accessible
    });
  });

  describe('Nursing care calculations', () => {
    test('should calculate nursing care electrical requirements correctly', () => {
      const result = CareHomeCalculator.calculate({
        careLevel: 'nursing',
        residents: 60,
        rooms: 65,
        floorArea: 3000,
        kitchenFacilities: true,
        laundryFacilities: true,
        medicalEquipment: true,
        liftSystems: 2,
        emergencyGenerator: true,
        dementiaSpecific: false
      });

      expect(result.careLevel).toBe('nursing');
      expect(result.loadCalculation.medicalEquipment).toBe(12); // 60 * 200W / 1000
      expect(result.circuitRequirements.bedroomCircuits[0].nurseCall).toBe(true); // For nursing
      expect(result.emergencyProvision.nurseCallSystem).toBe(true);
      expect(result.emergencyProvision.emergencyGenerator).toBe(true);
      expect(result.specialConsiderations.antimicrobialFinish).toBe(true);
    });
  });

  describe('Dementia care calculations', () => {
    test('should calculate dementia care electrical requirements correctly', () => {
      const result = CareHomeCalculator.calculate({
        careLevel: 'dementia',
        residents: 30,
        rooms: 35,
        floorArea: 1800,
        kitchenFacilities: true,
        laundryFacilities: false,
        medicalEquipment: true,
        liftSystems: 1,
        emergencyGenerator: false,
        dementiaSpecific: true
      });

      expect(result.careLevel).toBe('dementia');
      expect(result.safetyFeatures.wanderManagement).toBe(true);
      expect(result.safetyFeatures.autoLocking).toBe(true);
      expect(result.specialConsiderations.dementiaFriendly).toBe(true);
      expect(result.specialConsiderations.behavioralTriggers).toContain('Avoid flashing lights');
      expect(result.recommendations).toContain('Dementia-friendly lighting design with circadian rhythm support');
    });
  });

  describe('Mental health care calculations', () => {
    test('should calculate mental health care electrical requirements correctly', () => {
      const result = CareHomeCalculator.calculate({
        careLevel: 'mental_health',
        residents: 20,
        rooms: 25,
        floorArea: 1200,
        kitchenFacilities: false,
        laundryFacilities: false,
        medicalEquipment: false,
        liftSystems: 0,
        emergencyGenerator: false,
        dementiaSpecific: false
      });

      expect(result.careLevel).toBe('mental_health');
      expect(result.safetyFeatures.autoLocking).toBe(true);
      expect(result.specialConsiderations.ligatureResistant).toBe(true);
      expect(result.specialConsiderations.tamperProof).toBe(true);
    });
  });

  describe('Compliance requirements', () => {
    test('should ensure all care home calculations meet compliance standards', () => {
      const result = CareHomeCalculator.calculate({
        careLevel: 'nursing',
        residents: 50,
        rooms: 55,
        floorArea: 2500,
        kitchenFacilities: true,
        laundryFacilities: true,
        medicalEquipment: true,
        liftSystems: 2,
        emergencyGenerator: true,
        dementiaSpecific: false
      });

      expect(result.compliance.careQualityCommission).toBe(true);
      expect(result.compliance.buildingRegulations).toBe(true);
      expect(result.compliance.equalityAct).toBe(true);
      expect(result.inspection.initialTesting).toContain('Electrical Installation Certificate (EIC)');
      expect(result.inspection.periodicTesting).toContain('EICR every 5 years (or as recommended)');
    });
  });
});

describe('Critical Building Regulation Calculators Compliance', () => {
  test('should ensure all new calculators reference correct UK regulations', () => {
    const specialLocationResult = SpecialLocationCalculator.calculate({
      locationType: 'bathroom',
      equipmentPresent: [],
      voltageLevel: 230,
      earthingSystem: 'TN-C-S',
      waterPresent: true,
      metallicParts: false,
      publicAccess: false
    });

    const medicalResult = MedicalLocationCalculator.calculate({
      group: '1',
      appliedPart: 'BF',
      lifeSupport: false,
      surgicalApplications: false,
      intracardiacProcedures: false,
      roomArea: 20,
      medicalEquipmentLoad: 5,
      emergencyDuration: 3,
      earthingSystem: 'TN-S'
    });

    const educationResult = EducationalFacilityCalculator.calculate({
      facilityType: 'primary_school',
      floorArea: 1000,
      pupilNumbers: 200,
      staffNumbers: 20,
      ictSuites: 1,
      scienceLabs: 0,
      workshops: 0,
      sportsFacilities: false,
      catering: false,
      residentialAccommodation: false,
      specialNeeds: false
    });

    const careHomeResult = CareHomeCalculator.calculate({
      careLevel: 'residential',
      residents: 30,
      rooms: 35,
      floorArea: 1500,
      kitchenFacilities: true,
      laundryFacilities: false,
      medicalEquipment: false,
      liftSystems: 1,
      emergencyGenerator: false,
      dementiaSpecific: false
    });

    // Verify all calculators reference correct UK regulations
    expect(specialLocationResult.regulation).toContain('BS 7671:2018+A2:2022');
    expect(medicalResult.regulation).toContain('BS 7671:2018+A2:2022 Section 710');
    expect(educationResult.regulation).toContain('BS 7671:2018+A2:2022');
    expect(careHomeResult.regulation).toContain('BS 7671:2018+A2:2022');

    // Verify safety recommendations are included
    expect(specialLocationResult.recommendations.length).toBeGreaterThan(0);
    expect(medicalResult.recommendations.length).toBeGreaterThan(0);
    expect(educationResult.recommendations.length).toBeGreaterThan(0);
    expect(careHomeResult.recommendations.length).toBeGreaterThan(0);
  });
});
