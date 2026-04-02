const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['Ubuntu','Chrome','20.0.04']
  })

  sock.ev.on('creds.update', saveCreds)

  // 🔥 pairing hanya sekali
  if (!state.creds.registered) {
    const phoneNumber = '62895360811300' // ganti nomor kamu
    const code = await sock.requestPairingCode(phoneNumber)
    console.log('\n📱 KODE PAIRING:', code)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log('✅ BOT CONNECTED!')
    }

    if (connection === 'close') {
      let reason = lastDisconnect?.error?.output?.statusCode
      console.log('❌ Disconnect:', reason)

      // 🔥 jangan loop brutal
      if (reason !== DisconnectReason.loggedOut) {
        setTimeout(() => startBot(), 5000)
      }
    }
  })
}

// 🔥 ANTI CRASH GLOBAL
process.on('uncaughtException', (err) => {
  console.log('🔥 ERROR:', err)
})

process.on('unhandledRejection', (err) => {
  console.log('🔥 PROMISE ERROR:', err)
})

// 🔥 KEEP ALIVE
setInterval(() => {
  console.log('🟢 Bot aktif...')
}, 60000)

startBot()
