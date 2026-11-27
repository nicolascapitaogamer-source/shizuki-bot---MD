// Gerado de index.js (case 'menu', linha 5469)
export default {
  nomes: ["menu","help"],
  async executar(__x) {
    const { obterSaudacaoEHora, eVIP, getPrefixo, fs, MENU_AUDIO_PATH, MENU_IMAGE_PATH, sender, from, config, CONF, pushName, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const { saudacao, horaFormatada } = obterSaudacaoEHora();
            const isVipUser = (typeof eVIP === 'function' && eVIP(sender)) ? 'Sim 💎' : 'Não';
            const prefixoAtual = getPrefixo(from);
            
            const menuPrincipal =
              '╭─────────────────────╮\n\n' +
              '🪷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ Como posso te ajudar hoje? (๑>ᴗ<๑)\n\n' +
              '╭─〔 ⛩️ *MENU PRINCIPAL* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 🪷 *SEU PERFIL*\n' +
              '┃ 🌸◗ Bot: ' + config.nomeBot + '\n' +
              '┃ 🌸◗ Dono: ' + CONF.nomeDono + '\n' +
              '┃ 🌸◗ Usuário: ' + pushName + '\n' +
              '┃ 🌸◗ VIP: ' + isVipUser + '\n' +
              '┃ 🌸◗ Hora: ' + horaFormatada + '\n' +
              '┃\n' +
              '┃ 🏮 *MENUS*\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menudono\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menuadm\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menushizuki\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menubrincadeiras\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menupokemon\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menuvip\n' +
              '┃ 🎴◗ ' + prefixoAtual + 'menubaixar\n' +
              '┃\n' +
              '┃ 🎋 *EXTRAS*\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'ping\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'criador\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'prefixo\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'comprarbot\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'afk\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'nick\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'ia\n' +
              '┃ 🍃◗ ' + prefixoAtual + 'totalcmd\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_AUDIO_PATH)) {
              try {
                await sock.sendMessage(from, {
                  audio: fs.readFileSync(MENU_AUDIO_PATH),
                  mimetype: 'audio/mp4',
                  ptt: true,
                  mentions: [sender]
                }, { quoted: msg });
              } catch (e) {}
            }

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, {
                  image: fs.readFileSync(MENU_IMAGE_PATH),
                  caption: menuPrincipal,
                  mentions: [sender]
                });
              } catch (e) {
                await sock.sendMessage(from, { text: menuPrincipal, mentions: [sender] });
              }
            } else {
              await sock.sendMessage(from, { text: menuPrincipal, mentions: [sender] });
            }
          }
          return
    }
  }
};
