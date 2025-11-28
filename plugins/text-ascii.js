import figlet from 'figlet';

const handler = async (m, { args }) => {
    const text = args.join(" ");

    if (!text) return m.reply("[❗] Masukkan teks untuk dibuat menjadi ASCII.");

    m.reply("[❗] Teks sedang diproses...");

    try {
        figlet(text, { font: 'Standard' }, (err, result) => {
            if (err || !result) {
                console.error(err);
                return m.reply("[❗] Terjadi kesalahan saat membuat teks ASCII.");
            }

            m.reply(`\`\`\`${result}\`\`\``);
        });
    } catch (error) {
        console.error(error);
        m.reply("[❗] Terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ['ascii'];
handler.tags = ['text'];
handler.command = /^(ascii)$/i;
handler.daftar = true

export default handler;