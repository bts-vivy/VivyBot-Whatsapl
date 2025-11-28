import axios from 'axios'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function tiktokDl(url) {
    try {
        const domain = 'https://www.tikwm.com/api/'
        const res = await axios.post(domain, {}, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://www.tikwm.com',
                'Referer': 'https://www.tikwm.com/',
                'Sec-Ch-Ua': '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': 'Android',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            params: {
                url: url,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1
            }
        })

        const data = res.data.data
        if (!data) return { status: false }

        let result = []
        if (data.duration === 0 && data.images?.length) {
            data.images.forEach(img => result.push({ type: 'photo', url: img }))
        } else {
            result.push(
                { type: 'watermark', url: 'https://www.tikwm.com' + (data.wmplay || '/undefined') },
                { type: 'nowatermark', url: 'https://www.tikwm.com' + (data.play || '/undefined') },
                { type: 'nowatermark_hd', url: 'https://www.tikwm.com' + (data.hdplay || '/undefined') }
            )
        }

        return {
            status: true,
            title: data.title,
            cover: 'https://www.tikwm.com' + data.cover,
            music_info: {
                title: data.music_info.title,
                author: data.music_info.author,
                url: 'https://www.tikwm.com' + (data.music_info.play || data.music)
            },
            data: result
        }
    } catch (e) {
        console.error(e)
        return { status: false }
    }
}

const handler = async (m, { conn, args, command }) => {
    if (!args[0]) return m.reply(`Contoh:\n${command} https://vt.tiktok.com/ZSY5SgvHE/`)
    if (!args[0].includes('tiktok.com')) return m.reply('❌ Link tidak valid!')

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        const json = await tiktokDl(args[0])
        if (!json.status || !json.data?.length) return m.reply('⚠️ Tidak menemukan video atau foto.')

        const videoData = json.data.find(d => d.type === 'nowatermark_hd') || json.data.find(d => d.type === 'nowatermark')
        const photoData = json.data.filter(d => d.type === 'photo')

        if (videoData?.url) {
            await conn.sendMessage(m.chat, {
                video: { url: videoData.url },
                mimetype: 'video/mp4',
                caption: `✨ Ini videonya kak! Semoga bermanfaat ya~ Jangan lupa support kami dengan donasi!`
            }, { quoted: m })
        } else if (photoData.length) {
            for (const p of photoData) {
                await conn.sendMessage(m.chat, { image: { url: p.url } }, { quoted: m })
                await sleep(1000)
            }
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat mengambil data TikTok.', m)
    }
}

handler.help = ['tiktok']
handler.tags = ['downloader']
handler.command = /^(tiktok|tt|ttdl|tiktokdl)$/i
handler.limit = true
handler.daftar = true

export default handler