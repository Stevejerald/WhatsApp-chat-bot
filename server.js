require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code to connect WhatsApp!');
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

app.post('/send-message', (req, res) => {
    const { phone, text } = req.body;

    if (!phone || !text) {
        return res.status(400).send('Phone number and text message are required!');
    }

    const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    client.sendMessage(chatId, text)
        .then(() => res.send('Message sent successfully!'))
        .catch(err => res.status(500).send('Failed to send message: ' + err.message));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

client.initialize();
