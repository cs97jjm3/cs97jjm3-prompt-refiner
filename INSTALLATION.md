# Installation & Configuration Guide

## Quick Start

### 1. Install the Extension
```bash
# Build the extension
cd C:\Users\james\Documents\prompt-refiner
cd server && npm install && cd ..
mcpb pack

# Install in Claude Desktop
# Double-click prompt-refiner.mcpb or drag into Claude Desktop
```

### 2. First Run
The server automatically creates `server/config.json` with default settings on first run.

### 3. (Optional) Configure Storage Location
Edit `server/config.json` to change where your prompt history is stored.

---

## Configuration Options

### Default Configuration
```json
{
  "database_path": "~/.prompt-refiner/prompt_refiner.db"
}
```

This stores data in:
- **Windows:** `C:\Users\YourUsername\.prompt-refiner\prompt_refiner.db`
- **Mac/Linux:** `~/.prompt-refiner/prompt_refiner.db`

### Custom Locations

#### Option 1: User Documents (Recommended for Windows)
```json
{
  "database_path": "~/Documents/prompt-refiner-data/prompts.db"
}
```

#### Option 2: Program Data (Enterprise/Shared)
```json
{
  "database_path": "C:\\ProgramData\\PromptRefiner\\prompts.db"
}
```

#### Option 3: Network Drive
```json
{
  "database_path": "Z:\\shared\\prompt-refiner\\prompts.db"
}
```

#### Option 4: Portable (Relative to Server)
```json
{
  "database_path": "./data/prompts.db"
}
```

#### Option 5: In-Memory Only (No Persistence)
```json
{
  "database_path": ":memory:"
}
```

---

## Enterprise Deployment

### Pre-configured Installation

1. **Create config before deployment:**
   ```json
   {
     "database_path": "C:\\ProgramData\\PromptRefiner\\prompts.db"
   }
   ```

2. **Create target directory:**
   ```powershell
   New-Item -Path "C:\ProgramData\PromptRefiner" -ItemType Directory -Force
   icacls "C:\ProgramData\PromptRefiner" /grant Users:(OI)(CI)M
   ```

3. **Deploy the .mcpb file** with pre-configured `server/config.json`

### Fallback Behavior

If the configured location fails, the server automatically tries:
1. System temp directory: `%TEMP%\.prompt-refiner\prompt_refiner.db`
2. In-memory database: `:memory:` (no persistence)

Console output will clearly show which location is being used.

---

## Verifying Installation

### Check Configuration
1. Open Claude Desktop
2. Send a message: "refine this: hello world"
3. Check the console logs (if visible) for:
   - `✓ Using database: [path]` (success)
   - `⚠ Warning:` messages (fallback in use)
   - `NOTICE: Using in-memory database` (last resort)

### Check Database Location
**Windows:**
```powershell
# Default location
dir $env:USERPROFILE\.prompt-refiner

# Or check your custom path
dir "C:\ProgramData\PromptRefiner"
```

**Mac/Linux:**
```bash
# Default location
ls -la ~/.prompt-refiner
```

---

## Managing Your Data

### View Database Location
Check `server/config.json` to see where your data is stored.

### Backup Your History
Simply copy the database file:
```powershell
# Windows
copy "$env:USERPROFILE\.prompt-refiner\prompt_refiner.db" "D:\Backups\"

# Mac/Linux
cp ~/.prompt-refiner/prompt_refiner.db ~/Backups/
```

### Reset/Clear History
Delete the database file - it will be recreated empty on next run:
```powershell
# Windows
del "$env:USERPROFILE\.prompt-refiner\prompt_refiner.db"

# Mac/Linux
rm ~/.prompt-refiner/prompt_refiner.db
```

---

## Troubleshooting

### Issue: Permission Denied
**Symptom:** Console shows "Cannot use configured path"

**Solution:**
1. Check that the directory exists and is writable
2. The server will automatically fall back to temp/memory
3. Configure a different path in `config.json`

### Issue: Data Not Persisting
**Symptom:** History disappears after restart

**Cause:** Using `:memory:` or temp storage (may be cleaned up)

**Solution:**
1. Check console output on startup
2. Configure a permanent path in `config.json`
3. Ensure the path has write permissions

### Issue: Can't Find config.json
**Location:** `C:\Users\james\Documents\prompt-refiner\server\config.json`

**Solution:**
1. Copy from `config.json.example` if missing
2. It's auto-created on first run
3. Restart Claude Desktop after creating/editing

### Issue: Changes Not Taking Effect
**Solution:**
1. Save `config.json`
2. Fully restart Claude Desktop (not just refresh)
3. Check console for the new path being used

---

## Support

For issues or questions:
1. Check console output for diagnostic messages
2. Verify file paths and permissions
3. Review this guide for configuration examples
4. Contact: James at The Access Group
