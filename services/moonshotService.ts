
import { MPFFund, Scenario, ScenarioAllocation } from '../types';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a production app, never hardcode API keys on the client. 
// This should be proxied through a backend.
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const DEFAULT_KIMI_API_KEY = 'sk-Q7BMmOvpJH77xzGirIqwNg6EyBVXvmmDmA15T2MY17sVvePN'; 

// Map of Trustee Codes/Names from CSV to common spoken aliases for matching
const TRUSTEE_ALIASES: Record<string, string[]> = {
    'AIAT': ['aia', 'prime value'],
    'BCT': ['bct', 'bank consortium'],
    'BCOM': ['bcom', 'bank of communications', 'joyful'],
    'BEA': ['bea', 'bank of east asia'],
    'BOCIP': ['boc', 'prudential', 'boc-prudential', 'easy-choice', 'my choice'],
    'China Life': ['china life'],
    'HSBC': ['hsbc', 'hang seng', 'supertrust'],
    'Manulife': ['manulife', 'global select', 'retirechoice'],
    'PRIN': ['principal', 'smart plan', 'simple plan'],
    'SCT': ['shkp', 'sun hung kai'],
    'Sun Life': ['sun life', 'rainbow'],
    'YF Life': ['yf life', 'mass', 'mass mandatory', 'mass mpf'],
};

export const callKimiAPI = async (
  userMessage: string, 
  allFunds: MPFFund[], 
  history: any[], 
  apiKey?: string, 
  portfolioContext?: string,
  generatedScenariosContext?: string
): Promise<string> => {
  
  // --- Smart Context Retrieval ---
  // Instead of slicing the first 30 funds, we dynamically select relevant funds
  // based on the user's query and fund popularity (AUM).
  
  const query = userMessage.toLowerCase();
  
  const scoredFunds = allFunds.map(fund => {
      let score = 0;
      const trusteeCode = fund.mpf_trustee;
      const scheme = fund.scheme_name.toLowerCase();
      const trusteeAliases = TRUSTEE_ALIASES[trusteeCode] || [trusteeCode.toLowerCase()];

      // 1. High Priority: Direct match with Scheme or Trustee alias in user query
      // This ensures if user asks for "MASS", YF Life/MASS funds get top priority.
      if (trusteeAliases.some(alias => query.includes(alias))) {
          score += 1000;
      }
      if (scheme.includes(query)) {
          score += 1000;
      }

      // 2. Medium Priority: Match funds already in the user's portfolio context
      if (portfolioContext && portfolioContext.toLowerCase().includes(fund.constituent_fund.toLowerCase())) {
          score += 500;
      }

      // 3. Baseline Priority: Use Fund Size (AUM) as a proxy for general importance
      // Funds with larger AUM are more likely to be relevant in general contexts.
      // Dividing by 1000 to keep it as a tie-breaker below name matches.
      score += (fund.fund_size_hkd_m || 0) / 1000;

      return { fund, score };
  });

  // Sort by score descending
  scoredFunds.sort((a, b) => b.score - a.score);

  // Select top N funds to fit in context window. 
  // Reduced to 60 to prevent hitting 8k token limit (Error 400).
  // 60 funds * ~100 chars/line ≈ 6000 chars.
  const contextFunds = scoredFunds.slice(0, 60).map(item => item.fund);

  const fundContext = contextFunds.map(f => 
    `${f.constituent_fund} (${f.mpf_trustee}): 1Y=${f.annualized_return_1y}%, 3Y=${f.annualized_return_3y}%, 5Y=${f.annualized_return_5y}%, FER=${f.latest_fer}%, Risk=${f.risk_class}`
  ).join('\n');

  const systemPrompt = `You are a professional Hong Kong MPF investment advisor adhering to official MPF data standards (https://www.mpfa.org.hk).
  
  ${portfolioContext ? `\nCURRENT USER PORTFOLIO CONTEXT (from uploaded files):\n${portfolioContext}\nIMPORTANT: Use this current portfolio as a BASELINE. When the user asks for portfolio suggestions or optimization, ALWAYS generate exactly 3 distinct scenarios (Scenario 1, Scenario 2, Scenario 3) with different risk/return profiles based on this baseline.\n` : ''}
  
  ${generatedScenariosContext ? `\nPREVIOUSLY GENERATED SCENARIOS (Active Context):\nThe user may refer to these scenarios by number (e.g., "Scenario 1"). Use these details to answer follow-up questions regarding risks, returns, or composition. Do not generate new scenarios unless explicitly asked to "optimize" or "suggest" again. Just analyze the existing ones below if asked.\n${generatedScenariosContext}\n` : ''}
  
  RELEVANT MARKET DATA (Use ONLY this data for recommendations):
  ${fundContext}
  
  Instructions:
  - STRICTLY ONLY recommend funds that are explicitly listed in the "RELEVANT MARKET DATA" section above. Do NOT hallucinate funds.
  - You are NOT bounded by the current portfolio's scheme or trustee. You MUST recommend funds from other schemes (like MASS/YF Life, Manulife, HSBC, etc.) if they appear in the data and fit the user's request.
  - If the user asks for a specific scheme (e.g., "MASS") and you see funds for it in the data above, USE THEM.
  - Provide optimization recommendations based on the available data.
  - If recommending a portfolio, break it down into "Scenarios" (e.g., Scenario 1: Aggressive).
  - For each scenario, list specific funds and their allocation percentages CLEARLY in a separate line using the format: "- [Full Fund Name]: [Allocation]%" 
  - Example: "- Manulife MPF Core Accumulation Fund: 40%"
  - When listing funds, ALWAYS include the full fund name including the trustee/scheme to avoid ambiguity.
  - Mention the expected 1Y return and FER for the scenario.
  - Support English and Traditional Chinese.
  `;

  // Map application message format to API format
  // Truncate message content to 800 chars to conserve tokens for the system prompt/fund data
  const formattedHistory = history.slice(-6).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: (msg.text || ' ').slice(0, 800)
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: userMessage }
  ];

  const token = (apiKey && apiKey.trim().length > 0) ? apiKey : DEFAULT_KIMI_API_KEY;

  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Kimi API Error:', error);
    throw error;
  }
};

export const parseResponseForVisualization = (responseText: string, allFunds: MPFFund[]): { text: string, scenarios: Scenario[] } => {
  const scenarios: Scenario[] = [];
  
  // Regex to identify scenarios
  // Improved regex to capture "Scenario 1:", "**Scenario 2**", "### Scenario 3"
  const splitText = responseText.split(/((?:Scenario|Option|方案)\s*(?:\d+|[A-C]))/i);
  
  for (let i = 1; i < splitText.length; i += 2) {
    const delimiter = splitText[i];
    const segment = splitText[i+1];
    
    if (!segment) continue;

    // Extract descriptive title
    let titleSuffix = '';
    const firstLineEnd = segment.indexOf('\n');
    if (firstLineEnd !== -1) {
        let firstLine = segment.substring(0, firstLineEnd).trim();
        firstLine = firstLine.replace(/^[:\-\s]+/, '').replace(/[\*\s]+$/, '');
        if (firstLine.length > 0 && firstLine.length < 100) {
            titleSuffix = `: ${firstLine}`;
        }
    }

    const allocations: ScenarioAllocation[] = [];
    
    const lines = segment.split('\n');
    lines.forEach(line => {
      // Find all percentages in the line
      const allPercentages = [...line.matchAll(/(\d+(?:\.\d+)?)%/g)];
      
      let validAllocation: number | null = null;

      if (allPercentages.length > 0) {
          // Heuristic: Check the last percentage first, as allocations are often listed last
          // e.g. "Manulife Fund (1Y: 5%): 40%"
          for (let j = allPercentages.length - 1; j >= 0; j--) {
              const match = allPercentages[j];
              const index = match.index || 0;
              const precedingText = line.substring(Math.max(0, index - 15), index).toLowerCase();
              
              // If preceded by stats indicators, ignore
              // e.g. "1Y=", "FER=", "Return", "Risk"
              if (precedingText.match(/(1y|3y|5y|fer|risk|return|fee|year)=?\s*:?\s*$/)) {
                  continue;
              }
              
              validAllocation = parseFloat(match[1]);
              break; // Found the most likely allocation
          }
      }

      if (validAllocation !== null) {
        const percent = validAllocation;
        // Clean line for matching: remove stats in parentheses to avoid false matches on keywords inside stats
        const lineClean = line.replace(/\([^)]*\)/g, '').toLowerCase();
        
        let bestFund: MPFFund | null = null;
        let maxScore = 0;

        allFunds.forEach(fund => {
            let score = 0;
            const fundName = fund.constituent_fund.toLowerCase();
            const trusteeCode = fund.mpf_trustee; // e.g. 'AIAT', 'BCT'
            const schemeName = fund.scheme_name.toLowerCase();
            
            // Get list of aliases for this trustee
            const trusteeAliases = TRUSTEE_ALIASES[trusteeCode] || [trusteeCode.toLowerCase()];

            // 1. Exact constituent fund name match (Highest priority)
            if (lineClean.includes(fundName)) {
                score += 50;
            }

            // 2. Trustee name match (Critical for disambiguation)
            const hasTrusteeMatch = trusteeAliases.some(alias => lineClean.includes(alias));
            if (hasTrusteeMatch) {
                score += 30; // Boosted weight
            } else {
                // Check if a DIFFERENT trustee is explicitly mentioned
                // Iterate all known alias lists. If one matches that IS NOT the current fund's trustee, penalize.
                let mentionedOtherTrustee = false;
                for (const [code, aliases] of Object.entries(TRUSTEE_ALIASES)) {
                    if (code !== trusteeCode) {
                        if (aliases.some(alias => lineClean.includes(alias))) {
                            mentionedOtherTrustee = true;
                            break;
                        }
                    }
                }
                
                if (mentionedOtherTrustee) {
                    score -= 100; // Strong penalty for mismatch
                }
            }

            // 3. Keyword token matching
            const cleanName = fundName.replace(/\b(mpf|fund|portfolio|scheme|class|the|trust|choice)\b/g, '').trim();
            const tokens = cleanName.split(/[\s\-\(\)]+/).filter(t => t.length > 2);
            
            let tokenMatches = 0;
            tokens.forEach(token => {
                if (lineClean.includes(token)) {
                    tokenMatches++;
                }
            });

            if (tokens.length > 0) {
                score += (tokenMatches / tokens.length) * 20;
            }

            if (score > maxScore) {
                maxScore = score;
                bestFund = fund;
            }
        });

        // Threshold to accept a match
        if (bestFund && maxScore > 25) {
             allocations.push({
                fund: bestFund,
                allocation: percent,
                return1Y: (bestFund as MPFFund).annualized_return_1y,
                return5Y: (bestFund as MPFFund).annualized_return_5y,
                fer: (bestFund as MPFFund).latest_fer
            });
        }
      }
    });

    if (allocations.length > 0) {
      const numMatch = delimiter.match(/\d+/);
      const scenarioNum = numMatch ? parseInt(numMatch[0]) : (scenarios.length + 1);

      scenarios.push({
        number: scenarioNum,
        title: `${delimiter}${titleSuffix}`,
        allocations,
        text: segment.slice(0, 150) + '...',
        weightedFER: allocations.reduce((acc, curr) => acc + (curr.fer * (curr.allocation/100)), 0)
      });
    }
  }

  return {
    text: responseText,
    scenarios
  };
};

// Generates an explanatory image for the Glossary tab using Gemini
export const generateGlossaryImage = async (apiKey?: string): Promise<string> => {
  if (!process.env.API_KEY && !apiKey) {
    throw new Error("API Key is missing");
  }
  
  const key = apiKey || process.env.API_KEY;
  
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    // Using gemini-3-pro-image-preview as per instructions for high quality image generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Create a high-quality, educational infographic explaining Hong Kong MPF (Mandatory Provident Fund) concepts. 
            Layout the image into 4 clear quadrants:
            1. Returns: A line graph showing "Annualized Return" (smoothed) vs a bar chart showing "Calendar Year Return" (volatile).
            2. Fund Types: Icons representing different risk buckets - Equity (Bull), Bond (Certificate), Mixed Assets (Basket), Conservative (Safe).
            3. Risk Indicator: A colorful speedometer gauge ranging from Low (Green) to High (Red), labeled "Risk Class 1-7".
            4. Fees: A visual breakdown of costs - Management Fee, Joining Fee, Withdrawal Charge, visualized as coins or a pie chart.
            
            The style should be professional, flat vector art, using a trustworthy blue and green color palette suitable for a financial dashboard. 
            Text labels should be in English.`
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image data received");

  } catch (error) {
    console.error("Glossary Image Generation Error:", error);
    throw error;
  }
};
