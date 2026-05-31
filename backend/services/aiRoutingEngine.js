const departmentMappings = {
  electricity: 'TANGEDCO',
  power: 'TANGEDCO',
  current: 'TANGEDCO',
  eb: 'TANGEDCO',
  voltage: 'TANGEDCO',
  fuse: 'TANGEDCO',
  transformer: 'TANGEDCO',
  water: 'TWAD Board',
  leakage: 'TWAD Board',
  drainage: 'TWAD Board',
  garbage: 'Municipality',
  sanitation: 'Municipality',
  road: 'Highways Department',
  street: 'Highways Department',
  safety: 'Police Department',
  crime: 'Police Department',
  health: 'Health Department',
  hospital: 'Health Department'
};

/**
 * AI Routing Engine
 * Analyzes complaint content to determine administrative jurisdiction.
 */
const analyzeAndRoute = async (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  
  let detectedDept = 'Revenue'; // Default (matching statewide database seed)
  let priority = 'Medium';
  let severity = 'Medium';

  // Keyword Matching (In production, this would be a transformer model call)
  for (const [keyword, dept] of Object.entries(departmentMappings)) {
    if (content.includes(keyword)) {
      detectedDept = dept;
      break;
    }
  }

  // Priority detection
  if (content.includes('urgent') || content.includes('emergency') || content.includes('danger') || content.includes('critical')) {
    priority = 'High';
    severity = 'High';
  }

  let dbDept = detectedDept;
  if (detectedDept === 'TWAD Board') dbDept = 'TWAD';
  else if (detectedDept === 'Police Department') dbDept = 'Police';
  else if (detectedDept === 'Health Department') dbDept = 'Health';
  else if (detectedDept === 'Highways Department') dbDept = 'Revenue';
  else if (detectedDept === 'Municipality') dbDept = 'Revenue';

  return {
    department: dbDept,
    priority,
    severity,
    confidence: 0.85,
    routingPath: ['Citizen Portal', 'AI Analysis Node', dbDept]
  };
};

module.exports = { analyzeAndRoute };
