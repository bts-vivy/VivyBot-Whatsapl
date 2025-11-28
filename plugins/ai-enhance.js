import axios from 'axios'
import FormData from 'form-data'
import { writeFileSync, unlinkSync } from 'fs'
 
const Keyy = "-mY6Nh3EWwV1JihHxpZEGV1hTxe2M_zDyT0i8WNeDV4buW9l02UteD6ZZrlAIO0qf6NhYA"
 
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
 
async function processImage(buffer) {
  const tempPath = `./tmp/temp_${Date.now()}.jpg`
  writeFileSync(tempPath, buffer)
 
  try {
    const form = new FormData()
    form.append("file", buffer, { filename: 'image.jpg' })
 
    const uploadRes = await axios.post(
      "https://reaimagine.zipoapps.com/enhance/autoenhance/",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: Keyy,
          "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
        },
      }
    )
 
    const name = uploadRes.headers["name"] || uploadRes.data?.name
    if (!name) throw new Error("Gagal ambil 'name' dari upload response")
 
    let attempts = 0
    const maxAttempts = 20
 
    while (attempts < maxAttempts) {
      attempts++
      try {
        const res = await axios.post(
          "https://reaimagine.zipoapps.com/enhance/request_res/",
          null,
          {
            headers: {
              name,
              app: "enhanceit",
              ad: "0",
              Authorization: Keyy,
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001)",
            },
            responseType: "arraybuffer",
            validateStatus: () => true,
          }
        )
 
        if (res.status === 200 && res.data && res.data.length > 0) {
          return Buffer.from(res.data)
        }
      } catch {}
 
      await sleep(5000)
    }
 
    throw new Error("Gagal dapat hasil setelah banyak percobaan.")
  } finally {
    try { unlinkSync(tempPath) } catch {}
  }
}
 
let handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
 
    if (!mime.startsWith('image/')) return m.reply('Mana gambarnya')
 
    m.reply('Wait...')
 
    const media = await q.download()
    const result = await processImage(media)
 
    await conn.sendMessage(m.chat, { 
      image: result, 
      caption: 'Done✨' 
    }, { quoted: m })
 
  } catch (e) {
    m.reply(e.message)
  }
}
 
handler.help = ['enhance']
handler.command = ['enhance']
handler.tags = ['ai']
handler.limit = true

export default handler