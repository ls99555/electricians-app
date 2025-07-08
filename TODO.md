# SparkyTools - Development TODO List

## ⚠️ CRITICAL REQUIREMENTS - UK ELECTRICAL REGULATIONS COMPLIANCE

### 🇬🇧 MANDATORY UK STANDARDS COMPLIANCE
- **ALL calculations MUST reference UK electrical regulations (BS 7671)**
- **ALL calculations MUST include regulation section references in comments**
- **ALL calculations MUST include proper disclaimers**
- **ALL calculations MUST be based on current 18th Edition BS 7671**
- **ALL calculations MUST reference applicable British Standards (BS EN)**
- **NEVER copy regulation text directly - always paraphrase and reference**

### 🧪 MANDATORY TESTING REQUIREMENTS  
- **ALL calculation functions MUST have comprehensive unit tests**
- **ALL calculations MUST be tested with realistic real-world values**
- **ALL edge cases and boundary conditions MUST be tested**
- **ALL error handling and input validation MUST be tested**
- **ALL calculations MUST be verified against known reference values**
- **ALL tests MUST validate regulatory compliance**

### ⚖️ LEGAL COMPLIANCE REQUIREMENTS
- **ALL electrical calculations MUST include safety disclaimers**
- **ALL calculations MUST specify "guidance only" status**
- **ALL calculations MUST recommend qualified electrician consultation**
- **ALL calculations MUST reference professional liability limitations**
- **ALL calculations MUST comply with Building Regulations Part P**

## Project Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Configure SCSS modules and CSS variables
- [x] Set up PWA configuration with next-pwa
- [x] Create manifest.json for app installation
- [x] Set up project structure with feature-based folders
- [x] Create Copilot instructions for consistent development

## Core Infrastructure 🚧
- [x] Global CSS variables and SCSS mixins
- [x] Mobile-responsive design system
- [x] Basic electrical calculations library
- [x] **COMPLETED: Modular calculation structure (types, basic, load-demand, cable-protection, lighting, safety-testing, power-systems, renewable-energy)**
- [x] **COMPLETED: All calculations moved from electrical.ts to modular files**
- [x] **COMPLETED: All calculations reference UK regulations (BS 7671)**
- [x] **COMPLETED: Jest testing framework setup with comprehensive unit tests**
- [x] **COMPLETED: Basic calculations fully tested (26 passing tests)**
- [ ] **PRIORITY: Unit tests for remaining calculation modules**
- [ ] Service worker for offline functionality
- [ ] Error boundary components
- [ ] Loading states and skeletons
- [ ] Toast notification system
- [ ] Dark/light theme toggle

## Electrical Calculations ⚡
### Basic Calculations (Free)
- [x] Ohm's Law Calculator (V, I, R, P)
- [x] Voltage Drop Calculator (BS 7671 compliant)
- [x] Cable Sizing Calculator
- [x] Load Calculator with diversity factors
- [x] Conduit Fill Calculator
- [x] Three-phase calculations (balanced loads)
- [x] Power Factor Calculator
- [ ] Electrical Units Converter

### Load & Demand Calculations
- [x] Maximum Demand Calculator (domestic installations)
- [x] Diversity Factor Calculator (BS 7671 Table A1)
- [ ] Socket Outlet Load Assessment
- [ ] Lighting Load Calculator with diversity
- [x] Cooking Appliance Diversity (cookers, ovens)
- [ ] Water Heating Load Assessment
- [ ] Space Heating Load Calculator
- [ ] Air Conditioning Load Assessment
- [ ] Total Installation Load Calculator

### Lighting Calculations 💡
- [x] Illuminance Calculator (lux calculations)
- [ ] Luminous Flux Calculator (lumens)
- [ ] Room Index Calculator
- [ ] Utilisation Factor Calculator
- [ ] Maintenance Factor Calculator
- [x] Emergency Lighting Calculator
- [ ] LED Replacement Calculator
- [ ] Energy Efficiency Calculator (lumens per watt)
- [ ] Uniformity Ratio Calculator
- [ ] Glare Index Calculator
- [ ] lighting calculator based on domestic rooms of house 
- [ ] lighting calculator based on cdiffernet commerical and industrical settings 

### Cable & Protection Calculations
- [x] Cable Current Carrying Capacity (all installation methods)
- [x] Cable Derating Factors Calculator
- [x] Ambient Temperature Correction
- [x] Grouping Factor Calculator
- [x] Thermal Insulation Derating
- [x] Buried Cable Derating
- [ ] Cable Route Length Calculator
- [x] Protective Device Selection (MCB/RCBO sizing)
- [ ] Fuse Selection Calculator
- [ ] Cable Screen/Armour Sizing

### Earthing & Bonding Calculations
- [x] Earth Electrode Resistance Calculator
- [ ] Main Protective Bonding Conductor Sizing
- [ ] Supplementary Bonding Calculator
- [x] Earth Fault Loop Impedance (Zs) Calculator
- [ ] Prospective Fault Current Calculator
- [ ] Touch Voltage Calculator
- [ ] Step Voltage Calculator
- [ ] Lightning Protection Calculator

### Motor & Industrial Calculations
- [ ] Motor Starting Current Calculator
- [ ] Motor Full Load Current
- [ ] Motor Cable Sizing
- [ ] Star-Delta Starting Calculator
- [ ] Variable Frequency Drive (VFD) Sizing
- [ ] Motor Efficiency Calculator
- [ ] Power Factor Correction for Motors
- [ ] Motor Protection Settings

### EV Charging Calculations 🚗⚡
- [x] EV Charger Load Calculator
- [x] Domestic EV Charging Assessment
- [ ] Commercial EV Charging Station Design
- [ ] EV Charging Diversity Factors
- [x] Grid Connection Capacity for EV
- [ ] Fast Charging Power Requirements
- [x] EV Charging Cable Sizing
- [ ] Load Balancing for Multiple EV Points
- [x] EV Charging Circuit Protection

### Battery & Energy Storage Calculations 🔋
- [x] Battery Capacity Calculator (Ah to kWh)
- [x] Battery Backup Time Calculator
- [x] Solar Battery Sizing
- [x] Battery Charge/Discharge Rate
- [x] Battery Efficiency Calculator
- [x] Grid-Tied Battery System Sizing
- [x] Off-Grid Battery System Design
- [x] Battery Cable Sizing
- [x] Battery Room Ventilation Calculator
- [x] UPS Sizing Calculator

### Power Generation & Renewable Energy 🌞
- [x] Solar Panel Array Sizing
- [x] Solar Inverter Sizing
- [ ] Wind Turbine Power Calculator
- [ ] Generator Sizing Calculator
- [ ] Standby Generator Load Calculator
- [x] Grid-Tie System Calculator
- [ ] Feed-in Tariff Calculator
- [x] Energy Yield Calculator
- [ ] Carbon Footprint Reduction Calculator

### Maximum Capacity Calculations ⚡
- [ ] Service Head Maximum Demand
- [ ] Distribution Board Load Calculation
- [ ] Sub-Main Cable Capacity
- [ ] Ring Circuit Maximum Load
- [ ] Radial Circuit Capacity
- [ ] Three Phase Load Balancing
- [ ] Transformer Capacity Calculator
- [ ] Switchgear Rating Calculator
- [ ] Busbar Current Rating

### Safety & Testing Calculations 🛡️
- [x] RCD Operating Time Calculator
- [ ] Insulation Resistance Calculator
- [x] Loop Impedance Calculator (Ze, Zs, R1+R2)
- [ ] Continuity Test Calculator
- [ ] Polarity Test Results
- [ ] Phase Sequence Calculator
- [ ] Applied Voltage Test Calculator
- [ ] Functional Test Calculator

### Advanced Calculations (Premium) 💎
- [x] Fault Current Calculations (three-phase)
- [ ] Short Circuit Analysis
- [ ] Arc Fault Calculations
- [ ] Harmonics Analysis & THD
- [ ] Power Quality Assessment
- [ ] Voltage Regulation Calculator
- [ ] Load Flow Analysis
- [ ] Economic Analysis (cable sizing optimization)
- [ ] Energy Loss Calculator
- [x] Power Factor Correction Sizing

### Specialized Applications
- [ ] Fire Alarm System Calculations
- [ ] CCTV Power Requirements
- [ ] Data Center Power Calculations
- [ ] Swimming Pool & Spa Calculations
- [ ] Caravan & Marina Supply
- [ ] Agricultural Installation Calculations
- [ ] Temporary Supply Calculations
- [ ] Hazardous Area Calculations

### Building Regulations & Standards
- [ ] Part P Compliance Calculator
- [ ] Building Regulation Load Assessment
- [ ] Energy Performance Calculator
- [ ] Minimum Circuit Requirements
- [ ] Special Location Requirements
- [ ] Medical Location Calculations
- [ ] School/Educational Facility Calcs
- [ ] Care Home Electrical Assessment

### Cost & Economic Calculations 💰
- [ ] Installation Cost Estimator
- [ ] Energy Cost Calculator
- [ ] Payback Period Calculator
- [ ] Life Cycle Cost Analysis
- [ ] Energy Efficiency ROI
- [ ] Cable Cost Optimization
- [ ] Maintenance Cost Calculator
- [ ] Carbon Tax Calculator

## User Interface 🎨
- [x] Homepage with feature overview
- [x] Ohm's Law calculator page
- [ ] Voltage Drop calculator page
- [ ] Cable Sizing calculator page
- [ ] Navigation component with mobile menu
- [ ] Footer with legal information
- [ ] Search functionality
- [ ] Calculator history/favorites
- [ ] Print-friendly layouts

## Reference Tools 📚
### Cable & Conductor References
- [ ] Cable rating charts (BS 7671 Appendix 4)
- [ ] Cable current carrying capacity tables
- [ ] Cable derating factors (grouping, ambient temp, thermal insulation)
- [ ] Cable installation methods (Reference Methods A-F)
- [ ] Cable resistance and reactance values
- [ ] Cable voltage drop tables (mV/A/m)
- [ ] Armoured cable specifications
- [ ] Fire performance cable classifications

### Protection & Safety References
- [ ] Fuse/MCB selection guide
- [ ] RCD selection and types
- [ ] RCBO specifications
- [ ] Protective device characteristics (B, C, D curves)
- [ ] Maximum Zs values for protection
- [ ] Disconnection times (BS 7671 Chapter 41)
- [ ] Touch voltage limits
- [ ] Step voltage limits

### Installation & Environment
- [ ] IP rating guide (ingress protection)
- [ ] ATEX/hazardous area classifications
- [ ] Color code references (cables, resistors)
- [ ] Earthing arrangements (TN-S, TN-C-S, TT, IT)
- [ ] Special location requirements (bathrooms, swimming pools)
- [ ] External influences (environmental conditions)
- [ ] Ambient temperature corrections
- [ ] Altitude derating factors

### Standards & Regulations
- [ ] BS 7671 quick reference guide
- [ ] IET Guidance Notes summaries
- [ ] Part P Building Regulations
- [ ] BS EN standards references
- [ ] Health & Safety regulations
- [ ] CDM regulations for electrical work
- [ ] Inspection and testing requirements
- [ ] Certificate templates and guidance

### Load & Diversity References
- [ ] Diversity factors table (BS 7671 Appendix A)
- [ ] Maximum demand calculations
- [ ] Socket outlet diversity
- [ ] Lighting diversity factors
- [ ] Cooking appliance diversity
- [ ] Standard appliance ratings
- [ ] Electric vehicle charging rates
- [ ] Renewable energy system data

### Testing & Measurement
- [ ] Test instrument requirements
- [ ] Test sequence procedures
- [ ] Acceptable test results
- [ ] Remedial action guidance
- [ ] Test record templates
- [ ] Periodic inspection intervals
- [ ] Visual inspection checklist
- [ ] Thermal imaging interpretation

### Emergency & Safety Systems
- [ ] Emergency lighting requirements
- [ ] Fire alarm system standards
- [ ] Security system power requirements
- [ ] Generator and UPS specifications
- [ ] Safety signs and symbols
- [ ] Personal protective equipment guide
- [ ] First aid electrical procedures
- [ ] Emergency isolation procedures

### EV Charging References 🚗
- [ ] EV charging standards (IEC 61851)
- [ ] EV connector types and ratings
- [ ] EV charging modes (1-4)
- [ ] Smart charging requirements
- [ ] EV charging diversity factors
- [ ] Grid connection requirements
- [ ] EV charging cable specifications
- [ ] Load balancing standards

### Renewable Energy References 🌞
- [ ] Solar panel specifications
- [ ] Inverter ratings and types
- [ ] Grid connection requirements
- [ ] Feed-in tariff rates
- [ ] Battery storage regulations
- [ ] Wind turbine specifications
- [ ] Microgeneration standards
- [ ] Export limitation requirements

### Lighting References 💡
- [ ] Luminaire classifications
- [ ] Lamp types and specifications
- [ ] Light output ratios
- [ ] Color rendering index (CRI)
- [ ] Color temperature guide
- [ ] Lighting control systems
- [ ] Emergency lighting standards
- [ ] Energy efficiency requirements

## Testing & Measurement Tools 🔧
### Basic Testing Tools
- [ ] Test result logger with templates
- [ ] Basic certificate templates (EIC, EICR, Minor Works)
- [ ] Measurement unit converters
- [ ] Test sequence planner
- [ ] Visual inspection checklist
- [ ] Test equipment calibration tracker

### Electrical Testing Calculators
- [ ] Resistance/impedance calculator
- [ ] Loop impedance calculator (Ze, Zs, R1+R2)
- [ ] RCD test calculator (operating time/current)
- [ ] Insulation resistance calculator
- [ ] Continuity test calculator
- [ ] Polarity test checker
- [ ] Phase sequence calculator
- [ ] Applied voltage test calculator

### Advanced Testing Tools
- [ ] Earth electrode resistance calculator
- [ ] Prospective fault current calculator
- [ ] Harmonic distortion analyzer
- [ ] Power quality assessment tool
- [ ] Phase angle measurement
- [ ] Frequency measurement calculator
- [ ] Power measurement calculator (kW, kVA, kVAr)
- [ ] Energy consumption calculator

### Test Results Analysis
- [ ] Test results comparison tool
- [ ] Trending analysis for periodic testing
- [ ] Deterioration assessment calculator
- [ ] Risk assessment based on test results
- [ ] Remedial action prioritizer
- [ ] Compliance checker against standards
- [ ] Test result validation tool
- [ ] Statistical analysis of test data

### Specialized Testing
- [ ] Solar panel testing calculator
- [ ] Battery testing analyzer
- [ ] Motor testing calculator
- [ ] Transformer testing tool
- [ ] Cable fault location calculator
- [ ] Thermal imaging analysis
- [ ] Vibration analysis tool
- [ ] Noise level calculator

### Portable Appliance Testing (PAT)
- [ ] PAT testing scheduler
- [ ] Appliance classification guide
- [ ] PAT test result recorder
- [ ] Label generation tool
- [ ] Risk assessment calculator
- [ ] Re-test interval calculator
- [ ] PAT database manager
- [ ] Compliance reporting tool

### Installation Testing
- [ ] New installation test sequence
- [ ] Addition/alteration testing guide
- [ ] Periodic inspection planner
- [ ] Emergency lighting test tracker
- [ ] Fire alarm system tester
- [ ] RCD testing scheduler
- [ ] Surge protection device tester
- [ ] Earthing system integrity checker

## Premium Features 💎
- [ ] User authentication system
- [ ] Subscription management (Stripe integration)
- [ ] Cloud backup and sync
- [ ] EIC certificate generator
- [ ] EICR certificate generator
- [ ] Minor Works certificate generator
- [ ] Photo documentation with annotations
- [ ] Job management system
- [ ] Client database
- [ ] Quote generator
- [ ] Invoice templates
- [ ] Material cost calculator
- [ ] Time tracking
- [ ] Profit margin calculator
- [ ] CAD-style circuit diagrams
- [ ] Load scheduling
- [ ] Energy audit tools

## Legal & Compliance ⚖️
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Cookie policy
- [ ] GDPR compliance
- [ ] Disclaimer on all calculation pages
- [ ] BS 7671 reference guidelines
- [ ] Professional liability disclaimers
- [ ] Age verification for professional tools

## Advertising & Monetization 💰
- [ ] Google AdSense integration
- [ ] Non-intrusive ad placement strategy
- [ ] Ad-free premium experience
- [ ] Affiliate marketing setup (tool vendors)
- [ ] Sponsored content framework
- [ ] Analytics integration (Google Analytics)
- [ ] Conversion tracking
- [ ] A/B testing framework

## Performance & Optimization ⚡
- [ ] Image optimization and compression
- [ ] Code splitting and lazy loading
- [ ] Bundle size optimization
- [ ] Lighthouse performance audit
- [ ] Core Web Vitals optimization
- [ ] Cache strategies
- [ ] Database optimization (when added)
- [ ] CDN setup for static assets

## Testing & Quality Assurance 🧪
- [ ] Unit tests for calculation functions (MANDATORY for each calculation)
- [ ] UK regulation compliance testing (BS 7671 verification)
- [ ] Integration tests for UI components
- [ ] E2E tests for critical user flows
- [ ] Calculation accuracy validation against known values
- [ ] Edge case and boundary condition testing
- [ ] Input validation and error handling tests
- [ ] Accessibility testing (WCAG compliance)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Regulatory compliance verification tests

## Deployment & DevOps 🚀
- [ ] GitHub Actions CI/CD pipeline
- [ ] Automated testing on PR
- [ ] Automated deployment to staging
- [ ] Production deployment pipeline
- [ ] Environment variable management
- [ ] Error logging and monitoring
- [ ] Performance monitoring
- [ ] Backup strategies

## Documentation 📖
- [x] Development guidelines (Copilot instructions)
- [ ] API documentation
- [ ] User guide/help system
- [ ] Installation instructions
- [ ] Troubleshooting guide
- [ ] Contributor guidelines
- [ ] Change log
- [ ] README updates

## SEO & Marketing 📈
- [ ] Meta tags optimization
- [ ] Structured data markup
- [ ] Sitemap generation
- [ ] Robots.txt configuration
- [ ] Google Search Console setup
- [ ] Social media meta tags
- [ ] Blog/content marketing strategy
- [ ] Link building strategy

## Security 🔒
- [ ] Input validation and sanitization
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Secure headers configuration
- [ ] Content Security Policy
- [ ] SSL/TLS configuration
- [ ] Regular security audits

## Maintenance & Updates 🔄
- [ ] Dependency update schedule
- [ ] Security patch management
- [ ] Feature request tracking
- [ ] Bug report system
- [ ] User feedback collection
- [ ] Regular BS 7671 regulation updates
- [ ] Calculation accuracy verification
- [ ] Performance monitoring

## Future Enhancements 🚀
- [ ] Native mobile app (React Native)
- [ ] Offline-first architecture
- [ ] Voice input for calculations
- [ ] AR features for measurement
- [ ] Integration with electrical design software
- [ ] Multi-language support
- [ ] Custom branding for electrical companies
- [ ] White-label solutions
- [ ] API for third-party integrations
- [ ] Machine learning for recommendations

## Priority Levels
- 🔥 **Critical** - Must have for launch
- ⚡ **High** - Important for user experience
- 📋 **Medium** - Nice to have features
- 🎯 **Low** - Future considerations

## Next Immediate Steps
1. **Complete voltage drop calculator page** (BS 7671 compliant)
2. **Add navigation component** with mobile menu
3. **Implement maximum demand calculator** for domestic installations
4. **Create illuminance/lighting calculator** with lux calculations
5. **Build EV charger load calculator** (high demand feature)
6. **Add cable sizing with all derating factors**
7. **Implement service worker** for offline mode
8. **Create reference charts section** starting with cable ratings
9. **Set up error boundaries** and loading states
10. **Add unit tests** for calculation functions

## Immediate Priority Calculations (Next 2 Weeks)
### 🔥 Critical for MVP Launch
1. **Maximum Demand Calculator** - domestic installations with diversity
2. **Illuminance Calculator** - lux calculations for lighting design
3. **EV Charger Assessment** - load calculation for domestic EV points
4. **Cable Derating Calculator** - all factors (grouping, ambient, thermal)
5. **Loop Impedance Calculator** - Ze, Zs, R1+R2 calculations

### ⚡ High Priority (Next Month)
1. **Solar Panel Sizing Calculator** - increasingly demanded
2. **Battery Storage Calculator** - growing market
3. **RCD Selection Tool** - safety compliance
4. **Motor Load Calculator** - commercial applications
5. **Emergency Lighting Calculator** - regulatory requirement

### 📋 Medium Priority (Next Quarter)
1. **Load Flow Analysis** - advanced premium feature
2. **Harmonic Analysis** - power quality assessment
3. **Economic Analysis** - cost optimization tools
4. **Energy Efficiency Calculator** - environmental compliance
5. **Fault Current Analysis** - advanced safety calculations
