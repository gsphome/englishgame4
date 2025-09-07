# Build Directory Consolidator

A tool to identify and consolidate multiple build directories into a single directory to improve project organization and performance.

## Features

- **Automatic Detection**: Identifies common build directories (`dist`, `dev-dist`, `html`, `build`, `out`)
- **Safe Consolidation**: Validates directories aren't in use before making changes
- **Backup Creation**: Automatically creates backups before consolidation
- **Conflict Resolution**: Handles file name conflicts by adding suffixes
- **Dry Run Mode**: Preview changes without making modifications
- **Process Validation**: Checks for processes using directories (with system process filtering)

## Usage

### Basic Usage
```bash
# Dry run to see what would be consolidated
node scripts/build-consolidator.js --dry-run

# Full consolidation with backup
node scripts/build-consolidator.js

# Consolidate without creating backup
node scripts/build-consolidator.js --no-backup

# Keep original directories after consolidation
node scripts/build-consolidator.js --keep-originals
```

### Command Line Options

- `--dry-run`: Preview changes without making modifications
- `--no-backup`: Skip creating backup before consolidation
- `--keep-originals`: Don't remove original directories after consolidation

## How It Works

1. **Discovery**: Scans project root for common build directory names
2. **Validation**: Checks that directories aren't in use by other processes
3. **Backup**: Creates timestamped backup of all build directories
4. **Consolidation**: Merges all build directories into `dist/`
5. **Cleanup**: Removes original directories (unless `--keep-originals` is used)
6. **Reporting**: Provides detailed report of actions taken

## File Conflict Resolution

When files with the same name exist in multiple build directories:
- Original file in target directory is preserved
- Conflicting files are renamed with numeric suffixes (`file-1.js`, `file-2.js`, etc.)

## Safety Features

- **Process Detection**: Uses `lsof` on Unix/macOS to detect processes using directories
- **System Process Filtering**: Ignores safe system processes like Spotlight indexing
- **Write Permission Testing**: Verifies write access before proceeding
- **Automatic Backup**: Creates backup before any destructive operations
- **Error Recovery**: Provides backup location if consolidation fails

## Testing

Run the comprehensive test suite:

```bash
node scripts/test-build-consolidator.js
```

The test suite covers:
- Directory identification
- Process validation
- Backup creation
- Dry run functionality
- Full consolidation process
- File conflict handling
- Error scenarios

## Requirements Addressed

This tool addresses the following requirements from the Kiro Performance Optimization spec:

- **Requirement 4.2**: Consolidates multiple build directories when they exist
- **Requirement 4.4**: Validates that directories aren't in use before modification

## Example Output

```
🔍 Identifying build directories...
📁 Found build directories: dist, dev-dist, html
🔒 Validating directories are not in use...
💾 Creating backup...
✓ Backed up dist to .build-backup/build-backup-2025-09-07T12-17-41-240Z/dist
✓ Backed up dev-dist to .build-backup/build-backup-2025-09-07T12-17-41-240Z/dev-dist
✓ Backed up html to .build-backup/build-backup-2025-09-07T12-17-41-240Z/html
🔄 Consolidating directories...
✓ Consolidated dev-dist (15 files)
✓ Consolidated html (8 files)
🗑️  Removing original directories...
✓ Removed original directory: dev-dist
✓ Removed original directory: html

=== Build Directory Consolidation Report ===
Target Directory: dist
Total Files Processed: 23
Status: SUCCESS

Consolidated Directories:
  - dev-dist (15 files)
  - html (8 files)

💾 Backup created at: .build-backup/build-backup-2025-09-07T12-17-41-240Z
```