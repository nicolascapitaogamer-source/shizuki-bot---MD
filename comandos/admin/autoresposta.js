// Gerado de index.js (case 'autoresposta', linha 14625)
export default {
  nomes: ["autoresposta"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_AUTORESPOSTA, salvarJSON, RESPOSTAS_AUTO, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmAr = await globalThis.__getGroupMetadata(from);
            const ehAdmAr = !!getAdminFlag(gmAr.participants, sender);
            if (!ehAdmAr && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const subAr = (args[0] || '').toLowerCase();
            const dbAr = carregarJSON(FILE_AUTORESPOSTA);
            dbAr[from] = dbAr[from] || { ativo: false };
            if (subAr === 'on') dbAr[from].ativo = true;
            else if (subAr === 'off') dbAr[from].ativo = false;
            else dbAr[from].ativo = !dbAr[from].ativo;
            salvarJSON(FILE_AUTORESPOSTA, dbAr);
            await sock.sendMessage(from, {
              text: dbAr[from].ativo
                ? '╭━━━〔 💬 𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 💬 〕━━━╮\n┃\n┃ ✅ *Ativado!*\n┃\n┃ 💜 Bot vai responder mensagens\n┃    automaticamente!\n┃\n┃ 😈 Modo: ignorante + engraçado + sério\n┃ 📊 Palavras: ' + Object.keys(RESPOSTAS_AUTO).length + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
                : '╭━━━〔 💬 𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 💬 〕━━━╮\n┃\n┃ ❌ *Desativado!*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
