import uploadImage from '../lib/uploadFile.js'
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import { Buffer } from 'buffer'

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/^image/.test(mime) && !/webp/.test(mime)) {
      m.reply('⏳ Sedang memproses gambar ke HD, tunggu sebentar...')
      const img = await q.download()
      const uploadedImageUrl = await uploadImage(img)

      const resultBuffer = await scrapeUpscaleFromUrl(uploadedImageUrl, 4)

      await conn.sendMessage(
        m.chat,
        { image: resultBuffer, caption: '✅ Gambar berhasil dijernihkan dan di-HD-kan!' },
        { quoted: m }
      )
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau balas gambar yang sudah dikirim.`)
    }
  } catch (e) {
    console.error(e)
    m.reply(`❌ Terjadi kesalahan saat memproses gambar. Pastikan format gambar benar dan coba lagi nanti.`)
  }
}

handler.command = /^(hd|jernih)$/i
handler.help = ['hd', 'jernih']
handler.tags = ['ai']
handler.limit = true
handler.daftar = true

export default handler

// ===================== SCRAPER ILOVEIMG =====================

import { fileTypeFromBuffer } from "file-type"
import path from "path"

class UpscaleImageAPI {
  api = null
  server = null
  taskId = null
  token = null

  async getTaskId() {
    const { data: html } = await axios.get("https://www.iloveimg.com/upscale-image", {
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36" },
    })

    const tokenMatches = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g)
    if (!tokenMatches || tokenMatches.length < 2) throw new Error("Token not found.")
    this.token = tokenMatches[1]

    const configMatch = html.match(/var ilovepdfConfig = ({.*?});/s)
    if (!configMatch) throw new Error("Server configuration not found.")
    const configJson = JSON.parse(configMatch[1])
    const servers = configJson.servers
    if (!Array.isArray(servers) || servers.length === 0) throw new Error("Server list is empty.")

    this.server = servers[Math.floor(Math.random() * servers.length)]
    this.taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*['"](\w+)['"]/)?.[1]

    this.api = axios.create({
      baseURL: `https://${this.server}.iloveimg.com`,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Origin": "https://www.iloveimg.com",
        "Referer": "https://www.iloveimg.com/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
    })

    if (!this.taskId) throw new Error("Task ID not found!")
    return { taskId: this.taskId, server: this.server, token: this.token }
  }

  async uploadFromUrl(imageUrl) {
    if (!this.taskId || !this.api) throw new Error("Run getTaskId() first.")
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" })
    const fileType = await fileTypeFromBuffer(imageResponse.data)
    if (!fileType || !fileType.mime.startsWith("image/")) throw new Error("Unsupported file type.")

    const buffer = Buffer.from(imageResponse.data, "binary")
    const urlPath = new URL(imageUrl).pathname
    const fileName = path.basename(urlPath) || `image.${fileType.ext}`

    const form = new FormData()
    form.append("name", fileName)
    form.append("chunk", "0")
    form.append("chunks", "1")
    form.append("task", this.taskId)
    form.append("preview", "1")
    form.append("file", buffer, { filename: fileName, contentType: fileType.mime })

    const response = await this.api.post("/v1/upload", form, { headers: form.getHeaders() })
    return response.data
  }

  async upscaleImage(serverFilename, scale = 4) {
    if (!this.taskId || !this.api) throw new Error("Run getTaskId() first.")
    if (scale !== 2 && scale !== 4) throw new Error("Scale must be 2 or 4.")

    const form = new FormData()
    form.append("task", this.taskId)
    form.append("server_filename", serverFilename)
    form.append("scale", scale.toString())

    const response = await this.api.post("/v1/upscale", form, { headers: form.getHeaders(), responseType: "arraybuffer" })
    return response.data
  }
}

async function scrapeUpscaleFromUrl(imageUrl, scale = 4) {
  const upscaler = new UpscaleImageAPI()
  await upscaler.getTaskId()
  const uploadResult = await upscaler.uploadFromUrl(imageUrl)
  if (!uploadResult || !uploadResult.server_filename) throw new Error("Failed to upload image.")
  return await upscaler.upscaleImage(uploadResult.server_filename, scale)
}