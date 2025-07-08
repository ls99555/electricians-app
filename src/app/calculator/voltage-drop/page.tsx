'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info, Zap } from 'lucide-react';
import { VoltageDropCalculator, type VoltageDropResult } from '@/lib/calculations';
import styles from './voltage-drop.module.scss';

interface VoltageDropInputs {
  current?: number;
  length?: number;
  cableSize?: number;
  phases?: 1 | 3;
  powerFactor?: number;
  cableType?: 'copper' | 'aluminium';
  temperature?: number;
  circuitType?: 'lighting' | 'power' | 'motor';
}

export default function VoltageDropPage() {
  const [inputs, setInputs] = useState<VoltageDropInputs>({
    phases: 1,
    circuitType: 'power',
    powerFactor: 0.9,
    cableType: 'copper',
    temperature: 70
  });
  const [results, setResults] = useState<VoltageDropResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof VoltageDropInputs, value: string | number) => {
    const numValue = typeof value === 'string' && value === '' ? undefined : 
                     typeof value === 'string' ? parseFloat(value) : value;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
    setError('');
  };

  const calculate = () => {
    try {
      // Validate required inputs
      if (!inputs.current || !inputs.length || !inputs.cableSize) {
        setError('Please enter current, cable length, and cable size.');
        return;
      }

      if (!inputs.phases || !inputs.circuitType || !inputs.cableType || !inputs.temperature) {
        setError('Please select all required parameters.');
        return;
      }

      const calculated = VoltageDropCalculator.calculate({
        current: inputs.current,
        length: inputs.length,
        cableSize: inputs.cableSize,
        phases: inputs.phases,
        powerFactor: inputs.powerFactor || 0.9,
        cableType: inputs.cableType,
        temperature: inputs.temperature,
        circuitType: inputs.circuitType
      });
      
      setResults(calculated);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error occurred');
      setResults(null);
    }
  };

  const reset = () => {
    setInputs({
      phases: 1,
      circuitType: 'power',
      powerFactor: 0.9,
      cableType: 'copper',
      temperature: 70
    });
    setResults(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Zap className={styles.icon} />
            Voltage Drop Calculator
          </h1>
          <p className={styles.subtitle}>
            Calculate voltage drop and verify compliance with BS 7671 limits
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calculatorGrid}>
          <div className={styles.inputSection}>
            <h2>Circuit Parameters</h2>
            <p className={styles.instruction}>
              Enter the circuit details to calculate voltage drop
            </p>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="current">Design Current</label>
                <input
                  id="current"
                  type="number"
                  step="0.1"
                  placeholder="Enter design current"
                  value={inputs.current || ''}
                  onChange={(e) => handleInputChange('current', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>A</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="length">Cable Length</label>
                <input
                  id="length"
                  type="number"
                  step="0.1"
                  placeholder="Enter cable length"
                  value={inputs.length || ''}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>m</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="cableSize">Cable Cross-Sectional Area</label>
                <input
                  id="cableSize"
                  type="number"
                  step="0.1"
                  placeholder="Enter cable CSA"
                  value={inputs.cableSize || ''}
                  onChange={(e) => handleInputChange('cableSize', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>mm²</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="powerFactor">Power Factor</label>
                <input
                  id="powerFactor"
                  type="number"
                  step="0.01"
                  min="0.8"
                  max="1"
                  placeholder="Enter power factor"
                  value={inputs.powerFactor || ''}
                  onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>cos φ</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="temperature">Conductor Temperature</label>
                <input
                  id="temperature"
                  type="number"
                  step="1"
                  placeholder="Enter conductor temperature"
                  value={inputs.temperature || ''}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>°C</span>
              </div>

              <div className={styles.selectGroup}>
                <label htmlFor="phases">Phase Configuration</label>
                <select
                  id="phases"
                  value={inputs.phases || 1}
                  onChange={(e) => handleInputChange('phases', Number(e.target.value) as 1 | 3)}
                  className={styles.select}
                >
                  <option value={1}>Single Phase</option>
                  <option value={3}>Three Phase</option>
                </select>
              </div>

              <div className={styles.selectGroup}>
                <label htmlFor="cableType">Cable Material</label>
                <select
                  id="cableType"
                  value={inputs.cableType || 'copper'}
                  onChange={(e) => handleInputChange('cableType', e.target.value as 'copper' | 'aluminium')}
                  className={styles.select}
                >
                  <option value="copper">Copper</option>
                  <option value="aluminium">Aluminium</option>
                </select>
              </div>

              <div className={styles.selectGroup}>
                <label htmlFor="circuitType">Circuit Type</label>
                <select
                  id="circuitType"
                  value={inputs.circuitType || 'power'}
                  onChange={(e) => handleInputChange('circuitType', e.target.value as 'lighting' | 'power' | 'motor')}
                  className={styles.select}
                >
                  <option value="lighting">Lighting Circuit</option>
                  <option value="power">Power Circuit</option>
                  <option value="motor">Motor Circuit</option>
                </select>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={calculate} className={styles.calculateButton}>
                <Calculator size={20} />
                Calculate
              </button>
              <button onClick={reset} className={styles.resetButton}>
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            {error && (
              <div className={styles.error}>
                <Info size={20} />
                {error}
              </div>
            )}
          </div>

          <div className={styles.resultSection}>
            <h2>Calculation Results</h2>
            {results ? (
              <div className={styles.results}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Voltage Drop:</span>
                  <span className={styles.resultValue}>{results.voltageDrop.toFixed(3)} V</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Voltage Drop %:</span>
                  <span className={styles.resultValue}>{results.voltageDropPercentage.toFixed(2)}%</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Voltage at Load:</span>
                  <span className={styles.resultValue}>{results.voltageAtLoad.toFixed(2)} V</span>
                </div>
                <div className={`${styles.resultItem} ${styles.compliance}`}>
                  <span className={styles.resultLabel}>BS 7671 Compliance:</span>
                  <span className={`${styles.resultValue} ${results.isWithinLimits ? styles.compliant : styles.nonCompliant}`}>
                    {results.isWithinLimits ? '✓ COMPLIANT' : '✗ EXCEEDS LIMITS'}
                  </span>
                </div>
                <div className={styles.regulationNote}>
                  <Info className={styles.regulationIcon} />
                  <span>{results.regulation}</span>
                </div>
              </div>
            ) : (
              <p className={styles.noResults}>
                Enter circuit parameters and click Calculate to see results
              </p>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>UK Standards Reference</h2>
          <div className={styles.standardsGrid}>
            <div className={styles.standard}>
              <h3>BS 7671:2018+A2:2022</h3>
              <p><strong>Section 525:</strong> Voltage drop in consumers&apos; installations</p>
              <ul>
                <li>Lighting circuits: 3% maximum voltage drop</li>
                <li>Power circuits: 5% maximum voltage drop</li>
                <li>Motor circuits: 5% maximum voltage drop</li>
              </ul>
            </div>
            <div className={styles.standard}>
              <h3>Calculation Method</h3>
              <p><strong>Single Phase:</strong> Vd = 2 × I × L × (R cos φ + X sin φ)</p>
              <p><strong>Three Phase:</strong> Vd = √3 × I × L × (R cos φ + X sin φ)</p>
              <p>Where: I = current, L = length, R = resistance, X = reactance</p>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} />
            <div>
              <p><strong>Professional Guidance Required:</strong> These calculations are for guidance only and reference BS 7671:2018+A2:2022. All electrical design and installation work must be carried out by qualified electricians and verified through proper testing and inspection.</p>
              <p><strong>Regulation Compliance:</strong> Voltage drop calculations must consider the complete circuit path from origin to load. Additional factors such as ambient temperature, installation method, and cable grouping may affect the final design.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
