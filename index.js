// Keeps Render alive
require('http').createServer((_, res) => res.end("Evil-CypherX is Live")).listen(process.env.PORT || 3000);

const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const P = require("pino");

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["Evil-CypherX", "Chrome", "1.0"]
    });

    // Ask for pairing code if not registered
    if (!sock.authState.creds.registered) {
        await delay(3000);
        const phoneNumber = "256756254753"; // YOUR NUMBER WITHOUT +
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n\n====================================`);
        console.log(` YOUR CODE: ${code} `);
        console.log(`====================================\n\n`);
    }

    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("connection.update", async (s) => {
        const { connection } = s;
        if (connection === "open") {
            console.log("✅ BOT CONNECTED SUCCESSFULLY!");
        }
    });
}

start();
