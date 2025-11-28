import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
    const sender = m.sender;
    const ownerNumber = global.nomorwa + '@s.whatsapp.net';
    const userTag = `@${sender.split('@')[0]}`;

    const panelList = [
        { id: 1, ram: '1024 MB', disk: '1024 MB', cpu: '25%', price: 5000 },
        { id: 2, ram: '2048 MB', disk: '2048 MB', cpu: '50%', price: 7000 },
        { id: 3, ram: '3072 MB', disk: '3072 MB', cpu: '75%', price: 8500 },
        { id: 4, ram: '4096 MB', disk: '4096 MB', cpu: '100%', price: 10000 },
        { id: 5, ram: '5120 MB', disk: '5120 MB', cpu: '125%', price: 12000 },
        { id: 6, ram: '6144 MB', disk: '6144 MB', cpu: '150%', price: 13500 },
        { id: 7, ram: '7168 MB', disk: '7168 MB', cpu: '175%', price: 15000 },
        { id: 8, ram: '8192 MB', disk: '8192 MB', cpu: '200%', price: 17000 },
        { id: 9, ram: '9216 MB', disk: '9216 MB', cpu: '225%', price: 18500 },
        { id: 10, ram: '10240 MB', disk: '10240 MB', cpu: '250%', price: 20000 }
    ];

    if (!args[0]) {
        let listText = `🌐 *Daftar Paket Panel*\n\n📍 *Region:* Frankfurt am Main – Germany\n\n`;
        for (let panel of panelList) {
            listText += `*${panel.id}. Paket ${panel.ram.replace(' MB', 'MB')}*\n`;
            listText += `RAM: ${panel.ram} | Disk: ${panel.disk} | CPU: ${panel.cpu}\n`;
            listText += `💸 Rp ${panel.price.toLocaleString()} / bulan\n\n`;
        }

        listText += `✨ *Kelebihan & Layanan*\n`;
        listText += `✅ Server milik pribadi tanpa ada admin lain\n`;
        listText += `✅ Garansi 30 hari (syarat & ketentuan berlaku)\n`;
        listText += `✅ Bisa perpanjang tiap bulan\n`;
        listText += `✅ Dukungan WhatsApp 24/7\n`;
        listText += `✅ Menggunakan VPS legal\n`;
        listText += `✅ Dilengkapi dengan DDoS Protection\n\n`;

        listText += `⚙️ *Spesifikasi Server Utama*\n`;
        listText += `OS: Ubuntu 22.04.5 LTS x86_64\n`;
        listText += `Host: KVM/QEMU (Standard PC i440FX + PIIX, 19)\n`;
        listText += `Kernel: 5.15.0-153-generic\n`;
        listText += `Paket: 787 (dpkg), 4 (snap)\n`;
        listText += `Shell: bash 5.1.16\n`;
        listText += `CPU: Intel Xeon Gold 6150 (4 core) @ 2.693GHz\n`;
        listText += `GPU: 00:02.0 Vendor 1234 Device 1111\n\n`;

        listText += `⚠️ *Aturan Penggunaan*\n`;
        listText += `Gunakan sesuai kebutuhan (tidak berlebihan/otomatisasi ekstrem)\n`;
        listText += `❌ Dilarang DDOS, mining, aktivitas ilegal, atau merugikan pihak lain\n`;
        listText += `Semua aktivitas diawasi. Pelanggaran akan dikenakan suspend/ban\n\n`;

        listText += `🔹 *Ketik:* \n.panel <nomor_paket>\nUntuk membeli paket yang diinginkan.\n\n*Contoh* : .panel 7`;

        await conn.sendMessage(m.chat, { text: listText }, { quoted: m });
        return;
    }

    let selectedPanel = panelList.find(p => p.id === parseInt(args[0]));
    if (!selectedPanel) {
        return conn.sendMessage(m.chat, { text: `⚠️ Paket tidak ditemukan. Cek daftar dengan *.panel*` }, { quoted: m });
    }

    let confirmText = `✅ *Pemesanan Panel Berhasil!*\n\n📌 *Detail Paket:*\n📂 *RAM:* ${selectedPanel.ram}\n💾 *DISK:* ${selectedPanel.disk}\n🖥 *CPU:* ${selectedPanel.cpu}\n💰 *Harga:* Rp${selectedPanel.price.toLocaleString()} / bulan\n\n🛍 *Pemesan:* ${userTag}\n\n📌 Owner akan menghubungi Anda segera!\n\n⚡ *Silakan lakukan pembayaran ke salah satu metode berikut:*  
- 📌 *Gopay:* 085349612623  
- 📌 *QRIS:* Ketik .pay  

📌 *Setelah melakukan pembayaran, kirim bukti transfer dengan caption:*  
\`.buypanel\``;

    await conn.sendMessage(m.chat, { text: confirmText, mentions: [sender] }, { quoted: m });

    let ownerNotif = `📢 *NOTIFIKASI PEMBELIAN PANEL!*\n\n🆔 *User :* ${userTag}\n🛒 *Paket:* ${selectedPanel.ram} RAM | ${selectedPanel.disk} DISK | ${selectedPanel.cpu} CPU\n💵 *Harga:* Rp${selectedPanel.price.toLocaleString()}\n\n🚀 *Silakan hubungi user untuk konfirmasi pembayaran!*`;

    await conn.sendMessage(ownerNumber, { text: ownerNotif, mentions: [sender] }, { quoted: m });
};

const handlePaymentProof = async (m, { conn }) => {
    if (m.text && m.text.toLowerCase() === '.buypanel') {
        const sender = m.sender;
        const userTag = `@${sender.split('@')[0]}`;
        
        const responseText = `💵 Pembayaran anda diproses, menunggu konfirmasi dari owner.\n\n🔹 Selagi menunggu konfirmasi, kirimkan username panel anda. Owner akan mengirimkan data panelnya ketika sudah dikonfirmasi melalui bot ini.`;
        
        await conn.sendMessage(m.chat, { text: responseText, mentions: [sender] }, { quoted: m });
    }
};

handler.help = ['panel'];
handler.tags = ['store'];
handler.command = /^(panel|listpanel)$/i;
handler.before = handlePaymentProof;

export default handler;