// Gerado de index.js (case 'minhaspropostas', linha 13356)
export default {
  nomes: ["minhaspropostas"],
  async executar(__x) {
    const { carregarEleicao, carregarPropostas, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const dbM = carregarEleicao();
            if (!dbM.candidatos || !dbM.candidatos[sender]) {
              await sock.sendMessage(from, { text: '❌ Você não é candidato!' }, { quoted: msg });
              return
            }
            const meusIds = dbM.candidatos[sender].propostas || [];
            if (!meusIds.length) {
              await sock.sendMessage(from, { text: '📝 Você ainda não enviou propostas!\n\nUse: *!enviarproposta <texto>*' }, { quoted: msg });
              return
            }
            const dbP = carregarPropostas();
            let txt = '╭━━━〔 📜 𝐌𝐈𝐍𝐇𝐀𝐒 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀𝐒 📜 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📊 Total: *' + meusIds.length + '/4*\n┃\n';
            for (const id of meusIds) {
              const p = dbP[id];
              if (!p) continue;
              const emoji = p.status === 'aprovada' ? '✅' : p.status === 'rejeitada' ? '❌' : '⏳';
              txt += '┃ ' + emoji + ' *' + id + '* — ' + p.status + '\n┃    "' + p.texto.slice(0, 60) + '"\n┃\n';
            }
            txt += '╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
