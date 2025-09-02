# English Learning App - React

A comprehensive, secure English learning application built with React, TypeScript, and modern security practices.

## 🔒 Security Features

This application implements enterprise-grade security measures:

- **XSS Prevention**: HTML sanitization and secure content rendering
- **Input Validation**: Comprehensive validation using Zod schemas
- **Secure HTTP**: TLS validation and secure request handling
- **Security Headers**: CSP, X-Frame-Options, and other protective headers
- **Secure Logging**: Production-safe logging with sensitive data filtering
- **Dependency Security**: Regular security audits and updates

## 🚀 Features

- **Multiple Learning Modes**: Flashcards, Quizzes, Completion exercises, Sorting, and Matching
- **Progressive Web App**: Offline support and mobile-friendly design
- **Multilingual Support**: English and Spanish interfaces
- **Adaptive Learning**: Difficulty levels from A1 to C2
- **Performance Tracking**: Detailed progress analytics
- **Dark/Light Theme**: User preference support

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query
- **Validation**: Zod schemas
- **Build Tool**: Vite with security optimizations
- **Testing**: Vitest with coverage reporting
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with ES2020 support

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/english-learning-app-react.git
   cd english-learning-app-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run security audit**
   ```bash
   npm run security:audit
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run type-check
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Clean up unused code
npm run cleanup
```

## 🏗️ Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security

### Security Auditing
```bash
# Run security audit
npm run security:audit

# Fix security issues
npm run security:fix
```

### Security Features
- Input sanitization and validation
- XSS prevention with HTML sanitization
- Secure HTTP communications with TLS validation
- Rate limiting for user actions
- Security headers implementation
- Secure logging without sensitive data exposure

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── learning/       # Learning mode components
│   ├── ui/            # UI components
│   └── dev/           # Development tools
├── stores/            # Zustand stores
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
│   ├── htmlSanitizer.ts    # HTML sanitization
│   ├── inputValidation.ts  # Input validation
│   ├── secureHttp.ts      # Secure HTTP utilities
│   └── logger.ts          # Secure logging
├── assets/            # Static assets and data
├── styles/            # CSS styles
└── types/             # TypeScript type definitions
```

## 🎯 Learning Modes

### 1. Flashcards
Interactive vocabulary cards with pronunciation guides and examples.

### 2. Quizzes
Multiple-choice questions with immediate feedback and explanations.

### 3. Completion Exercises
Fill-in-the-blank exercises for grammar and vocabulary practice.

### 4. Sorting Games
Categorize words and phrases by topic or grammatical function.

### 5. Matching Exercises
Match English terms with their Spanish translations or definitions.

## 🌐 Internationalization

The app supports multiple languages:
- English (default)
- Spanish (Español)

Language files are located in `src/utils/i18n.ts`.

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Loading Time**: < 2s on 3G networks
- **Offline Support**: Full PWA capabilities

## 🔄 CI/CD

Automated workflows include:
- **Security Scanning**: Dependency audits and code analysis
- **Code Quality**: ESLint, TypeScript, and Prettier checks
- **Testing**: Unit tests with coverage reporting
- **Build Verification**: Production build testing
- **Security Headers**: Automated security header validation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Follow security guidelines** (see SECURITY.md)
4. **Write tests** for new functionality
5. **Run security checks**
   ```bash
   npm run security:audit
   npm run lint
   npm test
   ```
6. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Standards
- Follow TypeScript strict mode
- Use provided validation utilities
- Implement proper error handling
- Write comprehensive tests
- Follow security best practices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Security**: Email security@yourcompany.com
- **General**: Contact support@yourcompany.com

## 🙏 Acknowledgments

- React team for the amazing framework
- TypeScript team for type safety
- Tailwind CSS for utility-first styling
- All contributors and testers

## 📈 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Social learning features
- [ ] AI-powered personalized learning paths
- [ ] Voice recognition for pronunciation
- [ ] Gamification elements
- [ ] Teacher/student management system

---

**Built with ❤️ and 🔒 security in mind**