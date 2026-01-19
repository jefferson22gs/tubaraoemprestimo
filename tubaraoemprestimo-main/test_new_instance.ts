
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao_test'
};

async function testNewInstance() {
    console.log('Testing NEW instance:', config.instanceName);

    // 1. Create
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

    // Wait 
    await new Promise(r => setTimeout(r, 2000));

    // 2. Poll QR
    for (let i = 0; i < 5; i++) {
        try {
            const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
                headers: { 'apikey': config.apiKey }
            });
            const text = await res.text();
            console.log(`Attempt ${i + 1}: ${res.status} - ${text.substring(0, 100)}`);
            if (text.includes("base64")) break;
        } catch (e) {
            console.error('Poll error:', e);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

testNewInstance();
