import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, args }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime) throw 'Balas gambar dengan caption .ktp dan isi datanya dipisah "|".';
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`;

    let img = await q.download();
    let url = await uploadImage(img);

    let response = args.join(' ').split('|');
    if (response.length < 16) {
        throw `.ktp provinsi|kota|nik|nama|ttl|jenisKelamin|golonganDarah|alamat|rt/rw|kelDesa|kecamatan|agama|status|pekerjaan|kewarganegaraan|masaBerlaku`;
    }

    let [
        provinsi, kota, nik, nama, ttl, jenisKelamin, golonganDarah,
        alamat, rtRw, kelDesa, kecamatan, agama, status, pekerjaan,
        kewarganegaraan, masaBerlaku
    ] = response;

    const terbuat = new Date().toISOString().split('T')[0]; // default: hari ini (yyyy-mm-dd)

    const params = new URLSearchParams({
        provinsi,
        kota,
        nik,
        nama,
        ttl,
        jenisKelamin,
        golonganDarah,
        alamat,
        rtRw,
        kelDesa,
        kecamatan,
        agama,
        status,
        pekerjaan,
        kewarganegaraan,
        masaBerlaku,
        terbuat,
        pasPhoto: url
    });

    const apiUrl = `https://fastrestapis.fasturl.cloud/maker/ktp?${params.toString()}`;

    const res = await fetch(apiUrl, { headers: { accept: 'image/png' } });
    if (!res.ok) throw 'Gagal menghasilkan gambar KTP.';
    const buffer = await res.buffer();

    await conn.sendFile(m.chat, buffer, 'ktp.png', '```KTP berhasil dibuat!```', m);
};

handler.help = ['ktp'];
handler.tags = ['text'];
handler.command = /^ktp$/i;
handler.premium = true;
handler.daftar = true
export default handler;