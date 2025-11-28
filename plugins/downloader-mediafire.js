import axios from 'axios';

const handler = async (m, { conn, args, command }) => {
  const url = args[0];
  if (!url || !url.includes('mediafire.com')) {
    return m.reply(`Contoh:\n${command} https://www.mediafire.com/file/a8cermi1xtwwnk7/GBWA_MiNi_v2.0_SamMods.apk/file`);
  }

  try {
    await m.reply('Sedang memproses file dari MediaFire...');

    const apiUrl = `https://api.neoxr.eu/api/mediafire?url=${encodeURIComponent(url)}&apikey=${global.neoxr}`;
    const res = await axios.get(apiUrl);
    const json = res.data;

    if (!json.status || !json.data?.url) {
      return m.reply('Gagal mengambil data MediaFire. Pastikan link valid dan coba lagi.');
    }

    const { title, mime, extension, url: downloadUrl, size } = json.data;
    const maxSize = 50 * 1024 * 1024;

    if (size && size > maxSize) {
      return m.reply(`❌ Ukuran file terlalu besar!\nMaksimal 50MB, sedangkan file ini berukuran ${(size / 1024 / 1024).toFixed(2)} MB`);
    }

    const caption = `
*MediaFire Downloader*

⭔ Nama File : *${title}*
⭔ Ekstensi  : *${extension}*
⭔ Tipe MIME : *${mime}*
⭔ Ukuran    : ${(size / 1024 / 1024).toFixed(2)} MB

File dikirim sebagai dokumen.
`.trim();

    await conn.sendMessage(m.chat, {
      document: { url: downloadUrl },
      fileName: title,
      mimetype: mime,
      caption
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('Terjadi kesalahan saat mengunduh file. Coba lagi nanti.');
  }
};

handler.help = ['mediafire <url>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf(dl)?)$/i;
handler.limit = true;
handler.daftar = true;

export default handler;