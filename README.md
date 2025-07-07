# SparkyTools - Professional Electrician's Toolkit

![SparkyTools Logo](public/icons/icon-192x192.png)

A comprehensive, mobile-responsive Progressive Web App (PWA) designed specifically for electricians in the UK. SparkyTools provides electrical calculations, reference charts, and professional tools based on BS 7671 regulations.

## 🔧 Features

### Free Tools (Ad-Supported)
- **Electrical Calculations**
  - Ohm's Law Calculator (V, I, R, P)
  - Voltage Drop Calculator (BS 7671 compliant)
  - Cable Sizing Calculator
  - Load Calculations with Diversity Factors
  - Conduit Fill Calculator

- **Reference Charts**
  - Cable Rating Charts
  - IP Rating Guide
  - Color Code References
  - Fuse/MCB Selection Guide
  - Installation Method Factors

- **Testing Tools**
  - Test Result Logger
  - Basic Certificate Templates
  - Unit Converters

### Premium Features (Subscription)
- **Advanced Calculations**
  - Fault Current Calculations
  - Earthing Calculations
  - Motor Starting Calculations
  - Power Factor Correction
  - Harmonics Analysis

- **Professional Tools**
  - EIC Certificate Generator
  - EICR Certificate Generator
  - Minor Works Certificates
  - Cloud Backup & Sync
  - Job Management System
  - Photo Documentation

- **Business Tools**
  - Quote Generator
  - Invoice Templates
  - Client Database
  - Time Tracking
  - Profit Margin Calculator

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: SCSS Modules with CSS Variables
- **PWA**: next-pwa for offline functionality
- **Icons**: Lucide React
- **Animations**: Framer Motion
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
