# Contributing to Community Resource Board

Thank you for considering contributing to Community Resource Board! We're excited to have you help make this project better. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

There are many ways you can contribute to this project:

1. **Report Bugs** - Found a bug? Let us know by creating an issue
2. **Suggest Features** - Have a great idea? Share it with us
3. **Improve Documentation** - Help others understand the project
4. **Fix Bugs** - Submit a PR to fix reported issues
5. **Add Features** - Implement new functionality
6. **Improve Tests** - Increase code coverage and test quality
7. **Optimize Performance** - Find and fix performance bottlenecks
8. **Security Improvements** - Help us keep the project secure

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Git
- MongoDB Atlas account (for database)
- A GitHub account

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/community-resource-board.git
   cd community-resource-board
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/vijayshikhare/community-resource-board.git
   ```

### Set Up Development Environment

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Follow setup instructions in README.md
# Create .env files with your configuration
```

## Development Workflow

### Creating a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/add-notifications` - New features
- `fix/login-timeout-issue` - Bug fixes
- `docs/update-api-guide` - Documentation updates
- `refactor/optimize-queries` - Code improvements
- `test/add-integration-tests` - Test additions

### Making Changes

1. Make your changes in the appropriate files
2. Test your changes locally (see [Testing](#testing))
3. Follow our [Coding Standards](#coding-standards)
4. Keep commits logical and atomic

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without feature changes
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build, dependency, or tooling changes
- `ci` - CI/CD configuration changes
- `security` - Security improvements

**Examples:**

```bash
# Good examples
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(dashboard): resolve stat refresh timing issue"
git commit -m "docs(readme): update deployment instructions"
git commit -m "refactor(database): optimize query performance"
git commit -m "test(applications): add integration tests"
```

## Pull Request Process

### Before Creating a PR

1. **Update your branch:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly:**
   - Run all tests locally
   - Test in different browsers/mobile if frontend change
   - Verify no console errors

3. **Follow code standards** (see below)

4. **Update documentation** if needed

### Creating a PR

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub with:
   - Clear title following conventional commits
   - Detailed description of changes
   - Reference to related issues (closes #123)
   - Screenshots for UI changes
   - Any special testing instructions

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of what this PR does

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   - [ ] Code refactoring

   ## Related Issues
   Closes #(issue number)

   ## Testing
   How to test these changes:
   1. ...
   2. ...

   ## Screenshots (if applicable)
   [Add screenshots]

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added where needed
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally
   - [ ] No breaking changes
   ```

### PR Review Process

- At least one review from maintainers required
- All conversations must be resolved
- All checks must pass (tests, linting)
- Commits should be squashed before merging

## Coding Standards

### JavaScript/Node.js

```javascript
// Use const by default, let when necessary, avoid var
const value = 5;

// Use arrow functions where appropriate
const greet = (name) => `Hello, ${name}!`;

// Use template literals
const message = `User ${name} has ${count} items`;

// Use async/await over .then()
const data = await fetchData();

// Proper error handling
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error.message);
  throw error;
}

// Comments for complex logic
// Calculate exponential weighted average for recent ratings
const ewma = calculateEWMA(ratings);
```

### React Components

```javascript
// Use functional components with hooks
export const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect setup
    return () => {
      // Cleanup
    };
  }, [dependency]);

  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  );
};

// Prop validation
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};
```

### CSS/Styling

```css
/* Use meaningful class names */
.resource-card {
  display: flex;
  gap: 1rem;
}

.resource-card__title {
  font-weight: bold;
  color: var(--primary-color);
}

/* Use CSS variables for theming */
:root {
  --primary-color: #007bff;
  --text-color: #333;
}
```

## Testing

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing functionality
- Aim for >80% code coverage for critical paths
- Use descriptive test names

```javascript
describe('AuthContext', () => {
  it('should set user when login is successful', () => {
    // Test implementation
  });

  it('should clear user when logout is called', () => {
    // Test implementation
  });
});
```

## Reporting Bugs

### Bug Report Template

When reporting a bug, include:

1. **Clear Title** - Descriptive one-liner
2. **Description** - What happened
3. **Steps to Reproduce** - Exact steps
4. **Expected Behavior** - What should happen
5. **Actual Behavior** - What actually happens
6. **Environment** - OS, Node version, browser, etc.
7. **Screenshots** - Visual evidence if applicable
8. **Error Messages** - Full stack traces
9. **Additional Context** - Any other relevant information

### Report Here
Use the [Bug Report Issue Template](.github/ISSUE_TEMPLATE/bug_report.md)

## Requesting Features

### Feature Request Template

When requesting a feature, provide:

1. **Clear Title** - Descriptive feature name
2. **Motivation** - Why is this needed?
3. **Proposed Solution** - How should it work?
4. **Alternatives** - Other possible approaches
5. **Example Use Cases** - Real-world scenarios
6. **Additional Context** - Mock-ups, specifications, etc.

### Request Here
Use the [Feature Request Issue Template](.github/ISSUE_TEMPLATE/feature_request.md)

## Development Tips

### Common Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Production build
npm test             # Run tests
npm run lint         # Run linter

# Frontend
npm start            # Start development server
npm run build        # Production build
npm test             # Run tests
npm run eject        # Eject from Create React App (caution)
```

### Debugging

```bash
# Backend - Node debugger
node --inspect-brk backend/src/server.js

# Frontend - React DevTools browser extension recommended
```

### Environment Variables

Copy `.env.example` to `.env` in both frontend and backend directories, then fill in your credentials.

## Performance Guidelines

1. **Minimize bundle size** - Use code splitting, lazy loading
2. **Optimize images** - Use appropriate formats and sizes
3. **Database queries** - Use indexing, avoid N+1 queries
4. **Caching** - Implement strategic caching
5. **API calls** - Debounce, throttle, and batch where appropriate

## Security Best Practices

1. **Never commit secrets** - Use .env files
2. **Validate input** - Sanitize and validate all user input
3. **Use HTTPS** - Always in production
4. **Update dependencies** - Keep packages current
5. **Security headers** - Use helmet.js for Express
6. **Rate limiting** - Prevent abuse
7. **JWT tokens** - Keep tokens short-lived
8. **Error messages** - Don't expose sensitive information

## Getting Help

- **Questions?** Open a Discussion on GitHub
- **Issues?** Check existing issues first
- **Stuck?** Ask in a PR comment or discussion
- **Ideas?** Start a discussion before implementing

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md release notes
- GitHub contributors page

## Questions or Concerns?

- Open an issue for discussions
- Contact maintainers directly on GitHub
- Check existing discussions for answers

---

**Thank you for contributing! Your efforts help make Community Resource Board better for everyone.** 🎉
