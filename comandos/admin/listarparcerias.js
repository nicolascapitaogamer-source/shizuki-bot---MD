// Gerado de index.js (case 'listarparcerias', linha 9293)
export default {
  nomes: ["listarparcerias","parcerias"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins* e o *dono*\n┃    podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a eles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }

            const db = carregarJSON('./parcerias.json');
            if (!db[from] || !db[from].parceiros || !Object.keys(db[from].parceiros).length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhuma parceria neste grupo ainda.' }, { quoted: msg });
              return
            }

            const ativo = db[from].ativo ? '✅ Ativo' : '❌ Desativado';
            let txt = `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀𝐒 〕━━━╮\n┃\n┃ 🔘 Modo: *${ativo}* 💜\n┃\n`;
            const mentions = [];
            for (const [jid, info] of Object.entries(db[from].parceiros)) {
              const resta = info.total - info.usados;
              txt += `┃ 👤 @${jid.split('@')[0]}\n`;
              txt += `┃    📊 Usados: *${info.usados}/${info.total}*\n`;
              txt += `┃    ⏳ Restam: *${resta}*\n┃\n`;
              mentions.push(jid);
            }
            txt += `╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          return
    }
  }
};
