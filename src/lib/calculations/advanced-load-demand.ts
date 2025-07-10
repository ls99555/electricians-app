/**
 * Advanced Load & Demand Calculations
 * Specialized calculators for lighting, water heating, space heating, and air conditioning
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 (18th Edition Wiring Regulations)
 * - IET Guidance Note 1 - Selection & Erection of Equipment
 * - CIBSE Lighting Guide LG1 - The Industrial Environment
 * - CIBSE Code for Lighting - Artificial lighting of interiors
 * - BS EN 12464-1:2021 - Light and lighting - Lighting of work places
 * - Building Regulations Part L - Conservation of fuel and power
 * - BS 7671 Appendix A - Diversity factors for installations
 * 
 * UK Lighting Standards:
 * - Office spaces: 500 lux (BS EN 12464-1)
 * - Retail spaces: 300-500 lux
 * - Industrial workshops: 200-500 lux
 * - Domestic rooms: 100-300 lux
 * - Emergency lighting: BS 5266-1
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Load assessments must be verified by qualified electrical engineers
 * - Local planning and building control approval may be required
 * - Professional indemnity insurance recommended for all electrical work
 * - Lighting design should consider energy efficiency requirements (Part L)
 */

import type {
  LightingLoadInputs,
  LightingLoadResult,
  LightingRoomType,
  LightingType,
  LightingControlSystem,
  WaterHeatingLoadInputs,
  WaterHeatingLoadResult,
  WaterHeatingMethod,
  WaterHeaterType,
  WaterHeatingUsage,
  SpaceHeatingLoadInputs,
  SpaceHeatingLoadResult,
  SpaceHeatingRoomType,
  SpaceHeatingMethod,
  HeatingControlSystem,
  OccupancySchedule,
  BuildingType,
  AirConditioningLoadInputs,
  AirConditioningLoadResult,
  AirConditioningType,
  AirConditioningRoomType,
  AirConditioningControlSystem,
  TotalInstallationLoadInputs,
  TotalInstallationLoadResult,
  InstallationType
} from '../types/load-demand';

/**
 * Lighting Load Calculator with Diversity
 * Calculate lighting loads with proper diversity factors and lux requirements
 * Reference: BS EN 12464-1:2021 - Light and lighting - Lighting of work places
 */
export class LightingLoadCalculator {
  /**
   * Calculate lighting load with diversity factors
   * @param inputs Lighting load calculation parameters
   * @returns Lighting load calculation results
   */
  static calculate(inputs: LightingLoadInputs): LightingLoadResult {
    const { rooms, lightingType, controlSystem, installationType, diversityFactorOverride } = inputs;

    // Input validation - BS 7671 compliance
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error('At least one room must be specified');
    }

    if (!lightingType || !controlSystem || !installationType) {
      throw new Error('All lighting parameters must be specified');
    }

    // Validate room inputs
    for (const room of rooms) {
      if (!room.name || room.area <= 0 || room.ceilingHeight <= 0) {
        throw new Error(`Invalid room parameters for ${room.name || 'unnamed room'}`);
      }
    }

    let totalConnectedLoad = 0;
    const roomBreakdown = [];

    // Calculate each room's lighting load
    for (const room of rooms) {
      const luxLevel = room.customLuxLevel || this.getRecommendedLuxLevel(room.roomType);
      const utilizationFactor = room.utilizationFactor || this.getUtilizationFactor(room.roomType);
      const maintenanceFactor = room.maintenanceFactor || this.getMaintenanceFactor(lightingType);
      
      // Calculate power per unit area (W/m²)
      const powerPerM2 = this.calculatePowerPerM2(luxLevel, utilizationFactor, maintenanceFactor, lightingType);
      
      // Calculate total connected load for room
      const connectedLoad = room.area * powerPerM2;
      
      // Calculate number of luminaires
      const luminairePower = this.getLuminairePower(lightingType, room.roomType);
      const luminaires = Math.ceil(connectedLoad / luminairePower);
      
      totalConnectedLoad += connectedLoad;
      
      roomBreakdown.push({
        room: room.name,
        area: room.area,
        luxLevel,
        connectedLoad,
        demandLoad: 0, // Will be calculated after diversity
        luminaires,
        powerPerLuminaire: luminairePower
      });
    }

    // Calculate diversity factor
    const diversityFactor = diversityFactorOverride || this.calculateLightingDiversity(
      installationType, 
      controlSystem, 
      totalConnectedLoad
    );

    // Calculate demand load for each room
    const totalDemandLoad = totalConnectedLoad * diversityFactor;
    
    roomBreakdown.forEach(room => {
      room.demandLoad = room.connectedLoad * diversityFactor;
    });

    // Generate recommendations
    const recommendations = this.generateLightingRecommendations(
      totalDemandLoad, 
      lightingType, 
      controlSystem, 
      installationType
    );

    return {
      totalConnectedLoad,
      totalDemandLoad,
      diversityFactor,
      roomBreakdown,
      recommendations,
      regulation: 'BS EN 12464-1:2021 - Light and lighting - Lighting of work places'
    };
  }

  /**
   * Get recommended lux levels for different room types
   * Reference: BS EN 12464-1:2021
   */
  private static getRecommendedLuxLevel(roomType: LightingRoomType): number {
    const luxLevels: Record<LightingRoomType, number> = {
      'living_room': 200,
      'kitchen': 500,
      'bedroom': 150,
      'bathroom': 200,
      'hallway': 100,
      'study': 500,
      'office': 500,
      'meeting_room': 500,
      'warehouse': 200,
      'workshop': 500,
      'retail': 300,
      'classroom': 500,
      'hospital_ward': 300,
      'laboratory': 750,
      'sports_hall': 300,
      'car_park': 75,
      'stairway': 150
    };

    return luxLevels[roomType] || 300;
  }

  /**
   * Get utilization factor for room type
   */
  private static getUtilizationFactor(roomType: LightingRoomType): number {
    const factors: Record<LightingRoomType, number> = {
      'living_room': 0.6,
      'kitchen': 0.7,
      'bedroom': 0.5,
      'bathroom': 0.6,
      'hallway': 0.4,
      'study': 0.7,
      'office': 0.8,
      'meeting_room': 0.7,
      'warehouse': 0.6,
      'workshop': 0.7,
      'retail': 0.8,
      'classroom': 0.8,
      'hospital_ward': 0.7,
      'laboratory': 0.8,
      'sports_hall': 0.7,
      'car_park': 0.5,
      'stairway': 0.4
    };

    return factors[roomType] || 0.6;
  }

  /**
   * Get maintenance factor for lighting type
   */
  private static getMaintenanceFactor(lightingType: LightingType): number {
    const factors: Record<LightingType, number> = {
      'led': 0.9,
      'fluorescent': 0.8,
      'incandescent': 0.9,
      'halogen': 0.85,
      'metal_halide': 0.75,
      'mercury_vapor': 0.7
    };

    return factors[lightingType] || 0.8;
  }

  /**
   * Calculate power per unit area
   */
  private static calculatePowerPerM2(
    luxLevel: number, 
    utilizationFactor: number, 
    maintenanceFactor: number, 
    lightingType: LightingType
  ): number {
    const efficacy = this.getLuminousEfficacy(lightingType);
    
    // Power = Lux × Area / (Efficacy × Utilization Factor × Maintenance Factor)
    const powerPerM2 = luxLevel / (efficacy * utilizationFactor * maintenanceFactor);
    
    return Math.max(powerPerM2, 5); // Minimum 5W/m²
  }

  /**
   * Get luminous efficacy for lighting type (lumens per watt)
   */
  private static getLuminousEfficacy(lightingType: LightingType): number {
    const efficacies: Record<LightingType, number> = {
      'led': 120,
      'fluorescent': 80,
      'incandescent': 15,
      'halogen': 20,
      'metal_halide': 90,
      'mercury_vapor': 50
    };

    return efficacies[lightingType] || 80;
  }

  /**
   * Get typical luminaire power for lighting type and room
   */
  private static getLuminairePower(lightingType: LightingType, roomType: LightingRoomType): number {
    const basePower: Record<LightingType, number> = {
      'led': 18,
      'fluorescent': 36,
      'incandescent': 60,
      'halogen': 50,
      'metal_halide': 150,
      'mercury_vapor': 125
    };

    const roomMultiplier = ['office', 'classroom', 'workshop', 'laboratory'].includes(roomType) ? 1.5 : 1.0;
    
    return basePower[lightingType] * roomMultiplier;
  }

  /**
   * Calculate lighting diversity factor
   * Reference: BS 7671 Appendix A - Diversity factors for lighting
   */
  private static calculateLightingDiversity(
    installationType: InstallationType, 
    controlSystem: LightingControlSystem, 
    totalLoad: number
  ): number {
    let baseDiversity = 0.9; // Default 90% diversity

    // Adjust for installation type
    switch (installationType) {
      case 'domestic':
        baseDiversity = 0.9;
        break;
      case 'commercial':
        baseDiversity = 0.8;
        break;
      case 'industrial':
        baseDiversity = 0.75;
        break;
    }

    // Adjust for control system
    switch (controlSystem) {
      case 'manual':
        baseDiversity *= 1.0;
        break;
      case 'occupancy_sensor':
        baseDiversity *= 0.85;
        break;
      case 'daylight_sensor':
        baseDiversity *= 0.8;
        break;
      case 'time_clock':
        baseDiversity *= 0.9;
        break;
      case 'smart_control':
        baseDiversity *= 0.75;
        break;
    }

    // Adjust for total load (larger installations have lower diversity)
    if (totalLoad > 50000) {
      baseDiversity *= 0.95;
    } else if (totalLoad > 100000) {
      baseDiversity *= 0.9;
    }

    return Math.max(baseDiversity, 0.6); // Minimum 60% diversity
  }

  /**
   * Generate lighting recommendations
   */
  private static generateLightingRecommendations(
    totalDemandLoad: number, 
    lightingType: LightingType, 
    controlSystem: LightingControlSystem, 
    installationType: InstallationType
  ): string[] {
    const recommendations: string[] = [];
    const current = totalDemandLoad / 230; // Single phase current

    recommendations.push(`Total lighting demand: ${(totalDemandLoad / 1000).toFixed(1)}kW (${current.toFixed(1)}A)`);

    // Energy efficiency recommendations
    if (lightingType !== 'led') {
      recommendations.push('Consider LED lighting for improved energy efficiency and compliance with Part L regulations');
    }

    // Control system recommendations
    if (controlSystem === 'manual' && installationType !== 'domestic') {
      recommendations.push('Consider automatic controls for energy savings and Building Regulations Part L compliance');
    }

    // Circuit protection recommendations
    if (current > 16) {
      recommendations.push('Multiple lighting circuits recommended for load distribution');
    }

    // Emergency lighting reminder
    if (installationType !== 'domestic') {
      recommendations.push('Emergency lighting requirements must be assessed separately (BS 5266-1)');
    }

    // Energy efficiency
    if (totalDemandLoad > 10000) {
      recommendations.push('Consider energy-efficient lighting design to meet Building Regulations Part L');
    }

    return recommendations;
  }
}

/**
 * Water Heating Load Assessment
 * Calculate water heating loads with proper diversity factors and BS 7671 compliance
 * Reference: BS 7671 Appendix A - Diversity factors for water heating
 */
export class WaterHeatingLoadAssessment {
  /**
   * Calculate water heating load with diversity factors
   * @param inputs Water heating load calculation parameters
   * @returns Water heating load calculation results
   */
  static calculate(inputs: WaterHeatingLoadInputs): WaterHeatingLoadResult {
    const { 
      installationType, 
      heatingMethod, 
      heaterDetails, 
      usage, 
      peakDemandTime, 
      recoveryTime, 
      diversityFactorOverride 
    } = inputs;

    // Input validation - BS 7671 compliance
    if (!installationType || !heatingMethod || !usage) {
      throw new Error('All water heating parameters must be specified');
    }

    if (!Array.isArray(heaterDetails) || heaterDetails.length === 0) {
      throw new Error('At least one water heater must be specified');
    }

    if (peakDemandTime <= 0 || recoveryTime <= 0) {
      throw new Error('Peak demand time and recovery time must be positive');
    }

    // Validate heater details
    for (const heater of heaterDetails) {
      if (!heater.type || heater.capacity <= 0 || heater.power <= 0 || heater.quantity <= 0) {
        throw new Error(`Invalid heater parameters for ${heater.type || 'unnamed heater'}`);
      }
    }

    let totalConnectedLoad = 0;
    const heaterBreakdown = [];

    // Calculate each heater's load
    for (const heater of heaterDetails) {
      const simultaneousFactor = heater.simultaneousFactor || 
        this.getSimultaneousUseFactor(heater.type, heater.quantity, usage);
      
      const connectedLoad = heater.power * heater.quantity;
      const demandLoad = connectedLoad * simultaneousFactor;
      
      totalConnectedLoad += connectedLoad;
      
      heaterBreakdown.push({
        type: heater.type,
        capacity: heater.capacity,
        power: heater.power,
        quantity: heater.quantity,
        simultaneousFactor,
        demandLoad
      });
    }

    // Calculate diversity factor
    const diversityFactor = diversityFactorOverride || this.calculateWaterHeatingDiversity(
      installationType, 
      heatingMethod, 
      usage, 
      totalConnectedLoad
    );

    // Calculate total demand load
    const totalDemandLoad = totalConnectedLoad * diversityFactor;

    // Update heater breakdown with diversity
    heaterBreakdown.forEach(heater => {
      heater.demandLoad = heater.demandLoad * diversityFactor;
    });

    // Calculate peak demand current
    const peakDemandCurrent = totalDemandLoad / 230;

    // Generate recommendations
    const recommendations = this.generateWaterHeatingRecommendations(
      totalDemandLoad, 
      heatingMethod, 
      usage, 
      installationType,
      peakDemandCurrent
    );

    return {
      totalConnectedLoad,
      totalDemandLoad,
      diversityFactor,
      heaterBreakdown,
      peakDemandCurrent,
      recommendations,
      regulation: 'BS 7671 Appendix A - Diversity factors for water heating'
    };
  }

  /**
   * Get simultaneous use factor for water heaters
   * Reference: BS 7671 Appendix A
   */
  private static getSimultaneousUseFactor(
    heaterType: WaterHeaterType, 
    quantity: number, 
    usage: WaterHeatingUsage
  ): number {
    const baseFactors: Record<WaterHeaterType, number> = {
      'electric_immersion': 1.0,
      'gas_storage': 0.9,
      'electric_storage': 1.0,
      'instantaneous_electric': 0.8,
      'combination_boiler': 0.7,
      'solar_thermal': 0.6,
      'heat_pump_water': 0.8,
      'thermal_store': 0.9
    };

    let factor = baseFactors[heaterType] || 1.0;

    // Adjust for usage pattern
    switch (usage) {
      case 'domestic_low':
        factor *= 0.8;
        break;
      case 'domestic_medium':
        factor *= 0.9;
        break;
      case 'domestic_high':
        factor *= 1.0;
        break;
      case 'commercial_office':
        factor *= 0.7;
        break;
      case 'commercial_restaurant':
        factor *= 0.95;
        break;
      case 'industrial':
        factor *= 0.9;
        break;
      case 'healthcare':
        factor *= 0.9;
        break;
      case 'hotel':
        factor *= 0.8;
        break;
    }

    // Adjust for quantity (more units = lower simultaneity)
    if (quantity > 1) {
      factor *= (1 - (quantity - 1) * 0.1);
    }

    return Math.max(factor, 0.5); // Minimum 50% simultaneity
  }

  /**
   * Calculate water heating diversity factor
   * Reference: BS 7671 Appendix A - Water heating diversity factors
   */
  private static calculateWaterHeatingDiversity(
    installationType: InstallationType, 
    heatingMethod: WaterHeatingMethod, 
    usage: WaterHeatingUsage, 
    totalLoad: number
  ): number {
    let baseDiversity = 1.0; // Default 100% diversity for water heating

    // Adjust for installation type
    switch (installationType) {
      case 'domestic':
        baseDiversity = 1.0; // BS 7671 - 100% for domestic
        break;
      case 'commercial':
        baseDiversity = 0.8;
        break;
      case 'industrial':
        baseDiversity = 0.75;
        break;
    }

    // Adjust for heating method
    switch (heatingMethod) {
      case 'storage':
        baseDiversity *= 0.9;
        break;
      case 'instantaneous':
        baseDiversity *= 1.0;
        break;
      case 'combination':
        baseDiversity *= 0.8;
        break;
      case 'solar_thermal':
        baseDiversity *= 0.7;
        break;
      case 'heat_pump':
        baseDiversity *= 0.85;
        break;
    }

    // Adjust for usage pattern
    switch (usage) {
      case 'domestic_low':
        baseDiversity *= 0.8;
        break;
      case 'domestic_medium':
        baseDiversity *= 0.9;
        break;
      case 'domestic_high':
        baseDiversity *= 1.0;
        break;
      case 'commercial_office':
        baseDiversity *= 0.7;
        break;
      case 'commercial_restaurant':
        baseDiversity *= 0.95;
        break;
      case 'industrial':
        baseDiversity *= 0.9;
        break;
      case 'healthcare':
        baseDiversity *= 0.9;
        break;
      case 'hotel':
        baseDiversity *= 0.8;
        break;
    }

    return Math.max(baseDiversity, 0.6); // Minimum 60% diversity
  }

  /**
   * Generate water heating recommendations
   */
  private static generateWaterHeatingRecommendations(
    totalDemandLoad: number, 
    heatingMethod: WaterHeatingMethod, 
    usage: WaterHeatingUsage, 
    installationType: InstallationType,
    peakDemandCurrent: number
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Total water heating demand: ${(totalDemandLoad / 1000).toFixed(1)}kW (${peakDemandCurrent.toFixed(1)}A)`);

    // High load warnings
    if (peakDemandCurrent > 32) {
      recommendations.push('High current demand - consider three-phase supply or load management');
    }

    // Energy efficiency recommendations
    if (heatingMethod === 'storage' && usage !== 'domestic_low') {
      recommendations.push('Consider timer controls for energy efficiency and load management');
    }

    // Circuit protection
    if (peakDemandCurrent > 16) {
      recommendations.push('Dedicated circuit required for water heating loads');
    }

    // Installation-specific recommendations
    if (installationType === 'domestic' && totalDemandLoad > 12000) {
      recommendations.push('Consider Economy 7 tariff for cost-effective water heating');
    }

    if (installationType === 'commercial' && heatingMethod === 'instantaneous') {
      recommendations.push('Consider load balancing for multiple instantaneous units');
    }

    // Safety recommendations
    recommendations.push('Thermostatic mixing valves recommended for safety (BS 6700)');
    recommendations.push('Consider immersion heater thermostats for temperature control');

    return recommendations;
  }
}

/**
 * Space Heating Load Calculator
 * Calculate space heating loads with proper diversity and control factors
 * Reference: BS 7671 Appendix A - Diversity factors for space heating
 */
export class SpaceHeatingLoadCalculator {
  /**
   * Calculate space heating load with diversity factors
   * @param inputs Space heating load calculation parameters
   * @returns Space heating load calculation results
   */
  static calculate(inputs: SpaceHeatingLoadInputs): SpaceHeatingLoadResult {
    const { 
      rooms, 
      buildingType, 
      controlSystem, 
      installationType, 
      simultaneityFactor, 
      diversityFactorOverride 
    } = inputs;

    // Input validation - BS 7671 compliance
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error('At least one room must be specified');
    }

    if (!buildingType || !controlSystem || !installationType) {
      throw new Error('All space heating parameters must be specified');
    }

    // Validate room inputs
    for (const room of rooms) {
      if (!room.name || room.area <= 0 || room.volume <= 0 || room.power <= 0) {
        throw new Error(`Invalid room parameters for ${room.name || 'unnamed room'}`);
      }
    }

    let totalConnectedLoad = 0;
    const roomBreakdown = [];

    // Calculate each room's heating load
    for (const room of rooms) {
      const controlFactor = this.getControlFactor(
        room.thermostatControl, 
        room.zoneControl, 
        room.occupancySchedule, 
        controlSystem
      );
      
      const demandLoad = room.power * controlFactor;
      totalConnectedLoad += room.power;
      
      roomBreakdown.push({
        room: room.name,
        area: room.area,
        power: room.power,
        method: room.heatingMethod,
        demandLoad,
        controlFactor
      });
    }

    // Calculate simultaneity factor
    const actualSimultaneityFactor = simultaneityFactor || this.calculateSimultaneityFactor(
      buildingType, 
      controlSystem, 
      rooms.length
    );

    // Calculate diversity factor
    const diversityFactor = diversityFactorOverride || this.calculateSpaceHeatingDiversity(
      installationType, 
      buildingType, 
      controlSystem, 
      totalConnectedLoad
    );

    // Calculate total demand load
    const totalDemandLoad = totalConnectedLoad * actualSimultaneityFactor * diversityFactor;

    // Update room breakdown with final demand
    roomBreakdown.forEach(room => {
      room.demandLoad = room.demandLoad * actualSimultaneityFactor * diversityFactor;
    });

    // Calculate peak demand current
    const peakDemandCurrent = totalDemandLoad / 230;

    // Generate recommendations
    const recommendations = this.generateSpaceHeatingRecommendations(
      totalDemandLoad, 
      buildingType, 
      controlSystem, 
      installationType,
      peakDemandCurrent
    );

    return {
      totalConnectedLoad,
      totalDemandLoad,
      diversityFactor,
      simultaneityFactor: actualSimultaneityFactor,
      roomBreakdown,
      peakDemandCurrent,
      recommendations,
      regulation: 'BS 7671 Appendix A - Diversity factors for space heating'
    };
  }

  /**
   * Get control factor for room heating
   */
  private static getControlFactor(
    thermostatControl: boolean, 
    zoneControl: boolean, 
    occupancySchedule: OccupancySchedule, 
    controlSystem: HeatingControlSystem
  ): number {
    let factor = 1.0;

    // Thermostat control
    if (thermostatControl) {
      factor *= 0.9;
    }

    // Zone control
    if (zoneControl) {
      factor *= 0.85;
    }

    // Occupancy schedule
    switch (occupancySchedule) {
      case 'continuous':
        factor *= 1.0;
        break;
      case 'office_hours':
        factor *= 0.7;
        break;
      case 'evening_only':
        factor *= 0.6;
        break;
      case 'intermittent':
        factor *= 0.5;
        break;
      case 'seasonal':
        factor *= 0.8;
        break;
    }

    // Control system
    switch (controlSystem) {
      case 'manual':
        factor *= 1.0;
        break;
      case 'thermostat':
        factor *= 0.9;
        break;
      case 'programmable':
        factor *= 0.8;
        break;
      case 'smart_control':
        factor *= 0.75;
        break;
      case 'zone_control':
        factor *= 0.8;
        break;
      case 'bms':
        factor *= 0.7;
        break;
    }

    return Math.max(factor, 0.4); // Minimum 40% control factor
  }

  /**
   * Calculate simultaneity factor for space heating
   */
  private static calculateSimultaneityFactor(
    buildingType: BuildingType, 
    controlSystem: HeatingControlSystem, 
    roomCount: number
  ): number {
    let factor = 1.0;

    // Building type factor
    switch (buildingType) {
      case 'residential':
        factor = 0.8;
        break;
      case 'office':
        factor = 0.7;
        break;
      case 'retail':
        factor = 0.85;
        break;
      case 'industrial':
        factor = 0.9;
        break;
      case 'healthcare':
        factor = 0.9;
        break;
      case 'educational':
        factor = 0.75;
        break;
    }

    // Control system factor
    switch (controlSystem) {
      case 'manual':
        factor *= 1.0;
        break;
      case 'thermostat':
        factor *= 0.9;
        break;
      case 'programmable':
        factor *= 0.8;
        break;
      case 'smart_control':
        factor *= 0.75;
        break;
      case 'zone_control':
        factor *= 0.8;
        break;
      case 'bms':
        factor *= 0.7;
        break;
    }

    // Room count factor (more rooms = lower simultaneity)
    if (roomCount > 10) {
      factor *= 0.9;
    } else if (roomCount > 20) {
      factor *= 0.85;
    }

    return Math.max(factor, 0.5); // Minimum 50% simultaneity
  }

  /**
   * Calculate space heating diversity factor
   * Reference: BS 7671 Appendix A - Space heating diversity
   */
  private static calculateSpaceHeatingDiversity(
    installationType: InstallationType, 
    buildingType: BuildingType, 
    controlSystem: HeatingControlSystem, 
    totalLoad: number
  ): number {
    let baseDiversity = 1.0; // Default 100% diversity

    // Adjust for installation type
    switch (installationType) {
      case 'domestic':
        baseDiversity = 1.0; // BS 7671 - 100% for domestic heating
        break;
      case 'commercial':
        baseDiversity = 0.8;
        break;
      case 'industrial':
        baseDiversity = 0.75;
        break;
    }

    // Adjust for building type
    switch (buildingType) {
      case 'residential':
        baseDiversity *= 1.0;
        break;
      case 'office':
        baseDiversity *= 0.8;
        break;
      case 'retail':
        baseDiversity *= 0.85;
        break;
      case 'industrial':
        baseDiversity *= 0.9;
        break;
      case 'healthcare':
        baseDiversity *= 0.95;
        break;
      case 'educational':
        baseDiversity *= 0.8;
        break;
    }

    // Adjust for control system
    switch (controlSystem) {
      case 'manual':
        baseDiversity *= 1.0;
        break;
      case 'thermostat':
        baseDiversity *= 0.9;
        break;
      case 'programmable':
        baseDiversity *= 0.8;
        break;
      case 'smart_control':
        baseDiversity *= 0.75;
        break;
      case 'zone_control':
        baseDiversity *= 0.8;
        break;
      case 'bms':
        baseDiversity *= 0.7;
        break;
    }

    return Math.max(baseDiversity, 0.6); // Minimum 60% diversity
  }

  /**
   * Generate space heating recommendations
   */
  private static generateSpaceHeatingRecommendations(
    totalDemandLoad: number, 
    buildingType: BuildingType, 
    controlSystem: HeatingControlSystem, 
    installationType: InstallationType,
    peakDemandCurrent: number
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Total space heating demand: ${(totalDemandLoad / 1000).toFixed(1)}kW (${peakDemandCurrent.toFixed(1)}A)`);

    // High load warnings
    if (peakDemandCurrent > 32) {
      recommendations.push('High current demand - consider three-phase supply or load management');
    }

    // Energy efficiency recommendations
    if (controlSystem === 'manual' && buildingType !== 'residential') {
      recommendations.push('Consider programmable controls for energy efficiency');
    }

    // Circuit protection
    if (peakDemandCurrent > 16) {
      recommendations.push('Multiple circuits recommended for space heating distribution');
    }

    // Installation-specific recommendations
    if (installationType === 'domestic' && totalDemandLoad > 15000) {
      recommendations.push('Consider Economy 7 tariff for storage heating systems');
    }

    if (buildingType === 'office' && controlSystem !== 'bms') {
      recommendations.push('Consider Building Management System for optimal control');
    }

    // Safety and efficiency recommendations
    recommendations.push('Consider thermostatic controls for individual room temperature control');
    recommendations.push('Ensure adequate insulation for heating efficiency');

    // Load management
    if (totalDemandLoad > 20000) {
      recommendations.push('Consider load shedding or time-of-use controls');
    }

    return recommendations;
  }
}

/**
 * Air Conditioning Load Assessment
 * Calculate air conditioning loads with proper diversity factors
 * Reference: BS 7671 Appendix A - Diversity factors for air conditioning
 */
export class AirConditioningLoadAssessment {
  /**
   * Calculate air conditioning load with diversity factors
   * @param inputs Air conditioning load calculation parameters
   * @returns Air conditioning load calculation results
   */
  static calculate(inputs: AirConditioningLoadInputs): AirConditioningLoadResult {
    const { 
      systems, 
      buildingType, 
      controlSystem, 
      installationType, 
      diversityFactorOverride 
    } = inputs;

    // Input validation - BS 7671 compliance
    if (!Array.isArray(systems) || systems.length === 0) {
      throw new Error('At least one air conditioning system must be specified');
    }

    if (!buildingType || !controlSystem || !installationType) {
      throw new Error('All air conditioning parameters must be specified');
    }

    // Validate system inputs
    for (const system of systems) {
      if (!system.name || !system.type || system.coolingCapacity <= 0 || system.area <= 0 || system.operatingHours <= 0) {
        throw new Error(`Invalid system parameters for ${system.name || 'unnamed system'}`);
      }
    }

    let totalConnectedLoad = 0;
    const systemBreakdown = [];

    // Calculate each system's load
    for (const system of systems) {
      const simultaneousFactor = system.simultaneousFactor || 
        this.getSimultaneousFactor(system.type, system.operatingHours, system.roomType);
      
      const heatingCapacity = system.heatingCapacity || 0;
      const systemLoad = Math.max(system.coolingCapacity, heatingCapacity);
      const demandLoad = systemLoad * simultaneousFactor;
      
      totalConnectedLoad += systemLoad;
      
      systemBreakdown.push({
        system: system.name,
        type: system.type,
        coolingCapacity: system.coolingCapacity,
        heatingCapacity,
        area: system.area,
        demandLoad,
        simultaneousFactor
      });
    }

    // Calculate diversity factor
    const diversityFactor = diversityFactorOverride || this.calculateACDiversity(
      installationType, 
      buildingType, 
      controlSystem, 
      totalConnectedLoad
    );

    // Calculate total demand load
    const totalDemandLoad = totalConnectedLoad * diversityFactor;

    // Update system breakdown with diversity
    systemBreakdown.forEach(system => {
      system.demandLoad = system.demandLoad * diversityFactor;
    });

    // Calculate peak demand current
    const peakDemandCurrent = totalDemandLoad / 230;

    // Generate recommendations
    const recommendations = this.generateACRecommendations(
      totalDemandLoad, 
      buildingType, 
      controlSystem, 
      installationType,
      peakDemandCurrent
    );

    return {
      totalConnectedLoad,
      totalDemandLoad,
      diversityFactor,
      systemBreakdown,
      peakDemandCurrent,
      recommendations,
      regulation: 'BS 7671 Appendix A - Diversity factors for air conditioning'
    };
  }

  /**
   * Get simultaneous factor for air conditioning systems
   */
  private static getSimultaneousFactor(
    systemType: AirConditioningType, 
    operatingHours: number, 
    roomType: AirConditioningRoomType
  ): number {
    let factor = 1.0;

    // System type factor
    switch (systemType) {
      case 'split_system':
        factor = 0.8;
        break;
      case 'multi_split':
        factor = 0.75;
        break;
      case 'vrv_vrf':
        factor = 0.7;
        break;
      case 'central_system':
        factor = 0.9;
        break;
      case 'portable':
        factor = 0.6;
        break;
      case 'window_unit':
        factor = 0.7;
        break;
      case 'cassette':
        factor = 0.8;
        break;
      case 'ducted':
        factor = 0.85;
        break;
      case 'heat_pump':
        factor = 0.8;
        break;
      case 'chiller':
        factor = 0.9;
        break;
    }

    // Operating hours factor
    if (operatingHours <= 8) {
      factor *= 1.0;
    } else if (operatingHours <= 12) {
      factor *= 0.9;
    } else if (operatingHours <= 16) {
      factor *= 0.8;
    } else {
      factor *= 0.7;
    }

    // Room type factor
    switch (roomType) {
      case 'server_room':
        factor *= 1.0; // Continuous operation
        break;
      case 'kitchen':
        factor *= 0.9;
        break;
      case 'office':
        factor *= 0.8;
        break;
      case 'meeting_room':
        factor *= 0.7;
        break;
      case 'retail':
        factor *= 0.85;
        break;
      case 'restaurant':
        factor *= 0.9;
        break;
      case 'laboratory':
        factor *= 0.95;
        break;
      case 'hospital_ward':
        factor *= 0.9;
        break;
      case 'classroom':
        factor *= 0.7;
        break;
      case 'sports_hall':
        factor *= 0.8;
        break;
      case 'warehouse':
        factor *= 0.6;
        break;
      case 'workshop':
        factor *= 0.7;
        break;
      case 'bedroom':
        factor *= 0.6;
        break;
      case 'living_room':
        factor *= 0.7;
        break;
      case 'reception':
        factor *= 0.8;
        break;
    }

    return Math.max(factor, 0.4); // Minimum 40% simultaneity
  }

  /**
   * Calculate air conditioning diversity factor
   * Reference: BS 7671 Appendix A - Air conditioning diversity
   */
  private static calculateACDiversity(
    installationType: InstallationType, 
    buildingType: BuildingType, 
    controlSystem: AirConditioningControlSystem, 
    totalLoad: number
  ): number {
    let baseDiversity = 0.8; // Default 80% diversity for air conditioning

    // Adjust for installation type
    switch (installationType) {
      case 'domestic':
        baseDiversity = 0.8;
        break;
      case 'commercial':
        baseDiversity = 0.75;
        break;
      case 'industrial':
        baseDiversity = 0.7;
        break;
    }

    // Adjust for building type
    switch (buildingType) {
      case 'residential':
        baseDiversity *= 0.8;
        break;
      case 'office':
        baseDiversity *= 0.85;
        break;
      case 'retail':
        baseDiversity *= 0.9;
        break;
      case 'industrial':
        baseDiversity *= 0.75;
        break;
      case 'healthcare':
        baseDiversity *= 0.95;
        break;
      case 'educational':
        baseDiversity *= 0.8;
        break;
    }

    // Adjust for control system
    switch (controlSystem) {
      case 'manual':
        baseDiversity *= 1.0;
        break;
      case 'thermostat':
        baseDiversity *= 0.9;
        break;
      case 'programmable':
        baseDiversity *= 0.85;
        break;
      case 'smart_control':
        baseDiversity *= 0.8;
        break;
      case 'zone_control':
        baseDiversity *= 0.85;
        break;
      case 'bms':
        baseDiversity *= 0.75;
        break;
    }

    // Adjust for total load (larger systems have higher diversity)
    if (totalLoad > 50000) {
      baseDiversity *= 0.9;
    } else if (totalLoad > 100000) {
      baseDiversity *= 0.85;
    }

    return Math.max(baseDiversity, 0.5); // Minimum 50% diversity
  }

  /**
   * Generate air conditioning recommendations
   */
  private static generateACRecommendations(
    totalDemandLoad: number, 
    buildingType: BuildingType, 
    controlSystem: AirConditioningControlSystem, 
    installationType: InstallationType,
    peakDemandCurrent: number
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Total air conditioning demand: ${(totalDemandLoad / 1000).toFixed(1)}kW (${peakDemandCurrent.toFixed(1)}A)`);

    // High load warnings
    if (peakDemandCurrent > 32) {
      recommendations.push('High current demand - three-phase supply recommended');
    }

    // Energy efficiency recommendations
    if (controlSystem === 'manual' && buildingType !== 'residential') {
      recommendations.push('Consider programmable controls for energy efficiency');
    }

    // Circuit protection
    if (peakDemandCurrent > 16) {
      recommendations.push('Dedicated circuits recommended for air conditioning systems');
    }

    // Load management
    if (totalDemandLoad > 20000) {
      recommendations.push('Consider load shedding or demand limiting controls');
    }

    // Installation-specific recommendations
    if (installationType === 'commercial' && controlSystem !== 'bms') {
      recommendations.push('Consider Building Management System for optimal control');
    }

    // System recommendations
    if (buildingType === 'office' && controlSystem === 'manual') {
      recommendations.push('Consider occupancy sensors for energy savings');
    }

    // Safety and efficiency recommendations
    recommendations.push('Ensure adequate electrical isolation for maintenance');
    recommendations.push('Consider energy-efficient inverter-driven systems');

    return recommendations;
  }
}

/**
 * Total Installation Load Calculator
 * Calculate total installation load combining all electrical systems
 * Reference: BS 7671 Appendix A - Overall installation diversity
 */
export class TotalInstallationLoadCalculator {
  /**
   * Calculate total installation load
   * @param inputs Total installation load calculation parameters
   * @returns Total installation load calculation results
   */
  static calculate(inputs: TotalInstallationLoadInputs): TotalInstallationLoadResult {
    const { 
      lighting, 
      heating, 
      waterHeating, 
      airConditioning, 
      socketOutlets, 
      cooking, 
      specialLoads, 
      installationType 
    } = inputs;

    // Input validation
    if (!installationType) {
      throw new Error('Installation type must be specified');
    }

    if (socketOutlets < 0) {
      throw new Error('Socket outlets count must be non-negative');
    }

    if (!Array.isArray(cooking) || !Array.isArray(specialLoads)) {
      throw new Error('Cooking and special loads must be arrays');
    }

    // Calculate individual system loads
    const lightingResult = LightingLoadCalculator.calculate(lighting);
    const heatingResult = SpaceHeatingLoadCalculator.calculate(heating);
    const waterHeatingResult = WaterHeatingLoadAssessment.calculate(waterHeating);
    const airConditioningResult = AirConditioningLoadAssessment.calculate(airConditioning);

    // Calculate socket outlet load
    const socketLoad = this.calculateSocketOutletLoad(socketOutlets, installationType);

    // Calculate cooking load
    const cookingLoad = this.calculateCookingLoad(cooking);

    // Calculate special loads
    const specialLoad = this.calculateSpecialLoads(specialLoads);

    // Create load breakdown
    const loadBreakdown = [
      {
        category: 'Lighting',
        connectedLoad: lightingResult.totalConnectedLoad,
        demandLoad: lightingResult.totalDemandLoad,
        diversityFactor: lightingResult.diversityFactor
      },
      {
        category: 'Space Heating',
        connectedLoad: heatingResult.totalConnectedLoad,
        demandLoad: heatingResult.totalDemandLoad,
        diversityFactor: heatingResult.diversityFactor
      },
      {
        category: 'Water Heating',
        connectedLoad: waterHeatingResult.totalConnectedLoad,
        demandLoad: waterHeatingResult.totalDemandLoad,
        diversityFactor: waterHeatingResult.diversityFactor
      },
      {
        category: 'Air Conditioning',
        connectedLoad: airConditioningResult.totalConnectedLoad,
        demandLoad: airConditioningResult.totalDemandLoad,
        diversityFactor: airConditioningResult.diversityFactor
      },
      {
        category: 'Socket Outlets',
        connectedLoad: socketLoad.connected,
        demandLoad: socketLoad.demand,
        diversityFactor: socketLoad.diversity
      },
      {
        category: 'Cooking',
        connectedLoad: cookingLoad.connected,
        demandLoad: cookingLoad.demand,
        diversityFactor: cookingLoad.diversity
      },
      {
        category: 'Special Loads',
        connectedLoad: specialLoad.connected,
        demandLoad: specialLoad.demand,
        diversityFactor: specialLoad.diversity
      }
    ];

    // Calculate totals
    const totalConnectedLoad = loadBreakdown.reduce((sum, item) => sum + item.connectedLoad, 0);
    const totalDemandLoad = loadBreakdown.reduce((sum, item) => sum + item.demandLoad, 0);
    const overallDiversityFactor = totalConnectedLoad > 0 ? totalDemandLoad / totalConnectedLoad : 0;

    // Calculate current breakdown
    const currentBreakdown = {
      singlePhase: totalDemandLoad / 230,
      threePhase: totalDemandLoad / (230 * Math.sqrt(3))
    };

    // Generate recommendations
    const recommendations = this.generateTotalInstallationRecommendations(
      totalDemandLoad, 
      currentBreakdown, 
      installationType,
      loadBreakdown
    );

    return {
      totalConnectedLoad,
      totalDemandLoad,
      overallDiversityFactor,
      loadBreakdown,
      currentBreakdown,
      recommendations,
      regulation: 'BS 7671 Appendix A - Overall installation diversity factors'
    };
  }

  /**
   * Calculate socket outlet load
   */
  private static calculateSocketOutletLoad(socketOutlets: number, installationType: InstallationType) {
    let connected = socketOutlets * 100; // Assume 100W per socket
    let demand = 0;
    
    if (installationType === 'domestic') {
      // BS 7671 Appendix A domestic socket diversity
      if (socketOutlets <= 10) {
        demand = socketOutlets * 100;
      } else if (socketOutlets <= 20) {
        demand = 1000 + (socketOutlets - 10) * 50;
      } else {
        demand = 1500 + (socketOutlets - 20) * 25;
      }
    } else {
      // Commercial/industrial
      demand = socketOutlets * 80;
    }

    return {
      connected,
      demand,
      diversity: connected > 0 ? demand / connected : 0
    };
  }

  /**
   * Calculate cooking load
   */
  private static calculateCookingLoad(cooking: Array<{ appliance: string; rating: number; quantity: number; diversityFactor?: number }>) {
    let connected = 0;
    let demand = 0;

    for (const item of cooking) {
      const itemConnected = item.rating * item.quantity;
      const itemDemand = itemConnected * (item.diversityFactor || this.getCookingDiversityFactor(item.rating));
      
      connected += itemConnected;
      demand += itemDemand;
    }

    return {
      connected,
      demand,
      diversity: connected > 0 ? demand / connected : 0
    };
  }

  /**
   * Get cooking diversity factor
   */
  private static getCookingDiversityFactor(rating: number): number {
    // BS 7671 Appendix A cooking diversity
    if (rating <= 10000) {
      return 1.0;
    } else if (rating <= 60000) {
      return 0.8;
    } else {
      return 0.6;
    }
  }

  /**
   * Calculate special loads
   */
  private static calculateSpecialLoads(specialLoads: Array<{ description: string; power: number; diversityFactor?: number }>) {
    let connected = 0;
    let demand = 0;

    for (const load of specialLoads) {
      const loadDemand = load.power * (load.diversityFactor || 1.0);
      
      connected += load.power;
      demand += loadDemand;
    }

    return {
      connected,
      demand,
      diversity: connected > 0 ? demand / connected : 0
    };
  }

  /**
   * Generate total installation recommendations
   */
  private static generateTotalInstallationRecommendations(
    totalDemandLoad: number, 
    currentBreakdown: { singlePhase: number; threePhase: number }, 
    installationType: InstallationType,
    loadBreakdown: Array<{ category: string; connectedLoad: number; demandLoad: number; diversityFactor: number }>
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Total installation demand: ${(totalDemandLoad / 1000).toFixed(1)}kW`);
    recommendations.push(`Single-phase current: ${currentBreakdown.singlePhase.toFixed(1)}A`);
    recommendations.push(`Three-phase current: ${currentBreakdown.threePhase.toFixed(1)}A per phase`);

    // Supply recommendations
    if (currentBreakdown.singlePhase > 100) {
      recommendations.push('Three-phase supply recommended for high current demand');
    } else if (currentBreakdown.singlePhase > 80) {
      recommendations.push('100A single-phase supply recommended');
    } else if (currentBreakdown.singlePhase > 60) {
      recommendations.push('80A single-phase supply may be adequate');
    }

    // DNO approval
    if (installationType === 'domestic' && totalDemandLoad > 23000) {
      recommendations.push('DNO approval may be required for high demand domestic installation');
    }

    // Load management
    if (totalDemandLoad > 50000) {
      recommendations.push('Consider load management system for peak demand control');
    }

    // Energy efficiency
    const highLoadCategories = loadBreakdown.filter(item => item.demandLoad > 10000);
    if (highLoadCategories.length > 0) {
      recommendations.push('Consider energy-efficient systems for high-load categories');
    }

    // Circuit distribution
    recommendations.push('Ensure adequate circuit distribution for all load categories');
    recommendations.push('Consider sub-distribution boards for large installations');

    // Monitoring
    if (totalDemandLoad > 30000) {
      recommendations.push('Consider energy monitoring system for load management');
    }

    return recommendations;
  }
}
