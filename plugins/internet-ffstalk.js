import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`⚠️ Masukkan ID akun Free Fire yang ingin dicari.\nContoh: .${command} 570098876`);

  try {
    m.reply('⏳ Sedang mencari nama akun FF...');

    const res = await fetch(`https://api.neoxr.eu/api/gname-ff?id=${encodeURIComponent(text)}&apikey=${global.neoxr}`);
    const json = await res.json();

    if (!json.status || !json.data?.username) {
      return m.reply('🚫 Nama akun tidak ditemukan atau ID salah.');
    }

    const { username } = json.data;

    m.reply(`✅ *Username FF ditemukan!*\n\n• 🆔 ID: ${text}\n• 🎮 Nama: ${username}`);
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Terjadi kesalahan saat mencari akun. Coba lagi nanti.');
  }
};

handler.help = ['ffstalk'];
handler.command = ['ffstalk'];
handler.tags = ['internet'];
handler.daftar = true;

export default handler;