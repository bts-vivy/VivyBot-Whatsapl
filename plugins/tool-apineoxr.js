import fetch from 'node-fetch'

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `Masukkan username API Neoxr kamu!\nContoh: .${command} MatsToree`, m)
  }

  const username = args[0].trim()
  try {
    const res = await fetch(`https://api.neoxr.eu/api/check?apikey=${username}`)
    if (!res.ok) throw new Error('Gagal fetch dari API.')

    const { status, data } = await res.json()
    if (!status || !data) {
      return conn.reply(m.chat, 'API Key tidak valid atau data tidak ditemukan.', m)
    }

    const { name, limit, total, premium, expired_at, last_activity, url } = data

    const caption = `
*≡ INFORMASI API NE0XR*
› *Nama:* ${name}
› *Status Premium:* ${premium ? 'Ya' : 'Tidak'}
› *Limit Tersisa:* ${limit} / ${total}
› *Expired:* ${expired_at}
› *Terakhir Aktif:* ${last_activity}
› *Url:* ${url}
`.trim()

    conn.reply(m.chat, caption, m)

  } catch (err) {
    console.error(err)
    conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data dari API.', m)
  }
}

handler.help = ['neoxrkey <username>']
handler.tags = ['tools']
handler.command = /^neoxr(key|api)$/i
handler.limit = false
handler.register = false
handler.daftar = true

export default handler