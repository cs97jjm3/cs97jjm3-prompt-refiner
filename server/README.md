# Server Directory

This directory contains the MCP server implementation for the Prompt Refiner extension.

## Files

- **`index.js`** - MCP server entry point, tool definitions and handlers
- **`db.js`** - SQLite database layer for storing prompts and history
- **`config.js`** - Configuration management with graceful fallback
- **`llmAdapter.js`** - LLM integration utilities
- **`package.json`** - Server dependencies
- **`config.json.example`** - Configuration examples (copy to config.json)
- **`config.json`** - User configuration (auto-created, not in git)

## Configuration

### Creating config.json

Copy the example file:
```bash
cp config.json.example config.json
```

Or create manually:
```json
{
  "database_path": "~/.prompt-refiner/prompt_refiner.db"
}
```

### Configuration Options

See `config.json.example` for all available options and examples.

**Common configurations:**
- Default: `~/.prompt-refiner/prompt_refiner.db`
- Custom: `C:\\path\\to\\your\\prompts.db`
- In-memory: `:memory:` (no persistence)

## Dependencies

Install with:
```bash
npm install
```

**Required packages:**
- `sqlite` - Async SQLite database wrapper
- `sqlite3` - SQLite3 native bindings
- `@anthropic-ai/sdk` - Anthropic SDK for MCP

## Development

### Testing the Server Directly

```bash
node index.js
```

### Making Changes

1. Edit source files
2. Test changes
3. Return to parent directory and rebuild:
   ```bash
   cd ..
   mcpb pack
   ```
4. Reinstall in Claude Desktop

## Database Schema

**prompts table:**
- `id` - Primary key
- `original_text` - Original prompt text
- `created_at` - Timestamp

**variants table:**
- `id` - Primary key
- `prompt_id` - Foreign key to prompts
- `style` - Variant style (concise, detailed, creative, analytical)
- `refined_text` - Refined prompt text
- `created_at` - Timestamp

## Error Handling

The server includes graceful fallback for database location:
1. Configured path (from config.json)
2. System temp directory
3. In-memory (last resort)

Console output will indicate which location is being used.
