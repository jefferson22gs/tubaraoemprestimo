
import { WhatsappConfig } from '../types';
import { supabaseService } from './supabaseService';

export const whatsappService = {
  // Get connection status and config form local storage
  getConfig: async (): Promise<WhatsappConfig> => {
    return await supabaseService.getWhatsappConfig();
  },

  // Save new configuration to local storage
  updateConfig: async (config: WhatsappConfig): Promise<boolean> => {
    return await supabaseService.saveWhatsappConfig(config);
  },

  // --- EVOLUTION API REAL INTEGRATION ---

  // Check Connection State
  checkConnectionState: async (): Promise<'open' | 'close' | 'connecting' | 'unknown'> => {
    const config = await supabaseService.getWhatsappConfig();
    if (!config.apiUrl || !config.apiKey || !config.instanceName) return 'unknown';

    try {
      const response = await fetch(`${config.apiUrl}/instance/connectionState/${config.instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey
        }
      });

      if (!response.ok) return 'unknown';

      const data = await response.json();
      // Evolution return example: { instance: { state: 'open' } }
      return data?.instance?.state || 'close';
    } catch (error) {
      console.error("[WhatsApp] Error checking state:", error);
      return 'unknown';
    }
  },

  // Fetch QR Code from Evolution API
  getQrCode: async (): Promise<string | null> => {
    const config = await supabaseService.getWhatsappConfig();
    if (!config.apiUrl || !config.apiKey || !config.instanceName) {
        throw new Error("Configurações da API incompletas.");
    }

    try {
        // Evolution API endpoint to connect/get QR
        const response = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            }
        });

        if (!response.ok) {
             const err = await response.text();
             throw new Error(`Erro API: ${err}`);
        }

        const data = await response.json();
        
        // Evolution usually returns: { base64: "data:image/png;base64,..." } or { code: "...", base64: "..." }
        if (data.base64) {
            return data.base64;
        } else if (data.code) {
             // Sometimes it returns just the pairing code string, but here we expect QR base64
             return null;
        }
        
        return null;
    } catch (error) {
        console.error("[WhatsApp] Error getting QR:", error);
        throw error;
    }
  },

  // Disconnect instance
  disconnect: async (): Promise<boolean> => {
    const config = await supabaseService.getWhatsappConfig();
    if (!config.apiUrl || !config.apiKey) return false;

    try {
        await fetch(`${config.apiUrl}/instance/logout/${config.instanceName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            }
        });
        
        // Update local state
        config.isConnected = false;
        await supabaseService.saveWhatsappConfig(config);
        return true;
    } catch (e) {
        console.error("[WhatsApp] Error disconnecting:", e);
        return false;
    }
  },

  // Send Text Message
  sendMessage: async (phone: string, text: string): Promise<boolean> => {
    const config = await supabaseService.getWhatsappConfig();
    
    // Validate formatting
    let number = phone.replace(/\D/g, '');
    if (!number.startsWith('55')) {
        // Simple heuristic: if length is 10 or 11, assume BR and append 55
        if (number.length >= 10 && number.length <= 11) {
            number = '55' + number;
        }
    }

    console.log(`[WhatsApp Service] Sending to ${number} via Evolution API...`);
    
    // Quick local check before trying (optional, can be removed if you trust the API check always)
    // if (!config.isConnected) {
    //    console.warn("[WhatsApp Service] Instance flagged as disconnected locally.");
    // }

    try {
        const response = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'apikey': config.apiKey 
            },
            body: JSON.stringify({ 
                number: number, 
                text: text,
                options: {
                    delay: 1200,
                    presence: "composing"
                }
            })
        });

        if (response.ok) {
            console.log("[WhatsApp Service] Message sent successfully.");
            return true;
        } else {
            const errorText = await response.text();
            console.error("[WhatsApp Service] API Error:", errorText);
            return false;
        }
    } catch (error) {
        console.error("[WhatsApp Service] Network/Logic Error:", error);
        return false;
    }
  }
};
