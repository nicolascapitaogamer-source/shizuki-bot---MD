import fs from 'fs';

export async function enviarMenuPrincipal(sock, msg, from, sender, pushName, config, obterSaudacaoEHora, eVIP, MENU_AUDIO_PATH, MENU_IMAGE_PATH) {
    const { saudacao, horaFormatada } = obterSaudacaoEHora();
    // Lê o prefixo do grupo direto do JSON
    let p = '!';
    try {
      const dbPref = JSON.parse(fs.readFileSync('./prefixo.json', 'utf8'));
      if (dbPref.grupos && dbPref.grupos[from] && dbPref.grupos[from].ativo) {
        p = dbPref.grupos[from].prefixo || dbPref.global || '!';
      } else {
        p = dbPref.global || '!';
      }
    } catch (e) {}
    const isVipUser = (typeof eVIP === 'function' && eVIP(sender)) ? 'Sim 💎' : 'Não';
    
    // Lê o prefixo do grupo (ou global) na hora de montar o menu
    
    const menuPrincipal =
      '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n' +
      '    💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 💜\n' +
      '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n\n' +
      '💜 Oii @' + sender.split('@')[0] + '! ' + saudacao + '~ (◕‿◕)\n\n' +
      '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
      '   🌸 𝐒𝐄𝐔 𝐏𝐄𝐑𝐅𝐈𝐋 🌸\n' +
      '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
      '   ♡ Número: ' + config.numeroDono + '\n' +
      '   ♡ Bot: ' + config.nomeBot + '\n' +
      '   ♡ Dono: nick dev\n' +
      '   ♡ Usuário: ' + pushName + '\n' +
      '   ♡ VIP: ' + isVipUser + '\n' +
      '   ♡ Hora: ' + horaFormatada + '\n\n' +
      '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
      '   💜 𝐌𝐄𝐍𝐔𝐒 💜\n' +
      '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
      `   ♡ ${p}menudono\n` +
      `   ♡ ${p}menuadm\n` +
      `   ♡ ${p}menushizuki\n` +
      `   ♡ ${p}menubrincadeiras\n` +
      `   ♡ ${p}menupokemon\n` +
      `   ♡ ${p}menuvip\n` +
      `   ♡ ${p}menubaixar\n\n` +
      '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
      '   🌸 𝐄𝐗𝐓𝐑𝐀𝐒 🌸\n' +
      '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
      `   ♡ ${p}ping\n` +
      `   ♡ ${p}criador\n` +
      `   ♡ ${p}prefixo\n` +
      `   ♡ ${p}comprarbot\n` +
      `   ♡ ${p}afk\n` +
      `   ♡ ${p}nick\n` +
      `   ♡ ${p}ia\n` +
      `   ♡ ${p}totalcmd\n` +
      '💜 Feito com carinho por nick dev 💜';

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
