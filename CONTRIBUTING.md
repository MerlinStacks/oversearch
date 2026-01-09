# Contributing to OverSeek Search

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🐛 Reporting Bugs

1. Check [existing issues](https://github.com/MerlinStacks/oversearch/issues) first
2. Use the bug report template
3. Include:
   - WordPress and WooCommerce versions
   - PHP version
   - Steps to reproduce
   - Expected vs actual behavior

## 💡 Suggesting Features

1. Check the [roadmap](https://github.com/MerlinStacks/oversearch/issues?q=label%3Aenhancement) for planned features
2. Open a feature request issue with:
   - Clear use case
   - Proposed solution
   - Alternative approaches considered

## 🔧 Development Setup

```bash
# Clone the repository
git clone https://github.com/MerlinStacks/oversearch.git
cd oversearch

# Install dependencies
npm install

# Start development build
npm run start

# Run production build
npm run build
```

## 📋 Pull Request Process

1. **Fork & Branch** — Create a feature branch from `main`
2. **Code Style** — Follow WordPress coding standards for PHP
3. **Test** — Ensure your changes work with the latest WooCommerce
4. **Document** — Update README if adding features
5. **Commit** — Use clear, descriptive commit messages
6. **PR** — Reference any related issues

### Commit Message Format

```
type: Short description

Longer description if needed.

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🏗️ Code Structure

```
includes/
├── Admin/          # Admin dashboard classes
├── API/            # REST API controllers
├── Frontend/       # Frontend rendering
└── Search/         # Core search logic

src/
├── admin/          # React admin UI
└── frontend/       # React search UI
```

## ✅ Checklist Before Submitting

- [ ] Code follows WordPress coding standards
- [ ] All strings are translatable (`__()`, `esc_html__()`)
- [ ] Proper escaping (`esc_html()`, `esc_attr()`, `esc_url()`)
- [ ] Nonces used for form submissions
- [ ] No `console.log()` in production code
- [ ] README updated if needed

## 📜 License

By contributing, you agree that your contributions will be licensed under the GPL v2 License.
