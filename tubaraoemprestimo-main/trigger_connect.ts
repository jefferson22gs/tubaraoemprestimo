
import { createClient } from '@supabase/supabase-js';

const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function triggerConnect() {
    console.log('Triggering connect for:', config.instanceName);
    try {
        const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            headers: { 'apikey': config.apiKey }
        });
        console.log('Connect Status:', res.status, await res.text());
    } catch (e) {
        console.error('Connect Error:', e);
    }
}

triggerConnect();
