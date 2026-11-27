// Gerado de index.js (case 'listarvip', linha 7637)
export default {
  nomes: ["listarvip"],
  async executar(__x) {
    const { vipDB, isDonoReal, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar este comando!' }, { quoted: msg });
              return
            }
            const db = vipDB();
            const vips = db.vips || {};
            const ids = Object.keys(vips);
            if (!ids.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum VIP cadastrado ainda.' }, { quoted: msg });
              return
            }
            let txt = `╭━━━〔 💎 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 💎 〕━━━╮\n┃\n`;
            const mentions = [];
            ids.forEach((jid, i) => {
              const info = vips[jid];
              const dias = info.expira ? Math.max(0, Math.floor((info.expira - Date.now()) / 86400000)) : '∞';
              const ativo = info.expira ? Date.now() < info.expira : true;
              txt += `┃ ${i + 1}. @${jid.split('@')[0]}\n`;
              txt += `┃    ${ativo ? '🟢 Ativo' : '🔴 Expirado'} | ⏳ ${dias} dia(s)\n┃\n`;
              mentions.push(jid);
            });
            txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          return
    }
  }
};
