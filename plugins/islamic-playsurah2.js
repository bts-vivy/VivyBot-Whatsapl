import fetch from 'node-fetch';

const handler = async (m, { args, conn, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`Masukkan perintah dengan format:\n\n*${usedPrefix + command} No Surah|No Ayat*\nContoh: *.playsurah2 114|2*`);
    }

    let [surah, ayat] = args[0].split('|').map(x => parseInt(x.trim()));

    if (!surah || !ayat || isNaN(surah) || isNaN(ayat) || surah < 1 || surah > 114) {
        return m.reply('Format tidak valid! Masukkan nomor surah (1-114) dan nomor ayat.\nContoh: *.playsurah2 2|255*');
    }

    let url = `https://api.neoxr.eu/api/quran?surah=${surah}&verse=${ayat}&apikey=${neoxr}`;

    m.reply('Sedang mengambil audio ayat, mohon tunggu...');

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (!json.status || !json.data?.audio?.url) {
            return m.reply('Gagal mengambil audio dari ayat yang diminta.');
        }

        const { surah: namaSurah, arabic, latin, translate, audio } = json.data;
        let caption = `*Surah ${namaSurah}* (QS ${surah}:${ayat})\n\n${arabic}\n\n${latin}\n\nTerjemahan:\n_${translate}_`;

        await conn.sendMessage(m.chat, { audio: { url: audio.url }, mimetype: 'audio/mp4' }, { quoted: m });
        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (err) {
        console.error(err);
        m.reply('Terjadi kesalahan saat mengambil audio ayat.');
    }
};

handler.help = ['playsurah2 <Nomor Surah|Nomor Ayat>'];
handler.tags = ['islamic'];
handler.command = /^playsurah2$/i;
handler.limit = true;
handler.daftar = true

export default handler;