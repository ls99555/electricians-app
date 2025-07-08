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
  MinimumCircuitResult
} from './types';

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

      // Calculate estimated compliance cost
      const complianceCost = this.calculateComplianceCost(
        notificationRequired,
        competentPersonEligible,
        workType
      );

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

      return {
        workType,
        location,
        notificationRequired,
        certificationRequired,
        competentPersonEligible,
        complianceCost,
        compliancePathway,
        timeframe: notificationRequired ? '21 days minimum' : 'Immediate',
        recommendations,
        regulation: 'Building Regulations Part P, BS 7671 Section 134'
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
  ): string {
    if (installerQualification === 'competent_person') {
      return 'Electrical Installation Certificate (EIC) or Minor Electrical Works Certificate (MEWC)';
    }
    
    if (notificationRequired) {
      return 'Building Control Completion Certificate plus EIC/MEWC';
    }

    return 'Minor Electrical Works Certificate (MEWC) minimum';
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
    competentPersonEligible: boolean,
    workType: string
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

      return {
        buildingType,
        floorArea,
        totalConnectedLoad: Math.round(totalConnectedLoad),
        maximumDemand: Math.round(maximumDemand),
        serviceCapacity: Math.round(serviceCapacity),
        minimumCircuits,
        loadBreakdown: {
          base: Math.round(baseLoad),
          heating: Math.round(heatingLoad),
          hotWater: Math.round(hotWaterLoad),
          cooking: Math.round(cookingLoad),
          evCharging: Math.round(evLoad)
        },
        recommendations,
        regulation: 'Building Regulations Part P, BS 7671 Section 311'
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
        buildingType,
        floorArea,
        energyUseIntensity: Math.round(energyUseIntensity),
        netEnergyConsumption: Math.round(netEnergyConsumption),
        renewableContribution: Math.round((renewableGeneration / annualEnergyConsumption) * 100),
        carbonEmissions: Math.round(carbonEmissions),
        energyRating: energyRating.currentRating,
        potentialRating: energyRating.potentialRating,
        costSavings,
        recommendations,
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
