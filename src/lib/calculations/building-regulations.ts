/**
 * Building Regulations & Standards Calculations
 * Part P compliance, energy performance, and building regulation calculations
 * 
 * Based on:
 * - Building Regulations Part P (England & Wales) - Electrical Safety
 * - Building Regulations Part L - Conservation of fuel and power
 * - BS 7671:2018+A2:2022 (18th Edition) - Requirements for Electrical Installations
 * - Energy Performance of Buildings Regulations 2012
 * - Building (Scotland) Act 1959 (Section 4.5 - Electrical installations)
 * - Building Regulations (Northern Ireland) 2012 (Part P equivalent)
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Building Control notification may be required - check with local authority
 * - Calculations must be verified by qualified electrical engineers
 * - Professional indemnity insurance recommended for all electrical work
 * - Regulations change frequently - always check current versions
 * 
 * NOTE: Building Regulations apply differently across UK jurisdictions:
 * - England & Wales: Building Regulations 2010 Part P
 * - Scotland: Building (Scotland) Act 1959 Section 4.5
 * - Northern Ireland: Building Regulations (NI) 2012
 */

import type {
  PartPComplianceResult,
  BuildingRegulationResult,
  EnergyPerformanceResult,
  SpecialLocationResult,
  MedicalLocationResult,
  EducationalFacilityResult,
  CareHomeResult
} from '../types/building-regulations';

/**
 * Part P Compliance Calculator
 * Determines if electrical work requires Building Control notification
 * Based on Building Regulations Part P (England & Wales)
 */
export class PartPComplianceCalculator {
  static calculate(inputs: {
    workType: 'new_circuit' | 'extension' | 'replacement' | 'maintenance' | 'consumer_unit' | 'special_location';
    location: 'general' | 'bathroom' | 'kitchen' | 'garden' | 'swimming_pool' | 'sauna' | 'solar_pv';
    circuitProtection: number; // Circuit protection rating (A)
    installerQualification: 'competent_person' | 'qualified_supervisor' | 'unqualified';
    specialLocationWork: boolean; // Work in special locations (BS 7671 Parts 7xx)
    consumerUnitReplacement: boolean; // Full consumer unit replacement
    newCircuitInstallation: boolean; // New circuit installation
  }): PartPComplianceResult {
    const {
      workType,
      location,
      circuitProtection,
      installerQualification,
      specialLocationWork,
      consumerUnitReplacement,
      newCircuitInstallation
    } = inputs;

    try {
      this.validatePartPInputs(inputs);

      // Determine if Building Control notification required
      const notificationRequired = this.assessNotificationRequirement(
        workType,
        location,
        circuitProtection,
        specialLocationWork,
        consumerUnitReplacement,
        newCircuitInstallation
      );

      // Determine certification requirements
      const certificationRequired = this.assessCertificationRequirement(
        workType,
        installerQualification,
        notificationRequired
      );

      // Determine competent person scheme eligibility
      const competentPersonEligible = installerQualification === 'competent_person' && 
                                     this.isCompetentPersonWork(workType, location);

      // Generate compliance pathway recommendations
      const compliancePathway = this.determineCompliancePathway(
        installerQualification,
        notificationRequired,
        competentPersonEligible
      );

      const recommendations = [
        'Ensure all electrical work complies with BS 7671:2018+A2:2022 (18th Edition)',
        'Obtain appropriate certification upon completion (EIC/EICR/MEWC)',
        'Keep records of all electrical work for future reference',
        'Consider additional RCD protection beyond minimum requirements',
        'Ensure all circuits have appropriate surge protection (SPD) where required'
      ];

      if (notificationRequired && !competentPersonEligible) {
        recommendations.push('Building Control notification required before work commences');
        recommendations.push('Building Control inspection may be required during installation');
      }

      if (specialLocationWork) {
        recommendations.push('Special location work requires additional safety measures per BS 7671 Parts 701-753');
        recommendations.push('Consider additional IP rating requirements for special locations');
      }

      if (workType === 'consumer_unit') {
        recommendations.push('Consumer unit work requires RCD protection for all circuits per Amendment 3');
        recommendations.push('Consider Type B RCD for installations with inverters or EV charging');
      }

      if (location === 'bathroom') {
        recommendations.push('Bathroom work must comply with BS 7671 Section 701 requirements');
        recommendations.push('Ensure correct IP ratings and zone requirements are met');
      }

      if (location === 'kitchen') {
        recommendations.push('Kitchen installations require dedicated cooker circuit');
        recommendations.push('Consider additional socket provision for modern appliances');
      }

      // Determine work category
      let workCategory: 'notifiable' | 'non_notifiable' | 'minor_works' = 'minor_works';
      if (notificationRequired) {
        workCategory = 'notifiable';
      } else if (workType === 'maintenance' || workType === 'replacement') {
        workCategory = 'minor_works';
      } else {
        workCategory = 'non_notifiable';
      }

      // Determine special location requirements
      const specialLocationRequirements: string[] = [];
      const safetyRequirements: string[] = [];
      const testingRequired: string[] = [];

      if (specialLocationWork) {
        specialLocationRequirements.push('Comply with BS 7671 Parts 701-753 special location requirements');
        specialLocationRequirements.push('Additional IP rating requirements may apply');
        safetyRequirements.push('Enhanced protection measures required');
        testingRequired.push('Special location verification testing');
      }

      if (location === 'bathroom') {
        specialLocationRequirements.push('BS 7671 Section 701 - Locations containing a bath or shower');
        safetyRequirements.push('RCD protection ≤30mA mandatory');
        safetyRequirements.push('Supplementary equipotential bonding required');
        testingRequired.push('Zone verification and IP rating testing');
      }

      if (location === 'swimming_pool') {
        specialLocationRequirements.push('BS 7671 Section 702 - Swimming pools and fountains');
        safetyRequirements.push('SELV systems required in zones 0 and 1');
        testingRequired.push('Pool-specific safety testing protocols');
      }

      // Standard safety requirements
      safetyRequirements.push('RCD protection for socket outlets ≤32A');
      safetyRequirements.push('Circuit protection appropriate to conductor');
      safetyRequirements.push('Safe isolation procedures during installation');

      // Standard testing requirements
      testingRequired.push('Continuity of protective conductors');
      testingRequired.push('Insulation resistance testing');
      testingRequired.push('RCD operation testing');
      testingRequired.push('Initial verification and certification');

      // Calculate compliance costs
      const complianceCost = this.calculateComplianceCost(notificationRequired, competentPersonEligible);

      return {
        notificationRequired,
        workCategory,
        complianceRoute: competentPersonEligible ? 'competent_person' : 'building_control',
        competentPersonEligible,
        buildingControlApproval: notificationRequired && !competentPersonEligible,
        specialLocationRequirements,
        safetyRequirements,
        testingRequired,
        certificationRequired,
        complianceCost,
        compliancePathway: [
          {
            step: 'Initial Design',
            description: 'Electrical design and planning',
            responsibility: 'Qualified electrician',
            cost: complianceCost?.min || 0
          },
          {
            step: 'Installation',
            description: 'Electrical installation work',
            responsibility: competentPersonEligible ? 'Competent person' : 'Qualified electrician'
          },
          {
            step: 'Testing & Certification',
            description: 'Electrical testing and certification',
            responsibility: 'Qualified electrician'
          }
        ],
        compliance: {
          partP: true,
          bs7671: true,
          buildingRegs: notificationRequired
        },
        timeframes: {
          notification: notificationRequired ? 'Before work starts' : 'Not required',
          completion: 'Within 30 days of completion',
          certification: 'Upon completion'
        },
        isCompliant: true,
        recommendations,
        regulation: 'Building Regulations Part P, BS 7671:2018+A2:2022 Section 134'
      };
    } catch (error) {
      throw new Error(`Part P compliance calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validatePartPInputs(inputs: {
    circuitProtection: number;
  }): void {
    const { circuitProtection } = inputs;

    if (circuitProtection <= 0 || circuitProtection > 125) {
      throw new Error('Circuit protection rating must be between 0 and 125A');
    }
  }

  private static assessNotificationRequirement(
    workType: string,
    location: string,
    circuitProtection: number,
    specialLocationWork: boolean,
    consumerUnitReplacement: boolean,
    newCircuitInstallation: boolean
  ): boolean {
    // Part P Schedule 4 - Work that is notifiable (Building Regulations 2010)
    
    // 1. Installation of consumer unit (always notifiable)
    if (consumerUnitReplacement) return true;
    
    // 2. Work in special locations (BS 7671 Parts 701-753)
    if (specialLocationWork) return true;
    if (location === 'bathroom' || location === 'swimming_pool' || location === 'sauna') return true;
    
    // 3. New circuits in dwellings
    if (newCircuitInstallation) {
      // All new circuits in kitchens are notifiable
      if (location === 'kitchen') return true;
      
      // All new circuits outdoors are notifiable
      if (location === 'garden') return true;
      
      // New circuits with protection > 32A are notifiable
      if (circuitProtection > 32) return true;
    }
    
    // 4. Solar PV installations > 4kW are notifiable (unless by competent person)
    if (location === 'solar_pv') return true;

    return false;
  }

  private static assessCertificationRequirement(
    workType: string,
    installerQualification: string,
    notificationRequired: boolean
  ): string[] {
    if (installerQualification === 'competent_person') {
      return ['Electrical Installation Certificate (EIC) or Minor Electrical Works Certificate (MEWC)'];
    }
    
    if (notificationRequired) {
      return ['Building Control Completion Certificate', 'EIC/MEWC'];
    }

    return ['Minor Electrical Works Certificate (MEWC) minimum'];
  }

  private static isCompetentPersonWork(workType: string, location: string): boolean {
    // Work that cannot be self-certified by competent person schemes
    // per Building Regulations Part P Schedule 4
    
    // Swimming pools and saunas require Building Control notification
    if (location === 'swimming_pool' || location === 'sauna') return false;
    
    // Some schemes may not cover all special locations
    // Most bathroom work can be covered by competent person schemes
    // but depends on specific scheme scope
    
    return true;
  }

  private static calculateComplianceCost(
    notificationRequired: boolean,
    competentPersonEligible: boolean
  ): { min: number; max: number; description: string } {
    if (competentPersonEligible && !notificationRequired) {
      return { min: 0, max: 50, description: 'Self-certification only' };
    }

    if (notificationRequired && competentPersonEligible) {
      return { min: 100, max: 300, description: 'Competent person scheme notification' };
    }

    if (notificationRequired && !competentPersonEligible) {
      return { min: 200, max: 500, description: 'Building Control application and inspection' };
    }

    return { min: 0, max: 100, description: 'Certificate only' };
  }

  private static determineCompliancePathway(
    installerQualification: string,
    notificationRequired: boolean,
    competentPersonEligible: boolean
  ): string[] {
    const pathway: string[] = [];

    if (installerQualification === 'competent_person' && competentPersonEligible) {
      pathway.push('Use competent person scheme member');
      if (notificationRequired) {
        pathway.push('Scheme provider notifies Building Control');
      }
      pathway.push('Receive Building Compliance Certificate');
    } else if (notificationRequired) {
      pathway.push('Submit Building Control application');
      pathway.push('Pay Building Control fees');
      pathway.push('Arrange Building Control inspections');
      pathway.push('Receive Building Control Completion Certificate');
    } else {
      pathway.push('Engage qualified electrician');
      pathway.push('Obtain appropriate electrical certificate');
    }

    return pathway;
  }
}

/**
 * Building Regulation Load Assessment Calculator
 * Calculate electrical loads for building regulation compliance
 */
export class BuildingRegulationCalculator {
  static calculate(inputs: {
    buildingType: 'domestic' | 'commercial' | 'industrial' | 'mixed_use';
    floorArea: number; // Total floor area (m²)
    numberOfBedrooms?: number; // For domestic only
    occupancyType: string;
    heatingType: 'electric' | 'gas' | 'oil' | 'heat_pump' | 'mixed';
    hotWaterType: 'electric' | 'gas' | 'solar' | 'heat_pump';
    cookingType: 'electric' | 'gas' | 'mixed';
    evChargingRequired: boolean;
    solarPVInstallation: boolean;
    futureProofing: boolean; // Additional capacity for future needs
  }): BuildingRegulationResult {
    const {
      buildingType,
      floorArea,
      numberOfBedrooms,
      heatingType,
      hotWaterType,
      cookingType,
      evChargingRequired,
      solarPVInstallation,
      futureProofing
    } = inputs;

    try {
      this.validateBuildingRegInputs(inputs);

      // Calculate base electrical load
      const baseLoad = this.calculateBaseLoad(buildingType, floorArea, numberOfBedrooms);

      // Calculate heating load
      const heatingLoad = this.calculateHeatingLoad(heatingType, floorArea, buildingType);

      // Calculate hot water load
      const hotWaterLoad = this.calculateHotWaterLoad(hotWaterType, buildingType, numberOfBedrooms);

      // Calculate cooking load
      const cookingLoad = this.calculateCookingLoad(cookingType, buildingType);

      // Calculate EV charging load
      const evLoad = evChargingRequired ? this.calculateEVLoad(buildingType) : 0;

      // Calculate total connected load
      const totalConnectedLoad = baseLoad + heatingLoad + hotWaterLoad + cookingLoad + evLoad;

      // Apply diversity factors
      const maximumDemand = this.calculateMaximumDemand(
        totalConnectedLoad,
        buildingType,
        heatingType
      );

      // Calculate service capacity requirement
      const serviceCapacity = futureProofing ? maximumDemand * 1.25 : maximumDemand;

      // Determine minimum circuits required
      const minimumCircuits = this.calculateMinimumCircuits(
        buildingType,
        floorArea,
        numberOfBedrooms,
        evChargingRequired
      );

      const recommendations = [
        'Install RCD protection for all socket outlet circuits (BS 7671 Regulation 411.3.3)',
        'Provide surge protection device at main distribution board (BS 7671 Regulation 443.4)',
        'Ensure adequate earthing and bonding arrangements (BS 7671 Chapter 54)',
        'Consider future electrical loads when sizing service capacity',
        'Install minimum 10-way consumer unit for domestic installations'
      ];

      if (evChargingRequired) {
        recommendations.push('Install dedicated EV charging circuit with Type B RCD (BS EN 61851)');
        recommendations.push('Consider load balancing system for multiple EV charge points');
      }

      if (solarPVInstallation) {
        recommendations.push('Install isolation switches for solar PV system (BS 7671 Section 712)');
        recommendations.push('Ensure G98/G99 compliance for grid connection');
      }

      if (futureProofing) {
        recommendations.push('Consider additional spare ways in distribution board');
        recommendations.push('Install larger service cable to accommodate future loads');
      }

      if (buildingType === 'domestic') {
        recommendations.push('Ensure minimum socket provision: 2 per bedroom plus general areas');
        recommendations.push('Install dedicated circuits for high-load appliances');
      }

      // Calculate diversity factor
      const diversityFactor = totalConnectedLoad > 0 ? maximumDemand / totalConnectedLoad : 0;

      return {
        buildingType,
        floorArea,
        applicationRequired: totalConnectedLoad > 100000, // >100kW installations typically require application
        regulationType: totalConnectedLoad > 100000 ? 'full_application' : 'building_notice',
        estimatedCost: Math.round(serviceCapacity * 50), // Rough estimate £50 per kW
        timeframe: totalConnectedLoad > 100000 ? '6-8 weeks' : '4-6 weeks',
        serviceCapacity: Math.round(serviceCapacity),
        loadBreakdown: {
          base: Math.round(baseLoad),
          baseLoad: Math.round(baseLoad),
          cooking: Math.round(cookingLoad),
          evCharging: Math.round(evLoad),
          heating: Math.round(heatingLoad),
          hotWater: Math.round(hotWaterLoad)
        },
        minimumCircuits: minimumCircuits,
        totalConnectedLoad: Math.round(totalConnectedLoad),
        maximumDemand: Math.round(maximumDemand),
        diversityFactors: {
          cooking: 0.8,
          heating: 0.9,
          hotWater: 0.7,
          lighting: 0.75,
          socketOutlets: 0.6
        },
        totalDemand: Math.round(maximumDemand),
        loadAssessment: {
          totalConnectedLoad: Math.round(totalConnectedLoad),
          maximumDemand: Math.round(maximumDemand),
          diversityApplied: Math.round((maximumDemand / totalConnectedLoad) * 100),
          supplyRequired: Math.round(serviceCapacity)
        },
        circuitRequirements: {
          minimumCircuits,
          lightingCircuits: Math.ceil(floorArea / 100), // 1 circuit per 100m²
          socketCircuits: Math.ceil(minimumCircuits * 0.6), // 60% of circuits for sockets
          dedicatedCircuits: evChargingRequired ? ['EV charging circuit', 'Cooker circuit'] : ['Cooker circuit'],
          protectionDevices: ['RCD protection ≤30mA', 'Type B MCBs', 'Surge protection device']
        },
        safetyRequirements: {
          rcdProtection: true,
          afddRequired: false, // Optional but recommended
          surgeProtection: true,
          earthingSystem: 'TN-C-S (typical UK supply)',
          mainEarthTerminal: true,
          equipotentialBonding: true,
          bondingRequired: ['Main equipotential bonding', 'Supplementary bonding where required']
        },
        specialLocationCompliance: {
          applicableLocations: buildingType === 'domestic' ? ['Bathroom zones', 'Kitchen areas'] : [],
          additionalRequirements: ['IP rating compliance', 'Zone-appropriate equipment'],
          ipRatings: ['IPX4 minimum for bathroom zones'],
          testingFrequency: 'Initial verification and periodic inspection'
        },
        energyEfficiency: {
          minimumEfficacy: 120, // lm/W for LED lighting
          controls: ['Manual switching', 'Automatic controls where beneficial'],
          zoning: buildingType !== 'domestic',
          daylight: true
        },
        certification: {
          electricalCertificate: 'Electrical Installation Certificate (EIC)',
          buildingControlCompletion: buildingType === 'commercial',
          warrantyRequired: true
        },
        compliance: {
          partP: true,
          partL: true,
          bs7671: true,
          accessibilityRegs: buildingType === 'commercial'
        },
        protectionRequirements: ['RCD protection', 'Earthing system', 'Surge protection'],
        isCompliant: true,
        recommendations,
        regulation: 'BS 7671 Section 311'
      };
    } catch (error) {
      throw new Error(`Building regulation calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateBuildingRegInputs(inputs: {
    floorArea: number;
    numberOfBedrooms?: number;
  }): void {
    const { floorArea, numberOfBedrooms } = inputs;

    if (floorArea <= 0) throw new Error('Floor area must be positive');
    if (numberOfBedrooms !== undefined && numberOfBedrooms < 0) {
      throw new Error('Number of bedrooms cannot be negative');
    }
  }

  private static calculateBaseLoad(buildingType: string, floorArea: number, numberOfBedrooms?: number): number {
    // Base load calculation per BS 7671 and UK building standards
    // Includes lighting and general socket outlets
    let baseLoadPerM2: number;

    switch (buildingType) {
      case 'domestic':
        // BS 7671 Appendix A - domestic lighting and socket outlets
        baseLoadPerM2 = 20; // Conservative 20W/m² for domestic lighting + basic sockets
        break;
      case 'commercial':
        baseLoadPerM2 = 35; // 35W/m² for commercial (office spaces)
        break;
      case 'industrial':
        baseLoadPerM2 = 50; // 50W/m² for industrial (varies greatly by use)
        break;
      default:
        baseLoadPerM2 = 30; // Mixed use
    }

    let baseLoad = floorArea * baseLoadPerM2;

    // Additional domestic socket provision per BS 7671
    if (buildingType === 'domestic' && numberOfBedrooms) {
      // Minimum socket provision: 2 x 13A sockets per bedroom
      // Plus general living area provision
      baseLoad += numberOfBedrooms * 1000; // 1kW per bedroom for additional sockets
      baseLoad += 2000; // Additional general provision for living areas
    }

    return baseLoad;
  }

  private static calculateHeatingLoad(heatingType: string, floorArea: number, buildingType: string): number {
    if (heatingType === 'gas' || heatingType === 'oil') return 0;

    let heatingLoadPerM2: number;
    
    switch (heatingType) {
      case 'electric':
        heatingLoadPerM2 = buildingType === 'domestic' ? 80 : 100;
        break;
      case 'heat_pump':
        heatingLoadPerM2 = buildingType === 'domestic' ? 40 : 60;
        break;
      case 'mixed':
        heatingLoadPerM2 = buildingType === 'domestic' ? 40 : 50;
        break;
      default:
        heatingLoadPerM2 = 0;
    }

    return floorArea * heatingLoadPerM2;
  }

  private static calculateHotWaterLoad(hotWaterType: string, buildingType: string, numberOfBedrooms?: number): number {
    if (hotWaterType === 'gas') return 0;

    let hotWaterLoad: number;

    switch (hotWaterType) {
      case 'electric':
        hotWaterLoad = buildingType === 'domestic' ? 3000 : 6000;
        if (numberOfBedrooms && numberOfBedrooms > 3) {
          hotWaterLoad += (numberOfBedrooms - 3) * 1000;
        }
        break;
      case 'heat_pump':
        hotWaterLoad = buildingType === 'domestic' ? 2000 : 4000;
        break;
      case 'solar':
        hotWaterLoad = 1000; // Backup heating
        break;
      default:
        hotWaterLoad = 0;
    }

    return hotWaterLoad;
  }

  private static calculateCookingLoad(cookingType: string, buildingType: string): number {
    if (cookingType === 'gas') return 0;

    switch (cookingType) {
      case 'electric':
        return buildingType === 'domestic' ? 10000 : 15000;
      case 'mixed':
        return buildingType === 'domestic' ? 5000 : 7500;
      default:
        return 0;
    }
  }

  private static calculateEVLoad(buildingType: string): number {
    return buildingType === 'domestic' ? 7400 : 22000; // 7.4kW domestic, 22kW commercial
  }

  private static calculateMaximumDemand(
    totalConnectedLoad: number,
    buildingType: string,
    heatingType: string
  ): number {
    // Apply diversity factors per BS 7671 Appendix A
    let diversityFactor: number;

    if (buildingType === 'domestic') {
      // BS 7671 Appendix A Table A1 - domestic diversity factors
      if (heatingType === 'electric') {
        // Electric heating systems typically have higher diversity
        diversityFactor = 0.75; // 75% diversity for electric heating
      } else {
        // Gas heating systems - lower electrical diversity
        diversityFactor = 0.65; // 65% diversity for gas heating
      }
    } else if (buildingType === 'commercial') {
      // Commercial buildings typically have higher diversity
      diversityFactor = 0.80; // 80% diversity for commercial
    } else {
      // Industrial and mixed use
      diversityFactor = 0.70; // 70% diversity for industrial/mixed
    }

    return totalConnectedLoad * diversityFactor;
  }

  private static calculateMinimumCircuits(
    buildingType: string,
    floorArea: number,
    numberOfBedrooms?: number,
    evChargingRequired?: boolean
  ): number {
    if (buildingType !== 'domestic') {
      // Non-domestic: minimum based on load and area
      return Math.max(8, Math.ceil(floorArea / 100) + 3); // Minimum 8 circuits
    }

    // Domestic minimum circuits per BS 7671 requirements
    // Minimum provision for modern domestic installations
    let circuits = 10; // Base circuits:
    // - Lighting downstairs
    // - Lighting upstairs  
    // - Sockets downstairs ring
    // - Sockets upstairs ring
    // - Cooker circuit
    // - Immersion heater
    // - Shower circuit
    // - Spare circuit
    // - Utility/garage sockets
    // - Utility/garage lighting

    if (numberOfBedrooms && numberOfBedrooms > 3) {
      // Additional socket circuits for larger homes
      circuits += Math.ceil((numberOfBedrooms - 3) / 2);
    }

    if (floorArea > 120) {
      // Additional circuits for larger homes (BS 7671 considers loading)
      circuits += Math.ceil((floorArea - 120) / 60);
    }

    if (evChargingRequired) {
      circuits += 1; // Dedicated EV circuit (mandatory for new builds)
    }

    return circuits;
  }
}

/**
 * Energy Performance Calculator
 * Calculate energy performance metrics for building regulations
 */
export class EnergyPerformanceCalculator {
  static calculate(inputs: {
    buildingType: 'domestic' | 'commercial';
    floorArea: number;
    annualEnergyConsumption: number; // kWh/year
    renewableGeneration: number; // kWh/year from renewables
    heatingSystem: 'gas' | 'electric' | 'heat_pump' | 'biomass';
    insulationLevel: 'basic' | 'enhanced' | 'high_performance';
    lightingType: 'led' | 'fluorescent' | 'mixed';
    applianceEfficiency: 'standard' | 'high_efficiency';
  }): EnergyPerformanceResult {
    const {
      buildingType,
      floorArea,
      annualEnergyConsumption,
      renewableGeneration,
      heatingSystem,
      insulationLevel,
      lightingType,
      applianceEfficiency
    } = inputs;

    try {
      this.validateEnergyInputs(inputs);

      // Calculate energy use intensity
      const energyUseIntensity = annualEnergyConsumption / floorArea; // kWh/m²/year

      // Calculate net energy consumption
      const netEnergyConsumption = Math.max(0, annualEnergyConsumption - renewableGeneration);

      // Calculate carbon emissions
      const carbonEmissions = this.calculateCarbonEmissions(
        annualEnergyConsumption,
        renewableGeneration,
        heatingSystem
      );

      // Calculate energy rating
      const energyRating = this.calculateEnergyRating(
        energyUseIntensity,
        buildingType,
        insulationLevel,
        lightingType,
        applianceEfficiency
      );

      // Calculate cost savings potential
      const costSavings = this.calculateCostSavings(
        annualEnergyConsumption,
        energyRating.currentRating,
        energyRating.potentialRating
      );

      const recommendations = [
        'Install LED lighting throughout building',
        'Upgrade to high-efficiency appliances',
        'Improve building insulation where possible'
      ];

      if (renewableGeneration === 0) {
        recommendations.push('Consider solar PV installation to reduce grid electricity consumption');
      }

      if (energyRating.currentRating < 'B') {
        recommendations.push('Building energy performance below recommended levels');
      }

      return {
        currentRating: energyRating.currentRating as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
        energyRating: energyRating.currentRating,
        energyUseIndex: Math.round(energyUseIntensity),
        energyUseIntensity: Math.round(energyUseIntensity),
        netEnergyConsumption: Math.round(Math.max(0, annualEnergyConsumption - renewableGeneration)),
        renewableContribution: Math.round((renewableGeneration / annualEnergyConsumption) * 100),
        carbonEmissions: Math.round(carbonEmissions),
        costSavings,
        improvementMeasures: [
          {
            measure: 'LED lighting upgrade',
            rating: 'B',
            energySaving: Math.round(energyUseIntensity * 0.15),
            carbonSaving: Math.round(carbonEmissions * 0.15),
            cost: Math.round(floorArea * 50),
            payback: 3
          }
        ],
        recommendations: [
          'Install LED lighting throughout building',
          'Upgrade to high-efficiency appliances',
          'Improve building insulation where possible',
          ...(renewableGeneration === 0 ? ['Consider solar PV installation to reduce grid electricity consumption'] : []),
          ...(energyRating.currentRating < 'B' ? ['Building energy performance below recommended levels'] : [])
        ],
        complianceIssues: carbonEmissions > 25 ? ['Actual emissions exceed target rate'] : [],
        isCompliant: carbonEmissions <= 25,
        regulation: 'Building Regulations Part L, Energy Performance of Buildings'
      };
    } catch (error) {
      throw new Error(`Energy performance calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateEnergyInputs(inputs: {
    floorArea: number;
    annualEnergyConsumption: number;
    renewableGeneration: number;
  }): void {
    const { floorArea, annualEnergyConsumption, renewableGeneration } = inputs;

    if (floorArea <= 0) throw new Error('Floor area must be positive');
    if (annualEnergyConsumption < 0) throw new Error('Energy consumption cannot be negative');
    if (renewableGeneration < 0) throw new Error('Renewable generation cannot be negative');
  }

  private static calculateCarbonEmissions(
    annualConsumption: number,
    renewableGeneration: number,
    heatingSystem: string
  ): number {
    // UK Government emission factors 2024 (BEIS/DESNZ)
    const gridCarbonFactor = 0.193; // kg CO2e/kWh for UK grid electricity (2024)
    const gasCarbonFactor = 0.182; // kg CO2e/kWh for natural gas (2024)
    const biomassCarbon = 0.025; // kg CO2e/kWh for biomass (sustainable)

    let electricityConsumption = annualConsumption;
    let gasConsumption = 0;
    let biomassConsumption = 0;

    // Split energy consumption by heating system
    switch (heatingSystem) {
      case 'gas':
        // Typical UK home: heating ~70%, hot water ~15%, electricity ~15%
        gasConsumption = annualConsumption * 0.7;
        electricityConsumption = annualConsumption * 0.3;
        break;
      case 'heat_pump':
        // Heat pump systems - all electrical
        electricityConsumption = annualConsumption;
        break;
      case 'biomass':
        // Biomass heating with electrical backup
        biomassConsumption = annualConsumption * 0.7;
        electricityConsumption = annualConsumption * 0.3;
        break;
      case 'electric':
        // All electric
        electricityConsumption = annualConsumption;
        break;
    }

    const netElectricityConsumption = Math.max(0, electricityConsumption - renewableGeneration);
    
    return (netElectricityConsumption * gridCarbonFactor) + 
           (gasConsumption * gasCarbonFactor) + 
           (biomassConsumption * biomassCarbon);
  }

  private static calculateEnergyRating(
    energyUseIntensity: number,
    buildingType: string,
    insulationLevel: string,
    lightingType: string,
    applianceEfficiency: string
  ): { currentRating: string; potentialRating: string } {
    // Get current rating based on energy use intensity
    const currentRating = this.getRatingFromEUI(energyUseIntensity, buildingType);

    // Calculate potential improvements
    let potentialImprovement = 0;
    if (insulationLevel === 'basic') potentialImprovement += 20;
    else if (insulationLevel === 'enhanced') potentialImprovement += 10;

    if (lightingType !== 'led') potentialImprovement += 10;
    if (applianceEfficiency !== 'high_efficiency') potentialImprovement += 15;

    const potentialEUI = energyUseIntensity * (1 - potentialImprovement / 100);
    const potentialRating = this.getRatingFromEUI(potentialEUI, buildingType);

    return { currentRating, potentialRating };
  }

  private static getRatingFromEUI(energyUseIntensity: number, buildingType: string): string {
    // Base rating from energy use intensity
    if (buildingType === 'domestic') {
      if (energyUseIntensity < 50) return 'A';
      else if (energyUseIntensity < 75) return 'B';
      else if (energyUseIntensity < 100) return 'C';
      else if (energyUseIntensity < 125) return 'D';
      else if (energyUseIntensity < 150) return 'E';
      else if (energyUseIntensity < 175) return 'F';
      else return 'G';
    } else {
      if (energyUseIntensity < 100) return 'A';
      else if (energyUseIntensity < 150) return 'B';
      else if (energyUseIntensity < 200) return 'C';
      else if (energyUseIntensity < 250) return 'D';
      else if (energyUseIntensity < 300) return 'E';
      else if (energyUseIntensity < 350) return 'F';
      else return 'G';
    }
  }

  private static calculateCostSavings(
    annualConsumption: number,
    currentRating: string,
    potentialRating: string
  ): { annualSavings: number; investmentRequired: number; paybackYears: number } {
    const energyCostPerKWh = 0.28; // £0.28 per kWh average UK rate
    
    const ratingValues: { [key: string]: number } = {
      'A': 0.9, 'B': 0.8, 'C': 0.7, 'D': 0.6, 'E': 0.5, 'F': 0.4, 'G': 0.3
    };

    const currentEfficiency = ratingValues[currentRating] || 0.5;
    const potentialEfficiency = ratingValues[potentialRating] || 0.9;

    const currentCost = annualConsumption * energyCostPerKWh;
    const potentialCost = (annualConsumption * currentEfficiency / potentialEfficiency) * energyCostPerKWh;
    
    const annualSavings = Math.max(0, currentCost - potentialCost);
    const investmentRequired = annualSavings * 8; // Rough estimate: 8x annual savings
    const paybackYears = investmentRequired > 0 ? investmentRequired / annualSavings : 0;

    return {
      annualSavings: Math.round(annualSavings),
      investmentRequired: Math.round(investmentRequired),
      paybackYears: Math.round(paybackYears * 10) / 10
    };
  }
}

/**
 * Special Location Requirements Calculator
 * Calculates requirements for special locations per BS 7671 Parts 701-753
 * Based on BS 7671:2018+A2:2022 Special Installations or Locations
 */
export class SpecialLocationCalculator {
  static calculate(inputs: {
    locationType: 'bathroom' | 'swimming_pool' | 'sauna' | 'medical' | 'agricultural' | 'construction' | 'caravan' | 'marina' | 'exhibition' | 'solar_pv' | 'temporary';
    roomDimensions?: { length: number; width: number; height: number }; // m
    equipmentPresent: string[];
    voltageLevel: number; // V
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
    waterPresent: boolean;
    metallicParts: boolean;
    publicAccess: boolean;
  }): SpecialLocationResult {
    const {
      locationType,
      roomDimensions,
      equipmentPresent,
      voltageLevel,
      earthingSystem,
      waterPresent,
      metallicParts,
      publicAccess
    } = inputs;

    let zones: Array<{ zone: string; description: string; ipRating: string; voltageRestriction: number; protectionMeasures: string[]; bonding: boolean; additionalProtection: string[] }> = [];
    let equipmentRequirements: any = {};
    let protectionMeasures: any = {};
    let testingRequirements: any = {};
    let compliance: any = {};
    let recommendations: string[] = [];

    // BS 7671 Part 701 - Locations containing a bath or shower
    if (locationType === 'bathroom') {
      zones = [
        {
          zone: 'Zone 0',
          description: 'Interior of bath tub or shower basin',
          ipRating: 'IPX7',
          voltageRestriction: 12,
          protectionMeasures: ['SELV only', 'Safety extra-low voltage from safety source'],
          bonding: true,
          additionalProtection: ['Residual current device ≤30mA']
        },
        {
          zone: 'Zone 1', 
          description: 'Above bath/shower to 2.25m height',
          ipRating: 'IPX4',
          voltageRestriction: 25,
          protectionMeasures: ['SELV or equipment suitable for Zone 1'],
          bonding: true,
          additionalProtection: ['RCD ≤30mA required']
        },
        {
          zone: 'Zone 2',
          description: '0.6m beyond Zone 1 boundary to 2.25m height',
          ipRating: 'IPX4',
          voltageRestriction: 230,
          protectionMeasures: ['Class II equipment or SELV'],
          bonding: true,
          additionalProtection: ['RCD ≤30mA protection']
        }
      ];

      equipmentRequirements = {
        ipRating: 'IPX4 minimum',
        voltageClass: 'Class_II',
        maxVoltage: 230,
        isolationRequired: true,
        localSwitching: false
      };

      protectionMeasures = {
        rcdRating: 30,
        rcdType: 'AC',
        additionalProtection: true,
        earthingArrangements: ['Supplementary equipotential bonding'],
        bondingConductors: [
          { type: 'Main bonding', minSize: 6, material: 'copper' },
          { type: 'Supplementary bonding', minSize: 4, material: 'copper' }
        ]
      };

      compliance = {
        bs7671Part: 'Section 701',
        additionalStandards: ['BS EN 60335-2-21', 'BS EN 61140'],
        localRegulations: ['Building Regulations Part P']
      };

      recommendations = [
        'All circuits in bathroom must have RCD protection ≤30mA',
        'Supplementary equipotential bonding required for all extraneous conductive parts',
        'Switch and control equipment should be outside zones or SELV operated',
        'Regular RCD testing essential in bathroom installations',
        'Consider RCBO protection for individual bathroom circuits'
      ];
    }

    // BS 7671 Part 702 - Swimming pools and fountains
    if (locationType === 'swimming_pool') {
      zones = [
        {
          zone: 'Zone 0',
          description: 'Interior of pool basin',
          ipRating: 'IPX8',
          voltageRestriction: 12,
          protectionMeasures: ['SELV ≤12V AC or ≤30V DC'],
          bonding: true,
          additionalProtection: ['Safety isolating transformer', 'RCD ≤30mA']
        },
        {
          zone: 'Zone 1',
          description: '2m from pool edge, 2.5m height',
          ipRating: 'IPX5',
          voltageRestriction: 25,
          protectionMeasures: ['SELV ≤25V AC or ≤60V DC'],
          bonding: true,
          additionalProtection: ['Safety isolating transformer', 'RCD ≤30mA']
        },
        {
          zone: 'Zone 2',
          description: '1.5m from Zone 1 boundary',
          ipRating: 'IPX4',
          voltageRestriction: 230,
          protectionMeasures: ['RCD protection', 'Suitable for wet conditions'],
          bonding: true,
          additionalProtection: ['RCD ≤30mA mandatory']
        }
      ];

      compliance = {
        bs7671Part: 'Section 702',
        additionalStandards: ['BS EN 60598-2-18', 'BS EN 61140'],
        localRegulations: ['Building Regulations', 'Pool safety regulations']
      };
    }

    // Medical locations covered separately in MedicalLocationCalculator

    testingRequirements = {
      initialTesting: [
        'Continuity of protective conductors',
        'Continuity of ring final circuit conductors', 
        'Insulation resistance',
        'Protection by SELV, PELV or electrical separation',
        'RCD operation'
      ],
      periodicTesting: [
        'RCD quarterly testing',
        'Annual electrical installation testing',
        'PAT testing of portable equipment'
      ],
      frequency: locationType === 'bathroom' ? 'Annual inspection recommended' : 'As per BS 7671 Table 3A',
      specialTests: [
        'Supplementary bonding verification',
        'IP rating verification',
        'SELV circuit testing'
      ]
    };

    return {
      locationType,
      zones,
      equipmentRequirements,
      protectionMeasures,
      testingRequirements,
      compliance,
      recommendations,
      regulation: 'Based on BS 7671:2018+A2:2022 Parts 701-753 - Special installations or locations'
    };
  }
}

/**
 * Medical Location Calculator
 * Calculations for medical electrical installations per BS 7671 Section 710
 * Based on BS 7671:2018+A2:2022 Section 710 and HTM guidance
 */
export class MedicalLocationCalculator {
  static calculate(inputs: {
    group: '0' | '1' | '2';
    appliedPart: 'none' | 'BF' | 'CF';
    lifeSupport: boolean;
    surgicalApplications: boolean;
    intracardiacProcedures: boolean;
    roomArea: number; // m²
    medicalEquipmentLoad: number; // kW
    emergencyDuration: number; // hours
    earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  }): MedicalLocationResult {
    const {
      group,
      appliedPart,
      lifeSupport,
      surgicalApplications,
      intracardiacProcedures,
      roomArea,
      medicalEquipmentLoad,
      emergencyDuration,
      earthingSystem
    } = inputs;

    let groupDescription = '';
    let supplySystem: any = {};
    let protectionMeasures: any = {};
    let monitoring: any = {};
    let safetyRequirements: any = {};
    let recommendations: string[] = [];

    // Medical location group classifications per BS 7671 Section 710
    switch (group) {
      case '0':
        groupDescription = 'Not intended for medical procedures';
        break;
      case '1':
        groupDescription = 'Medical procedures with applied parts - discontinuation not life threatening';
        break;
      case '2':
        groupDescription = 'Medical procedures where discontinuation could endanger life';
        break;
    }

    // Group 1 medical locations
    if (group === '1') {
      supplySystem = {
        normalSupply: 'TN-S or TN-C-S preferred',
        emergencySupply: false,
        supplyTime: 0,
        changeover: 'manual',
        isolationTransformer: false,
        medicicalITSystem: false
      };

      protectionMeasures = {
        equipotentialBonding: true,
        additionalEquipotential: true,
        functionalEarthing: false,
        earthFaultCurrent: 5, // mA max for Group 1
        touchVoltage: 25, // V max
        earthingResistance: 0.2 // Ω max
      };

      monitoring = {
        isolationMonitoring: false,
        earthFaultAlarm: false,
        temperatureMonitoring: false,
        emergencyLighting: true,
        batteryBackup: 3
      };

      safetyRequirements = {
        maximumEarthFaultCurrent: 5,
        maximumTouchVoltage: 25,
        minimumInsulationResistance: 1,
        residualCurrentDevices: true
      };

      recommendations = [
        'RCD protection required for all socket outlets ≤20A',
        'Supplementary equipotential bonding essential',
        'Regular testing of RCD operation required',
        'Consider individual circuit protection with RCBOs',
        'Ensure adequate earthing of all metallic parts'
      ];
    }

    // Group 2 medical locations  
    if (group === '2') {
      supplySystem = {
        normalSupply: 'Medical IT system required',
        emergencySupply: true,
        supplyTime: 0.5, // 0.5 seconds maximum changeover
        changeover: 'automatic',
        isolationTransformer: true,
        medicicalITSystem: true
      };

      protectionMeasures = {
        equipotentialBonding: true,
        additionalEquipotential: true,
        functionalEarthing: true,
        earthFaultCurrent: 0.5, // mA max for Group 2
        touchVoltage: 10, // V max  
        earthingResistance: 0.1 // Ω max
      };

      monitoring = {
        isolationMonitoring: true,
        earthFaultAlarm: true,
        temperatureMonitoring: true,
        emergencyLighting: true,
        batteryBackup: emergencyDuration || 24
      };

      safetyRequirements = {
        maximumEarthFaultCurrent: 0.5,
        maximumTouchVoltage: 10,
        minimumInsulationResistance: 5,
        residualCurrentDevices: false // Not used with IT systems
      };

      recommendations = [
        'Medical IT system mandatory for Group 2 locations',
        'Isolation monitoring device with visual and audible alarms required',
        'Emergency supply with automatic changeover essential',
        'Functional earthing required for medical equipment',
        'Enhanced equipotential bonding with resistance ≤0.1Ω',
        'Regular insulation monitoring and testing essential',
        'Backup generator with automatic start recommended'
      ];
    }

    const testingRequirements = {
      initialTesting: [
        'Insulation resistance ≥5MΩ (Group 2)',
        'Equipotential bonding resistance ≤0.1Ω',
        'Touch voltage measurement',
        'Earth fault current verification',
        'Isolation monitoring device testing'
      ],
      periodicTesting: [
        'Daily visual inspection',
        'Weekly equipotential bonding test',  
        'Monthly insulation resistance test',
        'Annual comprehensive testing'
      ],
      frequency: 'As per HTM 06-01 and local trust policies',
      specialTests: [
        'Medical equipment leakage current testing',
        'IT system insulation monitoring',
        'Emergency supply changeover testing',
        'Alarm system functional testing'
      ],
      documentation: [
        'Medical electrical installation certificate',
        'Maintenance schedules and records',
        'User training records',
        'Emergency procedures documentation'
      ]
    };

    const compliance = {
      bs7671Section710: true,
      htmGuidance: true,
      medicalDeviceDirective: true,
      localHealthAuthority: true
    };

    return {
      group,
      groupDescription,
      classification: {
        appliedPart,
        lifeSupport,
        surgicalApplications,
        intracardiacProcedures
      },
      supplySystem,
      protectionMeasures,
      monitoring,
      testingRequirements,
      safetyRequirements,
      compliance,
      recommendations,
      regulation: 'Based on BS 7671:2018+A2:2022 Section 710 and HTM 06-01 Medical electrical installations'
    };
  }
}

/**
 * Educational Facility Calculator
 * Electrical calculations for schools and educational facilities
 * Based on Building Bulletin 90/91/98/99/100/101/102/103/104 and DfE guidance
 */
export class EducationalFacilityCalculator {
  static calculate(inputs: {
    facilityType: 'primary_school' | 'secondary_school' | 'college' | 'university' | 'nursery' | 'special_needs';
    floorArea: number; // m²
    pupilNumbers: number;
    staffNumbers: number;
    ictSuites: number;
    scienceLabs: number;
    workshops: number;
    sportsFacilities: boolean;
    catering: boolean;
    residentialAccommodation: boolean;
    specialNeeds: boolean;
  }): EducationalFacilityResult {
    const {
      facilityType,
      floorArea,
      pupilNumbers,
      staffNumbers,
      ictSuites,
      scienceLabs,
      workshops,
      sportsFacilities,
      catering,
      residentialAccommodation,
      specialNeeds
    } = inputs;

    // Load analysis per DfE Building Bulletin guidance
    const baseLoadDensity = {
      'primary_school': 25, // W/m²
      'secondary_school': 35, // W/m²
      'college': 40, // W/m²
      'university': 45, // W/m²
      'nursery': 20, // W/m²
      'special_needs': 30 // W/m²
    };

    const baseLoad = floorArea * baseLoadDensity[facilityType];
    const ictLoad = ictSuites * 15000; // 15kW per ICT suite
    const labLoad = scienceLabs * 10000; // 10kW per science lab
    const workshopLoad = workshops * 20000; // 20kW per workshop
    const sportsLoad = sportsFacilities ? floorArea * 0.1 * 50 : 0; // 50W/m² for sports areas
    const cateringLoad = catering ? pupilNumbers * 150 : 0; // 150W per pupil for catering
    const emergencyLoad = floorArea * 2; // 2W/m² for emergency systems

    const totalConnectedLoad = (baseLoad + ictLoad + labLoad + workshopLoad + sportsLoad + cateringLoad + emergencyLoad) / 1000;
    const maximumDemand = totalConnectedLoad * 0.8; // 80% diversity factor

    const loadAnalysis = {
      totalConnectedLoad: Math.round(totalConnectedLoad),
      maximumDemand: Math.round(maximumDemand),
      teachingAreas: Math.round(baseLoad / 1000),
      administration: Math.round(floorArea * 0.1 * 15 / 1000), // 15W/m² admin areas
      catering: Math.round(cateringLoad / 1000),
      sportsFacilities: Math.round(sportsLoad / 1000),
      ictEquipment: Math.round(ictLoad / 1000),
      emergencySystems: Math.round(emergencyLoad / 1000)
    };

    // Circuit design per BB90/BB98/BB99 requirements
    const lightingCircuits = [
      {
        area: 'Classrooms',
        illuminance: facilityType === 'nursery' ? 300 : 500, // lux
        circuits: Math.ceil(pupilNumbers / 30) * 2, // 2 circuits per classroom
        controls: ['Occupancy detection', 'Daylight dimming', 'Manual override'],
        emergencyLighting: true
      },
      {
        area: 'Circulation areas',
        illuminance: 150,
        circuits: Math.ceil(floorArea / 200),
        controls: ['Occupancy detection', 'Time control'],
        emergencyLighting: true
      },
      {
        area: 'Assembly hall',
        illuminance: 200,
        circuits: 4,
        controls: ['Scene setting', 'Dimming', 'Stage lighting'],
        emergencyLighting: true
      }
    ];

    const powerCircuits = [
      {
        area: 'Classrooms',
        socketOutlets: Math.ceil(pupilNumbers / 30) * 12, // 12 outlets per classroom
        protection: 20, // A
        rcdProtection: true,
        usb: true
      },
      {
        area: 'ICT suites',
        socketOutlets: ictSuites * 32, // 32 outlets per ICT suite
        protection: 16, // A
        rcdProtection: true,
        usb: true
      },
      {
        area: 'Science laboratories',
        socketOutlets: scienceLabs * 20, // 20 outlets per lab
        protection: 16, // A
        rcdProtection: true,
        usb: false
      }
    ];

    const specialCircuits = [
      {
        purpose: 'Kitchen equipment',
        load: cateringLoad / 1000,
        protection: 'Various ratings as per equipment',
        isolation: true
      },
      {
        purpose: 'Workshop machinery',
        load: workshopLoad / 1000,
        protection: 'As per machinery requirements',
        isolation: true
      },
      {
        purpose: 'Emergency lighting',
        load: 3,
        protection: 'Dedicated circuits with 3-hour battery backup',
        isolation: false
      }
    ];

    // Safety considerations for educational environments
    const safetyConsiderations = {
      childSafety: true,
      accessibleSockets: specialNeeds ? 450 : 600, // mm height
      rcdProtection: true,
      afddRequired: true,
      tamperResistant: facilityType === 'nursery' || facilityType === 'primary_school',
      emergencyShutOff: true
    };

    // Accessibility compliance per Equality Act 2010 and DDA
    const accessibilityCompliance = {
      socketHeight: { min: 450, max: 1200 }, // mm
      switchHeight: { min: 750, max: 1200 }, // mm
      contrastRequirements: true,
      audioVisualAlarms: true,
      accessibleRoutes: true
    };

    // Energy efficiency per Building Regulations Part L
    const energyEfficiency = {
      led: true,
      occupancyDetection: true,
      daylightSensors: true,
      timeControls: true,
      efficacy: 120, // lm/W minimum
      controls: ['Automatic switching', 'Daylight dimming', 'Presence detection', 'Time scheduling']
    };

    // Emergency provision per BS 5266 and Building Regulations
    const emergencyProvision = {
      emergencyLighting: true,
      duration: 3, // hours
      fireAlarm: true,
      evacuation: true,
      accessibleAlarm: true
    };

    const compliance = {
      buildingBulletin: `BB${facilityType === 'primary_school' ? '99' : facilityType === 'secondary_school' ? '98' : '90'}`,
      accessibility: true,
      energyPerformance: true,
      fireRegulations: true
    };

    const recommendations = [
      'Implement comprehensive energy management system',
      'Consider renewable energy sources (solar PV)',
      'Install smart controls for lighting and HVAC integration',
      'Plan for future ICT expansion with spare capacity',
      'Regular PAT testing schedule for all portable equipment',
      'Staff training on electrical safety procedures',
      'Emergency lighting testing and maintenance procedures',
      'Accessible design features for inclusive education'
    ];

    return {
      facilityType,
      loadAnalysis,
      circuitDesign: {
        lightingCircuits,
        powerCircuits,
        specialCircuits
      },
      safetyConsiderations,
      accessibilityCompliance,
      energyEfficiency,
      emergencyProvision,
      compliance,
      recommendations,
      regulation: 'Based on DfE Building Bulletins, Building Regulations Part L, BS 7671:2018+A2:2022'
    };
  }
}

/**
 * Care Home Electrical Assessment Calculator
 * Electrical calculations for residential care facilities
 * Based on Care Quality Commission guidance, Building Regulations, and BS 7671
 */
export class CareHomeCalculator {
  static calculate(inputs: {
    careLevel: 'residential' | 'nursing' | 'dementia' | 'learning_disability' | 'mental_health';
    residents: number;
    rooms: number;
    floorArea: number; // m²
    kitchenFacilities: boolean;
    laundryFacilities: boolean;
    medicalEquipment: boolean;
    liftSystems: number;
    emergencyGenerator: boolean;
    dementiaSpecific: boolean;
  }): CareHomeResult {
    const {
      careLevel,
      residents,
      rooms,
      floorArea,
      kitchenFacilities,
      laundryFacilities,
      medicalEquipment,
      liftSystems,
      emergencyGenerator,
      dementiaSpecific
    } = inputs;

    const staff = Math.ceil(residents / 6); // Typical staff ratio
    const visitors = Math.ceil(residents * 0.2); // 20% visitor capacity
    const totalOccupancy = residents + staff + visitors;

    const capacityAnalysis = {
      residents,
      staff,
      visitors,
      totalOccupancy
    };

    // Load calculation based on care home requirements
    const accommodationLoad = rooms * 3; // 3kW per room
    const commonAreasLoad = floorArea * 0.6 * 15; // Common areas 60% of floor area at 15W/m²
    const cateringLoad = kitchenFacilities ? residents * 250 : 0; // 250W per resident
    const laundryLoad = laundryFacilities ? residents * 100 : 0; // 100W per resident
    const heatingLoad = floorArea * 50; // 50W/m² heating load
    const hotWaterLoad = residents * 1500; // 1.5kW per resident
    const medicalEquipmentLoad = medicalEquipment ? residents * 200 : 0; // 200W per resident if medical equipment present
    const liftSystemsLoad = liftSystems * 15000; // 15kW per lift
    const emergencySystemsLoad = floorArea * 3; // 3W/m² for emergency systems

    const totalConnectedLoad = (accommodationLoad + commonAreasLoad + cateringLoad + laundryLoad + heatingLoad + hotWaterLoad + medicalEquipmentLoad + liftSystemsLoad + emergencySystemsLoad) / 1000;
    const maximumDemand = totalConnectedLoad * 0.7; // 70% diversity factor for care homes

    const loadCalculation = {
      totalConnectedLoad: Math.round(totalConnectedLoad),
      maximumDemand: Math.round(maximumDemand),
      accommodation: Math.round(accommodationLoad),
      commonAreas: Math.round(commonAreasLoad / 1000),
      catering: Math.round(cateringLoad / 1000),
      laundry: Math.round(laundryLoad / 1000),
      heating: Math.round(heatingLoad / 1000),
      hotWater: Math.round(hotWaterLoad / 1000),
      medicalEquipment: Math.round(medicalEquipmentLoad / 1000),
      liftSystems: Math.round(liftSystemsLoad / 1000),
      emergencySystems: Math.round(emergencySystemsLoad / 1000)
    };

    // Circuit requirements specific to care environments
    const bedroomCircuits = [
      {
        roomType: 'Standard bedroom',
        outlets: 8, // 4 twin outlets
        protection: 20, // A
        nurseCall: careLevel !== 'residential',
        emergencyLighting: true
      },
      {
        roomType: 'Assisted living suite',
        outlets: 12, // 6 twin outlets with accessible height
        protection: 20, // A
        nurseCall: true,
        emergencyLighting: true
      }
    ];

    const commonAreaCircuits = [
      {
        area: 'Lounge areas',
        circuits: Math.ceil(floorArea * 0.3 / 50), // 30% of area, 1 circuit per 50m²
        protection: '20A RCD protected',
        controls: ['Occupancy detection', 'Manual override', 'Dimming']
      },
      {
        area: 'Dining areas',
        circuits: Math.ceil(floorArea * 0.15 / 40), // 15% of area, 1 circuit per 40m²
        protection: '20A RCD protected',
        controls: ['Scene setting', 'Cleaning mode', 'Night lighting']
      }
    ];

    const kitchenCircuits = kitchenFacilities ? [
      {
        equipment: 'Catering ovens',
        load: Math.round(residents * 150 / 1000), // 150W per resident
        protection: '32A DP isolator',
        isolation: true
      },
      {
        equipment: 'Dishwashers',
        load: 15,
        protection: '32A DP isolator',
        isolation: true
      },
      {
        equipment: 'Refrigeration',
        load: Math.round(residents * 50 / 1000), // 50W per resident
        protection: '16A dedicated circuits',
        isolation: true
      }
    ] : [];

    // Safety features specific to vulnerable residents
    const safetyFeatures = {
      wanderManagement: dementiaSpecific,
      autoLocking: dementiaSpecific || careLevel === 'dementia' || careLevel === 'mental_health',
      rcdProtection: true,
      afddRequired: true,
      emergencyCallSystem: true,
      fireAlarmIntegration: true,
      accessControl: true
    };

    // Accessibility features per Equality Act 2010
    const accessibilityFeatures = {
      socketHeight: 600, // mm - wheelchair accessible
      switchHeight: 1000, // mm - accessible for seated users
      contrastSwitches: true,
      audioVisualAlarms: true,
      accessibleMains: true,
      mobilityAids: true
    };

    // Emergency provision per healthcare facility requirements
    const emergencyProvision = {
      emergencyLighting: {
        duration: 3, // hours minimum
        batteryBackup: true,
        testingFrequency: 'Monthly functional, Annual full duration'
      },
      fireAlarmSystem: true,
      nurseCallSystem: careLevel !== 'residential',
      emergencyGenerator: emergencyGenerator,
      generatorCapacity: emergencyGenerator ? Math.round(maximumDemand * 0.6) : 0, // 60% of maximum demand
      automaticTransfer: emergencyGenerator,
      emergencyShutdown: true
    };

    // Special considerations for different care levels
    const specialConsiderations = {
      dementiaFriendly: dementiaSpecific || careLevel === 'dementia',
      behavioralTriggers: dementiaSpecific ? ['Avoid flashing lights', 'Minimize noise', 'Clear visual cues'] : [],
      ligatureResistant: careLevel === 'mental_health',
      tamperProof: careLevel === 'learning_disability' || careLevel === 'mental_health',
      antimicrobialFinish: careLevel === 'nursing'
    };

    // Compliance requirements
    const compliance = {
      careQualityCommission: true,
      healthTechnicalMemorandum: ['HTM 06-01', 'HTM 06-02'],
      buildingRegulations: true,
      equalityAct: true,
      careStandardsAct: true
    };

    // Inspection and testing requirements
    const inspection = {
      initialTesting: [
        'Electrical Installation Certificate (EIC)',
        'Emergency lighting testing',
        'Fire alarm system testing',
        'Nurse call system testing',
        'PAT testing of all equipment'
      ],
      periodicTesting: [
        'EICR every 5 years (or as recommended)',
        'Emergency lighting monthly tests',
        'RCD testing quarterly',
        'PAT testing annually',
        'Generator testing weekly'
      ],
      portableApplianceTesting: true,
      emergencySystemTesting: [
        'Emergency generator monthly load test',
        'Automatic transfer switch testing',
        'Emergency lighting full duration test annually'
      ],
      frequency: 'As per CQC inspection schedule and facility policies'
    };

    const recommendations = [
      'Implement comprehensive electrical maintenance program',
      'Regular PAT testing schedule for all equipment',
      'Emergency generator with automatic transfer switch recommended',
      'Consider renewable energy to reduce operating costs',
      'Smart building management system for energy efficiency',
      'Accessible design throughout for residents with mobility issues',
      'Regular staff training on electrical safety procedures',
      'Backup systems for critical medical equipment',
      'Ligature-resistant fixtures in mental health facilities',
      'Dementia-friendly lighting design with circadian rhythm support'
    ];

    return {
      careLevel,
      capacityAnalysis,
      loadCalculation,
      circuitRequirements: {
        bedroomCircuits,
        commonAreaCircuits,
        kitchenCircuits
      },
      safetyFeatures,
      accessibilityFeatures,
      emergencyProvision,
      specialConsiderations,
      compliance,
      inspection,
      recommendations,
      regulation: 'Based on CQC guidance, Building Regulations, BS 7671:2018+A2:2022, HTM guidance'
    };
  }
}
