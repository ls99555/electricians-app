'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';

import { 
  PartPComplianceCalculator, 
  BuildingRegulationCalculator, 
  EnergyPerformanceCalculator 
} from '@/lib/calculations/building-regulations';
import type { 
  PartPComplianceResult, 
  BuildingRegulationResult, 
  EnergyPerformanceResult 
} from '@/lib/types/building-regulations';
import styles from './building-regulations.module.scss';

export default function BuildingRegulationsPage() {
  const [activeTab, setActiveTab] = useState<'part-p' | 'load-assessment' | 'energy-performance'>('part-p');
  const [partPResult, setPartPResult] = useState<PartPComplianceResult | null>(null);
  const [buildingRegResult, setBuildingRegResult] = useState<BuildingRegulationResult | null>(null);
  const [energyResult, setEnergyResult] = useState<EnergyPerformanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Part P Compliance form state
  const [partPInputs, setPartPInputs] = useState({
    workType: 'new_circuit' as const,
    location: 'general' as const,
    circuitProtection: 32,
    installerQualification: 'competent_person' as const,
    specialLocationWork: false,
    consumerUnitReplacement: false,
    newCircuitInstallation: false
  });

  // Building Regulation form state
  const [buildingRegInputs, setBuildingRegInputs] = useState({
    buildingType: 'domestic' as const,
    floorArea: 100,
    numberOfBedrooms: 3,
    occupancyType: 'residential',
    heatingType: 'gas' as const,
    hotWaterType: 'gas' as const,
    cookingType: 'gas' as const,
    evChargingRequired: false,
    solarPVInstallation: false,
    futureProofing: false
  });

  // Energy Performance form state
  const [energyInputs, setEnergyInputs] = useState({
    buildingType: 'domestic' as const,
    floorArea: 100,
    annualEnergyConsumption: 12000,
    renewableGeneration: 0,
    heatingSystem: 'gas' as const,
    insulationLevel: 'basic' as const,
    lightingType: 'led' as const,
    applianceEfficiency: 'standard' as const
  });

  const handlePartPCalculation = () => {
    try {
      setError(null);
      const result = PartPComplianceCalculator.calculate(partPInputs);
      setPartPResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleBuildingRegCalculation = () => {
    try {
      setError(null);
      const result = BuildingRegulationCalculator.calculate(buildingRegInputs);
      setBuildingRegResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEnergyCalculation = () => {
    try {
      setError(null);
      const result = EnergyPerformanceCalculator.calculate(energyInputs);
      setEnergyResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const renderPartPForm = () => (
    <div className={styles.formSection}>
      <h3>Part P Compliance Assessment</h3>
      <p className={styles.description}>
        Determine if your electrical work requires Building Control notification under Part P of the Building Regulations.
      </p>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="workType">Work Type</label>
          <select
            id="workType"
            value={partPInputs.workType}
            onChange={(e) => setPartPInputs({
              ...partPInputs,
              workType: e.target.value as typeof partPInputs.workType
            })}
          >
            <option value="new_circuit">New Circuit</option>
            <option value="extension">Circuit Extension</option>
            <option value="replacement">Replacement</option>
            <option value="maintenance">Maintenance</option>
            <option value="consumer_unit">Consumer Unit</option>
            <option value="special_location">Special Location</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={partPInputs.location}
            onChange={(e) => setPartPInputs({
              ...partPInputs,
              location: e.target.value as typeof partPInputs.location
            })}
          >
            <option value="general">General</option>
            <option value="bathroom">Bathroom</option>
            <option value="kitchen">Kitchen</option>
            <option value="garden">Garden/Outdoors</option>
            <option value="swimming_pool">Swimming Pool</option>
            <option value="sauna">Sauna</option>
            <option value="solar_pv">Solar PV</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="circuitProtection">Circuit Protection (A)</label>
          <input
            type="number"
            id="circuitProtection"
            value={partPInputs.circuitProtection}
            onChange={(e) => setPartPInputs({
              ...partPInputs,
              circuitProtection: Number(e.target.value)
            })}
            min="1"
            max="125"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="installerQualification">Installer Qualification</label>
          <select
            id="installerQualification"
            value={partPInputs.installerQualification}
            onChange={(e) => setPartPInputs({
              ...partPInputs,
              installerQualification: e.target.value as typeof partPInputs.installerQualification
            })}
          >
            <option value="competent_person">Competent Person</option>
            <option value="qualified_supervisor">Qualified Supervisor</option>
            <option value="unqualified">Unqualified</option>
          </select>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={partPInputs.specialLocationWork}
              onChange={(e) => setPartPInputs({
                ...partPInputs,
                specialLocationWork: e.target.checked
              })}
            />
            Special Location Work
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={partPInputs.consumerUnitReplacement}
              onChange={(e) => setPartPInputs({
                ...partPInputs,
                consumerUnitReplacement: e.target.checked
              })}
            />
            Consumer Unit Replacement
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={partPInputs.newCircuitInstallation}
              onChange={(e) => setPartPInputs({
                ...partPInputs,
                newCircuitInstallation: e.target.checked
              })}
            />
            New Circuit Installation
          </label>
        </div>
      </div>

      <button onClick={handlePartPCalculation} className={styles.calculateButton}>
        Check Part P Compliance
      </button>
    </div>
  );

  const renderBuildingRegForm = () => (
    <div className={styles.formSection}>
      <h3>Building Load Assessment</h3>
      <p className={styles.description}>
        Calculate electrical loads for building regulation compliance and service capacity planning.
      </p>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="buildingType">Building Type</label>
          <select
            id="buildingType"
            value={buildingRegInputs.buildingType}
            onChange={(e) => setBuildingRegInputs({
              ...buildingRegInputs,
              buildingType: e.target.value as typeof buildingRegInputs.buildingType
            })}
          >
            <option value="domestic">Domestic</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="mixed_use">Mixed Use</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="floorArea">Floor Area (m²)</label>
          <input
            type="number"
            id="floorArea"
            value={buildingRegInputs.floorArea}
            onChange={(e) => setBuildingRegInputs({
              ...buildingRegInputs,
              floorArea: Number(e.target.value)
            })}
            min="10"
            max="10000"
          />
        </div>

        {buildingRegInputs.buildingType === 'domestic' && (
          <div className={styles.formGroup}>
            <label htmlFor="numberOfBedrooms">Number of Bedrooms</label>
            <input
              type="number"
              id="numberOfBedrooms"
              value={buildingRegInputs.numberOfBedrooms}
              onChange={(e) => setBuildingRegInputs({
                ...buildingRegInputs,
                numberOfBedrooms: Number(e.target.value)
              })}
              min="1"
              max="10"
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="heatingType">Heating Type</label>
          <select
            id="heatingType"
            value={buildingRegInputs.heatingType}
            onChange={(e) => setBuildingRegInputs({
              ...buildingRegInputs,
              heatingType: e.target.value as typeof buildingRegInputs.heatingType
            })}
          >
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="oil">Oil</option>
            <option value="heat_pump">Heat Pump</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="hotWaterType">Hot Water Type</label>
          <select
            id="hotWaterType"
            value={buildingRegInputs.hotWaterType}
            onChange={(e) => setBuildingRegInputs({
              ...buildingRegInputs,
              hotWaterType: e.target.value as typeof buildingRegInputs.hotWaterType
            })}
          >
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="solar">Solar</option>
            <option value="heat_pump">Heat Pump</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cookingType">Cooking Type</label>
          <select
            id="cookingType"
            value={buildingRegInputs.cookingType}
            onChange={(e) => setBuildingRegInputs({
              ...buildingRegInputs,
              cookingType: e.target.value as typeof buildingRegInputs.cookingType
            })}
          >
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={buildingRegInputs.evChargingRequired}
              onChange={(e) => setBuildingRegInputs({
                ...buildingRegInputs,
                evChargingRequired: e.target.checked
              })}
            />
            EV Charging Required
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={buildingRegInputs.solarPVInstallation}
              onChange={(e) => setBuildingRegInputs({
                ...buildingRegInputs,
                solarPVInstallation: e.target.checked
              })}
            />
            Solar PV Installation
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={buildingRegInputs.futureProofing}
              onChange={(e) => setBuildingRegInputs({
                ...buildingRegInputs,
                futureProofing: e.target.checked
              })}
            />
            Future Proofing
          </label>
        </div>
      </div>

      <button onClick={handleBuildingRegCalculation} className={styles.calculateButton}>
        Calculate Building Loads
      </button>
    </div>
  );

  const renderEnergyForm = () => (
    <div className={styles.formSection}>
      <h3>Energy Performance Assessment</h3>
      <p className={styles.description}>
        Calculate energy performance metrics for building regulations compliance.
      </p>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="energyBuildingType">Building Type</label>
          <select
            id="energyBuildingType"
            value={energyInputs.buildingType}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              buildingType: e.target.value as typeof energyInputs.buildingType
            })}
          >
            <option value="domestic">Domestic</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="energyFloorArea">Floor Area (m²)</label>
          <input
            type="number"
            id="energyFloorArea"
            value={energyInputs.floorArea}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              floorArea: Number(e.target.value)
            })}
            min="10"
            max="10000"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="annualEnergyConsumption">Annual Energy Consumption (kWh)</label>
          <input
            type="number"
            id="annualEnergyConsumption"
            value={energyInputs.annualEnergyConsumption}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              annualEnergyConsumption: Number(e.target.value)
            })}
            min="0"
            max="100000"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="renewableGeneration">Renewable Generation (kWh/year)</label>
          <input
            type="number"
            id="renewableGeneration"
            value={energyInputs.renewableGeneration}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              renewableGeneration: Number(e.target.value)
            })}
            min="0"
            max="50000"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="heatingSystem">Heating System</label>
          <select
            id="heatingSystem"
            value={energyInputs.heatingSystem}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              heatingSystem: e.target.value as typeof energyInputs.heatingSystem
            })}
          >
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
            <option value="heat_pump">Heat Pump</option>
            <option value="biomass">Biomass</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="insulationLevel">Insulation Level</label>
          <select
            id="insulationLevel"
            value={energyInputs.insulationLevel}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              insulationLevel: e.target.value as typeof energyInputs.insulationLevel
            })}
          >
            <option value="basic">Basic</option>
            <option value="enhanced">Enhanced</option>
            <option value="high_performance">High Performance</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lightingType">Lighting Type</label>
          <select
            id="lightingType"
            value={energyInputs.lightingType}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              lightingType: e.target.value as typeof energyInputs.lightingType
            })}
          >
            <option value="led">LED</option>
            <option value="fluorescent">Fluorescent</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="applianceEfficiency">Appliance Efficiency</label>
          <select
            id="applianceEfficiency"
            value={energyInputs.applianceEfficiency}
            onChange={(e) => setEnergyInputs({
              ...energyInputs,
              applianceEfficiency: e.target.value as typeof energyInputs.applianceEfficiency
            })}
          >
            <option value="standard">Standard</option>
            <option value="high_efficiency">High Efficiency</option>
          </select>
        </div>
      </div>

      <button onClick={handleEnergyCalculation} className={styles.calculateButton}>
        Calculate Energy Performance
      </button>
    </div>
  );

  const renderPartPResults = () => {
    if (!partPResult) return null;

    return (
      <div className={styles.results}>
        <h3>Part P Compliance Results</h3>
        
        <div className={styles.resultCards}>
          <div className={styles.resultCard}>
            <h4>Notification Required</h4>
            <p className={partPResult.notificationRequired ? styles.warning : styles.success}>
              {partPResult.notificationRequired ? 'YES' : 'NO'}
            </p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Certification Required</h4>
            <p>{partPResult.certificationRequired}</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Competent Person Eligible</h4>
            <p className={partPResult.competentPersonEligible ? styles.success : styles.warning}>
              {partPResult.competentPersonEligible ? 'YES' : 'NO'}
            </p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Compliance Cost</h4>
            <p>£{partPResult.complianceCost.min} - £{partPResult.complianceCost.max}</p>
            <small>{partPResult.complianceCost.description}</small>
          </div>
        </div>

        <div className={styles.compliancePathway}>
          <h4>Compliance Pathway</h4>
          <ol>
            {partPResult.compliancePathway.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className={styles.recommendations}>
          <h4>Recommendations</h4>
          <ul>
            {partPResult.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderBuildingRegResults = () => {
    if (!buildingRegResult) return null;

    return (
      <div className={styles.results}>
        <h3>Building Load Assessment Results</h3>
        
        <div className={styles.resultCards}>
          <div className={styles.resultCard}>
            <h4>Total Connected Load</h4>
            <p>{buildingRegResult.totalConnectedLoad.toLocaleString()} W</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Maximum Demand</h4>
            <p>{buildingRegResult.maximumDemand.toLocaleString()} W</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Service Capacity</h4>
            <p>{buildingRegResult.serviceCapacity.toLocaleString()} W</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Minimum Circuits</h4>
            <p>{buildingRegResult.minimumCircuits}</p>
          </div>
        </div>

        <div className={styles.loadBreakdown}>
          <h4>Load Breakdown</h4>
          <div className={styles.breakdownGrid}>
            <div className={styles.breakdownItem}>
              <span>Base Load:</span>
              <span>{buildingRegResult.loadBreakdown.base.toLocaleString()} W</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Heating:</span>
              <span>{buildingRegResult.loadBreakdown.heating.toLocaleString()} W</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Hot Water:</span>
              <span>{buildingRegResult.loadBreakdown.hotWater.toLocaleString()} W</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Cooking:</span>
              <span>{buildingRegResult.loadBreakdown.cooking.toLocaleString()} W</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>EV Charging:</span>
              <span>{buildingRegResult.loadBreakdown.evCharging.toLocaleString()} W</span>
            </div>
          </div>
        </div>

        <div className={styles.recommendations}>
          <h4>Recommendations</h4>
          <ul>
            {buildingRegResult.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderEnergyResults = () => {
    if (!energyResult) return null;

    return (
      <div className={styles.results}>
        <h3>Energy Performance Results</h3>
        
        <div className={styles.resultCards}>
          <div className={styles.resultCard}>
            <h4>Energy Use Intensity</h4>
            <p>{energyResult.energyUseIntensity} kWh/m²/year</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Energy Rating</h4>
            <p className={styles.rating}>{energyResult.energyRating}</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Potential Rating</h4>
            <p className={styles.rating}>{energyResult.potentialRating}</p>
          </div>
          
          <div className={styles.resultCard}>
            <h4>Carbon Emissions</h4>
            <p>{energyResult.carbonEmissions} kg CO2e/year</p>
          </div>
        </div>

        <div className={styles.energyMetrics}>
          <h4>Energy Metrics</h4>
          <div className={styles.breakdownGrid}>
            <div className={styles.breakdownItem}>
              <span>Net Energy Consumption:</span>
              <span>{energyResult.netEnergyConsumption.toLocaleString()} kWh/year</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Renewable Contribution:</span>
              <span>{energyResult.renewableContribution}%</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Annual Savings Potential:</span>
              <span>£{energyResult.costSavings.annualSavings.toLocaleString()}</span>
            </div>
            <div className={styles.breakdownItem}>
              <span>Payback Period:</span>
              <span>{energyResult.costSavings.paybackYears} years</span>
            </div>
          </div>
        </div>

        <div className={styles.recommendations}>
          <h4>Recommendations</h4>
          <ul>
            {energyResult.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/calculators" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Calculators
        </Link>
        <h1>Building Regulations & Standards</h1>
        <p className={styles.subtitle}>
          Part P compliance, load assessment, and energy performance calculations
        </p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'part-p' ? styles.active : ''}`}
          onClick={() => setActiveTab('part-p')}
        >
          Part P Compliance
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'load-assessment' ? styles.active : ''}`}
          onClick={() => setActiveTab('load-assessment')}
        >
          Load Assessment
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'energy-performance' ? styles.active : ''}`}
          onClick={() => setActiveTab('energy-performance')}
        >
          Energy Performance
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.content}>
        {activeTab === 'part-p' && (
          <>
            {renderPartPForm()}
            {renderPartPResults()}
          </>
        )}
        
        {activeTab === 'load-assessment' && (
          <>
            {renderBuildingRegForm()}
            {renderBuildingRegResults()}
          </>
        )}
        
        {activeTab === 'energy-performance' && (
          <>
            {renderEnergyForm()}
            {renderEnergyResults()}
          </>
        )}
      </div>

      <div className={styles.regulations}>
        <h2>UK Standards & Regulations</h2>
        <div className={styles.regulationGrid}>
          <div className={styles.regulationItem}>
            <h3>Building Regulations Part P</h3>
            <p>Electrical Safety (England & Wales)</p>
            <p>Notification requirements for electrical work</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>Building Regulations Part L</h3>
            <p>Conservation of fuel and power</p>
            <p>Energy performance requirements</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>BS 7671:2018+A2:2022</h3>
            <p>18th Edition Wiring Regulations</p>
            <p>Requirements for electrical installations</p>
          </div>
          <div className={styles.regulationItem}>
            <h3>Energy Performance of Buildings</h3>
            <p>Energy Performance of Buildings Regulations 2012</p>
            <p>Energy efficiency requirements</p>
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
          All electrical work must be carried out by competent persons in accordance with BS 7671 
          and local Building Regulations. Building Control notification may be required - check 
          with your local authority. Professional electrical design and installation should always 
          be verified by qualified electrical engineers.
        </p>
      </div>
    </div>
  );
}
