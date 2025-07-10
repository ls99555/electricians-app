/**
 * Electrical Units Converter
 * Comprehensive unit conversion calculations for electrical engineering
 * 
 * Based on:
 * - International System of Units (SI) - SI Brochure 9th edition
 * - IEC 80000-6:2022 - Quantities and units - Part 6: Electromagnetism
 * - BS ISO 80000-6:2022 - Quantities and units - Part 6: Electromagnetism
 * - BS 7671:2018+A2:2022 - Requirements for Electrical Installations
 * - NIST Special Publication 811 - Guide for the Use of the International System of Units
 * 
 * IMPORTANT DISCLAIMERS:
 * - These conversions provide guidance only and do not constitute professional advice
 * - Always verify critical calculations with appropriate measuring instruments
 * - Ensure conversions are appropriate for your specific application
 * - Some conversions may be approximate and subject to rounding errors
 * - Professional electrical work should always be verified by qualified electrical engineers
 * 
 * NOTE: All conversions are based on exact SI definitions where possible
 * Approximate conversions are clearly marked and include precision limitations
 */

import type {
  UnitsConverterResult,
  PowerConversionResult,
  EnergyConversionResult,
  VoltageConversionResult,
  CurrentConversionResult,
  ResistanceConversionResult,
  CapacitanceConversionResult,
  InductanceConversionResult,
  FrequencyConversionResult,
  TemperatureConversionResult,
  LengthConversionResult,
  AreaConversionResult,
  VolumeConversionResult,
  WeightConversionResult
} from '../../types';

/**
 * Power Conversion Calculator
 * Converts between different power units commonly used in electrical engineering
 * Based on SI base unit: Watt (W) = kg⋅m²⋅s⁻³
 */
export class PowerConverter {
  /**
   * Convert power values between different units
   * @param value - Input value to convert
   * @param fromUnit - Source unit ('W', 'kW', 'MW', 'hp', 'btu_s', 'cal_s')
   * @param toUnit - Target unit
   * @returns Converted power value with detailed information
   */
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    if (value < 0) {
      throw new Error('Power value cannot be negative');
    }

    // Convert to base unit (Watts)
    const toWatts = this.convertToWatts(value, fromUnit);
    
    // Convert from watts to target unit
    const result = this.convertFromWatts(toWatts, toUnit);
    
    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Power',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  /**
   * Get comprehensive power conversion results for a given wattage
   * @param watts - Power in watts
   * @returns All common power unit conversions
   */
  static getAllConversions(watts: number): PowerConversionResult {
    if (watts < 0) {
      throw new Error('Power value cannot be negative');
    }

    return {
      watts,
      kilowatts: watts / 1000,
      horsepower: watts / 745.7, // 1 HP = 745.7 W (mechanical horsepower)
      btu: watts * 3.41214, // BTU/h (British Thermal Unit per hour)
      calories: watts * 0.859845 // cal/s (thermochemical calorie per second)
    };
  }

  private static convertToWatts(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'W': 1,
      'kW': 1000,
      'MW': 1000000,
      'mW': 0.001,
      'μW': 0.000001,
      'hp': 745.7, // Mechanical horsepower
      'hp_metric': 735.5, // Metric horsepower (PS)
      'btu_h': 0.293071, // BTU per hour
      'btu_s': 1055.06, // BTU per second
      'cal_s': 4.184, // Thermochemical calorie per second
      'kcal_h': 1.163, // Kilocalorie per hour
      'ft_lbf_s': 1.35582 // Foot-pound-force per second
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported power unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromWatts(watts: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'W': 1,
      'kW': 1000,
      'MW': 1000000,
      'mW': 0.001,
      'μW': 0.000001,
      'hp': 745.7,
      'hp_metric': 735.5,
      'btu_h': 0.293071,
      'btu_s': 1055.06,
      'cal_s': 4.184,
      'kcal_h': 1.163,
      'ft_lbf_s': 1.35582
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported power unit: ${unit}`);
    }

    return watts / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'W_to_kW': 'kW = W ÷ 1000',
      'kW_to_W': 'W = kW × 1000',
      'W_to_hp': 'hp = W ÷ 745.7',
      'hp_to_W': 'W = hp × 745.7',
      'W_to_btu_h': 'BTU/h = W × 3.41214',
      'btu_h_to_W': 'W = BTU/h ÷ 3.41214'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'W': 'Watt - SI base unit of power',
      'kW': 'Kilowatt - 1000 watts',
      'MW': 'Megawatt - 1,000,000 watts',
      'hp': 'Horsepower (mechanical) - 745.7 watts',
      'btu_h': 'BTU per hour - British Thermal Unit per hour',
      'cal_s': 'Calorie per second - thermochemical calorie'
    };

    return descriptions[unit] || `${unit} - electrical power unit`;
  }
}

/**
 * Energy Conversion Calculator
 * Converts between different energy units
 * Based on SI base unit: Joule (J) = kg⋅m²⋅s⁻²
 */
export class EnergyConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    if (value < 0) {
      throw new Error('Energy value cannot be negative');
    }

    const toJoules = this.convertToJoules(value, fromUnit);
    const result = this.convertFromJoules(toJoules, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Energy',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(joules: number): EnergyConversionResult {
    if (joules < 0) {
      throw new Error('Energy value cannot be negative');
    }

    return {
      joules,
      kilowattHours: joules / 3600000, // 1 kWh = 3.6 × 10⁶ J
      btu: joules / 1055.06, // 1 BTU = 1055.06 J
      calories: joules / 4.184, // 1 cal = 4.184 J (thermochemical)
      footPounds: joules / 1.35582 // 1 ft⋅lbf = 1.35582 J
    };
  }

  private static convertToJoules(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'J': 1,
      'kJ': 1000,
      'MJ': 1000000,
      'GJ': 1000000000,
      'Wh': 3600, // 1 Wh = 3600 J
      'kWh': 3600000, // 1 kWh = 3.6 × 10⁶ J
      'MWh': 3600000000, // 1 MWh = 3.6 × 10⁹ J
      'cal': 4.184, // Thermochemical calorie
      'kcal': 4184, // Thermochemical kilocalorie
      'btu': 1055.06, // International Table BTU
      'ft_lbf': 1.35582, // Foot-pound-force
      'eV': 1.602176634e-19 // Electron volt
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported energy unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromJoules(joules: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'J': 1,
      'kJ': 1000,
      'MJ': 1000000,
      'GJ': 1000000000,
      'Wh': 3600,
      'kWh': 3600000,
      'MWh': 3600000000,
      'cal': 4.184,
      'kcal': 4184,
      'btu': 1055.06,
      'ft_lbf': 1.35582,
      'eV': 1.602176634e-19
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported energy unit: ${unit}`);
    }

    return joules / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'J_to_kWh': 'kWh = J ÷ 3,600,000',
      'kWh_to_J': 'J = kWh × 3,600,000',
      'J_to_cal': 'cal = J ÷ 4.184',
      'cal_to_J': 'J = cal × 4.184',
      'J_to_btu': 'BTU = J ÷ 1055.06',
      'btu_to_J': 'J = BTU × 1055.06'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'J': 'Joule - SI base unit of energy',
      'kWh': 'Kilowatt-hour - common electrical energy unit',
      'btu': 'British Thermal Unit - energy unit',
      'cal': 'Calorie - thermochemical energy unit'
    };

    return descriptions[unit] || `${unit} - energy unit`;
  }
}

/**
 * Voltage Conversion Calculator
 * Converts between different voltage units
 * Based on SI base unit: Volt (V) = kg⋅m²⋅s⁻³⋅A⁻¹
 */
export class VoltageConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    const toVolts = this.convertToVolts(value, fromUnit);
    const result = this.convertFromVolts(toVolts, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Voltage',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(volts: number): VoltageConversionResult {
    return {
      volts,
      kilovolts: volts / 1000,
      millivolts: volts * 1000,
      microvolts: volts * 1000000
    };
  }

  private static convertToVolts(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'V': 1,
      'kV': 1000,
      'MV': 1000000,
      'mV': 0.001,
      'μV': 0.000001,
      'nV': 0.000000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported voltage unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromVolts(volts: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'V': 1,
      'kV': 1000,
      'MV': 1000000,
      'mV': 0.001,
      'μV': 0.000001,
      'nV': 0.000000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported voltage unit: ${unit}`);
    }

    return volts / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'V_to_kV': 'kV = V ÷ 1000',
      'kV_to_V': 'V = kV × 1000',
      'V_to_mV': 'mV = V × 1000',
      'mV_to_V': 'V = mV ÷ 1000'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'V': 'Volt - SI base unit of electric potential',
      'kV': 'Kilovolt - 1000 volts',
      'mV': 'Millivolt - 0.001 volts',
      'μV': 'Microvolt - 0.000001 volts'
    };

    return descriptions[unit] || `${unit} - voltage unit`;
  }
}

/**
 * Current Conversion Calculator
 * Converts between different current units
 * Based on SI base unit: Ampere (A)
 */
export class CurrentConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    const toAmperes = this.convertToAmperes(value, fromUnit);
    const result = this.convertFromAmperes(toAmperes, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Current',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(amperes: number): CurrentConversionResult {
    return {
      amperes,
      kiloamperes: amperes / 1000,
      milliamperes: amperes * 1000,
      microamperes: amperes * 1000000
    };
  }

  private static convertToAmperes(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'A': 1,
      'kA': 1000,
      'MA': 1000000,
      'mA': 0.001,
      'μA': 0.000001,
      'nA': 0.000000001,
      'pA': 0.000000000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported current unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromAmperes(amperes: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'A': 1,
      'kA': 1000,
      'MA': 1000000,
      'mA': 0.001,
      'μA': 0.000001,
      'nA': 0.000000001,
      'pA': 0.000000000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported current unit: ${unit}`);
    }

    return amperes / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'A_to_mA': 'mA = A × 1000',
      'mA_to_A': 'A = mA ÷ 1000',
      'A_to_kA': 'kA = A ÷ 1000',
      'kA_to_A': 'A = kA × 1000'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'A': 'Ampere - SI base unit of electric current',
      'kA': 'Kiloampere - 1000 amperes',
      'mA': 'Milliampere - 0.001 amperes',
      'μA': 'Microampere - 0.000001 amperes'
    };

    return descriptions[unit] || `${unit} - current unit`;
  }
}

/**
 * Resistance Conversion Calculator
 * Converts between different resistance units
 * Based on SI derived unit: Ohm (Ω) = kg⋅m²⋅s⁻³⋅A⁻²
 */
export class ResistanceConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    if (value < 0) {
      throw new Error('Resistance value cannot be negative');
    }

    const toOhms = this.convertToOhms(value, fromUnit);
    const result = this.convertFromOhms(toOhms, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Resistance',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(ohms: number): ResistanceConversionResult {
    if (ohms < 0) {
      throw new Error('Resistance value cannot be negative');
    }

    return {
      ohms,
      kiloohms: ohms / 1000,
      megaohms: ohms / 1000000,
      milliohms: ohms * 1000,
      microohms: ohms * 1000000
    };
  }

  private static convertToOhms(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'Ω': 1,
      'ohm': 1,
      'kΩ': 1000,
      'kohm': 1000,
      'MΩ': 1000000,
      'Mohm': 1000000,
      'GΩ': 1000000000,
      'Gohm': 1000000000,
      'mΩ': 0.001,
      'mohm': 0.001,
      'μΩ': 0.000001,
      'uohm': 0.000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported resistance unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromOhms(ohms: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'Ω': 1,
      'ohm': 1,
      'kΩ': 1000,
      'kohm': 1000,
      'MΩ': 1000000,
      'Mohm': 1000000,
      'GΩ': 1000000000,
      'Gohm': 1000000000,
      'mΩ': 0.001,
      'mohm': 0.001,
      'μΩ': 0.000001,
      'uohm': 0.000001
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported resistance unit: ${unit}`);
    }

    return ohms / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'Ω_to_kΩ': 'kΩ = Ω ÷ 1000',
      'kΩ_to_Ω': 'Ω = kΩ × 1000',
      'Ω_to_MΩ': 'MΩ = Ω ÷ 1,000,000',
      'MΩ_to_Ω': 'Ω = MΩ × 1,000,000'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'Ω': 'Ohm - SI derived unit of electrical resistance',
      'kΩ': 'Kiloohm - 1000 ohms',
      'MΩ': 'Megaohm - 1,000,000 ohms',
      'mΩ': 'Milliohm - 0.001 ohms'
    };

    return descriptions[unit] || `${unit} - resistance unit`;
  }
}

/**
 * Temperature Conversion Calculator
 * Converts between different temperature scales
 * Based on SI base unit: Kelvin (K)
 */
export class TemperatureConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    const toKelvin = this.convertToKelvin(value, fromUnit);
    const result = this.convertFromKelvin(toKelvin, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Temperature',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(celsius: number): TemperatureConversionResult {
    return {
      celsius,
      fahrenheit: (celsius * 9/5) + 32,
      kelvin: celsius + 273.15,
      rankine: (celsius + 273.15) * 9/5
    };
  }

  private static convertToKelvin(value: number, unit: string): number {
    switch (unit) {
      case 'K':
        return value;
      case 'C':
      case '°C':
        return value + 273.15;
      case 'F':
      case '°F':
        return (value - 32) * 5/9 + 273.15;
      case 'R':
      case '°R':
        return value * 5/9;
      default:
        throw new Error(`Unsupported temperature unit: ${unit}`);
    }
  }

  private static convertFromKelvin(kelvin: number, unit: string): number {
    switch (unit) {
      case 'K':
        return kelvin;
      case 'C':
      case '°C':
        return kelvin - 273.15;
      case 'F':
      case '°F':
        return (kelvin - 273.15) * 9/5 + 32;
      case 'R':
      case '°R':
        return kelvin * 9/5;
      default:
        throw new Error(`Unsupported temperature unit: ${unit}`);
    }
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'C_to_F': '°F = (°C × 9/5) + 32',
      'F_to_C': '°C = (°F - 32) × 5/9',
      'C_to_K': 'K = °C + 273.15',
      'K_to_C': '°C = K - 273.15',
      'F_to_K': 'K = (°F - 32) × 5/9 + 273.15',
      'K_to_F': '°F = (K - 273.15) × 9/5 + 32'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = f(${fromUnit})`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'K': 'Kelvin - SI base unit of temperature',
      'C': 'Celsius - Common temperature scale',
      '°C': 'Degrees Celsius - Common temperature scale',
      'F': 'Fahrenheit - Imperial temperature scale',
      '°F': 'Degrees Fahrenheit - Imperial temperature scale'
    };

    return descriptions[unit] || `${unit} - temperature unit`;
  }
}

/**
 * Length Conversion Calculator
 * Converts between different length units
 * Based on SI base unit: Meter (m)
 */
export class LengthConverter {
  static convert(value: number, fromUnit: string, toUnit: string): UnitsConverterResult {
    if (value < 0) {
      throw new Error('Length value cannot be negative');
    }

    const toMeters = this.convertToMeters(value, fromUnit);
    const result = this.convertFromMeters(toMeters, toUnit);

    return {
      fromValue: value,
      toValue: result,
      fromUnit,
      toUnit,
      category: 'Length',
      formula: this.getConversionFormula(fromUnit, toUnit),
      description: this.getUnitDescription(toUnit)
    };
  }

  static getAllConversions(meters: number): LengthConversionResult {
    if (meters < 0) {
      throw new Error('Length value cannot be negative');
    }

    return {
      meters,
      millimeters: meters * 1000,
      centimeters: meters * 100,
      kilometers: meters / 1000,
      inches: meters * 39.3701,
      feet: meters * 3.28084,
      yards: meters * 1.09361,
      miles: meters / 1609.34
    };
  }

  private static convertToMeters(value: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'm': 1,
      'km': 1000,
      'cm': 0.01,
      'mm': 0.001,
      'μm': 0.000001,
      'nm': 0.000000001,
      'in': 0.0254,
      'ft': 0.3048,
      'yd': 0.9144,
      'mi': 1609.34,
      'mil': 0.0000254,
      'thou': 0.0000254
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported length unit: ${unit}`);
    }

    return value * factor;
  }

  private static convertFromMeters(meters: number, unit: string): number {
    const conversions: { [key: string]: number } = {
      'm': 1,
      'km': 1000,
      'cm': 0.01,
      'mm': 0.001,
      'μm': 0.000001,
      'nm': 0.000000001,
      'in': 0.0254,
      'ft': 0.3048,
      'yd': 0.9144,
      'mi': 1609.34,
      'mil': 0.0000254,
      'thou': 0.0000254
    };

    const factor = conversions[unit];
    if (factor === undefined) {
      throw new Error(`Unsupported length unit: ${unit}`);
    }

    return meters / factor;
  }

  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    const formulas: { [key: string]: string } = {
      'm_to_ft': 'ft = m × 3.28084',
      'ft_to_m': 'm = ft ÷ 3.28084',
      'm_to_in': 'in = m × 39.3701',
      'in_to_m': 'm = in ÷ 39.3701',
      'mm_to_in': 'in = mm ÷ 25.4',
      'in_to_mm': 'mm = in × 25.4'
    };

    const key = `${fromUnit}_to_${toUnit}`;
    return formulas[key] || `${toUnit} = ${fromUnit} × conversion_factor`;
  }

  private static getUnitDescription(unit: string): string {
    const descriptions: { [key: string]: string } = {
      'm': 'Meter - SI base unit of length',
      'km': 'Kilometer - 1000 meters',
      'cm': 'Centimeter - 0.01 meters',
      'mm': 'Millimeter - 0.001 meters',
      'in': 'Inch - Imperial length unit',
      'ft': 'Foot - Imperial length unit',
      'yd': 'Yard - Imperial length unit',
      'mi': 'Mile - Imperial length unit'
    };

    return descriptions[unit] || `${unit} - length unit`;
  }
}

/**
 * Comprehensive Units Converter
 * Master class that provides access to all unit converters
 */
export class UnitsConverter {
  static power = PowerConverter;
  static energy = EnergyConverter;
  static voltage = VoltageConverter;
  static current = CurrentConverter;
  static resistance = ResistanceConverter;
  static temperature = TemperatureConverter;
  static lengthUnit = LengthConverter;

  /**
   * Get all available unit categories
   */
  static getAvailableCategories(): string[] {
    return [
      'Power',
      'Energy',
      'Voltage',
      'Current',
      'Resistance',
      'Temperature',
      'Length'
    ];
  }

  /**
   * Get available units for a specific category
   */
  static getAvailableUnits(category: string): string[] {
    const units: { [key: string]: string[] } = {
      'Power': ['W', 'kW', 'MW', 'mW', 'μW', 'hp', 'hp_metric', 'btu_h', 'btu_s', 'cal_s'],
      'Energy': ['J', 'kJ', 'MJ', 'GJ', 'Wh', 'kWh', 'MWh', 'cal', 'kcal', 'btu', 'ft_lbf', 'eV'],
      'Voltage': ['V', 'kV', 'MV', 'mV', 'μV', 'nV'],
      'Current': ['A', 'kA', 'MA', 'mA', 'μA', 'nA', 'pA'],
      'Resistance': ['Ω', 'kΩ', 'MΩ', 'GΩ', 'mΩ', 'μΩ'],
      'Temperature': ['K', 'C', '°C', 'F', '°F', 'R', '°R'],
      'Length': ['m', 'km', 'cm', 'mm', 'μm', 'nm', 'in', 'ft', 'yd', 'mi', 'mil', 'thou']
    };

    return units[category] || [];
  }

  /**
   * Convert between any supported units
   */
  static convert(value: number, fromUnit: string, toUnit: string, category: string): UnitsConverterResult {
    switch (category) {
      case 'Power':
        return this.power.convert(value, fromUnit, toUnit);
      case 'Energy':
        return this.energy.convert(value, fromUnit, toUnit);
      case 'Voltage':
        return this.voltage.convert(value, fromUnit, toUnit);
      case 'Current':
        return this.current.convert(value, fromUnit, toUnit);
      case 'Resistance':
        return this.resistance.convert(value, fromUnit, toUnit);
      case 'Temperature':
        return this.temperature.convert(value, fromUnit, toUnit);
      case 'Length':
        return this.lengthUnit.convert(value, fromUnit, toUnit);
      default:
        throw new Error(`Unsupported conversion category: ${category}`);
    }
  }
}
