// Gerado de index.js (case 'addcomandovip', linha 7519)
export default {
  nomes: ["addcomandovip"],
  async executar(__x) {
    const { getPrefixo, fs, carregarJSON, salvarJSON, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
          if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas dono e líder!' }, { quoted: msg }); return }
          const _nCv = String(args[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (!_nCv) { await sock.sendMessage(from, { text: 'Use: ' + getPrefixo(from) + 'addcomandovip <nome do comando>' }, { quoted: msg }); return }
          if (!fs.readFileSync('./index.js', 'utf8').includes("case '" + _nCv + "'")) { await sock.sendMessage(from, { text: '❌ Esse comando não existe.' }, { quoted: msg }); return }
          const _vipDb = carregarJSON('./vip.json') || {};
          _vipDb.cmds = _vipDb.cmds || [];
          if (_vipDb.cmds.includes(_nCv)) { await sock.sendMessage(from, { text: 'ℹ️ *' + _nCv + '* já está no menu VIP.' }, { quoted: msg }); return }
          _vipDb.cmds.push(_nCv);
          salvarJSON('./vip.json', _vipDb);
          await sock.sendMessage(from, { text: '⭐ *' + _nCv + '* foi para o menu VIP (só dono e líder).' }, { quoted: msg });
          return
        }
    }
  }
};
