
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function testConnection() {
    console.log('Testing connection to:', config.apiUrl);

    // 1. Check State
    try {
        console.log('Checking state...');
        const res = await fetch(`${config.apiUrl}/instance/connectionState/${config.instanceName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            }
        });

        console.log('State Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('State Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('State Text:', await res.text());
        }

        if (res.status === 404) {
            console.log('Instance not found. Creating...');
            // Create
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
            console.log('Create Text:', await createRes.text());
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

testConnection();
