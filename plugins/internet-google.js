import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} kucing lucu`);

  await conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key
    }
  });

  try {
    const res = await fetch(`https://api.neoxr.eu/api/google?q=${encodeURIComponent(text)}&apikey=${neoxr}`);
    const json = await res.json();

    if (!json.status) return m.reply('Gagal mengambil hasil pencarian.');

    let teks = `乂  *G O O G L E - S E A R C H*\n\n`;
    json.data.forEach((v, i) => {
      teks += `*${i + 1}. ${v.title}*\n`;
      teks += `   ◦ *Snippet* : ${v.description}\n`;
      teks += `   ◦ *Link* : ${v.url}\n\n`;
    });
    teks += global.wm;

    await conn.sendMessage(m.chat, {
      image: { url: 'https://telegra.ph/file/d7b761ea856b5ba7b0713.jpg' },
      caption: teks
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('Terjadi kesalahan saat memproses pencarian.');
  }
};

handler.help = ['google <pencarian>'];
handler.tags = ['internet'];
handler.command = /^google$/i;
handler.limit = true;
handler.daftar = true

export default handler;