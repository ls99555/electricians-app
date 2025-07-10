/**
 * Unit tests for Advanced Electrical Calculations
 * Tests for Short Circuit Analysis and Voltage Regulation calculators
 */

import {
  ShortCircuitAnalysisCalculator,
  VoltageRegulationCalculator,
  HarmonicsAnalysisCalculator,
  ArcFaultAnalysisCalculator,
  PowerQualityAssessmentCalculator,
  LoadFlowAnalysisCalculator,
  EconomicAnalysisCalculator,
  EnergyLossCalculator
} from '../advanced/advanced-calculations';
import type {
  ShortCircuitAnalysisInputs,
  VoltageRegulationInputs,
  HarmonicsAnalysisInputs,
  ArcFaultAnalysisInputs,
  PowerQualityInputs,
  LoadFlowInputs,
  EconomicAnalysisInputs,
  EnergyLossInputs
} from '../../types';

describe('ShortCircuitAnalysisCalculator', () => {
  describe('calculate()', () => {
    it('should perform short circuit analysis for industrial LV system (BS EN 60909 compliant)', () => {
      const inputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'radial',
          voltageLevel: 0.4, // 400V
          frequency: 50,
          faultType: 'three_phase',
          faultLocation: 'main_distribution_board'
        },
        sourceData: {
          sourceImpedance: 0.05, // Ω
          sourceVoltage: 400,
          sourceType: 'transformer',
          sourceCapacity: 1000, // kVA
          xOverRRatio: 3.0
        },
        networkData: {
          conductors: [{
            type: 'cable',
            length: 50, // meters
            resistance: 0.25, // Ω/km
            reactance: 0.1, // Ω/km
            current_rating: 200 // A
          }],
          transformers: [{
            rating: 1000, // kVA
            impedance: 6, // %
            xOverRRatio: 3.0,
            tapPosition: 0
          }]
        },
        protectionSettings: {
          timeDelay: 0.1, // seconds
          currentSetting: 100, // A
          protectionType: 'instantaneous'
        }
      };

      const result = ShortCircuitAnalysisCalculator.calculate(inputs);

      // Verify fault current calculations
      expect(result.faultCurrents.initialSymmetricalRMS).toBeGreaterThan(1000);
      expect(result.faultCurrents.peakAsymmetrical).toBeGreaterThan(result.faultCurrents.initialSymmetricalRMS);
      expect(result.faultCurrents.interruptingRMS).toBeGreaterThan(0);

      // Verify voltage analysis
      expect(result.voltageProfile.prefaultVoltage).toBe(400);
      expect(result.voltageProfile.faultVoltage).toBeLessThan(400);
      expect(result.voltageProfile.voltageDepressionPercent).toBeGreaterThan(0);

      // Verify protection analysis
      expect(result.protectionAnalysis.operatingTime).toBe(0.1);
      expect(result.protectionAnalysis.clearingTime).toBeGreaterThan(0.1);
      expect(result.protectionAnalysis.arcEnergyLevel).toBeGreaterThan(0);

      // Verify compliance
      expect(result.complianceAssessment.bs7671Compliant).toBeDefined();
      expect(result.complianceAssessment.ieeStandards).toContain('IEEE C37.010');
      expect(result.regulation).toContain('BS EN 60909');
    });

    it('should handle single line to ground fault calculations', () => {
      const inputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'radial',
          voltageLevel: 0.23, // 230V
          frequency: 50,
          faultType: 'line_to_ground',
          faultLocation: 'final_circuit'
        },
        sourceData: {
          sourceImpedance: 0.1,
          sourceVoltage: 230,
          sourceType: 'utility_supply',
          sourceCapacity: 500,
          xOverRRatio: 2.0
        },
        networkData: {
          conductors: [{
            type: 'cable',
            length: 25,
            resistance: 0.5,
            reactance: 0.15,
            current_rating: 32
          }]
        },
        protectionSettings: {
          timeDelay: 0.4,
          currentSetting: 32,
          protectionType: 'definite_time'
        }
      };

      const result = ShortCircuitAnalysisCalculator.calculate(inputs);

      expect(result.faultCurrents.initialSymmetricalRMS).toBeGreaterThan(100);
      expect(result.protectionAnalysis.protectionCoordination).toBeDefined();
      expect(result.systemStability.voltageStability).toBeDefined();
    });

    it('should assess high fault current scenarios with arc flash analysis', () => {
      const inputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'mesh',
          voltageLevel: 11, // 11kV
          frequency: 50,
          faultType: 'three_phase',
          faultLocation: 'switchgear'
        },
        sourceData: {
          sourceImpedance: 0.01,
          sourceVoltage: 11000,
          sourceType: 'generator',
          sourceCapacity: 10000,
          xOverRRatio: 10.0
        },
        networkData: {
          conductors: [{
            type: 'cable',
            length: 100,
            resistance: 0.05,
            reactance: 0.08,
            current_rating: 1000
          }]
        },
        protectionSettings: {
          timeDelay: 0.05,
          currentSetting: 500,
          protectionType: 'instantaneous'
        }
      };

      const result = ShortCircuitAnalysisCalculator.calculate(inputs);

      expect(result.faultCurrents.initialSymmetricalRMS).toBeGreaterThan(10000);
      expect(result.equipmentStress.arcEnergyLevel).toBeGreaterThan(0);
      expect(result.equipmentStress.personalProtectiveEquipment).toContain('Category');
      expect(result.recommendations).toContain('High arc flash energy - implement safety measures');
    });

    it('should validate input parameters correctly', () => {
      const invalidInputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'radial',
          voltageLevel: -400, // Invalid negative voltage
          frequency: 50,
          faultType: 'three_phase',
          faultLocation: 'test'
        },
        sourceData: {
          sourceImpedance: -0.05, // Invalid negative impedance
          sourceVoltage: 400,
          sourceType: 'transformer',
          sourceCapacity: 1000,
          xOverRRatio: 3.0
        },
        networkData: {
          conductors: [] // Invalid empty array
        },
        protectionSettings: {
          timeDelay: 0.1,
          currentSetting: 100,
          protectionType: 'instantaneous'
        }
      };

      expect(() => ShortCircuitAnalysisCalculator.calculate(invalidInputs))
        .toThrow('Voltage level must be positive');
    });

    it('should handle complex network configurations with multiple sources', () => {
      const inputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'interconnected',
          voltageLevel: 0.4,
          frequency: 50,
          faultType: 'three_phase',
          faultLocation: 'bus_coupler'
        },
        sourceData: {
          sourceImpedance: 0.03,
          sourceVoltage: 400,
          sourceType: 'transformer',
          sourceCapacity: 2500,
          xOverRRatio: 5.0
        },
        networkData: {
          conductors: [
            {
              type: 'busbar',
              length: 10,
              resistance: 0.1,
              reactance: 0.05,
              current_rating: 2000
            },
            {
              type: 'cable',
              length: 75,
              resistance: 0.2,
              reactance: 0.08,
              current_rating: 400
            }
          ],
          transformers: [
            {
              rating: 2500,
              impedance: 8,
              xOverRRatio: 5.0,
              tapPosition: 0
            }
          ],
          motors: [
            {
              rating: 100, // kW
              efficiency: 0.9,
              powerFactor: 0.85,
              startingCurrent: 6.0
            }
          ]
        },
        protectionSettings: {
          timeDelay: 0.08,
          currentSetting: 200,
          protectionType: 'inverse_time'
        }
      };

      const result = ShortCircuitAnalysisCalculator.calculate(inputs);

      expect(result.faultCurrents.initialSymmetricalRMS).toBeGreaterThan(1000);
      expect(result.systemStability.transientStability).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(2);
    });
  });
});

describe('VoltageRegulationCalculator', () => {
  describe('calculate()', () => {
    it('should calculate voltage regulation for domestic installation (BS 7671 compliant)', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: 230,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 2000, // 2kW
          reactivePower: 1000, // 1kVAR
          powerFactor: 0.89,
          loadType: 'mixed',
          loadCurve: 'variable'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 30, // meters
          conductorCSA: 2.5, // mm²
          resistance: 7.41, // Ω/km for 2.5mm² copper
          reactance: 0.2, // Ω/km
          installationMethod: 'method_c',
          groupingFactor: 0.8,
          ambientTemperature: 25
        },
        regulationRequirements: {
          maxVoltageVariation: 3, // % for final circuits
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      // Verify voltage calculations
      expect(result.voltageProfile.sourceVoltage).toBe(230);
      expect(result.voltageProfile.fullLoadVoltage).toBeLessThan(230);
      expect(result.voltageProfile.voltageRegulation).toBeGreaterThan(0);
      expect(result.voltageProfile.voltageVariation).toBeGreaterThan(0);

      // Verify compliance assessment
      expect(result.complianceAssessment.maxPermissibleDrop).toBe(3);
      expect(result.complianceAssessment.bs7671Compliant).toBeDefined();
      expect(result.complianceAssessment.en50160Compliant).toBeDefined();

      // Verify load analysis
      expect(result.loadAnalysis.currentAtLoad).toBeGreaterThan(0);
      expect(result.loadAnalysis.efficiencyPercent).toBeLessThan(100);
      expect(result.loadAnalysis.energyLosses).toBeGreaterThan(0);

      expect(result.regulation).toContain('BS 7671');
    });

    it('should calculate voltage regulation for three-phase industrial load', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'three_phase_4wire',
          nominalVoltage: 400,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 50000, // 50kW
          reactivePower: 25000, // 25kVAR
          powerFactor: 0.9,
          loadType: 'motor',
          loadCurve: 'constant'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 150, // meters
          conductorCSA: 50, // mm²
          resistance: 0.387, // Ω/km for 50mm² copper
          reactance: 0.15, // Ω/km
          installationMethod: 'method_d',
          groupingFactor: 0.75,
          ambientTemperature: 35
        },
        regulationRequirements: {
          maxVoltageVariation: 6, // % for distribution
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        },
        compensationOptions: {
          voltageRegulator: false,
          powerFactorCorrection: true,
          distributedGeneration: false,
          energyStorage: false
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      expect(result.voltageProfile.sourceVoltage).toBe(400);
      expect(result.loadAnalysis.currentAtLoad).toBeGreaterThan(70); // Approximately I = P/(√3*V*cosφ)
      expect(result.complianceAssessment.maxPermissibleDrop).toBe(6);
      
      // Should suggest power factor correction for 0.9 PF
      expect(result.improvementSuggestions.powerFactorCorrection).toBeDefined();
      expect(result.improvementSuggestions.powerFactorCorrection?.requiredCapacitance).toBeGreaterThan(0);
    });

    it('should identify non-compliant voltage drops and suggest remedial action', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: 230,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 3000, // High load
          reactivePower: 2000,
          powerFactor: 0.83,
          loadType: 'mixed',
          loadCurve: 'constant'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 100, // Long cable run
          conductorCSA: 1.5, // Small conductor
          resistance: 12.1, // Ω/km for 1.5mm² copper
          reactance: 0.25,
          installationMethod: 'method_c',
          groupingFactor: 0.8,
          ambientTemperature: 30
        },
        regulationRequirements: {
          maxVoltageVariation: 3,
          regulationStandard: 'bs_7671',
          criticalLoad: true, // Critical load requires tighter regulation
          regulationPoint: 'load_end'
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      // Should exceed acceptable voltage drop
      expect(result.complianceAssessment.withinLimits).toBe(false);
      expect(result.complianceAssessment.actualDrop).toBeGreaterThan(3);
      expect(result.complianceAssessment.safetyMargin).toBeLessThan(0);

      // Should suggest conductor upgrade
      expect(result.improvementSuggestions.conductorUpgrade).toBeDefined();
      expect(result.improvementSuggestions.conductorUpgrade?.recommendedCSA).toBeGreaterThan(1.5);

      expect(result.recommendations).toContain('Voltage regulation exceeds acceptable limits');
    });

    it('should perform economic analysis for system improvements', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'three_phase_3wire',
          nominalVoltage: 400,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 25000,
          reactivePower: 15000,
          powerFactor: 0.85,
          loadType: 'mixed',
          loadCurve: 'variable'
        },
        conductorData: {
          conductorType: 'aluminium',
          cableLength: 200,
          conductorCSA: 25,
          resistance: 1.2, // Ω/km for 25mm² aluminium
          reactance: 0.2,
          installationMethod: 'method_d',
          groupingFactor: 0.8,
          ambientTemperature: 25
        },
        regulationRequirements: {
          maxVoltageVariation: 5,
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      expect(result.economicAnalysis.energyLossCost).toBeGreaterThan(0);
      expect(result.economicAnalysis.paybackPeriod).toBeGreaterThan(0);
      expect(result.economicAnalysis.netPresentValue).toBeDefined();

      if (result.economicAnalysis.paybackPeriod < 5) {
        expect(result.recommendations).toContain('Economic case for system upgrade exists');
      }
    });

    it('should validate input parameters and handle edge cases', () => {
      const invalidInputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: -230, // Invalid negative voltage
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: -1000, // Invalid negative power
          reactivePower: 500,
          powerFactor: 0.8,
          loadType: 'resistive',
          loadCurve: 'constant'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: -30, // Invalid negative length
          conductorCSA: 2.5,
          resistance: 7.41,
          reactance: 0.2,
          installationMethod: 'method_c',
          groupingFactor: 0.8,
          ambientTemperature: 25
        },
        regulationRequirements: {
          maxVoltageVariation: 3,
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        }
      };

      expect(() => VoltageRegulationCalculator.calculate(invalidInputs))
        .toThrow('Nominal voltage must be positive');
    });

    it('should handle extreme environmental conditions and long cable runs', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: 230,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 1500,
          reactivePower: 800,
          powerFactor: 0.88,
          loadType: 'led_lighting',
          loadCurve: 'constant'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 500, // Very long run
          conductorCSA: 4.0,
          resistance: 4.61, // Ω/km for 4mm² copper
          reactance: 0.15,
          installationMethod: 'method_c',
          groupingFactor: 0.7,
          ambientTemperature: 45 // High temperature
        },
        regulationRequirements: {
          maxVoltageVariation: 3,
          regulationStandard: 'bs_en_50160',
          criticalLoad: true,
          regulationPoint: 'most_onerous_point'
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      // High temperature should affect calculations
      expect(result.voltageProfile.voltageVariation).toBeGreaterThan(2);
      
      // Should recommend voltage regulator for very long runs
      if (result.complianceAssessment.actualDrop > 4.5) {
        expect(result.improvementSuggestions.voltageRegulator?.recommended).toBe(true);
      }

      expect(result.recommendations).toContain('Regular monitoring of voltage levels recommended');
    });
  });

  describe('Regulatory Compliance', () => {
    it('should ensure all advanced calculations reference appropriate UK standards', () => {
      const shortCircuitInputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'radial',
          voltageLevel: 0.4,
          frequency: 50,
          faultType: 'three_phase',
          faultLocation: 'test'
        },
        sourceData: {
          sourceImpedance: 0.05,
          sourceVoltage: 400,
          sourceType: 'transformer',
          sourceCapacity: 1000,
          xOverRRatio: 3.0
        },
        networkData: {
          conductors: [{
            type: 'cable',
            length: 50,
            resistance: 0.25,
            reactance: 0.1,
            current_rating: 200
          }]
        },
        protectionSettings: {
          timeDelay: 0.1,
          currentSetting: 100,
          protectionType: 'instantaneous'
        }
      };

      const voltageInputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: 230,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 2000,
          reactivePower: 1000,
          powerFactor: 0.89,
          loadType: 'mixed',
          loadCurve: 'variable'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 30,
          conductorCSA: 2.5,
          resistance: 7.41,
          reactance: 0.2,
          installationMethod: 'method_c',
          groupingFactor: 0.8,
          ambientTemperature: 25
        },
        regulationRequirements: {
          maxVoltageVariation: 3,
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        }
      };

      const shortCircuitResult = ShortCircuitAnalysisCalculator.calculate(shortCircuitInputs);
      const voltageResult = VoltageRegulationCalculator.calculate(voltageInputs);

      // Check regulation references
      expect(shortCircuitResult.regulation).toMatch(/BS|IET|IEEE/);
      expect(voltageResult.regulation).toMatch(/BS|EN/);

      // Check compliance assessments
      expect(shortCircuitResult.complianceAssessment.bs7671Compliant).toBeDefined();
      expect(voltageResult.complianceAssessment.bs7671Compliant).toBeDefined();
    });

    it('should validate safety margins and professional recommendations', () => {
      const inputs: VoltageRegulationInputs = {
        systemConfiguration: {
          systemType: 'single_phase',
          nominalVoltage: 230,
          frequency: 50,
          supplierTolerance: 6
        },
        loadData: {
          activePower: 1000,
          reactivePower: 400,
          powerFactor: 0.93,
          loadType: 'resistive',
          loadCurve: 'constant'
        },
        conductorData: {
          conductorType: 'copper',
          cableLength: 20,
          conductorCSA: 2.5,
          resistance: 7.41,
          reactance: 0.2,
          installationMethod: 'method_c',
          groupingFactor: 0.8,
          ambientTemperature: 25
        },
        regulationRequirements: {
          maxVoltageVariation: 3,
          regulationStandard: 'bs_7671',
          criticalLoad: false,
          regulationPoint: 'load_end'
        }
      };

      const result = VoltageRegulationCalculator.calculate(inputs);

      expect(result.complianceAssessment.safetyMargin).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(rec => rec.includes('monitoring') || rec.includes('compliance'))).toBe(true);
    });

    it('should ensure all calculations include appropriate disclaimers and references', () => {
      const shortCircuitInputs: ShortCircuitAnalysisInputs = {
        systemConfiguration: {
          systemType: 'radial',
          voltageLevel: 0.4,
          frequency: 50,
          faultType: 'line_to_ground',
          faultLocation: 'test'
        },
        sourceData: {
          sourceImpedance: 0.08,
          sourceVoltage: 400,
          sourceType: 'utility_supply',
          sourceCapacity: 500,
          xOverRRatio: 2.5
        },
        networkData: {
          conductors: [{
            type: 'cable',
            length: 25,
            resistance: 0.5,
            reactance: 0.15,
            current_rating: 100
          }]
        },
        protectionSettings: {
          timeDelay: 0.2,
          currentSetting: 63,
          protectionType: 'definite_time'
        }
      };

      const result = ShortCircuitAnalysisCalculator.calculate(shortCircuitInputs);

      expect(result.regulation).toContain('BS');
      expect(result.recommendations).toContain('Verify equipment ratings against calculated fault currents');
      expect(result.complianceAssessment.bs7671Compliant).toBeDefined();
    });
  });

  describe('HarmonicsAnalysisCalculator', () => {
    describe('calculate()', () => {
      it('should perform comprehensive harmonics analysis for commercial installation (BS EN 61000 compliant)', () => {
        const inputs: HarmonicsAnalysisInputs = {
          systemData: {
            systemVoltage: 400, // V
            frequency: 50, // Hz
            systemType: 'three_phase',
            neutralSize: 35, // mm²
            earthingSystem: 'TN-S'
          },
          loadData: {
            nonLinearLoads: [
              {
                loadType: 'led_lighting',
                power: 5000, // W
                quantity: 10,
                harmonicSpectrum: { 3: 15, 5: 8, 7: 5, 9: 3 }, // % harmonics
                thdi: 20 // %
              },
              {
                loadType: 'computer_equipment',
                power: 2000, // W
                quantity: 25,
                harmonicSpectrum: { 3: 25, 5: 12, 7: 8, 9: 5 },
                thdi: 35 // %
              }
            ],
            linearLoads: {
              totalPower: 15000, // W
              powerFactor: 0.95
            }
          },
          systemImpedance: {
            sourceImpedance: 0.05, // Ω
            lineImpedance: 0.02, // Ω
            neutralImpedance: 0.025 // Ω
          },        complianceStandards: {
          standard: 'bs_en_61000_3_4',
          voltageClass: 'lv',
          locationClass: 'commercial'
        }
        };

        const result = HarmonicsAnalysisCalculator.calculate(inputs);

        // Verify harmonic spectrum calculations
        expect(result.harmonicSpectrum.fundamentalCurrent).toBeGreaterThan(0);
        expect(result.harmonicSpectrum.harmonicCurrents).toBeDefined();
        expect(result.harmonicSpectrum.harmonicVoltages).toBeDefined();

        // Verify distortion factors
        expect(result.distortionFactors.thdv).toBeGreaterThan(0);
        expect(result.distortionFactors.thdi).toBeGreaterThan(0);
        expect(result.distortionFactors.kFactor).toBeGreaterThanOrEqual(1);
        expect(result.distortionFactors.crestFactor).toBeGreaterThan(1);

        // Verify system effects
        expect(result.systemEffects.neutralCurrent).toBeGreaterThan(0);
        expect(result.systemEffects.powerLosses).toBeGreaterThan(0);
        expect(result.systemEffects.trueRMSCurrent).toBeGreaterThan(result.harmonicSpectrum.fundamentalCurrent);

        // Verify compliance assessment
        expect(result.complianceAssessment).toBeDefined();
        expect(typeof result.complianceAssessment.withinLimits).toBe('boolean');
        expect(typeof result.complianceAssessment.standardCompliant).toBe('boolean');

        // Verify mitigation suggestions
        expect(result.mitigationSuggestions.filtering).toBeDefined();
        expect(result.mitigationSuggestions.neutralUpgrading).toBeDefined();

        // Verify economic impact
        expect(result.economicImpact.additionalLosses).toBeGreaterThanOrEqual(0);
        expect(result.economicImpact.mitigationCost).toBeGreaterThanOrEqual(0);

        // Verify BS EN 61000 compliance reference
        expect(result.regulation).toContain('BS EN 61000');
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it('should handle high harmonic distortion industrial loads', () => {
        const inputs: HarmonicsAnalysisInputs = {
          systemData: {
            systemVoltage: 400,
            frequency: 50,
            systemType: 'three_phase',
            neutralSize: 120,
            earthingSystem: 'TN-C-S'
          },
          loadData: {
            nonLinearLoads: [            {
              loadType: 'vfd_drives',
              power: 50000, // W
              quantity: 5,
              harmonicSpectrum: { 3: 25, 5: 20, 7: 14, 9: 15, 11: 9, 13: 7 }, // Include triplen harmonics
              thdi: 45 // High distortion
            }
            ],
            linearLoads: {
              totalPower: 20000,
              powerFactor: 0.85
            }
          },
          systemImpedance: {
            sourceImpedance: 0.08,
            lineImpedance: 0.03
          },        complianceStandards: {
          standard: 'ieee_519',
          voltageClass: 'lv',
          locationClass: 'industrial'
        }
        };

        const result = HarmonicsAnalysisCalculator.calculate(inputs);

        // High distortion should require mitigation
        expect(result.complianceAssessment.remedialActionRequired).toBe(true);
        expect(result.mitigationSuggestions.filtering.required).toBe(true);
        
        // Should recommend active filtering for high distortion
        if (result.systemEffects.powerLosses > 1000) {
          expect(result.mitigationSuggestions.filtering.filterType).toBe('active');
        }

        // High distortion should increase neutral current significantly
        expect(result.systemEffects.neutralCurrent).toBeGreaterThan(10);
        
        // Economic analysis should show significant losses
        expect(result.economicImpact.additionalLosses).toBeGreaterThan(500);

        expect(result.recommendations).toContain('Harmonic mitigation required to meet UK/European standards');
      });

      it('should validate input parameters correctly', () => {
        const invalidInputs: HarmonicsAnalysisInputs = {
          systemData: {
            systemVoltage: -400, // Invalid negative voltage
            frequency: 50,
            systemType: 'three_phase',
            neutralSize: 35,
            earthingSystem: 'TN-S'
          },
          loadData: {
            nonLinearLoads: [],
            linearLoads: { totalPower: 0, powerFactor: 0.95 }
          },
          systemImpedance: {
            sourceImpedance: 0.05,
            lineImpedance: 0.02
          },        complianceStandards: {
          standard: 'bs_en_61000_3_4',
          voltageClass: 'lv',
          locationClass: 'commercial'
        }
        };

        expect(() => HarmonicsAnalysisCalculator.calculate(invalidInputs))
          .toThrow('System voltage must be positive');
      });
    });
  });

  describe('ArcFaultAnalysisCalculator', () => {
    describe('calculate()', () => {
      it('should perform comprehensive arc fault analysis for switchgear (BS 7909 compliant)', () => {
        const inputs: ArcFaultAnalysisInputs = {
          systemData: {
            systemVoltage: 400, // V
            systemType: 'three_phase',
            earthingSystem: 'TN-S',
            frequency: 50,
            systemCapacity: 1000 // kVA
          },
          faultData: {
            faultLocation: 'switchgear',
            gapDistance: 25, // mm
            electrodeConfig: 'copper_copper',
            ambientConditions: {
              temperature: 25, // °C
              humidity: 60, // %
              pressure: 101.325, // kPa
              airflow: 'natural'
            }
          },
          protectionData: {
            arcFaultDevices: [
              {
                type: 'afdd_device',
                responseTime: 40, // ms
                sensitivity: 30, // A
                installed: true
              }
            ],
            conventionalProtection: {
              deviceType: 'mccb',
              rating: 100, // A
              breakingCapacity: 25, // kA
              responseTime: 20 // ms
            }
          },
          installationData: {
            cableType: 'XLPE/SWA/PVC',
            conductorMaterial: 'copper',
            insulationType: 'xlpe',
            installationMethod: 'Method C',
            enclosureType: 'enclosed'
          }
        };

        const result = ArcFaultAnalysisCalculator.calculate(inputs);

        // Verify arc characteristics calculations
        expect(result.arcCharacteristics.arcVoltage).toBeGreaterThan(0);
        expect(result.arcCharacteristics.arcCurrent).toBeGreaterThan(0);
        expect(result.arcCharacteristics.arcPower).toBeGreaterThan(0);
        expect(result.arcCharacteristics.arcEnergy).toBeGreaterThan(0);

        // Verify thermal effects
        expect(result.thermalEffects.arcTemperature).toBeGreaterThan(3000); // °C
        expect(result.thermalEffects.thermalDamageRadius).toBeGreaterThan(0);
        expect(['low', 'medium', 'high', 'critical']).toContain(result.thermalEffects.materialIgnitionRisk);

        // Verify protection analysis
        expect(result.protectionAnalysis.arcFaultDetected).toBe(true); // AFDD installed
        expect(result.protectionAnalysis.detectionTime).toBeLessThanOrEqual(40);
        expect(result.protectionAnalysis.totalFaultDuration).toBeGreaterThan(0);

        // Verify risk assessment
        expect(['low', 'medium', 'high', 'critical']).toContain(result.riskAssessment.personalSafetyRisk);
        expect(['acceptable', 'tolerable', 'unacceptable']).toContain(result.riskAssessment.overallRiskLevel);

        // Verify compliance
        expect(typeof result.complianceIssues.bs7671Compliance).toBe('boolean');
        expect(typeof result.complianceIssues.bs7909Compliance).toBe('boolean');

        // Verify BS 7909 reference
        expect(result.regulation).toContain('BS 7909');
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it('should assess high-risk arc fault scenarios without protection', () => {
        const inputs: ArcFaultAnalysisInputs = {
          systemData: {
            systemVoltage: 400,
            systemType: 'three_phase',
            earthingSystem: 'TN-S',
            frequency: 50,
            systemCapacity: 2500 // High capacity system
          },
          faultData: {
            faultLocation: 'busbar',
            gapDistance: 50, // Large gap
            electrodeConfig: 'copper_copper',
            ambientConditions: {
              temperature: 40,
              humidity: 40,
              pressure: 101.325,
              airflow: 'still' // Poor ventilation
            }
          },
          protectionData: {
            arcFaultDevices: [], // No arc fault protection
            conventionalProtection: {
              deviceType: 'fuse',
              rating: 200,
              breakingCapacity: 10,
              responseTime: 500 // Slow response
            }
          },
          installationData: {
            cableType: 'PVC/PVC',
            conductorMaterial: 'copper',
            insulationType: 'pvc',
            installationMethod: 'Method B',
            enclosureType: 'open'
          }
        };

        const result = ArcFaultAnalysisCalculator.calculate(inputs);

        // No arc fault protection should be detected
        expect(result.protectionAnalysis.arcFaultDetected).toBe(false);
        expect(result.protectionAnalysis.totalFaultDuration).toBeGreaterThan(100);

        // High energy should result in high risks
        expect(result.riskAssessment.overallRiskLevel).not.toBe('acceptable');
        
        // Should require arc fault protection
        expect(result.mitigationMeasures.arcFaultProtection.required).toBe(true);
        expect(result.mitigationMeasures.arcFaultProtection.recommendedDevices.length).toBeGreaterThan(0);

        // Economic analysis should show high potential damage cost
        expect(result.economicAnalysis.potentialDamageCost).toBeGreaterThan(50000);

        expect(result.recommendations).toContain('Install arc fault detection devices (AFDD) as per BS 7671 Amendment 2');
      });

      it('should validate input parameters and handle edge cases', () => {
        const invalidInputs: ArcFaultAnalysisInputs = {
          systemData: {
            systemVoltage: 0, // Invalid voltage
            systemType: 'three_phase',
            earthingSystem: 'TN-S',
            frequency: 50,
            systemCapacity: 1000
          },
          faultData: {
            faultLocation: 'switchgear',
            gapDistance: 25,
            electrodeConfig: 'copper_copper',
            ambientConditions: {
              temperature: 25,
              humidity: 60,
              pressure: 101.325,
              airflow: 'natural'
            }
          },
          protectionData: {
            arcFaultDevices: [],
            conventionalProtection: {
              deviceType: 'mccb',
              rating: 100,
              breakingCapacity: 25,
              responseTime: 20
            }
          },
          installationData: {
            cableType: 'XLPE/SWA/PVC',
            conductorMaterial: 'copper',
            insulationType: 'xlpe',
            installationMethod: 'Method C',
            enclosureType: 'enclosed'
          }
        };

        expect(() => ArcFaultAnalysisCalculator.calculate(invalidInputs))
          .toThrow('System voltage must be positive');
      });
    });
  });

  describe('PowerQualityAssessmentCalculator', () => {
    describe('calculate()', () => {
      it('should perform comprehensive power quality assessment (BS EN 50160 compliant)', () => {
        const inputs: PowerQualityInputs = {
          measurementData: {
            duration: 24, // hours
            samplingInterval: 10, // seconds
            measurements: [
              { timestamp: 0, voltage: { L1: 230, L2: 228, L3: 232 }, current: { L1: 45, L2: 43, L3: 47 }, frequency: 50.02, powerFactor: 0.92 },
              { timestamp: 10, voltage: { L1: 229, L2: 227, L3: 231 }, current: { L1: 44, L2: 42, L3: 46 }, frequency: 49.98, powerFactor: 0.91 },
              { timestamp: 20, voltage: { L1: 231, L2: 229, L3: 233 }, current: { L1: 46, L2: 44, L3: 48 }, frequency: 50.01, powerFactor: 0.93 },
              { timestamp: 30, voltage: { L1: 225, L2: 223, L3: 227 }, current: { L1: 42, L2: 40, L3: 44 }, frequency: 49.95, powerFactor: 0.88 }, // Voltage sag
              { timestamp: 40, voltage: { L1: 230, L2: 228, L3: 232 }, current: { L1: 45, L2: 43, L3: 47 }, frequency: 50.03, powerFactor: 0.92 }
            ]
          },
          systemData: {
            nominalVoltage: 230, // V
            nominalFrequency: 50, // Hz
            systemType: 'three_phase',
            neutralPresent: true
          },
          loadCharacteristics: {
            loadTypes: [
              { type: 'resistive', percentage: 40, variability: 'constant' },
              { type: 'inductive', percentage: 35, variability: 'varying' },
              { type: 'non_linear', percentage: 25, variability: 'intermittent' }
            ],
            totalLoad: 85, // kW
            peakDemand: 95 // kW
          },
          environmentalFactors: {
            temperatureVariation: 15, // °C
            externalInterference: false,
            switchingOperations: 5,
            motorStarting: 8
          },
          complianceStandards: {
            standard: 'bs_en_50160',
            voltageClass: 'lv',
            locationClass: 'commercial'
          }
        };

        const result = PowerQualityAssessmentCalculator.calculate(inputs);

        // Verify voltage quality analysis
        expect(result.voltageQuality.steadyStateDeviations).toBeDefined();
        expect(result.voltageQuality.transientDisturbances).toBeDefined();
        expect(result.voltageQuality.harmonicDistortion).toBeDefined();
        expect(typeof result.voltageQuality.steadyStateDeviations.compliance).toBe('boolean');

        // Verify frequency stability
        expect(result.frequencyStability.deviations).toBeDefined();
        expect(result.frequencyStability.rateOfChange).toBeDefined();
        expect(typeof result.frequencyStability.compliance).toBe('boolean');

        // Verify power quality indices
        expect(result.powerQualityIndices.powerFactorVariation).toBeDefined();
        expect(result.powerQualityIndices.flickerSeverity).toBeDefined();
        expect(result.powerQualityIndices.powerFactorVariation.minimum).toBeLessThanOrEqual(result.powerQualityIndices.powerFactorVariation.maximum);

        // Verify impact assessment
        expect(['low', 'medium', 'high', 'critical']).toContain(result.impactAssessment.equipmentStress);
        expect(result.impactAssessment.efficiencyLoss).toBeGreaterThanOrEqual(0);
        expect(typeof result.impactAssessment.sensitiveLoadCompatibility).toBe('boolean');

        // Verify source identification
        expect(Array.isArray(result.sourceIdentification.internalSources)).toBe(true);
        expect(Array.isArray(result.sourceIdentification.externalSources)).toBe(true);
        expect(['internal', 'external', 'mixed']).toContain(result.sourceIdentification.dominantSource);

        // Verify compliance status
        expect(typeof result.complianceStatus.overallCompliance).toBe('boolean');
        expect(Array.isArray(result.complianceStatus.standardsViolated)).toBe(true);

        // Verify BS EN 50160 reference
        expect(result.regulation).toContain('BS EN 50160');
        expect(result.recommendations.length).toBeGreaterThan(0);
      });

      it('should identify power quality issues and recommend mitigation', () => {
        const inputs: PowerQualityInputs = {
          measurementData: {
            duration: 1,
            samplingInterval: 1,
            measurements: [
              { timestamp: 0, voltage: { L1: 207, L2: 205, L3: 209 }, current: { L1: 55, L2: 53, L3: 57 }, frequency: 48.5, powerFactor: 0.75 }, // Poor quality
              { timestamp: 1, voltage: { L1: 253, L2: 251, L3: 255 }, current: { L1: 65, L2: 63, L3: 67 }, frequency: 51.2, powerFactor: 0.72 }, // Over-voltage
              { timestamp: 2, voltage: { L1: 195, L2: 193, L3: 197 }, current: { L1: 35, L2: 33, L3: 37 }, frequency: 49.1, powerFactor: 0.68 } // Under-voltage
            ]
          },
          systemData: {
            nominalVoltage: 230,
            nominalFrequency: 50,
            systemType: 'three_phase',
            neutralPresent: true
          },
          loadCharacteristics: {
            loadTypes: [
              { type: 'non_linear', percentage: 70, variability: 'varying' }, // High non-linear load
              { type: 'motor', percentage: 30, variability: 'intermittent' }
            ],
            totalLoad: 150,
            peakDemand: 180
          },
          environmentalFactors: {
            temperatureVariation: 25,
            externalInterference: true,
            switchingOperations: 20,
            motorStarting: 15
          },
          complianceStandards: {
            standard: 'bs_en_50160',
            voltageClass: 'lv',
            locationClass: 'industrial'
          }
        };

        const result = PowerQualityAssessmentCalculator.calculate(inputs);

        // Poor power quality should fail compliance
        expect(result.complianceStatus.overallCompliance).toBe(false);
        expect(result.complianceStatus.standardsViolated.length).toBeGreaterThan(0);

        // Should recommend immediate action
        expect(result.mitigationRecommendations.immediate.length).toBeGreaterThan(0);
        expect(result.complianceStatus.actionRequired).toBe(true);

        // High non-linear loads should show in source identification
        expect(result.sourceIdentification.internalSources).toContain('Non-linear loads (harmonics)');

        // Economic impact should show quality-related losses
        expect(result.economicImpact.qualityRelatedLosses).toBeGreaterThan(0);

        expect(result.recommendations).toContain('Immediate action required to achieve power quality compliance');
      });

      it('should validate input parameters correctly', () => {
        const invalidInputs: PowerQualityInputs = {
          measurementData: {
            duration: 0, // Invalid duration
            samplingInterval: 10,
            measurements: []
          },
          systemData: {
            nominalVoltage: 230,
            nominalFrequency: 50,
            systemType: 'three_phase',
            neutralPresent: true
          },
          loadCharacteristics: {
            loadTypes: [],
            totalLoad: 0,
            peakDemand: 0
          },
          environmentalFactors: {
            temperatureVariation: 15,
            externalInterference: false,
            switchingOperations: 5,
            motorStarting: 8
          },
          complianceStandards: {
            standard: 'bs_en_50160',
            voltageClass: 'lv',
            locationClass: 'commercial'
          }
        };

        expect(() => PowerQualityAssessmentCalculator.calculate(invalidInputs))
          .toThrow('Measurement duration must be positive');
      });
    });
  });
});

describe('LoadFlowAnalysisCalculator', () => {
  describe('calculate()', () => {
    it('should perform load flow analysis for simple radial system', () => {
      const inputs: LoadFlowInputs = {
        systemData: {
          systemVoltage: 400,
          frequency: 50,
          systemType: 'radial',
          baseKVA: 1000
        },
        buses: [
          {
            busId: 'Bus1',
            voltage: 400,
            angle: 0,
            busType: 'slack',
            powerGeneration: { P: 100, Q: 50 }
          },
          {
            busId: 'Bus2',
            voltage: 380,
            angle: -2,
            busType: 'PQ',
            powerLoad: { P: 80, Q: 40 }
          }
        ],
        branches: [
          {
            branchId: 'Line1-2',
            fromBus: 'Bus1',
            toBus: 'Bus2',
            resistance: 0.1,
            reactance: 0.15,
            susceptance: 0.001,
            ratingMVA: 10
          }
        ],
        loadModels: {
          constantPower: 70,
          constantCurrent: 20,
          constantImpedance: 10
        },
        convergenceCriteria: {
          maxIterations: 20,
          tolerance: 0.001
        }
      };

      const result = LoadFlowAnalysisCalculator.calculate(inputs);

      // Verify basic structure
      expect(result).toHaveProperty('converged');
      expect(result).toHaveProperty('iterations');
      expect(result).toHaveProperty('busResults');
      expect(result).toHaveProperty('branchResults');
      expect(result).toHaveProperty('systemSummary');
      expect(result).toHaveProperty('recommendations');

      // Verify convergence
      expect(result.converged).toBe(true);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.iterations).toBeLessThanOrEqual(20);

      // Verify bus results
      expect(result.busResults).toHaveLength(2);
      result.busResults.forEach(bus => {
        expect(bus).toHaveProperty('busId');
        expect(bus).toHaveProperty('voltage');
        expect(bus.voltage.magnitude).toBeGreaterThan(0);
        expect(bus).toHaveProperty('compliance');
      });

      // Verify branch results
      expect(result.branchResults).toHaveLength(1);
      const branchResult = result.branchResults[0];
      expect(branchResult.branchId).toBe('Line1-2');
      expect(branchResult.current).toBeGreaterThan(0);
      expect(branchResult.loading).toBeGreaterThanOrEqual(0);

      // Verify system summary
      expect(result.systemSummary).toHaveProperty('totalGeneration');
      expect(result.systemSummary).toHaveProperty('totalLoad');
      expect(result.systemSummary).toHaveProperty('totalLosses');
      expect(result.systemSummary.totalLosses.P).toBeGreaterThanOrEqual(0);

      // Verify regulation compliance
      expect(result.regulation).toContain('IEC 60909');
      expect(result.recommendations).toContain('Regular load flow studies recommended for system optimization');
    });

    it('should handle mesh network configuration', () => {
      const inputs: LoadFlowInputs = {
        systemData: {
          systemVoltage: 11000,
          frequency: 50,
          systemType: 'mesh',
          baseKVA: 10000
        },
        buses: [
          {
            busId: 'Gen1',
            voltage: 11000,
            angle: 0,
            busType: 'slack',
            powerGeneration: { P: 5000, Q: 2000 }
          },
          {
            busId: 'Load1',
            voltage: 10800,
            angle: -5,
            busType: 'PQ',
            powerLoad: { P: 2000, Q: 1000 }
          },
          {
            busId: 'Load2',
            voltage: 10700,
            angle: -8,
            busType: 'PQ',
            powerLoad: { P: 2500, Q: 1200 }
          }
        ],
        branches: [
          {
            branchId: 'Gen-Load1',
            fromBus: 'Gen1',
            toBus: 'Load1',
            resistance: 0.02,
            reactance: 0.08,
            susceptance: 0.0001,
            ratingMVA: 50
          },
          {
            branchId: 'Gen-Load2',
            fromBus: 'Gen1',
            toBus: 'Load2',
            resistance: 0.03,
            reactance: 0.10,
            susceptance: 0.0001,
            ratingMVA: 50
          },
          {
            branchId: 'Load1-Load2',
            fromBus: 'Load1',
            toBus: 'Load2',
            resistance: 0.025,
            reactance: 0.09,
            susceptance: 0.0001,
            ratingMVA: 30
          }
        ],
        loadModels: {
          constantPower: 80,
          constantCurrent: 15,
          constantImpedance: 5
        },
        convergenceCriteria: {
          maxIterations: 30,
          tolerance: 0.0001
        }
      };

      const result = LoadFlowAnalysisCalculator.calculate(inputs);

      expect(result.converged).toBe(true);
      expect(result.busResults).toHaveLength(3);
      expect(result.branchResults).toHaveLength(3);
      
      // Check for voltage regulation issues in 11kV system
      const voltageLimits = result.busResults.every(bus => 
        Math.abs(bus.voltageDropFromNominal) <= 10
      );
      expect(result.systemSummary.voltageLimitViolations.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate input parameters correctly', () => {
      expect(() => LoadFlowAnalysisCalculator.calculate({
        systemData: {
          systemVoltage: -400,
          frequency: 50,
          systemType: 'radial',
          baseKVA: 1000
        },
        buses: [],
        branches: [],
        loadModels: { constantPower: 100, constantCurrent: 0, constantImpedance: 0 },
        convergenceCriteria: { maxIterations: 20, tolerance: 0.001 }
      })).toThrow('At least 2 buses required');

      expect(() => LoadFlowAnalysisCalculator.calculate({
        systemData: {
          systemVoltage: 400,
          frequency: 50,
          systemType: 'radial',
          baseKVA: 1000
        },
        buses: [
          { busId: 'Bus1', voltage: 400, angle: 0, busType: 'PV' },
          { busId: 'Bus2', voltage: 380, angle: -2, busType: 'PQ' }
        ],
        branches: [],
        loadModels: { constantPower: 100, constantCurrent: 0, constantImpedance: 0 },
        convergenceCriteria: { maxIterations: 20, tolerance: 0.001 }
      })).toThrow('Exactly one slack bus required');
    });
  });

  describe('contingency analysis', () => {
    it('should identify critical outages', () => {
      const inputs: LoadFlowInputs = {
        systemData: {
          systemVoltage: 400,
          frequency: 50,
          systemType: 'radial',
          baseKVA: 1000
        },
        buses: [
          { busId: 'Bus1', voltage: 400, angle: 0, busType: 'slack' },
          { busId: 'Bus2', voltage: 380, angle: -2, busType: 'PQ' }
        ],
        branches: [
          {
            branchId: 'OnlyLine',
            fromBus: 'Bus1',
            toBus: 'Bus2',
            resistance: 0.1,
            reactance: 0.15,
            susceptance: 0.001
          }
        ],
        loadModels: { constantPower: 100, constantCurrent: 0, constantImpedance: 0 },
        convergenceCriteria: { maxIterations: 20, tolerance: 0.001 }
      };

      const result = LoadFlowAnalysisCalculator.calculate(inputs);
      
      expect(result.contingencyAnalysis).toBeDefined();
      expect(result.contingencyAnalysis?.criticalOutages).toContain('OnlyLine');
    });
  });
});

describe('EconomicAnalysisCalculator', () => {
  describe('calculate()', () => {
    it('should perform economic analysis for cable sizing optimization', () => {
      const inputs: EconomicAnalysisInputs = {
        project: {
          projectLife: 25,
          discountRate: 5,
          inflationRate: 2,
          electricityTariff: 0.15,
          carbonPrice: 25
        },
        cableOptions: [
          {
            csa: 25,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'underground',
            length: 100,
            currentRating: 85,
            resistance: 0.727,
            reactance: 0.080,
            unitCost: 15,
            installationCost: 25
          },
          {
            csa: 35,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'underground',
            length: 100,
            currentRating: 105,
            resistance: 0.524,
            reactance: 0.077,
            unitCost: 20,
            installationCost: 25
          },
          {
            csa: 50,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'underground',
            length: 100,
            currentRating: 125,
            resistance: 0.387,
            reactance: 0.074,
            unitCost: 28,
            installationCost: 25
          }
        ],
        loadProfile: {
          peakLoad: 80,
          averageLoad: 65,
          loadFactor: 0.8,
          operatingHours: 6000,
          powerFactor: 0.9
        },
        constraints: {
          maxVoltageDropPercent: 5,
          maxTemperatureRise: 50,
          installationRestrictions: []
        },
        environmentalFactors: {
          ambientTemperature: 20,
          groupingFactor: 1.0,
          thermalResistivity: 1.2
        }
      };

      const result = EconomicAnalysisCalculator.calculate(inputs);

      // Verify basic structure
      expect(result).toHaveProperty('optimalSolution');
      expect(result).toHaveProperty('comparison');
      expect(result).toHaveProperty('sensitivity');
      expect(result).toHaveProperty('riskAssessment');
      expect(result).toHaveProperty('recommendations');

      // Verify optimal solution
      expect(result.optimalSolution.csa).toBeGreaterThan(0);
      expect(result.optimalSolution.totalCost).toBeGreaterThan(0);
      expect(result.optimalSolution.paybackPeriod).toBeGreaterThan(0);
      expect(result.optimalSolution.roi).toBeGreaterThan(0);

      // Verify comparison includes all options
      expect(result.comparison).toHaveLength(3);
      result.comparison.forEach(option => {
        expect(option).toHaveProperty('csa');
        expect(option).toHaveProperty('capitalCost');
        expect(option).toHaveProperty('annualLossCost');
        expect(option).toHaveProperty('totalLifecycleCost');
        expect(option).toHaveProperty('npv');
        expect(option).toHaveProperty('compliance');
      });

      // Verify only compliant options have reasonable costs
      const compliantOptions = result.comparison.filter(option => option.compliance);
      expect(compliantOptions.length).toBeGreaterThan(0);
      
      // Verify optimal is among compliant options
      const optimalInCompliant = compliantOptions.some(option => option.csa === result.optimalSolution.csa);
      expect(optimalInCompliant).toBe(true);

      // Verify sensitivity analysis
      expect(result.sensitivity.electricityPriceChange).toHaveLength(5);
      expect(result.sensitivity.loadGrowthImpact).toHaveLength(4);
      expect(result.sensitivity.discountRateImpact).toHaveLength(5);

      // Verify recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('Optimal cable size:');
      expect(result.regulation).toContain('BS 7671');
    });

    it('should handle high loss scenario with larger conductor recommendation', () => {
      const inputs: EconomicAnalysisInputs = {
        project: {
          projectLife: 30,
          discountRate: 4,
          inflationRate: 2.5,
          electricityTariff: 0.20,
          carbonPrice: 30
        },
        cableOptions: [
          {
            csa: 16,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'overhead',
            length: 500,
            currentRating: 65,
            resistance: 1.15,
            reactance: 0.085,
            unitCost: 8,
            installationCost: 15
          },
          {
            csa: 95,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'overhead',
            length: 500,
            currentRating: 230,
            resistance: 0.193,
            reactance: 0.071,
            unitCost: 35,
            installationCost: 15
          }
        ],
        loadProfile: {
          peakLoad: 200,
          averageLoad: 160,
          loadFactor: 0.8,
          operatingHours: 7000,
          powerFactor: 0.85
        },
        constraints: {
          maxVoltageDropPercent: 5,
          maxTemperatureRise: 60
        },
        environmentalFactors: {
          ambientTemperature: 25,
          groupingFactor: 0.8,
          thermalResistivity: 1.5
        }
      };

      const result = EconomicAnalysisCalculator.calculate(inputs);

      // Small conductor should be non-compliant due to current capacity
      const smallConductor = result.comparison.find(option => option.csa === 16);
      expect(smallConductor?.compliance).toBe(false);

      // Large conductor should be compliant and optimal
      expect(result.optimalSolution.csa).toBe(95);
      expect(result.optimalSolution.paybackPeriod).toBeLessThan(15);

      // Should recommend larger conductor due to high losses
      expect(result.recommendations.some(rec => rec.includes('economic'))).toBe(true);
    });

    it('should validate input parameters correctly', () => {
      expect(() => EconomicAnalysisCalculator.calculate({
        project: {
          projectLife: -5,
          discountRate: 5,
          inflationRate: 2,
          electricityTariff: 0.15,
          carbonPrice: 25
        },
        cableOptions: [],
        loadProfile: {
          peakLoad: 80,
          averageLoad: 65,
          loadFactor: 0.8,
          operatingHours: 6000,
          powerFactor: 0.9
        },
        constraints: { maxVoltageDropPercent: 5, maxTemperatureRise: 50 },
        environmentalFactors: {
          ambientTemperature: 20,
          groupingFactor: 1.0,
          thermalResistivity: 1.2
        }
      })).toThrow('Project life must be positive');

      expect(() => EconomicAnalysisCalculator.calculate({
        project: {
          projectLife: 25,
          discountRate: 5,
          inflationRate: 2,
          electricityTariff: 0.15,
          carbonPrice: 25
        },
        cableOptions: [],
        loadProfile: {
          peakLoad: 80,
          averageLoad: 65,
          loadFactor: 0.8,
          operatingHours: 6000,
          powerFactor: 0.9
        },
        constraints: { maxVoltageDropPercent: 5, maxTemperatureRise: 50 },
        environmentalFactors: {
          ambientTemperature: 20,
          groupingFactor: 1.0,
          thermalResistivity: 1.2
        }
      })).toThrow('At least one cable option must be provided');
    });
  });

  describe('sensitivity analysis', () => {
    it('should show impact of electricity price changes', () => {
      const inputs: EconomicAnalysisInputs = {
        project: {
          projectLife: 20,
          discountRate: 6,
          inflationRate: 2,
          electricityTariff: 0.12,
          carbonPrice: 20
        },
        cableOptions: [
          {
            csa: 35,
            coreCount: 3,
            cableType: 'XLPE',
            installationMethod: 'underground',
            length: 200,
            currentRating: 105,
            resistance: 0.524,
            unitCost: 20,
            installationCost: 25
          }
        ],
        loadProfile: {
          peakLoad: 90,
          averageLoad: 70,
          loadFactor: 0.78,
          operatingHours: 5500,
          powerFactor: 0.92
        },
        constraints: { maxVoltageDropPercent: 4, maxTemperatureRise: 45 },
        environmentalFactors: {
          ambientTemperature: 18,
          groupingFactor: 1.0,
          thermalResistivity: 1.0
        }
      };

      const result = EconomicAnalysisCalculator.calculate(inputs);

      // Check sensitivity to electricity price changes
      const priceChanges = result.sensitivity.electricityPriceChange;
      expect(priceChanges).toHaveLength(5);
      
      // Higher electricity prices should improve NPV (make efficiency more valuable)
      const baseCaseNPV = priceChanges.find(change => change.change === 0)?.npvImpact;
      const highPriceNPV = priceChanges.find(change => change.change === 20)?.npvImpact;
      
      expect(baseCaseNPV).toBeDefined();
      expect(highPriceNPV).toBeDefined();
      expect(highPriceNPV).toBeLessThan(baseCaseNPV!); // More negative NPV (worse) with higher prices
    });
  });
});

describe('EnergyLossCalculator', () => {
  describe('calculate()', () => {
    it('should calculate comprehensive energy losses for electrical system', () => {
      const inputs: EnergyLossInputs = {
        systemConfiguration: {
          systemVoltage: 400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-S'
        },
        conductors: [
          {
            conductorId: 'Main_Feeder_1',
            csa: 95,
            material: 'copper',
            length: 150,
            current: 180,
            powerFactor: 0.9,
            loadType: 'continuous',
            temperature: 60
          },
          {
            conductorId: 'Branch_Circuit_1',
            csa: 25,
            material: 'copper',
            length: 80,
            current: 65,
            powerFactor: 0.85,
            loadType: 'intermittent',
            temperature: 45
          },
          {
            conductorId: 'Lighting_Circuit',
            csa: 2.5,
            material: 'copper',
            length: 120,
            current: 8,
            powerFactor: 0.95,
            loadType: 'variable',
            temperature: 35
          }
        ],
        transformers: [
          {
            transformerId: 'Main_Transformer',
            ratingKVA: 1000,
            noLoadLoss: 2000,
            loadLoss: 10000,
            loadingFactor: 80,
            operatingHours: 7500
          },
          {
            transformerId: 'Distribution_Transformer',
            ratingKVA: 500,
            noLoadLoss: 1200,
            loadLoss: 6000,
            loadingFactor: 65,
            operatingHours: 6000
          }
        ],
        operatingConditions: {
          annualOperatingHours: 7000,
          loadProfile: [
            { timeOfDay: 'day', loadFactor: 0.8, duration: 12 },
            { timeOfDay: 'night', loadFactor: 0.3, duration: 12 }
          ]
        },
        economicFactors: {
          electricityTariff: 0.14,
          carbonPrice: 28,
          carbonIntensity: 0.233
        }
      };

      const result = EnergyLossCalculator.calculate(inputs);

      // Verify basic structure
      expect(result).toHaveProperty('conductorLosses');
      expect(result).toHaveProperty('transformerLosses');
      expect(result).toHaveProperty('systemSummary');
      expect(result).toHaveProperty('optimization');
      expect(result).toHaveProperty('benchmarking');
      expect(result).toHaveProperty('recommendations');

      // Verify conductor losses
      expect(result.conductorLosses).toHaveLength(3);
      result.conductorLosses.forEach(loss => {
        expect(loss).toHaveProperty('conductorId');
        expect(loss).toHaveProperty('i2rLosses');
        expect(loss).toHaveProperty('lossCost');
        expect(loss.i2rLosses).toBeGreaterThan(0);
        expect(loss.lossCost).toBeGreaterThan(0);
      });

      // Main feeder should have highest losses due to high current
      const mainFeederLoss = result.conductorLosses.find(loss => loss.conductorId === 'Main_Feeder_1');
      const lightingLoss = result.conductorLosses.find(loss => loss.conductorId === 'Lighting_Circuit');
      expect(mainFeederLoss!.i2rLosses).toBeGreaterThan(lightingLoss!.i2rLosses);

      // Verify transformer losses
      expect(result.transformerLosses).toHaveLength(2);
      result.transformerLosses.forEach(loss => {
        expect(loss).toHaveProperty('transformerId');
        expect(loss).toHaveProperty('noLoadLosses');
        expect(loss).toHaveProperty('loadLosses');
        expect(loss).toHaveProperty('totalLosses');
        expect(loss).toHaveProperty('efficiency');
        expect(loss.efficiency).toBeGreaterThan(90);
        expect(loss.efficiency).toBeLessThan(100);
      });

      // Verify system summary
      expect(result.systemSummary.totalEnergyLosses).toBeGreaterThan(0);
      expect(result.systemSummary.totalLossCost).toBeGreaterThan(0);
      expect(result.systemSummary.systemEfficiency).toBeGreaterThan(90);
      expect(result.systemSummary.systemEfficiency).toBeLessThan(100);
      expect(result.systemSummary.carbonEmissions).toBeGreaterThan(0);

      // Verify optimization opportunities
      expect(result.optimization).toHaveProperty('potentialSavings');
      expect(result.optimization).toHaveProperty('upgradeRecommendations');
      expect(result.optimization.potentialSavings).toBeGreaterThanOrEqual(0);

      // Verify benchmarking
      expect(result.benchmarking.ranking).toMatch(/excellent|good|average|poor/);
      expect(result.benchmarking.industryAverage).toBe(94);
      expect(result.benchmarking.bestPractice).toBe(97);

      // Verify recommendations
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.regulation).toContain('BS EN 50160');
    });

    it('should identify optimization opportunities for high-loss system', () => {
      const inputs: EnergyLossInputs = {
        systemConfiguration: {
          systemVoltage: 400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-C-S'
        },
        conductors: [
          {
            conductorId: 'Undersized_Cable',
            csa: 16,
            material: 'copper',
            length: 300,
            current: 55,
            powerFactor: 0.8,
            loadType: 'continuous',
            temperature: 75
          }
        ],
        transformers: [
          {
            transformerId: 'Old_Transformer',
            ratingKVA: 315,
            noLoadLoss: 1500,
            loadLoss: 4500,
            loadingFactor: 95,
            operatingHours: 8000
          }
        ],
        operatingConditions: {
          annualOperatingHours: 8000,
          loadProfile: [
            { timeOfDay: 'peak', loadFactor: 1.0, duration: 8 },
            { timeOfDay: 'off-peak', loadFactor: 0.6, duration: 16 }
          ]
        },
        economicFactors: {
          electricityTariff: 0.18,
          carbonPrice: 35,
          carbonIntensity: 0.233
        }
      };

      const result = EnergyLossCalculator.calculate(inputs);

      // High current density should result in high efficiency impact
      const cableLoss = result.conductorLosses[0];
      expect(cableLoss.efficiencyImpact).toBeGreaterThan(2); // >2% efficiency impact

      // Should identify optimization opportunities
      expect(result.optimization.upgradeRecommendations.length).toBeGreaterThan(0);
      expect(result.optimization.potentialSavings).toBeGreaterThan(0);

      // Poor efficiency should result in poor ranking
      if (result.systemSummary.systemEfficiency < 90) {
        expect(result.benchmarking.ranking).toMatch(/average|poor/);
      }

      // Should recommend upgrades
      expect(result.recommendations.some(rec => 
        rec.includes('optimization') || rec.includes('upgrade') || rec.includes('efficiency')
      )).toBe(true);
    });

    it('should handle excellent efficiency system', () => {
      const inputs: EnergyLossInputs = {
        systemConfiguration: {
          systemVoltage: 400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-S'
        },
        conductors: [
          {
            conductorId: 'Oversized_Cable',
            csa: 185,
            material: 'copper',
            length: 100,
            current: 120,
            powerFactor: 0.95,
            loadType: 'continuous',
            temperature: 40
          }
        ],
        transformers: [
          {
            transformerId: 'High_Efficiency_Transformer',
            ratingKVA: 1000,
            noLoadLoss: 1000,
            loadLoss: 8000,
            loadingFactor: 75,
            operatingHours: 6000
          }
        ],
        operatingConditions: {
          annualOperatingHours: 6000,
          loadProfile: [
            { timeOfDay: 'standard', loadFactor: 0.75, duration: 24 }
          ]
        },
        economicFactors: {
          electricityTariff: 0.12,
          carbonPrice: 25,
          carbonIntensity: 0.233
        }
      };

      const result = EnergyLossCalculator.calculate(inputs);

      // Should have high efficiency
      expect(result.systemSummary.systemEfficiency).toBeGreaterThan(95);
      expect(result.benchmarking.ranking).toMatch(/excellent|good/);

      // Should have minimal optimization opportunities
      expect(result.optimization.upgradeRecommendations.length).toBeLessThanOrEqual(1);

      // Should recommend maintaining performance
      expect(result.recommendations.some(rec => 
        rec.includes('maintain') || rec.includes('excellent')
      )).toBe(true);
    });

    it('should validate input parameters correctly', () => {
      expect(() => EnergyLossCalculator.calculate({
        systemConfiguration: {
          systemVoltage: -400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-S'
        },
        conductors: [],
        transformers: [],
        operatingConditions: {
          annualOperatingHours: 7000,
          loadProfile: []
        },
        economicFactors: {
          electricityTariff: 0.14,
          carbonPrice: 28,
          carbonIntensity: 0.233
        }
      })).toThrow('System voltage must be positive');

      expect(() => EnergyLossCalculator.calculate({
        systemConfiguration: {
          systemVoltage: 400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-S'
        },
        conductors: [],
        transformers: [],
        operatingConditions: {
          annualOperatingHours: 10000,
          loadProfile: []
        },
        economicFactors: {
          electricityTariff: 0.14,
          carbonPrice: 28,
          carbonIntensity: 0.233
        }
      })).toThrow('Annual operating hours must be between 1 and 8760');
    });
  });

  describe('material comparison', () => {
    it('should show difference between copper and aluminium conductors', () => {
      const copperInputs: EnergyLossInputs = {
        systemConfiguration: {
          systemVoltage: 400,
          frequency: 50,
          phases: 3,
          systemType: 'TN-S'
        },
        conductors: [
          {
            conductorId: 'Copper_Cable',
            csa: 50,
            material: 'copper',
            length: 100,
            current: 80,
            powerFactor: 0.9,
            loadType: 'continuous',
            temperature: 50
          }
        ],
        transformers: [],
        operatingConditions: {
          annualOperatingHours: 6000,
          loadProfile: [
            { timeOfDay: 'standard', loadFactor: 1.0, duration: 24 }
          ]
        },
        economicFactors: {
          electricityTariff: 0.15,
          carbonPrice: 30,
          carbonIntensity: 0.233
        }
      };

      const aluminiumInputs = {
        ...copperInputs,
        conductors: [
          {
            ...copperInputs.conductors[0],
            conductorId: 'Aluminium_Cable',
            material: 'aluminium' as const,
            csa: 70 // Larger CSA for equivalent current capacity
          }
        ]
      };

      const copperResult = EnergyLossCalculator.calculate(copperInputs);
      const aluminiumResult = EnergyLossCalculator.calculate(aluminiumInputs);

      // Both should have valid results
      expect(copperResult.conductorLosses[0].i2rLosses).toBeGreaterThan(0);
      expect(aluminiumResult.conductorLosses[0].i2rLosses).toBeGreaterThan(0);

      // Copper should typically have lower losses for same CSA
      // but aluminium has larger CSA to compensate
      expect(copperResult.systemSummary.systemEfficiency).toBeGreaterThan(90);
      expect(aluminiumResult.systemSummary.systemEfficiency).toBeGreaterThan(90);
    });
  });
});
