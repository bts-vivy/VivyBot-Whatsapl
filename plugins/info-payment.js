import fs from 'fs'

let handler = async (m, { conn, usedPrefix }) => {
    let payi = `
▧「 *PEMBAYARAN QRIS & TRANSFER* 」

📌 *Cara Transaksi QRIS:*
1. Scan QR
2. Isi Sesuai Nominal Pembayaran
3. Bayar & Konfirmasi
4. Selesai ✅

👤 *A/N:* MATTSTOREE

💳 *Metode Pembayaran Lain:*
- *BRI* : 447601018650531
- *DANA*: 082191987064

📥 Setelah melakukan pembayaran, kirim bukti pembayaran dengan caption:
\`\`\`
.konfirmasi
\`\`\`

📩 Bukti pembayaran akan dikirim otomatis ke Owner untuk dicek.

Terima kasih telah menggunakan layanan kami!
`

    let qrisPath = './media/qris.jpg'
    if (fs.existsSync(qrisPath)) {
        await conn.sendFile(m.chat, qrisPath, 'qris.jpg', payi, m)
    } else {
        await conn.reply(m.chat, '⚠️ Maaf, gambar QRIS tidak ditemukan.', m)
    }
}

handler.before = async (m, { conn }) => {
    if (m.text && m.text.trim().toLowerCase() === '.konfirmasi') {
        let ownerNumber = '628123356789'
        let sender = m.sender.split('@')[0]
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!/image/.test(mime)) {
            return m.reply(`❌ Harus menyertakan gambar bukti pembayaran!\n\n📌 Cara:\n- Kirim gambar dengan caption *.konfirmasi*\n- Atau reply gambar dengan *.konfirmasi*`)
        }
        let buffer = await q.download()
        let pesanNotifikasi = `📢 *NOTIFIKASI PEMBAYARAN*\n\n📌 Pengguna: @${sender}\n📤 Telah mengirim bukti pembayaran.\n\nMohon segera diperiksa!`
        await conn.sendMessage(ownerNumber, {
            image: buffer,
            caption: pesanNotifikasi,
            mentions: [m.sender]
        })
        await conn.reply(m.chat, '✅ Bukti pembayaran berhasil dikirim ke Owner! Mohon tunggu konfirmasi.', m)
    }
}

handler.command = /^(pay|payment|bayar|donasi|donate)$/i
handler.tags = ['info']
handler.help = ['payment', 'donasi']
handler.daftar = true

export default handler