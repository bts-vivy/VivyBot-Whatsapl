/*
📢 Channel WhatsApp: https://whatsapp.com/channel/0029Vb62vNgFsn0h0TEx6q1b
📩 Kontak WA: wa.me/6282191987064
*/

import fetch from 'node-fetch'
const { generateWAMessageContent, generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Example:\n.${command} MatsToree|Bot\n\nFormat:\nTextL|TextR`

  let [textL, textR] = text.split('|').map(v => v.trim())
  if (!textL || !textR) throw 'Format salah!\nGunakan: TextL|TextR'

  await m.reply('⏳ Membuat logo, tunggu sebentar...')

  try {
    let url = `https://api.nekolabs.my.id/canvas/ba-logo?textL=${encodeURIComponent(textL)}&textR=${encodeURIComponent(textR)}`
    let res = await fetch(url)
    if (!res.ok) throw 'Gagal mengambil data dari API.'

    // kirim langsung gambar hasil API
    await conn.sendMessage(m.chat, {
      image: { url },
      caption: `✨ Hasil Logo\n• TextL: ${textL}\n• TextR: ${textR}\n\n© Nxyora AI`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat membuat logo.')
  }
}

handler.help = ['buatlogo <textL>|<textR>']
handler.tags = ['ai']
handler.command = /^buatlogo$/i
handler.limit = true
handler.daftar = true

export default handler