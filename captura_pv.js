import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, downloadContentFromMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

const PASTA = './rank_imagens';
if (!fs.existsSync(PASTA)) fs.mkdirSync(PASTA);

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (from.endsWith('@g.us')) continue;

      const img = msg.message.imageMessage;
      const vid = msg.message.videoMessage;

      let legenda = '';
      let tipo = '';
      if (img) { legenda = (img.caption || '').trim(); tipo = 'image'; }
      else if (vid) { legenda = (vid.caption || '').trim(); tipo = 'video'; }
      else continue;

      if (!legenda) {
        console.log('📸 Sem legenda, ignorando...');
        continue;
      }

      console.log('📥 Recebi', tipo, 'com legenda:', legenda);

      try {
        const stream = await downloadContentFromMessage(img || vid, tipo);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        const extensao = tipo === 'video' ? 'mp4' : 'jpg';
        const nomeArq = `${legenda}.${extensao}`;
        fs.writeFileSync(`${PASTA}/${nomeArq}`, buffer);
        console.log(`✅ Salvo: ${nomeArq} (${(buffer.length/1024).toFixed(1)} KB)`);

        await sock.sendMessage(from, { text: `✅ Imagem *${legenda}* salva com sucesso!` });
      } catch (e) {
        console.error('❌ Erro ao salvar:', e.message);
      }
    }
  });

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log('\n✅ CAPTURADOR CONECTADO!');
      console.log('📥 Manda as imagens no PV com a legenda certa.\n');
    }
  });
}

iniciar();
