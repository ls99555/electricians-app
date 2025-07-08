/**
 * Load and Demand Calculations
 * Maximum demand, diversity factors, and load assessment calculations
 * Based on BS 7671 18th Edition Appendix A - Current-carrying capacity and voltage drop for cables
 */

import type { 
  MaximumDemandResult, 
  DiversityFactorResult, 
  LoadCalculatorInputs,
  InstallationType 
} from './types';

/**
 * Load Calculator
 * Calculate total electrical load with basic diversity
 * Reference: BS 7671 Appendix A - Diversity factors
 */
export class LoadCalculator {
  /**
   * Calculate total electrical load with diversity factors
   * @param inputs Load calculation parameters
   * @returns Load calculation results with breakdown
   */
  static calculate(inputs: LoadCalculatorInputs): {
    totalLoad: number;
    diversityFactor: number;
    maximumDemand: number;
    breakdown: Array<{ item: string; load: number; diversity: number; demand: number }>;
  } {
    const { lighting, heating, cooking, sockets, otherLoads, installationType } = inputs;

    // Input validation - BS 7671 compliance requires positive values
    if (lighting < 0 || heating < 0 || cooking < 0 || sockets < 0 || otherLoads < 0) {
      throw new Error('All load values must be non-negative');
    }

    if (!installationType) {
      throw new Error('Installation type must be specified');
    }

    const breakdown = [
      { item: 'Lighting', load: lighting, diversity: 0.9, demand: lighting * 0.9 },
      { item: 'Heating', load: heating, diversity: 1.0, demand: heating * 1.0 },
      { item: 'Cooking', load: cooking, diversity: this.getCookingDiversity(cooking), demand: cooking * this.getCookingDiversity(cooking) },
      { item: 'Sockets', load: sockets, diversity: 0.8, demand: sockets * 0.8 },
      { item: 'Other Loads', load: otherLoads, diversity: 1.0, demand: otherLoads * 1.0 }
    ];

    const totalLoad = lighting + heating + cooking + sockets + otherLoads;
    const maximumDemand = breakdown.reduce((sum, item) => sum + item.demand, 0);
    const diversityFactor = totalLoad > 0 ? maximumDemand / totalLoad : 0;

    return {
      totalLoad,
      diversityFactor,
      maximumDemand,
      breakdown
    };
  }

  /**
   * Calculate cooking diversity factor based on BS 7671 Appendix A
   */
  private static getCookingDiversity(cookingLoad: number): number {
    // BS 7671 Appendix A diversity for cooking appliances
    if (cookingLoad <= 10000) return 1.0; // 100% for first 10kW
    if (cookingLoad <= 60000) return 0.8; // 80% average up to 60kW
    return 0.6; // 60% for larger installations
  }
}

/**
 * Maximum Demand Calculator
 * Calculate maximum demand for domestic installations with proper diversity factors
 * Reference: BS 7671 Appendix A - Diversity factors for domestic installations
 */
export class MaximumDemandCalculator {
  /**
   * Calculate maximum demand for an installation
   * @param inputs Installation parameters
   * @returns Maximum demand calculation results
   */
  static calculate(inputs: {
    lighting: number;
    heating: number;
    waterHeating: number;
    cooking: Array<{ appliance: string; rating: number }>;
    socketOutlets: number;
    largeAppliances: Array<{ appliance: string; rating: number }>;
    installationType: InstallationType;
    specialCircuits?: Array<{ circuit: string; rating: number }>;
  }): MaximumDemandResult {
    const {
      lighting,
      heating,
      waterHeating,
      cooking,
      socketOutlets,
      largeAppliances,
      installationType,
      specialCircuits = []
    } = inputs;

    // Input validation - BS 7671 compliance
    if (lighting < 0 || heating < 0 || waterHeating < 0 || socketOutlets < 0) {
      throw new Error('All load values and socket outlet counts must be non-negative');
    }

    if (!installationType) {
      throw new Error('Installation type must be specified for regulation compliance');
    }

    if (!Array.isArray(cooking) || !Array.isArray(largeAppliances)) {
      throw new Error('Cooking appliances and large appliances must be arrays');
    }

    // Calculate total connected load
    const totalCookingRating = cooking.reduce((sum, item) => sum + item.rating, 0);
    const totalApplianceRating = largeAppliances.reduce((sum, item) => sum + item.rating, 0);
    const totalSpecialRating = specialCircuits.reduce((sum, item) => sum + item.rating, 0);
    
    const totalConnectedLoad = lighting + heating + waterHeating + totalCookingRating + 
                               (socketOutlets * 100) + totalApplianceRating + totalSpecialRating;

    // Calculate maximum demand using diversity factors
    const lightingDemand = lighting * 0.9; // 90% for lighting
    const heatingDemand = heating * 1.0; // 100% for heating
    const waterHeatingDemand = waterHeating * 1.0; // 100% for water heating
    const cookingDemand = this.calculateCookingDemand(totalCookingRating);
    const socketDemand = this.calculateSocketDemand(socketOutlets, installationType);
    const applianceDemand = totalApplianceRating * 1.0; // 100% for appliances
    const specialDemand = totalSpecialRating * 1.0; // 100% for special circuits

    const maximumDemand = lightingDemand + heatingDemand + waterHeatingDemand + 
                         cookingDemand + socketDemand + applianceDemand + specialDemand;

    // Overall diversity factor
    const diversityFactor = totalConnectedLoad > 0 ? maximumDemand / totalConnectedLoad : 0;

    // Load breakdown
    const loadBreakdown = [
      { appliance: 'Lighting', connectedLoad: lighting, demand: lightingDemand, diversity: lightingDemand / Math.max(lighting, 1) },
      { appliance: 'Heating', connectedLoad: heating, demand: heatingDemand, diversity: heatingDemand / Math.max(heating, 1) },
      { appliance: 'Water Heating', connectedLoad: waterHeating, demand: waterHeatingDemand, diversity: waterHeatingDemand / Math.max(waterHeating, 1) },
      { appliance: 'Cooking', connectedLoad: totalCookingRating, demand: cookingDemand, diversity: cookingDemand / Math.max(totalCookingRating, 1) },
      { appliance: 'Socket Outlets', connectedLoad: socketOutlets * 100, demand: socketDemand, diversity: socketDemand / Math.max(socketOutlets * 100, 1) },
      { appliance: 'Large Appliances', connectedLoad: totalApplianceRating, demand: applianceDemand, diversity: applianceDemand / Math.max(totalApplianceRating, 1) },
      { appliance: 'Special Circuits', connectedLoad: totalSpecialRating, demand: specialDemand, diversity: specialDemand / Math.max(totalSpecialRating, 1) }
    ];

    const recommendations = this.generateRecommendations(maximumDemand, installationType);

    return {
      totalConnectedLoad,
      maximumDemand,
      diversityFactor,
      loadBreakdown,
      recommendations,
      regulation: 'BS 7671 Appendix A - Current-carrying capacity and voltage drop for cables'
    };
  }

  /**
   * Calculate cooking demand with appropriate diversity
   * Reference: BS 7671 Appendix A - Cooking diversity factors
   */
  private static calculateCookingDemand(totalCookingLoad: number): number {
    // BS 7671 Appendix A cooking diversity
    if (totalCookingLoad <= 10000) {
      return totalCookingLoad * 1.0; // 100% for first 10kW
    } else if (totalCookingLoad <= 60000) {
      return 10000 + (totalCookingLoad - 10000) * 0.5; // 50% for 10-60kW
    } else {
      return 10000 + 25000 + (totalCookingLoad - 60000) * 0.25; // 25% above 60kW
    }
  }

  /**
   * Calculate socket outlet demand with diversity
   * Reference: BS 7671 Appendix A - Socket outlet diversity factors
   */
  private static calculateSocketDemand(socketOutlets: number, installationType: InstallationType): number {
    if (installationType === 'domestic') {
      // Domestic socket diversity (BS 7671 Appendix A)
      if (socketOutlets <= 10) {
        return socketOutlets * 100; // 100W per outlet for first 10
      } else if (socketOutlets <= 20) {
        return 1000 + (socketOutlets - 10) * 50; // 50W for outlets 11-20
      } else {
        return 1500 + (socketOutlets - 20) * 25; // 25W for outlets above 20
      }
    } else {
      // Commercial/industrial - less diversity
      return socketOutlets * 80; // 80W per outlet
    }
  }

  /**
   * Generate recommendations based on calculated demand
   */
  private static generateRecommendations(maximumDemand: number, installationType: InstallationType): string[] {
    const recommendations: string[] = [];
    const current = maximumDemand / 230; // Single phase current

    recommendations.push(`Maximum demand: ${(maximumDemand / 1000).toFixed(1)}kW (${current.toFixed(1)}A)`);
    
    if (current > 100) {
      recommendations.push('Consider three-phase supply for high current demand');
    }
    
    if (current > 80) {
      recommendations.push('100A main switch recommended');
    } else if (current > 60) {
      recommendations.push('80A main switch may be adequate');
    } else {
      recommendations.push('63A main switch should be adequate');
    }

    if (installationType === 'domestic' && maximumDemand > 23000) {
      recommendations.push('Check DNO approval may be required for high demand');
    }

    return recommendations;
  }
}

/**
 * Diversity Factor Calculator
 * Calculate diversity factors for different types of installations
 * Reference: BS 7671 Appendix A - Diversity factors for various load types
 */
export class DiversityFactorCalculator {
  /**
   * Calculate diversity factors for different load types
   */
  static calculate(inputs: {
    lighting: number;
    heating: number;
    socketOutlets: number;
    cookers: Array<{ rating: number; quantity: number }>;
    waterHeating: number;
    airConditioning: number;
    motorLoads: number;
    installationType: InstallationType;
  }): DiversityFactorResult {
    const {
      lighting,
      heating,
      socketOutlets,
      cookers,
      waterHeating,
      airConditioning,
      motorLoads,
      installationType
    } = inputs;

    // Input validation
    if (lighting < 0 || heating < 0 || socketOutlets < 0 || waterHeating < 0 || 
        airConditioning < 0 || motorLoads < 0) {
      throw new Error('All values must be non-negative');
    }

    if (!installationType) {
      throw new Error('Installation type must be specified');
    }

    if (!Array.isArray(cookers)) {
      throw new Error('Cookers must be an array');
    }

    const factors = this.getDiversityFactors(installationType);

    // Calculate demands
    const lightingDemand = lighting * factors.lighting;
    const heatingDemand = heating * factors.heating;
    const socketDemand = this.calculateSocketDiversityDemand(socketOutlets, installationType);
    const cookerDemand = this.calculateCookerDiversityDemand(cookers);
    const waterHeatingDemand = waterHeating * factors.waterHeating;
    const airConditioningDemand = airConditioning * factors.airConditioning;
    const motorDemand = motorLoads * factors.motors;

    const totalDemand = lightingDemand + heatingDemand + socketDemand + 
                       cookerDemand + waterHeatingDemand + airConditioningDemand + motorDemand;

    const totalConnected = lighting + heating + (socketOutlets * 100) + 
                          cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0) +
                          waterHeating + airConditioning + motorLoads;

    const diversityApplied = totalConnected > 0 ? totalDemand / totalConnected : 0;

    const loadBreakdown = [
      { load: 'Lighting', connected: lighting, demand: lightingDemand, diversity: factors.lighting },
      { load: 'Heating', connected: heating, demand: heatingDemand, diversity: factors.heating },
      { load: 'Socket Outlets', connected: socketOutlets * 100, demand: socketDemand, diversity: socketDemand / Math.max(socketOutlets * 100, 1) },
      { load: 'Cookers', connected: cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0), demand: cookerDemand, diversity: cookerDemand / Math.max(cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0), 1) },
      { load: 'Water Heating', connected: waterHeating, demand: waterHeatingDemand, diversity: factors.waterHeating },
      { load: 'Air Conditioning', connected: airConditioning, demand: airConditioningDemand, diversity: factors.airConditioning },
      { load: 'Motors', connected: motorLoads, demand: motorDemand, diversity: factors.motors }
    ];

    return {
      lightingDemand,
      heatingDemand,
      socketDemand,
      cookerDemand,
      waterHeatingDemand,
      airConditioningDemand,
      motorDemand,
      totalDemand,
      diversityApplied,
      loadBreakdown
    };
  }

  /**
   * Get diversity factors based on installation type
   * Reference: BS 7671 Appendix A
   */
  private static getDiversityFactors(installationType: InstallationType) {
    switch (installationType) {
      case 'domestic':
        return {
          lighting: 0.9,
          heating: 1.0,
          waterHeating: 1.0,
          airConditioning: 0.8,
          motors: 1.0
        };
      case 'commercial':
        return {
          lighting: 0.8,
          heating: 0.9,
          waterHeating: 0.8,
          airConditioning: 0.9,
          motors: 0.9
        };
      default: // industrial
        return {
          lighting: 0.7,
          heating: 0.8,
          waterHeating: 0.7,
          airConditioning: 0.8,
          motors: 0.8
        };
    }
  }

  /**
   * Calculate socket outlet diversity demand
   * Reference: BS 7671 Appendix A - Socket outlet diversity factors
   */
  private static calculateSocketDiversityDemand(socketOutlets: number, installationType: InstallationType): number {
    if (installationType === 'domestic') {
      if (socketOutlets <= 10) {
        return socketOutlets * 100;
      } else if (socketOutlets <= 20) {
        return 1000 + (socketOutlets - 10) * 50;
      } else {
        return 1500 + (socketOutlets - 20) * 25;
      }
    }
    return socketOutlets * 80; // Commercial/industrial
  }

  /**
   * Calculate cooker diversity demand
   * Reference: BS 7671 Appendix A - Cooking appliance diversity
   */
  private static calculateCookerDiversityDemand(cookers: Array<{ rating: number; quantity: number }>): number {
    const totalCookerLoad = cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0);
    
    if (totalCookerLoad <= 10000) {
      return totalCookerLoad;
    } else if (totalCookerLoad <= 60000) {
      return 10000 + (totalCookerLoad - 10000) * 0.5;
    } else {
      return 10000 + 25000 + (totalCookerLoad - 60000) * 0.25;
    }
  }
}
