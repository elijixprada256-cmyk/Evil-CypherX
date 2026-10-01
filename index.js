const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const axios = require('axios')

const BOT_NAME = '😈☠️~°°~☠️😈'
const SERVER_URL = process.env.CYPHERX_SERVER || 'https://cypherx-server.onrender.com'
const PREFIX = '.'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: true, defaultQueryTimeoutMs: undefined })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u) => {
    if (u.qr) {
      console.log(`\n${BOT_NAME} QR CODE:`)
      qrcode.generate(u.qr, { small: true })
    }
    if (u.connection === 'open') console.log(`✅ ${BOT_NAME} Connected & Evil Online`)
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const chat = m.key.remoteJid
    const sender = m.key.participant || chat
    const isGroup = chat.endsWith('@g.us')

    // Talk to CypherX Python Server
    try {
      const res = await axios.post(`${SERVER_URL}/api/message`, {
        sender, chat, text, is_group: isGroup, is_admin: false, is_owner: false
      })
      if (res.data?.reply) await sock.sendMessage(chat, { text: `*${BOT_NAME}*\n\n${res.data.reply}` }, { quoted: m })
    } catch {
      if (!text.startsWith(PREFIX)) return
      const cmd = text.slice(1).toLowerCase().trim()
      if (cmd === 'ping') await sock.sendMessage(chat, { text: `${BOT_NAME}\npong 🏓 evil is alive` }, { quoted: m })
      if (cmd === 'menu' || cmd === 'help') await sock.sendMessage(chat, {
        text: `*${BOT_NAME} MENU*\n\n😈.ping - check alive\n☠️.menu - this list\n💀.owner - owner info\n😈.alive - bot status`
      }, { quoted: m })
      if (cmd === 'alive') await sock.sendMessage(chat, { text: `*${BOT_NAME} IS ALIVE*\nVersion: Evil V2\nServer: Connected` }, { quoted: m })
    }
  })
}
start()
