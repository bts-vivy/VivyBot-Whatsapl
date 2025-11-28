let callListenerSet = false;

export async function before(m, { conn }) {
  if (!callListenerSet) {
    conn.ev.on('call', async (calls) => {
      const processed = new Set();

      for (const call of calls) {
        if (call.status === 'offer' && !processed.has(call.from)) {
          processed.add(call.from);

          try {
            if (conn.rejectCall) {
              await conn.rejectCall(call.id, call.from); // reject call jika API mendukung
            }

            await conn.sendMessage(call.from, {
              text: `*⛔ PANGGILAN TERDETEKSI!*\n\nBot ini tidak menerima panggilan.\nKarena kamu menelpon, nomor kamu akan *diblokir otomatis*.\n\nJika ini tidak sengaja, silakan hubungi Owner.`
            });

            await new Promise(resolve => setTimeout(resolve, 3000));
            await conn.updateBlockStatus(call.from, 'block');

            console.log(`>> Nomor ${call.from} diblokir karena melakukan panggilan.`);
          } catch (e) {
            console.error('Gagal memproses call:', e);
          }
        }
      }
    });

    callListenerSet = true;
  }
}