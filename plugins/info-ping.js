import speed from 'performance-now'
import os from 'os'
import moment from 'moment-timezone'

let handler = async (m, { conn }) => {
    let timestamp = speed()
    let latensi = (speed() - timestamp).toFixed(4)

    let serverSpecs = getServerSpecs()
    let botUptime = clockString(process.uptime() * 1000)

    let dateNow = moment().tz("Asia/Jakarta")
    let hari = dateNow.format('dddd')
    let tanggal = dateNow.format('LL')
    let waktu = dateNow.format('HH:mm:ss')

    let salam = getGreeting(dateNow.hour())

    let text = `
✨ *${salam}* 👋
Hai @${m.sender.split('@')[0]}

🗓️ *Informasi Sistem Bot*
  • *Hari:* ${hari}
  • *Tanggal:* ${tanggal}
  • *Waktu:* ${waktu} WIB

💻 *Spesifikasi Server*
  • *Host:* ${serverSpecs.hostname}
  • *OS:* ${serverSpecs.os}
  • *CPU:* ${serverSpecs.cpu} (${serverSpecs.cores} Cores)
  • *Memory:* ${serverSpecs.memory}
  • *Arsitektur:* ${serverSpecs.arch}
  • *Uptime Server:* ${serverSpecs.uptime}

⚡ *Status Bot*
  • *Latensi:* ${latensi} ms
  • *Bot Aktif Selama:* ${botUptime}
    `

    let loadd = [
        '▒▒▒▒▒▒▒▒▒▒▒▒▒ 0%',
        '██▒▒▒▒▒▒▒▒▒▒▒ 10%',
        '████▒▒▒▒▒▒▒▒▒ 30%',
        '███████▒▒▒▒▒▒ 50%',
        '██████████▒▒▒ 70%',
        '█████████████ 100%',
        `${text}`
    ]

    let { key } = await conn.sendMessage(m.chat, { text: '_Bentar bentar..._' }, { quoted: m })

    for (let i = 0; i < loadd.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await conn.sendMessage(m.chat, { text: loadd[i], edit: key, mentions: [m.sender] })
    }
}

handler.help = ['ping', 'speed']
handler.tags = ['info']
handler.command = ['ping', 'speed']
export default handler

function getServerSpecs() {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    return {
        hostname: os.hostname(),
        os: `${os.type()} ${os.release()}`,
        cpu: os.cpus()[0].model,
        cores: os.cpus().length,
        memory: `${(usedMem / (1024 * 1024)).toFixed(0)} MB / ${(totalMem / (1024 * 1024)).toFixed(0)} MB`,
        arch: os.arch(),
        uptime: clockString(os.uptime() * 1000)
    }
}

function clockString(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`
}

function getGreeting(hour) {
    if (hour >= 4 && hour < 11) return "Selamat Pagi 🌅"
    if (hour >= 11 && hour < 15) return "Selamat Siang ☀️"
    if (hour >= 15 && hour < 18) return "Selamat Sore 🌇"
    return "Selamat Malam 🌙"
}