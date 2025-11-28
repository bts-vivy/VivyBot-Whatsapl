import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw 'Contoh penggunaan: .resep ayam geprek';

  const query = args.join(' ');
  const url = `https://api.neoxr.eu/api/resep?q=${encodeURIComponent(query)}&apikey=${neoxr}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.status) throw 'Resep tidak ditemukan.';

  const data = json.data;
  let text = `*${data.title}*\n`;
  text += `Waktu: ${data.timeout}\n`;
  text += `Porsi: ${data.portion}\n\n`;
  text += '*Bahan-bahan:*\n' + data.ingredients.map(i => `- ${i}`).join('\n') + '\n\n';
  text += '*Langkah-langkah:*\n' + data.steps.map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, '')}`).join('\n');

  await conn.sendFile(m.chat, data.thumbnail, 'resep.jpg', text, m);
};

handler.help = ['resep'];
handler.tags = ['internet'];
handler.command = ['resep'];
handler.daftar = true

export default handler;