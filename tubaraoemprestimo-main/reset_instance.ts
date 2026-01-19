
const config = {
    apiUrl: 'https://antiques-entrepreneur-warrior-blues.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function resetInstance() {
    console.log('Resetting instance:', config.instanceName);

    // 1. Delete
    try {
        console.log('Deleting instance...');
        const delRes = await fetch(`${config.apiUrl}/instance/delete/${config.instanceName}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.apiKey
            }
        });
        console.log('Delete Status:', delRes.status);
        console.log('Delete Body:', await delRes.text());
    } catch (e) {
        console.log('Delete error (expected if not exists):', e.message);
    }

    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));

    // 2. Create
    try {
        console.log('Creating instance...');
        const createRes = await fetch(`${config.apiUrl}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                instanceName: config.instanceName,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS"
            })
        });
        console.log('Create Status:', createRes.status);
        console.log('Create Body:', await createRes.text());
    } catch (e) {
        console.error('Create error:', e);
    }

    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));

    // 3. Connect (Get QR)
    try {
        console.log('Getting QR...');
        const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            method: 'GET',
            headers: {
                'apikey': config.apiKey
            }
        });
        console.log('Connect Status:', res.status);
        const text = await res.text();
        console.log('Connect Body (Preview):', text.substring(0, 100));
    } catch (e) {
        console.error('Connect error:', e);
    }
}

resetInstance();
