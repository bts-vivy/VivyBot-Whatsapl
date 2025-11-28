export async function all(m) {
    if (!m.isGroup)
        return
    let chats = global.db.data.chats[m.chat]
    if (!chats.expired)
        return !0
    if (+new Date() > chats.expired) {
        await this.reply(m.chat, '📢 Pemberitahuan\nMasa sewa bot untuk grup ini telah *berakhir*.\nTerima kasih telah menggunakan layanan sewa, saya akan keluar dari grup ini.')
        await this.groupLeave(m.chat)
        chats.expired = null
    }
}