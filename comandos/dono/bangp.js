// Gerado de index.js (case 'bangp', linha 14463)
export default {
  nomes: ["bangp","unbangp"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, getPrefixo, salvarJSON, isGroup, sock, from, msg, sender, isDono, command } = Object.assign({}, __x.utils, __x);
    {
{
          if (!isGroup) { await sock.sendMessage(from, { text: '❌ Use este comando dentro de um grupo.' }, { quoted: msg }); return }
          let _admBg = false;
          try {
            const _gmBg = await globalThis.__getGroupMetadata(from);
            _admBg = !!getAdminFlag(_gmBg.participants, sender, msg.key.participantAlt);
          } catch (e) {}
          if (!isDono && !_admBg) { await sock.sendMessage(from, { text: '🚫 Apenas admins podem usar este comando!' }, { quoted: msg }); return }
          const _dbBg = carregarJSON('./bangp.json') || {};
          if (command === 'bangp') {
            if (_dbBg[from] === true) { await sock.sendMessage(from, { text: 'ℹ️ O bot já está parado neste grupo. Para voltar use: ' + getPrefixo(from) + 'unbangp' }, { quoted: msg }); return }
            _dbBg[from] = true;
            salvarJSON('./bangp.json', _dbBg);
            await sock.sendMessage(from, { text: '🔇 *BOT PARADO NESTE GRUPO!*\n\nPara voltar use: ' + getPrefixo(from) + 'unbangp' }, { quoted: msg });
          } else {
            if (_dbBg[from] !== true) { await sock.sendMessage(from, { text: 'ℹ️ O bot não está parado neste grupo.' }, { quoted: msg }); return }
            delete _dbBg[from];
            salvarJSON('./bangp.json', _dbBg);
            await sock.sendMessage(from, { text: '🔊 *BOT VOLTOU A FUNCIONAR NESTE GRUPO!*' }, { quoted: msg });
          }
          return
        }
    }
  }
};
