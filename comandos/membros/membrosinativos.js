// Gerado de index.js (case 'membrosinativos', linha 14549)
export default {
  nomes: ["membrosinativos"],
  async executar(__x) {
    const { carregarJSON, FILE_STATS, isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmIn = await globalThis.__getGroupMetadata(from);
            const statsIn = carregarJSON(FILE_STATS);
            const agoraIn = Date.now();
            const DIAS = 7 * 86400000;
            const inativos = [];
            for (const p of gmIn.participants) {
              const jid = p.id;
              const ult = (statsIn[jid] && statsIn[jid].ultimaMsg) || 0;
              if (ult === 0) continue; // Ignora quem nunca mandou mensagem
              const diff = agoraIn - ult;
              if (diff >= DIAS) {
                inativos.push({ jid, dias: Math.floor(diff / 86400000) });
              }
            }
            inativos.sort((a, b) => b.dias - a.dias);
            if (!inativos.length) {
              await sock.sendMessage(from, { text: '✅ Nenhum membro inativo! Grupo tá vivo!' }, { quoted: msg });
              return
            }
            let txtIn = '╭━━━〔 💤 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 𝐈𝐍𝐀𝐓𝐈𝐕𝐎𝐒 💤 〕━━━╮\n┃\n┃ 📊 Total: *' + inativos.length + '* membros\n┃ ⏰ Sem falar: *7+ dias*\n┃\n';
            const mencsIn = [];
            const limite = Math.min(inativos.length, 10);
            for (let i = 0; i < limite; i++) {
              txtIn += '┃ 💤 @' + inativos[i].jid.split('@')[0] + ' ➜ *' + inativos[i].dias + ' dias*\n';
              mencsIn.push(inativos[i].jid);
            }
            if (inativos.length > 10) txtIn += '┃ ... +' + (inativos.length - 10) + ' inativos\n';
            txtIn += '┃\n┃ 💜 Bora acordar essa galera!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtIn, mentions: mencsIn }, { quoted: msg });
          }
          return
    }
  }
};
