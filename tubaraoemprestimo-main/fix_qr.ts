
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function fixQr() {
    console.log('Fixing QR for instance:', config.instanceName);

    // 1. Delete
    try {
        console.log('Deleting instance...');
        await fetch(`${config.apiUrl}/instance/delete/${config.instanceName}`, {
            method: 'DELETE',
            headers: { 'apikey': config.apiKey }
        });
    } catch { }

    await new Promise(r => setTimeout(r, 2000));

    // 2. Create WITHOUT qrcode: true
    try {
        console.log('Creating instance (qrcode: false)...');
        const createRes = await fetch(`${config.apiUrl}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                instanceName: config.instanceName,
                qrcode: false, // Changed to false
                integration: "WHATSAPP-BAILEYS"
            })
        });
        console.log('Create Status:', createRes.status);
    } catch (e) {
        console.error('Create error:', e);
    }

    await new Promise(r => setTimeout(r, 2000));

    // 3. Connect (this should trigger QR generation)
    try {
        console.log('Connecting...');
        const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            method: 'GET',
            headers: {
                'apikey': config.apiKey
            }
        });
        const text = await res.text();
        console.log('Connect Body:', text.substring(0, 200));
    } catch (e) {
        console.error('Connect error:', e);
    }
}

fixQr();
