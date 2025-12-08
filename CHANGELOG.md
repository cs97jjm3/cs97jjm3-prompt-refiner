# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-08

### Added
- Configurable database location via `server/config.json`
- Graceful fallback system (configured path → temp → in-memory)
- `config.js` module for configuration management
- `config.json.example` with documentation and examples
- Comprehensive installation documentation in `INSTALLATION.md`
- Quick start checklist in `QUICKSTART.md`
- Enhanced troubleshooting guide
- Enterprise deployment documentation
- Console feedback for database location selection

### Changed
- Database path is now configurable instead of hardcoded
- Updated `db.js` to use configuration system
- Enhanced README.md with full installation instructions
- Improved error handling for permission issues

### Fixed
- Database creation now works on locked-down enterprise machines
- Better handling of write permission failures
- Clear user feedback when fallback storage is used

## [1.0.0] - 2024-12-07

### Added
- Initial release
- Four refinement styles: Concise, Detailed, Creative, Analytical
- React artifact UI with copy buttons
- SQLite database for history tracking
- History viewing with expandable cards
- MCP server implementation
- Claude Desktop extension packaging

### Features
- `refinePrompt` tool - generates 4 prompt variants
- `getHistory` tool - displays refinement history
- Automatic database initialization
- No external API keys required
- Instant display of refinements

[1.1.0]: https://github.com/yourusername/prompt-refiner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/prompt-refiner/releases/tag/v1.0.0
