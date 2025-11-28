import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} Node.js adalah platform runtime JavaScript...`;
  m.reply('*⏳ Sedang menulis...*');
  try {
        const apiUrl = `https://api.neoxr.eu/api/nulis?text=${encodeURIComponent(text)}&apikey=${neoxr}`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (!json.status) throw json.message || 'Error API';
    const url = json.data.url;
    const caption = `*✍️ Hasil Nulis*\n\nTeks yang Anda masukkan telah berhasil dibuat. Berikut gambar dari teks yang Anda kirimkan.`;
    await conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m });
  } catch (error) {
    console.error(error);
    throw '*❌ Terjadi kesalahan*';
  }
};

handler.help = ['nulis <teks>'];
handler.tags = ['text'];
handler.command = /^(nulis)$/i;
handler.limit = 5;
handler.daftar = true

export default handler;