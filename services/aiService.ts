const API_KEY = 'AIzaSyCvOjBiFTu-_oZ6vnJvXI9emGK50_G62i8';

export interface AIResponse {
  intent: 'PAYMENT_PROMISE' | 'REQUEST_BOLETO' | 'SUPPORT' | 'UNKNOWN';
  date?: string;
  replyMessage: string;
}

export const aiService = {
  /**
   * Analyzes a user message using Google Gemini (REST API) to determine intent.
   * Simulates the logic for POST /api/webhooks/whatsapp
   */
  analyzeMessage: async (text: string): Promise<AIResponse> => {
    try {
      console.log("Consulting Gemini AI...");
      
      const prompt = `
        You are a collection assistant for 'Tubarão Empréstimos'. 
        Analyze the user's message: "${text}".
        
        Determine the intent from these options:
        - PAYMENT_PROMISE: If they mention a date to pay (e.g., 'I pay on the 15th', 'amanhã').
        - REQUEST_BOLETO: If they ask for a bill, invoice, code, or pix.
        - SUPPORT: For anything else.

        Return ONLY a JSON object with this structure (no markdown):
        {
          "intent": "STRING",
          "date": "STRING (ISO format or null)",
          "replyMessage": "STRING (A polite, short response in Portuguese)"
        }
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
        const rawText = data.candidates[0].content.parts[0].text;
        // Clean markdown code blocks if present
        const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
      }

      throw new Error("Invalid response structure from Gemini");

    } catch (error) {
      console.error("AI Analysis failed, falling back to local logic:", error);
      return mockGeminiAnalysis(text);
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

// Fallback Helper in case API quota is reached or network fails
function mockGeminiAnalysis(text: string): AIResponse {
  const lower = text.toLowerCase();
  
  if (lower.includes('boleto') || lower.includes('pix') || lower.includes('pagar') || lower.includes('fatura')) {
    return {
      intent: 'REQUEST_BOLETO',
      replyMessage: "Entendido! Estou gerando seu código Pix para pagamento agora mesmo."
    };
  }
  
  if (lower.match(/\d{1,2}/) || lower.includes('amanhã') || lower.includes('semana')) {
    return {
      intent: 'PAYMENT_PROMISE',
      date: new Date().toISOString(), 
      replyMessage: "Certo, registrei sua promessa de pagamento. Obrigado!"
    };
  }

  return {
    intent: 'SUPPORT',
    replyMessage: "Entendo. Vou transferir seu caso para um de nossos especialistas humanos."
  };
}