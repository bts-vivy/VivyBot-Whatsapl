import axios from 'axios';

let handler = async (m, { text, conn }) => {
  try {
    if (!text) return m.reply("Masukkan URL YouTube yang valid!");

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const urlApi = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=video&quality=360p&apikey=${global.neoxr}`;
    const response = await axios.get(urlApi);
    const data = response.data;

    if (!data.status) return m.reply("Video tidak ditemukan atau terjadi kesalahan API.");

    const info = data.data;
    const caption = `*Judul:* ${data.title}\n*Durasi:* ${data.fduration}\n*Channel:* ${data.channel}\n*Views:* ${data.views}\n*Publish:* ${data.publish}`;

    await conn.sendMessage(m.chat, {
      video: { url: info.url },
      caption: caption,
      thumbnail: { url: data.thumbnail }
    });

  } catch (err) {
    console.error(err);
    m.reply("Terjadi kesalahan saat memproses video.");
  }
};

handler.command = /^yt(mp4|video)$/i;
handler.tags = ['downloader'];
handler.help = ['ytmp4 <url>'];
handler.limit = true;
handler.daftar = true;

export default handler;