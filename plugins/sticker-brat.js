import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(
    `Gunakan format:\n${usedPrefix + command} teks\n\nContoh:\n${usedPrefix + command} Hello World`
  )

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    const response = await fetch(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`)
    const buffer = await response.buffer()
    let stiker = await sticker(buffer, false, stickpack, stickauth)
    if (stiker) await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    else m.reply('❌ Gagal membuat stiker.')
  } catch (err) {
    console.error(err)
    m.reply('❌ Gagal membuat stiker.')
  }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^brat$/i
handler.limit = true

export default handler