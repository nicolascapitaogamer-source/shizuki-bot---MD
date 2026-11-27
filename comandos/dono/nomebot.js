// Gerado de index.js (case 'nomebot', linha 5898)
export default {
  nomes: ["nomebot"],
  async executar(__x) {
    const { salvarConfig, isDono, sock, from, msg, args, config } = Object.assign({}, __x.utils, __x);
    {
if (!isDono) {
            await sock.sendMessage(from, { text: `🚫 Apenas o dono pode alterar o nome do bot!` }, { quoted: msg });
            return
          }
          const novoNome = args.join(' ');
          if (!novoNome) {
            await sock.sendMessage(from, { text: '⚠️ Por favor informe o novo nome! Ex: `!nomebot Shizuki Bot - MD`' }, { quoted: msg });
            return
          }
          config.nomeBot = novoNome;
          salvarConfig(config);
          await sock.sendMessage(from, { text: `✅ Nome do bot atualizado para: *${novoNome}*` }, { quoted: msg });
          return
    }
  }
};
