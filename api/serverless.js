// This is a serverless function for Vercel that handles API requests
// It provides mock data for the frontend to use

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract the API path from the request
  const path = req.url.replace(/^\/api\//, '');

  // Handle different API endpoints
  if (path.startsWith('llm/dark-web-surveillance') && req.method === 'POST') {
    // Mock response for dark web surveillance
    const mockReport = generateMockDarkWebReport(req.body);
    res.status(200).json({ content: mockReport });
    return;
  }

  // Default response for unhandled routes
  res.status(404).json({ error: 'Not found' });
}

// Function to generate mock dark web report
function generateMockDarkWebReport(requestData) {
  const { keywords = [], timeframe_days = 7, include_sources = false } = requestData;
  
  const threatLevels = ["Low", "Moderate", "Elevated", "High", "Severe"];
  const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
  
  const summaries = [
    `Analysis of dark web forums and marketplaces over the past ${timeframe_days} days has identified ${Math.floor(Math.random() * 10) + 3} discussions related to the monitored keywords. Most activity appears to be academic or speculative in nature, with no credible threats identified.`,
    `Monitoring has detected an ${Math.floor(Math.random() * 20) + 10}% increase in discussions related to viral mutations and bioengineering techniques. While most content remains theoretical, several users have expressed interest in practical applications.`,
    `Surveillance has identified a coordinated discussion thread across multiple forums regarding methods to synthesize viral vectors. The technical sophistication of these discussions suggests participants with advanced knowledge in molecular biology.`
  ];
  
  const findingsTemplates = [
    "1. Increased mention of {keyword} in specialized forums, primarily academic discussions\n2. Several users requesting information about {keyword2} synthesis protocols\n3. No evidence of actual bioengineering attempts\n4. One user claiming to have access to laboratory equipment",
    "1. Identified a closed group discussing {keyword} modification techniques\n2. Multiple references to published research on {keyword2}\n3. Sharing of publicly available genomic databases\n4. Discussion of hypothetical pandemic scenarios",
    "1. Detection of unusual terminology potentially used as code for {keyword}\n2. Users sharing links to academic papers on {keyword2}\n3. Discussion of laboratory security vulnerabilities\n4. Mention of specific geographic regions for potential release"
  ];
  
  const recommendationsTemplates = [
    "1. Continue monitoring mentioned forums for escalation\n2. Cross-reference usernames with known threat actors\n3. No immediate action required beyond standard surveillance",
    "1. Increase monitoring frequency for identified forums\n2. Alert relevant research institutions about potential security concerns\n3. Review access controls for public genomic databases\n4. Prepare briefing for health security officials",
    "1. Immediate notification to relevant authorities\n2. Enhanced monitoring of identified users\n3. Coordinate with international partners on cross-border threats\n4. Review biosecurity protocols at mentioned facilities"
  ];
  
  // Generate report components
  const summary = summaries[Math.floor(Math.random() * summaries.length)];
  
  // Select two random keywords for the findings
  const selectedKeywords = keywords.length >= 2 
    ? keywords.sort(() => 0.5 - Math.random()).slice(0, 2) 
    : [...keywords, ...keywords];
  
  const findingsTemplate = findingsTemplates[Math.floor(Math.random() * findingsTemplates.length)];
  const findings = findingsTemplate
    .replace("{keyword}", selectedKeywords[0] || "viral vectors")
    .replace("{keyword2}", selectedKeywords[1] || "gene editing");
  
  const details = `Detailed analysis of ${Math.floor(Math.random() * 80) + 20} forum posts and ${Math.floor(Math.random() * 25) + 5} marketplace listings revealed patterns consistent with ${["academic interest", "conspiracy theories", "potential threat actors", "disinformation campaigns"][Math.floor(Math.random() * 4)]}. Technical language analysis suggests participants have ${["basic", "intermediate", "advanced"][Math.floor(Math.random() * 3)]} knowledge of virology and molecular biology.`;
  
  const recommendations = recommendationsTemplates[Math.floor(Math.random() * recommendationsTemplates.length)];
  
  const credibility = `${Math.floor(Math.random() * 60) + 30}%`;
  const impact = ["Limited", "Moderate", "Significant", "Severe"][Math.floor(Math.random() * 4)];
  
  // Generate sources section if requested
  let sourcesSection = "";
  if (include_sources) {
    sourcesSection = `
## Sources
1. Forum: ${["DarkBioTalk", "ShadowLab", "BioCrypt", "NexusResearch"][Math.floor(Math.random() * 4)]} - ${Math.floor(Math.random() * 15) + 5} relevant posts
2. Marketplace: ${["BlackMarket", "HiddenExchange", "DarkBazaar"][Math.floor(Math.random() * 3)]} - ${Math.floor(Math.random() * 7) + 1} listings
3. Telegram group: ${["ViralResearch", "BioHackers", "SyntheticLife"][Math.floor(Math.random() * 3)]} - ${Math.floor(Math.random() * 40) + 10} messages
`;
  }
  
  // Format the current date
  const now = new Date();
  const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
  
  // Assemble the report
  return `
# Dark Web Surveillance Report
**Generated:** ${formattedDate}
**Timeframe:** Past ${timeframe_days} days
**Keywords monitored:** ${keywords.join(", ") || "None specified"}
**Confidence level:** ${Math.floor(Math.random() * 35) + 60}%

## Executive Summary
${summary}

## Key Findings
${findings}

## Threat Assessment
**Overall threat level:** ${threatLevel}
**Credibility of information:** ${credibility}
**Potential impact:** ${impact}

## Detailed Intelligence
${details}

## Recommended Actions
${recommendations}

${sourcesSection}

**CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY**
`;
}