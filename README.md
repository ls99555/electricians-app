# SparkyTools - Professional Electrician's Toolkit

![SparkyTools Logo](public/icons/icon-192x192.png)

A comprehensive, mobile-responsive Progressive Web App (PWA) designed specifically for electricians in the UK. SparkyTools provides electrical calculations, reference charts, and professional tools based on BS 7671 regulations.

## 🔧 Current Implementation Status

### ✅ FULLY COMPLETED Electrical Calculations (490+ Passing Tests)

#### Comprehensive Calculation Library - ALL IMPLEMENTED ✅
- ✅ **Basic Calculations** (8 calculators): Ohm's Law, Voltage Drop, Cable Sizing, Load with Diversity, Conduit Fill, Three-phase, Power Factor, Units Converter
- ✅ **Load & Demand Calculations** (9 calculators): Maximum Demand, Diversity Factors, Socket Assessment, Lighting Load, Cooking Appliance, Water/Space Heating, Air Conditioning, Total Installation Load
- ✅ **Lighting Calculations** (12 calculators): Illuminance, Luminous Flux, Room Index, Utilisation Factor, Maintenance Factor, Emergency Lighting, LED Replacement, Energy Efficiency, Uniformity Ratio, Glare Index, Domestic Rooms, Commercial/Industrial Settings
- ✅ **Cable & Protection Calculations** (10 calculators): Current Carrying Capacity, Derating Factors, Ambient Temperature Correction, Grouping Factor, Thermal Insulation, Buried Cable, Route Length, Protective Device Selection, Fuse Selection, Screen/Armour Sizing
- ✅ **Earthing & Bonding Calculations** (8 calculators): Earth Electrode Resistance, Main/Supplementary Bonding, Loop Impedance (Zs), Prospective Fault Current, Touch/Step Voltage, Lightning Protection
- ✅ **Motor & Industrial Calculations** (8 calculators): Motor Starting Current, Full Load Current, Cable Sizing, Star-Delta Starting, VFD Sizing, Efficiency, Power Factor Correction, Protection Settings
- ✅ **EV Charging Calculations** (9 calculators): Charger Load, Domestic/Commercial Assessment, Diversity Factors, Grid Connection Capacity, Fast Charging, Cable Sizing, Load Balancing, Circuit Protection
- ✅ **Battery & Energy Storage** (10 calculators): Capacity (Ah to kWh), Backup Time, Solar Battery Sizing, Charge/Discharge Rate, Efficiency, Grid-Tied/Off-Grid Systems, Cable Sizing, Ventilation, UPS Sizing
- ✅ **Renewable Energy Systems** (9 calculators): Solar Panel Array Sizing, Inverter Sizing, Wind Turbine Power, Generator Sizing, Standby Generator Load, Grid-Tie System, Feed-in Tariff, Energy Yield, Carbon Footprint Reduction
- ✅ **Capacity Calculations** (9 calculators): Service Head Maximum Demand, Distribution Board Load, Sub-Main Cable Capacity, Ring/Radial Circuit Capacity, Three Phase Load Balancing, Transformer Capacity, Switchgear Rating, Busbar Current Rating
- ✅ **Safety & Testing Calculations** (10 calculators): RCD Operating Time, Insulation Resistance, Loop Impedance, Continuity Test, Polarity Test, Phase Sequence, Applied Voltage Test, Functional Test, Earth Electrode Resistance, Fault Current
- ✅ **Advanced Calculations** (10 calculators): Fault Current (three-phase), Short Circuit Analysis (BS EN 60909), Voltage Regulation (BS 7671 & BS EN 50160), Harmonics Analysis & THD (BS EN 61000), Arc Fault (BS 7909), Power Quality Assessment (BS EN 50160), Load Flow Analysis, Economic Analysis, Energy Loss Calculator, Power Factor Correction Sizing
- ✅ **Specialized Applications** (8 calculators): Fire Alarm System, CCTV Power Requirements, Data Center Power, Swimming Pool & Spa, Caravan & Marina Supply, Agricultural Installations, Temporary Supply, Hazardous Area Calculations
- ✅ **Building Regulations & Standards** (4 calculators): Part P Compliance, Building Regulation Load Assessment, Energy Performance, Minimum Circuit Requirements

### 🎨 User Interface - MOSTLY COMPLETE ✅
- ✅ **Homepage** with feature overview and professional design
- ✅ **Ohm's Law Calculator Page** with comprehensive UI
- ✅ **Voltage Drop Calculator Page** with BS 7671 compliance
- ✅ **Cable Sizing Calculator Page** with derating factors
- ✅ **Navigation Component** with mobile-responsive menu
- ✅ **Professional Footer** with legal disclaimers and compliance info
- ⏳ Search functionality (planned)
- ⏳ Calculator history/favorites (planned)
- ⏳ Print-friendly layouts (planned)

### 🚧 Currently In Development
- 🔄 Reference Tools: Cable rating charts, protection guides, installation references
- 🔄 Additional UI Pages: Individual calculator pages for remaining modules
- 🔄 Building Regulations: Special location requirements, medical locations

### 📊 Testing & Quality Assurance
- ✅ **466 Comprehensive Unit Tests** - All passing, zero skipped
- ✅ **UK Regulation Compliance Testing** - All calculations validated against BS 7671:2018+A2:2022
- ✅ **Edge Case & Boundary Testing** - Robust error handling and input validation
- ✅ **Real-World Scenario Testing** - Calculations tested with realistic professional values
- ✅ **Regulatory Compliance Verification** - All calculations include proper BS 7671 references

### 🔒 Legal & Compliance Features
- ✅ **Professional Disclaimers** on all calculations
- ✅ **BS 7671:2018+A2:2022 (18th Edition) References** throughout
- ✅ **Building Regulations Part P Compliance** calculator
- ✅ **Safety Warnings** and professional recommendations
- ✅ **Regulation Section References** in calculation comments

### 🎯 Planned Features (Roadmap)

#### Premium Features (Subscription) �
- **Professional Tools** (Planned)
  - EIC Certificate Generator
  - EICR Certificate Generator
  - Minor Works Certificates
  - Cloud Backup & Sync
  - Job Management System
  - Photo Documentation

- **Business Tools** (Planned)
  - Quote Generator
  - Invoice Templates
  - Client Database
  - Time Tracking
  - Profit Margin Calculator

#### Reference Tools (In Development) 📚
- Cable Rating Charts (BS 7671 Appendix 4)
- IP Rating Guide
- Color Code References
- Fuse/MCB Selection Guide
- Installation Method Factors
- Testing & Measurement Tools
- Standards & Regulations Quick Reference

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: SCSS Modules with CSS Variables
- **PWA**: next-pwa for offline functionality
- **Icons**: Lucide React
- **Testing**: Jest with comprehensive unit tests (466 tests)
- **Compliance**: BS 7671:2018+A2:2022 (18th Edition) based calculations
- **Deployment**: Vercel (planned)

## 📱 Progressive Web App

SparkyTools is built as a PWA, providing:
- **Offline Functionality**: Core calculations work without internet
- **Mobile Installation**: Add to home screen on mobile devices
- **Native App Experience**: Full-screen mode, splash screen
- **Automatic Updates**: Background updates when online

## 🛡️ Legal Compliance

### Disclaimers
All calculations are provided for guidance only. Professional electrical work must be carried out by qualified electricians in accordance with current UK regulations.

### Regulation Compliance
- References BS 7671:2018+A2:2022 (18th Edition IET Wiring Regulations)
- Calculations based on standard values and methods
- Regular updates to reflect regulation changes
- Clear disclaimers on all calculation tools

### Data Protection
- GDPR compliant data handling
- No personal data stored for free users
- Encrypted cloud storage for premium users
- Clear privacy policy and cookie notice

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── calculator/         # Calculation tools
│   ├── reference/          # Reference charts
│   ├── tools/             # Testing tools
│   └── premium/           # Premium features
├── components/            # Reusable UI components
├── lib/                   # Utility functions
│   ├── calculations/      # Electrical calculation logic
│   ├── constants/         # BS 7671 reference data
│   └── utils/            # Helper functions
├── styles/               # Global SCSS and variables
└── types/               # TypeScript type definitions
```

## 🎨 Design System

### CSS Variables
All styling uses CSS variables for consistency and theme support:
- Colors (primary, secondary, success, warning, error)
- Typography (font families, sizes, weights)
- Spacing (xs, sm, md, lg, xl, 2xl, 3xl)
- Borders and shadows
- Breakpoints for responsive design

### SCSS Mixins
Reusable mixins for common patterns:
- Responsive breakpoints
- Button styles
- Form inputs
- Flexbox utilities
- Grid layouts

## 🧮 Calculation Library

### Ohm's Law Calculator
```typescript
import { OhmLawCalculator } from '@/lib/calculations/electrical';

const result = OhmLawCalculator.calculate({
  voltage: 230,
  current: 10
});
// Returns: { voltage: 230, current: 10, resistance: 23, power: 2300 }
```

### Voltage Drop Calculator
```typescript
import { VoltageDropCalculator } from '@/lib/calculations/electrical';

const result = VoltageDropCalculator.calculate(
  10,      // current in amps
  50,      // length in meters
  '2.5',   // cable size in mm²
  230,     // supply voltage
  'power'  // circuit type
);
```

### Cable Sizing Calculator
```typescript
import { CableSizingCalculator } from '@/lib/calculations/electrical';

const result = CableSizingCalculator.calculate(
  20,              // design current
  30,              // cable length
  'clipped_direct', // installation method
  'power',         // circuit type
  'thermoplastic'  // cable type
);
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/sparky-tools.git
cd sparky-tools

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=your-google-analytics-id
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## 🧪 Testing

### Running Tests
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run end-to-end tests
```

### Test Coverage
- Unit tests for all calculation functions
- Integration tests for UI components
- E2E tests for critical user workflows
- Accessibility testing

## 📈 Performance

### Optimization Features
- Code splitting with Next.js dynamic imports
- Image optimization with next/image
- SCSS modules for CSS optimization
- Service worker caching for offline performance
- Lazy loading for non-critical resources

### Lighthouse Scores (Target)
- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100
- PWA: 100

## 🔐 Security

### Security Measures
- Input validation and sanitization
- XSS protection with Next.js built-ins
- CSRF protection for forms
- Secure headers configuration
- Regular dependency updates
- Security audits with npm audit

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 📋 Contributing

### Development Guidelines
1. Follow the coding instructions in `.github/copilot-instructions.md`
2. Use TypeScript for all new code
3. Write SCSS modules for styling with CSS variables
4. Include unit tests for calculation functions
5. Ensure mobile responsiveness
6. Add proper error handling
7. Include legal disclaimers for calculations

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Disclaimers

### Electrical Safety
- All electrical work must be carried out by qualified electricians
- Calculations are for guidance only and should not replace professional judgment
- Always consult current regulations and standards
- Regular updates ensure compliance with latest BS 7671 amendments

### Professional Responsibility
- Users are responsible for verifying calculation accuracy
- Professional liability insurance recommended for commercial use
- Regular competency assessments advised
- Stay updated with regulation changes

## 📞 Support

### Getting Help
- Check the [FAQ](docs/FAQ.md)
- Search existing [Issues](https://github.com/yourusername/sparky-tools/issues)
- Create new issue for bugs or feature requests
- Email support: support@sparkytoolsuk.com

### Commercial Support
- Premium support available for subscribers
- Custom feature development
- White-label solutions for electrical companies
- Training and implementation assistance

## 🗺️ Roadmap

### Q1 2025
- Complete core calculation tools
- Reference charts implementation
- Basic testing tools
- PWA optimization

### Q2 2025
- Premium features launch
- User authentication
- Certificate generators
- Mobile app release

### Q3 2025
- Advanced calculations
- Business tools
- API development
- Third-party integrations

### Q4 2025
- Machine learning features
- AR measurement tools
- Multi-language support
- Enterprise solutions

---

**Made with ⚡ for UK Electricians**

*SparkyTools - Your Professional Electrical Toolkit*

## 🎯 SEO Strategy & Page Structure

### Multi-Page Architecture for SEO Optimization
SparkyTools implements a dedicated page structure where each calculator category has its own optimized page:

- **Homepage**: Project introduction with search functionality
- **Calculator Hub**: Overview of all calculators organized by category
- **Individual Calculator Pages**: Dedicated pages for each calculation type
- **Consistent Navigation**: Easy movement between calculators with back buttons

### Calculator Categories (Each with Dedicated Pages)
1. **Basic Calculations** - Ohm's Law, Voltage Drop, Cable Sizing
2. **Load & Demand** - Maximum Demand, Diversity Factors, Socket Assessment
3. **Lighting Calculations** - Illuminance, Luminous Flux, Emergency Lighting
4. **Cable & Protection** - Current Capacity, Derating, Protective Devices
5. **Earthing & Bonding** - Earth Electrode, Loop Impedance, Fault Current
6. **Motor & Industrial** - Motor Starting, VFD Sizing, Efficiency
7. **EV Charging** - Charger Load, Grid Assessment, Cable Sizing
8. **Battery & Energy Storage** - Capacity, Backup Time, Solar Integration
9. **Renewable Energy** - Solar Sizing, Inverter Selection, Grid-Tie
10. **Safety & Testing** - RCD Selection, Loop Impedance, Continuity

Each page is optimized for specific electrical calculation keywords and provides comprehensive BS 7671 compliance information.
