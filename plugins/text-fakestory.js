import axios from 'axios'

const handler = async (m, { conn, args }) => {
    if (args.length < 2 && !(m.quoted && m.quoted.text)) {
        throw `Gunakan format: .fakestory <username>|<caption>\n\nContoh:\n.fakestory Humanity|aku suka dia, dia suka dia`
    }

    let [username, caption] = args.join(" ").split("|")
    if (!caption && m.quoted && m.quoted.text) {
        caption = m.quoted.text
    }
    if (!username) username = await conn.getName(m.sender)

    const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png')

    const url = `https://api.ryzumi.vip/api/image/fake-story?username=${encodeURIComponent(username.trim())}&caption=${encodeURIComponent(caption.trim())}&avatar=${encodeURIComponent(pp)}`

    const response = await axios.get(url, { responseType: 'arraybuffer', headers: { 'accept': 'image/png' } })
    const buffer = Buffer.from(response.data)

    await conn.sendFile(m.chat, buffer, 'fake_story.png', '', m)
}

handler.help = ['fakestory']
handler.tags = ['text']
handler.command = /^(fakestory)$/i
handler.limit = 3
handler.daftar = true

export default handler