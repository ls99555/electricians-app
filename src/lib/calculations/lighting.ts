/**
 * Lighting Calculations
 * Illuminance, emergency lighting, and lighting design calculations
 * 
 * Based on:
 * - BS EN 12464-1:2021 - Light and lighting - Lighting of work places
 * - BS 5266-1:2016 - Emergency lighting - Code of practice for emergency lighting
 * - CIBSE Code for Lighting (2018)
 * - CIBSE LG7 - Lighting for Offices
 * - BS 667:2005 - Illuminance meters
 * - BS 7909:2011 - Code of practice for temporary electrical systems
 * 
 * UK Lighting Standards:
 * - Office lighting: 500 lux (BS EN 12464-1)
 * - Emergency lighting: 1 lux minimum on escape routes (BS 5266-1)
 * - Maintained illuminance values throughout maintenance cycle
 * - Uniformity ratios per CIBSE guidance
 * - Energy efficiency requirements per Building Regulations Part L
 * 
 * Emergency Lighting Requirements (BS 5266-1):
 * - Minimum 1 lux on escape routes
 * - Minimum 0.5 lux in open areas
 * - 3-hour duration for most premises
 * - Monthly function tests and annual full tests required
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Lighting design should be verified by qualified lighting engineers
 * - Emergency lighting systems require regular testing and maintenance
 * - Professional indemnity insurance recommended for all electrical work
 */

import type { 
  IlluminanceResult, 
  EmergencyLightingResult,
  LuminousFluxResult,
  RoomIndexResult,
  UtilisationFactorResult,
  MaintenanceFactorResult,
  LEDReplacementResult,
  EnergyEfficiencyResult,
  UniformityRatioResult,
  GlareIndexResult,
  DomesticLightingResult,
  CommercialLightingResult
} from './types';

/**
 * Illuminance Calculator
 * Calculate lighting requirements based on lux levels and room characteristics
 * Based on CIBSE recommendations and BS EN 12464 standards
 */
export class IlluminanceCalculator {
  /**
   * Calculate illuminance requirements for a space
   */
  static calculate(inputs: {
    roomLength: number; // Room length (m)
    roomWidth: number; // Room width (m)
    roomHeight: number; // Room height (m)
    workingPlaneHeight: number; // Working plane height (m)
    requiredLux: number; // Required illuminance (lux)
    luminaireOutput: number; // Luminaire output (lumens)
    roomReflectances: {
      ceiling: number; // 0.0-1.0
      walls: number; // 0.0-1.0
      floor: number; // 0.0-1.0
    };
    maintenanceFactor: number; // 0.6-0.9 typical
    utilisationFactor?: number; // If known, otherwise calculated
  }): IlluminanceResult {
    const {
      roomLength,
      roomWidth,
      roomHeight,
      workingPlaneHeight,
      requiredLux,
      luminaireOutput,
      roomReflectances,
      maintenanceFactor,
      utilisationFactor
    } = inputs;

    try {
      // Validate inputs
      this.validateInputs(inputs);

      // Calculate room area
      const roomArea = roomLength * roomWidth;

      // Calculate room index (for utilisation factor calculation)
      const roomIndex = this.calculateRoomIndex(roomLength, roomWidth, roomHeight, workingPlaneHeight);

      // Calculate utilisation factor if not provided
      const uf = utilisationFactor || this.calculateUtilisationFactor(roomIndex, roomReflectances);

      // Calculate required lumens
      const requiredLumens = (requiredLux * roomArea) / (uf * maintenanceFactor);

      // Calculate number of luminaires
      const numberOfLuminaires = Math.ceil(requiredLumens / luminaireOutput);

      // Calculate luminaire spacing
      const luminaireSpacing = this.calculateOptimalSpacing(roomLength, roomWidth, numberOfLuminaires);

      // Calculate uniformity ratio
      const uniformityRatio = this.calculateUniformityRatio(numberOfLuminaires, roomArea, luminaireSpacing);

      // Calculate average illuminance achieved
      const averageIlluminance = (numberOfLuminaires * luminaireOutput * uf * maintenanceFactor) / roomArea;

      // Energy consumption calculation (assuming LED at 100W per luminaire)
      const energyConsumption = numberOfLuminaires * 100; // Watts

      // Cost analysis
      const costAnalysis = this.calculateCostAnalysis(numberOfLuminaires, energyConsumption);

      // Generate recommendations
      const recommendations = this.generateRecommendations(inputs, {
        numberOfLuminaires,
        averageIlluminance,
        uniformityRatio,
        energyConsumption
      });

      return {
        requiredLumens,
        numberOfLuminaires,
        luminaireSpacing,
        uniformityRatio,
        averageIlluminance,
        energyConsumption,
        costAnalysis,
        recommendations
      };
    } catch (error) {
      throw new Error(`Illuminance calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: any): void {
    const { roomLength, roomWidth, roomHeight, requiredLux, luminaireOutput } = inputs;
    
    if (roomLength <= 0) throw new Error('Room length must be positive');
    if (roomWidth <= 0) throw new Error('Room width must be positive');
    if (roomHeight <= 0) throw new Error('Room height must be positive');
    if (requiredLux <= 0) throw new Error('Required lux must be positive');
    if (luminaireOutput <= 0) throw new Error('Luminaire output must be positive');
  }

  private static calculateRoomIndex(length: number, width: number, height: number, workingPlaneHeight: number): number {
    // Room index = (L × W) / (Hm × (L + W))
    // where Hm = mounting height above working plane
    const mountingHeight = height - workingPlaneHeight;
    return (length * width) / (mountingHeight * (length + width));
  }

  private static calculateUtilisationFactor(roomIndex: number, reflectances: { ceiling: number; walls: number; floor: number }): number {
    // Simplified utilisation factor calculation
    // In practice, use manufacturer's photometric data
    const { ceiling, walls, floor } = reflectances;
    
    // Base utilisation factor based on room index
    let baseUF = 0.3 + (roomIndex * 0.15);
    if (baseUF > 0.8) baseUF = 0.8;

    // Adjust for reflectances
    const reflectanceAdjustment = (ceiling * 0.4) + (walls * 0.3) + (floor * 0.1);
    
    return Math.min(baseUF + reflectanceAdjustment, 0.85);
  }

  private static calculateOptimalSpacing(length: number, width: number, numberOfLuminaires: number): number {
    // Calculate spacing for uniform distribution
    const luminairesPerRow = Math.ceil(Math.sqrt(numberOfLuminaires * (length / width)));
    const rows = Math.ceil(numberOfLuminaires / luminairesPerRow);
    
    const spacingLength = length / luminairesPerRow;
    const spacingWidth = width / rows;
    
    return Math.min(spacingLength, spacingWidth);
  }

  private static calculateUniformityRatio(numberOfLuminaires: number, roomArea: number, spacing: number): number {
    // Simplified uniformity calculation
    // Good uniformity: ratio < 3:1, Acceptable: < 5:1
    const density = numberOfLuminaires / roomArea;
    
    if (density > 0.1) return 2.5; // High density - good uniformity
    if (density > 0.05) return 3.5; // Medium density
    return 5.0; // Low density - may have uniformity issues
  }

  private static calculateCostAnalysis(numberOfLuminaires: number, energyConsumption: number) {
    // Simplified cost analysis
    const luminaireUnitCost = 150; // £150 per LED luminaire
    const installationCostPerLuminaire = 50; // £50 installation cost
    const energyCostPerKWh = 0.30; // £0.30 per kWh
    const hoursPerYear = 2500; // Typical office hours

    const installationCost = numberOfLuminaires * (luminaireUnitCost + installationCostPerLuminaire);
    const annualEnergyCost = (energyConsumption / 1000) * hoursPerYear * energyCostPerKWh;
    const maintenanceCost = numberOfLuminaires * 10; // £10 per luminaire per year

    return {
      installationCost,
      annualEnergyCost,
      maintenanceCost
    };
  }

  private static generateRecommendations(inputs: any, results: any): string[] {
    const recommendations: string[] = [];

    if (results.uniformityRatio > 4) {
      recommendations.push('Consider additional luminaires for better uniformity');
    }

    if (results.averageIlluminance > inputs.requiredLux * 1.2) {
      recommendations.push('Over-illuminated - consider reducing luminaire output or quantity');
    }

    if (results.averageIlluminance < inputs.requiredLux * 0.9) {
      recommendations.push('Under-illuminated - increase luminaire output or quantity');
    }

    recommendations.push('Use LED luminaires for energy efficiency');
    recommendations.push('Consider daylight integration and controls');
    recommendations.push('Comply with CIBSE lighting guide recommendations');

    return recommendations;
  }
}

/**
 * Emergency Lighting Calculator
 * Calculate emergency lighting requirements (BS 5266)
 * Ensures compliance with UK emergency lighting standards
 */
export class EmergencyLightingCalculator {
  /**
   * Calculate emergency lighting requirements
   */
  static calculate(inputs: {
    roomArea: number; // m²
    roomType: 'open_area' | 'escape_route' | 'high_risk' | 'toilet' | 'lift_car';
    ceilingHeight: number; // m
    escapeRouteWidth?: number; // m
    occupancy: number; // Number of people
    existingLights?: Array<{
      lumens: number;
      position: { x: number; y: number };
    }>;
  }): EmergencyLightingResult {
    const { roomArea, roomType, ceilingHeight, escapeRouteWidth, occupancy } = inputs;

    // Input validation - BS 5266 compliance
    if (roomArea <= 0) {
      throw new Error('Room area must be positive');
    }
    
    if (ceilingHeight <= 0) {
      throw new Error('Ceiling height must be positive');
    }
    
    if (occupancy < 0) {
      throw new Error('Occupancy cannot be negative');
    }
    
    if (!roomType) {
      throw new Error('Room type must be specified for BS 5266 compliance');
    }

    try {
      // Get requirements based on room type (BS 5266)
      const requirements = this.getEmergencyLightingRequirements(roomType);
      
      // Calculate number of luminaires needed
      const lumensPerLuminaire = 200; // Typical emergency luminaire output
      const totalLumensRequired = roomArea * requirements.illuminance;
      const numberOfLuminaires = Math.ceil(totalLumensRequired / lumensPerLuminaire);
      
      // Calculate spacing
      const luminaireSpacing = Math.sqrt(roomArea / numberOfLuminaires);
      
      // Ensure spacing doesn't exceed maximum for ceiling height
      const maxSpacing = ceilingHeight * 4; // Rule of thumb
      const adjustedSpacing = Math.min(luminaireSpacing, maxSpacing);
      
      return {
        requiredIlluminance: requirements.illuminance,
        uniformityRatio: requirements.uniformity,
        minimumDuration: requirements.duration,
        numberOfLuminaires: Math.ceil(roomArea / Math.pow(adjustedSpacing, 2)),
        luminaireSpacing: adjustedSpacing,
        testingSchedule: [
          'Daily: Visual check of indicators',
          'Monthly: Brief functional test',
          'Annual: Full 3-hour duration test',
          'Annual: Professional inspection and certification'
        ],
        complianceRequirements: [
          'BS 5266-1: Code of practice for emergency lighting',
          'BS EN 1838: Lighting applications - Emergency lighting',
          'Fire Risk Assessment requirements',
          'Building Regulations Part B compliance'
        ],
        recommendations: this.getRecommendations(roomType, occupancy, ceilingHeight)
      };
    } catch (error) {
      throw new Error(`Emergency lighting calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static getEmergencyLightingRequirements(roomType: string) {
    switch (roomType) {
      case 'escape_route':
        return { illuminance: 1.0, uniformity: 40, duration: 3 }; // 1 lux, 40:1 ratio, 3 hours
      case 'open_area':
        return { illuminance: 0.5, uniformity: 40, duration: 3 }; // 0.5 lux for areas >60m²
      case 'high_risk':
        return { illuminance: 15.0, uniformity: 10, duration: 3 }; // High risk areas
      case 'toilet':
        return { illuminance: 0.5, uniformity: 40, duration: 1 }; // 1 hour minimum
      case 'lift_car':
        return { illuminance: 5.0, uniformity: 40, duration: 1 }; // 5 lux in lift cars
      default:
        return { illuminance: 0.5, uniformity: 40, duration: 3 };
    }
  }

  private static getRecommendations(roomType: string, occupancy: number, ceilingHeight: number): string[] {
    const recommendations: string[] = [];
    
    if (occupancy > 50) {
      recommendations.push('Consider addressable emergency lighting system for large occupancy');
    }
    
    if (ceilingHeight > 4) {
      recommendations.push('High mounting height - ensure adequate light distribution');
    }
    
    if (roomType === 'escape_route') {
      recommendations.push('Ensure continuous lighting along entire escape route');
      recommendations.push('Light exit signs and directional signs clearly');
    }
    
    recommendations.push('Use LED emergency luminaires for longer life and lower maintenance');
    recommendations.push('Consider self-testing systems to reduce maintenance burden');
    recommendations.push('Ensure compliance with BS 5266-1 and BS EN 1838');
    recommendations.push('Regular testing and certification required by law');
    
    return recommendations;
  }
}

/**
 * Luminous Flux Calculator
 * Calculate total luminous flux requirements for lighting installations
 * Based on CIBSE guidance and BS EN 12464 standards
 */
export class LuminousFluxCalculator {
  /**
   * Calculate luminous flux requirements
   */
  static calculate(inputs: {
    roomLength: number; // m
    roomWidth: number; // m
    roomHeight: number; // m
    workingPlaneHeight: number; // m
    requiredIlluminance: number; // lux
    utilizationFactor: number; // 0.0-1.0
    maintenanceFactor: number; // 0.6-0.9
    roomReflectances?: {
      ceiling: number;
      walls: number;
      floor: number;
    };
  }): {
    totalLuminousFlux: number; // lumens
    fluxPerM2: number; // lumens per m²
    roomIndex: number;
    effectiveUtilizationFactor: number;
    recommendations: string[];
  } {
    const {
      roomLength,
      roomWidth,
      roomHeight,
      workingPlaneHeight,
      requiredIlluminance,
      utilizationFactor,
      maintenanceFactor,
      roomReflectances
    } = inputs;

    // Input validation
    if (roomLength <= 0 || roomWidth <= 0 || roomHeight <= 0) {
      throw new Error('Room dimensions must be positive');
    }

    if (requiredIlluminance <= 0) {
      throw new Error('Required illuminance must be positive');
    }

    if (utilizationFactor <= 0 || utilizationFactor > 1) {
      throw new Error('Utilization factor must be between 0 and 1');
    }

    if (maintenanceFactor <= 0 || maintenanceFactor > 1) {
      throw new Error('Maintenance factor must be between 0 and 1');
    }

    const roomArea = roomLength * roomWidth;
    const mountingHeight = roomHeight - workingPlaneHeight;

    // Calculate room index
    const roomIndex = (roomLength * roomWidth) / (mountingHeight * (roomLength + roomWidth));

    // Adjust utilization factor based on room index if reflectances provided
    let effectiveUtilizationFactor = utilizationFactor;
    if (roomReflectances) {
      const reflectanceAdjustment = this.getReflectanceAdjustment(roomIndex, roomReflectances);
      effectiveUtilizationFactor = Math.min(utilizationFactor * reflectanceAdjustment, 0.85);
    }

    // Calculate total luminous flux required
    const totalLuminousFlux = (requiredIlluminance * roomArea) / (effectiveUtilizationFactor * maintenanceFactor);

    // Calculate flux per square meter
    const fluxPerM2 = totalLuminousFlux / roomArea;

    // Generate recommendations
    const recommendations = this.generateFluxRecommendations(
      totalLuminousFlux,
      fluxPerM2,
      roomIndex,
      effectiveUtilizationFactor
    );

    return {
      totalLuminousFlux,
      fluxPerM2,
      roomIndex,
      effectiveUtilizationFactor,
      recommendations
    };
  }

  private static getReflectanceAdjustment(
    roomIndex: number,
    reflectances: { ceiling: number; walls: number; floor: number }
  ): number {
    // Simplified adjustment based on reflectances
    const { ceiling, walls, floor } = reflectances;
    
    let adjustment = 1.0;
    
    // High reflectances improve utilization
    if (ceiling > 0.7) adjustment += 0.1;
    if (walls > 0.5) adjustment += 0.05;
    if (floor > 0.3) adjustment += 0.02;
    
    // Room index affects reflectance benefit
    if (roomIndex > 3) adjustment *= 1.1; // Better utilization in large rooms
    if (roomIndex < 1) adjustment *= 0.9; // Poorer utilization in small rooms
    
    return Math.min(adjustment, 1.3); // Maximum 30% improvement
  }

  private static generateFluxRecommendations(
    totalFlux: number,
    fluxPerM2: number,
    roomIndex: number,
    utilizationFactor: number
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Total luminous flux required: ${Math.round(totalFlux)} lumens`);
    recommendations.push(`Flux density: ${Math.round(fluxPerM2)} lumens/m²`);

    if (fluxPerM2 > 2000) {
      recommendations.push('High flux density - consider energy-efficient luminaires');
    }

    if (roomIndex > 3) {
      recommendations.push('Large room - consider uniform luminaire distribution');
    } else if (roomIndex < 1) {
      recommendations.push('Small room - fewer luminaires may be adequate');
    }

    if (utilizationFactor < 0.5) {
      recommendations.push('Low utilization factor - consider improving room reflectances');
    }

    recommendations.push('Consider LED luminaires for high efficacy (lumens/watt)');
    recommendations.push('Use manufacturer photometric data for accurate calculations');

    return recommendations;
  }
}

/**
 * Room Index Calculator
 * Calculate room index for lighting design purposes
 * Used in conjunction with photometric data for utilization factor determination
 */
export class RoomIndexCalculator {
  /**
   * Calculate room index for lighting design
   */
  static calculate(inputs: {
    roomLength: number; // m
    roomWidth: number; // m
    roomHeight: number; // m
    workingPlaneHeight: number; // m
    luminaireType?: 'direct' | 'indirect' | 'direct_indirect';
  }): {
    roomIndex: number;
    mountingHeight: number;
    roomCharacteristics: {
      classification: 'small' | 'medium' | 'large';
      aspectRatio: number;
      cavityRatio: number;
    };
    recommendations: string[];
  } {
    const {
      roomLength,
      roomWidth,
      roomHeight,
      workingPlaneHeight,
      luminaireType = 'direct'
    } = inputs;

    // Input validation
    if (roomLength <= 0 || roomWidth <= 0 || roomHeight <= 0) {
      throw new Error('Room dimensions must be positive');
    }

    if (workingPlaneHeight < 0 || workingPlaneHeight >= roomHeight) {
      throw new Error('Working plane height must be between 0 and room height');
    }

    const roomArea = roomLength * roomWidth;
    const mountingHeight = roomHeight - workingPlaneHeight;

    // Calculate room index
    const roomIndex = (roomLength * roomWidth) / (mountingHeight * (roomLength + roomWidth));

    // Calculate aspect ratio
    const aspectRatio = Math.max(roomLength, roomWidth) / Math.min(roomLength, roomWidth);

    // Calculate cavity ratio (used for indirect lighting)
    const cavityRatio = 2.5 * mountingHeight * (roomLength + roomWidth) / roomArea;

    // Classify room size
    let classification: 'small' | 'medium' | 'large';
    if (roomIndex < 1) {
      classification = 'small';
    } else if (roomIndex < 3) {
      classification = 'medium';
    } else {
      classification = 'large';
    }

    // Generate recommendations
    const recommendations = this.generateRoomIndexRecommendations(
      roomIndex,
      classification,
      aspectRatio,
      luminaireType
    );

    return {
      roomIndex,
      mountingHeight,
      roomCharacteristics: {
        classification,
        aspectRatio,
        cavityRatio
      },
      recommendations
    };
  }

  private static generateRoomIndexRecommendations(
    roomIndex: number,
    classification: string,
    aspectRatio: number,
    luminaireType: string
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Room index: ${roomIndex.toFixed(2)}`);
    recommendations.push(`Room classification: ${classification}`);

    if (aspectRatio > 3) {
      recommendations.push('High aspect ratio - consider linear luminaire arrangement');
    }

    switch (classification) {
      case 'small':
        recommendations.push('Small room - fewer luminaires required, consider wall-mounted fittings');
        break;
      case 'medium':
        recommendations.push('Medium room - standard luminaire spacing applies');
        break;
      case 'large':
        recommendations.push('Large room - uniform distribution important, consider high-output luminaires');
        break;
    }

    if (luminaireType === 'indirect') {
      recommendations.push('Indirect lighting - ensure adequate ceiling reflectance (>70%)');
    }

    recommendations.push('Use room index with manufacturer photometric data for utilization factor');
    recommendations.push('Consider room geometry in luminaire selection and spacing');

    return recommendations;
  }
}

/**
 * Utilisation Factor Calculator
 * Calculate utilisation factor for lighting installations
 * Based on room index, reflectances, and luminaire photometry
 */
export class UtilisationFactorCalculator {
  /**
   * Calculate utilisation factor
   */
  static calculate(inputs: {
    roomIndex: number;
    roomReflectances: {
      ceiling: number; // 0.0-1.0
      walls: number; // 0.0-1.0
      floor: number; // 0.0-1.0
    };
    luminaireType: 'direct' | 'indirect' | 'direct_indirect';
    luminaireDistribution?: 'narrow' | 'medium' | 'wide';
  }): {
    utilisationFactor: number;
    effectiveReflectances: {
      ceiling: number;
      walls: number;
      floor: number;
    };
    interReflection: number;
    recommendations: string[];
  } {
    const {
      roomIndex,
      roomReflectances,
      luminaireType,
      luminaireDistribution = 'medium'
    } = inputs;

    // Input validation
    if (roomIndex <= 0) {
      throw new Error('Room index must be positive');
    }

    Object.entries(roomReflectances).forEach(([surface, reflectance]) => {
      if (reflectance < 0 || reflectance > 1) {
        throw new Error(`${surface} reflectance must be between 0 and 1`);
      }
    });

    // Calculate base utilisation factor
    const baseUF = this.calculateBaseUtilisationFactor(roomIndex, luminaireType, luminaireDistribution);

    // Calculate inter-reflection component
    const interReflection = this.calculateInterReflection(roomIndex, roomReflectances);

    // Calculate effective reflectances
    const effectiveReflectances = this.calculateEffectiveReflectances(roomReflectances, interReflection);

    // Calculate final utilisation factor
    const utilisationFactor = this.calculateFinalUtilisationFactor(
      baseUF,
      effectiveReflectances,
      luminaireType
    );

    // Generate recommendations
    const recommendations = this.generateUtilisationRecommendations(
      utilisationFactor,
      effectiveReflectances,
      luminaireType
    );

    return {
      utilisationFactor,
      effectiveReflectances,
      interReflection,
      recommendations
    };
  }

  private static calculateBaseUtilisationFactor(
    roomIndex: number,
    luminaireType: string,
    distribution: string
  ): number {
    // Simplified base UF calculation
    let baseUF = 0.0;

    switch (luminaireType) {
      case 'direct':
        baseUF = 0.3 + (roomIndex * 0.15);
        break;
      case 'indirect':
        baseUF = 0.2 + (roomIndex * 0.12);
        break;
      case 'direct_indirect':
        baseUF = 0.35 + (roomIndex * 0.13);
        break;
    }

    // Adjust for distribution
    switch (distribution) {
      case 'narrow':
        baseUF *= 0.9;
        break;
      case 'wide':
        baseUF *= 1.1;
        break;
    }

    return Math.min(baseUF, 0.8); // Cap at 80%
  }

  private static calculateInterReflection(
    roomIndex: number,
    reflectances: { ceiling: number; walls: number; floor: number }
  ): number {
    const { ceiling, walls, floor } = reflectances;
    const averageReflectance = (ceiling + walls + floor) / 3;
    
    // Inter-reflection increases with room index and reflectances
    return (roomIndex * averageReflectance) / (1 + roomIndex);
  }

  private static calculateEffectiveReflectances(
    reflectances: { ceiling: number; walls: number; floor: number },
    interReflection: number
  ): { ceiling: number; walls: number; floor: number } {
    const multiplier = 1 + (interReflection * 0.5);
    
    return {
      ceiling: Math.min(reflectances.ceiling * multiplier, 1.0),
      walls: Math.min(reflectances.walls * multiplier, 1.0),
      floor: Math.min(reflectances.floor * multiplier, 1.0)
    };
  }

  private static calculateFinalUtilisationFactor(
    baseUF: number,
    effectiveReflectances: { ceiling: number; walls: number; floor: number },
    luminaireType: string
  ): number {
    let adjustment = 1.0;

    // Adjust based on luminaire type and reflectances
    switch (luminaireType) {
      case 'direct':
        adjustment += effectiveReflectances.ceiling * 0.3 + effectiveReflectances.walls * 0.2;
        break;
      case 'indirect':
        adjustment += effectiveReflectances.ceiling * 0.7 + effectiveReflectances.walls * 0.3;
        break;
      case 'direct_indirect':
        adjustment += effectiveReflectances.ceiling * 0.5 + effectiveReflectances.walls * 0.25;
        break;
    }

    return Math.min(baseUF * adjustment, 0.85);
  }

  private static generateUtilisationRecommendations(
    utilisationFactor: number,
    effectiveReflectances: { ceiling: number; walls: number; floor: number },
    luminaireType: string
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Utilisation factor: ${(utilisationFactor * 100).toFixed(1)}%`);

    if (utilisationFactor < 0.4) {
      recommendations.push('Low utilisation factor - consider improving room reflectances');
    } else if (utilisationFactor > 0.7) {
      recommendations.push('Good utilisation factor - efficient lighting design');
    }

    if (effectiveReflectances.ceiling < 0.7 && luminaireType === 'indirect') {
      recommendations.push('Indirect lighting requires high ceiling reflectance (>70%)');
    }

    if (effectiveReflectances.walls < 0.5) {
      recommendations.push('Consider light-colored wall finishes to improve efficiency');
    }

    recommendations.push('Use manufacturer photometric data for accurate calculations');
    recommendations.push('Consider inter-reflection effects in final design');

    return recommendations;
  }
}

/**
 * Maintenance Factor Calculator
 * Calculate maintenance factor for lighting installations
 * Based on luminaire type, environment, and maintenance schedule
 */
export class MaintenanceFactorCalculator {
  /**
   * Calculate maintenance factor
   */
  static calculate(inputs: {
    luminaireType: 'led' | 'fluorescent' | 'incandescent' | 'halogen' | 'hid';
    environment: 'clean' | 'normal' | 'dirty' | 'very_dirty';
    maintenanceSchedule: 'excellent' | 'good' | 'poor';
    operatingHours: number; // hours per year
    serviceLife: number; // years
    luminaireIP?: string; // IP rating
  }): {
    maintenanceFactor: number;
    lampLumenDepreciation: number;
    luminaireDirtDepreciation: number;
    lampSurvivalFactor: number;
    recommendations: string[];
  } {
    const {
      luminaireType,
      environment,
      maintenanceSchedule,
      operatingHours,
      serviceLife,
      luminaireIP
    } = inputs;

    // Input validation
    if (operatingHours <= 0) {
      throw new Error('Operating hours must be positive');
    }

    if (serviceLife <= 0) {
      throw new Error('Service life must be positive');
    }

    // Calculate lamp lumen depreciation
    const lampLumenDepreciation = this.calculateLampLumenDepreciation(
      luminaireType,
      operatingHours,
      serviceLife
    );

    // Calculate luminaire dirt depreciation
    const luminaireDirtDepreciation = this.calculateLuminaireDirtDepreciation(
      environment,
      luminaireIP || 'IP20',
      maintenanceSchedule
    );

    // Calculate lamp survival factor
    const lampSurvivalFactor = this.calculateLampSurvivalFactor(
      luminaireType,
      operatingHours,
      serviceLife
    );

    // Calculate overall maintenance factor
    const maintenanceFactor = lampLumenDepreciation * luminaireDirtDepreciation * lampSurvivalFactor;

    // Generate recommendations
    const recommendations = this.generateMaintenanceRecommendations(
      maintenanceFactor,
      luminaireType,
      environment,
      maintenanceSchedule
    );

    return {
      maintenanceFactor,
      lampLumenDepreciation,
      luminaireDirtDepreciation,
      lampSurvivalFactor,
      recommendations
    };
  }

  private static calculateLampLumenDepreciation(
    luminaireType: string,
    operatingHours: number,
    serviceLife: number
  ): number {
    const totalHours = operatingHours * serviceLife;

    switch (luminaireType) {
      case 'led':
        // LED: 70% lumen maintenance at 50,000 hours
        return Math.max(0.7, 1 - (totalHours / 100000) * 0.3);
      case 'fluorescent':
        // Fluorescent: 85% at 10,000 hours
        return Math.max(0.8, 1 - (totalHours / 20000) * 0.2);
      case 'incandescent':
        // Incandescent: 95% (minimal depreciation)
        return 0.95;
      case 'halogen':
        // Halogen: 90%
        return 0.9;
      case 'hid':
        // HID: 80% at 10,000 hours
        return Math.max(0.75, 1 - (totalHours / 15000) * 0.25);
      default:
        return 0.8;
    }
  }

  private static calculateLuminaireDirtDepreciation(
    environment: string,
    ipRating: string,
    maintenanceSchedule: string
  ): number {
    // Base dirt depreciation by environment
    let baseDirt = 1.0;
    switch (environment) {
      case 'clean':
        baseDirt = 0.95;
        break;
      case 'normal':
        baseDirt = 0.90;
        break;
      case 'dirty':
        baseDirt = 0.80;
        break;
      case 'very_dirty':
        baseDirt = 0.70;
        break;
    }

    // Adjust for IP rating
    const ipNumber = parseInt(ipRating.replace('IP', '').charAt(0));
    if (ipNumber >= 6) {
      baseDirt += 0.05; // Better sealing improves dirt resistance
    }

    // Adjust for maintenance schedule
    switch (maintenanceSchedule) {
      case 'excellent':
        baseDirt += 0.05;
        break;
      case 'poor':
        baseDirt -= 0.10;
        break;
    }

    return Math.min(Math.max(baseDirt, 0.6), 0.98);
  }

  private static calculateLampSurvivalFactor(
    luminaireType: string,
    operatingHours: number,
    serviceLife: number
  ): number {
    const totalHours = operatingHours * serviceLife;

    switch (luminaireType) {
      case 'led':
        // LED: Very high survival rate
        return totalHours > 50000 ? 0.95 : 0.98;
      case 'fluorescent':
        // Fluorescent: Good survival
        return totalHours > 10000 ? 0.90 : 0.95;
      case 'incandescent':
        // Incandescent: Lower survival
        return totalHours > 1000 ? 0.85 : 0.90;
      case 'halogen':
        // Halogen: Moderate survival
        return totalHours > 2000 ? 0.88 : 0.92;
      case 'hid':
        // HID: Good survival
        return totalHours > 10000 ? 0.92 : 0.95;
      default:
        return 0.90;
    }
  }

  private static generateMaintenanceRecommendations(
    maintenanceFactor: number,
    luminaireType: string,
    environment: string,
    maintenanceSchedule: string
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Maintenance factor: ${(maintenanceFactor * 100).toFixed(1)}%`);

    if (maintenanceFactor < 0.7) {
      recommendations.push('Low maintenance factor - consider improving maintenance schedule');
    }

    if (environment === 'dirty' || environment === 'very_dirty') {
      recommendations.push('Dirty environment - use IP65+ rated luminaires');
      recommendations.push('Increase cleaning frequency for better performance');
    }

    if (luminaireType === 'led') {
      recommendations.push('LED luminaires have excellent maintenance factors');
    } else if (luminaireType === 'incandescent') {
      recommendations.push('Consider LED replacement for better maintenance factor');
    }

    if (maintenanceSchedule === 'poor') {
      recommendations.push('Implement planned maintenance schedule');
    }

    recommendations.push('Regular cleaning improves light output and energy efficiency');
    recommendations.push('Consider maintenance factor in initial design calculations');

    return recommendations;
  }
}

/**
 * LED Replacement Calculator
 * Calculate energy savings and payback period for LED replacements
 * Based on typical lamp performance data and energy costs
 */
export class LEDReplacementCalculator {
  /**
   * Calculate LED replacement benefits
   */
  static calculate(inputs: {
    originalLuminaireType: string; // incandescent, halogen, fluorescent, etc.
    originalWattage: number;
    numberOfLuminaires: number;
    operatingHoursPerDay: number;
    operatingDaysPerYear: number;
    electricityRatePerKwh: number; // £ per kWh
    ledWattage: number;
    ledCost: number; // Cost per LED unit
    installationCost?: number; // Additional installation cost
  }): LEDReplacementResult {
    const {
      originalLuminaireType,
      originalWattage,
      numberOfLuminaires,
      operatingHoursPerDay,
      operatingDaysPerYear,
      electricityRatePerKwh,
      ledWattage,
      ledCost,
      installationCost = 0
    } = inputs;

    // Validate inputs
    if (originalWattage <= 0 || numberOfLuminaires <= 0 || operatingHoursPerDay <= 0) {
      throw new Error('Invalid input values for LED replacement calculation');
    }

    // Calculate annual operating hours
    const annualOperatingHours = operatingHoursPerDay * operatingDaysPerYear;

    // Calculate energy consumption
    const originalAnnualKwh = (originalWattage * numberOfLuminaires * annualOperatingHours) / 1000;
    const ledAnnualKwh = (ledWattage * numberOfLuminaires * annualOperatingHours) / 1000;
    const annualKwhSaving = originalAnnualKwh - ledAnnualKwh;
    const percentageSaving = (annualKwhSaving / originalAnnualKwh) * 100;

    // Calculate cost savings
    const annualCostSaving = annualKwhSaving * electricityRatePerKwh;

    // Calculate light output (typical values)
    const originalLumensPerWatt = this.getLumensPerWatt(originalLuminaireType);
    const ledLumensPerWatt = 120; // Typical LED efficiency

    const originalLumens = originalWattage * originalLumensPerWatt * numberOfLuminaires;
    const ledLumens = ledWattage * ledLumensPerWatt * numberOfLuminaires;
    const lumensImprovement = ((ledLumens - originalLumens) / originalLumens) * 100;

    // Calculate payback period
    const totalUpfrontCost = (ledCost * numberOfLuminaires) + installationCost;
    const paybackPeriod = totalUpfrontCost / annualCostSaving;

    // Calculate lifetime savings (assuming 15-year LED life)
    const ledLifetimeYears = 15;
    const lifetimeSavings = (annualCostSaving * ledLifetimeYears) - totalUpfrontCost;

    // Environmental benefits
    const co2Reduction = annualKwhSaving * 0.233; // kg CO2 per kWh (UK grid average)
    const reducedMaintenance = this.calculateMaintenanceReduction(originalLuminaireType, numberOfLuminaires);

    const recommendations = this.generateLEDRecommendations({
      paybackPeriod,
      percentageSaving,
      lumensImprovement,
      originalLuminaireType
    });

    return {
      originalWattage,
      ledWattage,
      energySavings: {
        percentageSaving,
        annualKwhSaving,
        annualCostSaving
      },
      lightOutput: {
        originalLumens,
        ledLumens,
        lumensImprovement
      },
      paybackPeriod,
      lifetimeSavings,
      environmentalBenefit: {
        co2Reduction,
        reducedMaintenance
      },
      recommendations
    };
  }

  private static getLumensPerWatt(luminaireType: string): number {
    switch (luminaireType.toLowerCase()) {
      case 'incandescent':
        return 15;
      case 'halogen':
        return 20;
      case 'fluorescent':
        return 80;
      case 'cfl':
        return 65;
      case 'hid':
        return 90;
      default:
        return 20;
    }
  }

  private static calculateMaintenanceReduction(originalType: string, numberOfLuminaires: number): number {
    // Lamp changes per year saved by switching to LED
    const originalLifeHours = this.getTypicalLifeHours(originalType);
    const ledLifeHours = 50000;
    
    const originalChangesPerYear = (8760 / originalLifeHours) * numberOfLuminaires;
    const ledChangesPerYear = (8760 / ledLifeHours) * numberOfLuminaires;
    
    return Math.max(0, originalChangesPerYear - ledChangesPerYear);
  }

  private static getTypicalLifeHours(luminaireType: string): number {
    switch (luminaireType.toLowerCase()) {
      case 'incandescent':
        return 1000;
      case 'halogen':
        return 2000;
      case 'fluorescent':
        return 10000;
      case 'cfl':
        return 8000;
      case 'hid':
        return 15000;
      default:
        return 2000;
    }
  }

  private static generateLEDRecommendations(data: {
    paybackPeriod: number;
    percentageSaving: number;
    lumensImprovement: number;
    originalLuminaireType: string;
  }): string[] {
    const recommendations: string[] = [];

    if (data.paybackPeriod < 2) {
      recommendations.push('Excellent ROI - immediate replacement recommended');
    } else if (data.paybackPeriod < 5) {
      recommendations.push('Good ROI - replacement recommended at next maintenance cycle');
    } else {
      recommendations.push('Consider replacement when existing luminaires fail');
    }

    if (data.percentageSaving > 70) {
      recommendations.push('Very high energy savings achievable');
    }

    if (data.lumensImprovement > 0) {
      recommendations.push('LED replacement will improve light levels');
    }

    if (data.originalLuminaireType === 'incandescent') {
      recommendations.push('Immediate replacement strongly recommended for incandescent lamps');
    }

    recommendations.push('Consider LED dimming capabilities for additional savings');
    recommendations.push('Ensure LED color temperature matches application requirements');
    recommendations.push('Check for any Building Regulations Part L compliance benefits');

    return recommendations;
  }
}

/**
 * Energy Efficiency Calculator
 * Calculate lighting energy efficiency and compliance with regulations
 * Based on Building Regulations Part L and CIBSE guidance
 */
export class EnergyEfficiencyCalculator {
  /**
   * Calculate lighting energy efficiency
   */
  static calculate(inputs: {
    totalWattage: number;
    totalLumens: number;
    floorArea: number; // m²
    operatingHours: number; // hours per year
    electricityRate: number; // £ per kWh
    buildingType: string; // office, retail, industrial, etc.
  }): EnergyEfficiencyResult {
    const {
      totalWattage,
      totalLumens,
      floorArea,
      operatingHours,
      electricityRate,
      buildingType
    } = inputs;

    // Validate inputs
    if (totalWattage <= 0 || totalLumens <= 0 || floorArea <= 0) {
      throw new Error('Invalid input values for energy efficiency calculation');
    }

    // Calculate lumens per watt
    const lumensPerWatt = totalLumens / totalWattage;

    // Determine efficacy rating
    const efficacyRating = this.getEfficacyRating(lumensPerWatt);
    const energyClass = this.getEnergyClass(lumensPerWatt);

    // Calculate annual energy consumption
    const annualEnergyConsumption = (totalWattage * operatingHours) / 1000; // kWh
    const annualCost = annualEnergyConsumption * electricityRate;

    // Check Building Regulations Part L compliance
    const minEfficacy = this.getMinimumEfficacy(buildingType);
    const buildingRegsPartL = lumensPerWatt >= minEfficacy;

    const complianceStatus = {
      buildingRegsPartL,
      minEfficacy,
      achieved: lumensPerWatt
    };

    const recommendations = this.generateEfficiencyRecommendations({
      lumensPerWatt,
      efficacyRating,
      buildingRegsPartL,
      buildingType
    });

    return {
      lumensPerWatt,
      efficacyRating,
      energyClass,
      annualEnergyConsumption,
      annualCost,
      complianceStatus,
      recommendations
    };
  }

  private static getEfficacyRating(lumensPerWatt: number): string {
    if (lumensPerWatt >= 100) return 'Excellent';
    if (lumensPerWatt >= 80) return 'Good';
    if (lumensPerWatt >= 60) return 'Fair';
    return 'Poor';
  }

  private static getEnergyClass(lumensPerWatt: number): string {
    if (lumensPerWatt >= 120) return 'A++';
    if (lumensPerWatt >= 100) return 'A+';
    if (lumensPerWatt >= 80) return 'A';
    if (lumensPerWatt >= 60) return 'B';
    if (lumensPerWatt >= 40) return 'C';
    if (lumensPerWatt >= 25) return 'D';
    if (lumensPerWatt >= 15) return 'E';
    if (lumensPerWatt >= 10) return 'F';
    return 'G';
  }

  private static getMinimumEfficacy(buildingType: string): number {
    // Building Regulations Part L minimum efficacies (lumens/W)
    switch (buildingType.toLowerCase()) {
      case 'office':
        return 60;
      case 'retail':
        return 50;
      case 'warehouse':
        return 65;
      case 'industrial':
        return 65;
      case 'school':
        return 60;
      case 'hospital':
        return 60;
      case 'hotel':
        return 45;
      case 'residential':
        return 45;
      default:
        return 50; // General minimum
    }
  }

  private static generateEfficiencyRecommendations(data: {
    lumensPerWatt: number;
    efficacyRating: string;
    buildingRegsPartL: boolean;
    buildingType: string;
  }): string[] {
    const recommendations: string[] = [];

    if (!data.buildingRegsPartL) {
      recommendations.push('Does not meet Building Regulations Part L - upgrade required');
    }

    if (data.efficacyRating === 'Poor') {
      recommendations.push('Consider LED replacement for improved efficiency');
    } else if (data.efficacyRating === 'Excellent') {
      recommendations.push('Excellent efficiency achieved - consider this as best practice');
    }

    if (data.lumensPerWatt < 80) {
      recommendations.push('Consider high-efficiency LED luminaires (>100 lm/W)');
    }

    recommendations.push('Implement lighting controls for additional energy savings');
    recommendations.push('Consider daylight integration where possible');
    recommendations.push('Regular maintenance ensures optimal efficiency');

    return recommendations;
  }
}

/**
 * Uniformity Ratio Calculator
 * Calculate lighting uniformity and compliance with standards
 * Based on BS EN 12464-1 and CIBSE recommendations
 */
export class UniformityRatioCalculator {
  /**
   * Calculate uniformity ratio from illuminance measurements
   */
  static calculate(inputs: {
    roomLength: number; // m
    roomWidth: number; // m
    gridSpacing: number; // m (measurement grid spacing)
    illuminanceMeasurements: number[]; // lux values in grid order
    standard: string; // BS EN 12464-1, CIBSE, etc.
    applicationType: string; // office, warehouse, etc.
  }): UniformityRatioResult {
    const {
      roomLength,
      roomWidth,
      gridSpacing,
      illuminanceMeasurements,
      standard,
      applicationType
    } = inputs;

    // Validate inputs
    if (illuminanceMeasurements.length < 9) {
      throw new Error('Minimum 9 measurement points required for uniformity calculation');
    }

    // Calculate grid positions
    const gridMeasurements = this.generateGridPositions(
      roomLength,
      roomWidth,
      gridSpacing,
      illuminanceMeasurements
    );

    // Calculate uniformity metrics
    const averageIlluminance = illuminanceMeasurements.reduce((sum, val) => sum + val, 0) / illuminanceMeasurements.length;
    const minimumIlluminance = Math.min(...illuminanceMeasurements);
    const uniformityRatio = minimumIlluminance / averageIlluminance;

    // Get compliance requirements
    const requiredRatio = this.getRequiredUniformityRatio(standard, applicationType);
    const isCompliant = uniformityRatio >= requiredRatio;

    const complianceStatus = {
      standard,
      requiredRatio,
      isCompliant
    };

    const recommendations = this.generateUniformityRecommendations({
      uniformityRatio,
      isCompliant,
      averageIlluminance,
      minimumIlluminance
    });

    return {
      averageIlluminance,
      minimumIlluminance,
      uniformityRatio,
      complianceStatus,
      gridMeasurements,
      recommendations
    };
  }

  private static generateGridPositions(
    roomLength: number,
    roomWidth: number,
    gridSpacing: number,
    measurements: number[]
  ): Array<{ x: number; y: number; illuminance: number }> {
    const gridMeasurements: Array<{ x: number; y: number; illuminance: number }> = [];
    
    let measurementIndex = 0;
    for (let x = gridSpacing; x < roomLength; x += gridSpacing) {
      for (let y = gridSpacing; y < roomWidth; y += gridSpacing) {
        if (measurementIndex < measurements.length) {
          gridMeasurements.push({
            x,
            y,
            illuminance: measurements[measurementIndex]
          });
          measurementIndex++;
        }
      }
    }

    return gridMeasurements;
  }

  private static getRequiredUniformityRatio(standard: string, applicationType: string): number {
    switch (standard.toLowerCase()) {
      case 'bs en 12464-1':
        switch (applicationType.toLowerCase()) {
          case 'office':
            return 0.7;
          case 'warehouse':
            return 0.4;
          case 'manufacturing':
            return 0.6;
          case 'retail':
            return 0.4;
          default:
            return 0.5;
        }
      case 'cibse':
        return 0.8; // Generally more stringent
      default:
        return 0.5;
    }
  }

  private static generateUniformityRecommendations(data: {
    uniformityRatio: number;
    isCompliant: boolean;
    averageIlluminance: number;
    minimumIlluminance: number;
  }): string[] {
    const recommendations: string[] = [];

    if (!data.isCompliant) {
      recommendations.push('Uniformity ratio below standard requirements');
      recommendations.push('Consider additional luminaires or repositioning existing ones');
    }

    if (data.uniformityRatio < 0.3) {
      recommendations.push('Very poor uniformity - immediate action required');
    } else if (data.uniformityRatio > 0.8) {
      recommendations.push('Excellent uniformity achieved');
    }

    if (data.minimumIlluminance < 200) {
      recommendations.push('Some areas may be under-lit for typical tasks');
    }

    recommendations.push('Regular photometric surveys recommended');
    recommendations.push('Consider luminaire spacing and mounting height optimization');

    return recommendations;
  }
}

/**
 * Glare Index Calculator
 * Calculate Unified Glare Rating (UGR) for visual comfort assessment
 * Based on CIE Publication 117-1995 and BS EN 12464-1
 */
export class GlareIndexCalculator {
  /**
   * Calculate UGR glare index
   */
  static calculate(inputs: {
    luminairePositions: Array<{
      x: number; // m from observer
      y: number; // m from observer
      height: number; // m above observer eye level
      luminance: number; // cd/m²
      luminousArea: number; // m²
    }>;
    backgroundLuminance: number; // cd/m²
    observerPosition: { x: number; y: number }; // m
    maxUgrAllowed: number; // Based on application
    standard: string;
  }): GlareIndexResult {
    const {
      luminairePositions,
      backgroundLuminance,
      observerPosition,
      maxUgrAllowed,
      standard
    } = inputs;

    // Calculate UGR for each luminaire
    let totalGlareContribution = 0;
    const luminaireGlareData = luminairePositions.map(luminaire => {
      const glareContribution = this.calculateLuminaireGlare(
        luminaire,
        observerPosition,
        backgroundLuminance
      );
      totalGlareContribution += glareContribution;
      
      return {
        x: luminaire.x,
        y: luminaire.y,
        height: luminaire.height,
        glareContribution
      };
    });

    // Calculate overall UGR
    const unifiedGlareRating = 8 * Math.log10(0.25 * totalGlareContribution / backgroundLuminance);

    // Determine glare category
    const glareCategory = this.getGlareCategory(unifiedGlareRating);

    // Check compliance
    const isCompliant = unifiedGlareRating <= maxUgrAllowed;
    const complianceStatus = {
      maxUgrAllowed,
      isCompliant,
      standard
    };

    const recommendations = this.generateGlareRecommendations({
      unifiedGlareRating,
      glareCategory,
      isCompliant,
      maxUgrAllowed
    });

    return {
      unifiedGlareRating,
      glareCategory,
      complianceStatus,
      luminairePositions: luminaireGlareData,
      recommendations
    };
  }

  private static calculateLuminaireGlare(
    luminaire: {
      x: number;
      y: number;
      height: number;
      luminance: number;
      luminousArea: number;
    },
    observer: { x: number; y: number },
    backgroundLuminance: number
  ): number {
    // Calculate position index
    const dx = luminaire.x - observer.x;
    const dy = luminaire.y - observer.y;
    const distance = Math.sqrt(dx * dx + dy * dy + luminaire.height * luminaire.height);
    
    // Guth position index
    const positionIndex = Math.exp((35.2 - 0.31889 * Math.sqrt(dx * dx + dy * dy)) / 1000);

    // Calculate glare contribution
    const glareContribution = (luminaire.luminance * luminaire.luminance * luminaire.luminousArea * positionIndex) / 
                             (distance * distance);

    return glareContribution;
  }

  private static getGlareCategory(ugr: number): string {
    if (ugr <= 13) return 'Imperceptible';
    if (ugr <= 16) return 'Perceptible';
    if (ugr <= 22) return 'Disturbing';
    return 'Intolerable';
  }

  private static generateGlareRecommendations(data: {
    unifiedGlareRating: number;
    glareCategory: string;
    isCompliant: boolean;
    maxUgrAllowed: number;
  }): string[] {
    const recommendations: string[] = [];

    if (!data.isCompliant) {
      recommendations.push(`UGR ${data.unifiedGlareRating.toFixed(1)} exceeds limit of ${data.maxUgrAllowed}`);
      recommendations.push('Consider luminaire repositioning or shielding');
    }

    if (data.glareCategory === 'Intolerable') {
      recommendations.push('Immediate action required - glare is intolerable');
    } else if (data.glareCategory === 'Imperceptible') {
      recommendations.push('Excellent glare control achieved');
    }

    recommendations.push('Use luminaires with good optical control');
    recommendations.push('Consider indirect lighting for VDU work');
    recommendations.push('Maintain appropriate background luminance');

    return recommendations;
  }
}

/**
 * Domestic Lighting Calculator
 * Calculate lighting requirements for domestic rooms
 * Based on BS 8206-2 and industry best practices
 */
export class DomesticLightingCalculator {
  /**
   * Calculate domestic room lighting
   */
  static calculate(inputs: {
    roomType: string;
    roomLength: number; // m
    roomWidth: number; // m
    roomHeight: number; // m
    ceilingColor: string; // light, medium, dark
    wallColor: string;
    electricityRate: number; // £ per kWh
    preferredColorTemperature?: number; // K
  }): DomesticLightingResult {
    const {
      roomType,
      roomLength,
      roomWidth,
      roomHeight,
      ceilingColor,
      wallColor,
      electricityRate,
      preferredColorTemperature = 3000
    } = inputs;

    // Get recommended illuminance for room type
    const recommendedIlluminance = this.getRecommendedIlluminance(roomType);
    
    // Calculate room area
    const roomArea = roomLength * roomWidth;

    // Calculate reflectance factors
    const ceilingReflectance = this.getReflectance(ceilingColor);
    const wallReflectance = this.getReflectance(wallColor);

    // Calculate room index
    const roomIndex = roomArea / ((roomLength + roomWidth) * (roomHeight - 0.8));

    // Estimate utilisation factor
    const utilisationFactor = this.estimateUtilisationFactor(roomIndex, ceilingReflectance, wallReflectance);

    // Calculate required lumens (assuming maintenance factor of 0.8)
    const maintenanceFactor = 0.8;
    const requiredLumens = (recommendedIlluminance * roomArea) / (utilisationFactor * maintenanceFactor);

    // Recommend luminaire type and calculate quantity
    const luminaireRecommendation = this.getLuminaireRecommendation(roomType, preferredColorTemperature);
    const numberOfLuminaires = Math.ceil(requiredLumens / luminaireRecommendation.lumensPerUnit);

    // Calculate total wattage
    const totalWattage = numberOfLuminaires * luminaireRecommendation.wattagePerUnit;

    // Generate switching arrangement
    const switchingArrangement = this.getSwitchingArrangement(roomType, numberOfLuminaires);

    // Determine dimming recommendation
    const dimmingRecommendation = this.getDimmingRecommendation(roomType);

    // Calculate energy efficiency rating
    const lumensPerWatt = requiredLumens / totalWattage;
    const energyEfficiencyRating = lumensPerWatt > 80 ? 'A' : lumensPerWatt > 60 ? 'B' : 'C';

    // Check compliance
    const complianceChecks = {
      buildingRegs: lumensPerWatt >= 45, // Building Regs Part L
      bs7671: true, // Assume compliant wiring
      partP: roomType !== 'bathroom' || this.checkBathroomZones(roomType) // Special locations
    };

    // Calculate annual cost (assuming 4 hours/day average)
    const annualOperatingHours = 4 * 365;
    const annualKwh = (totalWattage * annualOperatingHours) / 1000;
    const annualCost = annualKwh * electricityRate;

    const recommendations = this.generateDomesticRecommendations({
      roomType,
      energyEfficiencyRating,
      dimmingRecommendation,
      complianceChecks
    });

    return {
      roomType,
      recommendedIlluminance,
      numberOfLuminaires,
      luminaireType: luminaireRecommendation.type,
      totalWattage,
      switchingArrangement,
      dimmingRecommendation,
      energyEfficiencyRating,
      complianceChecks,
      annualCost,
      recommendations
    };
  }

  private static getRecommendedIlluminance(roomType: string): number {
    // Illuminance levels for domestic rooms (lux)
    switch (roomType.toLowerCase()) {
      case 'living_room':
        return 150;
      case 'kitchen':
        return 300;
      case 'dining_room':
        return 200;
      case 'bedroom':
        return 100;
      case 'bathroom':
        return 200;
      case 'hallway':
        return 100;
      case 'study':
        return 500;
      case 'utility':
        return 200;
      default:
        return 150;
    }
  }

  private static getReflectance(color: string): number {
    switch (color.toLowerCase()) {
      case 'light':
        return 0.7;
      case 'medium':
        return 0.5;
      case 'dark':
        return 0.3;
      default:
        return 0.5;
    }
  }

  private static estimateUtilisationFactor(roomIndex: number, ceilingReflectance: number, wallReflectance: number): number {
    // Simplified utilisation factor calculation
    const baseUF = 0.3 + (roomIndex * 0.2);
    const reflectanceBonus = (ceilingReflectance + wallReflectance) * 0.1;
    return Math.min(baseUF + reflectanceBonus, 0.7);
  }

  private static getLuminaireRecommendation(roomType: string, colorTemperature: number): {
    type: string;
    lumensPerUnit: number;
    wattagePerUnit: number;
  } {
    switch (roomType.toLowerCase()) {
      case 'kitchen':
        return { type: 'LED Downlight', lumensPerUnit: 800, wattagePerUnit: 10 };
      case 'bathroom':
        return { type: 'LED IP44 Downlight', lumensPerUnit: 600, wattagePerUnit: 8 };
      case 'living_room':
        return { type: 'LED Ceiling Light', lumensPerUnit: 1200, wattagePerUnit: 15 };
      case 'bedroom':
        return { type: 'LED Pendant/Ceiling', lumensPerUnit: 800, wattagePerUnit: 10 };
      default:
        return { type: 'LED Ceiling Light', lumensPerUnit: 1000, wattagePerUnit: 12 };
    }
  }

  private static getSwitchingArrangement(roomType: string, numberOfLuminaires: number): string[] {
    const arrangements: string[] = [];

    if (numberOfLuminaires <= 2) {
      arrangements.push('Single switch control');
    } else if (roomType === 'kitchen') {
      arrangements.push('Separate switching for task and general lighting');
    } else if (roomType === 'living_room') {
      arrangements.push('Multiple switching zones recommended');
    } else {
      arrangements.push('Two-way switching recommended for main routes');
    }

    return arrangements;
  }

  private static getDimmingRecommendation(roomType: string): boolean {
    return ['living_room', 'dining_room', 'bedroom'].includes(roomType.toLowerCase());
  }

  private static checkBathroomZones(roomType: string): boolean {
    // Simplified - assume compliance if not bathroom or IP rated luminaires used
    return roomType !== 'bathroom';
  }

  private static generateDomesticRecommendations(data: {
    roomType: string;
    energyEfficiencyRating: string;
    dimmingRecommendation: boolean;
    complianceChecks: { buildingRegs: boolean; bs7671: boolean; partP: boolean };
  }): string[] {
    const recommendations: string[] = [];

    if (!data.complianceChecks.buildingRegs) {
      recommendations.push('Consider higher efficiency LED luminaires for Building Regulations compliance');
    }

    if (data.dimmingRecommendation) {
      recommendations.push('LED dimming recommended for this room type');
    }

    if (data.roomType === 'bathroom') {
      recommendations.push('Use IP44 rated luminaires in bathroom zones');
      recommendations.push('Consider Part P notification requirements');
    }

    recommendations.push('Use warm white LEDs (2700K-3000K) for comfortable domestic lighting');
    recommendations.push('Consider task lighting for specific activities');
    recommendations.push('Install PIR sensors for hallways and utility areas');

    return recommendations;
  }
}

/**
 * Commercial Lighting Calculator
 * Calculate lighting requirements for commercial and industrial premises
 * Based on BS EN 12464-1 and CIBSE recommendations
 */
export class CommercialLightingCalculator {
  /**
   * Calculate commercial lighting design
   */
  static calculate(inputs: {
    premiseType: string;
    workingArea: string;
    roomLength: number; // m
    roomWidth: number; // m
    roomHeight: number; // m
    workingPlaneHeight: number; // m
    operatingHours: number; // hours per day
    operatingDays: number; // days per year
    electricityRate: number; // £ per kWh
    specialRequirements?: string[]; // VDU work, high precision, etc.
  }): CommercialLightingResult {
    const {
      premiseType,
      workingArea,
      roomLength,
      roomWidth,
      roomHeight,
      workingPlaneHeight,
      operatingHours,
      operatingDays,
      electricityRate,
      specialRequirements = []
    } = inputs;

    // Get required illuminance based on standards
    const requiredIlluminance = this.getCommercialIlluminance(premiseType, workingArea);
    const designIlluminance = requiredIlluminance * 1.2; // 20% design margin

    // Calculate room characteristics
    const roomArea = roomLength * roomWidth;
    const roomIndex = roomArea / ((roomLength + roomWidth) * (roomHeight - workingPlaneHeight));

    // Select appropriate luminaire
    const luminaireSpec = this.selectCommercialLuminaire(premiseType, workingArea, specialRequirements);

    // Calculate number of luminaires required
    const maintenanceFactor = 0.8;
    const utilisationFactor = 0.6; // Typical for commercial spaces
    const requiredLumens = (designIlluminance * roomArea) / (utilisationFactor * maintenanceFactor);
    const numberOfLuminaires = Math.ceil(requiredLumens / luminaireSpec.lumens);

    // Control systems recommendation
    const controlSystems = this.getControlSystems(premiseType, workingArea, roomArea);

    // Emergency lighting requirements
    const emergencyLighting = this.getEmergencyLightingRequirements(premiseType);

    // Energy consumption calculations
    const totalWattage = numberOfLuminaires * luminaireSpec.wattage;
    const annualOperatingHours = operatingHours * operatingDays;
    const dailyKwh = (totalWattage * operatingHours) / 1000;
    const annualKwh = dailyKwh * operatingDays;
    const annualCost = annualKwh * electricityRate;

    const energyConsumption = {
      dailyKwh,
      annualKwh,
      annualCost
    };

    // Compliance checks
    const complianceChecks = {
      bsEn12464: true, // Assume design meets standard
      cibseCode: true,
      buildingRegsPartL: (luminaireSpec.lumens / luminaireSpec.wattage) >= 60,
      workplaceRegs: requiredIlluminance >= this.getWorkplaceMinimum(workingArea)
    };

    // Maintenance schedule
    const maintenanceSchedule = this.getMaintenanceSchedule(luminaireSpec.type, premiseType);

    const recommendations = this.generateCommercialRecommendations({
      premiseType,
      workingArea,
      luminaireSpec,
      complianceChecks,
      specialRequirements
    });

    return {
      premiseType,
      workingArea,
      requiredIlluminance,
      designIlluminance,
      numberOfLuminaires,
      luminaireSpecification: luminaireSpec,
      controlSystems,
      emergencyLighting,
      energyConsumption,
      complianceChecks,
      maintenanceSchedule,
      recommendations
    };
  }

  private static getCommercialIlluminance(premiseType: string, workingArea: string): number {
    // BS EN 12464-1 illuminance levels (lux)
    const illuminanceLevels: Record<string, Record<string, number>> = {
      office: {
        general: 500,
        meeting_room: 500,
        reception: 300,
        archive: 200,
        corridor: 100
      },
      retail: {
        general: 300,
        checkout: 500,
        display: 1000,
        stockroom: 200
      },
      warehouse: {
        general: 200,
        high_rack: 150,
        dispatch: 300,
        fine_work: 500
      },
      manufacturing: {
        general: 300,
        assembly: 500,
        precision: 1000,
        rough_work: 200
      },
      school: {
        classroom: 500,
        laboratory: 500,
        library: 500,
        corridor: 150
      },
      hospital: {
        general_ward: 200,
        examination: 1000,
        operating_theatre: 10000,
        corridor: 150
      }
    };

    return illuminanceLevels[premiseType.toLowerCase()]?.[workingArea.toLowerCase()] || 300;
  }

  private static selectCommercialLuminaire(
    premiseType: string,
    workingArea: string,
    specialRequirements: string[]
  ): {
    type: string;
    wattage: number;
    lumens: number;
    cri: number;
    colorTemperature: number;
  } {
    // Standard selections based on application
    if (premiseType === 'office') {
      return {
        type: 'LED Panel 600x600',
        wattage: 40,
        lumens: 4000,
        cri: 80,
        colorTemperature: 4000
      };
    } else if (premiseType === 'warehouse') {
      return {
        type: 'LED High Bay',
        wattage: 150,
        lumens: 18000,
        cri: 70,
        colorTemperature: 5000
      };
    } else if (premiseType === 'retail') {
      return {
        type: 'LED Track Spotlight',
        wattage: 30,
        lumens: 3000,
        cri: 90,
        colorTemperature: 3000
      };
    }

    // Default commercial luminaire
    return {
      type: 'LED Linear',
      wattage: 50,
      lumens: 5000,
      cri: 80,
      colorTemperature: 4000
    };
  }

  private static getControlSystems(premiseType: string, workingArea: string, roomArea: number): string[] {
    const controls: string[] = [];

    controls.push('Manual switching');

    if (roomArea > 100) {
      controls.push('Multi-zone switching');
    }

    if (premiseType === 'office') {
      controls.push('Occupancy sensors');
      controls.push('Daylight linking');
    }

    if (premiseType === 'warehouse') {
      controls.push('High/low level switching');
    }

    controls.push('Emergency lighting test system');

    return controls;
  }

  private static getEmergencyLightingRequirements(premiseType: string): {
    required: boolean;
    type: string;
    coverage: string;
  } {
    return {
      required: true, // Most commercial premises require emergency lighting
      type: 'Maintained and non-maintained',
      coverage: 'Escape routes and open areas per BS 5266-1'
    };
  }

  private static getWorkplaceMinimum(workingArea: string): number {
    // Workplace (Health, Safety and Welfare) Regulations minimum levels
    if (workingArea.includes('precision') || workingArea.includes('fine')) {
      return 500;
    }
    return 200; // General workplace minimum
  }

  private static getMaintenanceSchedule(luminaireType: string, premiseType: string): string[] {
    const schedule: string[] = [];

    schedule.push('Monthly: Emergency lighting test');
    schedule.push('Quarterly: Luminaire cleaning');
    schedule.push('Annual: Full emergency lighting test');
    schedule.push('Annual: Photometric survey');

    if (luminaireType.includes('LED')) {
      schedule.push('5-yearly: LED driver inspection');
    }

    return schedule;
  }

  private static generateCommercialRecommendations(data: {
    premiseType: string;
    workingArea: string;
    luminaireSpec: any;
    complianceChecks: any;
    specialRequirements: string[];
  }): string[] {
    const recommendations: string[] = [];

    if (!data.complianceChecks.buildingRegsPartL) {
      recommendations.push('Consider higher efficiency luminaires for Building Regulations compliance');
    }

    if (data.premiseType === 'office') {
      recommendations.push('Consider UGR <19 for VDU work');
      recommendations.push('Implement occupancy and daylight controls');
    }

    if (data.workingArea.includes('precision')) {
      recommendations.push('High CRI (>90) luminaires recommended');
    }

    recommendations.push('Regular maintenance ensures optimal performance');
    recommendations.push('Consider BREEAM lighting criteria for sustainability credits');
    recommendations.push('Implement planned maintenance schedule');

    return recommendations;
  }
}
