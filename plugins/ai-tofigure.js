import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!m.quoted && !m.msg.contextInfo?.quotedMessage && !m.mentionedJid?.length && !m.message?.imageMessage) {
      throw `Kirim/balas gambar dengan caption *${usedPrefix + command} teks prompt*`
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) throw `Balas gambar dengan caption *${usedPrefix + command} teks prompt*`

    let prompt = args.join(' ')
    if (!prompt) {
      prompt = "Using the model,create a 1/7 scale commercialized figurine of the characters in the picture,in a realistic style,in a real environment.the figurine is placed on a computer desk.the figurine has a round transparent acrylic base,with no text on the base.the content on the computer screen is the zbrush modeling process of the figurine.next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork.the packaging features two dimensional flat illustrations."
    }

    let img = await q.download()
    let imageUrl = await uploadImage(img)

    async function fetchData(prompt, type, imageUrl, imageUrl2, imageUrl3, imageUrl4, cookie) {
      const api = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=${encodeURIComponent(type)}&imageUrl=${encodeURIComponent(imageUrl)}&imageUrl2=${encodeURIComponent(imageUrl2)}&imageUrl3=${encodeURIComponent(imageUrl3)}&imageUrl4=${encodeURIComponent(imageUrl4)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`
      const options = { method: 'GET', headers: { 'Accept': 'application/json' } }
      try {
        const res = await fetch(api, options)
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        const json = await res.json()
        return json
      } catch (err) {
        console.error(err)
        return { success: false, message: String(err) }
      }
    }

    m.reply('⏳ Sedang diproses, tunggu sebentar...')
    let cookie = "AEC=AaJma5ta1lDS-qvjFUXgOIYofNO5zlaTvjRFJpUS-Qfd0WdRbC__fTPLTQI; NID=525=hRVJRPi0SPaRxSTN7eXHAVTCOTm9ArwzvF9HH6jCLRDCq5soTdBYWOcBE0D6P4tYnJuK_l5QTOyYAfBklg0Hs2G1lZsNJ6f-QGp7E-ypETqmxj7ubPbG9WTCOsrNP2o7gein2Y74IS5heHa9pp5qFZydwRW6_PcZWyHd-XCUoRJQHiF-XbrQsUQ9he1AuQPOYU3yNnZiGCTWAucCVwstK4Dj-GvsYN_8JRpU5aMMPjWxqbyR51xnqtiXr6DUo06Tsejygbnw-v2c945VCwIsXM8MIt0Ab6BfIt2wv4fxYjGPMv-AsTMMWh7s-MlzGF_FfDQpKOuzG5Tnbwon3OYUBByb04vCkXPIoG33q5UxeLlFobRyJHcsTtfxoc0yHgbx-pj7bJDAyUBpjkiIMOXljQ8vdOUM6-XcWAGSYjxCEMKSh0tOO4azXcYbDNr8C1k87JLbulTI7vJhUqtReAVI5_BKAg291dO05W7u4HX-0C1isG-dttxmznkvE3rSa3g-2UuoUUtOdOMsmwNe4ZpNSOn3YPzzzMoQl0UDiCmKJciO72Lud0pAXcr4mBYk_OqjAnejRzxTQeFmoGe-WM-qxnpH9XkSDLeW9VXSCUqVMLV8LmnpRwLVO2ZrTir8TSN52LhkY3ACUBuSP5Oit30IZlIDrU7ikkUhAc9luc1dqOOyrC88RyYF3Aiv; SID=g.a0001wjg5IHFvB29ZZuZqVdeGXEfYiFG1C38Dy_eeEL1wS21Jzf1079xufrCbDQumCFNPkHjKQACgYKAZMSARASFQHGX2MiNPzrMWK26WfvYV2NMDU74BoVAUF8yKq-980gYvYGOK9AgcIeMhXt0076; __Secure-1PSID=g.a0001wjg5IHFvB29ZZuZqVdeGXEfYiFG1C38Dy_eeEL1wS21Jzf1NrGuaCj052FaQWVLmb53kgACgYKAQYSARASFQHGX2Mijp-x-5ShVB8LL48xjq9YrBoVAUF8yKrw0JIl0xbK9WsnG_IBC0-d0076; __Secure-3PSID=g.a0001wjg5IHFvB29ZZuZqVdeGXEfYiFG1C38Dy_eeEL1wS21Jzf1oglTb58MXbEVwipKgnHd7gACgYKAbkSARASFQHGX2MiFd5uUTpWLJtsMNTE31EJGhoVAUF8yKp-i-JpQx__2AmN8Xeacegk0076; HSID=AvjfCroi0qhJEjRvg; SSID=ArN0D25PjpXa6XxV0; APISID=sjAkz8TCphh3NfRP/ABA8LSskeMznTjJxx; SAPISID=mbAYWHLZjGtAsYxr/AZE20y5xT4GhK6u4w; __Secure-1PAPISID=mbAYWHLZjGtAsYxr/AZE20y5xT4GhK6u4w; __Secure-3PAPISID=mbAYWHLZjGtAsYxr/AZE20y5xT4GhK6u4w; SIDCC=AKEyXzXMmjF83NkN_TFE4esXHSJsJvr4mnA9zXad4Pn8CCbdXRvQ5ECyTV-Xi5FJh-HaOnCBiA; __Secure-1PSIDCC=AKEyXzUaSslfxLL2Uo2DIAWP2h4CSCJMBk8L3GhUAtVz-WFRYyecMFMGr_tmroDPaQUWtNN4Hg; __Secure-3PSIDCC=AKEyXzV-KYU-IV0fd9EAgOKfT77w4sqTN06dlChRvhGUJv5glWKLjZxygxraMC_0EOffuM9m"

    let result = await fetchData(prompt, "NanoBanana", imageUrl, "", "", "", cookie)
    if (!result.success || !result.data?.result?.url) {
      throw result.message || 'Gagal generate figurine!'
    }

    await conn.sendFile(m.chat, result.data.result.url, 'figurine.png', global.wm, m)

  } catch (e) {
    m.reply(`❌ Error: ${e}`)
  }
}

handler.help = ['tofigure <prompt>']
handler.tags = ['ai']
handler.command = /^(tofigure)$/i
handler.limit = 3
handler.daftar = true

export default handler