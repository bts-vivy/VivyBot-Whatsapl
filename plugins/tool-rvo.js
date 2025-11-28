const handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  try {
    let media = await q.download?.();
    await conn.sendFile(m.chat, media, null, '', m);
  } catch (e) {
    m.reply('Media gagal dimuat!');
  }
};

handler.help = ['rvo']
handler.tags = ['tools']
handler.premium = true
handler.command = /^((read)?viewonce|rvo)$/i
handler.daftar = true

export default handler