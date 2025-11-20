# Contributing to Cipher Suite

Thank you for your interest in contributing to Cipher Suite! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Provide detailed information**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. **Check existing feature requests** first
2. **Open an issue** with the `enhancement` label
3. **Describe the feature**:
   - What problem does it solve?
   - How should it work?
   - Why would it be useful?
   - Any implementation ideas?

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the code style
   - Add comments where needed
   - Update documentation
   - Add tests if applicable
4. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add SSL certificate validation to honeypot detector
fix: resolve timeout issue in nmap scanner
docs: update installation instructions
```

## 💻 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Nmap (for port scanning)
- Git

### Setup Steps

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cipher-suite.git
   cd cipher-suite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
cipher-suite/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── tools/            # Tool pages
│   └── ...
├── lib/                   # Core libraries
│   ├── services/         # Business logic
│   ├── templates/        # PDF templates
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── public/               # Static assets
└── ...
```

## 🎨 Code Style

- **TypeScript**: Use strict typing
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint rules
- **Naming**:
  - Components: PascalCase (`HoneypotDetector`)
  - Files: kebab-case (`honeypot-detector.service.ts`)
  - Functions: camelCase (`detectHoneypot`)
  - Constants: UPPER_SNAKE_CASE (`MAX_TIMEOUT`)

## 🧪 Testing

Before submitting a PR:

1. **Test your changes** thoroughly
2. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```
3. **Run linter**:
   ```bash
   npm run lint
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```

## 💡 Ideas for Contributions

### New Features
- Additional scanning tools (Shodan, Censys integration)
- Authentication system
- Scan scheduling
- API endpoints
- Database integration
- Real-time notifications
- Scan history analytics
- Custom scan profiles
- Team collaboration features

### Improvements
- Better error handling
- Performance optimization
- UI/UX enhancements
- Mobile responsiveness
- Accessibility improvements
- Internationalization (i18n)
- Dark/light theme toggle
- Export formats (JSON, CSV, XML)

### Documentation
- Video tutorials
- API documentation
- Architecture diagrams
- Use case examples
- Troubleshooting guides
- Security best practices

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. **Email privately** to report the issue
3. **Provide details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond promptly and work with you to address the issue.

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/keerthan-kittu/cipher-suite/discussions)
- Check existing [Issues](https://github.com/keerthan-kittu/cipher-suite/issues)
- Read the [README](README.md)

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

Happy Contributing! 🚀
