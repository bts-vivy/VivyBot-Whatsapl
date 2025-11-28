import fetch from 'node-fetch' 
  
 let handler = async(m, { conn, usedPrefix, text, args, command }) => { 
 let src = await (await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/kata-kata/renungan.json')).json() 
   let json = src[Math.floor(Math.random() * src.length)] 
   await conn.sendFile(m.chat, json, "", "_Camkan Ini Ya Kak_", m) 
 } 
 handler.command = handler.help = ['renungan'] 
 handler.tags = ['quotes'] 
 handler.limit = true
handler.daftar = true
 export default handler