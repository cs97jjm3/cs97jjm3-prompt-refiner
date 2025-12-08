#!/usr/bin/env node

const readline = require('readline');
const db = require('./db');
const { STYLE_GUIDANCE, getAllStyles, generateDiff } = require('./llmAdapter');

// MCP Server for Claude Desktop - uses stdio protocol
class PromptRefinerMCP {
  constructor() {
    this.tools = {
      refinePrompt: {
        name: 'refinePrompt',
        description: 'Stores a prompt and returns refinement guidance. Claude should generate variants based on the guidance, then call saveVariant for each, and finally display ALL variants to the user in a React artifact with card components showing each style.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The original prompt to refine'
            },
            styles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['concise', 'detailed', 'creative', 'analytical']
              },
              description: 'Styles to generate (defaults to all four)'
            }
          },
          required: ['prompt']
        }
      },
      saveVariant: {
        name: 'saveVariant',
        description: 'Saves a refined prompt variant to the database',
        inputSchema: {
          type: 'object',
          properties: {
            promptId: {
              type: 'integer',
              description: 'ID of the original prompt'
            },
            style: {
              type: 'string',
              enum: ['concise', 'detailed', 'creative', 'analytical'],
              description: 'Style of this variant'
            },
            refinedText: {
              type: 'string',
              description: 'The refined prompt text'
            }
          },
          required: ['promptId', 'style', 'refinedText']
        }
      },
      diffPrompt: {
        name: 'diffPrompt',
        description: 'Shows differences between original and refined prompt. Display the result as a React artifact with color-coded diff view (red for removed, green for added).',
        inputSchema: {
          type: 'object',
          properties: {
            originalId: {
              type: 'integer',
              description: 'ID of the original prompt'
            },
            variantId: {
              type: 'integer',
              description: 'ID of the variant to compare'
            }
          },
          required: ['originalId', 'variantId']
        }
      },
      acceptVariant: {
        name: 'acceptVariant',
        description: 'Records that the user chose a specific variant. Display the accepted prompt prominently in an artifact with a copy button.',
        inputSchema: {
          type: 'object',
          properties: {
            variantId: {
              type: 'integer',
              description: 'ID of the accepted variant'
            }
          },
          required: ['variantId']
        }
      },
      getHistory: {
        name: 'getHistory',
        description: 'Retrieves history of refined prompts and decisions. Display as a React artifact with a table or list view.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'Maximum number of records to return (default 20)'
            }
          }
        }
      },
      displayVariants: {
        name: 'displayVariants',
        description: 'Displays saved variants for a prompt in a visual artifact. Call this after saving all variants to show them to the user.',
        inputSchema: {
          type: 'object',
          properties: {
            promptId: {
              type: 'integer',
              description: 'ID of the prompt to display variants for'
            }
          },
          required: ['promptId']
        }
      }
    };
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id);
        case 'tools/list':
          return this.handleListTools(id);
        case 'tools/call':
          return this.handleToolCall(params, id);
        default:
          return this.errorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      return this.errorResponse(id, -32603, error.message);
    }
  }

  handleInitialize(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'prompt-refiner',
          version: '1.0.0'
        }
      }
    };
  }

  handleListTools(id) {
    const toolList = Object.values(this.tools).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));

    return {
      jsonrpc: '2.0',
      id,
      result: { tools: toolList }
    };
  }

  async handleToolCall(params, id) {
    const { name, arguments: args } = params;

    let result;
    switch (name) {
      case 'refinePrompt':
        result = await this.refinePrompt(args);
        break;
      case 'saveVariant':
        result = await this.saveVariant(args);
        break;
      case 'diffPrompt':
        result = await this.diffPrompt(args);
        break;
      case 'acceptVariant':
        result = await this.acceptVariant(args);
        break;
      case 'getHistory':
        result = await this.getHistory(args);
        break;
      case 'displayVariants':
        result = await this.displayVariants(args);
        break;
      default:
        return this.errorResponse(id, -32602, `Unknown tool: ${name}`);
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      }
    };
  }

  async refinePrompt(args) {
    const { prompt, styles } = args;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required and must not be empty' };
    }

    const promptId = await db.savePrompt(prompt.trim());
    const stylesToUse = styles || getAllStyles();
    
    const guidance = stylesToUse.map(style => {
      const info = STYLE_GUIDANCE[style];
      return {
        style: style,
        name: info.name,
        description: info.description,
        instruction: info.instruction
      };
    });

    return {
      success: true,
      promptId: promptId,
      originalPrompt: prompt.trim(),
      instructions: `Generate refined variants for each style below. For each variant:
1. Call saveVariant with promptId=${promptId}, the style name, and your refined text
2. After saving ALL variants, call displayVariants with promptId=${promptId} to show the user a visual comparison

The user will then be able to select their preferred version.`,
      refinementGuidance: guidance
    };
  }

  async saveVariant(args) {
    const { promptId, style, refinedText } = args;

    if (!promptId || !style || !refinedText) {
      return { success: false, error: 'promptId, style, and refinedText are all required' };
    }

    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
      return { success: false, error: 'Original prompt not found' };
    }

    const variantId = await db.saveVariant(promptId, style, refinedText.trim());

    return {
      success: true,
      variantId: variantId,
      promptId: promptId,
      style: style,
      message: `Saved ${style} variant (ID: ${variantId})`
    };
  }

  async displayVariants(args) {
    const { promptId } = args;

    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
      return { success: false, error: 'Prompt not found' };
    }

    const variants = await db.getVariantsForPrompt(promptId);
    
    if (variants.length === 0) {
      return { success: false, error: 'No variants found for this prompt' };
    }

    // Return data structured for artifact display
    return {
      success: true,
      displayType: 'variants',
      promptId: promptId,
      original: prompt.original_text,
      variants: variants.map(v => ({
        id: v.id,
        style: v.style,
        styleName: STYLE_GUIDANCE[v.style]?.name || v.style,
        styleDescription: STYLE_GUIDANCE[v.style]?.description || '',
        text: v.refined_text
      })),
      artifactInstructions: `Display these variants in a React artifact with:
- A header showing the original prompt
- Cards for each variant with style name, description, and the refined text
- A "Use This" button on each card that tells the user to say "accept variant [id]"
- Use a clean, modern design with good contrast between cards
- Style colors: concise=#3b82f6, detailed=#8b5cf6, creative=#f59e0b, analytical=#10b981`
    };
  }

  async diffPrompt(args) {
    const { originalId, variantId } = args;

    const prompt = await db.getPrompt(originalId);
    const variant = await db.getVariant(variantId);

    if (!prompt) {
      return { success: false, error: 'Original prompt not found' };
    }
    if (!variant) {
      return { success: false, error: 'Variant not found' };
    }

    const diff = generateDiff(prompt.original_text, variant.refined_text);

    return {
      success: true,
      displayType: 'diff',
      original: prompt.original_text,
      refined: variant.refined_text,
      style: variant.style,
      styleName: STYLE_GUIDANCE[variant.style]?.name || variant.style,
      diff: diff,
      artifactInstructions: `Display this diff in a React artifact with:
- Side-by-side or inline diff view
- Red background (#fee2e2) for removed lines with strikethrough
- Green background (#dcfce7) for added lines
- Gray for unchanged lines
- A header showing which style variant this is`
    };
  }

  async acceptVariant(args) {
    const { variantId } = args;

    const variant = await db.getVariant(variantId);
    if (!variant) {
      return { success: false, error: 'Variant not found' };
    }

    const decisionId = await db.recordDecision(variant.prompt_id, variantId);

    return {
      success: true,
      displayType: 'accepted',
      decisionId: decisionId,
      acceptedVariant: {
        id: variant.id,
        style: variant.style,
        styleName: STYLE_GUIDANCE[variant.style]?.name || variant.style,
        text: variant.refined_text
      },
      artifactInstructions: `Display the accepted prompt in a React artifact with:
- A success header (green) saying "Prompt Accepted"
- The style name as a badge
- The refined prompt text in a prominent box
- A copy-to-clipboard button that copies the text
- Clean, celebratory design`
    };
  }

  async getHistory(args) {
    const limit = args?.limit || 20;
    const history = await db.getDecisionHistory(limit);

    return {
      success: true,
      displayType: 'history',
      count: history.length,
      history: history.map(h => ({
        id: h.id,
        acceptedAt: h.accepted_at,
        originalPrompt: h.original_text,
        style: h.style,
        styleName: STYLE_GUIDANCE[h.style]?.name || h.style,
        refinedPrompt: h.refined_text
      })),
      artifactInstructions: `Display this history in a React artifact with:
- A table or card list showing past refinements
- Columns: Date, Original (truncated), Style, Refined (truncated)
- Click to expand and see full text
- Most recent first
- Clean, readable design`
    };
  }

  errorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message }
    };
  }
}

async function main() {
  await db.initDatabase();
  
  const server = new PromptRefinerMCP();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line);
      const response = await server.handleRequest(request);
      console.log(JSON.stringify(response));
    } catch (error) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' }
      };
      console.log(JSON.stringify(errorResponse));
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
