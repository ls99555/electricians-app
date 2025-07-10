'use client';

import Link from 'next/link';
import { AlertTriangle, BookOpen, Scale, Shield } from 'lucide-react';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          
          {/* Company Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>SparkyTools</h3>
            <p className={styles.description}>
              Professional electrical calculation tools for UK electricians, 
              based on BS 7671:2018+A2:2022 (18th Edition IET Wiring Regulations).
            </p>
            <div className={styles.standards}>
              <span className={styles.standardBadge}>
                <BookOpen size={16} />
                BS 7671:2018+A2:2022
              </span>
              <span className={styles.standardBadge}>
                <Shield size={16} />
                Part P Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link href="/calculators">All Calculators</Link></li>
              <li><Link href="/calculator/ohms-law">Ohm&apos;s Law</Link></li>
              <li><Link href="/calculator/voltage-drop">Voltage Drop</Link></li>
              <li><Link href="/calculator/cable-sizing">Cable Sizing</Link></li>
              <li><Link href="/calculator/maximum-demand">Maximum Demand</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Resources</h4>
            <ul className={styles.linkList}>
              <li><a href="https://electrical.theiet.org/" target="_blank" rel="noopener noreferrer">IET Wiring Regulations</a></li>
              <li><a href="https://www.gov.uk/building-regulations-approval" target="_blank" rel="noopener noreferrer">Building Regulations</a></li>
              <li><a href="https://www.hse.gov.uk/electricity/" target="_blank" rel="noopener noreferrer">HSE Electrical Safety</a></li>
              <li><a href="https://www.niceic.com/" target="_blank" rel="noopener noreferrer">NICEIC</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Use</Link></li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimers */}
        <div className={styles.disclaimers}>
          <div className={styles.disclaimer}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <div className={styles.disclaimerText}>
              <h5>Important Legal Notice</h5>
              <p>
                All calculations provided are for guidance only and must not replace professional 
                electrical design or compliance verification. Users must verify all calculations 
                against current regulations and standards.
              </p>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Scale size={20} className={styles.warningIcon} />
            <div className={styles.disclaimerText}>
              <h5>Professional Responsibility</h5>
              <p>
                Electrical installation work must only be undertaken by competent persons in 
                accordance with BS 7671 and Building Regulations Part P. This tool does not 
                constitute electrical design certification.
              </p>
            </div>
          </div>

          <div className={styles.disclaimer}>
            <Shield size={20} className={styles.warningIcon} />
            <div className={styles.disclaimerText}>
              <h5>Liability Limitation</h5>
              <p>
                While every effort is made to ensure accuracy, no warranty is provided for 
                calculations. Users are responsible for verification and compliance with all 
                applicable regulations and standards.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <p>&copy; 2025 SparkyTools. All rights reserved.</p>
            <p>Based on BS 7671:2018+A2:2022 (18th Edition IET Wiring Regulations)</p>
          </div>
          <div className={styles.certifications}>
            <span className={styles.certification}>Always consult qualified electricians</span>
            <span className={styles.certification}>Verify with current regulations</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
