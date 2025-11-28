/**
 * Plugin non-prefix untuk merespon panggilan "bot".
 * Versi terbaru: Footer menggunakan global.wm dari config.js.
 * Dibuat oleh Vivy untuk Tuan.
 */
let handler = {
    async all(m) {
        if (m.isBaileys || m.chat.endsWith('broadcast')) return;

        if (/^bot$/i.test(m.text)) {
            
            const isOwner = global.owner.some(([number]) => m.sender.includes(number)) || m.isMe;

            let responseText;
            let mentions = [];

            if (isOwner) {
                responseText = 'Iya ada apa Tuan? Saya Aktif Kok, Ada Yang Bisa Saya Bantu?';
            } else {
                responseText = `Iya ada apa @${m.sender.split('@')[0]}? Saya aktif kok`;
                mentions = [m.sender];
            }

            const buttons = [
                { name: 'quick_reply', buttonParamsJson: `{\"display_text\":\"Menu\",\"id\":\".menu\"}` },
                { name: 'quick_reply', buttonParamsJson: `{\"display_text\":\"Profile\",\"id\":\".profile\"}` },
                { name: 'quick_reply', buttonParamsJson: `{\"display_text\":\"Ping\",\"id\":\".ping\"}` },
                { name: 'quick_reply', buttonParamsJson: `{\"display_text\":\"Owner\",\"id\":\".owner\"}` }
            ];

            await this.sendButtonImg(
                m.chat,
                'https://vivy-anime.com/assets/img/music/img_a_01.jpg',
                '',
                responseText,
                // --- [ PERUBAHAN DI SINI ] ---
                global.wm || "Created by Vivy Assistant", // Mengambil footer dari global.wm
                // -----------------------------
                buttons,
                m,
                { mentions: mentions }
            );

            return true; 
        }
        return false;
    }
}

export default handler;