# Udon Finance

<div align="center">
  <img src="https://via.placeholder.com/1200x400?text=Udon+Frontend+Banner" alt="Udon Finance Banner" width="800"/>
  <p><em>Modern frontend application built with Next.js, React, and TypeScript</em></p> 

  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/next.js-15.2.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/react-19.0.0-blue?style=for-the-badge&logo=react" alt="React" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/typescript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/tailwindcss-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
    </a>
  </p>
</div>

<hr />

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Development](#-development)
  - [Running the App](#running-the-app)
  - [Testing](#testing)
  - [Scripts](#available-scripts)
- [Project Structure](#-project-structure)
- [State Management](#-state-management)
- [Environment Management](#-environment-management)
- [Docker](#-docker)
- [CI/CD](#-cicd)
- [Commit Guidelines](#-commit-guidelines)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Overview

Udon Finance is a modern web application powered by Next.js, React, and TypeScript. It provides a robust foundation for building scalable, maintainable, and high-performance web applications.

## ✨ Features

- **Next.js 15** - Latest features from the React framework with App Router
- **React 19** - Modern React with hooks and concurrent rendering
- **TypeScript** - Type-safe code for better development experience
- **TailwindCSS 4** - Utility-first CSS framework
- **Zustand** - Simple and fast state management
- **Jest & React Testing Library** - Comprehensive testing setup
- **Docker** - Containerization for consistent development and deployment
- **CI/CD** - Automated workflows with GitHub Actions
- **Environment Management** - Support for different environments
- **Husky & lint-staged** - Git hooks for code quality assurance
- **ESLint & Prettier** - Code linting and formatting

## 🛠 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Linting & Formatting**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Containerization**: [Docker](https://www.docker.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

## 🏁 Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.6.7 or later
- Docker (optional, for containerized development)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/udon-frontend.git
cd udon-frontend
```

2. Install dependencies:

```bash
npm install
```

### Environment Setup

Copy the example environment file and modify as needed:

```bash
cp .env.example .env.local
```

## 💻 Development

### Running the App

To start the development server:

```bash
# Standard development mode
npm run dev

# With development environment
npm run dev:local

# With production environment
npm run dev:prod
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

Run the tests:

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Available Scripts

- `npm run dev` - Start development server with turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run dev:local` - Run with development environment
- `npm run dev:prod` - Run with production environment
- `npm run build:prod` - Build with production environment
- `npm run start:prod` - Start with production environment

## 📂 Project Structure

```
├── .github/workflows/     # CI/CD workflows
├── .husky/                # Git hooks
├── .vscode/               # VS Code settings
├── __mocks__/             # Jest mocks
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services and external integrations
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
├── .env.development       # Development environment variables
├── .env.production        # Production environment variables
├── .env.example           # Example environment variables
├── Dockerfile             # Production Docker configuration
├── Dockerfile.dev         # Development Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.mjs        # Jest configuration
├── babel.config.js        # Babel configuration
├── next.config.ts         # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔄 State Management

This project uses Zustand for state management. Example stores can be found in the `src/store` directory:

```javascript
// Using a store in a component
import { useCounterStore } from '@/store/useCounterStore';

const { count, increment } = useCounterStore();
```

## 🌍 Environment Management

This project uses environment configuration files for different environments:

- `.env.development` - Development environment
- `.env.production` - Production environment

### Running in Different Environments

```bash
# Run in development environment
npm run dev:local

# Run in production environment
npm run dev:prod
```

For production builds:

```bash
# Build for production
npm run build:prod

# Start production server
npm run start:prod
```

## 🐳 Docker

Development and production environments are containerized with Docker:

```bash
# Start development environment
docker-compose up dev

# Start production environment
docker-compose up prod
```

## 🔄 CI/CD

This project includes GitHub Actions workflows for:

- Continuous Integration (lint, test, build)
- (Optional) Deployment to production

The pipeline ensures code quality and automated testing for every pull request and deployment.

## 📝 Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions or corrections
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `chore:` - Other changes that don't modify src or test files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don't hold you liable.

```
MIT License

Copyright (c) 2024 Udon Team

Permission is hereby granted, free of charge...
```

For the full MIT License, see the [LICENSE](LICENSE) file.

---

<div align="center">
  <p>Made with ❤️ by Udon Team</p>
</div>
