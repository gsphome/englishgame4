# Configuration File Reorganizer

A tool to reorganize scattered configuration files into a centralized `config/` directory to improve project structure and reduce root directory clutter.

## Overview

This script identifies configuration files scattered in the project root and moves them to a dedicated `config/` directory while automatically updating all references in `package.json` and other configuration files.

## Features

- **Automatic Detection**: Identifies common configuration files in the project root
- **Safe Backup**: Creates automatic backups before making changes
- **Reference Updates**: Updates `package.json` scripts and other config file references
- **Rollback Support**: Can restore original structure if needed
- **Dry Run Mode**: Preview changes without making modifications
- **Comprehensive Testing**: Includes full test suite for validation

## Supported Configuration Files

- `eslint.config.js`
- `postcss.config.js`
- `tailwind.config.js`
- `vite.config.ts`
- `vitest.config.ts`

## Usage

### NPM Scripts

```bash
# Preview changes without making modifications
npm run config:reorganize:dry-run

# Reorganize configuration files
npm run config:reorganize

# Rollback changes if needed
npm run config:rollback

# Run tests
npm run test:config-reorganizer
```

### Direct Script Usage

```bash
# Dry run
node scripts/config-reorganizer.js --dry-run

# Execute reorganization
node scripts/config-reorganizer.js

# Rollback changes
node scripts/config-reorganizer.js --rollback
```

## What It Does

### 1. Analysis Phase
- Scans project root for supported configuration files
- Reports which files will be moved

### 2. Backup Phase
- Creates `.config-backup/` directory
- Copies all configuration files to backup location

### 3. Reorganization Phase
- Creates `config/` directory
- Moves configuration files to `config/`
- Updates `package.json` script references
- Updates `tsconfig.node.json` include paths

### 4. Validation Phase
- Verifies all files were moved successfully
- Reports summary of changes made

## Example Output

```
🔧 Configuration File Reorganizer
=================================

1. Identifying scattered configuration files...
Found 5 configuration files to reorganize:
  • eslint.config.js
  • postcss.config.js
  • tailwind.config.js
  • vite.config.ts
  • vitest.config.ts

2. Creating config directory...
✓ Created config/ directory

3. Creating backup...
✓ Created backup in .config-backup

4. Moving configuration files...
✓ Moved eslint.config.js to config/
✓ Moved postcss.config.js to config/
✓ Moved tailwind.config.js to config/
✓ Moved vite.config.ts to config/
✓ Moved vitest.config.ts to config/

5. Updating package.json references...
✓ Updated script "lint": eslint . --config eslint.config.js → eslint . --config config/eslint.config.js
✓ Updated package.json references

6. Updating configuration file references...
✓ Updated tsconfig.node.json references

📊 Configuration Reorganization Report
=====================================
Total config files found: 5
Successfully moved: 5
Failed to move: 0

✅ Moved files:
  • eslint.config.js → config/eslint.config.js
  • postcss.config.js → config/postcss.config.js
  • tailwind.config.js → config/tailwind.config.js
  • vite.config.ts → config/vite.config.ts
  • vitest.config.ts → config/vitest.config.ts

📝 Next steps:
  1. Test that all build/dev commands still work
  2. Update any IDE/editor configurations
  3. Update documentation references
  4. Remove backup directory: .config-backup
```

## Project Structure Before/After

### Before
```
project/
├── eslint.config.js
├── postcss.config.js
├── tailwind.config.js
├── vite.config.ts
├── vitest.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── src/
```

### After
```
project/
├── config/
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vitest.config.ts
├── package.json (updated references)
├── tsconfig.json
├── tsconfig.node.json (updated references)
└── src/
```

## Safety Features

### Automatic Backup
- All original files are backed up to `.config-backup/`
- Backup is created before any changes are made
- Can be used for manual restoration if needed

### Rollback Functionality
- Complete rollback support via `--rollback` flag
- Restores original file locations
- Removes files from config directory
- Restores original package.json references

### Validation
- Verifies files exist before attempting to move them
- Checks that target directory can be created
- Validates that references were updated correctly

## Post-Reorganization Steps

1. **Test Build Commands**: Run `npm run build`, `npm run dev`, etc. to ensure everything works
2. **Test Linting**: Run `npm run lint` to verify ESLint configuration is working
3. **Update IDE Settings**: Update any IDE-specific configuration paths
4. **Update Documentation**: Update any documentation that references config file paths
5. **Clean Up**: Remove the `.config-backup/` directory once you're satisfied

## Troubleshooting

### Build Errors After Reorganization
- Check that all script references in `package.json` were updated correctly
- Verify that `tsconfig.node.json` includes the correct path to `vite.config.ts`
- Use rollback if needed: `npm run config:rollback`

### Manual Reference Updates
Some references might need manual updates:
- IDE/editor configuration files
- Documentation files
- Custom scripts that reference config files directly

### Rollback Issues
If rollback fails:
1. Check that `.config-backup/` directory exists
2. Manually copy files from backup to project root
3. Restore original `package.json` from version control

## Requirements Addressed

This tool addresses requirement **4.3** from the performance optimization spec:
- ✅ Creates function to identify scattered configuration files
- ✅ Implements logic to create config/ directory
- ✅ Updates references in package.json automatically
- ✅ Includes comprehensive test suite for validation

## Testing

The tool includes a comprehensive test suite that validates:
- Configuration file identification
- Directory creation
- File movement operations
- Reference updates in package.json and other files
- Rollback functionality
- Dry run mode
- Full reorganization workflow

Run tests with:
```bash
npm run test:config-reorganizer
```

## Integration

This tool is part of the larger Kiro performance optimization suite and works alongside:
- Project analyzer
- Coverage cleaner
- Build consolidator
- Temporary file cleaner
- Kiro configuration optimizer