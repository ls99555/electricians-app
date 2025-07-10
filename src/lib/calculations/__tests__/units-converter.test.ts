/**
 * Electrical Units Converter Tests
 * Comprehensive test suite for all unit c    test('should get all energy conversions for joules', () => {
      const result = energyConverter.getAllConversions(3600000, 'joules');
      expect(result.joules).toBe(3600000);
      expect(result.kilowattHours).toBe(1);
      expect(result.btu).toBeCloseTo(3412.13, 1);
      expect(result.calories).toBeCloseTo(860421, 0);
    });on calculations
 * Ensures accuracy and compliance with international standards
 */

import {
  UnitsConverter,
  PowerConverter,
  EnergyConverter,
  VoltageConverter,
  CurrentConverter,
  ResistanceConverter,
  TemperatureConverter,
  LengthConverter
} from '../core/units-converter';

describe('UnitsConverter', () => {
  describe('PowerConverter', () => {
    test('should convert watts to kilowatts correctly', () => {
      const result = PowerConverter.convert(1500, 'W', 'kW');
      expect(result.toValue).toBeCloseTo(1.5, 3);
      expect(result.fromUnit).toBe('W');
      expect(result.toUnit).toBe('kW');
      expect(result.category).toBe('Power');
      expect(result.formula).toBe('kW = W ÷ 1000');
    });

    test('should convert watts to horsepower correctly', () => {
      const result = PowerConverter.convert(745.7, 'W', 'hp');
      expect(result.toValue).toBeCloseTo(1.0, 3);
      expect(result.description).toContain('Horsepower');
    });

    test('should convert kilowatts to BTU/h correctly', () => {
      const result = PowerConverter.convert(1, 'kW', 'btu_h');
      expect(result.toValue).toBeCloseTo(3412.14, 1);
    });

    test('should get all power conversions for watts', () => {
      const result = PowerConverter.getAllConversions(1000);
      expect(result.watts).toBe(1000);
      expect(result.kilowatts).toBe(1);
      expect(result.horsepower).toBeCloseTo(1.341, 3);
      expect(result.btu).toBeCloseTo(3412.14, 1);
    });

    test('should throw error for negative power values', () => {
      expect(() => {
        PowerConverter.convert(-100, 'W', 'kW');
      }).toThrow('Power value cannot be negative');
    });

    test('should throw error for unsupported units', () => {
      expect(() => {
        PowerConverter.convert(100, 'invalid_unit', 'W');
      }).toThrow('Unsupported power unit: invalid_unit');
    });
  });

  describe('EnergyConverter', () => {
    test('should convert joules to kilowatt-hours correctly', () => {
      const result = EnergyConverter.convert(3600000, 'J', 'kWh');
      expect(result.toValue).toBeCloseTo(1.0, 3);
      expect(result.formula).toBe('kWh = J ÷ 3,600,000');
    });

    test('should convert kilowatt-hours to joules correctly', () => {
      const result = EnergyConverter.convert(1, 'kWh', 'J');
      expect(result.toValue).toBe(3600000);
    });

    test('should convert joules to BTU correctly', () => {
      const result = EnergyConverter.convert(1055.06, 'J', 'btu');
      expect(result.toValue).toBeCloseTo(1.0, 3);
    });

    test('should convert joules to calories correctly', () => {
      const result = EnergyConverter.convert(4.184, 'J', 'cal');
      expect(result.toValue).toBeCloseTo(1.0, 3);
    });

    test('should get all energy conversions for joules', () => {
      const result = EnergyConverter.getAllConversions(3600000);
      expect(result.joules).toBe(3600000);
      expect(result.kilowattHours).toBe(1);
      expect(result.btu).toBeCloseTo(3412.13, 1);
      expect(result.calories).toBeCloseTo(860421, 0);
    });

    test('should throw error for negative energy values', () => {
      expect(() => {
        EnergyConverter.convert(-100, 'J', 'kWh');
      }).toThrow('Energy value cannot be negative');
    });
  });

  describe('VoltageConverter', () => {
    test('should convert volts to kilovolts correctly', () => {
      const result = VoltageConverter.convert(1000, 'V', 'kV');
      expect(result.toValue).toBe(1);
      expect(result.formula).toBe('kV = V ÷ 1000');
    });

    test('should convert volts to millivolts correctly', () => {
      const result = VoltageConverter.convert(1, 'V', 'mV');
      expect(result.toValue).toBe(1000);
      expect(result.formula).toBe('mV = V × 1000');
    });

    test('should convert kilovolts to volts correctly', () => {
      const result = VoltageConverter.convert(11, 'kV', 'V');
      expect(result.toValue).toBe(11000);
    });

    test('should get all voltage conversions', () => {
      const result = VoltageConverter.getAllConversions(230);
      expect(result.volts).toBe(230);
      expect(result.kilovolts).toBe(0.23);
      expect(result.millivolts).toBe(230000);
      expect(result.microvolts).toBe(230000000);
    });

    test('should handle microvolts correctly', () => {
      const result = VoltageConverter.convert(1000000, 'μV', 'V');
      expect(result.toValue).toBe(1);
    });
  });

  describe('CurrentConverter', () => {
    test('should convert amperes to milliamperes correctly', () => {
      const result = CurrentConverter.convert(1, 'A', 'mA');
      expect(result.toValue).toBe(1000);
      expect(result.formula).toBe('mA = A × 1000');
    });

    test('should convert milliamperes to amperes correctly', () => {
      const result = CurrentConverter.convert(1000, 'mA', 'A');
      expect(result.toValue).toBe(1);
      expect(result.formula).toBe('A = mA ÷ 1000');
    });

    test('should convert amperes to kiloamperes correctly', () => {
      const result = CurrentConverter.convert(1000, 'A', 'kA');
      expect(result.toValue).toBe(1);
    });

    test('should get all current conversions', () => {
      const result = CurrentConverter.getAllConversions(16);
      expect(result.amperes).toBe(16);
      expect(result.kiloamperes).toBe(0.016);
      expect(result.milliamperes).toBe(16000);
      expect(result.microamperes).toBe(16000000);
    });

    test('should handle microamperes correctly', () => {
      const result = CurrentConverter.convert(1000000, 'μA', 'A');
      expect(result.toValue).toBe(1);
    });
  });

  describe('ResistanceConverter', () => {
    test('should convert ohms to kiloohms correctly', () => {
      const result = ResistanceConverter.convert(1000, 'Ω', 'kΩ');
      expect(result.toValue).toBe(1);
      expect(result.formula).toBe('kΩ = Ω ÷ 1000');
    });

    test('should convert ohms to megaohms correctly', () => {
      const result = ResistanceConverter.convert(1000000, 'Ω', 'MΩ');
      expect(result.toValue).toBe(1);
      expect(result.formula).toBe('MΩ = Ω ÷ 1,000,000');
    });

    test('should convert kiloohms to ohms correctly', () => {
      const result = ResistanceConverter.convert(2.2, 'kΩ', 'Ω');
      expect(result.toValue).toBe(2200);
    });

    test('should get all resistance conversions', () => {
      const result = ResistanceConverter.getAllConversions(1000);
      expect(result.ohms).toBe(1000);
      expect(result.kiloohms).toBe(1);
      expect(result.megaohms).toBe(0.001);
      expect(result.milliohms).toBe(1000000);
      expect(result.microohms).toBe(1000000000);
    });

    test('should handle milliohms correctly', () => {
      const result = ResistanceConverter.convert(1000, 'mΩ', 'Ω');
      expect(result.toValue).toBe(1);
    });

    test('should throw error for negative resistance values', () => {
      expect(() => {
        ResistanceConverter.convert(-100, 'Ω', 'kΩ');
      }).toThrow('Resistance value cannot be negative');
    });

    test('should handle alternative unit formats', () => {
      const result1 = ResistanceConverter.convert(1000, 'ohm', 'kohm');
      expect(result1.toValue).toBe(1);

      const result2 = ResistanceConverter.convert(1, 'Mohm', 'ohm');
      expect(result2.toValue).toBe(1000000);
    });
  });

  describe('TemperatureConverter', () => {
    test('should convert Celsius to Fahrenheit correctly', () => {
      const result = TemperatureConverter.convert(0, 'C', 'F');
      expect(result.toValue).toBe(32);
      expect(result.formula).toBe('°F = (°C × 9/5) + 32');
    });

    test('should convert Fahrenheit to Celsius correctly', () => {
      const result = TemperatureConverter.convert(32, 'F', 'C');
      expect(result.toValue).toBe(0);
      expect(result.formula).toBe('°C = (°F - 32) × 5/9');
    });

    test('should convert Celsius to Kelvin correctly', () => {
      const result = TemperatureConverter.convert(0, 'C', 'K');
      expect(result.toValue).toBe(273.15);
      expect(result.formula).toBe('K = °C + 273.15');
    });

    test('should convert Kelvin to Celsius correctly', () => {
      const result = TemperatureConverter.convert(273.15, 'K', 'C');
      expect(result.toValue).toBe(0);
      expect(result.formula).toBe('°C = K - 273.15');
    });

    test('should get all temperature conversions', () => {
      const result = TemperatureConverter.getAllConversions(20);
      expect(result.celsius).toBe(20);
      expect(result.fahrenheit).toBe(68);
      expect(result.kelvin).toBe(293.15);
      expect(result.rankine).toBeCloseTo(527.67, 1);
    });

    test('should handle common temperature values', () => {
      // Water boiling point
      const boiling = TemperatureConverter.convert(100, 'C', 'F');
      expect(boiling.toValue).toBe(212);

      // Room temperature
      const room = TemperatureConverter.convert(20, 'C', 'F');
      expect(room.toValue).toBe(68);

      // Absolute zero
      const absolute = TemperatureConverter.convert(0, 'K', 'C');
      expect(absolute.toValue).toBe(-273.15);
    });

    test('should handle degree symbol units', () => {
      const result1 = TemperatureConverter.convert(25, '°C', '°F');
      expect(result1.toValue).toBe(77);

      const result2 = TemperatureConverter.convert(77, '°F', '°C');
      expect(result2.toValue).toBe(25);
    });
  });

  describe('LengthConverter', () => {
    test('should convert meters to feet correctly', () => {
      const result = LengthConverter.convert(1, 'm', 'ft');
      expect(result.toValue).toBeCloseTo(3.28084, 4);
      expect(result.formula).toBe('ft = m × 3.28084');
    });

    test('should convert feet to meters correctly', () => {
      const result = LengthConverter.convert(3.28084, 'ft', 'm');
      expect(result.toValue).toBeCloseTo(1, 4);
      expect(result.formula).toBe('m = ft ÷ 3.28084');
    });

    test('should convert meters to inches correctly', () => {
      const result = LengthConverter.convert(1, 'm', 'in');
      expect(result.toValue).toBeCloseTo(39.3701, 4);
      expect(result.formula).toBe('in = m × 39.3701');
    });

    test('should convert millimeters to inches correctly', () => {
      const result = LengthConverter.convert(25.4, 'mm', 'in');
      expect(result.toValue).toBeCloseTo(1, 4);
      expect(result.formula).toBe('in = mm ÷ 25.4');
    });

    test('should get all length conversions', () => {
      const result = LengthConverter.getAllConversions(1);
      expect(result.meters).toBe(1);
      expect(result.millimeters).toBe(1000);
      expect(result.centimeters).toBe(100);
      expect(result.kilometers).toBe(0.001);
      expect(result.inches).toBeCloseTo(39.3701, 4);
      expect(result.feet).toBeCloseTo(3.28084, 4);
      expect(result.yards).toBeCloseTo(1.09361, 4);
      expect(result.miles).toBeCloseTo(0.000621371, 6);
    });

    test('should handle cable sizing units', () => {
      // Common cable measurements
      const cable1 = LengthConverter.convert(2.5, 'mm', 'in');
      expect(cable1.toValue).toBeCloseTo(0.0984, 4);

      const cable2 = LengthConverter.convert(4, 'mm', 'in');
      expect(cable2.toValue).toBeCloseTo(0.1575, 4);

      const conduit = LengthConverter.convert(20, 'mm', 'in');
      expect(conduit.toValue).toBeCloseTo(0.787, 3);
    });

    test('should throw error for negative length values', () => {
      expect(() => {
        LengthConverter.convert(-100, 'm', 'ft');
      }).toThrow('Length value cannot be negative');
    });

    test('should handle micrometers and nanometers', () => {
      const result1 = LengthConverter.convert(1000000, 'μm', 'm');
      expect(result1.toValue).toBe(1);

      const result2 = LengthConverter.convert(1000000000, 'nm', 'm');
      expect(result2.toValue).toBe(1);
    });
  });

  describe('UnitsConverter Master Class', () => {
    test('should provide access to all converter categories', () => {
      const categories = UnitsConverter.getAvailableCategories();
      expect(categories).toContain('Power');
      expect(categories).toContain('Energy');
      expect(categories).toContain('Voltage');
      expect(categories).toContain('Current');
      expect(categories).toContain('Resistance');
      expect(categories).toContain('Temperature');
      expect(categories).toContain('Length');
    });

    test('should provide available units for each category', () => {
      const powerUnits = UnitsConverter.getAvailableUnits('Power');
      expect(powerUnits).toContain('W');
      expect(powerUnits).toContain('kW');
      expect(powerUnits).toContain('hp');

      const voltageUnits = UnitsConverter.getAvailableUnits('Voltage');
      expect(voltageUnits).toContain('V');
      expect(voltageUnits).toContain('kV');
      expect(voltageUnits).toContain('mV');

      const currentUnits = UnitsConverter.getAvailableUnits('Current');
      expect(currentUnits).toContain('A');
      expect(currentUnits).toContain('mA');
      expect(currentUnits).toContain('kA');
    });

    test('should convert through master interface', () => {
      const powerResult = UnitsConverter.convert(1000, 'W', 'kW', 'Power');
      expect(powerResult.toValue).toBe(1);
      expect(powerResult.category).toBe('Power');

      const voltageResult = UnitsConverter.convert(230, 'V', 'kV', 'Voltage');
      expect(voltageResult.toValue).toBe(0.23);
      expect(voltageResult.category).toBe('Voltage');

      const currentResult = UnitsConverter.convert(16, 'A', 'mA', 'Current');
      expect(currentResult.toValue).toBe(16000);
      expect(currentResult.category).toBe('Current');
    });

    test('should throw error for unsupported category', () => {
      expect(() => {
        UnitsConverter.convert(100, 'unit1', 'unit2', 'InvalidCategory');
      }).toThrow('Unsupported conversion category: InvalidCategory');
    });

    test('should return empty array for unsupported category units', () => {
      const units = UnitsConverter.getAvailableUnits('InvalidCategory');
      expect(units).toEqual([]);
    });
  });

  describe('Real-world electrical calculations', () => {
    test('should handle common electrical engineering conversions', () => {
      // Converting motor power from HP to kW
      const motorPower = PowerConverter.convert(10, 'hp', 'kW');
      expect(motorPower.toValue).toBeCloseTo(7.457, 2);

      // Converting cable length from feet to meters
      const cableLength = LengthConverter.convert(100, 'ft', 'm');
      expect(cableLength.toValue).toBeCloseTo(30.48, 2);

      // Converting ambient temperature from Fahrenheit to Celsius
      const temperature = TemperatureConverter.convert(77, 'F', 'C');
      expect(temperature.toValue).toBeCloseTo(25, 1);

      // Converting current from mA to A
      const current = CurrentConverter.convert(20, 'mA', 'A');
      expect(current.toValue).toBe(0.02);
    });

    test('should handle high voltage conversions', () => {
      // Grid voltage conversions
      const gridVoltage = VoltageConverter.convert(11, 'kV', 'V');
      expect(gridVoltage.toValue).toBe(11000);

      const transmissionVoltage = VoltageConverter.convert(400, 'kV', 'V');
      expect(transmissionVoltage.toValue).toBe(400000);
    });

    test('should handle energy consumption calculations', () => {
      // Converting daily energy consumption
      const dailyConsumption = EnergyConverter.convert(24, 'kWh', 'MJ');
      expect(dailyConsumption.toValue).toBeCloseTo(86.4, 1);

      // Converting appliance energy ratings
      const applianceEnergy = EnergyConverter.convert(2000, 'Wh', 'kWh');
      expect(applianceEnergy.toValue).toBe(2);
    });

    test('should handle precision requirements for electrical calculations', () => {
      // High precision voltage measurements
      const precisionVoltage = VoltageConverter.convert(1.5, 'V', 'mV');
      expect(precisionVoltage.toValue).toBe(1500);

      // High precision current measurements
      const precisionCurrent = CurrentConverter.convert(0.001, 'A', 'mA');
      expect(precisionCurrent.toValue).toBe(1);

      // High precision resistance measurements
      const precisionResistance = ResistanceConverter.convert(0.1, 'Ω', 'mΩ');
      expect(precisionResistance.toValue).toBe(100);
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle zero values correctly', () => {
      const powerResult = PowerConverter.convert(0, 'W', 'kW');
      expect(powerResult.toValue).toBe(0);

      const voltageResult = VoltageConverter.convert(0, 'V', 'mV');
      expect(voltageResult.toValue).toBe(0);

      const currentResult = CurrentConverter.convert(0, 'A', 'mA');
      expect(currentResult.toValue).toBe(0);
    });

    test('should handle very small values correctly', () => {
      const smallPower = PowerConverter.convert(0.001, 'W', 'mW');
      expect(smallPower.toValue).toBe(1);

      const smallVoltage = VoltageConverter.convert(0.001, 'V', 'mV');
      expect(smallVoltage.toValue).toBe(1);

      const smallCurrent = CurrentConverter.convert(0.001, 'A', 'mA');
      expect(smallCurrent.toValue).toBe(1);
    });

    test('should handle very large values correctly', () => {
      const largePower = PowerConverter.convert(1000000, 'W', 'MW');
      expect(largePower.toValue).toBe(1);

      const largeVoltage = VoltageConverter.convert(1000000, 'V', 'MV');
      expect(largeVoltage.toValue).toBe(1);

      const largeResistance = ResistanceConverter.convert(1000000000, 'Ω', 'GΩ');
      expect(largeResistance.toValue).toBe(1);
    });

    test('should maintain precision in conversions', () => {
      // Test round-trip conversions
      const originalValue = 123.456;
      
      const powerRoundTrip = PowerConverter.convert(
        PowerConverter.convert(originalValue, 'W', 'kW').toValue,
        'kW',
        'W'
      );
      expect(powerRoundTrip.toValue).toBeCloseTo(originalValue, 3);

      const voltageRoundTrip = VoltageConverter.convert(
        VoltageConverter.convert(originalValue, 'V', 'mV').toValue,
        'mV',
        'V'
      );
      expect(voltageRoundTrip.toValue).toBeCloseTo(originalValue, 3);
    });
  });
});
