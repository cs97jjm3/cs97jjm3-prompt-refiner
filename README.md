# Prompt Refiner

An MCP Desktop Extension that helps you refine prompts in different styles. Claude does the refinement work directly - no external API calls needed.

## Features

- **Four refinement styles:**
  - **Concise** – Shorter and more direct
  - **Detailed** – Expanded with context and specifics
  - **Creative** – Encourages imaginative responses
  - **Analytical** – Structured for logical, systematic output

- **Diff view** – See exactly what changed between original and refined
- **History tracking** – All prompts, variants, and decisions stored in SQLite
- **No API keys** – Claude Desktop handles all the LLM work

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

Ask Claude to refine a prompt:

> "Refine this prompt for me: Write a story about a dog"

Claude will:
1. Call `refinePrompt` to store your prompt and get style guidance
2. Generate variants in each style
3. Call `saveVariant` for each one
4. Present the options to you
5. When you choose one, call `acceptVariant` to record your decision

## Tools

| Tool | Purpose |
|------|---------|
| `refinePrompt` | Store prompt, get refinement guidance |
| `saveVariant` | Save a generated variant |
| `diffPrompt` | Compare original vs variant |
| `acceptVariant` | Record user's choice |
| `getHistory` | View past refinements |

## File Structure

```
prompt-refiner/
├── manifest.json          # MCPB manifest
├── package.json           # Root package (mcpb tooling)
├── icon.svg               # Extension icon
├── README.md
└── server/
    ├── index.js           # MCP server entry point
    ├── db.js              # SQLite database layer
    ├── llmAdapter.js      # Style guidance and diff logic
    └── package.json       # Server dependencies
```

## Data Storage

History is stored in `~/.prompt-refiner/prompt_refiner.db`

## Licence

MIT
