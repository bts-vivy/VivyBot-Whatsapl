import axios from 'axios'
import cheerio from 'cheerio'

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `*Contoh penggunaan:*\n${usedPrefix + command} kasih`

  const res = await axios.get(`https://alkitab.me/search?q=${encodeURIComponent(text)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"
    }
  })

  const $ = cheerio.load(res.data)
  const result = []

  $('div.vw').each((_, el) => {
    const teks = $(el).find('p').text().trim()
    const linkRaw = $(el).find('a').attr('href') || ''
    const link = encodeURI(linkRaw.trim())
    const title = $(el).find('a').text().trim()
    if (title && link.startsWith('https://')) result.push({ teks, link, title })
  })

  if (result.length === 0) throw 'Tidak ditemukan hasil untuk kata tersebut.'

  const foto = 'https://telegra.ph/file/a333442553b1bc336cc55.jpg'
  const judul = '*───〔  ALKITAB - PENCARIAN 〕───*'

  const caption = result.slice(0, 10).map((v, i) => `
*${i + 1}. ${v.title}*
${v.teks || '_Tidak ada kutipan tersedia_'}
🔗 ${v.link}
  `.trim()).join('\n━━━━━━━━━━━━━━\n')

  await conn.sendFile(m.chat, foto, 'alkitab.jpg', `${judul}\n\n${caption}\n\n📖 _Sumber: alkitab.me_`, m)
}

handler.help = ['alkitab <kata>']
handler.tags = ['kristen']
handler.command = /^alkitab$/i
handler.daftar = true

export default handler