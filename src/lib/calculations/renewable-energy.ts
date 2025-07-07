/**
 * Renewable Energy Calculations
 * Solar PV, Battery Storage, and renewable energy systems calculations
 * Based on UK Microgeneration Certification Scheme (MCS) standards
 */

import type { SolarPVResult, BatteryStorageResult } from './types';
import { ELECTRICAL_CONSTANTS } from './types';

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
