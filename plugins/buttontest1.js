const { generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default;

// Daftar teks acak yang bisa Anda ubah
const listTeksAcak = [
    "VivyBot bagus",
    "VivyBot Indah",
    "VivyBot baik",
    "VivyBot gratis",
    "Nyxora Assistant keren!",
    "Script ini dibuat oleh ItsMeMatt"
];

let handler = async (m, { conn }) => {
    try {
        // 1. Pilih satu teks secara acak dari daftar
        const teksUntukDisalin = listTeksAcak[Math.floor(Math.random() * listTeksAcak.length)];

        // 2. Buat parameter tombol dengan teks acak yang "tersembunyi" di dalamnya
        const buttonParams = {
            display_text: "SALIN TEKS RAHASIA",
            id: `copy-button-${Date.now()}`,
            copy_code: teksUntukDisalin // Teks rahasianya ada di sini
        };
        const buttonParamsJson = JSON.stringify(buttonParams);
        
        // --- [ PERUBAHAN DI SINI ] ---
        // 3. Buat isi pesan (body) yang tidak lagi menampilkan/membocorkan teksnya
        const bodyText = `🤫 *Tombol Salin Pesan Rahasia*\n\nPenasaran teks apa yang akan disalin kali ini?\n\nTekan tombol di bawah untuk menyalin pesan ke clipboard Anda, lalu coba paste di chat!`;
        // -----------------------------

        // 4. Buat pesan interaktifnya
        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: bodyText // Gunakan isi pesan yang baru
                        },
                        footer: {
                            text: "© Created by Nyxora Assistant"
                        },
                        header: {
                            title: "Tombol Salin Teks Acak",
                            hasMediaAttachment: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: buttonParamsJson
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m });

        // 5. Kirim pesan
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Terjadi kesalahan saat membuat tombol salin.');
    }
}

handler.help = ['buttontest1'];
handler.tags = ['main', 'tools'];
handler.command = /^(buttontest1)$/i;

export default handler;