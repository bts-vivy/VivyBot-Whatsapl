import fetch from 'node-fetch'
import { format } from 'util'
import path from 'path'

let handler = async (m, { text }) => {
    if (!/^https?:\/\//.test(text)) throw 'Awali *URL* dengan http:// atau https://'
    let _url = new URL(text)
    let url = global.API(
        _url.origin,
        _url.pathname,
        Object.fromEntries(_url.searchParams.entries()),
        'APIKEY'
    )

    let res = await fetch(url)

    if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
        throw `Content-Length terlalu besar: ${res.headers.get('content-length')}`
    }

    let contentType = res.headers.get('content-type') || ''

    if (!/text|json/.test(contentType)) {
        let disposition = res.headers.get('content-disposition')
        let filename = 'file'

        if (disposition && disposition.includes('filename=')) {
            filename = disposition
                .split('filename=')[1]
                .replace(/["']/g, '')
                .trim()
        } else {
            filename = path.basename(_url.pathname) || 'file'
        }

        return conn.sendFile(m.chat, url, filename, text, m)
    }

    let txt = await res.buffer()
    try {
        txt = format(JSON.parse(txt.toString()))
    } catch (e) {
        txt = txt.toString()
    } finally {
        m.reply(txt.slice(0, 65536))
    }
}

handler.help = ['fetch', 'get']
handler.tags = ['tools']
handler.command = /^(fetch|get)$/i
handler.limit = true
handler.daftar = true

export default handler