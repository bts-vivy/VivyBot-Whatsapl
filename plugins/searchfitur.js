let handler = async (m, { text, usedPrefix, command }) => {
    // 1. Cek apakah pengguna memberikan kata kunci pencarian
    if (!text) {
        throw `Gunakan format *${usedPrefix + command} <kata_kunci>*\n\nContoh: *${usedPrefix + command} tiktok*`;
    }

    // 2. Ubah kata kunci menjadi huruf kecil untuk pencarian yang tidak sensitif huruf
    const keyword = text.toLowerCase();
    const searchResults = [];

    // 3. Looping melalui semua plugin yang terdaftar di global.plugins
    for (const filename in global.plugins) {
        const plugin = global.plugins[filename];

        // Lewati plugin yang non-aktif atau tidak memiliki perintah
        if (plugin.disabled || !plugin.help) {
            continue;
        }

        // Pastikan 'plugin.help' adalah array
        const commands = Array.isArray(plugin.help) ? plugin.help : [plugin.help];
        if (commands.length === 0) {
            continue;
        }

        // 4. Cek apakah ada perintah di dalam plugin yang cocok dengan kata kunci
        const isMatch = commands.some(cmd => cmd.toLowerCase().includes(keyword));

        // 5. Jika ditemukan kecocokan, kumpulkan informasinya
        if (isMatch) {
            const tags = Array.isArray(plugin.tags) ? plugin.tags : [];
            searchResults.push({
                filename,
                commands: commands.map(cmd => `${usedPrefix}${cmd.split(' ')[0]}`).join(', '),
                tags: tags.length > 0 ? tags.map(tag => `#${tag}`).join(' ') : 'Tidak ada'
            });
        }
    }

    // 6. Jika tidak ada hasil yang ditemukan, beri tahu pengguna
    if (searchResults.length === 0) {
        return m.reply(`❌ Tidak ditemukan fitur dengan kata kunci *"${text}"*.\nCoba gunakan kata kunci lain yang lebih umum.`);
    }

    // 7. Format dan kirim hasil pencarian
    let replyText = `✅ Ditemukan *${searchResults.length} file plugin* yang cocok dengan kata kunci *"${text}"*:\n\n`;
    searchResults.forEach(result => {
        replyText += `╭─「 *${result.filename}* 」\n`;
        replyText += `│- *Perintah:* ${result.commands}\n`;
        replyText += `│- *Tags:* ${result.tags}\n`;
        replyText += `╰–––––––––––––––––\n\n`;
    });

    m.reply(replyText.trim());
};

// Metadata untuk plugin
handler.help = ['searchfitur <kata_kunci>'];
handler.tags = ['tools'];
// Alias (nama lain) untuk perintah ini
handler.command = /^(searchfitur|carifitur|findfeature)$/i;

export default handler;