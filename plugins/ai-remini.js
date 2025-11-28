import axios from 'axios'
import uploadImage from '../lib/uploadFile.js'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      m.reply('⏳ Sedang memproses gambar, harap tunggu...')
      const img = await q.download()
      const imageUrl = await uploadImage(img)
      const response = await axios.get(
        `https://api.neoxr.eu/api/remini?image=${encodeURIComponent(imageUrl)}&apikey=${neoxr}`
      )
      const result = response.data
      if (!result.status || !result.data?.url) throw '❌ Gagal memperbaiki gambar.'
      conn.sendFile(m.chat, result.data.url, null, '✅ Gambar berhasil diproses!', m)
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`)
    }
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat memproses gambar. Silakan coba lagi.')
  }
}

handler.help = ['remini']
handler.tags = ['ai']
handler.command = ['remini']
handler.premium = false
handler.limit = true
handler.daftar = true

export default handler