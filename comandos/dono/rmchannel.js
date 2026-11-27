// Gerado de index.js (case 'rmchannel', linha 12453)
export default {
  nomes: ["rmchannel","rmcanal"],
  async executar(__x) {
    const { salvarConfig, isDono, sock, from, msg, config } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem remover o canal!' }, { quoted: msg });
              return
            }
            if (!config.canal || !config.canal.id) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum canal está configurado no bot.' }, { quoted: msg });
              return
            }
            const nomeRm = config.canal.nome || 'Canal';
            config.canal = null;
            salvarConfig(config);
            await sock.sendMessage(from, { text: `🗑️ *CANAL REMOVIDO!*\n\nO canal *${nomeRm}* foi desvinculado do bot.\nPara colocar outro use: !channel [link]` }, { quoted: msg });
          }
          return
    }
  }
};
