'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info } from 'lucide-react';
import { OhmLawCalculator, type OhmLawResult } from '@/lib/calculations/electrical';
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
            Calculate voltage, current, resistance, or power using Ohm's Law
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
              <p><strong>Disclaimer:</strong> These calculations are for guidance only and reference electrical principles. All electrical work must be carried out by qualified electricians in accordance with current UK regulations (BS 7671).</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
