/**
 * Load and Demand Calculations
 * Maximum demand, diversity factors, and load assessment calculations
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
 */
export class LoadCalculator {
  /**
   * Calculate total electrical load
   */
  static calculate(inputs: LoadCalculatorInputs): {
    totalLoad: number;
    diversityFactor: number;
    maximumDemand: number;
    breakdown: Array<{ item: string; load: number; diversity: number; demand: number }>;
  } {
    const { lighting, heating, cooking, sockets, otherLoads, installationType } = inputs;

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
 */
export class MaximumDemandCalculator {
  /**
   * Calculate maximum demand for an installation
   */
  static calculate(inputs: {
    lighting: number; // Total lighting load (W)
    heating: number; // Total heating load (W)
    waterHeating: number; // Water heating load (W)
    cooking: Array<{ appliance: string; rating: number }>; // Cooking appliances
    socketOutlets: number; // Number of socket outlets
    largeAppliances: Array<{ appliance: string; rating: number }>; // Other large loads
    installationType: InstallationType;
    specialCircuits?: Array<{ circuit: string; rating: number }>; // Special circuits
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

    try {
      // Calculate demand for each load type
      const lightingDemand = this.calculateLightingDemand(lighting);
      const heatingDemand = this.calculateHeatingDemand(heating);
      const waterHeatingDemand = this.calculateWaterHeatingDemand(waterHeating);
      const cookingDemand = this.calculateCookingDemand(cooking);
      const socketDemand = this.calculateSocketDemand(socketOutlets, installationType);
      const applianceDemand = this.calculateApplianceDemand(largeAppliances);
      const specialDemand = this.calculateSpecialCircuitDemand(specialCircuits);

      // Calculate total connected load
      const totalCookingRating = cooking.reduce((sum, item) => sum + item.rating, 0);
      const totalApplianceRating = largeAppliances.reduce((sum, item) => sum + item.rating, 0);
      const totalSpecialRating = specialCircuits.reduce((sum, item) => sum + item.rating, 0);
      
      const totalConnectedLoad = lighting + heating + waterHeating + totalCookingRating + 
                                 (socketOutlets * 100) + totalApplianceRating + totalSpecialRating;

      // Calculate maximum demand
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

      const recommendations = this.generateRecommendations(maximumDemand, totalConnectedLoad, installationType);

      return {
        totalConnectedLoad,
        maximumDemand,
        diversityFactor,
        loadBreakdown,
        recommendations,
        regulation: 'BS 7671 Appendix A - Current-carrying capacity and voltage drop for cables'
      };
    } catch (error) {
      throw new Error(`Maximum demand calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static calculateLightingDemand(lighting: number): number {
    // 90% diversity for lighting (BS 7671 Appendix A)
    return lighting * 0.9;
  }

  private static calculateHeatingDemand(heating: number): number {
    // 100% diversity for heating (essential load)
    return heating * 1.0;
  }

  private static calculateWaterHeatingDemand(waterHeating: number): number {
    // 100% diversity for water heating
    return waterHeating * 1.0;
  }

  private static calculateCookingDemand(cooking: Array<{ appliance: string; rating: number }>): number {
    const totalCookingLoad = cooking.reduce((sum, item) => sum + item.rating, 0);
    
    // BS 7671 Appendix A cooking diversity
    if (totalCookingLoad <= 10000) {
      return totalCookingLoad * 1.0; // 100% for first 10kW
    } else if (totalCookingLoad <= 60000) {
      return 10000 + (totalCookingLoad - 10000) * 0.5; // 50% for 10-60kW
    } else {
      return 10000 + 25000 + (totalCookingLoad - 60000) * 0.25; // 25% above 60kW
    }
  }

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

  private static calculateApplianceDemand(appliances: Array<{ appliance: string; rating: number }>): number {
    // Assume 100% demand for large appliances unless specified otherwise
    return appliances.reduce((sum, item) => sum + item.rating, 0);
  }

  private static calculateSpecialCircuitDemand(circuits: Array<{ circuit: string; rating: number }>): number {
    // 100% demand for special circuits
    return circuits.reduce((sum, item) => sum + item.rating, 0);
  }

  private static generateRecommendations(maximumDemand: number, totalConnected: number, installationType: InstallationType): string[] {
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

    const diversity = (maximumDemand / totalConnected) * 100;
    recommendations.push(`Overall diversity factor: ${diversity.toFixed(1)}%`);

    if (installationType === 'domestic' && maximumDemand > 23000) {
      recommendations.push('Check DNO approval may be required for high demand');
    }

    return recommendations;
  }
}

/**
 * Diversity Factor Calculator
 * Calculate diversity factors for different types of loads (BS 7671 Appendix A)
 */
export class DiversityFactorCalculator {
  /**
   * Calculate diversity factors for mixed loads
   */
  static calculate(inputs: {
    lighting: number; // Total lighting load (W)
    heating: number; // Total heating load (W)
    socketOutlets: number; // Number of socket outlets
    cookers: Array<{ rating: number; quantity: number }>; // Cooker ratings and quantities
    waterHeating: number; // Water heating load (W)
    airConditioning: number; // A/C load (W)
    motorLoads: number; // Motor loads (W)
    installationType: InstallationType;
  }): DiversityFactorResult {
    const { lighting, heating, socketOutlets, cookers, waterHeating, airConditioning, motorLoads, installationType } = inputs;

    // Get diversity factors based on installation type
    const factors = this.getDiversityFactors(installationType);

    // Calculate demand for each load type
    const lightingDemand = lighting * factors.lighting;
    const heatingDemand = heating * factors.heating;
    const socketDemand = this.calculateSocketDemand(socketOutlets, installationType);
    const cookerDemand = this.calculateCookerDemand(cookers);
    const waterHeatingDemand = waterHeating * factors.waterHeating;
    const airConditioningDemand = airConditioning * factors.airConditioning;
    const motorDemand = motorLoads * factors.motors;

    const totalConnected = lighting + heating + (socketOutlets * 100) + 
                          cookers.reduce((sum, c) => sum + (c.rating * c.quantity), 0) +
                          waterHeating + airConditioning + motorLoads;

    const totalDemand = lightingDemand + heatingDemand + socketDemand + 
                       cookerDemand + waterHeatingDemand + airConditioningDemand + motorDemand;

    const diversityApplied = totalConnected > 0 ? totalDemand / totalConnected : 0;

    const loadBreakdown = [
      { load: 'Lighting', connected: lighting, demand: lightingDemand, diversity: factors.lighting },
      { load: 'Heating', connected: heating, demand: heatingDemand, diversity: factors.heating },
      { load: 'Socket Outlets', connected: socketOutlets * 100, demand: socketDemand, diversity: socketDemand / (socketOutlets * 100) },
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

  private static getDiversityFactors(installationType: InstallationType) {
    switch (installationType) {
      case 'domestic':
        return {
          lighting: 0.9, // 90% for lighting
          heating: 1.0, // 100% for heating
          waterHeating: 1.0, // 100% for water heating
          airConditioning: 0.8, // 80% for A/C
          motors: 1.0 // 100% for motors
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
          lighting: 0.9,
          heating: 1.0,
          waterHeating: 1.0,
          airConditioning: 1.0,
          motors: 1.0
        };
    }
  }

  private static calculateSocketDemand(socketOutlets: number, installationType: InstallationType): number {
    // Socket outlet diversity (BS 7671 Appendix A, Table A1)
    if (installationType === 'domestic') {
      if (socketOutlets <= 10) return socketOutlets * 100; // 100W per socket for first 10
      if (socketOutlets <= 20) return 1000 + ((socketOutlets - 10) * 50); // 50W for next 10
      return 1500 + ((socketOutlets - 20) * 25); // 25W for remaining
    } else {
      // Commercial/industrial - higher diversity
      return socketOutlets * 80; // 80W per socket average
    }
  }

  private static calculateCookerDemand(cookers: Array<{ rating: number; quantity: number }>): number {
    let totalRating = 0;
    
    cookers.forEach(cooker => {
      totalRating += cooker.rating * cooker.quantity;
    });

    // Cooker diversity (BS 7671 Appendix A)
    if (totalRating <= 10000) return totalRating * 1.0; // 100% for first 10kW
    if (totalRating <= 60000) return 10000 + ((totalRating - 10000) * 0.5); // 50% for next 50kW
    return 35000 + ((totalRating - 60000) * 0.25); // 25% for remainder
  }
}
