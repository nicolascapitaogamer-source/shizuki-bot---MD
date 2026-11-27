// Gerado de index.js (case 'menudono', linha 5818)
export default {
  nomes: ["menudono","dono"],
  async executar(__x) {
    const { getPrefixo, fs, MENU_IMAGE_PATH, isDono, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const prefixoAtual = getPrefixo(from);
            const menuDono =
              '╭─────────────────────╮\n\n' +
              '👑 Oii @' + sender.split('@')[0] + '! Aqui é o *Menu Dono* 🌸\n' +
              '✨ Escolha o que deseja gerenciar (๑>ᴗ<๑)\n\n' +
              '╭─〔 👑 *MENU DONO* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 🪷 *CONFIGURAÇÕES DO BOT*\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'nomebot [nome]\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'fotomenu\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'audiomenu\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'rmaudio\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'blockcmdg [comando]\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'unblockcmdg [comando]\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'addpokecoin [qtd] @pessoa\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'channel [link]\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'addcomandovip <comando>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'rmchannel\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'api [chave]\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'nuke\n' +
              '┃\n' +
              '┃ 🎋 *CONTROLE DO BOT*\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'botoff\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'boton\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'reiniciar\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'uptadestart\n' +
              '┃\n' +
              '┃ 🎴 *ALUGUEL*\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'modoaluguel\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'rgaluguel [dias]\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'rmaluguel\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'alugueis\n' +
              '┃\n' +
              '┃ 💎 *VIP*\n' +
              '┃ 🔮◗ ' + prefixoAtual + 'darvip @pessoa [dias]\n' +
              '┃ 🔮◗ ' + prefixoAtual + 'servip\n' +
              '┃ 🔮◗ ' + prefixoAtual + 'rmvip @pessoa\n' +
              '┃ 🔮◗ ' + prefixoAtual + 'listarvip\n' +
              '┃\n' +
              '┃ 🏛️ *PRESIDÊNCIA*\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'propostas\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'aprovarproposta <id>\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'rejeitarproposta <id>\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'verproposta <id>\n' +
              '┃\n' +
              '┃ 🗳️ *ELEIÇÕES*\n' +
              '┃ 🎐◗ ' + prefixoAtual + 'iniciareleicao\n' +
              '┃ 🎐◗ ' + prefixoAtual + 'encerrareleicao\n' +
              '┃ 🎐◗ ' + prefixoAtual + 'cancelareleicao\n' +
              '┃ 🎐◗ ' + prefixoAtual + 'fasedaeleicao\n' +
              '┃ 🎐◗ ' + prefixoAtual + 'pularfase\n' +
              '┃\n' +
              '┃ 🎎 *MANDATOS*\n' +
              '┃ 🪷◗ ' + prefixoAtual + 'removerpresidente @pessoa\n' +
              '┃ 🪷◗ ' + prefixoAtual + 'darmandato @pessoa\n' +
              '┃ 🪷◗ ' + prefixoAtual + 'estendermandato <dias>\n' +
              '┃ 🪷◗ ' + prefixoAtual + 'presidentes\n' +
              '┃\n' +
              '┃ 📜 *LEIS*\n' +
              '┃ 📜◗ ' + prefixoAtual + 'leispendentes\n' +
              '┃ 📜◗ ' + prefixoAtual + 'aprovarlei <id>\n' +
              '┃ 📜◗ ' + prefixoAtual + 'rejeitarlei <id>\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuDono, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuDono }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuDono }, { quoted: msg });
            }
          }
          return
    }
  }
};
