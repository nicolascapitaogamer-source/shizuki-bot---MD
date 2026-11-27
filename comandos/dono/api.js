// Gerado de index.js (case 'api', linha 8873)
export default {
  nomes: ["api"],
  async executar(__x) {
    const { carregarConfig, salvarConfig, isDonoReal, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode configurar a API!' }, { quoted: msg });
              return
            }
            const chave = args.join(' ').trim();
            if (!chave) {
              const cfgAtual = carregarConfig();
              const atual = cfgAtual.apiKey ? cfgAtual.apiKey.slice(0, 8) + '...' : '_não configurada_';
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔑 𝐀𝐏𝐈 〕━━━╮\n┃\n` +
                      `┃ 💜 Configuração da API\n┃\n` +
                      `┃ 📝 Use: *!api SUA_CHAVE_AQUI*\n┃\n` +
                      `┃ 🔒 Chave atual: *${atual}*\n┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }
            const cfgNovo = carregarConfig();
            cfgNovo.apiKey = chave;
            salvarConfig(cfgNovo);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✅ 𝐀𝐏𝐈 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐀! 〕━━━╮\n┃\n` +
                    `┃ 🔑 Chave salva com sucesso!\n┃\n` +
                    `┃ 🎵 O comando *!play* já tá pronto!\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
