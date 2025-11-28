import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`📸 *Bing Image Generator*\n🔍 *Contoh:* \`.bingimg anime boy dengan hoodie MatsToree\``);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

    const apiUrl = `https://anabot.my.id/api/ai/bingImgCreator?prompt=${encodeURIComponent(text)}&apikey=freeApikey`;
    const response = await fetch(apiUrl, { headers: { accept: "*/*" } });
    if (!response.ok) throw new Error(`Gagal fetch dari API: ${response.status}`);

    const data = await response.json();
    if (!data.success || !data.data?.result || data.data.result.length === 0) {
      return m.reply('🚫 Tidak ditemukan gambar untuk prompt tersebut.');
    }

    const randomIndex = Math.floor(Math.random() * data.data.result.length);
    const imageUrl = data.data.result[randomIndex];

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: global.wm
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error(error);
    m.reply('⚠️ *Gagal mendapatkan gambar.* Coba lagi nanti.');
  }
};

handler.command = ['bingimg'];
handler.help = ['bingimg'];
handler.tags = ['ai'];
handler.limit = 3;
handler.daftar = true;

export default handler;