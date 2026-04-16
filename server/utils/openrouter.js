import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Safely extracts the first valid JSON array from an AI response string.
 * Handles:
 * - Raw JSON string
 * - ```json wrapped blocks
 * - Extra text before/after JSON
 * - Array embedded inside text
 */
const extractJsonArray = (raw) => {
  if (!raw) {
    console.log('[SmartScan] Parser Error: Raw content is empty');
    return null;
  }

  // Clean potential markdown fences
  let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 1. Try direct parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {
    // Keep going to regex if direct parse fails
  }

  // 2. Regex fallback: extract the first [...] block
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.log('[SmartScan] Parser Error: Regex match found but invalid JSON:', e.message);
    }
  } else {
    console.log('[SmartScan] Parser Error: No JSON array patterns found in response');
  }

  return null;
};

/**
 * analyzeImage — sends an image to vision models with automatic fallback.
 * Order: llama-4-scout:free -> gemini-2.0-flash-exp:free -> gpt-4.1-mini
 */
export const analyzeImage = async (base64Image, mimeType = 'image/jpeg') => {
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const models = [
    'meta-llama/llama-4-scout:free',
    'google/gemini-2.0-flash-exp:free',
    'openai/gpt-4.1-mini'
  ];

  let lastError = null;

  for (const model of models) {
    console.log(`[SmartScan] Trying model: ${model}`);

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: model,
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract transaction details from this payment screenshot (Google Pay, PhonePe, Paytm, Slice, Bank apps, etc.). 
Return ONLY a valid JSON array of objects. 
Fields: amount (number), type ("expense" or "income"), category ( Food/Transport/Rent/Salary/Bills/Entertainment/Health/Shopping/Other), date (YYYY-MM-DD), notes (merchant/app name).
Example: [{"amount": 500, "type": "expense", "category": "Food", "date": "2024-03-25", "notes": "Zomato"}]
If no transactions found, return [].`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 40000
        }
      );

      const choice = response.data?.choices?.[0];
      if (!choice) {
        console.log(`[SmartScan] Model ${model} returned no choices.`);
        continue;
      }

      // Handle both content path variations
      let rawContent = '';
      if (typeof choice.message?.content === 'string') {
        rawContent = choice.message.content;
      } else if (Array.isArray(choice.message?.content)) {
        rawContent = choice.message.content.find(p => p.type === 'text')?.text || '';
      }

      console.log(`[SmartScan] Raw response from ${model}:`, rawContent);

      const transactions = extractJsonArray(rawContent);

      if (transactions) {
        console.log(`[SmartScan] Model succeeded: ${model}`);
        console.log('[SmartScan] Extracted array:', JSON.stringify(transactions, null, 2));
        return transactions;
      } else {
        console.log(`[SmartScan] Model ${model} failed to provide valid JSON.`);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`[SmartScan] Model ${model} error:`, errorMsg);
      lastError = errorMsg;
      // Continue to next model
    }
  }

  // If all models failed
  throw new Error(`All vision models failed. Last error: ${lastError || 'Unknown processing error'}`);
};

export const generateInsights = async (transactions, currency = 'USD') => {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          {
            role: 'system',
            content: "You are a financial advisor. Return ONLY a valid JSON object. No markdown formatting, NO ```json block."
          },
          {
            role: 'user',
            content: `Analyze these transactions and provide financial insights.
            Transactions (in INR): ${JSON.stringify(transactions)}
            
            IMPORTANT CONVERSION RULES:
            - The transactions above are in INR.
            - If target currency is USD, use rate: 1 USD = 93.4 INR.
            - If target currency is GBP, use rate: 1 GBP = 121 INR.
            - Always perform the math based on these rates.
            
            Return a JSON object with this exact structure:
            {
              "topCategory": "string (the category with highest spending)",
              "unnecessaryExpense": "string (Identify the biggest or most frivolous expense briefly - MUST include ${currency} value)",
              "savingsComparison": "string (Brief statement on savings - invent hypothetical context if only current month data exists - MUST include ${currency} value)",
              "suggestions": ["string", "string", "string"],
              "predictedBudget": "string (Estimated budget for next month, strictly formatted in ${currency})",
              "smartTip": "string (One very short actionable tip for the dashboard)"
            }
            All monetary values MUST be strictly formatted in ${currency}. Do not use USD or $ unless USD is the requested currency.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let content = response.data.choices[0].message.content;

    // clean markdown
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // extract only JSON part
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log("AI RAW:", content);
      throw new Error("Invalid AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenRouter Text API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate insights');
  }
};
