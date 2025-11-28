import yts from 'yt-search'
import axios from 'axios'
import crypto from 'crypto'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Contoh pemakaian:\n.${command} judul lagu`

  m.reply('*⏳ Sedang mencari lagu terbaik buat kamu...*')

  try {
    const hasil = await yts(text)
    if (!hasil.videos.length) throw 'Lagu tidak ditemukan, coba judul lain!'

    const video = hasil.videos[0]
    const videoUrl = video.url
    const title = video.title
    const duration = video.timestamp
    const views = video.views?.toLocaleString?.() || video.views
    const channel = video.author?.name || '-'
    const published = video.ago || '-'
    const thumbnail = video.thumbnail

    // pakai savetube download mp3 kualitas kecil
    const dl = await savetube.download(videoUrl, 'mp3')
    if (!dl?.status || !dl.result?.download) throw 'Gagal mendapatkan link audio.'

    const apiTitle = dl.result.title || title
    const apiThumb = dl.result.thumbnail || thumbnail
    const apiDuration = dl.result.duration || duration

    const caption = `
乂  *Y T - P L A Y*

   ⭔  *Title* : ${apiTitle}
   ⭔  *Channel* : ${channel}
   ⭔  *Duration* : ${apiDuration}
   ⭔  *Views* : ${views}
   ⭔  *Upload* : ${published}

${global.wm}
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: apiThumb },
      caption,
      contextInfo: {
        externalAdReply: {
          title: apiTitle,
          body: 'Audio berhasil ditemukan',
          thumbnailUrl: apiThumb,
          sourceUrl: videoUrl,
          mediaType: 1,
          showAdAttribution: false
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: { url: dl.result.download },
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${sanitizeFilename(apiTitle)}.mp3`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan, coba lagi nanti.')
  }
}

handler.help = ['play <judul lagu>']
handler.tags = ['downloader']
handler.command = /^play$/i
handler.limit = true
handler.daftar = true

export default handler

function sanitizeFilename(name = 'audio') {
  return name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 100)
}

// ===== SAVETUBE SCRAPER =====
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
      try {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
        const data = Buffer.from(enc, 'base64')
        const iv = data.slice(0, 16)
        const content = data.slice(16)
        const key = savetube.crypto.hexToBuffer(secretKey)
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
        let decrypted = decipher.update(content)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return JSON.parse(decrypted.toString())
      } catch (error) {
        throw new Error(error)
      }
    }
  },
  youtube: url => {
    if (!url) return null
    const a = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let b of a) {
      if (b.test(url)) return url.match(b)[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      })
      return {
        status: true,
        code: 200,
        data: response
      }
    } catch (error) {
      throw new Error(error)
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get')
    if (!response.status) throw new Error(response)
    return {
      status: true,
      code: 200,
      data: response.data.cdn
    }
  },
  download: async (link, format) => {
    if (!link) {
      return {
        status: false,
        code: 400,
        error: "Link kosong"
      }
    }
    if (!format || !savetube.formats.includes(format)) {
      return {
        status: false,
        code: 400,
        error: "Format tidak valid",
        available_fmt: savetube.formats
      }
    }
    const id = savetube.youtube(link)
    if (!id) throw new Error('invalid link')
    try {
      const cdnx = await savetube.getCDN()
      if (!cdnx.status) return cdnx
      const cdn = cdnx.data
      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
        url: `https://www.youtube.com/watch?v=${id}`
      })
      if (!result.status) return result
      const decrypted = await savetube.crypto.decrypt(result.data.data)
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id: id,
        downloadType: format === 'mp3' ? 'audio' : 'video',
        quality: format === 'mp3' ? '128' : format,
        key: decrypted.key
      })
      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Unknown",
          type: format === 'mp3' ? 'audio' : 'video',
          format: format,
          thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
          download: dl.data.data.downloadUrl,
          id: id,
          key: decrypted.key,
          duration: decrypted.duration,
          quality: format === 'mp3' ? '128' : format,
          downloaded: dl.data.data.downloaded
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}