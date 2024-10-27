# Pull Request Workflows

## Triggers

- PR opened
- PR synchronized
- PR reopened
- PR closed

## Workflows

### 1. Quality Gate

- Type checking
- Test coverage
- Bundle size analysis
- Linting

### 2. Labeling

- Automatic labeling based on changes
- Size labeling
- Area labeling

### 3. Code Analysis

- CodeQL security scan
- Dependency check
- Bundle size check

### 4. Branch Management

- Auto-delete merged branches
- Branch protection rules
- Required reviews

## Configuration Files

- `.github/workflows/quality-gate.yml`
- `.github/workflows/pr-labeler.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/branch-cleanup.yml`
