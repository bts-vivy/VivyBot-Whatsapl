import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: 'AIzaSyDwUjkpzTi3fjxWwh8O9lmK_tqaIRVnN00' // Gunakan API Key kamu
})

let handler = async (m, { args, text, command }) => {
  if (!text) return m.reply(`Gunakan contoh:\n.${command} siapa penemu internet?`)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        thinkingConfig: {
          thinkingBudget: 2000 // Aktifkan mode thinking (2 detik)
        }
      }
    })

    const reply = response?.text?.trim()
    if (!reply) throw '⚠️ Tidak mendapat jawaban dari Gemini.'

    await m.reply(`🤖 *Gemini 2.5 Flash*\n\n${reply}`)
  } catch (err) {
    console.error(err)
    await m.reply('❌ Gagal mengambil jawaban dari Gemini.')
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.command = /^(gemini)$/i
handler.limit = true
handler.daftar = true

export default handler