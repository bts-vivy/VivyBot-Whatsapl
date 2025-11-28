import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw `Contoh penggunaan:\n${usedPrefix + command} Just launched our new API feature! Check it out at https://fastrestapis.fasturl.cloud #API #Development`;
    }

    const content = args.join(' ');
    const apiURL = `https://fastrestapis.fasturl.cloud/maker/tweet?` + new URLSearchParams({ content });

    const res = await fetch(apiURL, { headers: { accept: 'image/png' } });
    if (!res.ok) throw 'Gagal membuat gambar tweet.';
    const buffer = await res.buffer();

    await conn.sendFile(m.chat, buffer, 'tweet.png', '```Tweet berhasil dibuat!```', m);
};

handler.help = ['tweet'];
handler.tags = ['text'];
handler.command = /^tweet$/i;
handler.limit = true;
handler.daftar = true
export default handler;