# Contributing to Drift KV

Thank you for your interest in contributing to Drift KV! We're excited to collaborate with developers from all over the world to improve Drift and make it more useful for the entire community. This guide will help you get started with your contributions.

## Table of Contents

- [Getting Started](#getting-started)
- [Issues and Feature Requests](#issues-and-feature-requests)
- [Contributing Code](#contributing-code)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

Before you begin contributing, please take a moment to familiarize yourself with the repository. You should:

1. **Read the README.md** to understand the project and its purpose.
2. **Review open issues** to identify existing discussions and needs.
3. **Explore the documentation** to understand how to interact with Drift KV and its components.

If you have any questions, feel free to open a discussion in our GitHub [discussions section](https://github.com/felipebarcelospro/drift/discussions).

## Issues and Feature Requests

If you find a bug or have a feature request, please check our existing [issues](https://github.com/felipebarcelospro/drift/issues) before opening a new one. If your issue hasn't been addressed, feel free to open a new issue with the following information:

- **Bug Reports**: Include steps to reproduce, expected behavior, and any relevant screenshots or error messages.
- **Feature Requests**: Describe the feature in detail, the problem it solves, and any alternatives you considered.

## Contributing Code

We welcome contributions of all kinds: bug fixes, new features, improvements, and documentation updates. Here are some ways you can contribute:

- **Bug Fixes**: Look for issues labeled as "bug" to help tackle existing problems.
- **New Features**: Look for issues labeled as "enhancement" or propose your own new feature.
- **Documentation**: Even small spelling fixes are appreciated.

Please be sure to leave a comment in an issue before you start working on it so we can assign it to you. This avoids redundant work.

## Setting Up the Development Environment

1. **Clone the Repository**

   ```sh
   git clone https://github.com/felipebarcelospro/drift.git
   cd drift
   ```

2. **Install Dependencies**

   ```sh
   deno task install
   ```

3. **Run Tests**

   To ensure everything is working correctly, run the tests:

   ```sh
   deno test
   ```

## Code Style Guidelines

Please follow these guidelines to ensure consistency throughout the project:

- **Linting**: We use Deno's built-in linter. Run `deno lint` to make sure your code is clean.
- **Formatting**: Code should be formatted using `deno fmt` before submission.
- **TypeScript Standards**: All contributions should be in TypeScript and follow strict typing rules for safety and maintainability.
- **Naming Conventions**: Use camelCase for variable names, PascalCase for classes, and ALL_CAPS for constants.

## Pull Request Process

1. **Fork the Repository**

   - Fork the project from GitHub.

2. **Create a Branch**

   - Branch names should be descriptive of the work being done (e.g., `feature/auth-plugin`, `fix/connection-bug`).

3. **Make Your Changes**

   - Ensure the code passes all linting and testing requirements.
   - Write or update unit tests as needed.

4. **Submit a Pull Request**

   - Open a Pull Request to the `main` branch.
   - Fill out the provided PR template, making sure to include the following:
     - A descriptive title.
     - A reference to the issue being addressed (if applicable).
     - A detailed summary of your changes and why they were made.

5. **Review Process**
   - One or more maintainers will review your pull request. Be prepared to make changes based on their feedback.

## Community Guidelines

- **Be Respectful**: Drift KV is an open and inclusive community. We value each contributor's time, input, and skills.
- **Stay on Topic**: Comments and discussions should be focused on the topic of the issue or pull request.
- **Help Others**: If you see a question or issue you can help with, please do!

By contributing to Drift KV, you agree to abide by our [Code of Conduct](https://github.com/felipebarcelospro/drift/blob/main/CODE_OF_CONDUCT.md).

Thank you for taking the time to contribute to Drift KV. Together we can build an amazing project that benefits the entire Deno ecosystem!

## Repository File Structure

Here is an overview of the file structure of the Drift KV project to help you navigate it effectively:

```
drift/
├── src/
│   ├── core/
│   │   ├── Drift.ts               # Main class for the ORM functionality.
│   │   ├── Client.ts              # Client for handling KV operations.
│   ├── entities/
│   │   ├── DriftEntity.ts         # Entity management and CRUD operations.
│   ├── jobs/
│   │   ├── JobQueue.ts            # Job queue for handling background tasks.
│   ├── utils/
│   │   ├── ValidationUtil.ts      # Utility for validating Drift configurations.
├── examples/
│   ├── basic-usage.ts             # Example usage of Drift KV.
│   ├── job-queue-example.ts       # Example of setting up a job queue.
├── docs/
│   ├── README.md                  # Main documentation file.
│   ├── contributing.md            # Guide for contributing to the project.
│   ├── drift-entity-guide.md      # Detailed guide for creating and managing entities.
│   ├── job-queues-guide.md        # Documentation on using job queues.
├── tests/
│   ├── core/
│   │   ├── Drift.test.ts          # Unit tests for Drift.ts.
│   │   ├── Client.test.ts         # Unit tests for Client.ts.
│   ├── entities/
│   │   ├── DriftEntity.test.ts    # Unit tests for DriftEntity.ts.
├── LICENSE                        # Project license.
├── deno.json                      # Deno configuration file.
├── CONTRIBUTING.md                # Contribution guidelines.
├── CODE_OF_CONDUCT.md             # Code of conduct for contributors.
└── README.md                      # Main project README.
```

This file structure is designed to keep the code organized, making it easy for contributors to find what they need and understand how different parts of the project work together.
