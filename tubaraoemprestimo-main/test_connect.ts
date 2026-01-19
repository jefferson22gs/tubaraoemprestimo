
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function testConnect() {
    console.log('Testing Connect/QR to:', config.apiUrl);

    try {
        const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            }
        });

        console.log('Connect Status:', res.status);
        const text = await res.text();
        console.log('Connect Body:', text);

    } catch (e) {
        console.error('Exception:', e);
    }
}

testConnect();
