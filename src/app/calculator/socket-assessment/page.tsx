'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import { SocketOutletCalculator } from '@/lib/calculations/socket-outlet';
import type { SocketOutletResult } from '@/lib/types';
import styles from './socket-assessment.module.scss';

export default function SocketAssessmentPage() {
  const [result, setResult] = useState<SocketOutletResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [inputs, setInputs] = useState({
    roomType: 'living_room' as const,
    floorArea: 25,
    numberOfSockets: 6,
    socketType: 'double' as const,
    expectedLoad: 1500,
    diversityFactor: 0.4,
    futureExpansion: false,
    specialRequirements: false,
    buildingType: 'domestic' as const
  });

  const handleCalculation = () => {
    try {
      setError(null);
      const calculationResult = SocketOutletCalculator.calculate(inputs);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setInputs({
      roomType: 'living_room',
      floorArea: 25,
      numberOfSockets: 6,
      socketType: 'double',
      expectedLoad: 1500,
      diversityFactor: 0.4,
      futureExpansion: false,
      specialRequirements: false,
      buildingType: 'domestic'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/calculators" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Calculators
        </Link>
        <h1>Socket Outlet Assessment</h1>
        <p className={styles.subtitle}>
          Calculate socket outlet requirements and loading assessment based on BS 7671
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.calculatorSection}>
        <div className={styles.inputForm}>
          <h2>Socket Outlet Parameters</h2>
          <p className={styles.description}>
            Enter the room details and socket requirements for load assessment and compliance checking.
          </p>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="roomType">Room Type</label>
              <select
                id="roomType"
                value={inputs.roomType}
                onChange={(e) => setInputs({
                  ...inputs,
                  roomType: e.target.value as typeof inputs.roomType
                })}
              >
                <option value="living_room">Living Room</option>
                <option value="bedroom">Bedroom</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="office">Office</option>
                <option value="utility">Utility Room</option>
                <option value="garage">Garage</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="buildingType">Building Type</label>
              <select
                id="buildingType"
                value={inputs.buildingType}
                onChange={(e) => setInputs({
                  ...inputs,
                  buildingType: e.target.value as typeof inputs.buildingType
                })}
              >
                <option value="domestic">Domestic</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="floorArea">Floor Area (m²)</label>
              <input
                type="number"
                id="floorArea"
                value={inputs.floorArea}
                onChange={(e) => setInputs({
                  ...inputs,
                  floorArea: Number(e.target.value)
                })}
                min="1"
                max="1000"
                step="0.1"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="numberOfSockets">Number of Sockets</label>
              <input
                type="number"
                id="numberOfSockets"
                value={inputs.numberOfSockets}
                onChange={(e) => setInputs({
                  ...inputs,
                  numberOfSockets: Number(e.target.value)
                })}
                min="1"
                max="50"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="socketType">Socket Type</label>
              <select
                id="socketType"
                value={inputs.socketType}
                onChange={(e) => setInputs({
                  ...inputs,
                  socketType: e.target.value as typeof inputs.socketType
                })}
              >
                <option value="single">Single (13A)</option>
                <option value="double">Double (13A)</option>
                <option value="switched">Switched Socket</option>
                <option value="usb">USB Socket</option>
                <option value="industrial">Industrial Socket</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="expectedLoad">Expected Load per Socket (W)</label>
              <input
                type="number"
                id="expectedLoad"
                value={inputs.expectedLoad}
                onChange={(e) => setInputs({
                  ...inputs,
                  expectedLoad: Number(e.target.value)
                })}
                min="100"
                max="3000"
                step="100"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="diversityFactor">Diversity Factor</label>
              <input
                type="number"
                id="diversityFactor"
                value={inputs.diversityFactor}
                onChange={(e) => setInputs({
                  ...inputs,
                  diversityFactor: Number(e.target.value)
                })}
                min="0.1"
                max="1.0"
                step="0.1"
              />
              <small>BS 7671 diversity factor (0.1-1.0)</small>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={inputs.futureExpansion}
                  onChange={(e) => setInputs({
                    ...inputs,
                    futureExpansion: e.target.checked
                  })}
                />
                Future Expansion Required
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={inputs.specialRequirements}
                  onChange={(e) => setInputs({
                    ...inputs,
                    specialRequirements: e.target.checked
                  })}
                />
                Special Requirements (IP Rating, etc.)
              </label>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={handleCalculation} className={styles.calculateButton}>
              Calculate Socket Assessment
            </button>
            <button onClick={handleReset} className={styles.resetButton}>
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className={styles.results}>
            <h2>Socket Assessment Results</h2>
            
            <div className={styles.resultCards}>
              <div className={styles.resultCard}>
                <h3>Total Connected Load</h3>
                <p className={styles.value}>{result.totalConnectedLoad.toLocaleString()} W</p>
              </div>
              
              <div className={styles.resultCard}>
                <h3>Maximum Demand</h3>
                <p className={styles.value}>{result.maximumDemand.toLocaleString()} W</p>
              </div>
              
              <div className={styles.resultCard}>
                <h3>Circuit Rating Required</h3>
                <p className={styles.value}>{result.circuitRating} A</p>
              </div>
              
              <div className={styles.resultCard}>
                <h3>Compliance Status</h3>
                <p className={result.compliant ? styles.success : styles.warning}>
                  {result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </p>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3>Socket Density</h3>
                <p>{result.socketDensity.toFixed(1)} sockets/m²</p>
                <p className={styles.detailNote}>
                  {result.socketDensity >= result.minimumDensity ? 'Above' : 'Below'} minimum requirement
                </p>
              </div>
              
              <div className={styles.detailCard}>
                <h3>Load per Socket</h3>
                <p>{result.loadPerSocket.toLocaleString()} W</p>
                <p className={styles.detailNote}>
                  Average load per socket outlet
                </p>
              </div>
              
              <div className={styles.detailCard}>
                <h3>Diversity Applied</h3>
                <p>{(result.diversityFactor * 100).toFixed(0)}%</p>
                <p className={styles.detailNote}>
                  BS 7671 diversity factor
                </p>
              </div>
            </div>

            <div className={styles.recommendationsSection}>
              <h3>Recommendations</h3>
              <ul className={styles.recommendations}>
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className={styles.regulations}>
        <h2>UK Standards & Regulations</h2>
        <div className={styles.regulationGrid}>
          <div className={styles.regulationItem}>
            <h3>BS 7671:2018+A2:2022</h3>
            <p>18th Edition Wiring Regulations</p>
            <p>Socket outlet requirements and diversity factors</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>Part M Building Regulations</h3>
            <p>Access to and use of buildings</p>
            <p>Socket outlet positioning and accessibility</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>BS 1363-1:2016</h3>
            <p>13A plugs and socket outlets</p>
            <p>Safety requirements for domestic sockets</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>IET Guidance Notes</h3>
            <p>Guidance Note 1: Selection & Erection</p>
            <p>Socket outlet design and installation</p>
          </div>
        </div>
      </div>

      <div className={styles.disclaimer}>
        <div className={styles.disclaimerHeader}>
          <Info size={20} />
          <h3>Important Disclaimer</h3>
        </div>
        <p>
          These calculations provide guidance only and do not constitute professional advice. 
          Socket outlet installations must comply with BS 7671 and local Building Regulations. 
          All electrical work must be carried out by competent persons and verified by qualified 
          electrical engineers. Consider accessibility requirements under Part M Building Regulations.
        </p>
      </div>
    </div>
  );
}
