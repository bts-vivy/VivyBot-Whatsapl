import axios from 'axios';
import * as cheerio from 'cheerio';

export async function hadist(keyword) {
    const { data: leet } = await axios.get(`https://www.hadits.id/tentang/${keyword}`);
    const $ = cheerio.load(leet);

    let hasil = [];
    $('section').each((i, el) => {
        let judul = $(el).find('a').text().trim();
        let link = `https://www.hadits.id${$(el).find('a').attr('href')}`;
        let perawi = $(el).find('.perawi').text().trim();
        let kitab = $(el).find('cite').text().replace(perawi, '').trim();
        let teks = $(el).find('p').text().trim();

        hasil.push({ judul, link, perawi, kitab, teks });
    });

    return hasil;
}

export async function detail(url) {
    let { data } = await axios.get(url);
    let $ = cheerio.load(data);

    const title = $('article h1').text().trim();
    const breadcrumb = [];
    $('div.breadcrumb-menu ol.breadcrumbs li').each((index, element) => {
        breadcrumb.push($(element).text().trim());
    });

    const hadithContent = $('article p.rtl').text().trim();
    const hadithNumber = $('header .hadits-about h2').text().match(/No. (\d+)/)[1];

    return {
        title,
        breadcrumb,
        haditsArab: hadithContent,
        hadithNumber
    };
}

// Plugin WhatsApp bot
let handler = async (m, { conn, args, command }) => {
    if (!args[0]) return m.reply(`❌ Masukkan kata kunci hadis. Contoh: *.hadis sholat*`);

    if (command === 'hadis') {
        let hasil = await hadist(args.join(" "));
        if (!hasil.length) return m.reply(`⚠️ Hadis tidak ditemukan.`);

        let listHadis = hasil.map((h, i) => 
            `📖 *${h.judul}*\n🔗 [Buka Hadis](${h.link})\n📌 *Perawi:* ${h.perawi}\n📚 *Kitab:* ${h.kitab}\n📝 *Teks:* ${h.teks}\n`
        ).join('\n──────────────\n');

        conn.sendMessage(m.chat, { text: `📜 *Hasil Pencarian Hadis:*\n\n${listHadis}` }, { quoted: m });
    } 

    if (command === 'hadisdetail') {
        let url = args[0];
        if (!url.startsWith('https://www.hadits.id/hadits/')) return m.reply('❌ URL tidak valid.');

        let info = await detail(url);
        let hasil = `📜 *${info.title}*\n🔢 *No. Hadis:* ${info.hadithNumber}\n📚 *Sumber:* ${info.breadcrumb.join(" > ")}\n\n📝 *Teks Arab:*\n${info.haditsArab}`;
        
        conn.sendMessage(m.chat, { text: hasil }, { quoted: m });
    }
};

handler.help = ['hadis']
handler.tags = ['islamic']
handler.command = /^(hadis|hadisdetail)$/i;
handler.daftar = true

export default handler