/**
 * Lighting Calculations
 * Illuminance, emergency lighting, and lighting design calculations
 * Based on UK regulations and standards
 */

import type { IlluminanceResult, EmergencyLightingResult } from './types';

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
