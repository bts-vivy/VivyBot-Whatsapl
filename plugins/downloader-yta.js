import axios from 'axios'
import crypto from 'crypto'

let handler = async (m, { conn, text, command }) => {
    if (!text) throw `Contoh pemakaian:\n.${command} https://youtu.be/abc123`

    try {
        await m.reply('⏳ Tunggu sebentar, sedang memproses audio...')

        const result = await savetube.download(text, 'mp3')
        if (!result?.status) throw 'Gagal mendapatkan link audio.'

        const { title, duration, thumbnail, download } = result.result

        const caption = `🎵 YTMP3 Downloader\n\n`
            + `- Judul  : ${title}\n`
            + `- Durasi : ${duration}\n`
            + `- Format : MP3\n\n`
            + `🔗 Sumber: YouTube`

        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: "YouTube MP3 Downloader",
                    body: title,
                    thumbnailUrl: thumbnail,
                    sourceUrl: text,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
            audio: { url: download },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        throw '❌ Gagal mengunduh audio. Pastikan link valid dan coba lagi.'
    }
}

handler.command = /^(ytmp3|yta)$/i
handler.help = ['ytmp3 <url>']
handler.tags = ['downloader']
handler.limit = true
handler.daftar = true

export default handler


// ================== SCRAPER SAVETUBE ==================
const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
   },
   formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g)
         return Buffer.from(matches.join(''), 'hex')
      },
      decrypt: async (enc) => {
         const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
         const data = Buffer.from(enc, 'base64')
         const iv = data.slice(0, 16)
         const content = data.slice(16)
         const key = savetube.crypto.hexToBuffer(secretKey)
         const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
         let decrypted = decipher.update(content)
         decrypted = Buffer.concat([decrypted, decipher.final()])
         return JSON.parse(decrypted.toString())
      }
   },
   youtube: (url) => {
      if (!url) return null
      const regex = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ]
      for (let r of regex) {
         if (r.test(url)) return url.match(r)[1]
      }
      return null
   },
   request: async (endpoint, data = {}, method = 'post') => {
      const { data: response } = await axios({
         method,
         url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
         data: method === 'post' ? data : undefined,
         params: method === 'get' ? data : undefined,
         headers: savetube.headers
      })
      return { status: true, code: 200, data: response }
   },
   getCDN: async () => {
      const response = await savetube.request(savetube.api.cdn, {}, 'get')
      return { status: true, code: 200, data: response.data.cdn }
   },
   download: async (link, format) => {
      if (!link) return { status: false, code: 400, error: "Link tidak ditemukan" }
      if (!format || !savetube.formats.includes(format)) {
         return { status: false, code: 400, error: "Format tidak tersedia", available_fmt: savetube.formats }
      }
      const id = savetube.youtube(link)
      if (!id) throw new Error('Link YouTube tidak valid')
      const cdnx = await savetube.getCDN()
      const cdn = cdnx.data
      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
         url: `https://www.youtube.com/watch?v=${id}`
      })
      const decrypted = await savetube.crypto.decrypt(result.data.data)
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
         id,
         downloadType: format === 'mp3' ? 'audio' : 'video',
         quality: format === 'mp3' ? '128' : format,
         key: decrypted.key
      })
      return {
         status: true,
         code: 200,
         result: {
            title: decrypted.title,
            type: format === 'mp3' ? 'audio' : 'video',
            format,
            thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
            download: dl.data.data.downloadUrl,
            id,
            key: decrypted.key,
            duration: decrypted.duration,
            quality: format === 'mp3' ? '128' : format,
            downloaded: dl.data.data.downloaded
         }
      }
   }
}