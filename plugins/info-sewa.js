const { generateWAMessageContent, generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default;
import fs from 'fs'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    const sewaList = {
        "1 minggu": 10000,
        "1 bulan": 15000,
        "2 bulan": 25000,
        "3 bulan": 40000,
        "5 bulan": 65000,
        "1 tahun": 85000
    }

    const premiumList = {
        "1 bulan": 10000,
        "1 tahun": 55000
    }

    let qrisPath = './media/qris.jpg'
    let qrisNote = `
💳 *PEMBAYARAN HANYA QRIS*

📌 Cara bayar:
1. Scan QR di bawah
2. Isi sesuai nominal
3. Bayar & simpan bukti
4. Kirim bukti dengan caption:
\`\`\`
.bukti
\`\`\`

📩 Bukti akan otomatis diteruskan ke Owner untuk dicek.
`

    const image = async (url) => {
        const { imageMessage } = await generateWAMessageContent({
            image: { url }
        }, { upload: conn.waUploadToServer })
        return imageMessage
    }

    const thumbnail = await image('https://i.postimg.cc/Gtj3L17S/thumbnail.jpg')
    const isSewa = command === "sewabot"
    const listData = isSewa ? sewaList : premiumList
    const title = isSewa ? "SEWA BOT NYXORA" : "PREMIUM BOT NYXORA"

    let duration = text.toLowerCase().trim()

    if (listData[duration]) {
        let price = listData[duration]
        if (fs.existsSync(qrisPath)) {
            await conn.sendFile(m.chat, qrisPath, 'qris.jpg',
`✅ *${title} Dipilih*
🕒 Durasi: *${duration}*
💰 Harga: *Rp ${price.toLocaleString()}*

${qrisNote}`, m)
        } else {
            await conn.reply(m.chat, '⚠️ QRIS tidak ditemukan, hubungi owner.', m)
        }
    } else {
        const cards = Object.entries(listData).map(([durasi, harga]) => ({
            header: {
                imageMessage: thumbnail,
                hasMediaAttachment: true
            },
            body: {
                text: `▧「 *${title}* 」\n\n📦 Durasi: *${durasi}*\n💰 Harga: *Rp ${harga.toLocaleString()}*\n\nKetik:\n${usedPrefix + command} ${durasi}`
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_copy",
                        buttonParamsJson: `{"display_text":"SALIN FORMAT","id":"format${durasi.replace(/\s/g, '')}","copy_code":"${usedPrefix + command} ${durasi}"}`
                    }
                ]
            }
        }))

        let msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: `📌 PILIHAN ${isSewa ? 'SEWA' : 'PREMIUM'} BOT 📌\n\nKlik tombol untuk salin format order.`
                            },
                            carouselMessage: {
                                cards,
                                messageVersion: 1
                            }
                        }
                    }
                }
            },
            { quoted: m }
        )

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }
}

handler.before = async (m, { conn }) => {
    const ownerNumber = '628123356789@s.whatsapp.net'
    const isBukti = m.text?.toLowerCase() === '.bukti' || m.caption?.toLowerCase() === '.bukti'

    if (isBukti) {
        await conn.reply(m.chat, '✅ *Bukti pembayaran diterima!*\n📌 Menunggu konfirmasi owner.\n\n🔗 Jika untuk sewa bot, kirim link grup juga.', m)

        const notif = `📩 *Notifikasi Pembayaran*\n👤 User: @${m.sender.split('@')[0]}\n✅ Telah mengirim bukti pembayaran.`
        await conn.sendMessage(ownerNumber, { text: notif, mentions: [m.sender] })
    }
}

handler.help = ['sewabot', 'premium']
handler.tags = ['main']
handler.command = ['sewabot', 'premium']
handler.daftar = true

export default handler