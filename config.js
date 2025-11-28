import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

// Owner
global.owner = [
['6288213094035', 'Archive', true],
]
global.mods = []
global.prems = []
// Info
global.nomorwa = '6285779738057'
global.packname = 'Made With'
global.author = '© Copyright Vivy Assistant'
global.namebot = 'VivyBot-MD v4.0-a'
global.wm = '©VivyBot v4.0-alpha'
global.stickpack = 'Created by'
global.stickauth = '© Vivy Assistant'
global.fotonya = 'https://a.top4top.io/p_3549ulkww1.jpg'
global.sgc = '_'
// Info Wait
global.wait = 'harap tunggu sebentar...'
global.eror = '⚠️ Terjadi kesalahan, coba lagi nanti!'
global.multiplier = 69 

// Apikey 
global.lann = 'arayashiki';
// Catatan : Jika Mau Work Fiturnya
// Pastikan Apikey Benar, gapunya apikey?
// beli dong, murah kok!
global.APIs = {
    lann: 'https://api.betabotz.eu.org'
}

/*Apikey*/
global.APIKeys = {
    "https://api.betabotz.eu.org": global.lann
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})