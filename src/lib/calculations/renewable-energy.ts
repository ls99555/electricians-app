/**
 * Renewable Energy Calculations
 * Solar PV, Battery Storage, and renewable energy systems calculations
 * 
 * Based on:
 * - BS 7671:2018+A2:2022 Section 712 - Solar photovoltaic (PV) power supply systems
 * - BS EN 62446-1:2016 - Photovoltaic systems - Requirements for testing, documentation and maintenance
 * - MCS 012 - Product certification scheme requirements: Inverters for Microgeneration Installations
 * - G98/G99 - Grid connection requirements for generators up to 16A/75A per phase
 * - IET Code of Practice for Grid-connected Solar Photovoltaic Systems
 * - BS EN 62109 - Safety of power converters for use in photovoltaic power systems
 * 
 * UK Solar PV Requirements:
 * - AC disconnect required within 3m of inverter (BS 7671 712.537.2.1.1)
 * - DC isolation required at array and inverter (BS 7671 712.537.2.2.1)
 * - Earthing requirements (BS 7671 712.542)
 * - G98 notification for systems ≤16A per phase
 * - G99 application for systems >16A per phase
 * 
 * IMPORTANT DISCLAIMERS:
 * - These calculations provide guidance only and do not constitute professional advice
 * - All electrical work must be carried out by competent persons
 * - Solar installations must comply with MCS standards and G98/G99 requirements
 * - Grid connection approval required from Distribution Network Operator
 * - Professional indemnity insurance recommended for all electrical work
 */

import type { 
  SolarPVResult, 
  BatteryStorageResult,
  WindTurbineInputs,
  WindTurbineResult,
  GeneratorSizingInputs,
  GeneratorSizingResult,
  StandbyGeneratorInputs,
  StandbyGeneratorResult,
  FeedInTariffInputs,
  FeedInTariffResult,
  CarbonFootprintInputs,
  CarbonFootprintResult
} from '../types/renewable-energy';

/**
 * Solar PV System Calculator
 * Based on MCS standards and G98/G99 connection requirements
 * References: BS EN 62446, MCS 012
 */
export class SolarPVCalculator {
  /**
   * Calculate solar PV system parameters
   * @param panelWattage - Individual panel wattage (W)
   * @param numPanels - Number of panels
   * @param systemVoltage - System DC voltage (V)
   * @param irradiance - Solar irradiance (W/m²) - default 1000
   * @param temperature - Ambient temperature (°C) - default 25
   * @param inverterEfficiency - Inverter efficiency (%) - default 95
   * @returns Solar PV calculation results
   */
  static calculate(
    panelWattage: number,
    numPanels: number,
    systemVoltage: number,
    irradiance: number = 1000,
    temperature: number = 25,
    inverterEfficiency: number = 95
  ): SolarPVResult {
    if (panelWattage <= 0 || numPanels <= 0 || systemVoltage <= 0) {
      throw new Error('Invalid input parameters for solar PV calculation');
    }

    // System capacity calculations
    const systemCapacity = panelWattage * numPanels; // Wp
    const dcCurrent = systemCapacity / systemVoltage;
    
    // Temperature derating (typical -0.4%/°C above 25°C)
    const tempDerating = temperature > 25 ? 1 - ((temperature - 25) * 0.004) : 1;
    
    // Irradiance factor (1000 W/m² = 1.0)
    const irradianceFactor = irradiance / 1000;
    
    // Calculate actual power output
    const dcPowerOutput = systemCapacity * tempDerating * irradianceFactor;
    const acPowerOutput = dcPowerOutput * (inverterEfficiency / 100);
    
    // Annual energy yield (kWh) - typical UK yield 900-1100 kWh/kWp
    const specificYield = 950; // kWh/kWp/year (conservative estimate for UK)
    const annualYield = (systemCapacity / 1000) * specificYield;
    
    // G98/G99 connection requirements
    const isG98Compliant = systemCapacity <= 3680; // Single phase limit
    const connectionType = systemCapacity <= 3680 ? 'G98' : 'G99';
    
    // String calculations
    const maxStringLength = Math.floor(systemVoltage / 12); // Approximate for typical panels
    const stringsRequired = Math.ceil(numPanels / maxStringLength);
    
    return {
      systemCapacity,
      dcCurrent,
      dcPowerOutput,
      acPowerOutput,
      annualYield,
      tempDerating,
      irradianceFactor,
      inverterEfficiency: inverterEfficiency / 100,
      isG98Compliant,
      connectionType,
      stringsRequired,
      maxStringLength,
      regulation: 'MCS 012, BS EN 62446, G98/G99'
    };
  }

  /**
   * Calculate cable sizing for DC side of PV system
   * Based on voltage drop and current carrying capacity
   */
  static calculateDCCabling(
    current: number,
    cableLength: number,
    maxVoltageDrop: number = 3, // 3% for DC side
    systemVoltage: number = 600
  ) {
    // DC cable sizing considerations
    // Higher current capacity required due to continuous operation
    const sizingFactor = 1.25; // 125% sizing factor for continuous loads
    const requiredCurrent = current * sizingFactor;
    
    // Voltage drop calculation for DC
    const voltageDropLimit = (maxVoltageDrop / 100) * systemVoltage;
    
    return {
      requiredCurrent,
      voltageDropLimit,
      regulation: 'BS 7671 Section 712, MCS 012'
    };
  }
}

/**
 * Battery Storage System Calculator
 * Based on BS EN 62933 and IET Code of Practice for Electrical Energy Storage Systems
 */
export class BatteryStorageCalculator {
  /**
   * Calculate battery storage system parameters
   * @param capacity - Battery capacity (kWh)
   * @param voltage - Battery voltage (V)
   * @param chargePower - Maximum charge power (kW)
   * @param dischargePower - Maximum discharge power (kW)
   * @param efficiency - Round-trip efficiency (%) - default 90
   * @param dod - Depth of discharge (%) - default 80
   * @returns Battery storage calculation results
   */
  static calculate(
    capacity: number,
    voltage: number,
    chargePower: number,
    dischargePower: number,
    efficiency: number = 90,
    dod: number = 80
  ): BatteryStorageResult {
    if (capacity <= 0 || voltage <= 0 || chargePower <= 0 || dischargePower <= 0) {
      throw new Error('Invalid input parameters for battery storage calculation');
    }

    // Usable capacity based on depth of discharge
    const usableCapacity = capacity * (dod / 100);
    
    // Current calculations
    const maxChargeCurrent = (chargePower * 1000) / voltage;
    const maxDischargeCurrent = (dischargePower * 1000) / voltage;
    
    // C-rate calculations (charge/discharge rate relative to capacity)
    const chargeRate = chargePower / capacity;
    const dischargeRate = dischargePower / capacity;
    
    // Duration calculations
    const chargeDuration = usableCapacity / chargePower;
    const dischargeDuration = usableCapacity / dischargePower;
    
    // Energy throughput calculations
    const dailyCycles = 1; // Typical domestic usage
    const annualThroughput = usableCapacity * dailyCycles * 365;
    
    // Safety considerations for lithium batteries
    const requiresBMS = true; // Battery Management System mandatory
    const requiresFireSuppression = capacity > 20; // >20kWh systems
    const requiresVentilation = capacity > 10; // >10kWh systems
    
    // Grid connection requirements
    const requiresG98 = dischargePower <= 3.68; // Single phase limit
    const connectionType = dischargePower <= 3.68 ? 'G98' : 'G99';
    
    return {
      capacity,
      usableCapacity,
      voltage,
      maxChargeCurrent,
      maxDischargeCurrent,
      chargeRate,
      dischargeRate,
      chargeDuration,
      dischargeDuration,
      efficiency: efficiency / 100,
      dod: dod / 100,
      annualThroughput,
      requiresBMS,
      requiresFireSuppression,
      requiresVentilation,
      requiresG98,
      connectionType,
      regulation: 'BS EN 62933, IET Code of Practice for ESS'
    };
  }

  /**
   * Calculate battery protection requirements
   * Based on IET Code of Practice and BS 7671 Section 712
   */
  static calculateProtection(
    capacity: number,
    voltage: number,
    installationLocation: 'internal' | 'external' | 'garage'
  ) {
    // Protection device ratings
    const overCurrentProtection = true;
    const isolationRequired = true;
    const earthingRequired = true;
    
    // Fire safety requirements
    const fireDetection = capacity > 5; // >5kWh systems
    const emergencyShutdown = capacity > 10; // >10kWh systems
    
    // Ventilation requirements
    const naturalVentilation = installationLocation === 'external';
    const mechanicalVentilation = capacity > 20 && installationLocation === 'internal';
    
    // Thermal management
    const thermalManagement = capacity > 5;
    const temperatureMonitoring = true;
    
    return {
      overCurrentProtection,
      isolationRequired,
      earthingRequired,
      fireDetection,
      emergencyShutdown,
      naturalVentilation,
      mechanicalVentilation,
      thermalManagement,
      temperatureMonitoring,
      regulation: 'IET Code of Practice for ESS, BS 7671 Section 712'
    };
  }

  /**
   * Calculate battery system economics
   * Including payback period and lifecycle costs
   */
  static calculateEconomics(
    systemCost: number,
    capacity: number,
    dailyUsage: number,
    electricityRate: number,
    feedInTariff: number = 0
  ) {
    // Annual savings calculation
    const annualSavings = dailyUsage * 365 * electricityRate;
    const additionalIncome = capacity * 365 * feedInTariff;
    const totalAnnualBenefit = annualSavings + additionalIncome;
    
    // Payback calculation
    const paybackPeriod = systemCost / totalAnnualBenefit;
    
    // Lifecycle analysis (typical 10-15 year warranty)
    const warrantyPeriod = 10;
    const lifecycleSavings = totalAnnualBenefit * warrantyPeriod;
    const netBenefit = lifecycleSavings - systemCost;
    
    return {
      annualSavings,
      additionalIncome,
      totalAnnualBenefit,
      paybackPeriod,
      lifecycleSavings,
      netBenefit,
      warrantyPeriod
    };
  }
}

/**
 * EV Charging Calculator
 * Based on IET Code of Practice for EV Charging and BS EN 61851
 */
export class EVChargingCalculator {
  /**
   * Calculate EV charging requirements
   * @param chargingPower - Charging power (kW)
   * @param batteryCapacity - Vehicle battery capacity (kWh)
   * @param chargingType - Type of charging (slow/fast/rapid)
   * @param supplyVoltage - Supply voltage (V)
   * @returns EV charging calculation results
   */
  static calculate(
    chargingPower: number,
    batteryCapacity: number,
    chargingType: 'slow' | 'fast' | 'rapid',
    supplyVoltage: number = 230
  ) {
    if (chargingPower <= 0 || batteryCapacity <= 0) {
      throw new Error('Invalid input parameters for EV charging calculation');
    }

    // Current calculation
    const chargingCurrent = (chargingPower * 1000) / supplyVoltage;
    
    // Charging time calculation (0-80% typical for rapid charging)
    const chargingEfficiency = chargingType === 'rapid' ? 0.85 : 0.92;
    const usableCapacity = batteryCapacity * 0.8; // 0-80% charging
    const chargingTime = usableCapacity / (chargingPower * chargingEfficiency);
    
    // Cable requirements
    const cableRating = chargingCurrent * 1.3; // 30% safety margin
    
    // Protection requirements
    const rcdRequired = true;
    const rcdType = chargingPower > 7 ? 'Type B' : 'Type A';
    const mcbRating = Math.ceil(chargingCurrent * 1.15); // 15% margin
    
    // Earthing and bonding
    const earthingRequired = true;
    const bondingRequired = true;
    
    // Load management
    const loadManagement = chargingPower > 7;
    const smartCharging = chargingPower > 7;
    
    return {
      chargingPower,
      chargingCurrent,
      chargingTime,
      cableRating,
      rcdRequired,
      rcdType,
      mcbRating,
      earthingRequired,
      bondingRequired,
      loadManagement,
      smartCharging,
      chargingEfficiency,
      regulation: 'IET Code of Practice for EV Charging, BS EN 61851'
    };
  }

  /**
   * Calculate diversity factor for multiple EV charging points
   * Based on IET guidance for EV installations
   */
  static calculateDiversity(numberOfChargers: number, individualPower: number) {
    // Diversity factors for EV charging (IET guidance)
    let diversityFactor: number;
    
    if (numberOfChargers === 1) {
      diversityFactor = 1.0;
    } else if (numberOfChargers <= 5) {
      diversityFactor = 0.8;
    } else if (numberOfChargers <= 10) {
      diversityFactor = 0.7;
    } else if (numberOfChargers <= 20) {
      diversityFactor = 0.6;
    } else {
      diversityFactor = 0.5;
    }
    
    const totalConnectedLoad = numberOfChargers * individualPower;
    const diversifiedLoad = totalConnectedLoad * diversityFactor;
    
    return {
      numberOfChargers,
      individualPower,
      totalConnectedLoad,
      diversityFactor,
      diversifiedLoad,
      regulation: 'IET Code of Practice for EV Charging'
    };
  }
}

/**
 * Wind Turbine Power Calculator
 * Based on IEC 61400 standards and UK planning regulations
 * References: IEC 61400-1, IEC 61400-2, PAS 1307
 */
export class WindTurbineCalculator {
  /**
   * Calculate wind turbine power output and performance
   */
  static calculate(inputs: WindTurbineInputs): WindTurbineResult {
    const {
      turbineRating,
      hubHeight,
      rotorDiameter,
      windSpeed,
      airDensity,
      powerCurve,
      siteConditions,
      terrainRoughness
    } = inputs;

    if (turbineRating <= 0 || hubHeight <= 0 || rotorDiameter <= 0 || windSpeed < 0) {
      throw new Error('Invalid input parameters for wind turbine calculation');
    }

    // Wind speed correction for height (wind shear)
    const referenceHeight = 10; // meters
    const windShearExponent = this.getWindShearExponent(siteConditions, terrainRoughness);
    const correctedWindSpeed = windSpeed * Math.pow(hubHeight / referenceHeight, windShearExponent);

    // Power calculation using simplified power curve
    const actualPower = this.calculatePowerFromCurve(correctedWindSpeed, powerCurve, turbineRating);

    // Turbine specifications (typical values)
    const cutInSpeed = 3; // m/s
    const ratedSpeed = 12; // m/s
    const cutOutSpeed = 25; // m/s

    // Rotor swept area
    const sweptArea = Math.PI * Math.pow(rotorDiameter / 2, 2);

    // Tip speed ratio (typical optimum around 7-8)
    const rotorSpeed = this.calculateRotorSpeed(correctedWindSpeed, rotorDiameter);
    const tipSpeed = (rotorSpeed * rotorDiameter * Math.PI) / 60;
    const tipSpeedRatio = tipSpeed / correctedWindSpeed;

    // Power coefficient (Betz limit = 0.593, practical max ~0.45)
    const powerCoefficient = Math.min(0.45, actualPower / (0.5 * airDensity * sweptArea * Math.pow(correctedWindSpeed, 3) / 1000));

    // Annual energy output estimation
    const averageWindSpeed = this.getAverageWindSpeed(siteConditions);
    const annualEnergyOutput = this.calculateAnnualEnergy(turbineRating, averageWindSpeed, powerCurve);

    // Capacity factor
    const capacityFactor = (annualEnergyOutput / (turbineRating * 8760)) * 100;

    // Grid connection requirements
    const isG98Compliant = turbineRating <= 16; // 16kW limit for G98
    const connectionType = turbineRating <= 16 ? 'G98' : 'G99';
    const voltageLevel = turbineRating < 100 ? '230V/400V' : '11kV/33kV';

    // Protection requirements
    const protectionRequired = [
      'Anti-islanding protection',
      'Overvoltage protection',
      'Undervoltage protection',
      'Frequency protection',
      'Loss of mains protection'
    ];

    if (turbineRating > 16) {
      protectionRequired.push('Power quality monitoring');
      protectionRequired.push('Fault ride-through capability');
    }

    // Economic calculations (simplified)
    const installationCostPerKW = this.getInstallationCost(turbineRating, siteConditions);
    const installationCost = turbineRating * installationCostPerKW;
    const feedInTariff = 0.055; // £/kWh typical SEG rate
    const annualIncome = annualEnergyOutput * feedInTariff;
    const paybackPeriod = installationCost / annualIncome;

    // Generate recommendations
    const recommendations = this.generateWindTurbineRecommendations(
      turbineRating,
      siteConditions,
      capacityFactor,
      connectionType
    );

    return {
      nominalPower: turbineRating,
      actualPower,
      cutInSpeed,
      ratedSpeed,
      cutOutSpeed,
      annualEnergyOutput,
      capacityFactor,
      tipSpeedRatio,
      powerCoefficient,
      gridConnection: {
        type: connectionType as 'G98' | 'G99',
        voltageLevel,
        protectionRequired
      },
      economics: {
        installationCost,
        annualIncome,
        paybackPeriod
      },
      recommendations,
      regulation: 'IEC 61400, PAS 1307, G98/G99'
    };
  }

  private static getWindShearExponent(siteConditions: string, terrainRoughness: number): number {
    // Wind shear exponent based on terrain
    const shearExponents = {
      'offshore': 0.1,
      'rural': 0.14,
      'suburban': 0.25,
      'urban': 0.4
    };
    return shearExponents[siteConditions as keyof typeof shearExponents] || 0.14;
  }

  private static calculatePowerFromCurve(
    windSpeed: number,
    powerCurve: Array<{ windSpeed: number; power: number }>,
    ratedPower: number
  ): number {
    if (windSpeed < 3) return 0; // Below cut-in speed
    if (windSpeed > 25) return 0; // Above cut-out speed

    // Simple interpolation or use rated power at rated speed
    if (windSpeed >= 12) return ratedPower; // At or above rated speed

    // Linear approximation for demonstration (real curve would be more complex)
    const powerRatio = Math.min(1, Math.pow(windSpeed / 12, 3));
    return ratedPower * powerRatio;
  }

  private static calculateRotorSpeed(windSpeed: number, rotorDiameter: number): number {
    // Typical rotor speed calculation (simplified)
    const tipSpeedRatio = 7; // Optimal for most turbines
    const tipSpeed = windSpeed * tipSpeedRatio;
    return (tipSpeed * 60) / (Math.PI * rotorDiameter);
  }

  private static getAverageWindSpeed(siteConditions: string): number {
    // Typical average wind speeds by location
    const averageSpeeds = {
      'offshore': 9.5,
      'rural': 6.5,
      'suburban': 5.5,
      'urban': 4.5
    };
    return averageSpeeds[siteConditions as keyof typeof averageSpeeds] || 6.0;
  }

  private static calculateAnnualEnergy(
    ratedPower: number,
    averageWindSpeed: number,
    powerCurve: Array<{ windSpeed: number; power: number }>
  ): number {
    // Simplified annual energy calculation
    // In reality, this would use Weibull distribution of wind speeds
    const capacityFactor = Math.min(0.35, averageWindSpeed / 20); // Simplified
    return ratedPower * 8760 * capacityFactor;
  }

  private static getInstallationCost(ratedPower: number, siteConditions: string): number {
    // Installation cost per kW (£/kW)
    let baseCost = 2500; // £/kW

    if (siteConditions === 'offshore') baseCost *= 3;
    else if (siteConditions === 'urban') baseCost *= 1.5;

    // Economies of scale for larger turbines
    if (ratedPower > 100) baseCost *= 0.8;
    if (ratedPower > 500) baseCost *= 0.7;

    return baseCost;
  }

  private static generateWindTurbineRecommendations(
    rating: number,
    siteConditions: string,
    capacityFactor: number,
    connectionType: string
  ): string[] {
    const recommendations = [
      'Conduct detailed wind resource assessment before installation',
      'Ensure compliance with local planning regulations',
      'Consider noise impact on neighboring properties'
    ];

    if (capacityFactor < 25) {
      recommendations.push('Low wind resource - consider alternative renewable technologies');
    }

    if (siteConditions === 'urban') {
      recommendations.push('Urban turbulence may reduce efficiency - consider building-integrated systems');
    }

    if (connectionType === 'G99') {
      recommendations.push('G99 application required - engage with DNO early');
      recommendations.push('Power quality studies may be required');
    }

    if (rating > 50) {
      recommendations.push('Environmental impact assessment may be required');
      recommendations.push('Aviation authority consultation recommended');
    }

    recommendations.push('Regular maintenance schedule essential for optimal performance');
    recommendations.push('Professional installation by certified engineer required');

    return recommendations;
  }
}

/**
 * Generator Sizing Calculator
 * For standby, prime, and continuous power applications
 * References: BS 7909, IEC 60034, G59/3
 */
export class GeneratorSizingCalculator {
  /**
   * Calculate generator sizing requirements
   */
  static calculate(inputs: GeneratorSizingInputs): GeneratorSizingResult {
    const {
      loadType,
      totalLoad,
      startingLoads,
      powerFactor,
      fuelType,
      altitude,
      ambientTemperature,
      runningHours
    } = inputs;

    if (totalLoad <= 0 || powerFactor <= 0 || powerFactor > 1) {
      throw new Error('Invalid input parameters for generator sizing');
    }

    // Calculate total starting load
    const totalStartingLoad = startingLoads.reduce((sum, load) => {
      const startingFactor = this.getStartingFactor(load.startingMethod);
      return sum + (load.startingPower * startingFactor);
    }, 0);

    // Find largest motor starting load
    const largestMotor = Math.max(...startingLoads.map(load => load.startingPower), 0);

    // Calculate apparent power requirement
    const apparentPower = totalLoad / powerFactor;

    // Generator sizing with safety margin
    const safetyMargin = this.getSafetyMargin(loadType);
    const requiredCapacity = Math.max(apparentPower, totalStartingLoad) * safetyMargin;

    // Standard generator ratings
    const standardRatings = [10, 15, 20, 30, 45, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000];
    const selectedRating = standardRatings.find(rating => rating >= requiredCapacity) || requiredCapacity;

    // Engine power calculation
    const generatorEfficiency = 0.94; // Typical alternator efficiency
    const enginePower = selectedRating * generatorEfficiency;

    // Altitude and temperature derating
    const altitudeDerating = this.getAltitudeDerating(altitude);
    const temperatureDerating = this.getTemperatureDerating(ambientTemperature);
    const deratedPower = enginePower * altitudeDerating * temperatureDerating;

    // Fuel consumption calculation
    const fuelConsumption = this.calculateFuelConsumption(enginePower, fuelType, totalLoad / enginePower);

    // Voltage dip calculation for starting
    const voltageDip = this.calculateVoltageDip(largestMotor, selectedRating);

    // Alternator specification
    const alternatorSpec = {
      voltage: totalLoad > 100 ? 400 : 230,
      frequency: 50,
      phases: totalLoad > 5 ? 3 : 1,
      connection: 'star' as const
    };

    // Protection requirements
    const protectionRequirements = [
      'Engine protection (oil pressure, coolant temperature)',
      'Alternator protection (overcurrent, overvoltage)',
      'Automatic start/stop control',
      'Battery charger for starting system'
    ];

    if (selectedRating > 100) {
      protectionRequirements.push('Synchronizing equipment for parallel operation');
      protectionRequirements.push('Load sharing control');
    }

    // Transfer switch sizing
    const transferSwitchRating = Math.ceil(selectedRating / (alternatorSpec.voltage * Math.sqrt(alternatorSpec.phases) / 1000) * 1.25);

    // Fuel tank sizing (8-24 hours autonomy typical)
    const autonomyHours = 24;
    const fuelTankSize = fuelConsumption * autonomyHours * 1.1; // 10% margin

    // Economic calculations
    const economics = this.calculateGeneratorEconomics(selectedRating, fuelType, runningHours, fuelConsumption);

    // Generate recommendations
    const recommendations = this.generateGeneratorRecommendations(
      selectedRating,
      loadType,
      fuelType,
      runningHours
    );

    return {
      recommendedRating: selectedRating,
      enginePower: deratedPower,
      fuelConsumption,
      startingCapability: {
        largestMotor,
        totalStartingLoad,
        voltageDip
      },
      alternatorSpecification: alternatorSpec,
      protectionRequirements,
      transferSwitchRating,
      fuelTankSize,
      economics,
      recommendations,
      regulation: 'BS 7909, IEC 60034, G59/3'
    };
  }

  private static getSafetyMargin(loadType: string): number {
    const margins = {
      'standby': 1.25,
      'prime': 1.15,
      'continuous': 1.10
    };
    return margins[loadType as keyof typeof margins] || 1.25;
  }

  private static getStartingFactor(startingMethod: string): number {
    const factors = {
      'DOL': 6.0,
      'star_delta': 2.0,
      'soft_start': 3.0,
      'VFD': 1.5
    };
    return factors[startingMethod as keyof typeof factors] || 6.0;
  }

  private static getAltitudeDerating(altitude: number): number {
    // 1% derating per 100m above 1000m
    if (altitude <= 1000) return 1.0;
    return 1.0 - ((altitude - 1000) * 0.01 / 100);
  }

  private static getTemperatureDerating(temperature: number): number {
    // Derating above 40°C
    if (temperature <= 40) return 1.0;
    return 1.0 - ((temperature - 40) * 0.01);
  }

  private static calculateFuelConsumption(enginePower: number, fuelType: string, loadFactor: number): number {
    // Specific fuel consumption (L/kWh)
    const specificConsumption = {
      'diesel': 0.25,
      'gas': 0.35,
      'petrol': 0.30,
      'LPG': 0.32
    };

    const sfc = specificConsumption[fuelType as keyof typeof specificConsumption] || 0.25;
    return enginePower * loadFactor * sfc;
  }

  private static calculateVoltageDip(startingLoad: number, generatorRating: number): number {
    // Simplified voltage dip calculation
    const reactance = 0.15; // Typical generator reactance
    const currentRatio = startingLoad / generatorRating;
    return currentRatio * reactance * 100; // Percentage
  }

  private static calculateGeneratorEconomics(
    rating: number,
    fuelType: string,
    runningHours: number,
    fuelConsumption: number
  ) {
    // Cost estimates (£)
    const equipmentCostPerKVA = rating < 100 ? 800 : rating < 500 ? 600 : 500;
    const equipmentCost = rating * equipmentCostPerKVA;
    const installationCost = equipmentCost * 0.3; // 30% of equipment cost
    
    // Fuel costs (£/L)
    const fuelPrices = {
      'diesel': 1.50,
      'gas': 0.08, // £/kWh
      'petrol': 1.60,
      'LPG': 0.70
    };
    
    const fuelPrice = fuelPrices[fuelType as keyof typeof fuelPrices] || 1.50;
    const annualFuelCost = fuelConsumption * runningHours * fuelPrice;
    const annualMaintenanceCost = rating * 15; // £15/kVA/year

    return {
      capitalCost: equipmentCost + installationCost,
      maintenanceCost: annualMaintenanceCost,
      fuelCost: annualFuelCost
    };
  }

  private static generateGeneratorRecommendations(
    rating: number,
    loadType: string,
    fuelType: string,
    runningHours: number
  ): string[] {
    const recommendations = [
      'Size generator for largest motor starting requirements',
      'Install automatic transfer switch for seamless operation',
      'Ensure adequate ventilation and cooling'
    ];

    if (loadType === 'continuous' && runningHours > 4000) {
      recommendations.push('Consider industrial-grade generator for continuous duty');
      recommendations.push('Implement comprehensive maintenance program');
    }

    if (fuelType === 'diesel') {
      recommendations.push('Install fuel polishing system for long-term storage');
      recommendations.push('Regular fuel quality testing recommended');
    }

    if (rating > 500) {
      recommendations.push('Consider parallel operation for redundancy');
      recommendations.push('Implement load management system');
    }

    recommendations.push('Regular testing under load conditions essential');
    recommendations.push('Comply with environmental regulations for emissions');

    return recommendations;
  }
}

/**
 * Standby Generator Load Calculator
 * Specialized calculator for emergency/standby power systems
 * References: BS 6266, IEC 60364-5-56, HTM 06-01
 */
export class StandbyGeneratorCalculator {
  /**
   * Calculate standby generator requirements for emergency power
   */
  static calculate(inputs: StandbyGeneratorInputs): StandbyGeneratorResult {
    const {
      buildingType,
      essentialLoads,
      transferTime,
      fuelType,
      autonomy,
      testingSchedule,
      emergencyShutdownRequired
    } = inputs;

    if (essentialLoads.length === 0) {
      throw new Error('At least one load must be specified');
    }
    
    if (autonomy <= 0) {
      throw new Error('Invalid input parameters for standby generator calculation');
    }

    // Categorize loads by priority
    const criticalLoad = essentialLoads
      .filter(load => load.priority === 'critical')
      .reduce((sum, load) => sum + load.power, 0);

    const essentialLoadSum = essentialLoads
      .filter(load => load.priority === 'essential')
      .reduce((sum, load) => sum + load.power, 0);

    const totalLoad = essentialLoads.reduce((sum, load) => sum + load.power, 0);

    // Generator sizing with diversity factors
    const diversityFactor = this.getDiversityFactor(buildingType);
    const designLoad = totalLoad * diversityFactor;

    // Safety margin for generator sizing
    const safetyMargin = 1.25;
    const generatorRating = designLoad * safetyMargin;

    // Engine sizing
    const powerFactor = 0.8; // Typical for emergency loads
    const engineRating = generatorRating * powerFactor;

    // Fuel consumption and tank sizing
    const loadFactor = 0.75; // Typical emergency load factor
    const specificConsumption = this.getSpecificConsumption(fuelType);
    const fuelConsumption = engineRating * loadFactor * specificConsumption;
    const fuelTankCapacity = fuelConsumption * autonomy * 1.1; // 10% margin

    // Transfer switch type
    const transferSwitchType = transferTime <= 10 ? 'automatic' : 'manual';

    // Control system features
    const controlSystem = {
      autoStart: transferTime <= 15,
      remoteCommunication: buildingType === 'hospital' || buildingType === 'data_center',
      loadShedding: totalLoad > 100,
      parallelOperation: generatorRating > 500
    };

    // Installation requirements
    const installationRequirements = this.getInstallationRequirements(
      generatorRating,
      fuelType,
      buildingType
    );

    // Compliance requirements
    const complianceRequirements = this.getComplianceRequirements(buildingType);

    // Testing procedures
    const testingProcedures = this.getTestingProcedures(testingSchedule, buildingType);

    // Economic calculations
    const economics = this.calculateStandbyEconomics(
      generatorRating,
      fuelType,
      autonomy,
      buildingType
    );

    // Autonomy verification
    const autonomyAchieved = fuelTankCapacity / fuelConsumption;

    // Generate recommendations
    const recommendations = this.generateStandbyRecommendations(
      buildingType,
      generatorRating,
      transferTime,
      autonomy
    );

    return {
      generatorRating,
      engineRating,
      criticalLoad,
      essentialLoad: essentialLoadSum,
      totalLoad,
      fuelConsumption,
      fuelTankCapacity,
      autonomyAchieved,
      transferSwitchType,
      controlSystem,
      installationRequirements,
      complianceRequirements,
      testingProcedures,
      economics,
      recommendations,
      regulation: 'BS 6266, IEC 60364-5-56, HTM 06-01'
    };
  }

  private static getDiversityFactor(buildingType: string): number {
    const factors = {
      'residential': 0.7,
      'commercial': 0.8,
      'hospital': 0.95,
      'data_center': 1.0,
      'industrial': 0.85
    };
    return factors[buildingType as keyof typeof factors] || 0.8;
  }

  private static getSpecificConsumption(fuelType: string): number {
    // L/kWh or m³/kWh
    const consumption = {
      'diesel': 0.25,
      'gas': 0.35,
      'LPG': 0.30
    };
    return consumption[fuelType as keyof typeof consumption] || 0.25;
  }

  private static getInstallationRequirements(
    rating: number,
    fuelType: string,
    buildingType: string
  ) {
    return {
      concreteBase: rating > 50,
      weatherEnclosure: true,
      fuelSupply: fuelType === 'gas' ? 'Mains gas connection required' : 'Fuel tank and supply system',
      exhaustSystem: 'Exhaust silencer and discharge to atmosphere',
      ventilation: rating > 100 // Mechanical ventilation required for larger generators
    };
  }

  private static getComplianceRequirements(buildingType: string): string[] {
    const baseRequirements = [
      'BS 7909 - Code of practice for standby electrical power',
      'Building Regulations Part P compliance',
      'Environmental permits for emissions'
    ];

    if (buildingType === 'hospital') {
      baseRequirements.push('HTM 06-01 - Electrical services supply and distribution');
      baseRequirements.push('HTM 2011 - Emergency electrical services');
    }

    if (buildingType === 'data_center') {
      baseRequirements.push('TIA-942 - Data center standards');
      baseRequirements.push('BS EN 50600 - Data centre facilities and infrastructures');
    }

    return baseRequirements;
  }

  private static getTestingProcedures(schedule: string, buildingType: string): string[] {
    const procedures = [
      'No-load testing',
      'Load bank testing',
      'Transfer switch operation test',
      'Fuel system integrity check'
    ];

    if (buildingType === 'hospital') {
      procedures.push('Monthly load testing mandatory');
      procedures.push('Annual 24-hour continuous run test');
    }

    return procedures;
  }

  private static calculateStandbyEconomics(
    rating: number,
    fuelType: string,
    autonomy: number,
    buildingType: string
  ) {
    // Equipment costs
    const generatorCostPerKVA = rating < 100 ? 900 : rating < 500 ? 700 : 600;
    const equipmentCost = rating * generatorCostPerKVA;

    // Installation costs (higher for critical applications)
    const installationMultiplier = buildingType === 'hospital' ? 0.5 : 0.3;
    const installationCost = equipmentCost * installationMultiplier;

    // Annual maintenance (standby generators require regular maintenance)
    const annualMaintenanceCost = rating * 20; // £20/kVA/year

    // Annual fuel cost (testing and emergency use)
    const testingHours = 52; // Weekly testing
    const emergencyHours = 24; // Assumed annual emergency use
    const fuelPrice = fuelType === 'diesel' ? 1.50 : 0.08; // £/L or £/kWh
    const specificConsumption = this.getSpecificConsumption(fuelType);
    const annualFuelCost = rating * 0.8 * (testingHours + emergencyHours) * specificConsumption * fuelPrice;

    return {
      equipmentCost,
      installationCost,
      annualMaintenanceCost,
      annualFuelCost
    };
  }

  private static generateStandbyRecommendations(
    buildingType: string,
    rating: number,
    transferTime: number,
    autonomy: number
  ): string[] {
    const recommendations = [
      'Ensure regular maintenance and testing schedule',
      'Install fuel monitoring and management system',
      'Provide adequate ventilation and cooling'
    ];

    if (transferTime > 10) {
      recommendations.push('Consider UPS for critical loads requiring immediate backup');
    }

    if (buildingType === 'hospital') {
      recommendations.push('Implement redundant fuel supply systems');
      recommendations.push('Install engine-driven fire pump if required');
    }

    if (rating > 500) {
      recommendations.push('Consider multiple smaller generators for redundancy');
      recommendations.push('Implement sophisticated load management system');
    }

    if (autonomy < 24) {
      recommendations.push('Consider increasing fuel storage for extended autonomy');
    }

    recommendations.push('Ensure compliance with environmental regulations');
    recommendations.push('Train facility staff on emergency procedures');

    return recommendations;
  }
}

/**
 * Feed-in Tariff Calculator
 * Based on UK Smart Export Guarantee (SEG) and historical FIT rates
 * References: Ofgem SEG guidance, Energy Act 2013
 */
export class FeedInTariffCalculator {
  /**
   * Calculate feed-in tariff returns and payback periods
   */
  static calculate(inputs: FeedInTariffInputs): FeedInTariffResult {
    const {
      generationType,
      installedCapacity,
      commissionDate,
      tariffScheme,
      annualGeneration,
      exportPercentage,
      consumptionOffset,
      tariffRate,
      escalationRate,
      contractPeriod
    } = inputs;

    if (installedCapacity <= 0 || annualGeneration <= 0 || contractPeriod <= 0) {
      throw new Error('Invalid input parameters for feed-in tariff calculation');
    }

    // Calculate annual export and consumption
    const annualExport = annualGeneration * (exportPercentage / 100);
    const annualConsumption = Math.min(consumptionOffset, annualGeneration - annualExport);
    
    // Calculate payments based on tariff scheme
    const payments = this.calculatePayments(
      generationType,
      tariffScheme,
      installedCapacity,
      annualGeneration,
      annualExport,
      tariffRate,
      commissionDate
    );
    
    // Calculate electricity bill savings
    const electricityPrice = 0.30; // £/kWh average UK domestic rate
    const electricityBillSaving = annualConsumption * electricityPrice;
    const totalAnnualBenefit = payments.totalAnnualPayment + electricityBillSaving;
    
    // Calculate lifecycle values
    const lifecycle = this.calculateLifecycleValues(
      totalAnnualBenefit,
      escalationRate,
      contractPeriod
    );
    
    // Tax implications
    const taxImplications = this.calculateTaxImplications(
      payments.totalAnnualPayment,
      tariffScheme,
      installedCapacity
    );
    
    // Contract terms
    const contractTerms = this.getContractTerms(tariffScheme, commissionDate);
    
    // Recommendations
    const recommendations = this.generateFITRecommendations(
      tariffScheme,
      generationType,
      exportPercentage,
      installedCapacity
    );

    return {
      annualGeneration,
      annualExport,
      annualConsumption,
      payments,
      savings: {
        electricityBillSaving,
        totalAnnualBenefit
      },
      lifecycle,
      taxImplications,
      contractTerms,
      recommendations,
      regulation: 'Smart Export Guarantee, Energy Act 2013, Ofgem'
    };
  }

  private static calculatePayments(
    generationType: string,
    tariffScheme: string,
    capacity: number,
    generation: number,
    exportAmount: number,
    tariffRate: number,
    commissionDate: Date
  ) {
    let generationPayment = 0;
    let exportPayment = 0;
    
    if (tariffScheme === 'FIT') {
      // Legacy Feed-in Tariff rates (closed to new applicants March 2019)
      const fitRates = this.getFITRates(generationType, capacity, commissionDate);
      generationPayment = generation * fitRates.generation;
      exportPayment = exportAmount * fitRates.export;
    } else if (tariffScheme === 'SEG') {
      // Smart Export Guarantee - export only
      generationPayment = 0;
      exportPayment = exportAmount * (tariffRate / 1000); // Convert from £/MWh to £/kWh
    } else if (tariffScheme === 'PPA') {
      // Power Purchase Agreement
      exportPayment = exportAmount * (tariffRate / 1000);
    } else if (tariffScheme === 'ROC') {
      // Renewable Obligation Certificates
      const rocValue = this.getROCValue(generationType);
      generationPayment = (generation / 1000) * rocValue; // £/MWh
    }
    
    return {
      generationPayment,
      exportPayment,
      totalAnnualPayment: generationPayment + exportPayment
    };
  }

  private static getFITRates(generationType: string, capacity: number, commissionDate: Date) {
    // Historical FIT rates - simplified for demonstration
    const fitRates = {
      'solar_pv': {
        generation: capacity <= 4 ? 0.0375 : capacity <= 10 ? 0.0343 : 0.0343,
        export: 0.0525
      },
      'wind': {
        generation: capacity <= 1.5 ? 0.0848 : capacity <= 15 ? 0.0267 : 0.0177,
        export: 0.0525
      },
      'hydro': {
        generation: capacity <= 15 ? 0.1134 : 0.0469,
        export: 0.0525
      },
      'anaerobic_digestion': {
        generation: 0.1489,
        export: 0.0525
      }
    };
    
    return fitRates[generationType as keyof typeof fitRates] || fitRates.solar_pv;
  }

  private static getROCValue(generationType: string): number {
    // ROC values (£/MWh) - simplified
    const rocValues = {
      'wind': 51.40,
      'solar_pv': 51.40,
      'hydro': 51.40,
      'biomass': 44.77,
      'anaerobic_digestion': 51.40
    };
    
    return rocValues[generationType as keyof typeof rocValues] || 51.40;
  }

  private static calculateLifecycleValues(
    annualBenefit: number,
    escalationRate: number,
    contractPeriod: number
  ) {
    let totalIncome = 0;
    let presentValue = 0;
    const discountRate = 0.035; // 3.5% HM Treasury discount rate
    
    for (let year = 1; year <= contractPeriod; year++) {
      const escalatedBenefit = annualBenefit * Math.pow(1 + escalationRate / 100, year - 1);
      totalIncome += escalatedBenefit;
      presentValue += escalatedBenefit / Math.pow(1 + discountRate, year);
    }
    
    const inflationRate = 0.025; // 2.5% target inflation
    const inflationAdjustedTotal = totalIncome / Math.pow(1 + inflationRate, contractPeriod / 2);
    
    return {
      totalIncome,
      presentValue,
      inflationAdjustedTotal
    };
  }

  private static calculateTaxImplications(
    annualPayment: number,
    tariffScheme: string,
    capacity: number
  ) {
    // Income tax liability
    const personalAllowance = 12570; // 2023/24 rates
    const incomeTaxLiable = annualPayment > personalAllowance;
    
    // VAT status
    let vatStatus = 'No VAT registration required';
    if (capacity > 30) {
      vatStatus = 'May require VAT registration for large installations';
    }
    
    // Estimated tax (basic rate)
    const basicRate = 0.20;
    const estimatedTax = incomeTaxLiable ? Math.max(0, annualPayment - personalAllowance) * basicRate : 0;
    
    return {
      incomeTaxLiable,
      vatStatus,
      estimatedTax
    };
  }

  private static getContractTerms(tariffScheme: string, commissionDate: Date) {
    const terms = {
      'FIT': {
        tariffGuaranteed: true,
        indexLinked: true,
        transferable: true
      },
      'SEG': {
        tariffGuaranteed: false,
        indexLinked: false,
        transferable: true
      },
      'PPA': {
        tariffGuaranteed: true,
        indexLinked: false,
        transferable: false
      },
      'ROC': {
        tariffGuaranteed: false,
        indexLinked: true,
        transferable: true
      }
    };
    
    return terms[tariffScheme as keyof typeof terms] || terms.SEG;
  }

  private static generateFITRecommendations(
    tariffScheme: string,
    generationType: string,
    exportPercentage: number,
    capacity: number
  ): string[] {
    const recommendations = [];
    
    if (tariffScheme === 'SEG') {
      recommendations.push('Shop around for best SEG rates - they vary significantly between suppliers');
      recommendations.push('Consider export limitations and time-of-use tariffs');
    }
    
    if (exportPercentage > 80) {
      recommendations.push('Consider battery storage to increase self-consumption');
      recommendations.push('Review energy usage patterns to maximize bill savings');
    }
    
    if (tariffScheme === 'FIT' && new Date() > new Date('2019-03-31')) {
      recommendations.push('FIT scheme closed to new applicants - consider SEG or PPA');
    }
    
    if (generationType === 'solar_pv') {
      recommendations.push('Ensure system is MCS certified for maximum benefits');
      recommendations.push('Consider optimal panel orientation and shading');
    }
    
    if (capacity > 50) {
      recommendations.push('Large installations may benefit from commercial PPA arrangements');
      recommendations.push('Consider embedded benefits for large systems');
    }
    
    recommendations.push('Monitor system performance regularly to maintain optimal returns');
    recommendations.push('Keep accurate records for tax and regulatory compliance');
    
    return recommendations;
  }
}

/**
 * Carbon Footprint Reduction Calculator
 * Based on UK Government GHG reporting guidelines and BEIS emission factors
 * References: BEIS Green Book, ISO 14064, GHG Protocol
 */
export class CarbonFootprintCalculator {
  /**
   * Calculate carbon footprint from energy consumption and transport
   */
  static calculate(inputs: CarbonFootprintInputs): CarbonFootprintResult {
    const {
      energyConsumption,
      renewableGeneration,
      transport,
      location,
      calculationYear
    } = inputs;

    // Get emission factors for the calculation year and location
    const emissionFactors = this.getEmissionFactors(location, calculationYear);
    
    // Calculate emissions by source
    const electricityEmissions = Math.max(0, energyConsumption.electricity - 
      (renewableGeneration.solar + renewableGeneration.wind + renewableGeneration.other)) * 
      emissionFactors.electricity;
    
    const gasEmissions = energyConsumption.gas * emissionFactors.gas;
    const oilEmissions = energyConsumption.oil * emissionFactors.oil;
    const coalEmissions = energyConsumption.coal * emissionFactors.coal;
    const lpgEmissions = energyConsumption.lpg * emissionFactors.lpg;
    
    const petrolTransportEmissions = transport.petrolVehicles * emissionFactors.petrol;
    const dieselTransportEmissions = transport.dieselVehicles * emissionFactors.diesel;
    const evTransportEmissions = transport.electricVehicles * emissionFactors.electricity * 0.15; // kWh/km
    const publicTransportEmissions = transport.publicTransport * emissionFactors.publicTransport;
    
    const totalTransportEmissions = petrolTransportEmissions + dieselTransportEmissions + 
      evTransportEmissions + publicTransportEmissions;
    
    const otherEmissions = oilEmissions + coalEmissions + lpgEmissions;
    
    const totalEmissions = electricityEmissions + gasEmissions + totalTransportEmissions + otherEmissions;
    
    // Calculate reductions from renewable generation
    const renewableOffset = (renewableGeneration.solar + renewableGeneration.wind + 
      renewableGeneration.other) * emissionFactors.electricity;
    
    // Calculate net emissions
    const netEmissions = Math.max(0, totalEmissions - renewableOffset);
    
    // Calculate carbon intensity
    const totalEnergyConsumption = energyConsumption.electricity + energyConsumption.gas;
    const carbonIntensity = totalEnergyConsumption > 0 ? totalEmissions / totalEnergyConsumption : 0;
    
    // Benchmarking
    const benchmarking = this.getBenchmarking(totalEmissions, location);
    
    // Reduction targets
    const reductionTargets = this.getReductionTargets(totalEmissions, calculationYear);
    
    // Cost of carbon
    const costOfCarbon = this.calculateCostOfCarbon(totalEmissions);
    
    // Recommendations
    const recommendations = this.generateCarbonRecommendations(
      energyConsumption,
      transport,
      renewableGeneration,
      totalEmissions
    );

    return {
      totalEmissions,
      emissionsBySource: {
        electricity: electricityEmissions,
        gas: gasEmissions,
        transport: totalTransportEmissions,
        other: otherEmissions
      },
      reductions: {
        renewableOffset,
        efficiencyMeasures: 0, // Would be calculated based on efficiency measures implemented
        behaviorChanges: 0 // Would be calculated based on behavior changes
      },
      netEmissions,
      carbonIntensity,
      benchmarking,
      reductionTargets,
      costOfCarbon,
      recommendations,
      regulation: 'BEIS GHG Guidelines, ISO 14064, GHG Protocol'
    };
  }

  private static getEmissionFactors(location: string, year: number) {
    // UK BEIS 2023 emission factors (kg CO2e per unit)
    const ukFactors = {
      electricity: 0.193, // kg CO2e/kWh
      gas: 0.184, // kg CO2e/kWh
      oil: 2.52, // kg CO2e/L
      coal: 1.97, // kg CO2e/kg
      lpg: 1.49, // kg CO2e/kg
      petrol: 0.180, // kg CO2e/km (average car)
      diesel: 0.171, // kg CO2e/km (average car)
      publicTransport: 0.083 // kg CO2e/km (average)
    };
    
    // Apply year-on-year improvements (grid decarbonization)
    const yearsSince2023 = year - 2023;
    const decarbonizationRate = 0.05; // 5% per year
    
    if (location === 'UK') {
      return {
        ...ukFactors,
        electricity: ukFactors.electricity * Math.pow(1 - decarbonizationRate, Math.max(0, yearsSince2023))
      };
    }
    
    // Simplified factors for other locations
    return ukFactors;
  }

  private static getBenchmarking(emissions: number, location: string) {
    // UK household averages (kg CO2e/year)
    const benchmarks = {
      'UK': {
        average: 2300,
        bestPractice: 1000,
        worstPractice: 5000
      },
      'EU': {
        average: 2100,
        bestPractice: 900,
        worstPractice: 4500
      },
      'US': {
        average: 4800,
        bestPractice: 2000,
        worstPractice: 8000
      },
      'global': {
        average: 2800,
        bestPractice: 1200,
        worstPractice: 6000
      }
    };
    
    const benchmark = benchmarks[location as keyof typeof benchmarks] || benchmarks.global;
    
    // Calculate percentile ranking
    let percentileRanking = 50;
    if (emissions <= benchmark.bestPractice) {
      percentileRanking = 10;
    } else if (emissions <= benchmark.average) {
      percentileRanking = 25 + (25 * (benchmark.average - emissions) / (benchmark.average - benchmark.bestPractice));
    } else if (emissions <= benchmark.worstPractice) {
      percentileRanking = 50 + (40 * (emissions - benchmark.average) / (benchmark.worstPractice - benchmark.average));
    } else {
      percentileRanking = 90;
    }
    
    return {
      ukAverage: benchmark.average,
      bestPractice: benchmark.bestPractice,
      percentileRanking: Math.round(percentileRanking)
    };
  }

  private static getReductionTargets(emissions: number, year: number) {
    // UK Net Zero 2050 targets
    const baselineYear = 1990;
    const targetYear = 2050;
    const yearsToTarget = targetYear - year;
    
    // UK committed to 78% reduction by 2035, net zero by 2050
    const netZero2050 = (emissions / emissions) * 100; // 100% reduction for net zero
    const paris2030 = 68; // UK's NDC target for 2030
    
    const annualReductionRate = yearsToTarget > 0 ? netZero2050 / yearsToTarget : 0;
    
    return {
      netZero2050,
      paris2030,
      annualReductionRate
    };
  }

  private static calculateCostOfCarbon(emissions: number) {
    // Social cost of carbon (£/tonne CO2e)
    const socialCostPerTonne = 25; // Conservative estimate
    const socialCostEstimate = (emissions / 1000) * socialCostPerTonne;
    
    // Carbon tax (if applicable)
    const carbonTaxRate = 0; // UK doesn't have general carbon tax for households
    const carbonTaxLiability = (emissions / 1000) * carbonTaxRate;
    
    // Cost to offset via verified schemes
    const offsetCostPerTonne = 15;
    const offsetCost = (emissions / 1000) * offsetCostPerTonne;
    
    return {
      socialCostEstimate,
      carbonTaxLiability,
      offsetCost
    };
  }

  private static generateCarbonRecommendations(
    energyConsumption: any,
    transport: any,
    renewableGeneration: any,
    totalEmissions: number
  ): string[] {
    const recommendations = [];
    
    // Energy efficiency recommendations
    if (energyConsumption.electricity > 3000) {
      recommendations.push('Consider LED lighting and efficient appliances to reduce electricity consumption');
    }
    
    if (energyConsumption.gas > 12000) {
      recommendations.push('Improve home insulation and consider heat pump installation');
    }
    
    // Renewable energy recommendations
    const totalRenewable = renewableGeneration.solar + renewableGeneration.wind + renewableGeneration.other;
    if (totalRenewable < energyConsumption.electricity * 0.5) {
      recommendations.push('Consider installing solar panels or purchasing green electricity tariff');
    }
    
    // Transport recommendations
    if (transport.petrolVehicles + transport.dieselVehicles > 10000) {
      recommendations.push('Consider electric vehicle or increase use of public transport');
    }
    
    if (transport.publicTransport < transport.petrolVehicles * 0.1) {
      recommendations.push('Increase use of public transport, cycling, or walking for short journeys');
    }
    
    // General recommendations based on total emissions
    if (totalEmissions > 5000) {
      recommendations.push('Total emissions are significantly above average - priority action needed');
      recommendations.push('Consider comprehensive home energy audit');
    } else if (totalEmissions < 1500) {
      recommendations.push('Excellent carbon footprint - consider helping others reduce their emissions');
    }
    
    recommendations.push('Monitor and track emissions annually to measure progress');
    recommendations.push('Consider carbon offsetting for remaining emissions');
    
    return recommendations;
  }
}
