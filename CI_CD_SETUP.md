# CI/CD Setup & Quality Assurance

This document outlines the comprehensive CI/CD pipeline and quality assurance setup for the Restaurant POS application.

## 🚀 GitHub Actions Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests

**Jobs:**

- **Lint & Format Check**: ESLint, Prettier, TypeScript validation
- **Build & Test**: Application build and test execution
- **Security Audit**: npm audit for vulnerability scanning
- **Database Schema Check**: Prisma schema validation
- **Code Coverage**: Test coverage reporting (if tests exist)

### 2. Pull Request Quality Check (`.github/workflows/pr-quality-check.yml`)

**Triggers:** Pull Requests to `main`/`develop` branches

**Jobs:**

- **Code Quality Check**: Fast quality validation
- **Build Check**: Ensures application builds successfully

## 🛠️ Code Quality Tools

### ESLint Configuration

Enhanced ESLint rules for:

- TypeScript-specific linting
- React best practices
- Import organization
- Code formatting consistency
- Security best practices

**Key Rules:**

- `@typescript-eslint/no-unused-vars`: Error on unused variables
- `@typescript-eslint/no-explicit-any`: Warning on `any` types
- `no-console`: Warning on console statements
- `import/order`: Enforce import organization

### Prettier Configuration

Consistent code formatting with:

- Single quotes
- 2-space indentation
- 80-character line length
- Trailing commas
- Consistent spacing

### TypeScript Configuration

Strict type checking with:

- `noEmit`: Type checking without output
- Strict mode enabled
- Path mapping for clean imports

## 📋 Available Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Quality Assurance Scripts

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# TypeScript type checking
npm run type-check

# Watch mode for TypeScript
npm run type-check:watch
```

### Testing Scripts

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### CI/CD Scripts

```bash
# Run all quality checks (used in CI)
npm run ci
```

## 🧪 Testing Setup

### Jest Configuration

- **Environment**: jsdom for DOM testing
- **Coverage**: 70% threshold for branches, functions, lines, and statements
- **Path Mapping**: Supports `@/` imports
- **Mock Setup**: Comprehensive mocks for Next.js, browser APIs

### Test Structure

```
__tests__/
├── components/          # Component tests
├── pages/              # Page tests
├── lib/                # Utility function tests
└── api/                # API route tests
```

### Sample Test

```typescript
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 🔒 Security Checks

### Automated Security Scanning

- **npm audit**: Scans for known vulnerabilities
- **Audit Level**: Moderate and above
- **Integration**: Runs on every PR and push

### Security Best Practices

- No hardcoded secrets in code
- Environment variables for sensitive data
- Input validation and sanitization
- Secure authentication practices

## 📊 Code Coverage

### Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Reports

- Generated on every test run
- Uploaded to Codecov (if configured)
- Available in CI/CD pipeline

## 🚀 Deployment Pipeline

### Environment Variables

Required secrets for CI/CD:

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

### Build Process

1. Install dependencies
2. Generate Prisma client
3. Run type checking
4. Build application
5. Run tests
6. Security audit

## 📝 Code Review Checklist

### Before Submitting PR

- [ ] Code follows ESLint rules
- [ ] Code is formatted with Prettier
- [ ] TypeScript types are correct
- [ ] Tests pass
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets
- [ ] Proper error handling
- [ ] Documentation updated

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Manual Review**: Code review by team members
3. **Quality Gates**: All checks must pass before merge

## 🔧 Local Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Steps

```bash
# Clone repository
git clone <repository-url>
cd pos-next

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npx prisma generate

# Run quality checks
npm run ci

# Start development server
npm run dev
```

### Pre-commit Hooks (Recommended)

Install husky for automatic quality checks:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## 📈 Monitoring & Metrics

### Quality Metrics

- Code coverage percentage
- ESLint error count
- TypeScript error count
- Security vulnerability count
- Build success rate

### Performance Metrics

- Build time
- Test execution time
- Bundle size
- Page load times

## 🆘 Troubleshooting

### Common Issues

**ESLint Errors:**

```bash
# Fix automatically
npm run lint:fix

# Check specific file
npx eslint path/to/file.tsx
```

**TypeScript Errors:**

```bash
# Check types
npm run type-check

# Watch mode for development
npm run type-check:watch
```

**Formatting Issues:**

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Test Failures:**

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test.test.tsx
```

## 📚 Additional Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
