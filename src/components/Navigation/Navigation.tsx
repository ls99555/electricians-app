'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Zap, Cable, Home, Menu, X, Lightbulb, Shield } from 'lucide-react';
import { useState } from 'react';
import styles from './navigation.module.scss';

const calculators = [
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
  },
  {
    name: 'Maximum Demand',
    path: '/calculator/maximum-demand',
    icon: Home,
    description: 'Calculate maximum demand with diversity'
  },
  {
    name: 'Illuminance',
    path: '/calculator/illuminance',
    icon: Lightbulb,
    description: 'Lighting design calculations'
  },
  {
    name: 'Building Regulations',
    path: '/calculator/building-regulations',
    icon: Shield,
    description: 'Part P compliance & building loads'
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <Calculator className={styles.logoIcon} />
          <span className={styles.logoText}>SparkyTools</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            <Home size={18} />
            Home
          </Link>
          
          <Link 
            href="/calculators" 
            className={`${styles.navLink} ${pathname === '/calculators' ? styles.active : ''}`}
          >
            <Calculator size={18} />
            All Calculators
          </Link>
          
          <div className={styles.dropdown}>
            <button className={styles.dropdownToggle}>
              <Calculator size={18} />
              Quick Access
            </button>
            <div className={styles.dropdownMenu}>
              {calculators.map((calc) => {
                const Icon = calc.icon;
                return (
                  <Link
                    key={calc.path}
                    href={calc.path}
                    className={`${styles.dropdownItem} ${pathname === calc.path ? styles.active : ''}`}
                  >
                    <Icon size={16} />
                    <div>
                      <div className={styles.calcName}>{calc.name}</div>
                      <div className={styles.calcDesc}>{calc.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.open : ''}`}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${pathname === '/' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            <Home size={20} />
            Home
          </Link>
          
          <Link 
            href="/calculators" 
            className={`${styles.mobileNavLink} ${pathname === '/calculators' ? styles.active : ''}`}
            onClick={closeMenu}
          >
            <Calculator size={20} />
            All Calculators
          </Link>
          
          <div className={styles.mobileSection}>
            <h3 className={styles.mobileSectionTitle}>Quick Access</h3>
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <Link
                  key={calc.path}
                  href={calc.path}
                  className={`${styles.mobileNavLink} ${pathname === calc.path ? styles.active : ''}`}
                  onClick={closeMenu}
                >
                  <Icon size={20} />
                  <div>
                    <div>{calc.name}</div>
                    <div className={styles.mobileDesc}>{calc.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className={styles.overlay} 
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  );
}
