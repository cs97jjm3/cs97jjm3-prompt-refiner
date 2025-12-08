# Prompt Refiner

An MCP Desktop Extension that helps you refine prompts in different styles. Claude does the refinement work directly - no external API calls needed.

## Features

- **Four refinement styles:**
  - **Concise** – Shorter and more direct
  - **Detailed** – Expanded with context and specifics
  - **Creative** – Encourages imaginative responses
  - **Analytical** – Structured for logical, systematic output

- **Auto-display** – Variants automatically appear when all 4 styles are saved
- **Interactive React UI** – Visual comparison with copy/select buttons
- **Diff view** – See exactly what changed between original and refined
- **History tracking** – All prompts, variants, and decisions stored in SQLite
- **No API keys** – Claude Desktop handles all the LLM work

## Author

Created by James at The Access Group for Business Analyst workflow optimization.

## Building the Extension

### Prerequisites

Install the MCPB toolchain globally:

```bash
npm install -g @anthropic-ai/mcpb
```

### Build Steps

```bash
cd C:\Users\james\Documents\prompt-refiner

# Install server dependencies
cd server
npm install
cd ..

# Package as .mcpb (only needed for manifest changes)
mcpb pack
```

This creates `prompt-refiner.mcpb` in the current directory.

### Install in Claude Desktop

1. Double-click the `.mcpb` file, or
2. Drag it into Claude Desktop's Settings window
3. Click "Install"

## Usage

Ask Claude to refine a prompt:

> "Refine this prompt for me: Write a story about a dog"

Claude will:
1. Call `refinePrompt` to store your prompt and get style guidance
2. Generate variants in each style using `saveVariant`
3. **Automatically display** the comparison interface when the 4th variant is saved
4. You select your preferred variant
5. Call `acceptVariant` to record your decision

## Workflow Improvement (v1.1.0)

**Before:** Manual 3-step process
- `refinePrompt` → `saveVariant` × 4 → `displayVariants` (manual call)

**Now:** Automatic 2-step process  
- `refinePrompt` → `saveVariant` × 4 (auto-displays on 4th save)

## Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `refinePrompt` | Store prompt, get refinement guidance | Always call first |
| `saveVariant` | Save a generated variant | Auto-displays after 4th variant |
| `displayVariants` | Manually display variants | Rarely needed due to auto-display |
| `diffPrompt` | Compare original vs variant | Shows color-coded changes |
| `acceptVariant` | Record user's choice | Creates confirmation artifact |
| `getHistory` | View past refinements | React artifact with expandable cards |

## File Structure

```
prompt-refiner/
├── manifest.json          # MCPB manifest
├── package.json           # Root package (mcpb tooling)
├── icon.svg               # Extension icon
├── icon.png              # Extension icon (PNG)
├── README.md
└── server/
    ├── index.js           # MCP server entry point
    ├── db.js              # SQLite database layer
    ├── llmAdapter.js      # Style guidance and diff logic
    └── package.json       # Server dependencies
```

## Data Storage

History is stored in `~/.prompt-refiner/prompt_refiner.db`

## Development Notes

- **JavaScript changes** are live - just restart Claude Desktop
- **Manifest changes** require `mcpb pack` and reinstalling the `.mcpb`
- All UI components use React with Tailwind CSS classes
- SQLite database auto-initializes on first run

## License

MIT
