'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info } from 'lucide-react';
import { OhmLawCalculator, type OhmLawResult } from '@/lib/calculations';
import styles from './ohms-law.module.scss';

export default function OhmsLawPage() {
  const [inputs, setInputs] = useState<Partial<OhmLawResult>>({});
  const [results, setResults] = useState<OhmLawResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof OhmLawResult, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
    setError('');
  };

  const calculate = () => {
    try {
      // Need at least 2 values to calculate
      const definedValues = Object.values(inputs).filter(v => v !== undefined).length;
      if (definedValues < 2) {
        setError('Please enter at least 2 values to calculate the remaining values.');
        return;
      }

      const calculated = OhmLawCalculator.calculate(inputs);
      setResults(calculated);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error occurred');
      setResults(null);
    }
  };

  const reset = () => {
    setInputs({});
    setResults(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Calculator className={styles.icon} />
            Ohm's Law Calculator
          </h1>
          <p className={styles.subtitle}>
            Calculate voltage, current, resistance, or power using Ohm's Law (BS 7671 compliant)
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calculatorGrid}>
          <div className={styles.inputSection}>
            <h2>Enter Known Values</h2>
            <p className={styles.instruction}>
              Enter any 2 known values to calculate the remaining values
            </p>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="voltage">Voltage (V)</label>
                <input
                  id="voltage"
                  type="number"
                  step="0.01"
                  placeholder="Enter voltage in volts"
                  value={inputs.voltage || ''}
                  onChange={(e) => handleInputChange('voltage', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>V</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="current">Current (I)</label>
                <input
                  id="current"
                  type="number"
                  step="0.01"
                  placeholder="Enter current in amps"
                  value={inputs.current || ''}
                  onChange={(e) => handleInputChange('current', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>A</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="resistance">Resistance (R)</label>
                <input
                  id="resistance"
                  type="number"
                  step="0.01"
                  placeholder="Enter resistance in ohms"
                  value={inputs.resistance || ''}
                  onChange={(e) => handleInputChange('resistance', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>Ω</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="power">Power (P)</label>
                <input
                  id="power"
                  type="number"
                  step="0.01"
                  placeholder="Enter power in watts"
                  value={inputs.power || ''}
                  onChange={(e) => handleInputChange('power', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>W</span>
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
            <h2>Results</h2>
            {results ? (
              <div className={styles.results}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Voltage:</span>
                  <span className={styles.resultValue}>{results.voltage?.toFixed(3) || 'N/A'} V</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Current:</span>
                  <span className={styles.resultValue}>{results.current?.toFixed(3) || 'N/A'} A</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Resistance:</span>
                  <span className={styles.resultValue}>{results.resistance?.toFixed(3) || 'N/A'} Ω</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Power:</span>
                  <span className={styles.resultValue}>{results.power?.toFixed(3) || 'N/A'} W</span>
                </div>
              </div>
            ) : (
              <p className={styles.noResults}>
                Enter values and click Calculate to see results
              </p>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>UK Electrical Standards Reference</h2>
          <div className={styles.standardsGrid}>
            <div className={styles.standard}>
              <h3>BS 7671:2018+A2:2022</h3>
              <p>Requirements for Electrical Installations (18th Edition)</p>
              <p>Fundamental electrical safety requirements</p>
            </div>
            <div className={styles.standard}>
              <h3>UK Standard Voltages</h3>
              <p>Single-phase: 230V ±10% (BS EN 50160)</p>
              <p>Three-phase: 400V ±10% (BS EN 50160)</p>
            </div>
            <div className={styles.standard}>
              <h3>Building Regulations Part P</h3>
              <p>Electrical Safety in dwellings</p>
              <p>Competent person requirements</p>
            </div>
            <div className={styles.standard}>
              <h3>IET Guidance Notes</h3>
              <p>Practical application of BS 7671</p>
              <p>Industry best practices</p>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>Ohm's Law Formulas</h2>
          <div className={styles.formulaGrid}>
            <div className={styles.formula}>
              <h3>Voltage</h3>
              <p>V = I × R</p>
              <p>V = P ÷ I</p>
              <p>V = √(P × R)</p>
            </div>
            <div className={styles.formula}>
              <h3>Current</h3>
              <p>I = V ÷ R</p>
              <p>I = P ÷ V</p>
              <p>I = √(P ÷ R)</p>
            </div>
            <div className={styles.formula}>
              <h3>Resistance</h3>
              <p>R = V ÷ I</p>
              <p>R = V² ÷ P</p>
              <p>R = P ÷ I²</p>
            </div>
            <div className={styles.formula}>
              <h3>Power</h3>
              <p>P = V × I</p>
              <p>P = I² × R</p>
              <p>P = V² ÷ R</p>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} />
            <div>
              <p><strong>UK Electrical Regulations Compliance:</strong></p>
              <ul>
                <li>These calculations reference BS 7671:2018+A2:2022 (18th Edition) electrical principles</li>
                <li>All electrical work must be carried out by competent persons per Building Regulations Part P</li>
                <li>Calculations must be verified by qualified electrical engineers</li>
                <li>Consider voltage drop, cable sizing, and protection requirements for final installations</li>
                <li>Standard UK voltages: 230V single-phase, 400V three-phase (BS EN 50160)</li>
                <li>Professional indemnity insurance recommended for all electrical work</li>
              </ul>
              <p><strong>Safety Warning:</strong> These calculations are for guidance only. Electrical installations must comply with current UK building regulations and be certified by qualified electricians.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
