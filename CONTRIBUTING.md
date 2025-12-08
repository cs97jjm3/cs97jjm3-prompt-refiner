# Contributing to Prompt Refiner

Thank you for your interest in contributing to Prompt Refiner! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/prompt-refiner.git
cd prompt-refiner

# Install dependencies
cd server
npm install
cd ..

# Install MCPB toolchain
npm install -g @anthropic-ai/mcpb

# Build and test
mcpb pack
```

## Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code formatting
- Keep functions focused and single-purpose

## Testing Your Changes

1. Build the extension: `mcpb pack`
2. Install in Claude Desktop
3. Test all refinement styles
4. Test history functionality
5. Test with different database configurations
6. Verify graceful fallback behavior

## Pull Request Process

1. Update README.md if adding features
2. Update INSTALLATION.md if changing setup
3. Test on Windows (primary platform)
4. Ensure no console errors
5. Describe your changes clearly in the PR

## Reporting Issues

When reporting issues, please include:

- Operating System and version
- Node.js version (`node --version`)
- Claude Desktop version
- Steps to reproduce
- Expected vs actual behavior
- Console output (if available)
- Database configuration (if relevant)

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues first
- Describe the use case
- Explain why it would benefit users
- Consider implementation complexity

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Welcome newcomers
- Help others learn

## Questions?

- Open an issue for bugs or feature requests
- Check existing documentation first
- Be specific about your environment and setup

Thank you for contributing! 🚀
