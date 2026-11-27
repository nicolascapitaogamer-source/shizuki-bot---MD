// Gerado de index.js (case 'totalcmd', linha 14455)
export default {
  nomes: ["totalcmd"],
  async executar(__x) {
    const { fs, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
          const _src = fs.readFileSync('./index.js', 'utf8');
          const _set = new Set();
          for (const m of _src.matchAll(/case\s+['"]([^'"]+)['"]\s*:/g)) _set.add(m[1]);
          await sock.sendMessage(from, { text: '📊 *TOTAL DE COMANDOS*\n\n🤖 O bot tem *' + _set.size + '* comandos (contando apelidos).' }, { quoted: msg });
          return
        }
    }
  }
};
