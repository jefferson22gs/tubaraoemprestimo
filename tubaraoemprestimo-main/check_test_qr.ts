
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao_test'
};

async function checkTestQr() {
    console.log('Checking QR for:', config.instanceName);
    try {
        const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
            method: 'GET',
            headers: { 'apikey': config.apiKey }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text.substring(0, 100)}`);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkTestQr();
