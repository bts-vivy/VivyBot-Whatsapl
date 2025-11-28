import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Mana Username TikTok nya?');

  const username = text.replace(/^@+/, '').trim();
  if (!username) return m.reply('Username tidak valid.');

  try {
    const url = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(username)}`;
    const res = await fetch(url);

    if (!res.ok) {
      return m.reply(`Gagal mengambil data (HTTP ${res.status}).`);
    }

    const data = await res.json();
    if (!data?.status) return m.reply('User TikTok tidak ditemukan!');

    const user = data.data?.user || {};
    let stats = data.data?.stats;
    if (!stats && data.data?.statsV2) {
      const s2 = data.data.statsV2;
      stats = {
        followerCount: Number(s2.followerCount ?? 0),
        followingCount: Number(s2.followingCount ?? 0),
        heartCount: Number(s2.heartCount ?? s2.heart ?? 0),
        videoCount: Number(s2.videoCount ?? 0),
        diggCount: Number(s2.diggCount ?? 0),
        friendCount: Number(s2.friendCount ?? 0),
      };
    }
    stats = stats || { followerCount: 0, followingCount: 0, heartCount: 0, videoCount: 0 };

    const nf = (n) => Number(n || 0).toLocaleString('id-ID');
    const avatar = user.avatarLarger || user.avatarMedium || user.avatarThumb || null;
    const joined = user.createTime
      ? new Date(user.createTime * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      : '-';

    const teks = `
[ TikTok Info ]
Nama       : ${user.nickname || '-'}
Username   : ${user.uniqueId || username}
ID User    : ${user.id || '-'}
Bergabung  : ${joined}
Followers  : ${nf(stats.followerCount)}
Following  : ${nf(stats.followingCount)}
Likes      : ${nf(stats.heartCount ?? stats.heart ?? 0)}
Video      : ${nf(stats.videoCount)}
Bio        : ${user.signature ? user.signature : '-'}
Private    : ${user.privateAccount ? 'Ya' : 'Tidak'}
Profil     : https://www.tiktok.com/@${encodeURIComponent(user.uniqueId || username)}
`.trim();

    if (avatar) {
      await conn.sendMessage(m.chat, { image: { url: avatar }, caption: teks }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { text: teks }, { quoted: m });
    }
  } catch (e) {
    console.log(e);
    m.reply('Terjadi kesalahan saat mengambil data.');
  }
};

handler.help = ['ttstalk <username>'];
handler.tags = ['internet'];
handler.command = ['tiktokstalk', 'ttstalk'];
handler.limit = true;
handler.daftar = true;

export default handler;