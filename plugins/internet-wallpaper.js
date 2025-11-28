import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `🔍 Masukkan kata kunci wallpaper!\n\nContoh:\n.${command} mekkah`

  try {
    const url = `https://api.neoxr.eu/api/wallpaper-hd?q=${encodeURIComponent(text)}&type=random&apikey=${global.neoxr}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.url) throw '❌ Gambar tidak ditemukan.'

    const data = json.data
    const caption = `📸 *Author:* ${data.author || '-'}\n💬 *Deskripsi:* ${data.desc || '-'}\n🖼️ *Ukuran:* ${data.dimension || '-'}\n❤️ *Likes:* ${data.likes || '-'}`

    await conn.sendFile(m.chat, data.url, 'wallpaper.jpg', caption, m)
  } catch (e) {
    console.error(e)
    throw '⚠️ Terjadi kesalahan saat mengambil wallpaper.'
  }
}

handler.help = ['wallpaper <kata kunci>']
handler.tags = ['internet']
handler.command = /^(wallpaper)$/i
handler.limit = true
handler.daftar = true

export default handler