const http = require('http');
http.createServer((req,res)=>res.end('EVIL ALIVE PAIR MODE')).listen(process.env.PORT || 3000);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ["Evil CypherX", "Chrome", "1.0"]
  });

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode("256767492955");
        console.log(`\n\n=== YOUR PAIR CODE: ${code} ===\n\n`);
      } catch (e) {
        console.log("Pair error:", e);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    console.log(u);
    if (u.connection === 'open') console.log('EVIL CONNECTED!');
    if (u.connection === 'close') start();
  });
}
start();
