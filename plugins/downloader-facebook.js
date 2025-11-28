import axios from "axios"
import * as cheerio from "cheerio"

function proxy() {
  return "" // isi kalau pakai proxy, kalau tidak biarkan kosong
}

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Silakan masukkan URL Facebook.')

  try {
    await m.reply('🔄 Sedang memproses video, mohon tunggu sebentar...')

    const result = await fb(text)
    if (!result?.data || result.data.length === 0) {
      return m.reply('Gagal mengambil video. Pastikan URL benar.')
    }

    const videos = result.data.filter(v => v.format === 'mp4')
    if (videos.length === 0) {
      return m.reply('Tidak ada video yang tersedia.')
    }

    const videoData = videos.find(v => v.resolution === 'HD') || videos[0]
    if (!videoData?.url) return m.reply('Gagal mendapatkan video.')

    const caption = `✅ *Video Facebook berhasil diunduh!*\n\n📽️ Nikmati videonya langsung dari bot ini.\n❤️ Dukung terus bot ini dengan donasi agar tetap aktif dan berkembang!`

    await conn.sendMessage(m.chat, { video: { url: videoData.url }, caption }, { quoted: m })
  } catch (error) {
    console.error(error)
    m.reply('Terjadi kesalahan saat mengambil atau mengunduh video.')
  }
}

handler.help = ['facebook']
handler.tags = ['downloader']
handler.command = /^(facebook|fb|fbdl)$/i
handler.limit = true
handler.daftar = true

export default handler

async function fb(url) {
  try {
    const validUrl = /(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/
    if (!validUrl.test(url)) {
      throw new Error("Invalid URL provided")
    }

    const encodedUrl = encodeURIComponent(url)
    const formData = `url=${encodedUrl}&lang=en&type=redirect`

    const response = await axios.post(proxy() + "https://getvidfb.com/", formData, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://getvidfb.com',
        'referer': 'https://getvidfb.com/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      },
      timeout: 30000,
    })

    const $ = cheerio.load(response.data)
    const videoContainer = $('#snaptik-video')
    if (!videoContainer.length) throw new Error("Video container not found")

    const thumb = videoContainer.find('.snaptik-left img').attr('src')
    const title = videoContainer.find('.snaptik-middle h3').text().trim()

    const hasil = []
    videoContainer.find('.abuttons a').each((_, el) => {
      const link = $(el).attr('href')
      const spanText = $(el).find('.span-icon span').last().text().trim()
      if (link && spanText && link.startsWith('http')) {
        let resolution = 'Unknown'
        let format = 'Unknown'

        if (spanText.includes('HD')) {
          resolution = 'HD'; format = 'mp4'
        } else if (spanText.includes('SD')) {
          resolution = 'SD'; format = 'mp4'
        } else if (spanText.includes('Mp3') || spanText.includes('Audio')) {
          resolution = 'Audio'; format = 'mp3'
        } else if (spanText.includes('Photo') || spanText.includes('Jpg')) {
          resolution = 'Photo'; format = 'jpg'
        }

        hasil.push({ url: link, resolution, format })
      }
    })

    if (hasil.length === 0) throw new Error("No download links found for the provided URL.")

    return {
      thumbnail: thumb,
      title: title || "Facebook Video",
      data: hasil,
    }
  } catch (err) {
    throw new Error(err.message || "Failed to retrieve data from Facebook video")
  }
}