import axios from 'axios';

const handler = async (m, { conn, text }) => {
   if (!text) throw 'Masukkan username IG dulu!';

   await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

   const apiUrl = `https://api.neoxr.eu/api/igstalk?username=${encodeURIComponent(text)}&apikey=${global.neoxr}`;
   
   const res = await axios.get(apiUrl);
   const json = res.data;

   if (!json.status) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      throw 'Username tidak ditemukan!';
   }

   const { id, photo, name, username, follower, following, post, about, private: isPrivate } = json.data;

   const caption = `
┏━━━━━━༺✪༻━━━━━━┓
     *INSTAGRAM STALKER*
┗━━━━━━༺✪༻━━━━━━┛

✨ ID: *${id}*
🙋‍♂️ Nama: *${name}*
🔗 Username: *@${username}*
🧠 Bio: *${about || 'Tidak ada bio'}*

📸 Postingan: *${post.toLocaleString()}*
👀 Followers: *${follower.toLocaleString()}*
🤝 Following: *${following.toLocaleString()}*
🔐 Private: *${isPrivate ? 'Ya' : 'Tidak'}*
`.trim();

   await conn.sendMessage(m.chat, {
      image: { url: photo },
      caption
   }, { quoted: m });

   await conn.sendMessage(m.chat, { react: { text: "✔️", key: m.key } });
};

handler.help = ['igstalk <username>'];
handler.tags = ['internet'];
handler.command = /^(igstalk)$/i;
handler.limit = true;
handler.daftar = true;

export default handler;