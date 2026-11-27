// Gerado de index.js (case 'antipv', linha 14485)
export default {
  nomes: ["antipv"],
  async executar(__x) {
    const { carregarJSON, salvarJSON, getPrefixo, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
          if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg }); return }
          const _opAp = (args[0] || '').toLowerCase();
          const _dbAp = carregarJSON('./antipv.json') || {};
          if (_opAp === 'on') {
            _dbAp.on = true; salvarJSON('./antipv.json', _dbAp);
            await sock.sendMessage(from, { text: '🛡️ *ANTI-PV ATIVADO!*\n\nQuem não for dono e mandar mensagem no privado será bloqueado.' }, { quoted: msg });
          } else if (_opAp === 'off') {
            _dbAp.on = false; salvarJSON('./antipv.json', _dbAp);
            await sock.sendMessage(from, { text: '✅ *ANTI-PV DESATIVADO!*' }, { quoted: msg });
          } else {
            await sock.sendMessage(from, { text: 'ℹ️ Anti-PV: *' + (_dbAp.on ? 'ligado' : 'desligado') + '*\n\nUse: ' + getPrefixo(from) + 'antipv on/off' }, { quoted: msg });
          }
          return
        }
    }
  }
};
