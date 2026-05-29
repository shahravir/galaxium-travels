# README Update - 2026-05-16

## Changes Made

Updated the main README.md to accurately reflect the current project state:

1. **Architecture Section**: Fixed directory name from `galaxium-travels-infrastructure/` to `galaxium-travels/`, added missing subdirectories (services/, hooks/, utils/), and included plans/ and AGENTS.md files

2. **Quick Start**: Removed Windows batch file reference (start.bat doesn't exist), added note directing Windows users to manual start

3. **Access URLs**: Corrected backend API path to `/api` (not root), added health check endpoint

4. **Technology Stack**: Enhanced frontend dependencies list with Lucide React and date-fns that were missing

5. **Docker Support**: Updated to reflect only backend has Dockerfile, added actual docker commands

6. **Architecture Section**: Added new section explaining service layer pattern and referencing AGENTS.md for development guidance

## Rationale

- Ensured consistency with backend/frontend READMEs
- Removed references to non-existent files (start.bat)
- Added missing but important details (health check endpoint, complete dependency list)
- Improved developer onboarding with architecture explanation and AGENTS.md reference