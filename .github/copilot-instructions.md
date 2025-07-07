# SparkyTools - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
SparkyTools is a comprehensive electrician's toolkit app built with Next.js, TypeScript, and SCSS modules. The app provides electrical calculations based on UK regulations, offline PWA capabilities, and both free (ad-supported) and premium subscription features.

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

### Secturity
-implimemnt strong Secturity
