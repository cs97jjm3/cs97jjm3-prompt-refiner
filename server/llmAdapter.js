// Style descriptions - Claude will use these to refine prompts
const STYLE_GUIDANCE = {
  concise: {
    name: 'Concise',
    description: 'Shorter and more direct',
    instruction: 'Rewrite to be shorter and more direct. Remove unnecessary words. Keep the core intent clear.'
  },
  detailed: {
    name: 'Detailed', 
    description: 'Expanded with context and specifics',
    instruction: 'Expand with more context and specificity. Add relevant details, constraints, and format preferences.'
  },
  creative: {
    name: 'Creative',
    description: 'Encourages imaginative responses',
    instruction: 'Rewrite to encourage more imaginative responses. Add elements that invite novel approaches.'
  },
  analytical: {
    name: 'Analytical',
    description: 'Structured for logical output',
    instruction: 'Restructure for systematic, logical responses. Break down into clear steps with good structure.'
  }
};

function getStyleGuidance(style) {
  return STYLE_GUIDANCE[style] || null;
}

function getAllStyles() {
  return Object.keys(STYLE_GUIDANCE);
}

function generateDiff(original, refined) {
  const originalLines = original.split('\n');
  const refinedLines = refined.split('\n');
  const diff = [];

  const maxLines = Math.max(originalLines.length, refinedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || '';
    const refLine = refinedLines[i] || '';

    if (origLine === refLine) {
      diff.push({ type: 'same', text: origLine });
    } else {
      if (origLine) {
        diff.push({ type: 'removed', text: origLine });
      }
      if (refLine) {
        diff.push({ type: 'added', text: refLine });
      }
    }
  }

  return diff;
}

module.exports = {
  STYLE_GUIDANCE,
  getStyleGuidance,
  getAllStyles,
  generateDiff
};
