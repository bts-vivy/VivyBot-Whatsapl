import fetch from 'node-fetch'
let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, '*[🔎] send url*', m)
  let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()
  conn.sendFile(m.chat, ss, 'error.png', args[0], m)
}
handler.help = ['ss', 'ssweb']
handler.tags = ['internet']
handler.command = /^ss(web)?f?$/i
handler.daftar = true
export default handler