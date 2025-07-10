'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info, Cable } from 'lucide-react';
import { CableSizingCalculator, CableDeratingCalculator, type CableSizingResult, type CableDeratingResult } from '@/lib/calculations';
import styles from './cable-sizing.module.scss';

interface CableSizingInputs {
  designCurrent?: number;
  length?: number;
  installationMethod?: string;
  phases?: 1 | 3;
  powerFactor?: number;
  groupingFactor?: number;
  ambientTempFactor?: number;
  thermalInsulationFactor?: number;
  voltageDropLimit?: number;
}

interface CableDeratingInputs {
  installationMethod?: string;
  ambientTemperature?: number;
  numberOfCircuits?: number;
  thermalInsulationLength?: number;
  totalLength?: number;
  isBuried?: boolean;
  soilThermalResistivity?: number;
  originalRating?: number;
}

export default function CableSizingPage() {
  const [activeTab, setActiveTab] = useState<'sizing' | 'derating'>('sizing');
  
  // Cable sizing state
  const [sizingInputs, setSizingInputs] = useState<CableSizingInputs>({
    phases: 1,
    powerFactor: 0.9,
    groupingFactor: 1.0,
    ambientTempFactor: 1.0,
    thermalInsulationFactor: 1.0,
    voltageDropLimit: 5.0,
    installationMethod: 'A'
  });
  const [sizingResults, setSizingResults] = useState<CableSizingResult | null>(null);
  const [sizingError, setSizingError] = useState<string>('');

  // Cable derating state
  const [deratingInputs, setDeratingInputs] = useState<CableDeratingInputs>({
    installationMethod: 'A',
    ambientTemperature: 30,
    numberOfCircuits: 1,
    thermalInsulationLength: 0,
    isBuried: false,
    soilThermalResistivity: 2.5
  });
  const [deratingResults, setDeratingResults] = useState<CableDeratingResult | null>(null);
  const [deratingError, setDeratingError] = useState<string>('');

  const handleSizingInputChange = (field: keyof CableSizingInputs, value: string | number) => {
    const numValue = typeof value === 'string' && value === '' ? undefined : 
                     typeof value === 'string' ? parseFloat(value) : value;
    setSizingInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
    setSizingError('');
  };

  const handleDeratingInputChange = (field: keyof CableDeratingInputs, value: string | number | boolean) => {
    const processedValue = typeof value === 'string' && value === '' ? undefined :
                          typeof value === 'string' && field !== 'installationMethod' ? parseFloat(value) : value;
    setDeratingInputs(prev => ({
      ...prev,
      [field]: processedValue
    }));
    setDeratingError('');
  };

  const calculateSizing = () => {
    try {
      if (!sizingInputs.designCurrent || !sizingInputs.length) {
        setSizingError('Please enter design current and cable length.');
        return;
      }

      if (!sizingInputs.installationMethod || !sizingInputs.phases) {
        setSizingError('Please select installation method and phase configuration.');
        return;
      }

      const calculated = CableSizingCalculator.calculate({
        designCurrent: sizingInputs.designCurrent,
        length: sizingInputs.length,
        installationMethod: sizingInputs.installationMethod,
        phases: sizingInputs.phases,
        powerFactor: sizingInputs.powerFactor || 0.9,
        groupingFactor: sizingInputs.groupingFactor || 1.0,
        ambientTempFactor: sizingInputs.ambientTempFactor || 1.0,
        thermalInsulationFactor: sizingInputs.thermalInsulationFactor || 1.0,
        voltageDropLimit: sizingInputs.voltageDropLimit || 5.0
      });
      
      setSizingResults(calculated);
      setSizingError('');
    } catch (err) {
      setSizingError(err instanceof Error ? err.message : 'Calculation error occurred');
      setSizingResults(null);
    }
  };

  const calculateDerating = () => {
    try {
      if (!deratingInputs.originalRating || !deratingInputs.totalLength) {
        setDeratingError('Please enter original cable rating and total length.');
        return;
      }

      if (!deratingInputs.installationMethod || deratingInputs.ambientTemperature === undefined) {
        setDeratingError('Please select installation method and enter ambient temperature.');
        return;
      }

      const calculated = CableDeratingCalculator.calculate({
        installationMethod: deratingInputs.installationMethod,
        ambientTemperature: deratingInputs.ambientTemperature,
        numberOfCircuits: deratingInputs.numberOfCircuits || 1,
        thermalInsulationLength: deratingInputs.thermalInsulationLength || 0,
        totalLength: deratingInputs.totalLength,
        isBuried: deratingInputs.isBuried || false,
        soilThermalResistivity: deratingInputs.soilThermalResistivity || 2.5,
        originalRating: deratingInputs.originalRating
      });
      
      setDeratingResults(calculated);
      setDeratingError('');
    } catch (err) {
      setDeratingError(err instanceof Error ? err.message : 'Calculation error occurred');
      setDeratingResults(null);
    }
  };

  const resetSizing = () => {
    setSizingInputs({
      phases: 1,
      powerFactor: 0.9,
      groupingFactor: 1.0,
      ambientTempFactor: 1.0,
      thermalInsulationFactor: 1.0,
      voltageDropLimit: 5.0,
      installationMethod: 'A'
    });
    setSizingResults(null);
    setSizingError('');
  };

  const resetDerating = () => {
    setDeratingInputs({
      installationMethod: 'A',
      ambientTemperature: 30,
      numberOfCircuits: 1,
      thermalInsulationLength: 0,
      isBuried: false,
      soilThermalResistivity: 2.5
    });
    setDeratingResults(null);
    setDeratingError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Cable className={styles.icon} />
            Cable Sizing & Derating
          </h1>
          <p className={styles.subtitle}>
            Calculate cable sizes and derating factors per BS 7671 requirements
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'sizing' ? styles.active : ''}`}
              onClick={() => setActiveTab('sizing')}
            >
              Cable Sizing
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'derating' ? styles.active : ''}`}
              onClick={() => setActiveTab('derating')}
            >
              Derating Factors
            </button>
          </div>
        </div>

        {activeTab === 'sizing' && (
          <div className={styles.calculatorGrid}>
            <div className={styles.inputSection}>
              <h2>Cable Sizing Parameters</h2>
              <p className={styles.instruction}>
                Enter circuit parameters to calculate required cable size
              </p>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="designCurrent">Design Current</label>
                  <input
                    id="designCurrent"
                    type="number"
                    step="0.1"
                    placeholder="Enter design current"
                    value={sizingInputs.designCurrent || ''}
                    onChange={(e) => handleSizingInputChange('designCurrent', e.target.value)}
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
                    value={sizingInputs.length || ''}
                    onChange={(e) => handleSizingInputChange('length', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>m</span>
                </div>

                <div className={styles.selectGroup}>
                  <label htmlFor="installationMethod">Installation Method</label>
                  <select
                    id="installationMethod"
                    value={sizingInputs.installationMethod || 'A'}
                    onChange={(e) => handleSizingInputChange('installationMethod', e.target.value)}
                    className={styles.select}
                  >
                    <option value="A">Method A - Enclosed in conduit in thermally insulated wall</option>
                    <option value="B">Method B - Enclosed in trunking in thermally insulated wall</option>
                    <option value="C">Method C - Clipped direct</option>
                    <option value="D">Method D - In conduit in masonry wall</option>
                    <option value="E">Method E - In free air or on a perforated tray</option>
                    <option value="F">Method F - Underground cables</option>
                  </select>
                </div>

                <div className={styles.selectGroup}>
                  <label htmlFor="phases">Phase Configuration</label>
                  <select
                    id="phases"
                    value={sizingInputs.phases || 1}
                    onChange={(e) => handleSizingInputChange('phases', Number(e.target.value) as 1 | 3)}
                    className={styles.select}
                  >
                    <option value={1}>Single Phase</option>
                    <option value={3}>Three Phase</option>
                  </select>
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
                    value={sizingInputs.powerFactor || ''}
                    onChange={(e) => handleSizingInputChange('powerFactor', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>cos φ</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="voltageDropLimit">Voltage Drop Limit</label>
                  <input
                    id="voltageDropLimit"
                    type="number"
                    step="0.1"
                    placeholder="Enter voltage drop limit"
                    value={sizingInputs.voltageDropLimit || ''}
                    onChange={(e) => handleSizingInputChange('voltageDropLimit', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>%</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="groupingFactor">Grouping Factor</label>
                  <input
                    id="groupingFactor"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    placeholder="Enter grouping factor"
                    value={sizingInputs.groupingFactor || ''}
                    onChange={(e) => handleSizingInputChange('groupingFactor', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>-</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="ambientTempFactor">Ambient Temp Factor</label>
                  <input
                    id="ambientTempFactor"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1.2"
                    placeholder="Enter ambient temp factor"
                    value={sizingInputs.ambientTempFactor || ''}
                    onChange={(e) => handleSizingInputChange('ambientTempFactor', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>-</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="thermalInsulationFactor">Thermal Insulation Factor</label>
                  <input
                    id="thermalInsulationFactor"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    placeholder="Enter thermal insulation factor"
                    value={sizingInputs.thermalInsulationFactor || ''}
                    onChange={(e) => handleSizingInputChange('thermalInsulationFactor', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>-</span>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={calculateSizing} className={styles.calculateButton}>
                  <Calculator size={20} />
                  Calculate
                </button>
                <button onClick={resetSizing} className={styles.resetButton}>
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>

              {sizingError && (
                <div className={styles.error}>
                  <Info size={20} />
                  {sizingError}
                </div>
              )}
            </div>

            <div className={styles.resultSection}>
              <h2>Cable Sizing Results</h2>
              {sizingResults ? (
                <div className={styles.results}>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Recommended Size:</span>
                    <span className={styles.resultValue}>{sizingResults.recommendedSize} mm²</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Current Carrying Capacity:</span>
                    <span className={styles.resultValue}>{sizingResults.currentCarryingCapacity} A</span>
                  </div>
                  <div className={`${styles.resultItem} ${styles.compliance}`}>
                    <span className={styles.resultLabel}>Voltage Drop Check:</span>
                    <span className={`${styles.resultValue} ${sizingResults.voltageDropCheck ? styles.compliant : styles.nonCompliant}`}>
                      {sizingResults.voltageDropCheck ? '✓ COMPLIANT' : '✗ EXCEEDS LIMITS'}
                    </span>
                  </div>
                  <div className={`${styles.resultItem} ${styles.compliance}`}>
                    <span className={styles.resultLabel}>Thermal Check:</span>
                    <span className={`${styles.resultValue} ${sizingResults.thermalCheck ? styles.compliant : styles.nonCompliant}`}>
                      {sizingResults.thermalCheck ? '✓ COMPLIANT' : '✗ INSUFFICIENT'}
                    </span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Protection Required:</span>
                    <span className={styles.resultValue}>{sizingResults.protectionRequired}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.noResults}>
                  Enter parameters and click Calculate to see results
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'derating' && (
          <div className={styles.calculatorGrid}>
            <div className={styles.inputSection}>
              <h2>Derating Parameters</h2>
              <p className={styles.instruction}>
                Enter installation conditions to calculate cable derating factors
              </p>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="originalRating">Original Cable Rating</label>
                  <input
                    id="originalRating"
                    type="number"
                    step="0.1"
                    placeholder="Enter original rating"
                    value={deratingInputs.originalRating || ''}
                    onChange={(e) => handleDeratingInputChange('originalRating', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>A</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="totalLength">Total Cable Length</label>
                  <input
                    id="totalLength"
                    type="number"
                    step="0.1"
                    placeholder="Enter total length"
                    value={deratingInputs.totalLength || ''}
                    onChange={(e) => handleDeratingInputChange('totalLength', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>m</span>
                </div>

                <div className={styles.selectGroup}>
                  <label htmlFor="deratingInstallationMethod">Installation Method</label>
                  <select
                    id="deratingInstallationMethod"
                    value={deratingInputs.installationMethod || 'A'}
                    onChange={(e) => handleDeratingInputChange('installationMethod', e.target.value)}
                    className={styles.select}
                  >
                    <option value="A">Method A - Enclosed in conduit in thermally insulated wall</option>
                    <option value="B">Method B - Enclosed in trunking in thermally insulated wall</option>
                    <option value="C">Method C - Clipped direct</option>
                    <option value="D">Method D - In conduit in masonry wall</option>
                    <option value="E">Method E - In free air or on a perforated tray</option>
                    <option value="F">Method F - Underground cables</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="ambientTemperature">Ambient Temperature</label>
                  <input
                    id="ambientTemperature"
                    type="number"
                    step="1"
                    placeholder="Enter ambient temperature"
                    value={deratingInputs.ambientTemperature || ''}
                    onChange={(e) => handleDeratingInputChange('ambientTemperature', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>°C</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="numberOfCircuits">Number of Circuits</label>
                  <input
                    id="numberOfCircuits"
                    type="number"
                    min="1"
                    placeholder="Enter number of circuits"
                    value={deratingInputs.numberOfCircuits || ''}
                    onChange={(e) => handleDeratingInputChange('numberOfCircuits', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>-</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="thermalInsulationLength">Thermal Insulation Length</label>
                  <input
                    id="thermalInsulationLength"
                    type="number"
                    step="0.1"
                    placeholder="Enter insulation length"
                    value={deratingInputs.thermalInsulationLength || ''}
                    onChange={(e) => handleDeratingInputChange('thermalInsulationLength', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>m</span>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={deratingInputs.isBuried || false}
                      onChange={(e) => handleDeratingInputChange('isBuried', e.target.checked)}
                      className={styles.checkbox}
                    />
                    Cable is buried underground
                  </label>
                </div>

                {deratingInputs.isBuried && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="soilThermalResistivity">Soil Thermal Resistivity</label>
                    <input
                      id="soilThermalResistivity"
                      type="number"
                      step="0.1"
                      placeholder="Enter soil thermal resistivity"
                      value={deratingInputs.soilThermalResistivity || ''}
                      onChange={(e) => handleDeratingInputChange('soilThermalResistivity', e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.unit}>K.m/W</span>
                  </div>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={calculateDerating} className={styles.calculateButton}>
                  <Calculator size={20} />
                  Calculate
                </button>
                <button onClick={resetDerating} className={styles.resetButton}>
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>

              {deratingError && (
                <div className={styles.error}>
                  <Info size={20} />
                  {deratingError}
                </div>
              )}
            </div>

            <div className={styles.resultSection}>
              <h2>Derating Results</h2>
              {deratingResults ? (
                <div className={styles.results}>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Grouping Factor:</span>
                    <span className={styles.resultValue}>{deratingResults.groupingFactor.toFixed(3)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Ambient Temp Factor:</span>
                    <span className={styles.resultValue}>{deratingResults.ambientTempFactor.toFixed(3)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Thermal Insulation Factor:</span>
                    <span className={styles.resultValue}>{deratingResults.thermalInsulationFactor.toFixed(3)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Buried Factor:</span>
                    <span className={styles.resultValue}>{deratingResults.buriedFactor.toFixed(3)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Overall Derating:</span>
                    <span className={styles.resultValue}>{deratingResults.overallDerating.toFixed(3)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Derated Current:</span>
                    <span className={styles.resultValue}>{deratingResults.deratedCurrent.toFixed(2)} A</span>
                  </div>
                </div>
              ) : (
                <p className={styles.noResults}>
                  Enter parameters and click Calculate to see results
                </p>
              )}
            </div>
          </div>
        )}

        <div className={styles.infoSection}>
          <h2>UK Standards Reference</h2>
          <div className={styles.standardsGrid}>
            <div className={styles.standard}>
              <h3>BS 7671:2018+A2:2022</h3>
              <p><strong>Section 523:</strong> Current-carrying capacity and voltage drop</p>
              <ul>
                <li>Appendix 4: Current-carrying capacity tables</li>
                <li>Section 523.8: Grouping factors</li>
                <li>Section 523.9: Thermal insulation</li>
                <li>Section 525: Voltage drop requirements</li>
              </ul>
            </div>
            <div className={styles.standard}>
              <h3>Installation Methods</h3>
              <p><strong>Reference Methods:</strong> Per Table 4A2</p>
              <ul>
                <li>Method A/B: Enclosed in conduit/trunking in insulated wall</li>
                <li>Method C: Clipped direct to wall or ceiling</li>
                <li>Method D: In conduit in masonry wall</li>
                <li>Method E: In free air or on perforated tray</li>
                <li>Method F: Underground installation</li>
              </ul>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} />
            <div>
              <p><strong>Professional Design Required:</strong> These calculations are for guidance only and reference BS 7671:2018+A2:2022. All cable sizing and installation work must be designed by qualified electrical engineers and verified through proper testing and inspection.</p>
              <p><strong>Installation Compliance:</strong> Cable sizing must consider all installation conditions including protection coordination, discrimination, and environmental factors. Consult manufacturer specifications and relevant British Standards for specific applications.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
