# Prompt Refiner

An MCP Desktop Extension that helps you refine prompts in different styles. Claude does the refinement work directly - no external API calls needed.

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

# Package as .mcpb
mcpb pack
```

This creates `prompt-refiner.mcpb` in the current directory.

### Install in Claude Desktop

1. Double-click the `.mcpb` file, or
2. Drag it into Claude Desktop's Settings window
3. Click "Install"

## Usage

Simply ask Claude to refine a prompt:

> "Refine this prompt for me: Write a story about a dog"

Claude will:
1. Call `refinePrompt` with your original prompt
2. Generate 4 variants (concise, detailed, creative, analytical)
3. Save them to the database
4. Return a React artifact displaying all variants with copy buttons
5. You choose your preferred variant by copying it

That's it! One tool call, instant results.

## Tools

| Tool | Purpose | 
|------|---------|
| `refinePrompt` | Generate and display 4 refined variants |
| `getHistory` | View past refinements with expandable cards |

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
    └── package.json       # Server dependencies
```

## Data Storage

History is stored in `~/.prompt-refiner/prompt_refiner.db`

## Development Notes

- **JavaScript changes** are live - just restart Claude Desktop
- **Manifest changes** require `mcpb pack` and reinstalling the `.mcpb`
- All UI components use React with Tailwind CSS classes
- SQLite database auto-initializes on first run

## Example Workflow
```
You: "improve prompt: what is a Christmas tree in uk"

Claude: [calls refinePrompt internally]
        [displays React artifact with 4 variants]
        
You: [clicks Copy on your preferred variant]
     [uses the refined prompt in your next message]
```

## License

MIT