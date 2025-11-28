const handler = async (m, { conn, text, usedPrefix }) => {
    let [pesan] = text.split `|`;

    if (!pesan) return conn.reply(m.chat, 'Silahkan masukan pesannya\nContoh : .order Hallo Min Mau Beli Panel', m);
    if (pesan.length > 500) return conn.reply(m.chat, 'Teks Kepanjangan!', m);
    
    let user = global.db.data.users[m.sender];

    let korban = `628123356789`;
    let spam1 = `*「 ORDER 」*\n\nUntuk : ${pesan}\nDari: *@${m.sender.split`@`[0]}*`;

    conn.reply(`628123356789@s.whatsapp.net`, spam1, m);

    let logs = `[ ✔️ ] Berhasil mengirim orderan. Mohon tunggu balasan dari owner.`;
    conn.reply(m.chat, logs, m);
};

handler.tags = ['store']
handler.help = ['order']
handler.command = /^(order)$/i;
handler.daftar = true

export default handler;
