# SparkyTools - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
SparkyTools is a comprehensive electrician's toolkit app built with Next.js, TypeScript, and SCSS modules. The app provides electrical calculations based on UK regulations, offline PWA capabilities, and both free (ad-supported) and premium subscription features.

## ⚠️ CRITICAL COMPLIANCE REQUIREMENTS

### 🇬🇧 UK ELECTRICAL REGULATIONS - ABSOLUTE REQUIREMENTS
- **EVERY calculation MUST reference specific BS 7671 regulation sections**
- **EVERY calculation MUST include regulation compliance validation**
- **EVERY calculation MUST include safety disclaimers and professional recommendations**
- **EVERY calculation file MUST include regulation reference comments**
- **NEVER copy official regulation text - always paraphrase and reference**
- **ALL calculations MUST comply with current 18th Edition BS 7671**
- **ALL calculations MUST reference applicable IET Guidance Notes**
- **ALL calculations MUST include Building Regulations Part P compliance where applicable**

### 🧪 MANDATORY TESTING REQUIREMENTS - NON-NEGOTIABLE
- **EVERY calculation function MUST have comprehensive unit tests before implementation**
- **EVERY test MUST validate against known UK standard values**
- **EVERY test MUST include realistic real-world scenarios**
- **EVERY test MUST validate edge cases and boundary conditions**
- **EVERY test MUST verify input validation and error handling**
- **EVERY test MUST check regulatory compliance**
- **NO calculation function may be committed without complete test coverage**

### ⚖️ LEGAL COMPLIANCE - MANDATORY FOR ALL CODE
- **EVERY calculation page MUST include professional liability disclaimers**
- **EVERY calculation MUST specify "guidance only" and recommend qualified electrician**
- **EVERY calculation MUST reference that electrical work requires competent person**
- **ALL calculations MUST comply with professional indemnity requirements**

## Development Guidelines

### Styling Rules
- **ALWAYS use SCSS modules** for component styling
- **ALWAYS use SCSS variables** with var() syntax
- All styling must be mobile-responsive first
- Use semantic class names and BEM methodology where appropriate
- use button module not html modules always update button module to work with code.
- Colors, spacing, and typography must be defined as CSS variables in global variables file

### Code Structure
- Use TypeScript strictly with proper type definitions
- Components should be functional with React hooks
- Follow Next.js App Router patterns
- All calculations must include proper error handling and validation
- Reference UK electrical regulations (BS 7671) but never copy text directly
- All calculations must be modular and organized by category
- Include comprehensive unit tests for all calculation functions

### UK Electrical Regulations Compliance
- **ALWAYS base calculations on UK standards**: BS 7671 (18th Edition), IET Guidance Notes
- Reference specific regulation sections in calculation comments
- Include proper disclaimers on all calculation pages
- Ensure calculations comply with Building Regulations Part P
- Reference applicable British Standards (BS EN standards)
- Include safety warnings and professional recommendations
- Never override or contradict official regulations

### Testing Requirements
- **MANDATORY**: Write unit tests for every calculation function
- Test edge cases, boundary conditions, and error scenarios
- Validate calculation accuracy against known values
- Test input validation and error handling
- Include integration tests for calculator UI components
- Verify regulatory compliance in test cases
- Test calculations with realistic real-world values

### Legal Compliance
- Never copy regulation text directly - always paraphrase and reference
- Include disclaimers for all calculations
- Ensure all electrical calculations are clearly marked as guidance only
- Professional electrical work must always be done by qualified electricians

### File Organization
- Group related functionality in feature-based folders
- Separate free and premium features clearly
- Keep calculation logic in dedicated utility functions
- Use barrel exports for clean imports

### Offline & PWA
- All core calculations must work offline
- Cache critical resources for offline use
- Implement proper service worker patterns
- Progressive enhancement for online features

### Advertising & Premium Features
- Implement non-intrusive advertising placement
- Clear separation between free and premium features
- Graceful degradation when premium features are not available
- Respect user experience in ad placement

### Security
- Implement strong security measures
- Validate all user inputs and sanitize data
- Use secure authentication and authorization
- Protect against common web vulnerabilities (XSS, CSRF, etc.)
- Secure API endpoints and data transmission
- Regular security audits and dependency updates
