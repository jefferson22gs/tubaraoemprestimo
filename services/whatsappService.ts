import { WhatsappConfig } from '../types';
import { supabaseService } from './supabaseService';

export const whatsappService = {
  // Get connection status and config
  getConfig: async (): Promise<WhatsappConfig> => {
    return await supabaseService.getWhatsappConfig();
  },

  // Save new configuration
  updateConfig: async (config: WhatsappConfig): Promise<boolean> => {
    return await supabaseService.saveWhatsappConfig(config);
  },

  // Fetch QR Code from Evolution API (Mocked for this environment)
  getQrCode: async (): Promise<string> => {
    // In a real scenario, you would fetch: ${config.apiUrl}/instance/connect/${config.instanceName}
    // Returning a static QR code for demo visualization
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EvolutionAPI_Mock_Connection_${Date.now()}`;
  },

  // Disconnect instance
  disconnect: async (): Promise<boolean> => {
    const config = await supabaseService.getWhatsappConfig();
    config.isConnected = false;
    await supabaseService.saveWhatsappConfig(config);
    return true;
  },

  // Send Text Message
  sendMessage: async (phone: string, text: string): Promise<boolean> => {
    const config = await supabaseService.getWhatsappConfig();
    
    console.log(`[WhatsApp Service] Sending to ${phone} via ${config.apiUrl}: ${text}`);
    
    if (!config.isConnected) {
        console.warn("[WhatsApp Service] Instance not connected. Message skipped.");
        return false;
    }

    // Real implementation would be:
    /*
    await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': config.apiKey },
        body: JSON.stringify({ number: phone, text: text })
    });
    */
   
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }
};