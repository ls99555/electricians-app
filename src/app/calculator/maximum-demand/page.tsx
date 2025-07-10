'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Info, Home, Plus, Minus } from 'lucide-react';
import { MaximumDemandCalculator, type MaximumDemandResult } from '@/lib/calculations';
import styles from './maximum-demand.module.scss';

interface Appliance {
  appliance: string;
  rating: number;
}

interface SpecialCircuit {
  circuit: string;
  rating: number;
}

interface MaximumDemandInputs {
  lighting?: number;
  heating?: number;
  waterHeating?: number;
  cooking: Appliance[];
  socketOutlets?: number;
  largeAppliances: Appliance[];
  installationType?: 'domestic' | 'commercial' | 'industrial';
  specialCircuits: SpecialCircuit[];
}

export default function MaximumDemandPage() {
  const [inputs, setInputs] = useState<MaximumDemandInputs>({
    cooking: [],
    largeAppliances: [],
    specialCircuits: [],
    installationType: 'domestic'
  });
  const [results, setResults] = useState<MaximumDemandResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof MaximumDemandInputs, value: string | number) => {
    const numValue = typeof value === 'string' && value === '' ? undefined : 
                     typeof value === 'string' ? parseFloat(value) : value;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
    setError('');
  };

  const addAppliance = (category: 'cooking' | 'largeAppliances') => {
    setInputs(prev => ({
      ...prev,
      [category]: [...prev[category], { appliance: '', rating: 0 }]
    }));
  };

  const addSpecialCircuit = () => {
    setInputs(prev => ({
      ...prev,
      specialCircuits: [...prev.specialCircuits, { circuit: '', rating: 0 }]
    }));
  };

  const removeAppliance = (category: 'cooking' | 'largeAppliances', index: number) => {
    setInputs(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const removeSpecialCircuit = (index: number) => {
    setInputs(prev => ({
      ...prev,
      specialCircuits: prev.specialCircuits.filter((_, i) => i !== index)
    }));
  };

  const updateAppliance = (
    category: 'cooking' | 'largeAppliances', 
    index: number, 
    field: 'appliance' | 'rating', 
    value: string | number
  ) => {
    setInputs(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateSpecialCircuit = (
    index: number, 
    field: 'circuit' | 'rating', 
    value: string | number
  ) => {
    setInputs(prev => ({
      ...prev,
      specialCircuits: prev.specialCircuits.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculate = () => {
    try {
      if (!inputs.lighting || !inputs.heating || !inputs.waterHeating || inputs.socketOutlets === undefined) {
        setError('Please enter lighting, heating, water heating loads and socket outlet count.');
        return;
      }

      if (!inputs.installationType) {
        setError('Please select installation type.');
        return;
      }

      const calculated = MaximumDemandCalculator.calculate({
        lighting: inputs.lighting,
        heating: inputs.heating,
        waterHeating: inputs.waterHeating,
        cooking: inputs.cooking,
        socketOutlets: inputs.socketOutlets,
        largeAppliances: inputs.largeAppliances,
        installationType: inputs.installationType,
        specialCircuits: inputs.specialCircuits
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
      cooking: [],
      largeAppliances: [],
      specialCircuits: [],
      installationType: 'domestic'
    });
    setResults(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Home className={styles.icon} />
            Maximum Demand Calculator
          </h1>
          <p className={styles.subtitle}>
            Calculate maximum demand for electrical installations per BS 7671
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calculatorGrid}>
          <div className={styles.inputSection}>
            <h2>Installation Loads</h2>
            <p className={styles.instruction}>
              Enter all connected loads to calculate maximum demand with diversity factors
            </p>

            <div className={styles.basicLoads}>
              <h3>Basic Loads</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="lighting">Lighting Load</label>
                  <input
                    id="lighting"
                    type="number"
                    step="1"
                    placeholder="Enter lighting load"
                    value={inputs.lighting || ''}
                    onChange={(e) => handleInputChange('lighting', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>W</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="heating">Space Heating Load</label>
                  <input
                    id="heating"
                    type="number"
                    step="1"
                    placeholder="Enter heating load"
                    value={inputs.heating || ''}
                    onChange={(e) => handleInputChange('heating', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>W</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="waterHeating">Water Heating Load</label>
                  <input
                    id="waterHeating"
                    type="number"
                    step="1"
                    placeholder="Enter water heating load"
                    value={inputs.waterHeating || ''}
                    onChange={(e) => handleInputChange('waterHeating', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>W</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="socketOutlets">Socket Outlets</label>
                  <input
                    id="socketOutlets"
                    type="number"
                    min="0"
                    placeholder="Enter number of socket outlets"
                    value={inputs.socketOutlets || ''}
                    onChange={(e) => handleInputChange('socketOutlets', e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.unit}>nos</span>
                </div>

                <div className={styles.selectGroup}>
                  <label htmlFor="installationType">Installation Type</label>
                  <select
                    id="installationType"
                    value={inputs.installationType || 'domestic'}
                    onChange={(e) => handleInputChange('installationType', e.target.value)}
                    className={styles.select}
                  >
                    <option value="domestic">Domestic Installation</option>
                    <option value="commercial">Commercial Installation</option>
                    <option value="industrial">Industrial Installation</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.applianceSection}>
              <h3>Cooking Appliances</h3>
              <p className={styles.sectionNote}>Add cookers, ovens, hobs and other cooking equipment</p>
              {inputs.cooking.map((appliance, index) => (
                <div key={index} className={styles.applianceRow}>
                  <input
                    type="text"
                    placeholder="Appliance name (e.g., Electric Cooker)"
                    value={appliance.appliance}
                    onChange={(e) => updateAppliance('cooking', index, 'appliance', e.target.value)}
                    className={styles.applianceInput}
                  />
                  <input
                    type="number"
                    step="1"
                    placeholder="Rating (W)"
                    value={appliance.rating || ''}
                    onChange={(e) => updateAppliance('cooking', index, 'rating', parseFloat(e.target.value) || 0)}
                    className={styles.ratingInput}
                  />
                  <button
                    onClick={() => removeAppliance('cooking', index)}
                    className={styles.removeButton}
                    aria-label="Remove appliance"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addAppliance('cooking')}
                className={styles.addButton}
              >
                <Plus size={16} />
                Add Cooking Appliance
              </button>
            </div>

            <div className={styles.applianceSection}>
              <h3>Large Appliances</h3>
              <p className={styles.sectionNote}>Add washing machines, tumble dryers, dishwashers, etc.</p>
              {inputs.largeAppliances.map((appliance, index) => (
                <div key={index} className={styles.applianceRow}>
                  <input
                    type="text"
                    placeholder="Appliance name (e.g., Washing Machine)"
                    value={appliance.appliance}
                    onChange={(e) => updateAppliance('largeAppliances', index, 'appliance', e.target.value)}
                    className={styles.applianceInput}
                  />
                  <input
                    type="number"
                    step="1"
                    placeholder="Rating (W)"
                    value={appliance.rating || ''}
                    onChange={(e) => updateAppliance('largeAppliances', index, 'rating', parseFloat(e.target.value) || 0)}
                    className={styles.ratingInput}
                  />
                  <button
                    onClick={() => removeAppliance('largeAppliances', index)}
                    className={styles.removeButton}
                    aria-label="Remove appliance"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addAppliance('largeAppliances')}
                className={styles.addButton}
              >
                <Plus size={16} />
                Add Large Appliance
              </button>
            </div>

            <div className={styles.applianceSection}>
              <h3>Special Circuits</h3>
              <p className={styles.sectionNote}>Add EV chargers, heat pumps, swimming pool equipment, etc.</p>
              {inputs.specialCircuits.map((circuit, index) => (
                <div key={index} className={styles.applianceRow}>
                  <input
                    type="text"
                    placeholder="Circuit name (e.g., EV Charger)"
                    value={circuit.circuit}
                    onChange={(e) => updateSpecialCircuit(index, 'circuit', e.target.value)}
                    className={styles.applianceInput}
                  />
                  <input
                    type="number"
                    step="1"
                    placeholder="Rating (W)"
                    value={circuit.rating || ''}
                    onChange={(e) => updateSpecialCircuit(index, 'rating', parseFloat(e.target.value) || 0)}
                    className={styles.ratingInput}
                  />
                  <button
                    onClick={() => removeSpecialCircuit(index)}
                    className={styles.removeButton}
                    aria-label="Remove circuit"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSpecialCircuit()}
                className={styles.addButton}
              >
                <Plus size={16} />
                Add Special Circuit
              </button>
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
            <h2>Maximum Demand Results</h2>
            {results ? (
              <div className={styles.results}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Total Connected Load:</span>
                  <span className={styles.resultValue}>{results.totalConnectedLoad.toFixed(0)} W</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Maximum Demand:</span>
                  <span className={styles.resultValue}>{results.maximumDemand.toFixed(0)} W</span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Diversity Factor:</span>
                  <span className={styles.resultValue}>{(results.diversityFactor * 100).toFixed(1)}%</span>
                </div>
                <div className={styles.breakdownSection}>
                  <h3>Load Breakdown:</h3>
                  <div className={styles.breakdown}>
                    {results.loadBreakdown.map((item, index) => (
                      <div key={index} className={styles.breakdownItem}>
                        <span>{item.appliance}:</span>
                        <span>{item.demand.toFixed(0)} W (div: {(item.diversity * 100).toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.regulationNote}>
                  <Info className={styles.regulationIcon} />
                  <span>{results.regulation}</span>
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
                Enter load details and click Calculate to see results
              </p>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>UK Standards Reference</h2>
          <div className={styles.standardsGrid}>
            <div className={styles.standard}>
              <h3>BS 7671:2018+A2:2022</h3>
              <p><strong>Appendix A:</strong> Diversity factors for domestic installations</p>
              <ul>
                <li>Lighting circuits: 90% diversity factor</li>
                <li>Socket outlets: Variable based on number and type</li>
                <li>Cooking appliances: First 10A + 30% remainder + 5A</li>
                <li>Water heating: 100% (no diversity)</li>
                <li>Space heating: 100% (no diversity)</li>
              </ul>
            </div>
            <div className={styles.standard}>
              <h3>IET Guidance Notes 1</h3>
              <p><strong>Selection & Erection:</strong> Maximum demand calculation methods</p>
              <ul>
                <li>Consider actual usage patterns</li>
                <li>Apply appropriate diversity factors</li>
                <li>Account for future expansion</li>
                <li>Verify with protective device ratings</li>
              </ul>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} />
            <div>
              <p><strong>Professional Design Required:</strong> These calculations are for guidance only and reference BS 7671:2018+A2:2022 Appendix A. All maximum demand calculations must be verified by qualified electrical engineers and considered alongside actual usage patterns and future expansion requirements.</p>
              <p><strong>Regulation Compliance:</strong> Maximum demand calculations must account for simultaneity factors, load characteristics, and installation-specific requirements. Consult IET Guidance Notes and manufacturer data for specific applications.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
