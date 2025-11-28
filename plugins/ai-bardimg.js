/* 
Fitur: Bard Image Generator (bardimg)
  Deskripsi: Menghasilkan gambar ilustrasi berbasis prompt dengan gaya clay-style menggunakan Bard Image API
  Thanks to: @neoxr.js – Wildan Izzudin (API oleh Neoxr)
  Plugin by: MatsToree
*/

import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args || !args[0]) {
    return m.reply('Masukkan prompt, contoh: .bardimg kucing lucu clay');
  }

  const prompt = args.join(' ');
  const apiUrl = `https://api.neoxr.eu/api/bardimg?q=${encodeURIComponent(prompt)}&apikey=${global.neoxr}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json?.status || !json?.data?.url) {
      return m.reply('Gagal generate gambar. Prompt tidak valid atau API error.');
    }

    await conn.sendFile(m.chat, json.data.url, json.data.filename, '', m);
  } catch (e) {
    m.reply('Terjadi kesalahan saat memproses permintaan. Silakan coba lagi nanti.');
  }
};

handler.help = ['bardimg <teks>'];
handler.tags = ['ai'];
handler.command = /^(bardimg)$/i;
handler.limit = true;
handler.daftar = true

export default handler;