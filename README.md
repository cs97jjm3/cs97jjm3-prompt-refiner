# Prompt Refiner

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/cs97jjm3/prompt-refiner)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Claude%20Desktop-purple.svg)](https://claude.ai/)

An MCP Desktop Extension that helps you refine prompts in different styles. Claude does the refinement work directly - no external API calls needed.

![Prompt Refiner Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Prompt+Refiner+Demo)

> 📚 **Quick Links:** [Installation](#installation-instructions) • [Usage](#usage) • [Configuration](#configuration-details) • [Troubleshooting](#troubleshooting)

## Features

- **Four refinement styles:**
  - **Concise** — Shorter and more direct
  - **Detailed** — Expanded with context and specifics
  - **Creative** — Encourages imaginative responses
  - **Analytical** — Structured for logical, systematic output

- **Instant display** — Variants automatically appear in an interactive React UI
- **One-step refinement** — Just ask Claude to refine your prompt
- **Copy buttons** — Easy copying of your preferred variant
- **History tracking** — All prompts and variants stored in SQLite
- **No API keys** — Claude Desktop handles all the LLM work
- **Configurable storage** — Choose where to store your prompt history

## Author

Created by James Murell at home: his day job is at The Access Group for Business Analyst

---

## Installation Instructions

### Prerequisites

1. **Node.js** (version 18 or higher - required for fetch API)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Note: Version 18+ is required for built-in fetch support

2. **MCPB toolchain** (MCP Builder)
   ```bash
   npm install -g @anthropic-ai/mcpb
   ```
   - Verify installation: `mcpb --version`

3. **Claude Desktop** (latest version)
   - Download from: https://claude.ai/download

### Step 1: Prepare the Extension Files

Navigate to the extension directory:
```bash
cd C:\Users\james\Documents\prompt-refiner
```

### Step 2: Install Server Dependencies

```bash
cd server
npm install
cd ..
```

This installs required packages: `sqlite`, `sqlite3`, and MCP SDK.

### Step 3: Configure Database Location (Optional)

**Default location:** `C:\Users\YourUsername\.prompt-refiner\prompt_refiner.db`

To use a different location:

1. **Create the config file** (if it doesn't exist):
   - File: `C:\Users\james\Documents\prompt-refiner\server\config.json`
   - Copy from `config.json.example` if needed

2. **Edit config.json** with your preferred path:
   ```json
   {
     "database_path": "C:\\Users\\james\\Documents\\prompt-data\\prompts.db"
   }
   ```

3. **Important notes about paths:**
   - Use double backslashes `\\` in Windows paths
   - Or use forward slashes: `C:/Users/james/Documents/prompt-data/prompts.db`
   - `~` expands to your home directory: `~/Documents/prompts.db`
   - Use `:memory:` for no persistence (data lost on restart)

**Example configurations:**

```json
// Store in Documents folder
{
  "database_path": "C:\\Users\\james\\Documents\\prompt-refiner\\data\\prompts.db"
}

// Store in home directory (default)
{
  "database_path": "~/.prompt-refiner/prompt_refiner.db"
}

// Store on network drive
{
  "database_path": "Z:\\shared\\prompt-refiner\\prompts.db"
}

// Relative to server directory
{
  "database_path": "./data/prompts.db"
}

// No persistence (in-memory only)
{
  "database_path": ":memory:"
}
```

### Step 4: Build the Extension Package

From the `prompt-refiner` directory:
```bash
mcpb pack
```

This creates `prompt-refiner.mcpb` in the current directory.

**Expected output:**
```
✓ Validating manifest...
✓ Packaging extension...
✓ Created: prompt-refiner.mcpb
```

### Step 5: Install in Claude Desktop

**Method 1: Double-click**
1. Double-click `prompt-refiner.mcpb`
2. Claude Desktop will open automatically
3. Click "Install Extension"
4. Wait for confirmation message

**Method 2: Drag and drop**
1. Open Claude Desktop
2. Go to Settings → Extensions
3. Drag `prompt-refiner.mcpb` into the window
4. Click "Install"

**Method 3: Manual installation**
1. Open Claude Desktop
2. Go to Settings → Extensions
3. Click "Install from file"
4. Navigate to and select `prompt-refiner.mcpb`
5. Click "Open"

### Step 6: Restart Claude Desktop

**Important:** Fully close and restart Claude Desktop (not just refresh).

- **Windows:** Right-click system tray icon → Exit, then relaunch
- **Mac:** Cmd+Q to quit, then relaunch

### Step 7: Verify Installation

1. Open a new chat in Claude Desktop
2. Send this message: `"refine this prompt: write a story about a dog"`
3. Claude should display a React artifact with 4 refined variants
4. Click the copy button on any variant to use it

**Success indicators:**
- ✓ React artifact appears with 4 prompt variants
- ✓ Each variant has a copy button
- ✓ Variants are labeled: Concise, Detailed, Creative, Analytical

---

## Configuration Details

### Database Storage Location

The database location is determined by `server/config.json`:

**Default location on Windows:**
```
C:\Users\YourUsername\.prompt-refiner\prompt_refiner.db
```

**To find your current database:**
1. Open: `C:\Users\james\Documents\prompt-refiner\server\config.json`
2. Look at the `database_path` value
3. If it starts with `~`, replace with `C:\Users\YourUsername`

### Graceful Fallback System

If the configured location is not writable (e.g., permissions issues), the server automatically falls back to:

1. **First fallback:** System temp directory
   - Windows: `%TEMP%\.prompt-refiner\prompt_refiner.db`
   - Location: `C:\Users\YourUsername\AppData\Local\Temp\.prompt-refiner\`

2. **Last resort:** In-memory database (`:memory:`)
   - Data is NOT saved between sessions
   - You'll see a warning message in the console

**Console messages:**
- ✓ `Using database: [path]` — Success, using configured location
- ⚠ `Using temp directory: [path]` — Fallback to temp (data may be cleaned up)
- ⚠ `WARNING: Using in-memory database` — No persistence

### Changing Configuration After Installation

1. **Stop Claude Desktop** (fully exit)
2. **Edit** `C:\Users\james\Documents\prompt-refiner\server\config.json`
3. **Save** the file
4. **Rebuild** the extension:
   ```bash
   cd C:\Users\james\Documents\prompt-refiner
   mcpb pack
   ```
5. **Reinstall** the new `.mcpb` file in Claude Desktop
6. **Restart** Claude Desktop

---

## Usage

### Refining Prompts

Simply ask Claude to refine a prompt:

**Examples:**
- `"Refine this prompt for me: Write a story about a dog"`
- `"Improve this prompt: Explain quantum computing"`
- `"Make this better: Give me tips for cooking pasta"`

Claude will:
1. Call the `refinePrompt` tool
2. Generate 4 variants (concise, detailed, creative, analytical)
3. Save them to the database
4. Display a React artifact with all variants and copy buttons

### Viewing History

Ask Claude to show your history:
- `"Show my prompt refinement history"`
- `"What prompts have I refined recently?"`

Claude will display an artifact with expandable cards showing all your past refinements.

### Copying Variants

Each variant has a copy button. Click it to copy the refined prompt to your clipboard, then paste it in your next message to Claude.

---

## Tools Reference

| Tool | Purpose | Parameters |
|------|---------|------------|
| `refinePrompt` | Generate and display 4 refined variants | `prompt` (string) |
| `getHistory` | View past refinements | `limit` (integer, default: 20) |

---

## File Structure
```
prompt-refiner/
├── manifest.json              # MCPB manifest (extension metadata)
├── package.json               # Root package (mcpb tooling)
├── icon.svg                   # Extension icon (vector)
├── icon.png                   # Extension icon (PNG)
├── README.md                  # This file
├── INSTALLATION.md            # Detailed installation guide
├── prompt-refiner.mcpb        # Built extension package (created by mcpb pack)
└── server/
    ├── index.js               # MCP server entry point
    ├── db.js                  # SQLite database layer
    ├── config.js              # Configuration and fallback handling
    ├── config.json            # User configuration (create this file)
    ├── config.json.example    # Configuration examples and documentation
    ├── llmAdapter.js          # LLM integration
    ├── package.json           # Server dependencies
    └── node_modules/          # Installed dependencies (created by npm install)
```

---

## Managing Your Data

### View Database Location

Check where your data is stored:
```bash
# Windows
type C:\Users\james\Documents\prompt-refiner\server\config.json

# Or open in Notepad
notepad C:\Users\james\Documents\prompt-refiner\server\config.json
```

### Backup Your History

Copy the database file to a safe location:
```bash
# Windows (using default location)
copy "%USERPROFILE%\.prompt-refiner\prompt_refiner.db" "D:\Backups\"

# Or if using custom location
copy "C:\path\to\your\prompts.db" "D:\Backups\"
```

### Reset/Clear History

Delete the database file to start fresh:
```bash
# Windows (default location)
del "%USERPROFILE%\.prompt-refiner\prompt_refiner.db"

# Or delete your custom location
del "C:\path\to\your\prompts.db"
```

The database will be automatically recreated (empty) on next use.

---

## Troubleshooting

### Installation Issues

**Problem:** `mcpb` command not found
- **Solution:** Install MCPB globally: `npm install -g @anthropic-ai/mcpb`
- Verify: `mcpb --version`

**Problem:** `npm install` fails in server directory
- **Solution:** Ensure Node.js is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and try again

**Problem:** Extension doesn't appear in Claude Desktop
- **Solution:** Fully restart Claude Desktop (exit completely, not just close window)
- Check Settings → Extensions to see if it's listed
- Try reinstalling the `.mcpb` file

### Configuration Issues

**Problem:** Can't find config.json
- **Location:** `C:\Users\james\Documents\prompt-refiner\server\config.json`
- **Solution:** Copy from `config.json.example` or create manually:
  ```json
  {
    "database_path": "~/.prompt-refiner/prompt_refiner.db"
  }
  ```

**Problem:** Changes to config.json not taking effect
- **Solution:** 
  1. Save the config.json file
  2. Rebuild: `mcpb pack`
  3. Reinstall the new .mcpb in Claude Desktop
  4. Fully restart Claude Desktop

**Problem:** Permission denied when accessing database
- **Symptom:** Console shows "Cannot use configured path"
- **Solution:** 
  - The server will automatically fall back to temp or memory storage
  - Check console output to see which location is being used
  - Configure a different path in config.json that you have write access to
  - Try a path in your Documents folder or user directory

### Runtime Issues

**Problem:** Data not persisting between sessions
- **Cause:** Using `:memory:` storage or temp directory being cleaned up
- **Solution:**
  1. Check console output on startup for storage location
  2. Edit config.json to use a permanent location
  3. Rebuild and reinstall
  4. Restart Claude Desktop

**Problem:** Extension stops working after update
- **Solution:**
  1. Uninstall the extension from Settings → Extensions
  2. Rebuild: `mcpb pack`
  3. Reinstall the new .mcpb file
  4. Restart Claude Desktop

**Problem:** Refinement artifacts not displaying
- **Solution:**
  - Check that the tool is being called (ask Claude explicitly: "refine this prompt: test")
  - Verify extension is installed and enabled in Settings → Extensions
  - Try in a new chat conversation
  - Restart Claude Desktop

### Viewing Console Output

To see console messages (including database location info):

**Windows:**
1. Close Claude Desktop
2. Open Command Prompt or PowerShell
3. Navigate to Claude Desktop installation
4. Run Claude Desktop from command line to see console output

**Note:** Console output visibility varies by platform. The server will write messages but you may not always see them in the UI.

---

## Enterprise Deployment

### Pre-configured Installation

For organizations deploying to multiple users:

1. **Create config.json before building:**
   ```json
   {
     "database_path": "C:\\ProgramData\\PromptRefiner\\prompts.db"
   }
   ```

2. **Create target directory with appropriate permissions:**
   ```powershell
   New-Item -Path "C:\ProgramData\PromptRefiner" -ItemType Directory -Force
   icacls "C:\ProgramData\PromptRefiner" /grant Users:(OI)(CI)M
   ```

3. **Build and deploy the .mcpb file:**
   ```bash
   cd C:\Users\james\Documents\prompt-refiner
   mcpb pack
   # Distribute prompt-refiner.mcpb to users
   ```

4. **Instruct users to:**
   - Double-click the .mcpb file
   - Restart Claude Desktop

### Network Drive Configuration

For shared storage:
```json
{
  "database_path": "\\\\fileserver\\shared\\PromptRefiner\\prompts.db"
}
```

Or mapped drive:
```json
{
  "database_path": "Z:\\PromptRefiner\\prompts.db"
}
```

### Locked-Down Machines

If machines have restricted permissions:
- The server will automatically fall back to temp or in-memory storage
- Users will see console warnings about the fallback
- Consider pre-creating directories with appropriate permissions
- Test on a restricted machine before wide deployment

---

## Development

### Making Changes

1. **Edit source files** in the `server/` directory
2. **Test changes:**
   ```bash
   cd server
   node index.js  # Test server directly if needed
   ```
3. **Rebuild:**
   ```bash
   cd ..
   mcpb pack
   ```
4. **Reinstall** in Claude Desktop
5. **Restart** Claude Desktop

### Development Tips

- **JavaScript changes** in `server/` are included when you run `mcpb pack`
- **Manifest changes** in `manifest.json` require rebuilding
- **Icon changes** require rebuilding
- **Config changes** require rebuilding and reinstalling
- Use `console.log()` for debugging (output may not be visible in all environments)

---

## Example Workflow

```
You: "improve prompt: what is a Christmas tree in uk"

Claude: [calls refinePrompt tool internally]
        [displays React artifact with 4 variants]
        
        Concise:    "Define Christmas tree in UK context"
        Detailed:   "Explain the cultural significance and traditions..."
        Creative:   "Paint a vivid picture of a British Christmas tree..."
        Analytical: "Break down the historical, cultural, and commercial..."

You: [clicks Copy button on "Detailed" variant]
     [pastes in next message]
     "Explain the cultural significance and traditions..."

Claude: [provides comprehensive response using the refined prompt]
```

---

## Support

**For issues or questions:**
- Review this README and INSTALLATION.md
- Check console output for diagnostic messages
- Verify file paths and permissions
- Ensure you've followed all installation steps
- Contact: James at The Access Group

---

## License

MIT

---

## Version History

**v1.1.0** - Configuration system with graceful fallback
- Added configurable database location
- Automatic fallback to temp/memory storage
- Enhanced documentation

**v1.0.0** - Initial release
- Four refinement styles
- History tracking
- React-based UI artifacts