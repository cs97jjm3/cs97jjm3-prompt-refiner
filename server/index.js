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
        description: 'Stores a prompt and returns refinement guidance for different styles. Claude should then generate the refined variants.',
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
        description: 'Shows differences between original prompt and a refined variant',
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
        description: 'Records that the user chose a specific variant',
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
        description: 'Retrieves history of refined prompts and decisions',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'Maximum number of records to return (default 20)'
            }
          }
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
      message: 'Prompt saved. Please generate refined variants using the guidance below, then save each with saveVariant.',
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
      message: `Saved ${style} variant. User can now review and accept it.`
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
      original: prompt.original_text,
      refined: variant.refined_text,
      style: variant.style,
      diff: diff
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
      decisionId: decisionId,
      message: 'Variant accepted and recorded.',
      acceptedVariant: {
        id: variant.id,
        style: variant.style,
        text: variant.refined_text
      }
    };
  }

  async getHistory(args) {
    const limit = args?.limit || 20;
    const history = await db.getDecisionHistory(limit);

    return {
      success: true,
      count: history.length,
      history: history
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
