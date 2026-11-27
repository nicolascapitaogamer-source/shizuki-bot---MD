// Gerado de index.js (case 'arvoregeneologica', linha 6122)
export default {
  nomes: ["arvoregeneologica","arvore","familia"],
  async executar(__x) {
    const { shizukiUser, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const parceiro = u.casado || u.namorando;
            const statusAmor = u.casado ? 'Casado(a)' : (u.namorando ? 'Namorando' : 'Solteiro(a)');
            let paiTxt = 'Não registrado', avoTxt = 'Não registrado';
            if (u.pai) { const uPai = shizukiUser(u.pai); paiTxt = '@' + u.pai.split('@')[0]; if (uPai && uPai.pai) avoTxt = '@' + uPai.pai.split('@')[0]; }
            const conjugeTxt = parceiro ? ('@' + parceiro.split('@')[0]) : 'Ninguém';
            let filhosTxt = 'Nenhum';
            if (u.filhos && u.filhos.length > 0) { filhosTxt = u.filhos.length + '\n'; u.filhos.forEach(f => { filhosTxt += '│    └ @' + f.split('@')[0] + '\n'; }); filhosTxt = filhosTxt.trim(); }
            await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🌳 ÁRVORE GENEALÓGICA 🌳\n╰─────────────────────╯\n\n👑 Cidadão: @' + sender.split('@')[0] + '\n📅 Status: ' + statusAmor + '\n\n╭───〔 🧬 ASCENDENTES 〕───╮\n│\n│ 👴 Avô: ' + avoTxt + '\n│ 👨 Pai: ' + paiTxt + '\n│\n╰───────────────────╯\n\n╭───〔 💍 CÔNJUGE 〕───╮\n│\n│ 💜 ' + conjugeTxt + '\n│\n╰───────────────────╯\n\n╭───〔 🌱 DESCENDENTES 〕───╮\n│\n│ 👦 Filhos: ' + filhosTxt + '\n│ 👶 Netos: Nenhum\n│\n╰───────────────────╯\n\n╭━━━━━━━━━━━━━━━━━━╮\n┃ 🌸 SHIZUKI BOT - MD 🌸 ┃\n╰━━━━━━━━━━━━━━━━━━╯', mentions: [sender, ...(parceiro ? [parceiro] : []), ...(u.pai ? [u.pai] : []), ...(u.filhos || [])] }, { quoted: msg });
          }
          return
    }
  }
};
