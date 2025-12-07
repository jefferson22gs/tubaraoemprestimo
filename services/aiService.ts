
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: In a real app, API_KEY should be in process.env and calls should happen backend-side
// Safely access process.env to avoid "process is not defined" in browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || 'MOCK_KEY';
    }
  } catch (e) {
    // Ignore error
  }
  return 'MOCK_KEY';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface AIResponse {
  intent: 'PAYMENT_PROMISE' | 'REQUEST_BOLETO' | 'SUPPORT' | 'UNKNOWN';
  date?: string;
  replyMessage: string;
}

export const aiService = {
  /**
   * Analyzes a user message using Google Gemini to determine intent.
   * Simulates the logic for POST /api/webhooks/whatsapp
   */
  analyzeMessage: async (text: string): Promise<AIResponse> => {
    try {
      // Schema for structured output
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          intent: {
            type: Type.STRING,
            enum: ['PAYMENT_PROMISE', 'REQUEST_BOLETO', 'SUPPORT'],
            description: "The classification of the user's message."
          },
          date: {
            type: Type.STRING,
            description: "Extracted date if intent is PAYMENT_PROMISE (ISO or simple format). Null otherwise.",
            nullable: true
          },
          replyMessage: {
            type: Type.STRING,
            description: "A polite, short response to send back to the user via WhatsApp."
          }
        },
        required: ['intent', 'replyMessage']
      };

      // In a real scenario with a valid key:
      /*
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          systemInstruction: "You are a collection assistant for 'Tubarão Empréstimos'. Analyze the user's message. If they mention a date (e.g., 'I pay on the 15th'), return intent: 'PAYMENT_PROMISE' and the date. If they ask for a bill, invoice, or pix, return intent: 'REQUEST_BOLETO'. Otherwise, return 'SUPPORT'.",
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });
      return JSON.parse(response.text);
      */

      // MOCK IMPLEMENTATION (Since we don't have a real API Key in this environment)
      return mockGeminiAnalysis(text);

    } catch (error) {
      console.error("AI Analysis failed:", error);
      return { 
        intent: 'SUPPORT', 
        replyMessage: "Desculpe, não entendi. Um atendente humano irá te ajudar em breve." 
      };
    }
  },

  /**
   * Mocks the Asaas API to generate a Pix code
   */
  generatePixCode: async (amount: number): Promise<string> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    return `00020126330014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2).replace('.', '')}5802BR5913Tubarao Loans6008Sao Paulo62070503***6304`;
  }
};

// Helper for Mocking AI behavior without consuming quota/key
function mockGeminiAnalysis(text: string): AIResponse {
  const lower = text.toLowerCase();
  
  if (lower.includes('boleto') || lower.includes('pix') || lower.includes('pagar') || lower.includes('fatura')) {
    return {
      intent: 'REQUEST_BOLETO',
      replyMessage: "Entendido! Estou gerando seu código Pix para pagamento agora mesmo. Um momento..."
    };
  }
  
  if (lower.match(/\d{1,2}/) || lower.includes('amanhã') || lower.includes('semana que vem')) {
    return {
      intent: 'PAYMENT_PROMISE',
      date: new Date().toISOString(), // Mock date
      replyMessage: "Certo, registrei sua promessa de pagamento. Obrigado por avisar!"
    };
  }

  return {
    intent: 'SUPPORT',
    replyMessage: "Entendo. Vou transferir seu caso para um de nossos especialistas humanos."
  };
}
