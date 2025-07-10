'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info, Lightbulb, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IlluminanceCalculator, type IlluminanceResult } from '@/lib/calculations';
import styles from './illuminance.module.scss';

interface IlluminanceInputs {
  roomLength?: number;
  roomWidth?: number;
  roomHeight?: number;
  workingPlaneHeight?: number;
  requiredLux?: number;
  luminaireOutput?: number;
  roomReflectances?: {
    ceiling: number;
    walls: number;
    floor: number;
  };
  maintenanceFactor?: number;
  utilisationFactor?: number;
}

export default function IlluminancePage() {
  const [inputs, setInputs] = useState<IlluminanceInputs>({
    workingPlaneHeight: 0.85,
    luminaireOutput: 3000,
    roomReflectances: {
      ceiling: 0.7,
      walls: 0.5,
      floor: 0.2
    },
    maintenanceFactor: 0.8,
    utilisationFactor: 0.6
  });
  const [results, setResults] = useState<IlluminanceResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof IlluminanceInputs, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
    setError('');
  };

  const handleReflectanceChange = (surface: 'ceiling' | 'walls' | 'floor', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setInputs(prev => ({
      ...prev,
      roomReflectances: {
        ...prev.roomReflectances!,
        [surface]: numValue
      }
    }));
    setError('');
  };

  const calculate = () => {
    try {
      if (!inputs.roomLength || !inputs.roomWidth || !inputs.roomHeight) {
        setError('Please enter room dimensions.');
        return;
      }

      if (!inputs.requiredLux) {
        setError('Please enter required illuminance level.');
        return;
      }

      if (!inputs.luminaireOutput) {
        setError('Please enter luminaire output.');
        return;
      }

      const calculated = IlluminanceCalculator.calculate({
        roomLength: inputs.roomLength,
        roomWidth: inputs.roomWidth,
        roomHeight: inputs.roomHeight,
        workingPlaneHeight: inputs.workingPlaneHeight || 0.85,
        requiredLux: inputs.requiredLux,
        luminaireOutput: inputs.luminaireOutput,
        roomReflectances: inputs.roomReflectances || {
          ceiling: 0.7,
          walls: 0.5,
          floor: 0.2
        },
        maintenanceFactor: inputs.maintenanceFactor || 0.8,
        utilisationFactor: inputs.utilisationFactor
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
      workingPlaneHeight: 0.85,
      luminaireOutput: 3000,
      roomReflectances: {
        ceiling: 0.7,
        walls: 0.5,
        floor: 0.2
      },
      maintenanceFactor: 0.8,
      utilisationFactor: 0.6
    });
    setResults(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/calculators" className={styles.backButton}>
            <ArrowLeft size={20} />
            Back to Calculators
          </Link>
          <h1 className={styles.title}>
            <Lightbulb className={styles.icon} />
            Illuminance Calculator
          </h1>
          <p className={styles.subtitle}>
            Calculate required lumens and luminaires for proper lighting design per BS EN 12464-1
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calculatorGrid}>
          <div className={styles.inputSection}>
            <h2>Room & Lighting Parameters</h2>
            <p className={styles.instruction}>
              Enter room dimensions and lighting requirements to calculate illuminance
            </p>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="roomLength">Room Length</label>
                <input
                  id="roomLength"
                  type="number"
                  step="0.1"
                  placeholder="Enter room length"
                  value={inputs.roomLength || ''}
                  onChange={(e) => handleInputChange('roomLength', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>m</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="roomWidth">Room Width</label>
                <input
                  id="roomWidth"
                  type="number"
                  step="0.1"
                  placeholder="Enter room width"
                  value={inputs.roomWidth || ''}
                  onChange={(e) => handleInputChange('roomWidth', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>m</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="roomHeight">Room Height</label>
                <input
                  id="roomHeight"
                  type="number"
                  step="0.1"
                  placeholder="Enter room height"
                  value={inputs.roomHeight || ''}
                  onChange={(e) => handleInputChange('roomHeight', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>m</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="workingPlaneHeight">Working Plane Height</label>
                <input
                  id="workingPlaneHeight"
                  type="number"
                  step="0.01"
                  placeholder="Enter working plane height"
                  value={inputs.workingPlaneHeight || ''}
                  onChange={(e) => handleInputChange('workingPlaneHeight', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>m</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="requiredLux">Required Illuminance</label>
                <input
                  id="requiredLux"
                  type="number"
                  step="1"
                  placeholder="Enter required illuminance"
                  value={inputs.requiredLux || ''}
                  onChange={(e) => handleInputChange('requiredLux', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>lux</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="luminaireOutput">Luminaire Output</label>
                <input
                  id="luminaireOutput"
                  type="number"
                  step="100"
                  placeholder="Enter luminaire output"
                  value={inputs.luminaireOutput || ''}
                  onChange={(e) => handleInputChange('luminaireOutput', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>lm</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="maintenanceFactor">Maintenance Factor</label>
                <input
                  id="maintenanceFactor"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  placeholder="Enter maintenance factor"
                  value={inputs.maintenanceFactor || ''}
                  onChange={(e) => handleInputChange('maintenanceFactor', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>-</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="utilisationFactor">Utilisation Factor (Optional)</label>
                <input
                  id="utilisationFactor"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  placeholder="Enter utilisation factor"
                  value={inputs.utilisationFactor || ''}
                  onChange={(e) => handleInputChange('utilisationFactor', e.target.value)}
                  className={styles.input}
                />
                <span className={styles.unit}>-</span>
              </div>

              <div className={styles.reflectanceSection}>
                <h3>Room Reflectances</h3>
                <div className={styles.reflectanceGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="ceilingReflectance">Ceiling</label>
                    <input
                      id="ceilingReflectance"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.7"
                      value={inputs.roomReflectances?.ceiling || ''}
                      onChange={(e) => handleReflectanceChange('ceiling', e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>-</span>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="wallsReflectance">Walls</label>
                    <input
                      id="wallsReflectance"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.5"
                      value={inputs.roomReflectances?.walls || ''}
                      onChange={(e) => handleReflectanceChange('walls', e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>-</span>
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="floorReflectance">Floor</label>
                    <input
                      id="floorReflectance"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.2"
                      value={inputs.roomReflectances?.floor || ''}
                      onChange={(e) => handleReflectanceChange('floor', e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>-</span>
                  </div>
                </div>
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

          <div className={styles.resultsSection}>
            <h2>Illuminance Results</h2>
            {results ? (
              <div className={styles.results}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Required Lumens:</span>
                  <span className={styles.resultValue}>{results.requiredLumens.toFixed(0)} lm</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Number of Luminaires:</span>
                  <span className={styles.resultValue}>{results.numberOfLuminaires}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Luminaire Spacing:</span>
                  <span className={styles.resultValue}>{results.luminaireSpacing.toFixed(2)} m</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Uniformity Ratio:</span>
                  <span className={styles.resultValue}>{results.uniformityRatio.toFixed(2)}</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Average Illuminance:</span>
                  <span className={styles.resultValue}>{results.averageIlluminance.toFixed(0)} lux</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Energy Consumption:</span>
                  <span className={styles.resultValue}>{results.energyConsumption.toFixed(1)} W</span>
                </div>
                
                <div className={styles.costAnalysis}>
                  <h3>Cost Analysis:</h3>
                  <div className={styles.costItem}>
                    <span>Installation Cost:</span>
                    <span>£{results.costAnalysis.installationCost.toFixed(2)}</span>
                  </div>
                  <div className={styles.costItem}>
                    <span>Annual Energy Cost:</span>
                    <span>£{results.costAnalysis.annualEnergyCost.toFixed(2)}</span>
                  </div>
                  <div className={styles.costItem}>
                    <span>Maintenance Cost:</span>
                    <span>£{results.costAnalysis.maintenanceCost.toFixed(2)}</span>
                  </div>
                </div>
                
                {results.recommendations.length > 0 && (
                  <div className={styles.recommendations}>
                    <h3>Recommendations:</h3>
                    <ul>
                      {results.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.noResults}>
                Enter room details and click Calculate to see results
              </p>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>UK Lighting Standards Reference</h2>
          <div className={styles.standardsGrid}>
            <div className={styles.standard}>
              <h3>BS EN 12464-1:2021</h3>
              <p><strong>Light and lighting:</strong> Lighting of work places</p>
              <ul>
                <li>Indoor work places lighting requirements</li>
                <li>Maintained illuminance levels</li>
                <li>Uniformity and glare limitations</li>
                <li>Color rendering requirements</li>
              </ul>
            </div>
            <div className={styles.standard}>
              <h3>Common Illuminance Levels</h3>
              <p><strong>Typical Requirements:</strong></p>
              <ul>
                <li>General office work: 500 lux</li>
                <li>Technical drawing: 750 lux</li>
                <li>Precision work: 1000 lux</li>
                <li>Circulation areas: 100-200 lux</li>
                <li>Stairways: 150 lux</li>
                <li>Emergency lighting: 1 lux minimum</li>
              </ul>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} />
            <div>
              <p><strong>Professional Design Required:</strong> These calculations are for guidance only and reference BS EN 12464-1:2021. All lighting design must be verified by qualified lighting designers and comply with Building Regulations Part L.</p>
              <p><strong>Installation Compliance:</strong> Lighting installations must consider emergency lighting requirements, energy efficiency, and visual comfort. Consult manufacturer specifications and relevant British Standards for specific applications.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
