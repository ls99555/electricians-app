'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, Zap, Cable, Home, Lightbulb, Battery, Sun, Wrench, Shield, Search } from 'lucide-react';
import styles from './calculators.module.scss';

const calculatorCategories = [
  {
    title: 'Basic Calculations',
    description: 'Essential electrical calculations for everyday use',
    icon: Calculator,
    calculators: [
      {
        name: 'Ohm\'s Law',
        path: '/calculator/ohms-law',
        icon: Calculator,
        description: 'Calculate V, I, R, P relationships'
      },
      {
        name: 'Voltage Drop',
        path: '/calculator/voltage-drop',
        icon: Zap,
        description: 'BS 7671 voltage drop compliance'
      },
      {
        name: 'Cable Sizing',
        path: '/calculator/cable-sizing',
        icon: Cable,
        description: 'Size cables with derating factors'
      }
    ]
  },
  {
    title: 'Load & Demand',
    description: 'Maximum demand and diversity calculations',
    icon: Home,
    calculators: [
      {
        name: 'Maximum Demand',
        path: '/calculator/maximum-demand',
        icon: Home,
        description: 'Calculate maximum demand with diversity'
      },
      {
        name: 'Socket Outlet Assessment',
        path: '/calculator/socket-assessment',
        icon: Zap,
        description: 'Assess socket outlet loading'
      },
      {
        name: 'Diversity Factors',
        path: '/calculator/diversity-factors',
        icon: Calculator,
        description: 'Apply BS 7671 diversity factors'
      }
    ]
  },
  {
    title: 'Lighting Calculations',
    description: 'Professional lighting design calculations',
    icon: Lightbulb,
    calculators: [
      {
        name: 'Illuminance',
        path: '/calculator/illuminance',
        icon: Lightbulb,
        description: 'Lighting design calculations'
      },
      {
        name: 'Emergency Lighting',
        path: '/calculator/emergency-lighting',
        icon: Shield,
        description: 'Emergency lighting requirements'
      },
      {
        name: 'LED Replacement',
        path: '/calculator/led-replacement',
        icon: Lightbulb,
        description: 'LED upgrade calculations'
      }
    ]
  },
  {
    title: 'Cable & Protection',
    description: 'Cable sizing and protection calculations',
    icon: Cable,
    calculators: [
      {
        name: 'Cable Derating',
        path: '/calculator/cable-derating',
        icon: Cable,
        description: 'Environmental derating factors'
      },
      {
        name: 'Protective Devices',
        path: '/calculator/protective-devices',
        icon: Shield,
        description: 'MCB and RCD selection'
      },
      {
        name: 'Conduit Fill',
        path: '/calculator/conduit-fill',
        icon: Cable,
        description: 'Cable capacity in conduits'
      }
    ]
  },
  {
    title: 'Safety & Testing',
    description: 'Testing and safety calculations',
    icon: Shield,
    calculators: [
      {
        name: 'Loop Impedance',
        path: '/calculator/loop-impedance',
        icon: Shield,
        description: 'Earth fault loop impedance'
      },
      {
        name: 'RCD Selection',
        path: '/calculator/rcd-selection',
        icon: Shield,
        description: 'RCD type and rating selection'
      },
      {
        name: 'Building Regulations',
        path: '/calculator/building-regulations',
        icon: Shield,
        description: 'Part P compliance & building loads'
      },
      {
        name: 'Earth Electrode',
        path: '/calculator/earth-electrode',
        icon: Shield,
        description: 'Earth electrode resistance'
      }
    ]
  },
  {
    title: 'EV Charging',
    description: 'Electric vehicle charging calculations',
    icon: Battery,
    calculators: [
      {
        name: 'EV Charger Load',
        path: '/calculator/ev-charger-load',
        icon: Battery,
        description: 'EV charging load assessment'
      },
      {
        name: 'Grid Connection',
        path: '/calculator/grid-connection',
        icon: Zap,
        description: 'Grid capacity for EV charging'
      },
      {
        name: 'Load Balancing',
        path: '/calculator/load-balancing',
        icon: Battery,
        description: 'Multiple EV point balancing'
      }
    ]
  },
  {
    title: 'Renewable Energy',
    description: 'Solar and renewable energy calculations',
    icon: Sun,
    calculators: [
      {
        name: 'Solar Array Sizing',
        path: '/calculator/solar-array-sizing',
        icon: Sun,
        description: 'Solar panel system sizing'
      },
      {
        name: 'Battery Storage',
        path: '/calculator/battery-storage',
        icon: Battery,
        description: 'Battery system calculations'
      },
      {
        name: 'Grid-Tie Systems',
        path: '/calculator/grid-tie-systems',
        icon: Sun,
        description: 'Grid-connected renewable systems'
      }
    ]
  },
  {
    title: 'Motor & Industrial',
    description: 'Motor and industrial calculations',
    icon: Wrench,
    calculators: [
      {
        name: 'Motor Starting',
        path: '/calculator/motor-starting',
        icon: Wrench,
        description: 'Motor starting calculations'
      },
      {
        name: 'VFD Sizing',
        path: '/calculator/vfd-sizing',
        icon: Wrench,
        description: 'Variable frequency drive sizing'
      },
      {
        name: 'Power Factor Correction',
        path: '/calculator/power-factor-correction',
        icon: Wrench,
        description: 'Power factor improvement'
      }
    ]
  }
];

export default function CalculatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = calculatorCategories.map(category => ({
    ...category,
    calculators: category.calculators.filter(calc =>
      calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.calculators.length > 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Calculator className={styles.icon} />
            Electrical Calculators
          </h1>
          <p className={styles.subtitle}>
            Professional electrical calculations based on BS 7671 and UK standards
          </p>
          
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.categoriesGrid}>
          {filteredCategories.map((category, index) => {
            const CategoryIcon = category.icon;
            return (
              <div key={index} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <CategoryIcon className={styles.categoryIcon} />
                  <div>
                    <h2 className={styles.categoryTitle}>{category.title}</h2>
                    <p className={styles.categoryDescription}>{category.description}</p>
                  </div>
                </div>
                
                <div className={styles.calculatorsList}>
                  {category.calculators.map((calc, calcIndex) => {
                    const CalcIcon = calc.icon;
                    return (
                      <Link
                        key={calcIndex}
                        href={calc.path}
                        className={styles.calculatorCard}
                      >
                        <CalcIcon className={styles.calculatorIcon} />
                        <div className={styles.calculatorInfo}>
                          <h3 className={styles.calculatorName}>{calc.name}</h3>
                          <p className={styles.calculatorDescription}>{calc.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className={styles.noResults}>
            <p>No calculators found matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className={styles.clearSearch}
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      <div className={styles.infoSection}>
        <h2>UK Electrical Standards Compliance</h2>
        <div className={styles.standardsGrid}>
          <div className={styles.standard}>
            <h3>BS 7671:2018+A2:2022</h3>
            <p>Requirements for Electrical Installations (18th Edition)</p>
            <ul>
              <li>Wiring regulations compliance</li>
              <li>Installation design requirements</li>
              <li>Safety and protection standards</li>
            </ul>
          </div>
          <div className={styles.standard}>
            <h3>Building Regulations Part P</h3>
            <p>Electrical Safety - Dwellings</p>
            <ul>
              <li>Domestic electrical work requirements</li>
              <li>Notification and certification</li>
              <li>Competent person schemes</li>
            </ul>
          </div>
          <div className={styles.standard}>
            <h3>IET Guidance Notes</h3>
            <p>Practical guidance on BS 7671 application</p>
            <ul>
              <li>Selection and erection guidance</li>
              <li>Inspection and testing procedures</li>
              <li>Special installations requirements</li>
            </ul>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <div>
            <p><strong>Professional Use Only:</strong> These calculations are for guidance by qualified electricians and electrical engineers. All electrical work must comply with BS 7671, Building Regulations, and be carried out by competent persons.</p>
            <p><strong>Safety Notice:</strong> Electrical work can be dangerous. Always ensure proper isolation, testing, and safety procedures are followed. When in doubt, consult a qualified electrical engineer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
