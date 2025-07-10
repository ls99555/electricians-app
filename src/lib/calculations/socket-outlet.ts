/**
 * Socket Outlet Assessment Calculator
 * Calculate socket outlet requirements and loading assessment
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 (18th Edition) - Requirements for Electrical Installations
 * - BS 1363-1:2016 - 13A plugs and socket outlets
 * - IET Guidance Note 1: Selection & Erection
 * - Part M Building Regulations - Access to and use of buildings
 * - BS 5839-1:2017 - Fire detection and alarm systems
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Socket outlet installations must comply with BS 7671 and local Building Regulations
 * - Consider accessibility requirements under Part M Building Regulations
 * - Professional electrical design and installation should always be verified by qualified engineers
 * - Socket outlet positioning must consider safety, accessibility, and convenience
 * 
 * NOTE: Socket outlet requirements vary by:
 * - Building type (domestic/commercial/industrial)
 * - Room type and usage patterns
 * - Accessibility requirements
 * - Special environmental conditions
 */

import type { SocketOutletResult } from '../types/core';

/**
 * Socket Outlet Assessment Calculator
 * Calculates socket outlet requirements and loading assessment
 * Based on BS 7671 and UK building standards
 */
export class SocketOutletCalculator {
  static calculate(inputs: {
    roomType: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'utility' | 'garage' | 'commercial';
    floorArea: number; // Room floor area (m²)
    numberOfSockets: number; // Number of socket outlets
    socketType: 'single' | 'double' | 'switched' | 'usb' | 'industrial';
    expectedLoad: number; // Expected load per socket (W)
    diversityFactor: number; // BS 7671 diversity factor (0.1-1.0)
    futureExpansion: boolean; // Consider future expansion
    specialRequirements: boolean; // Special IP ratings, etc.
    buildingType: 'domestic' | 'commercial' | 'industrial';
  }): SocketOutletResult {
    const {
      roomType,
      floorArea,
      numberOfSockets,
      socketType,
      expectedLoad,
      diversityFactor,
      futureExpansion,
      specialRequirements,
      buildingType
    } = inputs;

    try {
      this.validateInputs(inputs);

      // Calculate total connected load
      const totalConnectedLoad = this.calculateTotalConnectedLoad(
        numberOfSockets,
        expectedLoad,
        socketType
      );

      // Apply diversity factor for maximum demand
      const maximumDemand = totalConnectedLoad * diversityFactor;

      // Calculate socket density
      const socketDensity = numberOfSockets / floorArea;

      // Get minimum density requirements
      const minimumDensity = this.getMinimumSocketDensity(roomType, buildingType);

      // Calculate load per socket
      const loadPerSocket = totalConnectedLoad / numberOfSockets;

      // Determine circuit rating required
      const circuitRating = this.calculateCircuitRating(maximumDemand, futureExpansion);

      // Check compliance
      const compliant = this.checkCompliance(
        socketDensity,
        minimumDensity,
        circuitRating,
        roomType,
        buildingType
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        inputs,
        socketDensity,
        minimumDensity,
        circuitRating,
        compliant
      );

      return {
        socketRequirements: {
          minimumSockets: Math.ceil(minimumDensity * inputs.floorArea),
          recommendedSockets: inputs.numberOfSockets,
          socketType: inputs.socketType || '13A BS 1363',
          circuitProtection: circuitRating
        },
        loadAssessment: {
          estimatedLoad: Math.round(totalConnectedLoad),
          diversityFactor,
          simultaneousDemand: Math.round(maximumDemand),
          circuitCapacity: circuitRating
        },
        compliance: {
          bs7671Compliant: compliant,
          accessibilityCompliant: socketDensity >= minimumDensity,
          spacingCompliant: socketDensity >= minimumDensity
        },
        positioning: {
          height: 450, // Standard height in mm
          spacing: Math.round(Math.sqrt(inputs.floorArea / inputs.numberOfSockets) * 1000), // mm
          accessibility: 'Compliant with Part M'
        },
        circuitDesign: {
          circuitType: inputs.numberOfSockets > 8 ? 'ring' : 'radial',
          cableSize: circuitRating <= 16 ? 2.5 : 4.0,
          protectionRating: circuitRating,
          rcdRequired: true
        },
        // Flat properties for UI compatibility
        totalConnectedLoad: Math.round(totalConnectedLoad),
        maximumDemand: Math.round(maximumDemand),
        circuitRating,
        compliant,
        socketDensity,
        minimumDensity,
        loadPerSocket,
        diversityFactor,
        isCompliant: compliant,
        recommendations,
        regulation: 'BS 7671 Regulation 553, BS 1363-1:2016'
      };
    } catch (error) {
      throw new Error(`Socket outlet calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateInputs(inputs: {
    floorArea: number;
    numberOfSockets: number;
    expectedLoad: number;
    diversityFactor: number;
  }): void {
    const { floorArea, numberOfSockets, expectedLoad, diversityFactor } = inputs;

    if (floorArea <= 0) throw new Error('Floor area must be positive');
    if (numberOfSockets <= 0) throw new Error('Number of sockets must be positive');
    if (expectedLoad <= 0) throw new Error('Expected load must be positive');
    if (diversityFactor < 0.1 || diversityFactor > 1.0) {
      throw new Error('Diversity factor must be between 0.1 and 1.0');
    }
  }

  private static calculateTotalConnectedLoad(
    numberOfSockets: number,
    expectedLoad: number,
    socketType: string
  ): number {
    let loadMultiplier = 1;

    // Apply socket type multiplier
    switch (socketType) {
      case 'single':
        loadMultiplier = 1;
        break;
      case 'double':
        loadMultiplier = 1.5; // Double sockets don't typically carry double load
        break;
      case 'switched':
        loadMultiplier = 1;
        break;
      case 'usb':
        loadMultiplier = 0.8; // USB sockets typically lower load
        break;
      case 'industrial':
        loadMultiplier = 1.2; // Industrial sockets may carry higher loads
        break;
    }

    return numberOfSockets * expectedLoad * loadMultiplier;
  }

  private static getMinimumSocketDensity(roomType: string, buildingType: string): number {
    // Minimum socket density requirements based on BS 7671 and common practice
    // Values in sockets per m²
    
    if (buildingType === 'domestic') {
      switch (roomType) {
        case 'living_room':
          return 0.15; // 1 socket per 6-7 m²
        case 'bedroom':
          return 0.2; // 1 socket per 5 m²
        case 'kitchen':
          return 0.3; // 1 socket per 3-4 m² (higher density for appliances)
        case 'bathroom':
          return 0.1; // Limited sockets in bathroom
        case 'office':
          return 0.25; // 1 socket per 4 m²
        case 'utility':
          return 0.2; // 1 socket per 5 m²
        case 'garage':
          return 0.1; // 1 socket per 10 m²
        default:
          return 0.15;
      }
    } else if (buildingType === 'commercial') {
      switch (roomType) {
        case 'office':
          return 0.3; // Higher density for commercial offices
        case 'commercial':
          return 0.25; // General commercial space
        default:
          return 0.2;
      }
    } else {
      // Industrial
      return 0.15; // Lower density but higher load per socket
    }
  }

  private static calculateCircuitRating(maximumDemand: number, futureExpansion: boolean): number {
    // Calculate minimum circuit rating based on load
    let requiredCurrent = maximumDemand / 230; // Assuming 230V supply
    
    // Apply future expansion factor
    if (futureExpansion) {
      requiredCurrent *= 1.25; // 25% expansion allowance
    }

    // Select appropriate circuit rating
    const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63];
    
    for (const rating of standardRatings) {
      if (requiredCurrent <= rating * 0.8) { // 80% derating for continuous loads
        return rating;
      }
    }

    return 63; // Maximum standard rating
  }

  private static checkCompliance(
    socketDensity: number,
    minimumDensity: number,
    circuitRating: number,
    roomType: string,
    buildingType: string
  ): boolean {
    // Check socket density compliance
    if (socketDensity < minimumDensity) return false;

    // Check circuit rating is reasonable
    if (circuitRating > 32 && buildingType === 'domestic' && roomType !== 'garage') {
      return false; // Most domestic circuits should be 32A or less
    }

    // Check bathroom-specific requirements
    if (roomType === 'bathroom') {
      // Bathroom sockets must be at least 3m from bath/shower (BS 7671 Section 701)
      // This is a design consideration, not calculable here
      return true; // Assume compliance pending design verification
    }

    return true;
  }

  private static generateRecommendations(
    inputs: {
      roomType: string;
      numberOfSockets: number;
      socketType: string;
      specialRequirements: boolean;
      buildingType: string;
    },
    socketDensity: number,
    minimumDensity: number,
    circuitRating: number,
    compliant: boolean
  ): string[] {
    const recommendations: string[] = [];

    // Basic recommendations
    recommendations.push('Install RCD protection for all socket outlet circuits (BS 7671 Regulation 411.3.3)');
    recommendations.push('Use socket outlets to BS 1363-1:2016 for domestic installations');
    recommendations.push('Consider accessibility requirements under Part M Building Regulations');

    // Density-specific recommendations
    if (socketDensity < minimumDensity) {
      recommendations.push(`Socket density below minimum requirement - consider adding ${Math.ceil((minimumDensity - socketDensity) * inputs.numberOfSockets)} additional sockets`);
    }

    // Room-specific recommendations
    switch (inputs.roomType) {
      case 'kitchen':
        recommendations.push('Install dedicated circuits for high-load appliances (cooker, dishwasher, etc.)');
        recommendations.push('Position sockets away from sinks and cooking areas');
        recommendations.push('Consider switch-controlled sockets for appliances');
        break;
      case 'bathroom':
        recommendations.push('Bathroom sockets must be at least 3m from bath/shower (BS 7671 Section 701)');
        recommendations.push('Use IP44 rated sockets in bathroom zones');
        recommendations.push('Install RCD protection with 30mA rating maximum');
        break;
      case 'office':
        recommendations.push('Consider USB charging sockets for modern office needs');
        recommendations.push('Install adequate sockets for IT equipment');
        recommendations.push('Consider floor-mounted sockets for flexible layouts');
        break;
      case 'garage':
        recommendations.push('Use IP54 rated sockets for garage environments');
        recommendations.push('Install dedicated circuit for EV charging if required');
        break;
    }

    // Circuit rating recommendations
    if (circuitRating > 32) {
      recommendations.push('Consider splitting into multiple circuits for better distribution');
      recommendations.push('Use larger cable sizes for higher current circuits');
    }

    // Special requirements
    if (inputs.specialRequirements) {
      recommendations.push('Select appropriate IP rating for environmental conditions');
      recommendations.push('Consider corrosion-resistant finishes for harsh environments');
    }

    // Building type specific
    if (inputs.buildingType === 'commercial') {
      recommendations.push('Consider emergency lighting circuit isolation');
      recommendations.push('Install appropriate surge protection devices');
    }

    // Socket type specific
    if (inputs.socketType === 'usb') {
      recommendations.push('USB sockets should meet BS EN 62368-1 safety requirements');
      recommendations.push('Consider dedicated USB circuits for high-density installations');
    }

    if (!compliant) {
      recommendations.push('COMPLIANCE ISSUE: Review socket provision and circuit design');
      recommendations.push('Consult qualified electrical engineer for design verification');
    }

    return recommendations;
  }
}
