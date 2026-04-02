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

  // PAIRING CODE
  if (!sock.authState.creds.registered) {
    const phoneNumber = '62XXXXXXXXXX' // GANTI NOMOR KAMU
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

      if (reason !== DisconnectReason.loggedOut) {
        startBot()
      }
    }
  })
}

startBot()
