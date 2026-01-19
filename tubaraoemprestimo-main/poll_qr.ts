
const config = {
    apiUrl: 'https://accepting-deviation-highland-philip.trycloudflare.com',
    apiKey: 'B8959800-F546-407C-99E8-C40306E747F5',
    instanceName: 'tubarao'
};

async function pollQr() {
    console.log('Polling QR for instance:', config.instanceName);

    for (let i = 0; i < 10; i++) {
        console.log(`Attempt ${i + 1}/10...`);
        try {
            const res = await fetch(`${config.apiUrl}/instance/connect/${config.instanceName}`, {
                method: 'GET',
                headers: {
                    'apikey': config.apiKey
                }
            });

            const text = await res.text();
            console.log(`Status: ${res.status}, Body: ${text.substring(0, 150)}`);

            if (res.ok) {
                const data = JSON.parse(text);
                if (data.base64) {
                    console.log('SUCCESS: QR Code found!');
                    return;
                }
            }
        } catch (e) {
            console.error('Error:', e.message);
        }

        await new Promise(r => setTimeout(r, 2000));
    }
    console.log('Finished polling. No QR found.');
}

pollQr();
