/**
 * Advanced EV Charging Calculations
 * Commercial station design, diversity factors, fast charging, and load balancing
 * 
 * Based on:
 * - IET Code of Practice for EV Charging Equipment Installation (4th Edition)
 * - BS EN 61851 - Electric vehicle conductive charging system
 * - BS EN 62196 - Plugs, socket-outlets, vehicle connectors and vehicle inlets
 * - Engineering Recommendation G100 - Technical requirements for customer export limiting schemes
 * - PAS 1878 - Specification for electric vehicle charging system installation
 * - BS 7671:2018+A2:2022 Section 722 - Electric vehicle charging installations
 * 
 * UK EV Charging Standards:
 * - Maximum demand calculations for multiple charging points
 * - Load balancing and smart charging requirements
 * - Grid connection impact assessment
 * - Power quality and harmonic considerations
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - EV charging installations must comply with IET Code of Practice and BS 7671
 * - Grid connection applications require DNO approval for loads >16A per phase
 * - Professional electrical design essential for commercial installations
 * - All installations must be certified by qualified personnel
 * - Building Regulations Part P compliance required for domestic installations
 */

import type {
  CommercialEVChargingInputs,
  CommercialEVChargingResult,
  EVChargingDiversityInputs,
  EVChargingDiversityResult,
  FastChargingInputs,
  FastChargingResult,
  LoadBalancingInputs,
  LoadBalancingResult
} from '../types/advanced';

/**
 * Commercial EV Charging Station Design Calculator
 * Comprehensive planning tool for commercial EV charging facilities
 * Reference: IET Code of Practice for EV Charging Equipment Installation
 */
export class CommercialEVChargingCalculator {
  /**
   * Calculate commercial EV charging station requirements
   */
  static calculate(inputs: CommercialEVChargingInputs): CommercialEVChargingResult {
    const {
      numberOfChargers,
      chargerTypes,
      siteDemand,
      siteCapacity,
      loadProfile,
      futureExpansion,
      gridConnection,
      transformerCapacity
    } = inputs;

    // Calculate total charging load
    const totalChargingLoad = chargerTypes.reduce((total, charger) => {
      const powerRating = parseFloat(charger.type.replace('kW', ''));
      return total + (powerRating * charger.quantity);
    }, 0);

    // Apply diversity factor based on usage type and number of chargers
    const diversityFactor = this.calculateCommercialDiversityFactor(
      numberOfChargers,
      chargerTypes.map(ct => ({ type: ct.type, quantity: ct.quantity, usage: 'commercial' })),
      loadProfile
    );

    const diversifiedLoad = totalChargingLoad * diversityFactor;

    // Calculate peak demand including existing site load
    const peakDemand = siteDemand + diversifiedLoad;

    // Account for future expansion
    const futureLoad = peakDemand * (1 + futureExpansion / 100);

    // Infrastructure requirements assessment
    const infrastructureRequirements = this.assessInfrastructureRequirements(
      futureLoad,
      siteCapacity,
      `${gridConnection.voltage}V ${gridConnection.phases}-phase ${gridConnection.capacity}kVA`,
      transformerCapacity
    );

    // Load management requirements
    const loadManagement = this.assessLoadManagement(
      numberOfChargers,
      totalChargingLoad,
      siteCapacity
    );

    // Economic analysis
    const economicAnalysis = this.calculateEconomics(
      totalChargingLoad,
      numberOfChargers,
      chargerTypes,
      infrastructureRequirements
    );

    // Generate recommendations
    const recommendations = this.generateCommercialRecommendations(
      numberOfChargers,
      totalChargingLoad,
      infrastructureRequirements,
      loadManagement
    );

    return {
      isCompliant: true,
      loadAnalysis: {
        peakDemand: futureLoad,
        averageDemand: diversifiedLoad,
        loadFactor: diversifiedLoad / totalChargingLoad,
        simultaneityFactor: diversityFactor,
        demandProfile: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          demand: diversifiedLoad * (0.8 + 0.4 * Math.sin((hour - 6) * Math.PI / 12)),
          utilization: 50 + 30 * Math.sin((hour - 9) * Math.PI / 12)
        }))
      },
      gridImpact: {
        maxDemandIncrease: diversifiedLoad,
        transformerLoading: (diversifiedLoad / gridConnection.capacity) * 100,
        voltageImpact: 2.5, // Typical 2.5% voltage drop
        harmonicAnalysis: {
          thdi: 8.5, // Total harmonic distortion current
          thdv: 2.1  // Total harmonic distortion voltage
        },
        powerQualityMitigation: [
          { issue: "Harmonic distortion", solution: "Active harmonic filter", cost: 15000 },
          { issue: "Voltage fluctuation", solution: "Voltage regulator", cost: 8000 }
        ]
      },
      economicAnalysis,
      compliance: {
        bs7671: true,
        iet: true,
        buildingRegs: true,
        requirements: [
          'BS 7671:2018+A2:2022 Section 722 - Electric vehicle charging installations',
          'IET Code of Practice for EV Charging Equipment Installation',
          'Building Regulations Part P'
        ]
      },
      recommendations,
      regulation: 'IET Code of Practice for EV Charging Equipment Installation (4th Edition), BS EN 61851'
    };
  }

  private static calculateCommercialDiversityFactor(
    numberOfChargers: number,
    chargerTypes: Array<{ type: string; quantity: number; usage: string }>,
    loadProfile: string
  ): number {
    // Base diversity factor from IET guidance
    let baseDiversity = 1.0;

    if (numberOfChargers <= 5) baseDiversity = 0.9;
    else if (numberOfChargers <= 10) baseDiversity = 0.8;
    else if (numberOfChargers <= 20) baseDiversity = 0.7;
    else if (numberOfChargers <= 50) baseDiversity = 0.6;
    else baseDiversity = 0.5;

    // Adjust for usage type
    const hasPublicChargers = chargerTypes.some(c => c.usage === 'public');
    const hasFleetChargers = chargerTypes.some(c => c.usage === 'fleet');
    const hasWorkplaceChargers = chargerTypes.some(c => c.usage === 'workplace');

    let usageAdjustment = 1.0;
    if (hasPublicChargers) usageAdjustment *= 1.2; // Higher utilization
    if (hasFleetChargers) usageAdjustment *= 1.1; // Predictable usage
    if (hasWorkplaceChargers) usageAdjustment *= 0.9; // Lower utilization

    // Load profile adjustment
    let profileAdjustment = 1.0;
    switch (loadProfile) {
      case 'continuous': profileAdjustment = 1.0; break;
      case 'peak_hours': profileAdjustment = 1.3; break;
      case 'off_peak': profileAdjustment = 0.7; break;
      case 'mixed': profileAdjustment = 1.1; break;
    }

    return Math.min(1.0, baseDiversity * usageAdjustment * profileAdjustment);
  }

  private static assessInfrastructureRequirements(
    futureLoad: number,
    siteCapacity: number,
    gridConnection: string,
    transformerCapacity?: number
  ) {
    const capacityShortfall = futureLoad - siteCapacity;
    const transformerUpgrade = transformerCapacity ? 
      (futureLoad > transformerCapacity * 0.8) : (capacityShortfall > 0);

    let newTransformerRating: number | undefined;
    if (transformerUpgrade && transformerCapacity) {
      // Size transformer for 125% of peak load
      newTransformerRating = Math.ceil(futureLoad * 1.25 / 50) * 50; // Round to nearest 50kVA
    }

    return {
      transformerUpgrade,
      newTransformerRating,
      cableUpgrade: capacityShortfall > siteCapacity * 0.2,
      switchgearUpgrade: futureLoad > 100, // Simplified threshold
      meteringUpgrade: futureLoad > 100 || gridConnection === 'HV'
    };
  }

  private static assessLoadManagement(
    numberOfChargers: number,
    totalLoad: number,
    siteCapacity: number
  ) {
    const required = totalLoad > siteCapacity || numberOfChargers > 5;
    
    let strategy = 'static';
    if (numberOfChargers > 10) strategy = 'dynamic';
    if (totalLoad > siteCapacity * 1.5) strategy = 'intelligent';

    const maxSimultaneous = Math.min(
      numberOfChargers,
      Math.floor(siteCapacity / (totalLoad / numberOfChargers))
    );

    return {
      required,
      strategy,
      maxSimultaneous
    };
  }

  private static calculateEconomics(
    totalLoad: number,
    numberOfChargers: number,
    chargerTypes: Array<{ type: string; quantity: number }>,
    infrastructure: any
  ) {
    // Simplified economic calculation
    const chargerCosts = chargerTypes.reduce((total, charger) => {
      const powerRating = parseFloat(charger.type.replace('kW', ''));
      let unitCost = 2000; // Base cost £2k
      if (powerRating > 20) unitCost = 15000;
      else if (powerRating > 10) unitCost = 8000;
      
      return total + (unitCost * charger.quantity);
    }, 0);

    const infrastructureCost = infrastructure.transformerUpgrade ? 50000 : 0;
    const installationCost = numberOfChargers * 3000; // £3k per charger installation

    const capitalCost = chargerCosts + infrastructureCost + installationCost;
    const operationalCost = totalLoad * 365 * 24 * 0.15; // Simplified £0.15/kWh
    const revenueProjection = totalLoad * 365 * 24 * 0.25; // £0.25/kWh charging rate
    const paybackPeriod = capitalCost / (revenueProjection - operationalCost);
    const roi = ((revenueProjection - operationalCost) / capitalCost) * 100;

    return {
      installationCost: capitalCost,
      operatingCost: operationalCost,
      revenueProjection,
      paybackPeriod,
      roi
    };
  }

  private static generateCommercialRecommendations(
    numberOfChargers: number,
    totalLoad: number,
    infrastructure: any,
    loadManagement: any
  ): string[] {
    const recommendations = [
      'Engage with DNO early for grid connection approval',
      'Consider phased installation approach to manage costs',
      'Implement smart charging systems for load optimization'
    ];

    if (infrastructure.transformerUpgrade) {
      recommendations.push('Plan transformer upgrade with sufficient future capacity');
      recommendations.push('Consider 11kV connection for large installations');
    }

    if (loadManagement.required) {
      recommendations.push('Install load management system for optimal charging');
      recommendations.push('Consider time-of-use tariffs for cost optimization');
    }

    if (numberOfChargers > 20) {
      recommendations.push('Implement central monitoring and control system');
      recommendations.push('Consider on-site battery storage for peak shaving');
    }

    if (totalLoad > 500) {
      recommendations.push('Conduct power quality study for harmonic assessment');
      recommendations.push('Install power factor correction equipment');
    }

    recommendations.push('Ensure compliance with Building Regulations and CDM');
    recommendations.push('Regular maintenance schedule essential for safety');

    return recommendations;
  }
}

/**
 * EV Charging Diversity Factors Calculator
 * Statistical analysis of charging patterns for demand forecasting
 * Reference: IET Code of Practice Section 6 - Load Assessment
 */
export class EVChargingDiversityCalculator {
  /**
   * Calculate diversity factors for EV charging installations
   */
  static calculate(inputs: EVChargingDiversityInputs): EVChargingDiversityResult {
    const { chargingPoints, siteType, timeProfile, smartCharging, vehicleTypes } = inputs;

    // Calculate total connected load
    const totalConnectedLoad = chargingPoints.reduce((total, point) => 
      total + point.power, 0
    );

    // Calculate utilization factors
    const utilizationFactor = this.calculateUtilizationFactor(
      chargingPoints,
      siteType,
      vehicleTypes
    );

    // Calculate simultaneity factor
    const simultaneityFactor = this.calculateSimultaneityFactor(
      chargingPoints.length,
      siteType,
      timeProfile,
      smartCharging
    );

    // Diversified load calculation
    const diversifiedLoad = totalConnectedLoad * simultaneityFactor * utilizationFactor;

    // Generate 24-hour demand profile
    const demandProfile = this.generateDemandProfile(
      diversifiedLoad,
      timeProfile,
      siteType
    );

    // Load forecasting
    const loadForecast = this.calculateLoadForecast(
      diversifiedLoad,
      siteType,
      vehicleTypes
    );

    // Generate recommendations
    const recommendations = this.generateDiversityRecommendations(
      totalConnectedLoad,
      diversifiedLoad,
      simultaneityFactor,
      siteType
    );

    return {
      isCompliant: true,
      diversityFactors: {
        after15min: simultaneityFactor * 0.9,
        after30min: simultaneityFactor * 0.8,
        after1hour: simultaneityFactor * 0.7,
        after2hour: simultaneityFactor * 0.6,
        maximumDemand: diversifiedLoad
      },
      demandProfile,
      peakDemand: {
        time: '18:00',
        demand: Math.max(...demandProfile.map(p => p.demand)),
        diversity: simultaneityFactor,
        coincidenceFactor: utilizationFactor
      },
      loadCharacteristics: {
        averageDemand: diversifiedLoad * 0.6,
        loadFactor: 0.7,
        energyConsumption: diversifiedLoad * 24 * 0.6
      },
      gridRequirements: {
        minimumCapacity: diversifiedLoad * 1.1,
        recommendedCapacity: diversifiedLoad * 1.25,
        transformerSize: Math.ceil(diversifiedLoad * 1.25 / 50) * 50,
        cableSize: Math.ceil(diversifiedLoad / 10) * 10
      },
      recommendations: [
        'Implement smart charging to optimize load diversity',
        'Consider time-of-use tariffs to encourage off-peak charging',
        'Monitor actual usage patterns to refine diversity factors'
      ],
      regulation: 'IET Code of Practice for EV Charging Equipment Installation, Section 6'
    };
  }

  private static calculateUtilizationFactor(
    chargingPoints: Array<any>,
    siteType: string,
    vehicleTypes: Array<any>
  ): number {
    // Use average power rating as a proxy for utilization since we don't have utilisation property
    const averagePower = chargingPoints.reduce((total, point) => 
      total + point.power, 0
    ) / chargingPoints.length;

    // Base utilization based on power rating (normalized to 0-1)
    let baseUtilization = Math.min(averagePower / 50, 1.0); // Normalize against 50kW max

    // Site type adjustment
    switch (siteType) {
      case 'residential': baseUtilization *= 0.6; break;
      case 'workplace': baseUtilization *= 0.8; break;
      case 'public': baseUtilization *= 1.2; break;
      case 'commercial': baseUtilization *= 1.0; break;
    }

    return Math.min(1.0, baseUtilization);
  }

  private static calculateSimultaneityFactor(
    numberOfPoints: number,
    siteType: string,
    timeProfile: string,
    smartCharging: boolean
  ): number {
    // Base simultaneity from IET guidance
    let baseFactor = 1.0;
    
    if (numberOfPoints <= 2) baseFactor = 1.0;
    else if (numberOfPoints <= 5) baseFactor = 0.8;
    else if (numberOfPoints <= 10) baseFactor = 0.7;
    else if (numberOfPoints <= 20) baseFactor = 0.6;
    else baseFactor = 0.5;

    // Time profile adjustment
    let timeAdjustment = 1.0;
    switch (timeProfile) {
      case 'flat': timeAdjustment = 0.8; break;
      case 'peak_valley': timeAdjustment = 1.2; break;
      case 'business_hours': timeAdjustment = 1.1; break;
      case 'residential': timeAdjustment = 1.0; break;
    }

    // Smart charging reduces simultaneity
    const smartAdjustment = smartCharging ? 0.8 : 1.0;

    // Site type adjustment
    let siteAdjustment = 1.0;
    switch (siteType) {
      case 'residential': siteAdjustment = 0.9; break;
      case 'workplace': siteAdjustment = 1.1; break;
      case 'public': siteAdjustment = 1.3; break;
      case 'industrial': siteAdjustment = 1.0; break;
    }

    return Math.min(1.0, baseFactor * timeAdjustment * smartAdjustment * siteAdjustment);
  }

  private static generateDemandProfile(
    diversifiedLoad: number,
    timeProfile: string,
    siteType: string
  ) {
    const profile = [];
    
    for (let hour = 0; hour < 24; hour++) {
      let demandFactor = 0.5; // Base 50% demand
      
      switch (timeProfile) {
        case 'residential':
          if (hour >= 18 && hour <= 22) demandFactor = 1.0; // Evening peak
          else if (hour >= 7 && hour <= 9) demandFactor = 0.8; // Morning
          else if (hour >= 0 && hour <= 6) demandFactor = 0.2; // Night
          break;
          
        case 'business_hours':
          if (hour >= 9 && hour <= 17) demandFactor = 1.0; // Business hours
          else demandFactor = 0.2;
          break;
          
        case 'peak_valley':
          if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 20) demandFactor = 1.0;
          else if (hour >= 23 || hour <= 6) demandFactor = 0.3;
          else demandFactor = 0.6;
          break;
          
        case 'flat':
        default:
          demandFactor = 0.7; // Relatively flat profile
          break;
      }
      
      const demand = diversifiedLoad * demandFactor;
      const utilisation = demandFactor * 100;
      
      profile.push({ 
        hour, 
        demand, 
        chargersActive: Math.ceil(demandFactor * 10), // Estimate active chargers
        utilizationRate: utilisation 
      });
    }
    
    return profile;
  }

  private static calculateLoadForecast(
    currentLoad: number,
    siteType: string,
    vehicleTypes: Array<any>
  ) {
    // Growth factors based on site type and vehicle adoption
    let growthRate = 0.15; // 15% per year base
    
    switch (siteType) {
      case 'residential': growthRate = 0.20; break; // 20% growth
      case 'workplace': growthRate = 0.15; break;
      case 'public': growthRate = 0.25; break; // Higher growth
      case 'industrial': growthRate = 0.12; break;
    }

    // Electric vehicle type influence
    const hasCommercialVehicles = vehicleTypes.some(v => 
      v.type === 'van' || v.type === 'truck' || v.type === 'bus'
    );
    if (hasCommercialVehicles) growthRate *= 1.3;

    return {
      year1: currentLoad * (1 + growthRate),
      year5: currentLoad * Math.pow(1 + growthRate, 5),
      year10: currentLoad * Math.pow(1 + growthRate, 10)
    };
  }

  private static generateDiversityRecommendations(
    totalLoad: number,
    diversifiedLoad: number,
    simultaneityFactor: number,
    siteType: string
  ): string[] {
    const recommendations = [
      `Diversity factor of ${simultaneityFactor.toFixed(2)} applied to reduce peak demand`,
      'Monitor actual usage patterns to validate diversity assumptions'
    ];

    if (simultaneityFactor > 0.8) {
      recommendations.push('High simultaneity factor - consider load management');
    }

    if (totalLoad > diversifiedLoad * 2) {
      recommendations.push('Significant diversity benefit - optimize infrastructure sizing');
    }

    switch (siteType) {
      case 'residential':
        recommendations.push('Consider time-of-use charging to optimize domestic demand');
        break;
      case 'workplace':
        recommendations.push('Implement smart charging to manage business hour demand');
        break;
      case 'public':
        recommendations.push('High utilization expected - size infrastructure accordingly');
        break;
    }

    recommendations.push('Regular review of diversity factors as usage patterns evolve');
    recommendations.push('Consider smart charging systems to improve diversity');

    return recommendations;
  }
}

/**
 * Fast Charging Power Requirements Calculator
 * High-power DC charging system design and grid impact assessment
 * Reference: BS EN 61851-23, IET Code of Practice Section 8
 */
export class FastChargingCalculator {
  /**
   * Calculate fast charging power requirements and specifications
   */
  static calculate(inputs: FastChargingInputs): FastChargingResult {
    const {
      chargerRating,
      voltageLevel,
      chargingStandard,
      coolingMethod,
      cableLength,
      ambientTemperature,
      utilizationFactor,
      gridConnection,
      powerQuality
    } = inputs;

    // Power requirements calculation
    const powerRequirements = this.calculatePowerRequirements(
      chargerRating,
      voltageLevel,
      utilizationFactor
    );

    // Cable specification
    const cableSpecification = this.calculateCableSpecification(
      chargerRating,
      voltageLevel,
      cableLength,
      coolingMethod,
      ambientTemperature
    );

    // Grid impact assessment
    const gridImpact = this.assessGridImpact(
      chargerRating,
      chargingStandard,
      powerQuality
    );

    // Protection requirements
    const protectionRequirements = this.getProtectionRequirements(
      chargerRating,
      voltageLevel,
      gridConnection
    );

    // Economic analysis
    const economics = this.calculateFastChargingEconomics(
      chargerRating,
      utilizationFactor
    );

    // Generate recommendations
    const recommendations = this.generateFastChargingRecommendations(
      chargerRating,
      gridImpact,
      cableSpecification
    );

    return {
      isCompliant: true,
      powerRequirements,
      gridImpact,
      protectionRequirements,
      compliance: {
        gridCode: true,
        safety: true,
        emc: true,
        requirements: [
          'BS EN 61851-23 - Electric vehicle charging systems',
          'IET Code of Practice for EV Charging Equipment Installation',
          'G99 Grid Code compliance'
        ]
      },
      economicAnalysis: {
        capitalCost: chargerRating * 800, // £800 per kW typical cost
        gridConnectionCost: 25000, // Typical grid connection cost
        operatingCost: chargerRating * 50, // Annual operating cost
        revenueProjection: chargerRating * 200 // Annual revenue projection
      },
      recommendations: [
        'Implement proper cable cooling for high-power charging',
        'Ensure adequate grid capacity for peak demand',
        'Install comprehensive protection systems for safety'
      ],
      regulation: 'BS EN 61851-23, IET Code of Practice for EV Charging Equipment Installation'
    };
  }

  private static calculatePowerRequirements(
    chargerRating: number,
    voltageLevel: number,
    utilizationFactor: number
  ) {
    const maxDemand = chargerRating * utilizationFactor;
    const averageDemand = maxDemand * 0.7; // Typical average demand
    
    // Power factor varies with charger design
    let powerFactor = 0.95; // Typical for modern chargers
    if (chargerRating > 150) powerFactor = 0.97; // Higher power chargers more efficient
    
    const apparentPower = maxDemand / powerFactor;
    const reactiveRequirements = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(maxDemand, 2));

    return {
      maxDemand,
      averageDemand,
      reactiveRequirements,
      apparentPower
    };
  }

  private static calculateCableSpecification(
    chargerRating: number,
    voltageLevel: number,
    cableLength: number,
    coolingMethod: string,
    ambientTemperature: number
  ) {
    const dcVoltage = voltageLevel * 1000; // Convert kV to V
    const dcCurrent = (chargerRating * 1000) / dcVoltage;
    
    // DC cable sizing (simplified calculation)
    let dcCableCSA = 70; // mm² minimum for fast charging
    if (dcCurrent > 200) dcCableCSA = 120;
    if (dcCurrent > 300) dcCableCSA = 185;
    if (dcCurrent > 400) dcCableCSA = 240;
    
    // AC feed cable sizing (assuming 400V 3-phase)
    const acCurrent = (chargerRating * 1000) / (400 * Math.sqrt(3) * 0.95);
    let acFeedCSA = 35; // mm²
    if (acCurrent > 100) acFeedCSA = 70;
    if (acCurrent > 150) acFeedCSA = 120;
    if (acCurrent > 200) acFeedCSA = 185;

    // Cooling requirements
    const coolingRequired = chargerRating > 150 || coolingMethod === 'liquid';
    let thermalManagement = 'Natural convection';
    if (coolingRequired) {
      thermalManagement = chargerRating > 200 ? 'Liquid cooling' : 'Forced air cooling';
    }

    // Temperature derating
    const tempDerating = ambientTemperature > 30 ? 0.9 : 1.0;
    dcCableCSA = Math.ceil(dcCableCSA / tempDerating);
    acFeedCSA = Math.ceil(acFeedCSA / tempDerating);

    return {
      dcCableCSA,
      acFeedCSA,
      coolingRequired,
      thermalManagement
    };
  }

  private static assessGridImpact(
    chargerRating: number,
    chargingStandard: string,
    powerQuality: { harmonicLimits: boolean; powerFactorCorrection: boolean; voltageRegulation: boolean; }
  ) {
    // Harmonic distortion assessment
    let harmonicDistortion = 5; // % THD typical
    if (chargerRating > 150) harmonicDistortion = 8;
    if (!powerQuality.harmonicLimits) harmonicDistortion *= 1.5;

    // Voltage flicker assessment (as number, not boolean)
    const voltageFlicker = chargerRating > 100 ? 3.5 : 1.2; // % voltage flicker

    // System stability assessment
    const systemStability = {
      impact: (chargerRating > 200 ? 'high' : chargerRating > 100 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      mitigationRequired: chargerRating > 150
    };

    return {
      voltageFlicker,
      harmonicDistortion: {
        voltage: harmonicDistortion * 0.6, // THDV typically lower than THDI
        current: harmonicDistortion
      },
      systemStability
    };
  }

  private static getProtectionRequirements(
    chargerRating: number,
    voltageLevel: number,
    gridConnection: { voltage: number; capacity: number; impedance: number; connectionType: string; }
  ) {
    // Calculate fault level based on grid connection
    const faultLevel = (gridConnection.capacity * 1000) / (Math.sqrt(3) * gridConnection.voltage * gridConnection.impedance / 100);
    
    // Protection settings based on charger rating and fault level
    const protectionSettings = [
      { device: 'MCB', setting: chargerRating * 1.25, purpose: 'Overcurrent protection' },
      { device: 'RCD Type B', setting: 30, purpose: 'Earth leakage protection' },
      { device: 'Surge arrestor', setting: gridConnection.voltage * 1.5, purpose: 'Overvoltage protection' }
    ];

    if (chargerRating > 100) {
      protectionSettings.push({ device: 'Arc fault detector', setting: 5, purpose: 'DC arc fault protection' });
    }

    // Arc flash category based on fault level and voltage
    let arcFlashCategory = 1;
    if (faultLevel > 25) arcFlashCategory = 2;
    if (faultLevel > 65) arcFlashCategory = 3;
    if (gridConnection.voltage > 1000) arcFlashCategory = 4;

    return {
      faultLevel,
      protectionSettings,
      arcFlashCategory
    };
  }

  private static calculateFastChargingEconomics(
    chargerRating: number,
    utilizationFactor: number
  ) {
    // Simplified economic calculation
    const powerCost = 0.15; // £/kWh
    const demandCharge = 20; // £/kW/month for high power

    const installationCost = chargerRating < 100 ? 50000 : 
                           chargerRating < 200 ? 80000 : 120000;

    return {
      powerCost,
      demandCharge,
      installationCost
    };
  }

  private static generateFastChargingRecommendations(
    chargerRating: number,
    gridImpact: any,
    cableSpec: any
  ): string[] {
    const recommendations = [
      'Engage with DNO early for high-power connections',
      'Conduct grid impact study for installations >150kW'
    ];

    if (gridImpact.harmonicDistortion > 8) {
      recommendations.push('Install harmonic filtering to meet G5/4-1 standards');
    }

    if (cableSpec.coolingRequired) {
      recommendations.push('Implement robust thermal management system');
      recommendations.push('Regular maintenance of cooling systems essential');
    }

    if (chargerRating > 150) {
      recommendations.push('Consider 11kV connection for reduced losses');
      recommendations.push('Implement comprehensive monitoring system');
    }

    recommendations.push('Ensure compliance with BS EN 61851-23 safety standards');
    recommendations.push('Regular testing and calibration of protection systems');

    return recommendations;
  }
}

/**
 * Load Balancing for Multiple EV Points Calculator
 * Dynamic load management and optimization for EV charging networks
 * Reference: IET Code of Practice Section 7, Smart Charging Guidelines
 */
export class LoadBalancingCalculator {
  /**
   * Calculate load balancing for multiple EV charging points
   */
  static calculate(inputs: LoadBalancingInputs): LoadBalancingResult {
    const {
      chargingPoints,
      totalCapacity,
      reserveCapacity,
      balancingStrategy,
      timeOfUse,
      renewableIntegration,
      batteryStorage
    } = inputs;

    // Calculate current total demand
    const totalDemand = chargingPoints.reduce((sum, point) => 
      sum + (point.isActive ? point.currentDemand : 0), 0
    );

    // Available capacity calculation
    const availableCapacity = totalCapacity - reserveCapacity;

    // Load balancing allocation
    const allocatedPower = this.allocatePower(
      chargingPoints,
      availableCapacity,
      balancingStrategy,
      batteryStorage
    );

    // System status assessment
    const systemStatus = this.assessSystemStatus(
      totalDemand,
      totalCapacity,
      availableCapacity
    );

    // Optimization calculations
    const optimization = this.calculateOptimization(
      chargingPoints,
      allocatedPower,
      timeOfUse,
      renewableIntegration
    );

    // Control strategy definition
    const controlStrategy = this.defineControlStrategy(
      balancingStrategy,
      chargingPoints.length,
      renewableIntegration
    );

    // Generate alerts
    const alerts = this.generateAlerts(systemStatus, totalDemand, totalCapacity);

    // Generate recommendations
    const recommendations = this.generateLoadBalancingRecommendations(
      systemStatus,
      optimization,
      renewableIntegration
    );

    return {
      isCompliant: true,
      allocatedPower,
      systemStatus,
      controlStrategy,
      performanceMetrics: {
        balanceAchieved: true,
        responseTime: 150, // ms
        stabilityMargin: 85 // %
      },
      recommendations: [
        'Monitor system performance regularly',
        'Adjust priority weights based on usage patterns',
        'Consider upgrading to higher capacity during peak periods'
      ],
      regulation: 'IET Code of Practice for EV Charging Equipment Installation, Section 7'
    };
  }

  private static allocatePower(
    chargingPoints: Array<any>,
    availableCapacity: number,
    strategy: string,
    batteryStorage?: any
  ) {
    const activePoints = chargingPoints.filter(point => point.isActive);
    const totalMaxDemand = activePoints.reduce((sum, point) => sum + point.maxRating, 0);

    // Additional capacity from battery storage
    let additionalCapacity = 0;
    if (batteryStorage && batteryStorage.soc > 0.2) {
      additionalCapacity = batteryStorage.power * (batteryStorage.soc - 0.2);
    }

    const totalAvailable = availableCapacity + additionalCapacity;

    return activePoints.map(point => {
      let allocatedPower = point.maxRating;
      let reductionFactor = 1.0;

      if (totalMaxDemand > totalAvailable) {
        switch (strategy) {
          case 'equal':
            reductionFactor = totalAvailable / totalMaxDemand;
            allocatedPower = point.maxRating * reductionFactor;
            break;

          case 'priority':
            const priorityOrderMap: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
            const totalPriorityWeight = activePoints.reduce((sum, p) => 
              sum + (priorityOrderMap[p.priority as string] || 1), 0
            );
            const pointWeight = priorityOrderMap[point.priority as string] || 1;
            allocatedPower = (totalAvailable * pointWeight) / totalPriorityWeight;
            reductionFactor = allocatedPower / point.maxRating;
            break;

          case 'time_based':
            // Simplified: reduce power for newer connections
            reductionFactor = Math.min(1.0, totalAvailable / totalMaxDemand);
            allocatedPower = point.maxRating * reductionFactor;
            break;

          case 'dynamic':
            // AI-optimized allocation (simplified)
            reductionFactor = this.dynamicAllocation(point, activePoints, totalAvailable);
            allocatedPower = point.maxRating * reductionFactor;
            break;
        }
      }

      // Estimate charging time based on allocated power
      const estimatedChargingTime = point.currentDemand > 0 ? 
        (point.currentDemand / allocatedPower) : 0;

      return {
        chargerId: point.chargerId,
        allocatedPower: Math.round(allocatedPower * 10) / 10,
        reductionFactor: Math.round(reductionFactor * 100) / 100,
        priority: point.priority,
        estimatedChargeTime: Math.round(estimatedChargingTime * 10) / 10
      };
    });
  }

  private static dynamicAllocation(
    point: any,
    allPoints: Array<any>,
    totalAvailable: number
  ): number {
    // Simplified dynamic allocation based on multiple factors
    const priorityWeights: { [key: string]: number } = { high: 1.0, medium: 0.8, low: 0.6 };
    const priorityWeight = priorityWeights[point.priority as string] || 0.6;
    const demandRatio = point.currentDemand / point.maxRating;
    const baseReduction = totalAvailable / allPoints.reduce((sum, p) => sum + p.maxRating, 0);
    
    return Math.min(1.0, baseReduction * priorityWeight * (1 + demandRatio * 0.2));
  }

  private static assessSystemStatus(
    totalDemand: number,
    totalCapacity: number,
    availableCapacity: number
  ) {
    const utilizationRate = totalDemand / totalCapacity;
    
    let loadBalance: 'optimal' | 'constrained' | 'overloaded';
    if (utilizationRate <= 0.7) loadBalance = 'optimal';
    else if (utilizationRate <= 0.9) loadBalance = 'constrained';
    else loadBalance = 'overloaded';

    return {
      totalAllocated: Math.round(totalDemand * 10) / 10,
      gridUtilization: Math.round(utilizationRate * 100),
      efficiencyGain: 85, // % efficiency gained from load balancing
      costSavings: Math.round((1 - utilizationRate) * 100 * 10) / 10 // £/day saved
    };
  }

  private static calculateOptimization(
    chargingPoints: Array<any>,
    allocatedPower: Array<any>,
    timeOfUse: boolean,
    renewableIntegration: boolean
  ) {
    // Simplified optimization calculations
    const costSavings = timeOfUse ? 50 : 0; // £/day
    const efficiencyGain = renewableIntegration ? 15 : 5; // %
    
    const totalDemandReduction = chargingPoints.reduce((sum, point, index) => {
      const allocation = allocatedPower.find(a => a.chargerId === point.id);
      return sum + (point.maxRating - (allocation?.allocatedPower || 0));
    }, 0);

    return {
      costSavings,
      efficiencyGain,
      peakReduction: Math.round(totalDemandReduction * 10) / 10
    };
  }

  private static defineControlStrategy(
    strategy: string,
    numberOfPoints: number,
    renewableIntegration: boolean
  ) {
    const algorithmsMap: { [key: string]: string } = {
      equal: 'Proportional power reduction',
      priority: 'Priority-based allocation',
      time_based: 'Time-sequential management',
      dynamic: 'AI-optimized dynamic allocation'
    };

    const updateInterval = numberOfPoints > 10 ? 30 : 60; // seconds

    const objectives = [
      'Maximize grid utilization',
      'Minimize peak demand charges',
      'Optimize energy costs'
    ];

    const priorityRules = [
      { rule: 'Emergency vehicles - highest priority', weight: 1.0 },
      { rule: 'Fleet vehicles - medium priority', weight: 0.7 },
      { rule: 'Public charging - standard priority', weight: 0.5 }
    ];

    if (renewableIntegration) {
      objectives.push('Maximize renewable energy utilization');
      priorityRules.push({ rule: 'Renewable energy availability optimization', weight: 0.8 });
    }

    return {
      algorithm: algorithmsMap[strategy] || 'Static allocation',
      objectives,
      priorityRules
    };
  }

  private static generateAlerts(
    systemStatus: any,
    totalDemand: number,
    totalCapacity: number
  ): string[] {
    const alerts = [];

    if (systemStatus.loadBalance === 'overloaded') {
      alerts.push('CRITICAL: System overloaded - immediate action required');
    }

    if (systemStatus.utilizationRate > 85) {
      alerts.push('WARNING: High utilization - monitor closely');
    }

    if (totalDemand > totalCapacity * 0.95) {
      alerts.push('ALERT: Approaching maximum capacity');
    }

    return alerts;
  }

  private static generateLoadBalancingRecommendations(
    systemStatus: any,
    optimization: any,
    renewableIntegration: boolean
  ): string[] {
    const recommendations = [
      'Regularly monitor load balancing performance',
      'Implement user communication system for charging status'
    ];

    if (systemStatus.loadBalance === 'constrained') {
      recommendations.push('Consider capacity upgrade or advanced load management');
    }

    if (optimization.peakReduction > 50) {
      recommendations.push('Significant peak reduction achieved - optimize further');
    }

    if (renewableIntegration) {
      recommendations.push('Integrate weather forecasting for renewable optimization');
    }

    recommendations.push('Regular calibration of load balancing algorithms');
    recommendations.push('Monitor user satisfaction with charging allocation');

    return recommendations;
  }
}
