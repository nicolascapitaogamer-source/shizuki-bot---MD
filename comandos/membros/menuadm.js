// Gerado de index.js (case 'menuadm', linha 5655)
export default {
  nomes: ["menuadm"],
  async executar(__x) {
    const { getPrefixo, fs, MENU_IMAGE_PATH, from, sender, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const prefixoAtual = getPrefixo(from);
            const menuAdm =
              '╭─────────────────────╮\n\n' +
              '🪷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ Aqui está o *Menu ADM* pra você (๑>ᴗ<๑)\n\n' +
              '╭─〔 ⛩️ *MENU DE COMANDOS* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ ⚔️ *MODERAÇÃO*\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'mute @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'limpar\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'unmute @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'adv @pessoa <motivo>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'rmadv @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'limparadv @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'listaadv\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'intervalo <tempo>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'historico @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'ban @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'promover @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'rebaixar @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'promoverall\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'rebaixarall\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'apagar <qtd>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'blacklist @pessoa\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'totag <texto>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'marcartodos <texto>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'revelar\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'addlistanegra <numero>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'tirardalista <numero>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'listanegra\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'multiprefixo <novo>\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'bangp\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'unbangp\n' +
              '┃\n' +
              '┃ 🎴 *CONFIGURAR*\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'nomegp <nome>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'descgp <texto>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'gpinfo\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'linkgp\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'novolink\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'revogarlink\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'regras <texto>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'verregras\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'boasvindas\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'legendabv <texto>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'fundosaiu\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'legendasaiu <texto>\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'fotoboasvindas\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'apresentar @pessoa\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'add @pessoa\n' +
              '┃ 🌸◗ ' + prefixoAtual + 'soadm\n' +
              '┃\n' +
              '┃ 👥 *MEMBROS*\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'topmembros\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'membrosinativos\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'listarmembros\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'admins\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'lideres\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'sorteio <premio>\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'fakechat\n' +
              '┃ 🏮◗ ' + prefixoAtual + 'frase <texto>\n' +
              '┃\n' +
              '┃ 🔥 *ATIVAÇÕES*\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antibots [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antilink [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antipv [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antiflood [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antistatus [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antipromocao [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antifake [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antiporn [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antipalavrao [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antivideo [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antiimagem [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antisticker [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'antiemoji [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'autoresposta [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'mododivertido [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'modonatal [on/off]\n' +
              '┃ 🎋◗ ' + prefixoAtual + 'modohalloween [on/off]\n' +
              '┃\n' +
              '┃ ⏰ *AGENDAMENTOS*\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'rgaviso [hh:mm] [texto]\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'opengp [hh:mm]\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'closegp [hh:mm]\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'rmopengp\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'gp a / ' + prefixoAtual + 'gp f\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'modoparceria [on/off]\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'addparceria @pessoa [qtd]\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'rmparceria @pessoa\n' +
              '┃ 🕰️◗ ' + prefixoAtual + 'listarparcerias\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuAdm, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuAdm, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuAdm, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
