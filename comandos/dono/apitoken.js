// Gerado de index.js (case 'apitoken', linha 14893)
export default {
  nomes: ["apitoken"],
  async executar(__x) {
    const { carregarConfig, salvarConfig, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode configurar a API!' }, { quoted: msg }); return }
            const token = args.join(' ').trim();
            if (!token) {
              const cfgT = carregarConfig();
              const atual = cfgT.apiKey ? cfgT.apiKey.slice(0, 8) + '...' : '_não configurada_';
              await sock.sendMessage(from, { text: '╭━━━〔 🔑 𝐀𝐏𝐈 𝐓𝐎𝐊𝐄𝐍 🔑 〕━━━╮\n┃\n┃ 📝 Use: *!apitoken SUA_CHAVE*\n┃\n┃ 🔒 Token atual: *' + atual + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            const cfgN = carregarConfig();
            cfgN.apiKey = token;
            salvarConfig(cfgN);
            await sock.sendMessage(from, { text: '╭━━━〔 ✅ 𝐀𝐏𝐈 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 🔑 Token salvo com sucesso!\n┃\n┃ 🧞 Akinator pronto pra usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
          }
          return
    }
  }
};
