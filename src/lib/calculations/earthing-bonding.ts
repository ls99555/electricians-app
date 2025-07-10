/**
 * Earthing & Bonding Calculations
 * Protective bonding conductor sizing, fault current analysis, and lightning protection
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 (18th Edition) - Requirements for Electrical Installations
 * - BS 7671 Chapter 54 - Earthing arrangements and protective conductors
 * - BS 7671 Section 411 - Protective measure: automatic disconnection of supply
 * - BS 7671 Section 542 - Earth electrodes
 * - BS 7671 Section 544 - Protective bonding conductors
 * - IET Guidance Note 8 - Earthing & Bonding
 * - BS EN 62305 - Protection against lightning
 * - BS 6651 - Lightning protection systems
 * - IEC 60479 - Effects of current on human beings and livestock
 * 
 * UK Electrical Safety Standards:
 * - Maximum touch voltages (BS 7671 Section 411.3.2.2)
 * - Bonding conductor sizing (BS 7671 Table 54.8)
 * - Earth fault loop impedance limits (BS 7671 Appendix 3)
 * - Lightning protection requirements (BS EN 62305)
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons under BS 7671
 * - Earthing and bonding installations must be inspected and tested by qualified engineers
 * - Lightning protection systems require specialist design and installation
 * - Professional indemnity insurance essential for safety-critical installations
 * - All installations must comply with Building Regulations Part P
 */

import type { 
  BondingConductorInputs,
  BondingConductorResult, 
  ProspectiveFaultCurrentInputs,
  ProspectiveFaultCurrentResult,
  TouchVoltageInputs,
  TouchVoltageResult,
  LightningProtectionInputs,
  LightningProtectionResult
} from './types';

/**
 * Main Protective and Supplementary Bonding Conductor Calculator
 * Calculates conductor sizing per BS 7671 Section 544
 */
export class BondingConductorCalculator {
  /**
   * Calculate bonding conductor requirements
   * Reference: BS 7671:2018+A2:2022 Section 544 - Protective bonding conductors
   */
  static calculate(inputs: BondingConductorInputs): BondingConductorResult {
    const {
      installationType,
      supplyType,
      mainSwitchRating,
      mainEarthConductorCSA,
      pipeMaterial,
      pipeSize,
      pipeLength,
      bondingType
    } = inputs;

    // Main protective bonding conductor sizing (BS 7671 Table 54.8)
    let requiredCSA: number;
    let minimumCSA: number;

    if (bondingType === 'main') {
      // Main protective bonding conductor (BS 7671 Section 544.1.1)
      if (supplyType === 'PME') {
        // PME supply - minimum 10mm² Cu (BS 7671 Table 54.8)
        if (mainEarthConductorCSA <= 35) {
          requiredCSA = Math.max(10, mainEarthConductorCSA / 2);
        } else {
          requiredCSA = 16; // Maximum 16mm² for main bonding
        }
        minimumCSA = 10;
      } else {
        // TN-S or TT supply
        requiredCSA = Math.max(6, mainEarthConductorCSA / 2);
        minimumCSA = 6;
      }
    } else {
      // Supplementary bonding conductor (BS 7671 Section 544.2)
      const circuitConductorCSA = this.estimateCircuitConductorCSA(mainSwitchRating);
      requiredCSA = Math.max(2.5, circuitConductorCSA / 2);
      minimumCSA = 2.5;
    }

    // Adjust for pipe material and installation method
    const materialFactor = this.getMaterialCorrectionFactor(pipeMaterial);
    const adjustedCSA = requiredCSA * materialFactor;

    // Recommended CSA (next standard size up)
    const recommendedCSA = this.getNextStandardSize(adjustedCSA);

    // Bonding method determination
    const bondingMethod = this.determineBondingMethod(
      pipeMaterial,
      pipeSize,
      bondingType
    );

    // Test requirements
    const testRequirements = this.getTestRequirements(bondingType, recommendedCSA);

    // Safety requirements
    const safetyRequirements = this.getSafetyRequirements(
      bondingType,
      supplyType,
      installationType
    );

    // Generate recommendations
    const recommendations = this.generateBondingRecommendations(
      bondingType,
      supplyType,
      pipeMaterial,
      recommendedCSA
    );

    return {
      requiredCSA: Math.round(adjustedCSA * 10) / 10,
      minimumCSA,
      recommendedCSA,
      bondingMethod,
      testRequirements,
      safetyRequirements,
      recommendations,
      regulation: `BS 7671:2018+A2:2022 Section 544 - ${bondingType === 'main' ? 'Main' : 'Supplementary'} protective bonding conductors`
    };
  }

  private static estimateCircuitConductorCSA(current: number): number {
    // Approximate circuit conductor CSA based on current rating
    if (current <= 20) return 2.5;
    if (current <= 32) return 4;
    if (current <= 40) return 6;
    if (current <= 50) return 10;
    if (current <= 63) return 16;
    if (current <= 80) return 25;
    if (current <= 100) return 35;
    return 50;
  }

  private static getMaterialCorrectionFactor(material: string): number {
    switch (material) {
      case 'copper': return 1.0;
      case 'steel': return 1.2; // Higher resistance
      case 'plastic': return 1.0; // Bonding to metallic parts within
      case 'lead': return 1.1;
      default: return 1.0;
    }
  }

  private static getNextStandardSize(requiredCSA: number): number {
    const standardSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    return standardSizes.find(size => size >= requiredCSA) || standardSizes[standardSizes.length - 1];
  }

  private static determineBondingMethod(
    material: string,
    pipeSize: number,
    bondingType: string
  ): string {
    if (material === 'plastic') {
      return 'Bond to metallic fittings or internal metallic parts';
    }

    if (pipeSize < 15) {
      return 'Dedicated bonding clamp for small diameter pipes';
    }

    if (bondingType === 'main') {
      return 'Main bonding clamp with permanent label (BS 951)';
    }

    return 'Supplementary bonding clamp or permanent connection';
  }

  private static getTestRequirements(bondingType: string, csa: number) {
    const testCurrent = bondingType === 'main' ? 25 : 10; // amperes
    const resistanceLimit = bondingType === 'main' ? 0.05 : 0.01; // ohms

    return {
      continuityTest: true,
      resistanceLimit,
      testCurrent
    };
  }

  private static getSafetyRequirements(
    bondingType: string,
    supplyType: string,
    installationType: string
  ): string[] {
    const requirements = [
      'All connections must be accessible for inspection and testing',
      'Bonding conductors must be protected against mechanical damage',
      'Connections must be made using BS 951 clamps or permanent joints'
    ];

    if (bondingType === 'main') {
      requirements.push('Main bonding must be as close as practicable to meter position');
      requirements.push('Label required: "Safety Electrical Connection - Do Not Remove"');
    }

    if (supplyType === 'PME') {
      requirements.push('PME conditions apply - enhanced bonding requirements');
      requirements.push('All extraneous-conductive-parts must be bonded');
    }

    if (installationType === 'commercial' || installationType === 'industrial') {
      requirements.push('Enhanced inspection and testing schedule required');
      requirements.push('Documented maintenance procedures essential');
    }

    return requirements;
  }

  private static generateBondingRecommendations(
    bondingType: string,
    supplyType: string,
    pipeMaterial: string,
    recommendedCSA: number
  ): string[] {
    const recommendations = [
      `Install ${recommendedCSA}mm² bonding conductor as calculated`,
      'Ensure all connections are tight and corrosion-resistant',
      'Test continuity before energizing installation'
    ];

    if (bondingType === 'main') {
      recommendations.push('Connect all main services: water, gas, oil, structural steel');
      recommendations.push('Maintain bonding conductor run as short as practicable');
    }

    if (supplyType === 'PME') {
      recommendations.push('Consider supplementary bonding in wet areas');
      recommendations.push('Ensure all metallic services are included in bonding');
    }

    if (pipeMaterial === 'plastic') {
      recommendations.push('Verify presence of metallic parts requiring bonding');
      recommendations.push('Consider installation method and accessibility');
    }

    recommendations.push('Schedule regular inspection and testing as per BS 7671');
    recommendations.push('Maintain accurate installation records and test certificates');

    return recommendations;
  }
}

/**
 * Prospective Fault Current Calculator
 * Calculates fault levels for equipment selection and safety assessment
 * Reference: BS 7671 Appendix 3, IET Guidance Note 3
 */
export class ProspectiveFaultCurrentCalculator {
  /**
   * Calculate prospective fault current
   */
  static calculate(inputs: ProspectiveFaultCurrentInputs): ProspectiveFaultCurrentResult {
    const {
      systemVoltage,
      sourceImpedance,
      cableImpedance,
      transformerRating,
      transformerImpedance,
      faultType,
      systemType
    } = inputs;

    // Total circuit impedance
    const totalImpedance = sourceImpedance + cableImpedance;

    // Fault current calculation based on fault type
    let faultCurrent: number;
    let faultVoltage = systemVoltage;

    switch (faultType) {
      case 'three_phase':
        faultCurrent = (systemVoltage * Math.sqrt(3)) / totalImpedance;
        break;
      case 'phase_to_phase':
        faultCurrent = systemVoltage / totalImpedance;
        break;
      case 'single_phase_earth':
        // Adjust for earth fault loop impedance
        if (systemType === 'TT') {
          faultVoltage = systemVoltage / Math.sqrt(3); // Phase to neutral
          faultCurrent = faultVoltage / (totalImpedance * 1.5); // Including earth electrode
        } else {
          faultVoltage = systemVoltage / Math.sqrt(3);
          faultCurrent = faultVoltage / totalImpedance;
        }
        break;
      default:
        faultCurrent = systemVoltage / totalImpedance;
    }

    // Convert to kA
    const faultLevel = faultCurrent / 1000;

    // Calculate X/R ratio (typical values)
    const X_R_ratio = this.calculateXRRatio(transformerRating, transformerImpedance);

    // Asymmetrical fault current (peak value)
    const asymmetricalFaultCurrent = faultCurrent * Math.sqrt(2) * (1 + Math.exp(-Math.PI / X_R_ratio));

    // Breaking capacity requirements
    const breakingCapacityRequired = this.calculateBreakingCapacity(faultLevel, X_R_ratio);

    // Device selection
    const deviceSelection = this.selectDevices(breakingCapacityRequired, systemVoltage);

    // Safety assessment
    const safetyConcerns = this.assessSafetyConcerns(faultCurrent, faultLevel, systemType);

    // Generate recommendations
    const recommendations = this.generateFaultCurrentRecommendations(
      faultLevel,
      breakingCapacityRequired,
      systemType
    );

    return {
      faultCurrent: Math.round(faultCurrent),
      faultLevel: Math.round(faultLevel * 100) / 100,
      breakingCapacityRequired: Math.round(breakingCapacityRequired * 100) / 100,
      symmetricalFaultCurrent: Math.round(faultCurrent),
      asymmetricalFaultCurrent: Math.round(asymmetricalFaultCurrent),
      X_R_ratio: Math.round(X_R_ratio * 100) / 100,
      deviceSelection,
      safetyConcerns,
      recommendations,
      regulation: 'BS 7671:2018+A2:2022 Appendix 3 - Time/current characteristics and Guidance Note 3'
    };
  }

  private static calculateXRRatio(transformerRating: number, transformerImpedance: number): number {
    // Typical X/R ratios for different transformer sizes
    if (transformerRating < 100) return 2.5;
    if (transformerRating < 500) return 4.0;
    if (transformerRating < 1000) return 6.0;
    return 8.0;
  }

  private static calculateBreakingCapacity(faultLevel: number, xrRatio: number): number {
    // Apply safety margin and asymmetrical factor
    const asymmetricalFactor = Math.sqrt(1 + Math.pow(xrRatio, 2));
    return faultLevel * asymmetricalFactor * 1.2; // 20% safety margin
  }

  private static selectDevices(requiredCapacity: number, voltage: number) {
    const recommendedDevices = [];
    let minimumBreakingCapacity = Math.ceil(requiredCapacity);

    // Standard breaking capacities (kA)
    const standardCapacities = [6, 10, 16, 25, 36, 50, 80];
    minimumBreakingCapacity = standardCapacities.find(cap => cap >= requiredCapacity) || 80;

    if (voltage <= 400) {
      if (minimumBreakingCapacity <= 6) {
        recommendedDevices.push('MCB Type B (6kA breaking capacity)');
      } else if (minimumBreakingCapacity <= 10) {
        recommendedDevices.push('MCB Type C (10kA breaking capacity)');
      } else if (minimumBreakingCapacity <= 25) {
        recommendedDevices.push('MCCB (up to 25kA breaking capacity)');
      } else {
        recommendedDevices.push('High breaking capacity MCCB or ACB required');
      }
    } else {
      recommendedDevices.push('HV switchgear with appropriate breaking capacity');
    }

    return {
      minimumBreakingCapacity,
      recommendedDevices
    };
  }

  private static assessSafetyConcerns(faultCurrent: number, faultLevel: number, systemType: string): string[] {
    const concerns = [];

    if (faultLevel > 25) {
      concerns.push('Very high fault level - enhanced safety precautions required');
      concerns.push('Arc flash risk assessment essential');
    }

    if (faultLevel > 50) {
      concerns.push('Extreme fault level - specialist equipment required');
      concerns.push('Remote operation and monitoring recommended');
    }

    if (systemType === 'TT') {
      concerns.push('TT system - RCD protection mandatory for safety');
      concerns.push('Earth electrode resistance critical for fault clearance');
    }

    if (faultCurrent > 10000) {
      concerns.push('High fault current - consider parallel neutral conductors');
      concerns.push('Electromagnetic forces during fault conditions');
    }

    return concerns;
  }

  private static generateFaultCurrentRecommendations(
    faultLevel: number,
    requiredCapacity: number,
    systemType: string
  ): string[] {
    const recommendations = [
      `Select devices with minimum ${requiredCapacity}kA breaking capacity`,
      'Verify calculations with actual transformer data',
      'Consider future load growth in equipment selection'
    ];

    if (faultLevel > 10) {
      recommendations.push('Conduct arc flash risk assessment');
      recommendations.push('Implement appropriate PPE requirements');
    }

    if (systemType === 'TT') {
      recommendations.push('Ensure earth electrode resistance meets BS 7671 requirements');
      recommendations.push('Install appropriate RCD protection');
    }

    recommendations.push('Regular testing and maintenance of protective devices');
    recommendations.push('Maintain up-to-date single line diagrams');
    recommendations.push('Document all fault level calculations for future reference');

    return recommendations;
  }
}

/**
 * Touch and Step Voltage Calculator
 * Safety assessment for human exposure to electrical potentials
 * Reference: IEC 60479, BS 7671 Section 411.3.2.2
 */
export class TouchVoltageCalculator {
  /**
   * Calculate touch and step voltages for safety assessment
   */
  static calculate(inputs: TouchVoltageInputs): TouchVoltageResult {
    const {
      faultCurrent,
      earthResistance,
      bodyResistance,
      contactConditions,
      exposureTime,
      currentPath
    } = inputs;

    // Touch voltage calculation
    const touchVoltage = faultCurrent * earthResistance;

    // Step voltage (simplified - assumes uniform current distribution)
    const stepVoltage = touchVoltage * 0.5; // Conservative approximation

    // Body resistance adjustment for conditions
    const adjustedBodyResistance = this.adjustBodyResistance(bodyResistance, contactConditions);

    // Current through body
    const bodyCurrent = (touchVoltage / adjustedBodyResistance) * 1000; // mA

    // Fibrillation threshold (IEC 60479)
    const fibrillationCurrent = this.getFibrillationThreshold(exposureTime, currentPath);

    // Safety limits assessment
    const safetyLimits = {
      safe: bodyCurrent < fibrillationCurrent && touchVoltage < 50,
      ac50V: touchVoltage <= 50, // BS 7671 normal conditions
      ac25V: touchVoltage <= 25  // BS 7671 wet conditions
    };

    // Protection requirements
    const protectionRequired = !safetyLimits.safe;
    const rcdRequired = protectionRequired || contactConditions === 'wet';
    
    // RCD rating calculation
    let rcdRating = 30; // mA default
    if (bodyCurrent > 10) {
      rcdRating = Math.min(30, Math.max(10, fibrillationCurrent * 0.5));
    }

    // Generate recommendations
    const recommendations = this.generateTouchVoltageRecommendations(
      touchVoltage,
      stepVoltage,
      protectionRequired,
      rcdRequired,
      contactConditions
    );

    return {
      touchVoltage: Math.round(touchVoltage * 10) / 10,
      stepVoltage: Math.round(stepVoltage * 10) / 10,
      fibrillationCurrent: Math.round(fibrillationCurrent * 10) / 10,
      safetyLimits,
      protectionRequired,
      rcdRequired,
      rcdRating,
      recommendations,
      regulation: 'BS 7671:2018+A2:2022 Section 411.3.2.2 and IEC 60479'
    };
  }

  private static adjustBodyResistance(baseResistance: number, conditions: string): number {
    switch (conditions) {
      case 'dry': return baseResistance;
      case 'wet': return baseResistance * 0.5; // Reduced resistance
      case 'immersed': return baseResistance * 0.25; // Significantly reduced
      default: return baseResistance;
    }
  }

  private static getFibrillationThreshold(time: number, path: string): number {
    // IEC 60479 fibrillation thresholds (mA)
    let baseThreshold = 50; // mA for hand-to-hand path

    switch (path) {
      case 'hand_to_hand': baseThreshold = 50; break;
      case 'hand_to_feet': baseThreshold = 50; break;
      case 'feet_to_feet': baseThreshold = 150; break; // Higher threshold
    }

    // Time adjustment (simplified)
    if (time < 0.1) return baseThreshold * 2; // Short exposure
    if (time > 1.0) return baseThreshold * 0.7; // Extended exposure

    return baseThreshold;
  }

  private static generateTouchVoltageRecommendations(
    touchVoltage: number,
    stepVoltage: number,
    protectionRequired: boolean,
    rcdRequired: boolean,
    conditions: string
  ): string[] {
    const recommendations = [];

    if (protectionRequired) {
      recommendations.push('Additional protection measures required');
      recommendations.push('Consider improving earthing system');
    }

    if (rcdRequired) {
      recommendations.push('Install RCD protection for safety');
      recommendations.push('Regular RCD testing essential');
    }

    if (touchVoltage > 25 && conditions === 'wet') {
      recommendations.push('Enhanced protection required for wet conditions');
      recommendations.push('Consider supplementary bonding');
    }

    if (stepVoltage > 50) {
      recommendations.push('Step voltage exceeds safe limits');
      recommendations.push('Improve earth electrode design');
    }

    recommendations.push('Regular testing of earthing system resistance');
    recommendations.push('Ensure all exposed metalwork is properly bonded');
    recommendations.push('Consider soil resistivity variations');

    return recommendations;
  }
}

/**
 * Lightning Protection Calculator
 * Risk assessment and system design for lightning protection
 * Reference: BS EN 62305, BS 6651
 */
export class LightningProtectionCalculator {
  /**
   * Calculate lightning protection requirements
   */
  static calculate(inputs: LightningProtectionInputs): LightningProtectionResult {
    const {
      buildingHeight,
      buildingWidth,
      buildingLength,
      buildingType,
      locationDensity,
      environmentalFactor,
      surroundingStructures,
      contentValue
    } = inputs;

    // Risk assessment calculation (simplified BS EN 62305-2)
    const riskAssessment = this.calculateRiskAssessment(
      buildingHeight,
      buildingWidth,
      buildingLength,
      buildingType,
      locationDensity,
      environmentalFactor,
      surroundingStructures,
      contentValue
    );

    // Protection level determination
    const protectionLevel = this.determineProtectionLevel(riskAssessment.riskLevel);

    // System design
    const systemDesign = this.designProtectionSystem(
      buildingHeight,
      buildingWidth,
      buildingLength,
      protectionLevel
    );

    // Equipotential bonding requirements
    const equipotentialBonding = this.calculateBondingRequirements(
      buildingType,
      protectionLevel
    );

    // Generate recommendations
    const recommendations = this.generateLightningRecommendations(
      riskAssessment.requiredProtection,
      protectionLevel,
      buildingType
    );

    return {
      riskAssessment,
      protectionLevel,
      systemDesign,
      equipotentialBonding,
      recommendations,
      regulation: 'BS EN 62305:2012 Lightning Protection Standard'
    };
  }

  private static calculateRiskAssessment(
    height: number,
    width: number,
    length: number,
    buildingType: string,
    density: number,
    environment: string,
    surroundings: string,
    contentValue: string
  ) {
    // Simplified risk calculation
    const area = width * length / 1000000; // km²
    const heightFactor = Math.min(height / 20, 3); // Height influence
    
    let environmentFactor = 1;
    switch (environment) {
      case 'rural': environmentFactor = 0.5; break;
      case 'suburban': environmentFactor = 1.0; break;
      case 'urban': environmentFactor = 1.5; break;
      case 'industrial': environmentFactor = 2.0; break;
    }

    let surroundingFactor = 1;
    switch (surroundings) {
      case 'isolated': surroundingFactor = 2.0; break;
      case 'surrounded': surroundingFactor = 1.0; break;
      case 'higher_structures': surroundingFactor = 0.5; break;
    }

    let buildingFactor = 1;
    switch (buildingType) {
      case 'residential': buildingFactor = 1.0; break;
      case 'commercial': buildingFactor = 1.5; break;
      case 'industrial': buildingFactor = 2.0; break;
      case 'hospital': buildingFactor = 3.0; break;
      case 'school': buildingFactor = 2.5; break;
    }

    const annualRiskFrequency = density * area * heightFactor * environmentFactor * 
                                surroundingFactor * buildingFactor;

    const acceptableRisk = 0.00001; // 10^-5 typical acceptable risk

    let riskLevel: 'low' | 'medium' | 'high' | 'very_high';
    if (annualRiskFrequency < acceptableRisk) riskLevel = 'low';
    else if (annualRiskFrequency < acceptableRisk * 10) riskLevel = 'medium';
    else if (annualRiskFrequency < acceptableRisk * 100) riskLevel = 'high';
    else riskLevel = 'very_high';

    return {
      requiredProtection: annualRiskFrequency > acceptableRisk,
      riskLevel,
      annualRiskFrequency: Math.round(annualRiskFrequency * 1000000) / 1000000,
      acceptableRisk
    };
  }

  private static determineProtectionLevel(riskLevel: string): 'I' | 'II' | 'III' | 'IV' | 'none' {
    switch (riskLevel) {
      case 'very_high': return 'I'; // Highest protection
      case 'high': return 'II';
      case 'medium': return 'III';
      case 'low': return 'IV'; // Basic protection
      default: return 'none';
    }
  }

  private static designProtectionSystem(
    height: number,
    width: number,
    length: number,
    protectionLevel: string
  ) {
    let rodLength = 1.5; // meters
    let spacingDistance = 20; // meters
    let meshSize = 20; // meters

    switch (protectionLevel) {
      case 'I':
        rodLength = 2.0;
        spacingDistance = 10;
        meshSize = 5;
        break;
      case 'II':
        rodLength = 1.5;
        spacingDistance = 15;
        meshSize = 10;
        break;
      case 'III':
        rodLength = 1.5;
        spacingDistance = 20;
        meshSize = 15;
        break;
      case 'IV':
        rodLength = 1.0;
        spacingDistance = 25;
        meshSize = 20;
        break;
    }

    // Down conductor calculation
    const perimeter = 2 * (width + length);
    const numberOfDownConductors = Math.max(2, Math.ceil(perimeter / spacingDistance));

    // Conductor CSA based on protection level
    let conductorCSA = 50; // mm²
    if (protectionLevel === 'I' || protectionLevel === 'II') {
      conductorCSA = 70;
    }

    return {
      airTerminals: {
        rodLength,
        spacingDistance,
        meshSize
      },
      downConductors: {
        number: numberOfDownConductors,
        csa: conductorCSA,
        material: 'copper' as const
      },
      earthing: {
        electrodeType: 'ring' as const,
        resistance: 10, // ohms target
        conductorCSA: conductorCSA
      }
    };
  }

  private static calculateBondingRequirements(buildingType: string, protectionLevel: string) {
    const required = protectionLevel !== 'none';
    let bondingConductorCSA = 16; // mm²

    if (protectionLevel === 'I' || protectionLevel === 'II') {
      bondingConductorCSA = 25;
    }

    const services = [
      'Water supply',
      'Gas supply',
      'Electrical supply',
      'Telecommunications',
      'HVAC systems'
    ];

    if (buildingType === 'hospital' || buildingType === 'industrial') {
      services.push('Medical gas systems', 'Fire safety systems');
    }

    return {
      required,
      bondingConductorCSA,
      services
    };
  }

  private static generateLightningRecommendations(
    protectionRequired: boolean,
    protectionLevel: string,
    buildingType: string
  ): string[] {
    const recommendations = [];

    if (!protectionRequired) {
      recommendations.push('Lightning protection not required based on risk assessment');
      recommendations.push('Consider basic surge protection for sensitive equipment');
      return recommendations;
    }

    recommendations.push(`Install Class ${protectionLevel} lightning protection system`);
    recommendations.push('Engage qualified lightning protection specialist');
    recommendations.push('Ensure system design meets BS EN 62305 requirements');
    
    if (protectionLevel === 'I' || protectionLevel === 'II') {
      recommendations.push('High protection level - enhanced earthing required');
      recommendations.push('Consider surge protection devices throughout installation');
    }

    if (buildingType === 'hospital' || buildingType === 'school') {
      recommendations.push('Enhanced safety measures for occupied buildings');
      recommendations.push('Consider backup systems and emergency procedures');
    }

    recommendations.push('Regular inspection and maintenance essential');
    recommendations.push('Annual testing of earth electrode resistance');
    recommendations.push('Document all installation and test records');

    return recommendations;
  }
}
