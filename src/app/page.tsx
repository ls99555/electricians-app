import Link from 'next/link';
import { Calculator, BookOpen, Zap, Shield, Wrench, FileText } from 'lucide-react';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              <Zap className={styles.icon} />
              SparkyTools
            </h1>
            <p className={styles.subtitle}>
              Professional electrician's toolkit with UK regulation-compliant calculations
            </p>
            <p className={styles.disclaimer}>
              <Shield className={styles.disclaimerIcon} />
              All calculations are for guidance only. Professional electrical work must be carried out by qualified electricians.
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Available Tools</h2>
          
          <div className={styles.featureGrid}>
            <Link href="/calculator" className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Calculator />
              </div>
              <h3>Electrical Calculations</h3>
              <p>Ohm's Law, voltage drop, cable sizing, and load calculations based on BS 7671</p>
              <span className={styles.badge}>Free</span>
            </Link>

            <Link href="/reference" className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <BookOpen />
              </div>
              <h3>Reference Charts</h3>
              <p>Cable ratings, IP ratings, color codes, and quick reference guides</p>
              <span className={styles.badge}>Free</span>
            </Link>

            <Link href="/tools" className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Wrench />
              </div>
              <h3>Testing Tools</h3>
              <p>Test result logger, basic certificate templates, and measurement converters</p>
              <span className={styles.badge}>Free</span>
            </Link>

            <div className={styles.featureCard + ' ' + styles.premium}>
              <div className={styles.featureIcon}>
                <FileText />
              </div>
              <h3>Certificates & Reports</h3>
              <p>Generate EIC, EICR, and Minor Works certificates with cloud backup</p>
              <span className={styles.badge + ' ' + styles.premiumBadge}>Premium</span>
            </div>
          </div>
        </section>

        <section className={styles.quickStart}>
          <h2 className={styles.sectionTitle}>Quick Start</h2>
          <div className={styles.quickStartGrid}>
            <Link href="/calculator/ohms-law" className={styles.quickStartCard}>
              <h4>Ohm's Law Calculator</h4>
              <p>Calculate voltage, current, resistance, or power</p>
            </Link>
            <Link href="/calculator/voltage-drop" className={styles.quickStartCard}>
              <h4>Voltage Drop Calculator</h4>
              <p>Check compliance with BS 7671 voltage drop limits</p>
            </Link>
            <Link href="/calculator/cable-sizing" className={styles.quickStartCard}>
              <h4>Cable Sizing</h4>
              <p>Find the right cable size for your installation</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2025 SparkyTools. All calculations reference BS 7671:2018+A2:2022.</p>
          <p>Always consult current regulations and qualified professionals for electrical work.</p>
        </div>
      </footer>
    </div>
  );
}
