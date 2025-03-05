const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

// Initialize the client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome', // Path to Chrome
        headless: true, // Run in headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Essential for running on VMs
    }
});

// Scan QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code to connect WhatsApp!');
});

// On successful login
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// Handle incoming messages
client.on('message', message => {
    console.log(`Received: ${message.body} from ${message.from}`);

    if (message.body.toLowerCase().includes('help')) {
        message.reply("Hey! 👋 How can I assist you? Please describe your issue, and we’ll get back to you shortly.");
    }
});

// API endpoint to send WhatsApp messages
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

// Start the WhatsApp client
client.initialize();
