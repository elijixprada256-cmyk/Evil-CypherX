const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Evil-CypherX", "Chrome", "1.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update
        if (connection === "open") {
            console.log("✅ BOT CONNECTED SUCCESSFULLY")
        }

        if (!sock.authState.creds.registered) {
            const number = "256756254753"
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(number)
                    console.log("\n========================")
                    console.log(`YOUR PAIRING CODE FOR ${number}: ${code}`)
                    console.log("========================\n")
                } catch (e) {
                    console.log("Error getting code:", e)
                }
            }, 3000)
        }
    })
}

startBot()
