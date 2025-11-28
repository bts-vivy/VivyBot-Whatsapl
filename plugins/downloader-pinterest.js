import axios from 'axios'  

const handler = async (m, { conn, args, usedPrefix, command }) => {  
  if (!args[0]) return m.reply(`🚩 Contoh:\n\n• *Pencarian:* ${usedPrefix + command} kucing lucu\n• *Link:* ${usedPrefix + command} https://pin.it/3xs2gAQA9`)  

  const input = args[0]  
  await m.reply('_🔍 Sedang memproses permintaan..._')  

  try {  
    let caption  

    if (/^https?:\/\/(www\.)?(pin\.it|pinterest\.com)/.test(input)) {  
      const { data } = await axios.get(`https://api.neoxr.eu/api/pin?url=${encodeURIComponent(input)}&apikey=${global.neoxr}`)  

      if (!data.status || !data.data?.url) {  
        return m.reply('❌ Gagal mengambil data dari link.')  
      }  

      const { url: mediaUrl, type, size } = data.data  
      caption = `✨ *Pinterest Downloader*\n📂 Type: ${type}\n📦 Size: ${size}`  

      if (/(mp4|mkv|mov|avi)/i.test(type)) {  
        await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption }, { quoted: m })  
      } else {  
        await conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption }, { quoted: m })  
      }  
    } else {  
      const scraper = new PinterestScraper()  
      const results = await scraper.getImages(args.join(' '))  
      if (!results || results.length === 0) {  
        return m.reply('❌ Gambar tidak ditemukan.')  
      }  

      function shuffleArray(array) {  
        for (let i = array.length - 1; i > 0; i--) {  
          const j = Math.floor(Math.random() * (i + 1))  
          ;[array[i], array[j]] = [array[j], array[i]]  
        }  
        return array  
      }  

      const shuffled = shuffleArray(results)  
      const randomImg = shuffled[0]  
      const mediaUrl = randomImg.image_url  
      const sourceUrl = randomImg.pin  
      const pinner = randomImg.pinner?.full_name || '-'  

      caption = `✨ *Pinterest Search*\n👤 Pinner: ${pinner}\n🔗 ${sourceUrl}`  

      await conn.sendMessage(m.chat, {  
        image: { url: mediaUrl },  
        caption  
      }, { quoted: m })  
    }  
  } catch (e) {  
    console.error(e)  
    return m.reply('⚠️ Terjadi kesalahan saat mengambil data, coba lagi nanti.')  
  }  
}  

handler.help = ['pinterest <teks|link>']  
handler.tags = ['downloader']  
handler.command = /^(pinterest|pin)$/i  
handler.limit = true  

export default handler  

class PinterestScraper {  
  constructor() {  
    this.baseUrl = "https://id.pinterest.com/resource/BaseSearchResource/get/"  
    this.headers = {  
      "authority": "id.pinterest.com",  
      "accept": "application/json, text/javascript, */*, q=0.01",  
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",  
      "content-type": "application/x-www-form-urlencoded",  
      "cookie": "csrftoken=c6c1ae81f3fa623853339b4174673ad8;",  
      "origin": "https://id.pinterest.com",  
      "referer": "https://id.pinterest.com/",  
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",  
      "x-app-version": "f1222d7",  
      "x-csrftoken": "c6c1ae81f3fa623853339b4174673ad8",  
      "x-pinterest-appstate": "background",  
      "x-pinterest-pws-handler": "www/search/[scope].js",  
      "x-requested-with": "XMLHttpRequest",  
    }  
  }  

  async makeRequest(params, isPost = true) {  
    const url = new URL(this.baseUrl)  
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))  

    try {  
      const response = isPost  
        ? await axios.post(url.toString(), new URLSearchParams(params).toString(), {  
            headers: { ...this.headers, "x-pinterest-source-url": `/search/pins/?q=${encodeURIComponent(params.query)}&rs=typed` },  
            responseType: "json",  
          })  
        : await axios.get(this.baseUrl + "?" + new URLSearchParams(params), {  
            headers: { ...this.headers, "x-pinterest-source-url": `/search/pins/?q=${encodeURIComponent(params.query)}&rs=typed`, "x-pinterest-appstate": "active" },  
            responseType: "json",  
          })  

      return response.data  
    } catch (error) {  
      console.error("Error fetching data:", error.message)  
      return null  
    }  
  }  

  formatResults(results) {  
    return results.map((item) => {  
      let videoUrl = null  
      if (item.videos?.video_list) {  
        const firstVideoKey = Object.keys(item.videos.video_list)[0]  
        videoUrl = item.videos.video_list[firstVideoKey]?.url  
        if (videoUrl && firstVideoKey.includes("HLS") && videoUrl.includes("m3u8")) {  
          videoUrl = videoUrl.replace("hls", "720p").replace("m3u8", "mp4")  
        }  
      }  

      return {  
        pin: `https://www.pinterest.com/pin/${item.id ?? ""}`,  
        link: item.link ?? null,  
        created_at: item.created_at  
          ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })  
          : "",  
        id: item.id ?? "",  
        image_url: item.images?.orig?.url ?? null,  
        video_url: videoUrl,  
        gif_url: item.embed?.src && item.embed?.type === "gif" ? item.embed.src : null,  
        grid_title: item.grid_title ?? "",  
        description: item.description ?? "",  
        type: item.videos ? "video" : item.embed?.type === "gif" ? "gif" : "image",  
        pinner: {  
          username: item.pinner?.username ?? "",  
          full_name: item.pinner?.full_name ?? "",  
          follower_count: item.pinner?.follower_count ?? 0,  
          image_small_url: item.pinner?.image_small_url ?? "",  
        },  
        board: {  
          id: item.board?.id ?? "",  
          name: item.board?.name ?? "",  
          url: item.board?.url ?? "",  
          pin_count: item.board?.pin_count ?? 0,  
        },  
        reaction_counts: item.reaction_counts ?? {},  
        dominant_color: item.dominant_color ?? "",  
        seo_alt_text: item.seo_alt_text ?? item.alt_text ?? "",  
      }  
    })  
  }  

  async scrape(query, typeFilter = null, maxPages = 5) {  
    let allResults = []  
    let bookmark = null  

    for (let i = 0; i < maxPages; i++) {  
      const params = {  
        source_url: `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,  
        data: JSON.stringify({  
          options: {  
            query,  
            scope: "pins",  
            rs: "typed",  
            redux_normalize_feed: true,  
            source_url: `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,  
            ...(bookmark ? { bookmarks: [bookmark] } : {}),  
          },  
          context: {},  
        }),  
        query,  
        _: Date.now(),  
      }  

      const response = await this.makeRequest(params, !bookmark ? false : true)  
      if (!response) break  

      const results = response.resource_response?.data?.results ?? []  
      allResults.push(...this.formatResults(results))  

      bookmark = response.resource_response?.bookmark  
      if (!bookmark) break  
    }  

    if (typeFilter) {  
      allResults = allResults.filter((result) => result.type === typeFilter)  
    }  

    return allResults  
  }  

  async getImages(query) {  
    return this.scrape(query, "image")  
  }  

  async getVideos(query) {  
    return this.scrape(query, "video")  
  }  

  async getGifs(query) {  
    return this.scrape(query, "gif")  
  }  
}