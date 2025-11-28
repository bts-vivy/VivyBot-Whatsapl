import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: 'AIzaSyDwUjkpzTi3fjxWwh8O9lmK_tqaIRVnN00' 
})

let handler = async (m, { text, command }) => {
  if (!text) return await m.reply(`📌 *Contoh penggunaan:*\n.${command} siapa penemu internet?`)

  try {
    conn.sendReact?.(m.chat, '🕒', m.key);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: text
    })

    const reply = response?.text?.trim()
    if (!reply) throw '⚠️ Tidak ada respons dari Gemini.'

    await m.reply(`🤖 *Gemini 2.5 Pro*\n\n${reply}`)
  } catch (e) {
    console.error(e)
    await m.reply('❌ Terjadi kesalahan saat mengambil jawaban dari Gemini.')
  }
}

handler.help = ['geminipro']
handler.tags = ['ai']
handler.command = /^geminipro$/i
handler.limit = true
handler.daftar = true

export default handler