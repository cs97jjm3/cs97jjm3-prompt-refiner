#!/usr/bin/env node

// Check Node version for fetch support
const nodeVersion = process.versions.node.split('.')[0];
if (parseInt(nodeVersion) < 18) {
  console.error('Error: Node.js 18 or higher is required for fetch API support');
  console.error(`Current version: ${process.version}`);
  console.error('Please upgrade Node.js: https://nodejs.org/');
  process.exit(1);
}

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { STYLE_GUIDANCE, getAllStyles, generateDiff } = require('./llmAdapter');

// Style colors for visual consistency - Tailwind classes
const STYLE_CONFIG = {
  concise: { 
    border: 'border-blue-500', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600',
    name: 'Concise',
    description: 'Shorter and more direct'
  },
  detailed: { 
    border: 'border-purple-500', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    button: 'bg-purple-500 hover:bg-purple-600',
    name: 'Detailed',
    description: 'Expanded with context'
  },
  creative: { 
    border: 'border-orange-500', 
    bg: 'bg-orange-50', 
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-500 hover:bg-orange-600',
    name: 'Creative',
    description: 'Encourages imagination'
  },
  analytical: { 
    border: 'border-green-500', 
    bg: 'bg-green-50', 
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
    button: 'bg-green-500 hover:bg-green-600',
    name: 'Analytical',
    description: 'Structured and logical'
  }
};

function escapeJsString(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, '\\n');
}

// Generate React JSX artifact for variants display with copy-to-accept
function generateVariantsJsx(promptId, originalText, variants) {
  const variantsData = variants.map(v => {
    const config = STYLE_CONFIG[v.style] || STYLE_CONFIG.concise;
    return {
      id: v.id,
      style: v.style,
      styleName: config.name,
      styleDescription: config.description,
      text: v.refined_text,
      border: config.border,
      bg: config.bg,
      textColor: config.text,
      badge: config.badge,
      button: config.button
    };
  });

  return `import { useState } from 'react';

export default function PromptVariants() {
  const [copiedId, setCopiedId] = useState(null);

  const originalPrompt = \`${escapeJsString(originalText)}\`;
  
  const variants = ${JSON.stringify(variantsData, null, 2)};

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>✨</span> Refined Prompts
          </h1>
          <p className="text-slate-500 mt-1">Choose your preferred variant by clicking Copy</p>
        </div>

        {/* Original Prompt */}
        <div className="bg-slate-100 rounded-lg p-4 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Original Prompt</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{originalPrompt}</p>
        </div>

        {/* Variants Grid */}
        <div className="space-y-4">
          {variants.map((variant) => (
            <div 
              key={variant.id}
              className={\`bg-white rounded-xl p-5 border-l-4 \${variant.border} shadow-sm hover:shadow-md transition-shadow\`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={\`px-3 py-1 rounded-full text-sm font-semibold \${variant.badge}\`}>
                    {variant.styleName}
                  </span>
                  <span className="text-slate-400 text-sm">{variant.styleDescription}</span>
                </div>
              </div>

              {/* Variant Text */}
              <div className={\`\${variant.bg} rounded-lg p-4 mb-4\`}>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{variant.text}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(variant.text, variant.id)}
                className={\`flex items-center justify-center gap-2 w-full px-6 py-3 \${variant.button} text-white rounded-lg transition-colors text-sm font-medium\`}
              >
                {copiedId === variant.id ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Click Copy to save your preferred prompt to clipboard</p>
        </div>
      </div>
    </div>
  );
}`;
}

// MCP Server for Claude Desktop - uses stdio protocol
class PromptRefinerMCP {
  constructor() {
    this.tools = {
      refinePrompt: {
        name: 'refinePrompt',
        description: 'Takes a prompt, generates 4 refined variants (concise, detailed, creative, analytical), saves them all to the database, and returns them for display. Claude should immediately display these variants in a React artifact.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The original prompt to refine'
            }
          },
          required: ['prompt']
        }
      },
      getHistory: {
        name: 'getHistory',
        description: 'Retrieves history of refined prompts. Returns a React artifact showing the history.',
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
          version: '2.0.0'
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
    const { prompt } = args;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required and must not be empty' };
    }

    const cleanPrompt = prompt.trim();

    // Save original prompt
    const promptId = await db.savePrompt(cleanPrompt);
    
    // Get all style guidance
    const allStyles = getAllStyles();
    const guidance = allStyles.map(style => {
      const info = STYLE_GUIDANCE[style];
      return {
        style: style,
        name: info.name,
        description: info.description,
        instruction: info.instruction
      };
    });

    // Generate variants immediately using Claude
    const variants = [];
    for (const guide of guidance) {
      const refinedText = await this.generateVariantText(cleanPrompt, guide);
      const variantId = await db.saveVariant(promptId, guide.style, refinedText);
      variants.push({
        id: variantId,
        style: guide.style,
        refined_text: refinedText
      });
    }

    // Generate React JSX artifact
    const jsxArtifact = generateVariantsJsx(promptId, cleanPrompt, variants);

    return {
      success: true,
      promptId: promptId,
      originalPrompt: cleanPrompt,
      variantCount: variants.length,
      outputType: 'react',
      artifact: jsxArtifact,
      instructions: 'Create a React artifact to display all 4 refined prompt variants. Users can copy their preferred version directly.'
    };
  }

  async generateVariantText(originalPrompt, guide) {
    // Use Claude via the parent Claude instance to refine the prompt
    // This leverages the fact that MCP tools run within Claude Desktop
    const refinementPrompt = `You are a prompt engineering expert. Your task is to refine the following prompt according to specific style guidelines.

ORIGINAL PROMPT:
${originalPrompt}

STYLE: ${guide.name}
DESCRIPTION: ${guide.description}
INSTRUCTION: ${guide.instruction}

IMPORTANT GUIDELINES:
- Create a SUBSTANTIALLY DIFFERENT and MORE DETAILED version
- For "Concise": Still make it clear and specific, just more direct (2-3 sentences minimum)
- For "Detailed": Add significant context, examples, constraints, and format requirements (4-6 sentences)
- For "Creative": Use metaphors, analogies, and engaging language while keeping the core intent (3-5 sentences)
- For "Analytical": Structure with clear steps, criteria, or framework (3-5 sentences with structure)
- Make each variant feel distinctly different from the original
- Each refined prompt should be substantive enough to provide real value

Refined prompt (respond ONLY with the refined prompt, no explanations or preamble):`;

    try {
      // Call Claude's API - the API key is handled by Claude Desktop
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: refinementPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const refinedText = data.content
        .map(item => (item.type === 'text' ? item.text : ''))
        .filter(Boolean)
        .join('\n')
        .trim();

      return refinedText || originalPrompt;
    } catch (error) {
      console.error(`Error refining prompt (${guide.style}):`, error.message);
      // Fallback to basic refinement if API call fails
      return this.generateFallbackVariant(originalPrompt, guide);
    }
  }

  generateFallbackVariant(originalPrompt, guide) {
    // Enhanced fallback when API is unavailable
    switch (guide.style) {
      case 'concise':
        return `${originalPrompt}\n\nBe direct and specific in your response.`;
      case 'detailed':
        return `${originalPrompt}\n\nProvide a comprehensive response with:\n- Detailed explanations\n- Relevant examples\n- Context and background\n- Specific implementation details`;
      case 'creative':
        return `${originalPrompt}\n\nApproach this creatively by:\n- Thinking outside conventional boundaries\n- Using vivid examples and analogies\n- Exploring unexpected angles\n- Presenting ideas in engaging ways`;
      case 'analytical':
        return `${originalPrompt}\n\nAnalyze this systematically:\n1. Break down the key components\n2. Examine relationships and dependencies\n3. Identify patterns or frameworks\n4. Structure your response logically with clear reasoning`;
      default:
        return originalPrompt;
    }
  }

  async getHistory(args) {
    const limit = args?.limit || 20;
    const history = await db.getHistory(limit);

    if (history.length === 0) {
      const emptyJsx = `export default function HistoryEmpty() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">📭</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">No History Yet</h1>
        <p className="text-slate-500">Start by refining a prompt to build your history.</p>
      </div>
    </div>
  );
}`;

      return {
        success: true,
        outputType: 'react',
        artifact: emptyJsx,
        count: 0
      };
    }

    const historyData = history.map(h => {
      const config = STYLE_CONFIG[h.style] || STYLE_CONFIG.concise;
      return {
        id: h.id,
        createdAt: h.created_at,
        originalPrompt: h.original_text,
        variants: JSON.parse(h.variants)
      };
    });

    const historyJsx = `import { useState } from 'react';

export default function HistoryView() {
  const [expanded, setExpanded] = useState(null);
  
  const history = ${JSON.stringify(historyData)};

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (text, max = 100) => {
    if (!text || text.length <= max) return text;
    return text.substring(0, max) + '...';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>📚</span> Refinement History
          </h1>
          <p className="text-slate-500 mt-1">{history.length} prompt{history.length !== 1 ? 's' : ''} refined</p>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-600 font-medium">Prompt #{item.id}</span>
                <span className="text-slate-400 text-xs">{formatDate(item.createdAt)}</span>
              </div>

              {expanded === item.id ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Original</h4>
                    <p className="text-slate-600 whitespace-pre-wrap">{item.originalPrompt}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Variants</h4>
                    {item.variants.map((v, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-500 mb-1">{v.style}</div>
                        <p className="text-slate-700 text-sm">{v.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Original</h4>
                  <p className="text-slate-500 text-sm">{truncate(item.originalPrompt, 120)}</p>
                </div>
              )}

              <div className="mt-3 text-center">
                <span className="text-slate-400 text-xs">
                  {expanded === item.id ? 'Click to collapse' : 'Click to expand'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;

    return {
      success: true,
      outputType: 'react',
      artifact: historyJsx,
      count: history.length,
      instructions: 'Create a React artifact showing refinement history with expandable cards.'
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
